const db = require('../../config/db');

const getDashboard = async (req, res) => {
  try {
    const [[{ empresas_total }]] = await db.promise().query(
      'SELECT COUNT(*) AS empresas_total FROM empresa'
    );
    const [[{ empresas_activas }]] = await db.promise().query(
      'SELECT COUNT(*) AS empresas_activas FROM empresa WHERE activo = 1'
    );
    const [[{ suscripciones_activas }]] = await db.promise().query(
      "SELECT COUNT(*) AS suscripciones_activas FROM suscripcion WHERE estado IN ('ACTIVA','PRUEBA')"
    );
    const [[{ por_vencer_7dias }]] = await db.promise().query(
      `SELECT COUNT(*) AS por_vencer_7dias FROM suscripcion
       WHERE estado = 'ACTIVA' AND fecha_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );
    const [[{ ingresos_mes }]] = await db.promise().query(
      `SELECT COALESCE(SUM(monto), 0) AS ingresos_mes FROM pago_suscripcion
       WHERE estado = 'PAGADO' AND MONTH(fecha_pago) = MONTH(NOW()) AND YEAR(fecha_pago) = YEAR(NOW())`
    );
    const [distribucion_planes] = await db.promise().query(
      `SELECT p.nombre AS plan, COUNT(s.id_suscripcion) AS cantidad
       FROM suscripcion s
       JOIN plan p ON p.id_plan = s.id_plan
       WHERE s.estado IN ('ACTIVA','PRUEBA')
       GROUP BY p.id_plan, p.nombre
       ORDER BY p.id_plan`
    );

    return res.json({
      empresas_total,
      empresas_activas,
      suscripciones_activas,
      por_vencer_7dias,
      ingresos_mes: parseFloat(ingresos_mes).toFixed(2),
      distribucion_planes,
    });
  } catch (err) {
    console.error('[admin/dashboard]', err);
    return res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

module.exports = { getDashboard };
