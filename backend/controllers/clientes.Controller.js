const db = require('../config/db');

const listar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT
         id_cliente, ci_nit, nombre, apellido, empresa, telefono,
         correo, direccion, tipo_cliente, activo, creado_en
       FROM cliente
       WHERE id_empresa = ?
       ORDER BY id_cliente DESC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

const obtener = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM cliente WHERE id_cliente = ? AND id_empresa = ?',
      [req.params.id, id_empresa]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

const crear = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { ci_nit, nombre, apellido, empresa, telefono, correo, direccion, tipo_cliente } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO cliente
        (id_empresa, ci_nit, nombre, apellido, empresa, telefono, correo, direccion, tipo_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_empresa,
        ci_nit || null,
        nombre.trim(),
        apellido ? apellido.trim() : null,
        empresa ? empresa.trim() : null,
        telefono || null,
        correo || null,
        direccion || null,
        tipo_cliente || 'MINORISTA'
      ]
    );

    return res.status(201).json({ mensaje: 'Cliente registrado', id_cliente: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El CI/NIT o correo ya está registrado' });
    }
    return res.status(500).json({ error: 'Error al registrar cliente' });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  const { ci_nit, nombre, apellido, empresa, telefono, correo, direccion, tipo_cliente } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    await db.promise().query(
      `UPDATE cliente SET
        ci_nit = ?, nombre = ?, apellido = ?, empresa = ?,
        telefono = ?, correo = ?, direccion = ?, tipo_cliente = ?
       WHERE id_cliente = ? AND id_empresa = ?`,
      [
        ci_nit || null,
        nombre.trim(),
        apellido ? apellido.trim() : null,
        empresa ? empresa.trim() : null,
        telefono || null,
        correo || null,
        direccion || null,
        tipo_cliente || 'MINORISTA',
        id,
        id_empresa
      ]
    );

    return res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El CI/NIT o correo ya está registrado por otro cliente' });
    }
    return res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    await db.promise().query('UPDATE cliente SET activo = 0 WHERE id_cliente = ? AND id_empresa = ?', [id, id_empresa]);
    return res.json({ mensaje: 'Cliente desactivado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al desactivar cliente' });
  }
};

const toggleActivo = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  const id_empresa = req.user.id_empresa;
  try {
    await db.promise().query(
      'UPDATE cliente SET activo = ? WHERE id_cliente = ? AND id_empresa = ?',
      [activo ? 1 : 0, id, id_empresa]
    );
    return res.json({ mensaje: 'Estado de cliente actualizado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar estado del cliente' });
  }
};

const historialCliente = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [ventas] = await db.promise().query(`
      SELECT
        v.id_venta, v.fecha_venta, v.tipo_venta, v.total,
        v.metodo_pago, v.estado, v.nro_factura,
        u.nombre AS vendedor_nombre, u.apellido AS vendedor_apellido,
        s.nombre AS sucursal_nombre,
        COUNT(dv.id_detalle_venta) AS cantidad_items
      FROM venta v
      LEFT JOIN usuario u  ON v.id_usuario  = u.id_usuario
      LEFT JOIN sucursal s ON v.id_sucursal = s.id_sucursal
      LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      WHERE v.id_cliente = ? AND s.id_empresa = ?
      GROUP BY v.id_venta
      ORDER BY v.fecha_venta DESC
      LIMIT 50
    `, [id, id_empresa]);
    return res.json(ventas);
  } catch (err) {
    console.error('[historialCliente]', err);
    return res.status(500).json({ error: 'Error al obtener historial' });
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  editar,
  eliminar,
  toggleActivo,
  historialCliente,
};
