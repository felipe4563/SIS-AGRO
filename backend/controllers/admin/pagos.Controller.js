const db = require('../../config/db');

const listar = async (req, res) => {
  const { id_empresa, estado } = req.query;
  const where  = [];
  const params = [];

  if (id_empresa) { where.push('e.id_empresa = ?'); params.push(id_empresa); }
  if (estado)     { where.push('ps.estado = ?');     params.push(estado); }

  const sql = `
    SELECT ps.*, e.nombre AS empresa_nombre, p.nombre AS plan_nombre
    FROM pago_suscripcion ps
    JOIN suscripcion s ON s.id_suscripcion = ps.id_suscripcion
    JOIN empresa     e ON e.id_empresa     = s.id_empresa
    JOIN plan        p ON p.id_plan        = s.id_plan
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ps.creado_en DESC
  `;

  try {
    const [rows] = await db.promise().query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('[admin/pagos listar]', err);
    return res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

const registrar = async (req, res) => {
  const { id_suscripcion, monto, referencia, notas } = req.body ?? {};
  if (!id_suscripcion || !monto) {
    return res.status(400).json({ error: 'id_suscripcion y monto son requeridos' });
  }
  if (parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    const [susRows] = await db.promise().query(
      'SELECT id_suscripcion FROM suscripcion WHERE id_suscripcion = ?', [id_suscripcion]
    );
    if (susRows.length === 0) return res.status(404).json({ error: 'Suscripción no encontrada' });

    const [result] = await db.promise().query(
      `INSERT INTO pago_suscripcion (id_suscripcion, monto, referencia, estado, fecha_pago, notas)
       VALUES (?, ?, ?, 'PAGADO', NOW(), ?)`,
      [id_suscripcion, parseFloat(monto), referencia || null, notas || null]
    );

    return res.status(201).json({ mensaje: 'Pago registrado', id_pago: result.insertId });
  } catch (err) {
    console.error('[admin/pagos registrar]', err);
    return res.status(500).json({ error: 'Error al registrar pago' });
  }
};

module.exports = { listar, registrar };
