const db = require('../config/db');
const { verifyWebhookSignature } = require('../services/codepay.service');

/**
 * POST /api/webhooks/codepay
 * Recibe la confirmación de pago de CodePay.
 * Siempre responde 200 (CodePay no reintenta notificaciones).
 */
const confirmarPago = async (req, res) => {
  const rawBody   = req.body.toString();
  const sigHeader = req.headers['x-codepay-signature'];
  const secret    = process.env.CODEPAY_NOTIFICATION_SECRET;

  // Verificar firma (obligatorio en producción)
  if (secret) {
    if (!sigHeader) {
      console.warn('[webhook] Petición sin X-Codepay-Signature rechazada');
      return res.status(401).json({ error: 'Missing signature' });
    }
    if (!verifyWebhookSignature(sigHeader, rawBody, secret)) {
      console.warn('[webhook] Firma inválida rechazada');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Solo procesar pagos completados
  if (data.event !== 'payment.completed') {
    return res.json({ success: true });
  }

  const { order_id, tx_id, voucher_id, amount, net_amount } = data;

  try {
    const [rows] = await db.promise().query(
      'SELECT id_venta, estado, total, codepay_tx_id FROM venta WHERE codepay_order_id = ?',
      [order_id]
    );

    if (rows.length === 0) {
      console.error(`[webhook] Venta no encontrada para order_id: ${order_id}`);
      return res.json({ success: true });
    }

    const venta = rows[0];

    // Idempotencia: ya fue procesado
    if (venta.codepay_tx_id && venta.estado === 'COMPLETADA') {
      console.log(`[webhook] Pago ya procesado para order_id: ${order_id}`);
      return res.json({ success: true });
    }

    if (venta.estado !== 'PENDIENTE') {
      console.log(`[webhook] Venta #${venta.id_venta} no está PENDIENTE (estado: ${venta.estado})`);
      return res.json({ success: true });
    }

    // monto_pagado = net_amount (lo que recibe el comercio) o amount si no viene desglosado
    const montoPagado = net_amount ? parseFloat(net_amount) : parseFloat(amount);

    await db.promise().query(
      `UPDATE venta
         SET estado         = 'COMPLETADA',
             codepay_tx_id  = ?,
             codepay_voucher = ?,
             monto_pagado   = ?,
             cambio         = 0
       WHERE id_venta = ?`,
      [tx_id, voucher_id || null, montoPagado, venta.id_venta]
    );

    console.log(`[webhook] Pago confirmado: venta #${venta.id_venta} | tx_id: ${tx_id} | neto: ${montoPagado}`);
    return res.json({ success: true });

  } catch (err) {
    console.error('[webhook] Error al procesar confirmación de pago:', err);
    // Responder 200 igual — el pago ya fue confirmado por el banco
    return res.json({ success: true, warning: 'Error interno, revisar manualmente' });
  }
};

module.exports = { confirmarPago };
