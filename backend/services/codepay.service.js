const { createHmac } = require('crypto');

function signCheckoutToken(payload, secretKey) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h   = Buffer.from(JSON.stringify(header)).toString('base64url');
  const p   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secretKey)
                .update(`${h}.${p}`)
                .digest('base64url');
  return `${h}.${p}.${sig}`;
}

/**
 * Verifica la firma X-Codepay-Signature del webhook.
 * Formato: t={timestamp},v1={hmac_hex}
 */
function verifyWebhookSignature(header, rawBody, secret) {
  try {
    const [tPart, v1Part] = header.split(',');
    const timestamp = tPart.split('=')[1];
    const received  = v1Part.split('=')[1];
    const expected  = createHmac('sha256', secret)
                        .update(`${timestamp}.${rawBody}`)
                        .digest('hex');
    if (expected.length !== received.length) return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch {
    return false;
  }
}

/** Genera un order_id único: max 25 chars, solo letras/números/guión_bajo */
function generarOrderId() {
  return `VTA_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Llama a la API directa de CodePay para obtener un QR.
 * Devuelve { qr_code, tx_id, amount, net_amount, commission_amount }.
 */
async function generarQR(payload) {
  const apiUrl    = process.env.CODEPAY_API_URL || 'https://payapi.codewave.com.bo/api';
  const secretKey = process.env.CODEPAY_SECRET_KEY;
  const publicKey = process.env.CODEPAY_PUBLIC_KEY;

  const token = signCheckoutToken(payload, secretKey);

  const res = await fetch(`${apiUrl}/v1/payments/qr`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token, pk: publicKey }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CodePay API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Consulta el estado de un pago por tx_id.
 * Devuelve { status, tx_id, order_id } — status: pending | completed | failed
 */
async function consultarEstadoQR(tx_id) {
  const apiUrl = process.env.CODEPAY_API_URL || 'https://payapi.codewave.com.bo/api';

  const res = await fetch(`${apiUrl}/checkout/status/${encodeURIComponent(tx_id)}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CodePay status error ${res.status}: ${text}`);
  }

  return res.json();
}

module.exports = { signCheckoutToken, verifyWebhookSignature, generarOrderId, generarQR, consultarEstadoQR };
