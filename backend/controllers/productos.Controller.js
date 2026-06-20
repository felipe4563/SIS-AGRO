const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

const listarProductos = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const query = `
      SELECT
        p.id_producto, p.id_clasificacion, p.id_marca, p.id_unidad,
        p.nombre, p.descripcion, p.imagen,
        p.precio_mayor, p.precio_menor, p.descuento_mayor, p.descuento_menor,
        p.stock_minimo, p.permite_fraccion, p.activo, p.creado_en,
        c.nombre AS clasificacion_nombre,
        m.nombre AS marca_nombre,
        u.abreviatura AS unidad_abreviatura
      FROM producto p
      LEFT JOIN clasificacion_producto c ON p.id_clasificacion = c.id_clasificacion
      LEFT JOIN marca m ON p.id_marca = m.id_marca
      LEFT JOIN unidad_medida u ON p.id_unidad = u.id_unidad
      WHERE p.id_empresa = ?
      ORDER BY p.nombre ASC
    `;
    const [rows] = await db.promise().query(query, [id_empresa]);
    return res.json(rows);
  } catch (err) {
    console.error('[listarProductos]', err);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const crearProducto = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const {
    id_clasificacion, id_marca, id_unidad, nombre, descripcion,
    precio_mayor, precio_menor, descuento_mayor, descuento_menor, stock_minimo, activo
  } = req.body ?? {};

  if (!id_clasificacion || !id_marca || !id_unidad || !nombre || precio_mayor == null || precio_menor == null) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar límite del plan
    const [planRows] = await db.promise().query(
      `SELECT p.max_productos
       FROM suscripcion s JOIN plan p ON p.id_plan = s.id_plan
       WHERE s.id_empresa = ? AND s.estado IN ('ACTIVA','PRUEBA') LIMIT 1`,
      [id_empresa]
    );
    if (planRows.length > 0 && planRows[0].max_productos != null && planRows[0].max_productos > 0) {
      const [countRows] = await db.promise().query(
        'SELECT COUNT(*) AS total FROM producto WHERE id_empresa = ?',
        [id_empresa]
      );
      if (countRows[0].total >= planRows[0].max_productos) {
        return res.status(403).json({
          error: `Tu plan permite máximo ${planRows[0].max_productos} producto(s). Actualiza tu plan para agregar más.`,
        });
      }
    }

    const permite_fraccion = req.body.permite_fraccion ? 1 : 0;
    const [result] = await db.promise().query(
      `INSERT INTO producto
      (id_empresa, id_clasificacion, id_marca, id_unidad, nombre, descripcion, precio_mayor, precio_menor, descuento_mayor, descuento_menor, stock_minimo, permite_fraccion, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_empresa, id_clasificacion, id_marca, id_unidad, nombre.trim(),
        descripcion ? descripcion.trim() : null,
        precio_mayor, precio_menor,
        descuento_mayor || 0, descuento_menor || 0, stock_minimo || 0,
        permite_fraccion,
        activo === 0 ? 0 : 1
      ]
    );

    return res.status(201).json({ mensaje: 'Producto creado correctamente', id_producto: result.insertId });
  } catch (err) {
    console.error('[crearProducto]', err);
    return res.status(500).json({ error: 'Error al crear producto' });
  }
};

const editarProducto = async (req, res) => {
  const { id } = req.params;
  const idProductoNum = Number(id);
  const id_empresa = req.user.id_empresa;

  const {
    id_clasificacion, id_marca, id_unidad, nombre, descripcion,
    precio_mayor, precio_menor, descuento_mayor, descuento_menor, stock_minimo, activo
  } = req.body ?? {};

  if (!idProductoNum) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [existe] = await db.promise().query(
      'SELECT id_producto FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [idProductoNum, id_empresa]
    );
    if (existe.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const fields = [];
    const values = [];

    if (id_clasificacion !== undefined) { fields.push('id_clasificacion = ?'); values.push(id_clasificacion); }
    if (id_marca !== undefined) { fields.push('id_marca = ?'); values.push(id_marca); }
    if (id_unidad !== undefined) { fields.push('id_unidad = ?'); values.push(id_unidad); }
    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre.trim()); }
    if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion ? descripcion.trim() : null); }
    if (precio_mayor !== undefined) { fields.push('precio_mayor = ?'); values.push(precio_mayor); }
    if (precio_menor !== undefined) { fields.push('precio_menor = ?'); values.push(precio_menor); }
    if (descuento_mayor !== undefined) { fields.push('descuento_mayor = ?'); values.push(descuento_mayor); }
    if (descuento_menor !== undefined) { fields.push('descuento_menor = ?'); values.push(descuento_menor); }
    if (stock_minimo !== undefined) { fields.push('stock_minimo = ?'); values.push(stock_minimo); }
    if (req.body.permite_fraccion !== undefined) { fields.push('permite_fraccion = ?'); values.push(req.body.permite_fraccion ? 1 : 0); }
    if (activo !== undefined) { fields.push('activo = ?'); values.push(activo === 0 ? 0 : 1); }

    if (fields.length === 0) return res.status(400).json({ error: 'No hay datos para actualizar' });

    values.push(idProductoNum);
    values.push(id_empresa);
    await db.promise().query(`UPDATE producto SET ${fields.join(', ')} WHERE id_producto = ? AND id_empresa = ?`, values);

    return res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error('[editarProducto]', err);
    return res.status(500).json({ error: 'Error al editar producto' });
  }
};

const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  const idProductoNum = Number(id);
  const id_empresa = req.user.id_empresa;
  if (!idProductoNum) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [rows] = await db.promise().query(
      'SELECT id_producto FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [idProductoNum, id_empresa]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    await db.promise().query('UPDATE producto SET activo = 0 WHERE id_producto = ? AND id_empresa = ?', [idProductoNum, id_empresa]);
    return res.json({ mensaje: 'Producto desactivado correctamente' });
  } catch (err) {
    console.error('[eliminarProducto]', err);
    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

const toggleActivoProducto = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body ?? {};
  const idProductoNum = Number(id);
  const id_empresa = req.user.id_empresa;

  if (!idProductoNum) return res.status(400).json({ error: 'ID inválido' });

  const activoNum = activo === 1 || activo === '1' ? 1 : 0;

  try {
    const [rows] = await db.promise().query(
      'SELECT id_producto FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [idProductoNum, id_empresa]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    await db.promise().query('UPDATE producto SET activo = ? WHERE id_producto = ? AND id_empresa = ?', [activoNum, idProductoNum, id_empresa]);
    return res.json({ mensaje: 'Estado del producto actualizado', activo: activoNum });
  } catch (err) {
    console.error('[toggleActivoProducto]', err);
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

const subirImagenProducto = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

  try {
    const [rows] = await db.promise().query(
      'SELECT imagen FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [Number(id), id_empresa]
    );
    if (rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const imagenAnterior = rows[0].imagen;
    await db.promise().query('UPDATE producto SET imagen = ? WHERE id_producto = ? AND id_empresa = ?', [req.file.filename, Number(id), id_empresa]);

    if (imagenAnterior) {
      const rutaAnterior = path.join(__dirname, '..', 'uploads', imagenAnterior);
      if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);
    }

    return res.json({ mensaje: 'Imagen actualizada', imagen: req.file.filename });
  } catch (err) {
    console.error('[subirImagenProducto]', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Error al subir imagen' });
  }
};

const eliminarImagenProducto = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT imagen FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [Number(id), id_empresa]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const imagen = rows[0].imagen;
    await db.promise().query('UPDATE producto SET imagen = NULL WHERE id_producto = ? AND id_empresa = ?', [Number(id), id_empresa]);

    if (imagen) {
      const ruta = path.join(__dirname, '..', 'uploads', imagen);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }

    return res.json({ mensaje: 'Imagen eliminada' });
  } catch (err) {
    console.error('[eliminarImagenProducto]', err);
    return res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

const listarFraccionesProducto = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [prod] = await db.promise().query(
      'SELECT id_producto FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [Number(id), id_empresa]
    );
    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const [rows] = await db.promise().query(
      `SELECT cu.id_conversion, cu.nombre, cu.abreviatura, cu.factor,
              pf.precio_mayor, pf.precio_menor
       FROM conversion_unidad cu
       LEFT JOIN producto_fraccion pf
         ON pf.id_conversion = cu.id_conversion AND pf.id_producto = ?
       WHERE cu.id_empresa = ? AND cu.activo = 1
       ORDER BY cu.nombre ASC`,
      [Number(id), id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarFraccionesProducto]', err);
    return res.status(500).json({ error: 'Error al obtener fracciones' });
  }
};

const guardarFracciones = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  const { fracciones } = req.body ?? {};

  if (!Array.isArray(fracciones)) return res.status(400).json({ error: 'Formato inválido' });

  try {
    const [prod] = await db.promise().query(
      'SELECT id_producto FROM producto WHERE id_producto = ? AND id_empresa = ? LIMIT 1',
      [Number(id), id_empresa]
    );
    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    await db.promise().query('DELETE FROM producto_fraccion WHERE id_producto = ?', [Number(id)]);

    if (fracciones.length > 0) {
      const values = fracciones.map(f => [Number(id), f.id_conversion, f.precio_mayor || 0, f.precio_menor || 0, 1]);
      await db.promise().query(
        'INSERT INTO producto_fraccion (id_producto, id_conversion, precio_mayor, precio_menor, activo) VALUES ?',
        [values]
      );
    }

    return res.json({ mensaje: 'Fracciones guardadas correctamente' });
  } catch (err) {
    console.error('[guardarFracciones]', err);
    return res.status(500).json({ error: 'Error al guardar fracciones' });
  }
};

module.exports = {
  listarProductos,
  crearProducto,
  editarProducto,
  eliminarProducto,
  toggleActivoProducto,
  subirImagenProducto,
  eliminarImagenProducto,
  listarFraccionesProducto,
  guardarFracciones,
};
