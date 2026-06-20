const db   = require('../config/db');
const XLSX = require('xlsx');

const listarLotes = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT l.*, p.nombre as producto_nombre, p.stock_minimo,
              p.precio_menor, p.precio_mayor, p.descuento_menor, p.descuento_mayor,
              m.nombre as marca_nombre, c.nombre as clasificacion_nombre,
              s.nombre as sucursal_nombre
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       JOIN sucursal s ON l.id_sucursal = s.id_sucursal
       LEFT JOIN marca m ON p.id_marca = m.id_marca
       LEFT JOIN clasificacion_producto c ON p.id_clasificacion = c.id_clasificacion
       WHERE l.activo = 1 AND s.id_empresa = ?
       ORDER BY l.fecha_vencimiento ASC, l.id_lote DESC`,
      [id_empresa]
    );
    const verCosto = req.user.permisos.includes('almacen.ver_costo_lote');
    if (!verCosto) rows.forEach(r => { delete r.precio_por_caja; });
    return res.json(rows);
  } catch (err) {
    console.error('[listarLotes]', err);
    return res.status(500).json({ error: 'Error al obtener inventario del almacén' });
  }
};

const obtenerLote = async (req, res) => {
  const { id } = req.params;
  try {
    const [loteRows] = await db.promise().query(
      `SELECT l.*, p.nombre as producto_nombre
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       WHERE l.id_lote = ?`,
      [id]
    );
    if (loteRows.length === 0) return res.status(404).json({ error: 'Lote no encontrado' });
    const lote = loteRows[0];

    const [movimientos] = await db.promise().query(
      `SELECT m.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
       FROM movimiento_almacen m
       LEFT JOIN usuario u ON m.id_usuario = u.id_usuario
       WHERE m.id_lote = ?
       ORDER BY m.fecha_movimiento DESC`,
      [id]
    );
    lote.movimientos = req.user.permisos.includes('almacen.ver_movimientos') ? movimientos : [];
    if (!req.user.permisos.includes('almacen.ver_costo_lote')) delete lote.precio_por_caja;
    return res.json(lote);
  } catch (err) {
    console.error('[obtenerLote]', err);
    return res.status(500).json({ error: 'Error al obtener detalle del lote' });
  }
};

const ajusteInventario = async (req, res) => {
  const { id } = req.params;
  const { nueva_cantidad_unidades, motivo } = req.body;
  const id_usuario = req.user.id_usuario;

  if (nueva_cantidad_unidades === undefined || !motivo) {
    return res.status(400).json({ error: 'Debe especificar la nueva cantidad y el motivo' });
  }

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const [loteInfo] = await conn.query(
      'SELECT stock_unidades, unidades_por_caja, id_sucursal FROM lote WHERE id_lote = ? FOR UPDATE',
      [id]
    );
    if (loteInfo.length === 0) throw new Error('Lote no encontrado');

    const stockActual = loteInfo[0].stock_unidades;
    const diferencia = nueva_cantidad_unidades - stockActual;
    if (diferencia === 0) {
      conn.release();
      return res.json({ mensaje: 'No hay cambios en el inventario' });
    }

    const nuevasCajas = Math.floor(nueva_cantidad_unidades / loteInfo[0].unidades_por_caja);
    await conn.query(
      'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
      [nueva_cantidad_unidades, nuevasCajas, id]
    );
    await conn.query(
      `INSERT INTO movimiento_almacen
        (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_tipo)
       VALUES (?, ?, ?, 'AJUSTE', ?, ?, ?, 'MANUAL')`,
      [id, loteInfo[0].id_sucursal, id_usuario, motivo,
       Math.floor(Math.abs(diferencia) / loteInfo[0].unidades_por_caja), Math.abs(diferencia)]
    );
    await conn.commit();
    return res.json({ mensaje: 'Ajuste de inventario realizado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('[ajusteInventario]', err);
    return res.status(500).json({ error: err.message || 'Error al ajustar inventario' });
  } finally {
    conn.release();
  }
};

const crearLote = async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const id_sucursal_usuario = req.user.id_sucursal;
  const {
    id_producto, id_sucursal, numero_lote, fecha_produccion, fecha_vencimiento,
    fecha_ingreso_almacen, cantidad_cajas, unidades_por_caja, precio_por_caja, observaciones
  } = req.body;

  if (!id_producto || !fecha_ingreso_almacen || !cantidad_cajas || !unidades_por_caja) {
    return res.status(400).json({ error: 'Producto, fecha de ingreso, cajas y unidades por caja son obligatorios' });
  }

  const sucursal = id_sucursal || id_sucursal_usuario;
  const cajas = parseInt(cantidad_cajas);
  const upc = parseInt(unidades_por_caja);
  const stock_unidades = cajas * upc;

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO lote (id_producto, id_sucursal, numero_lote, fecha_produccion, fecha_vencimiento,
        fecha_ingreso_almacen, cantidad_cajas, unidades_por_caja, precio_por_caja,
        stock_cajas, stock_unidades, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_producto, sucursal, numero_lote || null, fecha_produccion || null,
       fecha_vencimiento || null, fecha_ingreso_almacen, cajas, upc,
       precio_por_caja || 0, cajas, stock_unidades, observaciones || null]
    );
    const id_lote = result.insertId;
    await conn.query(
      `INSERT INTO movimiento_almacen
        (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_tipo)
       VALUES (?, ?, ?, 'ENTRADA', 'Ingreso manual de lote', ?, ?, 'MANUAL')`,
      [id_lote, sucursal, id_usuario, cajas, stock_unidades]
    );
    await conn.commit();
    return res.status(201).json({ mensaje: 'Lote ingresado correctamente', id_lote });
  } catch (err) {
    await conn.rollback();
    console.error('[crearLote]', err);
    return res.status(500).json({ error: err.message || 'Error al crear lote' });
  } finally {
    conn.release();
  }
};

const darBajaLote = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!motivo) return res.status(400).json({ error: 'El motivo es obligatorio' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const [loteRows] = await conn.query(
      'SELECT stock_unidades, stock_cajas, id_sucursal FROM lote WHERE id_lote = ? AND activo = 1 FOR UPDATE',
      [id]
    );
    if (loteRows.length === 0) throw new Error('Lote no encontrado o ya dado de baja');

    const { stock_unidades, stock_cajas, id_sucursal } = loteRows[0];
    if (stock_unidades > 0) {
      await conn.query(
        `INSERT INTO movimiento_almacen
          (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_tipo)
         VALUES (?, ?, ?, 'SALIDA', ?, ?, ?, 'BAJA')`,
        [id, id_sucursal, id_usuario, motivo, stock_cajas, stock_unidades]
      );
    }
    await conn.query(
      'UPDATE lote SET activo = 0, stock_cajas = 0, stock_unidades = 0 WHERE id_lote = ?',
      [id]
    );
    await conn.commit();
    return res.json({ mensaje: 'Lote dado de baja correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('[darBajaLote]', err);
    return res.status(500).json({ error: err.message || 'Error al dar de baja el lote' });
  } finally {
    conn.release();
  }
};

const listarTraslados = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT t.*,
        l.numero_lote, l.id_sucursal as id_sucursal_origen,
        p.nombre as producto_nombre,
        s_orig.nombre as sucursal_origen,
        s_dest.nombre as sucursal_destino,
        u.nombre as usuario_nombre, u.apellido as usuario_apellido
       FROM traslado t
       JOIN lote l ON t.id_lote_origen = l.id_lote
       JOIN producto p ON l.id_producto = p.id_producto
       JOIN sucursal s_orig ON l.id_sucursal = s_orig.id_sucursal
       JOIN sucursal s_dest ON t.id_sucursal_dest = s_dest.id_sucursal
       LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
       WHERE s_orig.id_empresa = ?
       ORDER BY t.fecha_traslado DESC
       LIMIT 100`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarTraslados]', err);
    return res.status(500).json({ error: 'Error al obtener traslados' });
  }
};

