const db = require('../config/db');

const listar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { incluirInactivas } = req.query;
  const sql = incluirInactivas === '1'
    ? 'SELECT * FROM categoria_movimiento WHERE id_empresa = ? ORDER BY activo DESC, nombre ASC'
    : 'SELECT * FROM categoria_movimiento WHERE id_empresa = ? AND activo = 1 ORDER BY nombre ASC';
  try {
    const [rows] = await db.promise().query(sql, [id_empresa]);
    return res.json(rows);
  } catch (err) {
    console.error('[listar categoriasMovimiento]', err);
    return res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

const crear = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, tipo } = req.body;
  const nombreTxt = String(nombre ?? '').trim();
  if (!nombreTxt) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!['INGRESO', 'EGRESO', 'AMBOS'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }
  try {
    const [result] = await db.promise().query(
      'INSERT INTO categoria_movimiento (id_empresa, nombre, tipo) VALUES (?, ?, ?)',
      [id_empresa, nombreTxt, tipo]
    );
    const [rows] = await db.promise().query(
      'SELECT * FROM categoria_movimiento WHERE id_categoria = ?',
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('[crear categoriasMovimiento]', err);
    return res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  const { nombre, tipo, activo } = req.body;
  const nombreTxt = String(nombre ?? '').trim();
  if (!nombreTxt) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!['INGRESO', 'EGRESO', 'AMBOS'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }
  try {
    const [existing] = await db.promise().query(
      'SELECT id_categoria FROM categoria_movimiento WHERE id_categoria = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    await db.promise().query(
      'UPDATE categoria_movimiento SET nombre = ?, tipo = ?, activo = ? WHERE id_categoria = ? AND id_empresa = ?',
      [nombreTxt, tipo, activo !== undefined ? (activo ? 1 : 0) : 1, id, id_empresa]
    );
    const [rows] = await db.promise().query(
      'SELECT * FROM categoria_movimiento WHERE id_categoria = ?', [id]
    );
    return res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('[actualizar categoriasMovimiento]', err);
    return res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [movs] = await db.promise().query(
      'SELECT COUNT(*) AS total FROM movimiento WHERE id_categoria = ?', [id]
    );
    if (movs[0].total > 0) {
      return res.status(400).json({ error: 'No se puede desactivar: tiene movimientos asociados' });
    }
    await db.promise().query(
      'UPDATE categoria_movimiento SET activo = 0 WHERE id_categoria = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    return res.json({ mensaje: 'Categoría desactivada' });
  } catch (err) {
    console.error('[eliminar categoriasMovimiento]', err);
    return res.status(500).json({ error: 'Error al desactivar la categoría' });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
