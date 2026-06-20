const db = require('../../config/db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM plan ORDER BY id_plan ASC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin/planes listar]', err);
    return res.status(500).json({ error: 'Error al obtener planes' });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const { precio_mensual, precio_anual, max_sucursales, max_usuarios, max_productos, modulos } = req.body ?? {};

  try {
    const [existing] = await db.promise().query(
      'SELECT id_plan FROM plan WHERE id_plan = ?', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });

    await db.promise().query(
      `UPDATE plan SET precio_mensual=?, precio_anual=?, max_sucursales=?,
       max_usuarios=?, max_productos=?, modulos=? WHERE id_plan=?`,
      [
        parseFloat(precio_mensual) || 0,
        parseFloat(precio_anual)   || 0,
        parseInt(max_sucursales)   || 1,
        parseInt(max_usuarios)     || 1,
        max_productos != null ? parseInt(max_productos) : null,
        JSON.stringify(modulos || []),
        id,
      ]
    );
    return res.json({ mensaje: 'Plan actualizado' });
  } catch (err) {
    console.error('[admin/planes editar]', err);
    return res.status(500).json({ error: 'Error al actualizar plan' });
  }
};

module.exports = { listar, editar };
