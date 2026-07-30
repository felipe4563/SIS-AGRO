const db = require('../config/db');
const { generarOrderId, generarQR, consultarEstadoQR } = require('../services/codepay.service');
const { aplicarMezclaTx } = require('./mezclas.Controller');

// ── Helper privado: lógica FIFO compartida por crear e iniciarPagoQR ──────
async function _insertarVentaFIFO(connection, {
  id_empresa, id_sucursal, id_usuario, id_cliente, nro_factura, tipo_venta,
  subtotal, descuento_total, total, monto_pagado, cambio,
  metodo_pago, observaciones, detalles,
  estado, codepay_order_id,
  fecha_vencimiento_credito,
}) {
  // Separar líneas de producto (motor FIFO existente) de líneas de mezcla
  // (usan aplicarMezclaTx, que descuenta varios productos/lotes a la vez).
  const detallesProducto = detalles.filter(d => d.tipo !== 'MEZCLA');
  const detallesMezcla    = detalles.filter(d => d.tipo === 'MEZCLA');

  // 0. Pre-fetch factores de conversión para ítems fraccionados
  const conversionIds = [...new Set(detallesProducto.filter(d => d.id_conversion).map(d => d.id_conversion))];
  const factoresMap = {};
  if (conversionIds.length > 0) {
    const phs = conversionIds.map(() => '?').join(',');
    const [convRows] = await connection.query(
      `SELECT id_conversion, factor FROM conversion_unidad WHERE id_conversion IN (${phs})`,
      conversionIds
    );
    for (const c of convRows) factoresMap[c.id_conversion] = parseFloat(c.factor);
  }

  // 1. Validar y acumular requerimientos por producto
  const requerimientos = {};
  for (const item of detallesProducto) {
    if (!requerimientos[item.id_producto]) {
      requerimientos[item.id_producto] = { cantidadRequerida: 0, itemsOriginales: [] };
    }
    let unidades_a_descontar = parseFloat(item.cantidad);
    if (item.tipo_cantidad === 'CAJA') {
      if (!item.unidades_por_caja) {
        throw new Error(`Falta el parámetro unidades_por_caja para el producto ID ${item.id_producto} que se vende por CAJA.`);
      }
      unidades_a_descontar = parseFloat(item.cantidad) * parseFloat(item.unidades_por_caja);
    } else if (item.id_conversion && factoresMap[item.id_conversion]) {
      // Venta fraccionada: descontar cantidad / factor del stock en unidades base
      unidades_a_descontar = parseFloat(item.cantidad) / factoresMap[item.id_conversion];
    }
    requerimientos[item.id_producto].cantidadRequerida += unidades_a_descontar;
    requerimientos[item.id_producto].itemsOriginales.push({ ...item, unidades_totales: unidades_a_descontar });
  }

  // 2. Insertar cabecera de venta
  const esCredito = (metodo_pago || 'EFECTIVO') === 'CREDITO';
  const [ventaResult] = await connection.query(
    `INSERT INTO venta
      (id_sucursal, id_usuario, id_cliente, nro_factura, tipo_venta, subtotal, descuento_total,
       total, monto_pagado, cambio, metodo_pago, estado, observaciones, codepay_order_id,
       fecha_vencimiento_credito, estado_credito)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_sucursal, id_usuario, id_cliente || null, nro_factura || null,
      tipo_venta || 'MENOR', subtotal, descuento_total, total,
      monto_pagado, cambio, metodo_pago || 'EFECTIVO',
      estado, observaciones || null,
      codepay_order_id || null,
      esCredito ? (fecha_vencimiento_credito || null) : null,
      esCredito ? 'PENDIENTE' : null,
    ]
  );
  const id_venta = ventaResult.insertId;

  // 3. Procesar FIFO por producto
  for (const id_producto in requerimientos) {
    let unidadesFaltantes = requerimientos[id_producto].cantidadRequerida;

    const [lotes] = await connection.query(
      `SELECT id_lote, stock_unidades, unidades_por_caja, numero_lote
       FROM lote
       WHERE id_producto = ? AND id_sucursal = ? AND stock_unidades > 0 AND activo = 1
       ORDER BY fecha_vencimiento ASC, id_lote ASC FOR UPDATE`,
      [id_producto, id_sucursal]
    );

    const stockDisponible = lotes.reduce((acc, l) => acc + l.stock_unidades, 0);
    if (stockDisponible < unidadesFaltantes) {
      throw new Error(`Stock insuficiente para el producto ID ${id_producto}. Requerido: ${unidadesFaltantes}, Disponible: ${stockDisponible}`);
    }

    let indexLote = 0;
    for (const itemOriginal of requerimientos[id_producto].itemsOriginales) {
      let unidadesItemFaltantes = itemOriginal.unidades_totales;

      while (unidadesItemFaltantes > 0 && indexLote < lotes.length) {
        const loteActual = lotes[indexLote];
        const descontarDeEsteLote = Math.min(unidadesItemFaltantes, loteActual.stock_unidades);

        loteActual.stock_unidades -= descontarDeEsteLote;
        unidadesItemFaltantes     -= descontarDeEsteLote;

        const proporcion      = descontarDeEsteLote / itemOriginal.unidades_totales;
        const cantParaDetalle = parseFloat(itemOriginal.cantidad) * proporcion;
        const subtotalDetalle = parseFloat(itemOriginal.subtotal) * proporcion;
        const descMontoDetalle = parseFloat(itemOriginal.descuento_monto || 0) * proporcion;

        await connection.query(
          `INSERT INTO detalle_venta
            (id_venta, id_lote, id_producto, tipo_cantidad, id_conversion, cantidad, precio_unitario, descuento_pct, descuento_monto, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_venta, loteActual.id_lote, id_producto, itemOriginal.tipo_cantidad,
            itemOriginal.id_conversion || null,
            cantParaDetalle, itemOriginal.precio_unitario, itemOriginal.descuento_pct || 0,
            descMontoDetalle, subtotalDetalle,
          ]
        );

        const nuevasCajas = Math.floor(loteActual.stock_unidades / loteActual.unidades_por_caja);
        await connection.query(
          'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
          [loteActual.stock_unidades, nuevasCajas, loteActual.id_lote]
        );

        await connection.query(
          `INSERT INTO movimiento_almacen
            (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
           VALUES (?, ?, ?, 'SALIDA', 'VENTA', ?, ?, ?, 'VENTA')`,
          [
            loteActual.id_lote, id_sucursal, id_usuario,
            Math.floor(descontarDeEsteLote / loteActual.unidades_por_caja), descontarDeEsteLote,
            id_venta,
          ]
        );

        if (loteActual.stock_unidades === 0) indexLote++;
      }
    }
  }

  // 4. Procesar líneas de mezcla — descuenta ingredientes vía aplicarMezclaTx
  //    (misma transacción: si falta stock de un ingrediente, se revierte toda la venta)
  for (const item of detallesMezcla) {
    const { id_aplicacion } = await aplicarMezclaTx(connection, {
      id_mezcla:       item.id_mezcla,
      id_empresa,
      id_sucursal,
      id_usuario,
      cantidad_tandas: parseFloat(item.cantidad_tandas),
      id_venta,
    });

    await connection.query(
      `INSERT INTO detalle_venta
        (id_venta, id_producto, id_mezcla, id_aplicacion, cantidad, precio_unitario, descuento_pct, descuento_monto, subtotal)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_venta, item.id_mezcla, id_aplicacion,
        parseFloat(item.cantidad_tandas), parseFloat(item.precio_unitario),
        parseFloat(item.descuento_pct || 0), parseFloat(item.descuento_monto || 0),
        parseFloat(item.subtotal),
      ]
    );
  }

  return id_venta;
}

// Listar todas las ventas
const listar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT v.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.ci_nit,
              u.nombre as usuario_nombre, u.apellido as usuario_apellido
       FROM venta v
       JOIN sucursal s ON v.id_sucursal = s.id_sucursal
       LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
       LEFT JOIN usuario u ON v.id_usuario = u.id_usuario
       WHERE s.id_empresa = ?
       ORDER BY v.fecha_venta DESC, v.id_venta DESC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener historial de ventas' });
  }
};

// Obtener detalle completo de una venta
const obtener = async (req, res) => {
  const { id } = req.params;
  try {
    const [ventaRows] = await db.promise().query(
      `SELECT v.*,
              c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.ci_nit, c.empresa,
              u.nombre as usuario_nombre, u.apellido as usuario_apellido,
              s.nombre as sucursal_nombre, s.direccion as sucursal_direccion,
              s.ciudad as sucursal_ciudad, s.telefono as sucursal_telefono
       FROM venta v
       LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
       LEFT JOIN usuario u ON v.id_usuario = u.id_usuario
       JOIN sucursal s ON v.id_sucursal = s.id_sucursal
       WHERE v.id_venta = ? AND s.id_empresa = ?`,
      [id, req.user.id_empresa]
    );

    if (ventaRows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    
    const venta = ventaRows[0];

    const [detalleRows] = await db.promise().query(
      `SELECT d.*, p.nombre as producto_nombre, l.numero_lote, mz.nombre as mezcla_nombre
       FROM detalle_venta d
       LEFT JOIN producto p ON d.id_producto = p.id_producto
       LEFT JOIN lote l ON d.id_lote = l.id_lote
       LEFT JOIN mezcla mz ON d.id_mezcla = mz.id_mezcla
       WHERE d.id_venta = ?`,
      [id]
    );

    venta.detalles = detalleRows;
    return res.json(venta);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener detalle de venta' });
  }
};

// Crear nueva venta (pago inmediato: efectivo, transferencia, crédito, etc.)
const crear = async (req, res) => {
  const {
    id_cliente, nro_factura, tipo_venta, subtotal,
    descuento_total, total, monto_pagado, cambio,
    metodo_pago, observaciones, detalles,
    fecha_vencimiento_credito,
  } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'El carrito de ventas está vacío.' });
  }

  if (metodo_pago === 'CREDITO' && !id_cliente) {
    return res.status(400).json({ error: 'Para ventas a crédito debe seleccionar un cliente.' });
  }

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Verificar que haya un turno de caja abierto en la sucursal
    const [turnoAbierto] = await connection.query(
      `SELECT id_apertura FROM apertura_cierre_caja WHERE id_sucursal = ? AND estado = 'ABIERTA' LIMIT 1`,
      [req.user.id_sucursal]
    );
    if (turnoAbierto.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ error: 'No hay caja abierta. Abre un turno en el módulo de Caja antes de registrar ventas.' });
    }

    const id_venta = await _insertarVentaFIFO(connection, {
      id_empresa:   req.user.id_empresa,
      id_sucursal:  req.user.id_sucursal,
      id_usuario:   req.user.id_usuario,
      id_cliente, nro_factura, tipo_venta, subtotal,
      descuento_total, total, monto_pagado, cambio,
      metodo_pago, observaciones, detalles,
      fecha_vencimiento_credito,
      estado:             'COMPLETADA',
      codepay_order_id:   null,
    });
    await connection.commit();
    return res.status(201).json({ mensaje: 'Venta registrada con éxito', id_venta });
  } catch (err) {
    await connection.rollback();
    console.error('Error al procesar venta:', err);
    return res.status(500).json({ error: err.message || 'Error interno al registrar la venta' });
  } finally {
    connection.release();
  }
};

// Iniciar pago QR mediante CodePay (API directa — QR embebido en la app)
// Crea la venta como PENDIENTE, llama a CodePay API y devuelve el QR como data URI.
const iniciarPagoQR = async (req, res) => {
  const {
    id_cliente, nro_factura, tipo_venta, subtotal,
    descuento_total, total, monto_pagado, cambio,
    observaciones, detalles,
  } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'El carrito de ventas está vacío.' });
  }

  if (!process.env.CODEPAY_PUBLIC_KEY || !process.env.CODEPAY_SECRET_KEY) {
    return res.status(503).json({ error: 'Pago QR no configurado. Contacta al administrador.' });
  }

  const id_usuario  = req.user.id_usuario;
  const id_sucursal = req.user.id_sucursal;
  const order_id = generarOrderId();
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Bug #5 fix: turno check dentro del try para que la conexión siempre se libere
    const [turnoAbiertoQR] = await connection.query(
      `SELECT id_apertura FROM apertura_cierre_caja WHERE id_sucursal = ? AND estado = 'ABIERTA' LIMIT 1`,
      [id_sucursal]
    );
    if (turnoAbiertoQR.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ error: 'No hay caja abierta. Abre un turno en el módulo de Caja antes de registrar ventas.' });
    }

    const id_venta = await _insertarVentaFIFO(connection, {
      id_empresa: req.user.id_empresa,
      id_sucursal, id_usuario,
      id_cliente, nro_factura, tipo_venta, subtotal,
      descuento_total, total,
      monto_pagado: parseFloat(total),
      cambio: 0,
      metodo_pago: 'QR',
      observaciones, detalles,
      estado:           'PENDIENTE',
      codepay_order_id: order_id,
    });

    // Bug #1 fix: llamar a CodePay ANTES del commit para que el rollback sea efectivo si falla
    const payload = {
      app_key:     process.env.CODEPAY_PUBLIC_KEY,
      order_id,
      amount:      parseFloat(total),
      currency:    'BOB',
      description: 'SIS AGRO',
      expires_at:  new Date(Date.now() + 30 * 60_000).toISOString(),
    };

    const qrData = await generarQR(payload);

    await connection.query(
      'UPDATE venta SET codepay_tx_id = ? WHERE id_venta = ?',
      [qrData.tx_id, id_venta]
    );

    await connection.commit();

    return res.status(201).json({
      id_venta,
      qr_code:           qrData.qr_code,
      tx_id:             qrData.tx_id,
      amount:            qrData.amount,
      net_amount:        qrData.net_amount,
      commission_amount: qrData.commission_amount,
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error al iniciar pago QR:', err);
    return res.status(500).json({ error: err.message || 'Error interno al iniciar el pago QR' });
  } finally {
    connection.release();
  }
};

// Consultar estado del pago QR por tx_id (polling desde el frontend)
const estadoPagoQR = async (req, res) => {
  const { tx_id } = req.params;
  const id_sucursal = req.user.id_sucursal;
  try {
    // Bug #3 fix: verificar que el tx_id pertenece a la sucursal del usuario (anti-IDOR)
    const [rows] = await db.promise().query(
      'SELECT id_venta FROM venta WHERE codepay_tx_id = ? AND id_sucursal = ? LIMIT 1',
      [tx_id, id_sucursal]
    );
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Acceso no autorizado a este pago.' });
    }

    const data = await consultarEstadoQR(tx_id);
    return res.json(data);
  } catch (err) {
    console.error('Error al consultar estado QR:', err);
    return res.status(502).json({ error: 'No se pudo consultar el estado del pago.' });
  }
};

// Anular venta (Reversión completa de stock)
const anular = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.user.id_usuario;
  const id_empresa = req.user.id_empresa;

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    // 1. Validar estado de la venta (y que pertenezca a esta empresa)
    const [ventaRows] = await connection.query(
      `SELECT v.estado, v.id_sucursal FROM venta v
       JOIN sucursal s ON v.id_sucursal = s.id_sucursal
       WHERE v.id_venta = ? AND s.id_empresa = ? FOR UPDATE`,
      [id, id_empresa]
    );
    if (ventaRows.length === 0) throw new Error('Venta no encontrada');
    if (ventaRows[0].estado === 'ANULADA') throw new Error('La venta ya se encuentra anulada');

    const id_sucursal = ventaRows[0].id_sucursal;

    // 2. Recuperar detalles para revertir stock
    const [detalles] = await connection.query('SELECT * FROM detalle_venta WHERE id_venta = ?', [id]);

    // Pre-fetch factores de conversión para detalles fraccionados
    const convIdsAnular = [...new Set(detalles.filter(d => d.id_conversion).map(d => d.id_conversion))];
    const factoresAnularMap = {};
    if (convIdsAnular.length > 0) {
      const phs = convIdsAnular.map(() => '?').join(',');
      const [cRows] = await connection.query(
        `SELECT id_conversion, factor FROM conversion_unidad WHERE id_conversion IN (${phs})`,
        convIdsAnular
      );
      for (const c of cRows) factoresAnularMap[c.id_conversion] = parseFloat(c.factor);
    }

    for (const det of detalles) {
      if (det.id_mezcla) {
        // Línea de mezcla: revertir cada ingrediente consumido por esta aplicación
        const [ingredientesConsumidos] = await connection.query(
          'SELECT id_lote, cantidad_descontada FROM aplicacion_mezcla_detalle WHERE id_aplicacion = ? FOR UPDATE',
          [det.id_aplicacion]
        );

        for (const ing of ingredientesConsumidos) {
          const [loteInfoIng] = await connection.query('SELECT stock_unidades, unidades_por_caja FROM lote WHERE id_lote = ? FOR UPDATE', [ing.id_lote]);
          if (loteInfoIng.length === 0) continue;

          const cantidadDevolver = parseFloat(ing.cantidad_descontada);
          const nuevoStockUnidadesIng = loteInfoIng[0].stock_unidades + cantidadDevolver;
          const nuevoStockCajasIng = Math.floor(nuevoStockUnidadesIng / loteInfoIng[0].unidades_por_caja);

          await connection.query(
            'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
            [nuevoStockUnidadesIng, nuevoStockCajasIng, ing.id_lote]
          );

          await connection.query(
            `INSERT INTO movimiento_almacen
              (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
             VALUES (?, ?, ?, 'INGRESO', 'ANULACION DE VENTA (MEZCLA)', ?, ?, ?, 'ANULACION')`,
            [
              ing.id_lote, id_sucursal, id_usuario,
              Math.floor(cantidadDevolver / loteInfoIng[0].unidades_por_caja), cantidadDevolver,
              id,
            ]
          );
        }

        await connection.query('UPDATE aplicacion_mezcla SET anulada = 1 WHERE id_aplicacion = ?', [det.id_aplicacion]);
        continue;
      }

      // Necesitamos las unidades por caja del lote para el recalculo de cajas
      const [loteInfo] = await connection.query('SELECT stock_unidades, unidades_por_caja FROM lote WHERE id_lote = ? FOR UPDATE', [det.id_lote]);
      if (loteInfo.length === 0) continue;

      let unidades_a_devolver = parseFloat(det.cantidad);
      if (det.tipo_cantidad === 'CAJA') {
        unidades_a_devolver = parseFloat(det.cantidad) * loteInfo[0].unidades_por_caja;
      } else if (det.id_conversion && factoresAnularMap[det.id_conversion]) {
        unidades_a_devolver = parseFloat(det.cantidad) / factoresAnularMap[det.id_conversion];
      }

      const nuevoStockUnidades = loteInfo[0].stock_unidades + unidades_a_devolver;
      const nuevoStockCajas = Math.floor(nuevoStockUnidades / loteInfo[0].unidades_por_caja);

      // Actualizar stock del lote
      await connection.query(
        'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
        [nuevoStockUnidades, nuevoStockCajas, det.id_lote]
      );

      // Registrar movimiento de almacén (ENTRADA por Anulación)
      await connection.query(
        `INSERT INTO movimiento_almacen 
          (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
         VALUES (?, ?, ?, 'INGRESO', 'ANULACION DE VENTA', ?, ?, ?, 'ANULACION')`,
        [
          det.id_lote, id_sucursal, id_usuario,
          Math.floor(unidades_a_devolver / loteInfo[0].unidades_por_caja), unidades_a_devolver,
          id
        ]
      );
    }

    // 3. Cambiar estado de la cabecera
    await connection.query('UPDATE venta SET estado = "ANULADA" WHERE id_venta = ?', [id]);

    await connection.commit();
    return res.json({ mensaje: 'Venta anulada y stock retornado correctamente' });

  } catch (err) {
    await connection.rollback();
    console.error('Error al anular venta:', err);
    return res.status(500).json({ error: err.message || 'Error interno al anular la venta' });
  } finally {
    connection.release();
  }
};

// Productos y mezclas disponibles para el POS — de la sucursal/empresa del usuario
const listarProductosPOS = async (req, res) => {
  const id_sucursal = req.user.id_sucursal;
  const id_empresa  = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT
         p.id_producto,
         p.nombre,
         p.precio_menor,
         p.precio_mayor,
         p.descuento_menor,
         p.descuento_mayor,
         p.permite_fraccion,
         MIN(l.unidades_por_caja) AS unidades_por_caja,
         SUM(l.stock_unidades)   AS stock_unidades_total
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       WHERE l.id_sucursal = ?
         AND l.activo = 1
         AND l.stock_unidades > 0
         AND p.activo = 1
       GROUP BY
         p.id_producto, p.nombre,
         p.precio_menor, p.precio_mayor,
         p.descuento_menor, p.descuento_mayor,
         p.permite_fraccion
       ORDER BY p.nombre ASC`,
      [id_sucursal]
    );

    // Para productos fraccionables, obtener sus conversiones con precios
    const idsFracc = rows.filter(p => p.permite_fraccion).map(p => p.id_producto);
    const fraccionesMap = {};
    if (idsFracc.length > 0) {
      const phs = idsFracc.map(() => '?').join(',');
      const [fracc] = await db.promise().query(
        `SELECT pf.id_producto, pf.id_conversion,
                pf.precio_mayor, pf.precio_menor,
                cu.nombre, cu.abreviatura, cu.factor
         FROM producto_fraccion pf
         JOIN conversion_unidad cu ON pf.id_conversion = cu.id_conversion
         WHERE pf.id_producto IN (${phs})
           AND pf.activo = 1
           AND cu.activo = 1
         ORDER BY cu.nombre ASC`,
        idsFracc
      );
      for (const f of fracc) {
        if (!fraccionesMap[f.id_producto]) fraccionesMap[f.id_producto] = [];
        fraccionesMap[f.id_producto].push({
          id_conversion: f.id_conversion,
          nombre:        f.nombre,
          abreviatura:   f.abreviatura,
          factor:        parseFloat(f.factor),
          precio_mayor:  parseFloat(f.precio_mayor),
          precio_menor:  parseFloat(f.precio_menor),
        });
      }
    }

    const result = rows.map(p => ({
      ...p,
      tipo:       'PRODUCTO',
      fracciones: fraccionesMap[p.id_producto] || [],
    }));

    // Mezclas activas de la empresa — sin filtrar por stock (se valida al vender,
    // ya que una mezcla consume varios productos/lotes distintos)
    const [mezclas] = await db.promise().query(
      `SELECT id_mezcla, nombre, precio_mayor, precio_menor
       FROM mezcla
       WHERE id_empresa = ? AND activo = 1
       ORDER BY nombre ASC`,
      [id_empresa]
    );
    const mezclasResult = mezclas.map(m => ({
      tipo:         'MEZCLA',
      id_mezcla:    m.id_mezcla,
      nombre:       m.nombre,
      precio_mayor: parseFloat(m.precio_mayor) || 0,
      precio_menor: parseFloat(m.precio_menor) || 0,
    }));

    return res.json([...result, ...mezclasResult]);
  } catch (err) {
    console.error('[listarProductosPOS]', err);
    return res.status(500).json({ error: 'Error al obtener productos para el POS' });
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  iniciarPagoQR,
  estadoPagoQR,
  anular,
  listarProductosPOS,
};
