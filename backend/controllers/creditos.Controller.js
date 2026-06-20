const db = require('../config/db');

// ── Cuentas por Cobrar (ventas a crédito) ────────────────────────────────

const listarCuentasPorCobrar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT
         v.id_venta,
         v.fecha_venta,
         v.fecha_vencimiento_credito,
         v.total,
         v.monto_pagado          AS cuota_inicial,
         v.estado_credito,
         v.nro_factura,
         COALESCE(SUM(pv.monto), 0) AS total_abonado,
         (v.total - v.monto_pagado - COALESCE(SUM(pv.monto), 0)) AS saldo_pendiente,
         c.nombre   AS cliente_nombre,
         c.apellido AS cliente_apellido,
         c.empresa  AS cliente_empresa,
         c.telefono AS cliente_telefono,
         s.nombre   AS sucursal_nombre
       FROM venta v
       JOIN sucursal s  ON s.id_sucursal = v.id_sucursal AND s.id_empresa = ?
       LEFT JOIN cliente   c  ON c.id_cliente = v.id_cliente
       LEFT JOIN pago_venta pv ON pv.id_venta = v.id_venta
       WHERE v.metodo_pago = 'CREDITO'
       GROUP BY v.id_venta
       ORDER BY v.fecha_venta DESC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarCuentasPorCobrar]', err);
    return res.status(500).json({ error: 'Error al obtener cuentas por cobrar' });
  }
};

const listarPagosVenta = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [[venta]] = await db.promise().query(
      `SELECT v.id_venta FROM venta v
       JOIN sucursal s ON s.id_sucursal = v.id_sucursal
       WHERE v.id_venta = ? AND s.id_empresa = ?`,
      [id, id_empresa]
    );
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const [pagos] = await db.promise().query(
      `SELECT pv.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
       FROM pago_venta pv
       JOIN usuario u ON u.id_usuario = pv.id_usuario
       WHERE pv.id_venta = ?
       ORDER BY pv.fecha_pago DESC`,
      [id]
    );
    return res.json(pagos);
  } catch (err) {
    console.error('[listarPagosVenta]', err);
    return res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

const registrarAbonoVenta = async (req, res) => {
  const { id } = req.params;
  const { monto, metodo_pago, observaciones } = req.body;
  const id_usuario = req.user.id_usuario;
  const id_empresa = req.user.id_empresa;

  if (!monto || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto del abono debe ser mayor a 0' });
  }

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [[venta]] = await connection.query(
      `SELECT v.id_venta, v.total, v.monto_pagado, v.estado_credito,
              COALESCE(SUM(pv.monto),0) AS total_abonado
       FROM venta v
       JOIN sucursal s ON s.id_sucursal = v.id_sucursal AND s.id_empresa = ?
       LEFT JOIN pago_venta pv ON pv.id_venta = v.id_venta
       WHERE v.id_venta = ? AND v.metodo_pago = 'CREDITO'
       GROUP BY v.id_venta FOR UPDATE`,
      [id_empresa, id]
    );

    if (!venta) {
      await connection.rollback();
      return res.status(404).json({ error: 'Venta a crédito no encontrada' });
    }

    const saldo = parseFloat(venta.total) - parseFloat(venta.monto_pagado) - parseFloat(venta.total_abonado);
    const montoAbono = parseFloat(monto);

    if (montoAbono > saldo + 0.01) {
      await connection.rollback();
      return res.status(400).json({ error: `El abono (${montoAbono}) supera el saldo pendiente (${saldo.toFixed(2)})` });
    }

    await connection.query(
      `INSERT INTO pago_venta (id_venta, id_usuario, monto, metodo_pago, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [id, id_usuario, montoAbono, metodo_pago || 'EFECTIVO', observaciones || null]
    );

    const nuevoSaldo = saldo - montoAbono;
    const nuevoEstado = nuevoSaldo <= 0.01 ? 'PAGADO' : 'PARCIAL';
    await connection.query(
      'UPDATE venta SET estado_credito = ? WHERE id_venta = ?',
      [nuevoEstado, id]
    );

    await connection.commit();
    return res.json({ mensaje: 'Abono registrado correctamente', nuevo_estado: nuevoEstado, saldo_restante: Math.max(0, nuevoSaldo) });
  } catch (err) {
    await connection.rollback();
    console.error('[registrarAbonoVenta]', err);
    return res.status(500).json({ error: 'Error al registrar abono' });
  } finally {
    connection.release();
  }
};

// ── Cuentas por Pagar (compras a crédito) ───────────────────────────────

const listarCuentasPorPagar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT
         c.id_compra,
         c.fecha_compra,
         c.fecha_vencimiento_credito,
         c.total,
         c.monto_pagado          AS cuota_inicial,
         c.estado_credito,
         c.nro_factura,
         COALESCE(SUM(pc.monto), 0) AS total_abonado,
         (c.total - c.monto_pagado - COALESCE(SUM(pc.monto), 0)) AS saldo_pendiente,
         p.empresa  AS proveedor_nombre,
         p.telefono AS proveedor_telefono,
         s.nombre   AS sucursal_nombre
       FROM compra c
       JOIN sucursal s  ON s.id_sucursal = c.id_sucursal AND s.id_empresa = ?
       LEFT JOIN proveedor p  ON p.id_proveedor = c.id_proveedor
       LEFT JOIN pago_compra pc ON pc.id_compra = c.id_compra
       WHERE c.metodo_pago = 'CREDITO'
       GROUP BY c.id_compra
       ORDER BY c.fecha_compra DESC`,
      [id_empresa]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarCuentasPorPagar]', err);
    return res.status(500).json({ error: 'Error al obtener cuentas por pagar' });
  }
};

