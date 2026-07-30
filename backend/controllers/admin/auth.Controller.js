const db     = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { crearRateLimiter } = require('../../utils/rateLimiter');
const passwordResetService = require('../../services/passwordReset.service');

const login = async (req, res) => {
  const { correo, contrasena } = req.body ?? {};
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM super_admin WHERE correo = ? AND activo = 1',
      [correo.trim().toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const admin = rows[0];
    const coincide = await bcrypt.compare(String(contrasena), admin.contrasena);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await db.promise().query(
      'UPDATE super_admin SET ultimo_acceso = NOW() WHERE id_admin = ?',
      [admin.id_admin]
    );

    const token = jwt.sign(
      { id_admin: admin.id_admin, nombre: admin.nombre, correo: admin.correo, rol: 'super_admin' },
      process.env.ADMIN_JWT_SECRET || 'admin_secret',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      admin: { id_admin: admin.id_admin, nombre: admin.nombre, correo: admin.correo, correo_recuperacion: admin.correo_recuperacion },
    });
  } catch (err) {
    console.error('[admin/login]', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ── Recuperación de contraseña ───────────────────────────────────────────
const recuperarLimiter = crearRateLimiter({ max: 3, ventanaMs: 15 * 60 * 1000 });
const MENSAJE_GENERICO = 'Si la cuenta existe, se envió un código a su correo de recuperación.';

async function buscarAdminPorCorreo(correo) {
  const [rows] = await db.promise().query(
    `SELECT id_admin, nombre, correo_recuperacion FROM super_admin WHERE correo = ? AND activo = 1 LIMIT 1`,
    [correo]
  );
  return rows[0] || null;
}

const solicitarRecuperacion = async (req, res) => {
  const { identificador } = req.body ?? {};
  if (!identificador?.trim()) {
    return res.status(400).json({ error: 'Debe indicar su correo' });
  }

  const clave = identificador.trim().toLowerCase();
  const { bloqueado, restanteMin } = recuperarLimiter.verificar(clave);
  if (bloqueado) {
    return res.status(429).json({ error: `Demasiadas solicitudes. Intenta en ${restanteMin} minuto(s).` });
  }
  recuperarLimiter.registrar(clave);

  try {
    const admin = await buscarAdminPorCorreo(clave);
    if (!admin) {
      return res.json({ mensaje: MENSAJE_GENERICO });
    }
    if (!admin.correo_recuperacion) {
      return res.json({ mensaje: MENSAJE_GENERICO, sin_correo_recuperacion: true });
    }
    await passwordResetService.solicitarCodigo({
      tipoCuenta: 'super_admin',
      idCuenta: admin.id_admin,
      correoRecuperacion: admin.correo_recuperacion,
      nombre: admin.nombre,
    });
    return res.json({ mensaje: MENSAJE_GENERICO });
  } catch (err) {
    console.error('[admin/solicitarRecuperacion]', err);
    return res.status(502).json({ error: 'No se pudo enviar el correo. Intenta más tarde.' });
  }
};

const verificarCodigoRecuperacion = async (req, res) => {
  const { identificador, codigo } = req.body ?? {};
  if (!identificador?.trim() || !codigo?.trim()) {
    return res.status(400).json({ error: 'Correo y código son requeridos' });
  }
  try {
    const admin = await buscarAdminPorCorreo(identificador.trim().toLowerCase());
    if (!admin) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
    const reset_token = await passwordResetService.verificarCodigo({
      tipoCuenta: 'super_admin',
      idCuenta: admin.id_admin,
      codigo: codigo.trim(),
    });
    return res.json({ reset_token });
  } catch (err) {
    const status = err.status || 500;
    console.error('[admin/verificarCodigoRecuperacion]', err);
    return res.status(status).json({ error: status < 500 ? err.message : 'Error en el servidor' });
  }
};

const restablecerContrasena = async (req, res) => {
  const { reset_token, nueva_contrasena } = req.body ?? {};
  if (!reset_token || !nueva_contrasena) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  if (String(nueva_contrasena).trim().length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }
  try {
    await passwordResetService.restablecer({
      tipoCuenta: 'super_admin',
      resetToken: reset_token,
      nuevaContrasena: nueva_contrasena,
    });
    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    const status = err.status || 500;
    console.error('[admin/restablecerContrasena]', err);
    return res.status(status).json({ error: status < 500 ? err.message : 'Error en el servidor' });
  }
};

module.exports = {
  login,
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  restablecerContrasena,
};
