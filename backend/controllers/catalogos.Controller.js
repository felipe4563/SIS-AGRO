const db = require('../config/db');

// ==========================================
// CLASIFICACIONES
// ==========================================
const listarClasificaciones = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT id_clasificacion, nombre, descripcion, activo FROM clasificacion_producto WHERE id_empresa = ? ORDER BY nombre ASC',
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener clasificaciones' });
  }
};

const crearClasificacion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, descripcion } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [result] = await db.promise().query(
      'INSERT INTO clasificacion_producto (id_empresa, nombre, descripcion) VALUES (?, ?, ?)',
      [id_empresa, nombre.trim(), descripcion ? descripcion.trim() : null]
    );
    return res.status(201).json({ mensaje: 'Clasificación creada', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El nombre ya existe' });
    return res.status(500).json({ error: 'Error al crear' });
  }
};

const editarClasificacion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, descripcion } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [existing] = await db.promise().query(
      'SELECT id_clasificacion FROM clasificacion_producto WHERE id_clasificacion = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Clasificación no encontrada' });

    await db.promise().query(
      'UPDATE clasificacion_producto SET nombre = ?, descripcion = ? WHERE id_clasificacion = ? AND id_empresa = ?',
      [nombre.trim(), descripcion ? descripcion.trim() : null, id, id_empresa]
    );
    return res.json({ mensaje: 'Clasificación actualizada' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El nombre ya existe' });
    return res.status(500).json({ error: 'Error al actualizar' });
  }
};

const eliminarClasificacion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    await db.promise().query(
      'UPDATE clasificacion_producto SET activo = 0 WHERE id_clasificacion = ? AND id_empresa = ?',
      [req.params.id, id_empresa]
    );
    return res.json({ mensaje: 'Clasificación desactivada' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar' });
  }
};

const toggleActivoClasificacion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { activo } = req.body;
  try {
    await db.promise().query(
      'UPDATE clasificacion_producto SET activo = ? WHERE id_clasificacion = ? AND id_empresa = ?',
      [activo ? 1 : 0, req.params.id, id_empresa]
    );
    return res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

// ==========================================
// MARCAS
// ==========================================
const listarMarcas = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT id_marca, nombre, pais_origen, descripcion, activo FROM marca WHERE id_empresa = ? ORDER BY nombre ASC',
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener marcas' });
  }
};

const crearMarca = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, pais_origen, descripcion } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [result] = await db.promise().query(
      'INSERT INTO marca (id_empresa, nombre, pais_origen, descripcion) VALUES (?, ?, ?, ?)',
      [id_empresa, nombre.trim(), pais_origen ? pais_origen.trim() : null, descripcion ? descripcion.trim() : null]
    );
    return res.status(201).json({ mensaje: 'Marca creada', id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear' });
  }
};

const editarMarca = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, pais_origen, descripcion } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [existing] = await db.promise().query(
      'SELECT id_marca FROM marca WHERE id_marca = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Marca no encontrada' });

    await db.promise().query(
      'UPDATE marca SET nombre = ?, pais_origen = ?, descripcion = ? WHERE id_marca = ? AND id_empresa = ?',
      [nombre.trim(), pais_origen ? pais_origen.trim() : null, descripcion ? descripcion.trim() : null, id, id_empresa]
    );
    return res.json({ mensaje: 'Marca actualizada' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar' });
  }
};

const eliminarMarca = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    await db.promise().query(
      'UPDATE marca SET activo = 0 WHERE id_marca = ? AND id_empresa = ?',
      [req.params.id, id_empresa]
    );
    return res.json({ mensaje: 'Marca desactivada' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar' });
  }
};

const toggleActivoMarca = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { activo } = req.body;
  try {
    await db.promise().query(
      'UPDATE marca SET activo = ? WHERE id_marca = ? AND id_empresa = ?',
      [activo ? 1 : 0, req.params.id, id_empresa]
    );
    return res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

// ==========================================
// UNIDADES
// ==========================================
const listarUnidades = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT id_unidad, nombre, abreviatura FROM unidad_medida WHERE id_empresa = ? ORDER BY nombre ASC',
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener unidades' });
  }
};

const crearUnidad = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, abreviatura } = req.body ?? {};
  if (!nombre || !abreviatura) return res.status(400).json({ error: 'Nombre y abreviatura obligatorios' });

  try {
    const [result] = await db.promise().query(
      'INSERT INTO unidad_medida (id_empresa, nombre, abreviatura) VALUES (?, ?, ?)',
      [id_empresa, nombre.trim(), abreviatura.trim()]
    );
    return res.status(201).json({ mensaje: 'Unidad creada', id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear' });
  }
};

const editarUnidad = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, abreviatura } = req.body ?? {};
  if (!nombre || !abreviatura) return res.status(400).json({ error: 'Nombre y abreviatura obligatorios' });

  try {
    const [existing] = await db.promise().query(
      'SELECT id_unidad FROM unidad_medida WHERE id_unidad = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Unidad no encontrada' });

    await db.promise().query(
      'UPDATE unidad_medida SET nombre = ?, abreviatura = ? WHERE id_unidad = ? AND id_empresa = ?',
      [nombre.trim(), abreviatura.trim(), id, id_empresa]
    );
    return res.json({ mensaje: 'Unidad actualizada' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar' });
  }
};

