const db = require('../config/db');

// ── Listar mezclas de la empresa ──────────────────────────────────────────
const listarMezclas = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [mezclas] = await db.promise().query(
      `SELECT m.id_mezcla, m.nombre, m.descripcion, m.activo, m.creado_en,
              m.precio_mayor, m.precio_menor,
              COUNT(mi.id_ingrediente) AS total_ingredientes
       FROM mezcla m
       LEFT JOIN mezcla_ingrediente mi ON m.id_mezcla = mi.id_mezcla
       WHERE m.id_empresa = ?
       GROUP BY m.id_mezcla
       ORDER BY m.nombre ASC`,
      [id_empresa]
    );
    return res.json(mezclas);
  } catch (err) {
    console.error('[listarMezclas]', err);
    return res.status(500).json({ error: 'Error al obtener mezclas' });
  }
};

// ── Detalle de una mezcla con sus ingredientes ────────────────────────────
const obtenerMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  try {
    const [[mezcla]] = await db.promise().query(
      `SELECT * FROM mezcla WHERE id_mezcla = ? AND id_empresa = ?`,
      [id, id_empresa]
    );
    if (!mezcla) return res.status(404).json({ error: 'Mezcla no encontrada' });

    const [ingredientes] = await db.promise().query(
      `SELECT mi.*, p.nombre AS producto_nombre, u.nombre AS unidad_nombre, u.abreviatura AS unidad_abr
       FROM mezcla_ingrediente mi
       JOIN producto p ON mi.id_producto = p.id_producto
       JOIN unidad_medida u ON mi.id_unidad = u.id_unidad
       WHERE mi.id_mezcla = ?
       ORDER BY p.nombre ASC`,
      [id]
    );
    mezcla.ingredientes = ingredientes;
    return res.json(mezcla);
  } catch (err) {
    console.error('[obtenerMezcla]', err);
    return res.status(500).json({ error: 'Error al obtener la mezcla' });
  }
};