const crearTraslado = async (req, res) => {
  const { id_lote_origen, id_sucursal_dest, cantidad_cajas, cantidad_unidades, observaciones } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!id_lote_origen || !id_sucursal_dest) {
    return res.status(400).json({ error: 'Lote origen y sucursal destino son obligatorios' });
  }
  const cajas = parseInt(cantidad_cajas) || 0;
  const unidades = parseInt(cantidad_unidades) || 0;
  if (cajas === 0 && unidades === 0) {
    return res.status(400).json({ error: 'Debe especificar al menos una cantidad a trasladar' });
  }

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const [loteRows] = await conn.query(
      'SELECT stock_cajas, stock_unidades, id_sucursal FROM lote WHERE id_lote = ? AND activo = 1 FOR UPDATE',
      [id_lote_origen]
    );
    if (loteRows.length === 0) throw new Error('Lote no encontrado o inactivo');

    const lote = loteRows[0];
    if (lote.id_sucursal === parseInt(id_sucursal_dest)) {
      throw new Error('La sucursal de destino debe ser diferente a la de origen');
    }
    if (cajas > lote.stock_cajas) {
      throw new Error(`Stock insuficiente. Cajas disponibles: ${lote.stock_cajas}`);
    }
    if (unidades > lote.stock_unidades) {
      throw new Error(`Stock insuficiente. Unidades disponibles: ${lote.stock_unidades}`);
    }

    const [result] = await conn.query(
      `INSERT INTO traslado (id_lote_origen, id_sucursal_dest, id_usuario, cantidad_cajas, cantidad_unidades, observaciones, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
      [id_lote_origen, id_sucursal_dest, id_usuario, cajas, unidades, observaciones || null]
    );
    await conn.commit();
    return res.status(201).json({ mensaje: 'Traslado creado. Confirme en destino para mover el stock.', id_traslado: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('[crearTraslado]', err);
    return res.status(500).json({ error: err.message || 'Error al crear traslado' });
  } finally {
    conn.release();
  }
};

const confirmarTraslado = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.user.id_usuario;
  const id_empresa = req.user.id_empresa;

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const [trasRows] = await conn.query(
      `SELECT t.* FROM traslado t
       JOIN lote l ON t.id_lote_origen = l.id_lote
       JOIN sucursal s ON l.id_sucursal = s.id_sucursal
       WHERE t.id_traslado = ? AND t.estado = 'PENDIENTE' AND s.id_empresa = ?
       FOR UPDATE`,
      [id, id_empresa]
    );
    if (trasRows.length === 0) throw new Error('Traslado no encontrado o ya procesado');

    const t = trasRows[0];
    const [loteRows] = await conn.query(
      'SELECT * FROM lote WHERE id_lote = ? FOR UPDATE',
      [t.id_lote_origen]
    );
    const lote = loteRows[0];

    if (lote.stock_unidades < t.cantidad_unidades || lote.stock_cajas < t.cantidad_cajas) {
      throw new Error('Stock insuficiente en el lote de origen al momento de confirmar');
    }

    await conn.query(
      'UPDATE lote SET stock_cajas = stock_cajas - ?, stock_unidades = stock_unidades - ? WHERE id_lote = ?',
      [t.cantidad_cajas, t.cantidad_unidades, t.id_lote_origen]
    );
    await conn.query(
      `INSERT INTO movimiento_almacen
        (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
       VALUES (?, ?, ?, 'TRASLADO', 'Salida por traslado confirmado', ?, ?, ?, 'TRASLADO')`,
      [t.id_lote_origen, lote.id_sucursal, id_usuario, t.cantidad_cajas, t.cantidad_unidades, id]
    );

    const [loteDestRows] = await conn.query(
      'SELECT id_lote FROM lote WHERE id_producto = ? AND id_sucursal = ? AND activo = 1 AND (numero_lote = ? OR numero_lote IS NULL) LIMIT 1',
      [lote.id_producto, t.id_sucursal_dest, lote.numero_lote]
    );

    let id_lote_dest;
    if (loteDestRows.length > 0) {
      id_lote_dest = loteDestRows[0].id_lote;
      await conn.query(
        'UPDATE lote SET stock_cajas = stock_cajas + ?, stock_unidades = stock_unidades + ? WHERE id_lote = ?',
        [t.cantidad_cajas, t.cantidad_unidades, id_lote_dest]
      );
    } else {
      const [r2] = await conn.query(
        `INSERT INTO lote (id_producto, id_sucursal, numero_lote, fecha_vencimiento, fecha_ingreso_almacen,
          cantidad_cajas, unidades_por_caja, precio_por_caja, stock_cajas, stock_unidades)
         VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
        [lote.id_producto, t.id_sucursal_dest, lote.numero_lote, lote.fecha_vencimiento,
         t.cantidad_cajas, lote.unidades_por_caja, lote.precio_por_caja,
         t.cantidad_cajas, t.cantidad_unidades]
      );
      id_lote_dest = r2.insertId;
    }

    await conn.query(
      `INSERT INTO movimiento_almacen
        (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
       VALUES (?, ?, ?, 'ENTRADA', 'Entrada por traslado confirmado', ?, ?, ?, 'TRASLADO')`,
      [id_lote_dest, t.id_sucursal_dest, id_usuario, t.cantidad_cajas, t.cantidad_unidades, id]
    );

    await conn.query('UPDATE traslado SET estado = "CONFIRMADO" WHERE id_traslado = ?', [id]);
    await conn.commit();
    return res.json({ mensaje: 'Traslado confirmado y stock actualizado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('[confirmarTraslado]', err);
    return res.status(500).json({ error: err.message || 'Error al confirmar traslado' });
  } finally {
    conn.release();
  }
};