const listarPagosCompra = async (req, res) => {
  const { id } = req.params;
  const id_empresa = req.user.id_empresa;
  try {
    const [[compra]] = await db.promise().query(
      `SELECT c.id_compra FROM compra c
       JOIN sucursal s ON s.id_sucursal = c.id_sucursal
       WHERE c.id_compra = ? AND s.id_empresa = ?`,
      [id, id_empresa]
    );
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });

    const [pagos] = await db.promise().query(
      `SELECT pc.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
       FROM pago_compra pc
       JOIN usuario u ON u.id_usuario = pc.id_usuario
       WHERE pc.id_compra = ?
       ORDER BY pc.fecha_pago DESC`,
      [id]
    );
    return res.json(pagos);
  } catch (err) {
    console.error('[listarPagosCompra]', err);
    return res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

const registrarAbonoCompra = async (req, res) => {
  const { id } = req.params;
  const { monto, metodo_pago, observaciones } = req.body;
  const id_usuario = req.user.id_usuario;
  const id_empresa = req.user.id_empresa;

  if (!monto || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto del abono debe ser mayor a 0' });
  }

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [[compra]] = await connection.query(
      `SELECT c.id_compra, c.total, c.monto_pagado, c.estado_credito,
              COALESCE(SUM(pc.monto),0) AS total_abonado
       FROM compra c
       JOIN sucursal s ON s.id_sucursal = c.id_sucursal AND s.id_empresa = ?
       LEFT JOIN pago_compra pc ON pc.id_compra = c.id_compra
       WHERE c.id_compra = ? AND c.metodo_pago = 'CREDITO'
       GROUP BY c.id_compra FOR UPDATE`,
      [id_empresa, id]
    );

    if (!compra) {
      await connection.rollback();
      return res.status(404).json({ error: 'Compra a crédito no encontrada' });
    }

    const saldo = parseFloat(compra.total) - parseFloat(compra.monto_pagado) - parseFloat(compra.total_abonado);
    const montoAbono = parseFloat(monto);

    if (montoAbono > saldo + 0.01) {
      await connection.rollback();
      return res.status(400).json({ error: `El abono (${montoAbono}) supera el saldo pendiente (${saldo.toFixed(2)})` });
    }

    await connection.query(
      `INSERT INTO pago_compra (id_compra, id_usuario, monto, metodo_pago, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [id, id_usuario, montoAbono, metodo_pago || 'EFECTIVO', observaciones || null]
    );

    const nuevoSaldo = saldo - montoAbono;
    const nuevoEstado = nuevoSaldo <= 0.01 ? 'PAGADO' : 'PARCIAL';
    await connection.query(
      'UPDATE compra SET estado_credito = ? WHERE id_compra = ?',
      [nuevoEstado, id]
    );

    await connection.commit();
    return res.json({ mensaje: 'Abono registrado correctamente', nuevo_estado: nuevoEstado, saldo_restante: Math.max(0, nuevoSaldo) });
  } catch (err) {
    await connection.rollback();
    console.error('[registrarAbonoCompra]', err);
    return res.status(500).json({ error: 'Error al registrar abono' });
  } finally {
    connection.release();
  }
};

// ── Reporte Cuentas por Cobrar ───────────────────────────────────────────

const reporteCobrar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { estado, id_cliente, fecha_inicio, fecha_fin } = req.query;

  let where = `WHERE v.metodo_pago = 'CREDITO' AND s.id_empresa = ?`;
  const params = [id_empresa];

  if (estado && estado !== 'TODOS') { where += ` AND v.estado_credito = ?`; params.push(estado); }
  if (id_cliente)  { where += ` AND v.id_cliente = ?`;            params.push(id_cliente); }
  if (fecha_inicio){ where += ` AND DATE(v.fecha_venta) >= ?`;    params.push(fecha_inicio); }
  if (fecha_fin)   { where += ` AND DATE(v.fecha_venta) <= ?`;    params.push(fecha_fin); }

  try {
    const [rows] = await db.promise().query(
      `SELECT
         v.id_venta, v.fecha_venta, v.fecha_vencimiento_credito,
         v.total, v.monto_pagado AS cuota_inicial, v.estado_credito, v.nro_factura,
         COALESCE(SUM(pv.monto), 0) AS total_abonado,
         (v.total - v.monto_pagado - COALESCE(SUM(pv.monto), 0)) AS saldo_pendiente,
         c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.empresa AS cliente_empresa,
         s.nombre AS sucursal_nombre
       FROM venta v
       JOIN sucursal s ON s.id_sucursal = v.id_sucursal
       LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
       LEFT JOIN pago_venta pv ON pv.id_venta = v.id_venta
       ${where}
       GROUP BY v.id_venta
       ORDER BY v.fecha_venta DESC`,
      params
    );

    const resumen = {
      total_registros: rows.length,
      total_deuda:     rows.reduce((s, r) => s + parseFloat(r.total), 0),
      total_cobrado:   rows.reduce((s, r) => s + parseFloat(r.cuota_inicial) + parseFloat(r.total_abonado), 0),
      total_pendiente: rows.reduce((s, r) => s + Math.max(0, parseFloat(r.saldo_pendiente)), 0),
    };

    return res.json({ data: rows, resumen });
  } catch (err) {
    console.error('[reporteCobrar]', err);
    return res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// ── Reporte Cuentas por Pagar ────────────────────────────────────────────

const reportePagar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { estado, id_proveedor, fecha_inicio, fecha_fin } = req.query;

  let where = `WHERE c.metodo_pago = 'CREDITO' AND s.id_empresa = ?`;
  const params = [id_empresa];

  if (estado && estado !== 'TODOS') { where += ` AND c.estado_credito = ?`; params.push(estado); }
  if (id_proveedor){ where += ` AND c.id_proveedor = ?`;           params.push(id_proveedor); }
  if (fecha_inicio){ where += ` AND DATE(c.fecha_compra) >= ?`;    params.push(fecha_inicio); }
  if (fecha_fin)   { where += ` AND DATE(c.fecha_compra) <= ?`;    params.push(fecha_fin); }

  try {
    const [rows] = await db.promise().query(
      `SELECT
         c.id_compra, c.fecha_compra, c.fecha_vencimiento_credito,
         c.total, c.monto_pagado AS cuota_inicial, c.estado_credito, c.nro_factura,
         COALESCE(SUM(pc.monto), 0) AS total_abonado,
         (c.total - c.monto_pagado - COALESCE(SUM(pc.monto), 0)) AS saldo_pendiente,
         p.empresa AS proveedor_nombre, p.nit AS proveedor_nit,
         s.nombre AS sucursal_nombre
       FROM compra c
       JOIN sucursal s ON s.id_sucursal = c.id_sucursal
       LEFT JOIN proveedor p ON p.id_proveedor = c.id_proveedor
       LEFT JOIN pago_compra pc ON pc.id_compra = c.id_compra
       ${where}
       GROUP BY c.id_compra
       ORDER BY c.fecha_compra DESC`,
      params
    );

    const resumen = {
      total_registros: rows.length,
      total_deuda:     rows.reduce((s, r) => s + parseFloat(r.total), 0),
      total_pagado:    rows.reduce((s, r) => s + parseFloat(r.cuota_inicial) + parseFloat(r.total_abonado), 0),
      total_pendiente: rows.reduce((s, r) => s + Math.max(0, parseFloat(r.saldo_pendiente)), 0),
    };

    return res.json({ data: rows, resumen });
  } catch (err) {
    console.error('[reportePagar]', err);
    return res.status(500).json({ error: 'Error al generar reporte' });
  }
};

module.exports = {
  listarCuentasPorCobrar,
  listarPagosVenta,
  registrarAbonoVenta,
  listarCuentasPorPagar,
  listarPagosCompra,
  registrarAbonoCompra,
  reporteCobrar,
  reportePagar,
};