const eliminarUnidad = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [existing] = await db.promise().query(
      'SELECT id_unidad FROM unidad_medida WHERE id_unidad = ? AND id_empresa = ?',
      [req.params.id, id_empresa]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Unidad no encontrada' });

    await db.promise().query('DELETE FROM unidad_medida WHERE id_unidad = ? AND id_empresa = ?', [req.params.id, id_empresa]);
    return res.json({ mensaje: 'Unidad eliminada' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar porque está en uso' });
    }
    return res.status(500).json({ error: 'Error al eliminar' });
  }
};

// ==========================================
// CONVERSIONES DE UNIDAD
// ==========================================
const listarConversiones = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT cu.id_conversion, cu.nombre, cu.abreviatura, cu.id_unidad_base,
              um.nombre AS unidad_base_nombre, um.abreviatura AS unidad_base_abreviatura,
              cu.factor, cu.activo
       FROM conversion_unidad cu
       JOIN unidad_medida um ON cu.id_unidad_base = um.id_unidad
       WHERE cu.id_empresa = ?
       ORDER BY cu.nombre ASC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener conversiones' });
  }
};

const crearConversion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, abreviatura, id_unidad_base, factor } = req.body ?? {};
  if (!nombre || !abreviatura || !id_unidad_base || !factor)
    return res.status(400).json({ error: 'Nombre, abreviatura, unidad base y factor son obligatorios' });
  if (isNaN(factor) || Number(factor) <= 0)
    return res.status(400).json({ error: 'El factor debe ser un número mayor a 0' });

  try {
    const [result] = await db.promise().query(
      'INSERT INTO conversion_unidad (id_empresa, nombre, abreviatura, id_unidad_base, factor) VALUES (?, ?, ?, ?, ?)',
      [id_empresa, nombre.trim(), abreviatura.trim(), id_unidad_base, Number(factor)]
    );
    return res.status(201).json({ mensaje: 'Conversión creada', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El nombre ya existe para esta empresa' });
    return res.status(500).json({ error: 'Error al crear' });
  }
};

const editarConversion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, abreviatura, id_unidad_base, factor } = req.body ?? {};
  if (!nombre || !abreviatura || !id_unidad_base || !factor)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (isNaN(factor) || Number(factor) <= 0)
    return res.status(400).json({ error: 'El factor debe ser un número mayor a 0' });

  try {
    const [existing] = await db.promise().query(
      'SELECT id_conversion FROM conversion_unidad WHERE id_conversion = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Conversión no encontrada' });

    await db.promise().query(
      'UPDATE conversion_unidad SET nombre = ?, abreviatura = ?, id_unidad_base = ?, factor = ? WHERE id_conversion = ? AND id_empresa = ?',
      [nombre.trim(), abreviatura.trim(), id_unidad_base, Number(factor), id, id_empresa]
    );
    return res.json({ mensaje: 'Conversión actualizada' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El nombre ya existe' });
    return res.status(500).json({ error: 'Error al actualizar' });
  }
};

const toggleActivoConversion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { activo } = req.body;
  try {
    await db.promise().query(
      'UPDATE conversion_unidad SET activo = ? WHERE id_conversion = ? AND id_empresa = ?',
      [activo ? 1 : 0, req.params.id, id_empresa]
    );
    return res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

const eliminarConversion = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  try {
    const [existing] = await db.promise().query(
      'SELECT id_conversion FROM conversion_unidad WHERE id_conversion = ? AND id_empresa = ?',
      [id, id_empresa]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Conversión no encontrada' });

    await db.promise().query('DELETE FROM conversion_unidad WHERE id_conversion = ? AND id_empresa = ?', [id, id_empresa]);
    return res.json({ mensaje: 'Conversión eliminada' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2')
      return res.status(409).json({ error: 'No se puede eliminar: la conversión está en uso en productos o ventas' });
    return res.status(500).json({ error: 'Error al eliminar' });
  }
};

module.exports = {
  listarClasificaciones, crearClasificacion, editarClasificacion, eliminarClasificacion, toggleActivoClasificacion,
  listarMarcas, crearMarca, editarMarca, eliminarMarca, toggleActivoMarca,
  listarUnidades, crearUnidad, editarUnidad, eliminarUnidad,
  listarConversiones, crearConversion, editarConversion, toggleActivoConversion, eliminarConversion
};
