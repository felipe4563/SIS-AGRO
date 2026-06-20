const db = require('../../config/db');
const { sincronizarPermisosRoles } = require('../../utils/permisoSync');

const listar = async (req, res) => {
  const { id_empresa, estado } = req.query;
  const where  = [];
  const params = [];

  if (id_empresa) { where.push('s.id_empresa = ?'); params.push(id_empresa); }
  if (estado)     { where.push('s.estado = ?');      params.push(estado); }

  const sql = `
    SELECT s.*, e.nombre AS empresa_nombre, p.nombre AS plan_nombre
    FROM suscripcion s
    JOIN empresa e ON e.id_empresa = s.id_empresa
    JOIN plan    p ON p.id_plan    = s.id_plan
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY s.creado_en DESC
  `;

  try {
    const [rows] = await db.promise().query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('[admin/suscripciones listar]', err);
    return res.status(500).json({ error: 'Error al obtener suscripciones' });
  }
};

const crear = async (req, res) => {
  const { id_empresa, id_plan, ciclo, fecha_inicio } = req.body ?? {};
  if (!id_empresa || !id_plan || !ciclo || !fecha_inicio) {
    return res.status(400).json({ error: 'id_empresa, id_plan, ciclo y fecha_inicio son requeridos' });
  }
  if (!['MENSUAL','ANUAL'].includes(ciclo)) {
    return res.status(400).json({ error: 'ciclo debe ser MENSUAL o ANUAL' });
  }

  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();

    // Calcular fecha_fin
    const intervalo = ciclo === 'ANUAL' ? 'INTERVAL 1 YEAR' : 'INTERVAL 1 MONTH';
    const [[{ fecha_fin }]] = await conn.query(
      `SELECT DATE_ADD(?, ${intervalo}) AS fecha_fin`, [fecha_inicio]
    );

    // Cancelar suscripciones activas anteriores
    await conn.query(
      `UPDATE suscripcion SET estado = 'CANCELADA'
       WHERE id_empresa = ? AND estado IN ('ACTIVA','PRUEBA')`,
      [id_empresa]
    );

    const [result] = await conn.query(
      `INSERT INTO suscripcion (id_empresa, id_plan, ciclo, estado, fecha_inicio, fecha_fin)
       VALUES (?, ?, ?, 'ACTIVA', ?, ?)`,
      [id_empresa, id_plan, ciclo, fecha_inicio, fecha_fin]
    );

    // Obtener módulos del nuevo plan y sincronizar permisos de roles existentes
    const [[planRow]] = await conn.query(
      'SELECT modulos FROM plan WHERE id_plan = ?', [id_plan]
    );
    if (planRow) {
      const modulos = JSON.parse(planRow.modulos);
      await sincronizarPermisosRoles(id_empresa, modulos, conn);
    }

    await conn.commit();
    conn.release();

    return res.status(201).json({ mensaje: 'Suscripción creada', id_suscripcion: result.insertId, fecha_fin });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch { /* silencioso */ }
      conn.release();
    }
    console.error('[admin/suscripciones crear]', err);
    return res.status(500).json({ error: 'Error al crear suscripción' });
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { fecha_fin, estado } = req.body ?? {};

  try {
    const [existing] = await db.promise().query(
      'SELECT id_suscripcion FROM suscripcion WHERE id_suscripcion = ?', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Suscripción no encontrada' });

    const sets  = [];
    const vals  = [];
    if (fecha_fin) { sets.push('fecha_fin = ?'); vals.push(fecha_fin); }
    if (estado)    {
      if (!['PRUEBA','ACTIVA','VENCIDA','CANCELADA'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      sets.push('estado = ?'); vals.push(estado);
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

    vals.push(id);
    await db.promise().query(`UPDATE suscripcion SET ${sets.join(', ')} WHERE id_suscripcion = ?`, vals);
    return res.json({ mensaje: 'Suscripción actualizada' });
  } catch (err) {
    console.error('[admin/suscripciones actualizar]', err);
    return res.status(500).json({ error: 'Error al actualizar suscripción' });
  }
};

module.exports = { listar, crear, actualizar };
