const db     = require('../../config/db');
const bcrypt = require('bcrypt');

const listar = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT e.*,
              s.id_suscripcion, s.estado AS sus_estado, s.fecha_fin,
              p.nombre AS plan_nombre
       FROM empresa e
       LEFT JOIN suscripcion s ON s.id_empresa = e.id_empresa
         AND s.estado IN ('ACTIVA','PRUEBA')
         AND s.fecha_fin = (
           SELECT MAX(s2.fecha_fin) FROM suscripcion s2
           WHERE s2.id_empresa = e.id_empresa AND s2.estado IN ('ACTIVA','PRUEBA')
         )
       LEFT JOIN plan p ON p.id_plan = s.id_plan
       ORDER BY e.creado_en DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin/empresas listar]', err);
    return res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

// Módulos del plan → módulos de la tabla permiso
const MODULO_MAP = {
  ventas:       ['ventas'],
  caja:         ['caja'],
  clientes:     ['clientes'],
  inventario:   ['almacen'],
  proveedores:  ['proveedores'],
  compras:      ['compras'],
  traslados:    ['traslados'],
  libro_caja:   ['movimientos', 'categorias_movimiento'],
  roles:        ['roles'],
  // qr y soporte_prioritario no tienen módulo de permisos propio
};

// Permisos de reportes separados en básicos y avanzados
const REPORTES_BASICOS_IDS  = [102,103,104,105,106,107,108,109,110,113,114,115,116,119];
const REPORTES_AVANZADOS_IDS = [111,112,117,118];

// Módulos siempre disponibles para cualquier admin (gestión interna)
const CORE_MODULOS = ['usuarios','sucursales','clasificaciones','marcas','unidades','conversiones','productos','configuracion'];

const crear = async (req, res) => {
  const { nombre, nit, direccion, ciudad, telefono, correo,
          nombre_admin, apellido_admin, ci_admin, correo_admin, contrasena_admin,
          id_plan } = req.body ?? {};

  if (!nombre)           return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });
  if (!nombre_admin)     return res.status(400).json({ error: 'El nombre del administrador es obligatorio' });
  if (!apellido_admin)   return res.status(400).json({ error: 'El apellido del administrador es obligatorio' });
  if (!ci_admin)         return res.status(400).json({ error: 'El CI del administrador es obligatorio' });
  if (!correo_admin)     return res.status(400).json({ error: 'El correo del administrador es obligatorio' });
  if (!contrasena_admin) return res.status(400).json({ error: 'La contraseña del administrador es obligatoria' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    // 1. Empresa
    const [resEmpresa] = await conn.query(
      'INSERT INTO empresa (nombre, nit, direccion, ciudad, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre.trim(), nit || null, direccion || null, ciudad || null, telefono || null, correo || null]
    );
    const id_empresa = resEmpresa.insertId;

    // 2. Suscripción (siempre inicia en PRUEBA)
    const planId = Number(id_plan) || 1;
    await conn.query(
      `INSERT INTO suscripcion (id_empresa, id_plan, ciclo, estado, fecha_inicio, fecha_fin)
       VALUES (?, ?, 'MENSUAL', 'PRUEBA', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY))`,
      [id_empresa, planId]
    );

    // 3. Obtener módulos del plan
    const [[plan]] = await conn.query('SELECT modulos FROM plan WHERE id_plan = ?', [planId]);
    const modulos = JSON.parse(plan.modulos);

    // 4. Calcular módulos de permiso a incluir
    const permisosModulos = new Set(CORE_MODULOS);
    for (const mod of modulos) {
      const mapped = MODULO_MAP[mod];
      if (mapped) mapped.forEach(m => permisosModulos.add(m));
    }

    // 5. Consultar IDs de permisos por módulo
    const modulosList = [...permisosModulos];
    const placeholders = modulosList.map(() => '?').join(',');
    const [rows] = await conn.query(
      `SELECT id_permiso FROM permiso WHERE modulo IN (${placeholders})`,
      modulosList
    );
    const permisosIds = new Set(rows.map(r => r.id_permiso));

    // 6. Agregar permisos de reportes según plan
    if (modulos.includes('reportes_basicos'))   REPORTES_BASICOS_IDS.forEach(id => permisosIds.add(id));
    if (modulos.includes('reportes_avanzados')) REPORTES_AVANZADOS_IDS.forEach(id => permisosIds.add(id));
    // creditos siempre si tiene ventas o compras
    if (modulos.includes('ventas') || modulos.includes('compras')) {
      permisosIds.add(129); // creditos.ver
      permisosIds.add(130); // creditos.abonar
      permisosIds.add(131); // creditos.reporte
    }

    // 7. Crear rol Administrador para la empresa
    const [resRol] = await conn.query(
      'INSERT INTO rol (id_empresa, nombre) VALUES (?, ?)',
      [id_empresa, 'Administrador']
    );
    const id_rol = resRol.insertId;

    // 8. Asignar permisos al rol
    if (permisosIds.size > 0) {
      const values = [...permisosIds].map(idP => [id_rol, idP]);
      await conn.query('INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?', [values]);
    }

    // 9. Crear usuario administrador con el rol recién creado
    const hash = await bcrypt.hash(String(contrasena_admin), 10);
    await conn.query(
      `INSERT INTO usuario (id_empresa, id_rol, id_sucursal, ci, nombre, apellido, correo, contrasena, activo)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 1)`,
      [id_empresa, id_rol, ci_admin.trim(), nombre_admin.trim(), apellido_admin.trim(), correo_admin.trim(), hash]
    );

    await conn.commit();
    return res.status(201).json({ mensaje: 'Empresa creada con suscripción de prueba y administrador inicial', id_empresa });
  } catch (err) {
    await conn.rollback();
    console.error('[admin/empresas crear]', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El correo o CI del administrador ya está en uso' });
    return res.status(500).json({ error: 'Error al crear empresa' });
  } finally {
    conn.release();
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, direccion, ciudad, telefono, correo } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [existing] = await db.promise().query(
      'SELECT id_empresa FROM empresa WHERE id_empresa = ?', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });

    await db.promise().query(
      'UPDATE empresa SET nombre=?, nit=?, direccion=?, ciudad=?, telefono=?, correo=? WHERE id_empresa=?',
      [nombre.trim(), nit || null, direccion || null, ciudad || null, telefono || null, correo || null, id]
    );
    return res.json({ mensaje: 'Empresa actualizada' });
  } catch (err) {
    console.error('[admin/empresas editar]', err);
    return res.status(500).json({ error: 'Error al actualizar empresa' });
  }
};

const toggle = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query(
      'SELECT activo FROM empresa WHERE id_empresa = ?', [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    const nuevo = rows[0].activo ? 0 : 1;
    await db.promise().query('UPDATE empresa SET activo = ? WHERE id_empresa = ?', [nuevo, id]);
    return res.json({ mensaje: `Empresa ${nuevo ? 'activada' : 'desactivada'}`, activo: nuevo });
  } catch (err) {
    console.error('[admin/empresas toggle]', err);
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

module.exports = { listar, crear, editar, toggle };
