const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,     // false + requireTLS = STARTTLS sobre el puerto 587
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function plantillaCodigo(codigo, nombre) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
      <h2 style="color: #059669; margin-bottom: 4px;">Recuperación de contraseña</h2>
      <p>Hola ${escapeHtml(nombre || '')},</p>
      <p>Usa el siguiente código para continuar con la recuperación de tu contraseña en SIS-AGRO:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;
                background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 20px 0;">
        ${codigo}
      </p>
      <p>Este código expira en <strong>10 minutos</strong>.</p>
      <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
        Si no solicitaste este código, ignora este correo — tu cuenta sigue segura.
      </p>
    </div>
  `;
}

async function enviarCodigoRecuperacion(correoDestino, codigo, nombre) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: correoDestino,
    subject: 'Tu código de recuperación de contraseña',
    html: plantillaCodigo(codigo, nombre),
  });
}

module.exports = { enviarCodigoRecuperacion };