// ── Crear mezcla con ingredientes ─────────────────────────────────────────
const crearMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, descripcion, ingredientes, precio_mayor, precio_menor } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!Array.isArray(ingredientes) || ingredientes.length === 0)
    return res.status(400).json({ error: 'Debe agregar al menos un ingrediente' });
  const precioMayorNum = parseFloat(precio_mayor) || 0;
  const precioMenorNum = parseFloat(precio_menor) || 0;
  if (precioMayorNum < 0 || precioMenorNum < 0)
    return res.status(400).json({ error: 'Los precios no pueden ser negativos' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO mezcla (id_empresa, nombre, descripcion, precio_mayor, precio_menor) VALUES (?, ?, ?, ?, ?)`,
      [id_empresa, nombre.trim(), descripcion?.trim() || null, precioMayorNum, precioMenorNum]
    );
    const id_mezcla = r.insertId;

    for (const ing of ingredientes) {
      if (!ing.id_producto || !ing.cantidad || !ing.id_unidad)
        throw new Error('Cada ingrediente requiere producto, cantidad y unidad');
      if (parseFloat(ing.cantidad) <= 0)
        throw new Error('La cantidad de cada ingrediente debe ser mayor a 0');
      await conn.query(
        `INSERT INTO mezcla_ingrediente (id_mezcla, id_producto, cantidad, id_unidad, observaciones)
         VALUES (?, ?, ?, ?, ?)`,
        [id_mezcla, ing.id_producto, ing.cantidad, ing.id_unidad, ing.observaciones || null]
      );
    }

    await conn.commit();
    return res.status(201).json({ id_mezcla, mensaje: 'Mezcla creada correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('[crearMezcla]', err);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Ya existe una mezcla con ese nombre' });
    return res.status(400).json({ error: err.message || 'Error al crear la mezcla' });
  } finally {
    conn.release();
  }
};

// ── Editar mezcla e ingredientes ──────────────────────────────────────────
const editarMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, descripcion, ingredientes, precio_mayor, precio_menor } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!Array.isArray(ingredientes) || ingredientes.length === 0)
    return res.status(400).json({ error: 'Debe agregar al menos un ingrediente' });
  const precioMayorNum = parseFloat(precio_mayor) || 0;
  const precioMenorNum = parseFloat(precio_menor) || 0;
  if (precioMayorNum < 0 || precioMenorNum < 0)
    return res.status(400).json({ error: 'Los precios no pueden ser negativos' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [[existe]] = await conn.query(
      `SELECT id_mezcla FROM mezcla WHERE id_mezcla = ? AND id_empresa = ?`,
      [id, id_empresa]
    );
    if (!existe) { await conn.rollback(); return res.status(404).json({ error: 'Mezcla no encontrada' }); }

    await conn.query(
      `UPDATE mezcla SET nombre = ?, descripcion = ?, precio_mayor = ?, precio_menor = ? WHERE id_mezcla = ?`,
      [nombre.trim(), descripcion?.trim() || null, precioMayorNum, precioMenorNum, id]
    );

    // Reemplazar ingredientes por completo
    await conn.query(`DELETE FROM mezcla_ingrediente WHERE id_mezcla = ?`, [id]);
    for (const ing of ingredientes) {
      if (!ing.id_producto || !ing.cantidad || !ing.id_unidad)
        throw new Error('Cada ingrediente requiere producto, cantidad y unidad');
      if (parseFloat(ing.cantidad) <= 0)
        throw new Error('La cantidad de cada ingrediente debe ser mayor a 0');
      await conn.query(
        `INSERT INTO mezcla_ingrediente (id_mezcla, id_producto, cantidad, id_unidad, observaciones)
         VALUES (?, ?, ?, ?, ?)`,
        [id, ing.id_producto, ing.cantidad, ing.id_unidad, ing.observaciones || null]
      );
    }

    await conn.commit();
    return res.json({ mensaje: 'Mezcla actualizada correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('[editarMezcla]', err);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Ya existe una mezcla con ese nombre' });
    return res.status(400).json({ error: err.message || 'Error al editar la mezcla' });
  } finally {
    conn.release();
  }
};

// ── Activar / desactivar mezcla ───────────────────────────────────────────
const toggleMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  try {
    const [[m]] = await db.promise().query(
      `SELECT id_mezcla, activo FROM mezcla WHERE id_mezcla = ? AND id_empresa = ?`,
      [id, id_empresa]
    );
    if (!m) return res.status(404).json({ error: 'Mezcla no encontrada' });
    await db.promise().query(
      `UPDATE mezcla SET activo = ? WHERE id_mezcla = ?`,
      [m.activo ? 0 : 1, id]
    );
    return res.json({ activo: !m.activo });
  } catch (err) {
    console.error('[toggleMezcla]', err);
    return res.status(500).json({ error: 'Error al actualizar la mezcla' });
  }
};

// ── Error tipado para stock insuficiente (usado por aplicarMezclaTx) ──────
class StockInsuficienteError extends Error {
  constructor(detalle) {
    super(`Stock insuficiente en esta sucursal: ${detalle.join('; ')}`);
    this.name = 'StockInsuficienteError';
    this.status = 400;
    this.detalle = detalle;
  }
}

// ── Lógica compartida: descuenta ingredientes de una mezcla vía FEFO ──────
// Sin HTTP — la usan tanto el endpoint "Aplicar" como el motor de ventas.
// Debe ejecutarse dentro de una transacción abierta por quien la llama.
async function aplicarMezclaTx(conn, {
  id_mezcla, id_empresa, id_sucursal, id_usuario,
  cantidad_tandas, observaciones = null, id_venta = null,
}) {
  const tandasNum = parseFloat(cantidad_tandas);
  if (isNaN(tandasNum) || tandasNum <= 0) {
    throw Object.assign(new Error('La cantidad de tandas debe ser mayor a 0'), { status: 400 });
  }

  // Verificar mezcla activa y de la misma empresa
  const [[mezcla]] = await conn.query(
    `SELECT m.* FROM mezcla m
     JOIN empresa e ON m.id_empresa = e.id_empresa
     WHERE m.id_mezcla = ? AND m.id_empresa = ? AND m.activo = 1`,
    [id_mezcla, id_empresa]
  );
  if (!mezcla) {
    throw Object.assign(new Error('Mezcla no encontrada o inactiva'), { status: 404 });
  }

  const [ingredientes] = await conn.query(
    `SELECT mi.*, p.nombre AS producto_nombre, u.abreviatura AS unidad_abr
     FROM mezcla_ingrediente mi
     JOIN producto p ON mi.id_producto = p.id_producto
     JOIN unidad_medida u ON mi.id_unidad = u.id_unidad
     WHERE mi.id_mezcla = ?`,
    [id_mezcla]
  );
  if (ingredientes.length === 0) {
    throw Object.assign(new Error('La mezcla no tiene ingredientes definidos'), { status: 400 });
  }

  // Crear cabecera de aplicacion_mezcla primero para obtener el ID
  const [apRes] = await conn.query(
    `INSERT INTO aplicacion_mezcla (id_mezcla, id_sucursal, id_usuario, id_venta, cantidad_tandas, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_mezcla, id_sucursal, id_usuario, id_venta, tandasNum, observaciones]
  );
  const id_aplicacion = apRes.insertId;

  const stockInsuficiente = [];

  // Procesar cada ingrediente con lógica FEFO (First Expired First Out)
  for (const ing of ingredientes) {
    const totalNecesario = parseFloat(ing.cantidad) * tandasNum;

    const [lotes] = await conn.query(
      `SELECT l.id_lote, l.stock_unidades, l.unidades_por_caja, l.fecha_vencimiento
       FROM lote l
       WHERE l.id_producto = ? AND l.id_sucursal = ? AND l.stock_unidades > 0 AND l.activo = 1
       ORDER BY l.fecha_vencimiento ASC, l.id_lote ASC
       FOR UPDATE`,
      [ing.id_producto, id_sucursal]
    );

    const disponible = lotes.reduce((acc, l) => acc + parseFloat(l.stock_unidades), 0);
    if (disponible < totalNecesario) {
      stockInsuficiente.push(
        `${ing.producto_nombre}: necesario ${totalNecesario} ${ing.unidad_abr}, disponible ${disponible} ${ing.unidad_abr}`
      );
      continue;
    }

    let restante = totalNecesario;
    for (const lote of lotes) {
      if (restante <= 0) break;
      const descontar = Math.min(restante, parseFloat(lote.stock_unidades));
      restante -= descontar;
      lote.stock_unidades = parseFloat(lote.stock_unidades) - descontar;
      const nuevasCajas = Math.floor(lote.stock_unidades / lote.unidades_por_caja);

      await conn.query(
        `UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?`,
        [lote.stock_unidades, nuevasCajas, lote.id_lote]
      );

      const [movRes] = await conn.query(
        `INSERT INTO movimiento_almacen
          (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_unidades,
           referencia_id, referencia_tipo, observaciones)
         VALUES (?, ?, ?, 'SALIDA', 'MEZCLA', ?, ?, 'MEZCLA', ?)`,
        [lote.id_lote, id_sucursal, id_usuario, descontar,
         id_aplicacion, `Mezcla: ${mezcla.nombre}`]
      );

      await conn.query(
        `INSERT INTO aplicacion_mezcla_detalle
          (id_aplicacion, id_lote, id_producto, cantidad_descontada, id_unidad, id_movimiento_almacen)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_aplicacion, lote.id_lote, ing.id_producto, descontar, ing.id_unidad, movRes.insertId]
      );
    }
  }

  if (stockInsuficiente.length > 0) {
    throw new StockInsuficienteError(stockInsuficiente);
  }

  return { id_aplicacion, mezcla };
}

// ── Aplicar mezcla (HTTP) — descuenta stock de la sucursal del usuario ────
const aplicarMezcla = async (req, res) => {
  const id_empresa  = req.user.id_empresa;
  const id_usuario  = req.user.id_usuario;
  const id_sucursal = req.user.id_sucursal;
  const { id }      = req.params;
  const { cantidad_tandas = 1, observaciones } = req.body;

  if (!id_sucursal)
    return res.status(400).json({ error: 'Tu usuario no tiene sucursal asignada' });

  const tandas = parseFloat(cantidad_tandas);
  if (isNaN(tandas) || tandas <= 0)
    return res.status(400).json({ error: 'La cantidad de tandas debe ser mayor a 0' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const { id_aplicacion } = await aplicarMezclaTx(conn, {
      id_mezcla: id, id_empresa, id_sucursal, id_usuario,
      cantidad_tandas: tandas, observaciones: observaciones || null,
    });

    await conn.commit();
    return res.status(201).json({
      id_aplicacion,
      mensaje: `Mezcla aplicada correctamente (${tandas} tanda${tandas !== 1 ? 's' : ''})`,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[aplicarMezcla]', err);
    const status = err.status || 500;
    const body = { error: err.message || 'Error al aplicar la mezcla' };
    if (err.detalle) body.detalle = err.detalle;
    return res.status(status).json(body);
  } finally {
    conn.release();
  }
};

// ── Historial de aplicaciones ─────────────────────────────────────────────
const listarAplicaciones = async (req, res) => {
  const id_empresa  = req.user.id_empresa;
  const id_sucursal = req.user.id_sucursal;
  try {
    const [rows] = await db.promise().query(
      `SELECT am.*, m.nombre AS mezcla_nombre,
              s.nombre AS sucursal_nombre,
              u.nombre AS usuario_nombre, u.apellido AS usuario_apellido
       FROM aplicacion_mezcla am
       JOIN mezcla m ON am.id_mezcla = m.id_mezcla
       JOIN sucursal s ON am.id_sucursal = s.id_sucursal
       JOIN usuario u ON am.id_usuario = u.id_usuario
       WHERE m.id_empresa = ? AND am.id_sucursal = ?
       ORDER BY am.fecha_aplicacion DESC
       LIMIT 200`,
      [id_empresa, id_sucursal]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarAplicaciones]', err);
    return res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// ── Auxiliares para formularios ───────────────────────────────────────────
const listarProductosAux = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT p.id_producto, p.nombre, u.nombre AS unidad_nombre, u.abreviatura, u.id_unidad
       FROM producto p
       JOIN unidad_medida u ON p.id_unidad = u.id_unidad
       WHERE p.id_empresa = ? AND p.activo = 1
       ORDER BY p.nombre ASC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarProductosAux]', err);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const listarUnidadesAux = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT id_unidad, nombre, abreviatura FROM unidad_medida WHERE id_empresa = ? ORDER BY nombre ASC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarUnidadesAux]', err);
    return res.status(500).json({ error: 'Error al obtener unidades' });
  }
};

module.exports = {
  listarMezclas,
  obtenerMezcla,
  crearMezcla,
  editarMezcla,
  toggleMezcla,
  aplicarMezcla,
  aplicarMezclaTx,
  listarAplicaciones,
  listarProductosAux,
  listarUnidadesAux,
};