const cancelarTraslado = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT t.id_traslado FROM traslado t
       JOIN lote l ON t.id_lote_origen = l.id_lote
       JOIN sucursal s ON l.id_sucursal = s.id_sucursal
       WHERE t.id_traslado = ? AND t.estado = 'PENDIENTE' AND s.id_empresa = ?
       FOR UPDATE`,
      [id, id_empresa]
    );
    if (rows.length === 0) throw new Error('Traslado no encontrado o ya procesado');
    await conn.query('UPDATE traslado SET estado = "CANCELADO" WHERE id_traslado = ?', [id]);
    await conn.commit();
    return res.json({ mensaje: 'Traslado cancelado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('[cancelarTraslado]', err);
    return res.status(500).json({ error: err.message || 'Error al cancelar traslado' });
  } finally {
    conn.release();
  }
};

const listarAlertas = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [bajoStock] = await db.promise().query(
      `SELECT l.id_lote, l.numero_lote, l.stock_unidades, l.id_sucursal,
        p.nombre as producto_nombre, p.stock_minimo,
        s.nombre as sucursal_nombre
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       JOIN sucursal s ON l.id_sucursal = s.id_sucursal
       WHERE l.activo = 1 AND p.stock_minimo > 0 AND l.stock_unidades < p.stock_minimo
         AND s.id_empresa = ?
       ORDER BY l.stock_unidades ASC`,
      [id_empresa]
    );
    const [proxVencer] = await db.promise().query(
      `SELECT l.id_lote, l.numero_lote, l.fecha_vencimiento, l.stock_unidades,
        p.nombre as producto_nombre,
        s.nombre as sucursal_nombre,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) as dias_restantes
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       JOIN sucursal s ON l.id_sucursal = s.id_sucursal
       WHERE l.activo = 1 AND l.fecha_vencimiento IS NOT NULL
         AND l.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
         AND l.stock_unidades > 0
         AND s.id_empresa = ?
       ORDER BY l.fecha_vencimiento ASC`,
      [id_empresa]
    );
    return res.json({ bajo_stock: bajoStock, prox_vencer: proxVencer });
  } catch (err) {
    console.error('[listarAlertas]', err);
    return res.status(500).json({ error: 'Error al obtener alertas' });
  }
};

const listarProductosActivos = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT id_producto, nombre FROM producto WHERE activo = 1 AND id_empresa = ? ORDER BY nombre ASC',
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarProductosActivos]', err);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const listarSucursalesActivas = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      'SELECT id_sucursal, nombre FROM sucursal WHERE activo = 1 AND id_empresa = ? ORDER BY nombre ASC',
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarSucursalesActivas]', err);
    return res.status(500).json({ error: 'Error al obtener sucursales' });
  }
};

// ── Importar inventario desde Excel ──────────────────────────────────────────

const parseDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    // Número de serie Excel → fecha
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
  }
  const str = String(val).trim();
  // DD/MM/AAAA
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  // AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return null;
};

const findOrCreate = async (db, table, pkCol, empresa, nombre) => {
  const nombreTrim = String(nombre).trim();
  const [rows] = await db.promise().query(
    `SELECT ${pkCol} FROM \`${table}\` WHERE nombre = ? AND id_empresa = ? LIMIT 1`,
    [nombreTrim, empresa]
  );
  if (rows.length > 0) return { id: rows[0][pkCol], created: false };
  const [result] = await db.promise().query(
    `INSERT INTO \`${table}\` (id_empresa, nombre) VALUES (?, ?)`,
    [empresa, nombreTrim]
  );
  return { id: result.insertId, created: true };
};

