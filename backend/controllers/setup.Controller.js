const db     = require('../config/db');
const bcrypt = require('bcrypt');
const { calcularVendedor, calcularAlmacenero } = require('../utils/permisoSync');

const getEmpresaInfo = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT nombre, nit, ciudad, direccion, telefono, correo FROM empresa WHERE id_empresa = ?',
      [req.user.id_empresa]
    );
    if (!rows.length) return res.status(404).json({ error: 'Empresa no encontrada' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[getEmpresaInfo]', err);
    return res.status(500).json({ error: 'Error al obtener datos de empresa' });
  }
};

const completarSetup = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const id_usuario = req.user.id_usuario;
  const { empresa = {}, sucursal = {}, caja = {}, nueva_contrasena } = req.body;

  const nombreEmpresa     = String(empresa.nombre_empresa || '').trim();
  const nombreSucursal    = String(sucursal.nombre        || '').trim();
  const ciudadSucursal    = String(sucursal.ciudad        || '').trim();
  const direccionSucursal = String(sucursal.direccion     || '').trim();
  const nombreCaja        = String(caja.nombre            || '').trim();

  if (!nombreEmpresa)
    return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
  if (!nombreSucursal || !ciudadSucursal || !direccionSucursal)
    return res.status(400).json({ error: 'Nombre, ciudad y dirección de la sucursal son requeridos' });
  if (!nombreCaja)
    return res.status(400).json({ error: 'El nombre de la caja es requerido' });
  if (nueva_contrasena !== undefined && nueva_contrasena !== '' && String(nueva_contrasena).length < 8)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  // Verificar que el setup no fue completado ya
  try {
    const [empRow] = await db.promise().query(
      'SELECT setup_completado FROM empresa WHERE id_empresa = ?',
      [id_empresa]
    );
    if (!empRow.length) return res.status(404).json({ error: 'Empresa no encontrada' });
    if (empRow[0].setup_completado)
      return res.status(409).json({ error: 'La configuración inicial ya fue completada' });
  } catch (err) {
    console.error('[completarSetup] check:', err);
    return res.status(500).json({ error: 'Error al verificar estado de configuración' });
  }

  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // 1. Actualizar datos de la empresa
    await connection.query(
      `UPDATE empresa SET nombre=?, nit=?, direccion=?, ciudad=?, telefono=?, correo=? WHERE id_empresa=?`,
      [
        nombreEmpresa,
        empresa.nit       || null,
        empresa.direccion || null,
        empresa.ciudad    || null,
        empresa.telefono  || null,
        empresa.correo    || null,
        id_empresa,
      ]
    );

    // 2. Crear primera sucursal
    const [sucursalResult] = await connection.query(
      `INSERT INTO sucursal (id_empresa, nombre, direccion, ciudad, telefono) VALUES (?, ?, ?, ?, ?)`,
      [id_empresa, nombreSucursal, direccionSucursal, ciudadSucursal, sucursal.telefono || null]
    );
    const id_sucursal = sucursalResult.insertId;

    // 3. Asignar el administrador a la sucursal recién creada
    await connection.query(
      'UPDATE usuario SET id_sucursal = ? WHERE id_usuario = ?',
      [id_sucursal, id_usuario]
    );

    // 4. Crear primera caja
    await connection.query(
      `INSERT INTO caja (id_sucursal, nombre) VALUES (?, ?)`,
      [id_sucursal, nombreCaja]
    );

    // 5. Obtener módulos del plan activo de la empresa
    const [[planRow]] = await connection.query(
      `SELECT p.modulos FROM suscripcion s
       JOIN plan p ON p.id_plan = s.id_plan
       WHERE s.id_empresa = ? AND s.estado IN ('ACTIVA','PRUEBA')
       ORDER BY s.fecha_fin DESC LIMIT 1`,
      [id_empresa]
    );
    const modulos = planRow ? JSON.parse(planRow.modulos) : [];

    // 6-7. Calcular permisos de VENDEDOR y ALMACENERO según plan
    const permisosVendedor   = new Set(calcularVendedor(modulos));
    const permisosAlmacenero = new Set(calcularAlmacenero(modulos));

    // 8. Verificar qué permisos existen en la BD
    const [todosPermisos] = await connection.query('SELECT id_permiso FROM permiso');
    const permisosExistentes = new Set(todosPermisos.map(p => p.id_permiso));

    // 9. Crear rol VENDEDOR
    const [rolVendedorRes] = await connection.query(
      'INSERT INTO rol (id_empresa, nombre) VALUES (?, ?)',
      [id_empresa, 'VENDEDOR']
    );
    const vendedorValidos = [...permisosVendedor].filter(id => permisosExistentes.has(id));
    if (vendedorValidos.length > 0) {
      await connection.query(
        'INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?',
        [vendedorValidos.map(id => [rolVendedorRes.insertId, id])]
      );
    }

    // 10. Crear rol ALMACENERO
    const [rolAlmaceneroRes] = await connection.query(
      'INSERT INTO rol (id_empresa, nombre) VALUES (?, ?)',
      [id_empresa, 'ALMACENERO']
    );
    const almaceneroValidos = [...permisosAlmacenero].filter(id => permisosExistentes.has(id));
    if (almaceneroValidos.length > 0) {
      await connection.query(
        'INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?',
        [almaceneroValidos.map(id => [rolAlmaceneroRes.insertId, id])]
      );
    }

    // 11. Cambiar contraseña si se proporcionó una nueva
    if (nueva_contrasena && String(nueva_contrasena).trim().length >= 8) {
      const hash = await bcrypt.hash(String(nueva_contrasena), 10);
      await connection.query(
        'UPDATE usuario SET contrasena = ? WHERE id_usuario = ?',
        [hash, id_usuario]
      );
    }

    // 12. Marcar setup como completado
    await connection.query(
      'UPDATE empresa SET setup_completado = 1 WHERE id_empresa = ?',
      [id_empresa]
    );

    await connection.commit();
    connection.release();

    return res.json({
      mensaje: 'Configuración inicial completada correctamente',
      id_sucursal,
      roles: {
        vendedor:   rolVendedorRes.insertId,
        almacenero: rolAlmaceneroRes.insertId,
      },
    });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch { /* silencioso */ }
      connection.release();
    }
    console.error('[completarSetup]', err);
    return res.status(500).json({ error: 'Error al completar la configuración inicial' });
  }
};

module.exports = { completarSetup, getEmpresaInfo };