const importarInventario = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

  const id_empresa  = req.user.id_empresa;
  const id_usuario  = req.user.id_usuario;

  let workbook;
  try {
    workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: false });
  } catch {
    return res.status(400).json({ error: 'Archivo Excel inválido o corrupto' });
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows  = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // Fila 0 = encabezados, Fila 1 = descripciones → datos desde fila 2
  const dataRows = rows.slice(2).filter(r => r.some(c => String(c).trim() !== ''));

  const resultado = { procesados: 0, lotes_creados: 0, productos_creados: 0, errores: [] };

  for (let i = 0; i < dataRows.length; i++) {
    const fila = i + 3; // número de fila real en Excel
    const r    = dataRows[i];

    const nombre_producto        = String(r[0]  ?? '').trim();
    const clasificacion_nombre   = String(r[1]  ?? '').trim();
    const marca_nombre           = String(r[2]  ?? '').trim();
    const unidad_nombre          = String(r[3]  ?? '').trim();
    const precio_mayor           = parseFloat(r[4])  || 0;
    const precio_menor           = parseFloat(r[5])  || 0;
    const sucursal_nombre        = String(r[6]  ?? '').trim();
    const numero_lote            = String(r[7]  ?? '').trim() || null;
    const fecha_vencimiento      = parseDate(r[8]);
    const fecha_produccion       = parseDate(r[9]);
    const fecha_ingreso          = parseDate(r[10]);
    const cantidad_cajas         = parseInt(r[11]) || 0;
    const unidades_por_caja      = parseInt(r[12]) || 1;
    const precio_por_caja        = parseFloat(r[13]) || 0;
    const stock_cajas            = parseInt(r[14]) || 0;
    const stock_unidades         = parseInt(r[15]) || 0;
    const observaciones          = String(r[16] ?? '').trim() || null;

    // Validaciones requeridas
    if (!nombre_producto) {
      resultado.errores.push({ fila, motivo: 'nombre_producto está vacío' });
      continue;
    }
    if (!sucursal_nombre) {
      resultado.errores.push({ fila, motivo: 'sucursal está vacía' });
      continue;
    }
    if (!fecha_ingreso) {
      resultado.errores.push({ fila, motivo: 'fecha_ingreso inválida o vacía (usar DD/MM/AAAA)' });
      continue;
    }

    try {
      // Buscar sucursal o crearla si no existe
      const [sucRows] = await db.promise().query(
        'SELECT id_sucursal FROM sucursal WHERE nombre = ? AND id_empresa = ? LIMIT 1',
        [sucursal_nombre, id_empresa]
      );
      let id_sucursal;
      if (sucRows.length > 0) {
        id_sucursal = sucRows[0].id_sucursal;
      } else {
        const [sucRes] = await db.promise().query(
          'INSERT INTO sucursal (id_empresa, nombre, direccion, ciudad, telefono, correo, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
          [id_empresa, sucursal_nombre, null, null, null, null]
        );
        id_sucursal = sucRes.insertId;
      }

      // Clasificación (find or create)
      let id_clasificacion = null;
      if (clasificacion_nombre) {
        const cl = await findOrCreate(db, 'clasificacion_producto', 'id_clasificacion', id_empresa, clasificacion_nombre);
        id_clasificacion = cl.id;
      }

      // Marca (find or create)
      let id_marca = null;
      if (marca_nombre) {
        const mk = await findOrCreate(db, 'marca', 'id_marca', id_empresa, marca_nombre);
        id_marca = mk.id;
      }

      // Unidad de medida (find or create)
      let id_unidad = null;
      if (unidad_nombre) {
        const [uRows] = await db.promise().query(
          'SELECT id_unidad FROM unidad_medida WHERE nombre = ? AND id_empresa = ? LIMIT 1',
          [unidad_nombre, id_empresa]
        );
        if (uRows.length > 0) {
          id_unidad = uRows[0].id_unidad;
        } else {
          const [uRes] = await db.promise().query(
            'INSERT INTO unidad_medida (id_empresa, nombre, abreviatura) VALUES (?, ?, ?)',
            [id_empresa, unidad_nombre, unidad_nombre.substring(0, 5)]
          );
          id_unidad = uRes.insertId;
        }
      }

      // Producto (find or create)
      const [prodRows] = await db.promise().query(
        'SELECT id_producto FROM producto WHERE nombre = ? AND id_empresa = ? LIMIT 1',
        [nombre_producto, id_empresa]
      );

      let id_producto;
      let producto_creado = false;

      if (prodRows.length > 0) {
        id_producto = prodRows[0].id_producto;
      } else {
        const [prodRes] = await db.promise().query(
          `INSERT INTO producto
           (id_empresa, id_clasificacion, id_marca, id_unidad, nombre, precio_mayor, precio_menor,
            descuento_mayor, descuento_menor, stock_minimo, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 1)`,
          [id_empresa, id_clasificacion, id_marca, id_unidad, nombre_producto, precio_mayor, precio_menor]
        );
        id_producto = prodRes.insertId;
        producto_creado = true;
        resultado.productos_creados++;
      }

      // Crear lote
      await db.promise().query(
        `INSERT INTO lote
         (id_producto, id_sucursal, numero_lote, fecha_produccion, fecha_vencimiento,
          fecha_ingreso_almacen, cantidad_cajas, unidades_por_caja, precio_por_caja,
          stock_cajas, stock_unidades, observaciones, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [id_producto, id_sucursal, numero_lote, fecha_produccion, fecha_vencimiento,
         fecha_ingreso, cantidad_cajas, unidades_por_caja, precio_por_caja,
         stock_cajas, stock_unidades, observaciones]
      );

      resultado.procesados++;
      resultado.lotes_creados++;

    } catch (err) {
      console.error(`[importarInventario] fila ${fila}:`, err.message);
      resultado.errores.push({ fila, motivo: err.message });
    }
  }

  return res.json(resultado);
};

module.exports = {
  listarLotes,
  obtenerLote,
  ajusteInventario,
  crearLote,
  darBajaLote,
  listarTraslados,
  crearTraslado,
  confirmarTraslado,
  cancelarTraslado,
  listarAlertas,
  listarProductosActivos,
  listarSucursalesActivas,
  importarInventario,
};
