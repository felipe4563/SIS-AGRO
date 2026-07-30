const db     = require('../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { crearRateLimiter }    = require('../utils/rateLimiter');
const passwordResetService    = require('../services/passwordReset.service');

// ── Rate limiting en memoria (5 intentos / 15 min por IP) ────────────────
const intentosFallidos = new Map();
const MAX_INTENTOS = 5;
const VENTANA_MS   = 15 * 60 * 1000;

function verificarRateLimit(ip) {
  const ahora = Date.now();
  const registro = intentosFallidos.get(ip);
  if (!registro || ahora - registro.inicio > VENTANA_MS) {
    return { bloqueado: false };
  }
  if (registro.intentos >= MAX_INTENTOS) {
    const restanteMs = VENTANA_MS - (ahora - registro.inicio);
    const restanteMin = Math.ceil(restanteMs / 60000);
    return { bloqueado: true, restanteMin };
  }
  return { bloqueado: false };
}

function registrarIntentoFallido(ip) {
  const ahora = Date.now();
  const registro = intentosFallidos.get(ip);
  if (!registro || ahora - registro.inicio > VENTANA_MS) {
    intentosFallidos.set(ip, { intentos: 1, inicio: ahora });
  } else {
    registro.intentos++;
  }
}

function limpiarIntentos(ip) {
  intentosFallidos.delete(ip);
}

const login = (req, res) => {
  const { identificador, contrasena } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (!identificador || !contrasena) {
    return res.status(400).json({ error: 'Correo/CI y contraseña son requeridos' });
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const { bloqueado, restanteMin } = verificarRateLimit(ip);
  if (bloqueado) {
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Intenta en ${restanteMin} minuto(s).`,
    });
  }

  // ── 1. Buscar usuario activo por correo o CI (empresa también debe estar activa) ──
  const sqlUsuario = `
    SELECT u.*, r.nombre AS rol_nombre, p.modulos AS plan_modulos,
           IFNULL(e.setup_completado, 1) AS setup_completado
    FROM usuario u
    LEFT JOIN rol r ON u.id_rol = r.id_rol
    JOIN empresa e ON e.id_empresa = u.id_empresa
    LEFT JOIN suscripcion s ON s.id_empresa = e.id_empresa
      AND s.estado IN ('ACTIVA', 'PRUEBA')
    LEFT JOIN plan p ON p.id_plan = s.id_plan
    WHERE (u.correo = ? OR u.ci = ?) AND u.activo = 1 AND e.activo = 1
    LIMIT 1
  `;

  db.query(sqlUsuario, [identificador, identificador], async (err, results) => {
    if (err) {
      console.error('[login] Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      registrarIntentoFallido(ip);
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const usuario = results[0];

    // ── 2. Verificar contraseña (solo bcrypt) ─────────────────────────────────
    try {
      const hash = usuario.contrasena ?? '';
      const coincide = await bcrypt.compare(String(contrasena), hash);
      if (!coincide) {
        registrarIntentoFallido(ip);
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      limpiarIntentos(ip);
    } catch (bcryptErr) {
      console.error('[login] Error en bcrypt:', bcryptErr);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
      // ── 4. Cargar permisos del rol ────────────────────────────────────────
      const sqlPermisos = `
        SELECT p.nombre_clave
        FROM rol_permiso rp
        JOIN permiso p ON p.id_permiso = rp.id_permiso
        WHERE rp.id_rol = ?
      `;

      db.query(sqlPermisos, [usuario.id_rol ?? -1], (errPermisos, rowsPermisos) => {
        if (errPermisos) {
          console.error('[login] Error al cargar permisos:', errPermisos);
          return res.status(500).json({ error: 'Error al cargar permisos' });
        }

        const permisos = rowsPermisos.map(p => p.nombre_clave);

        const rawModulos = usuario.plan_modulos;
        const modulos = Array.isArray(rawModulos)
          ? rawModulos
          : (typeof rawModulos === 'string' ? JSON.parse(rawModulos) : []);

        // ── 5. Generar JWT ────────────────────────────────────────────────
        const setupCompletado = usuario.setup_completado === 1 || usuario.setup_completado === true;

        const token = jwt.sign(
          {
            id_usuario:       usuario.id_usuario,
            id_empresa:       usuario.id_empresa,
            id_sucursal:      usuario.id_sucursal,
            rol:              usuario.id_rol,
            rol_nombre:       usuario.rol_nombre,
            permisos,
            modulos,
            setup_completado: setupCompletado,
          },
          process.env.JWT_SECRET,
          { expiresIn: '8h' }
        );

        // ── 6. Responder ──────────────────────────────────────────────────
        return res.json({
          token,
          usuario: {
            id:                  usuario.id_usuario,
            id_empresa:          usuario.id_empresa,
            nombre:              usuario.nombre,
            apellido:            usuario.apellido,
            correo:              usuario.correo,
            correo_recuperacion: usuario.correo_recuperacion,
            celular:             usuario.celular,
            rol:                 usuario.id_rol,
            id_sucursal:         usuario.id_sucursal,
            rol_nombre:          usuario.rol_nombre,
            permisos,
            modulos,
            setup_completado:    setupCompletado,
          },
        });
      });
    });
};

// ── Recuperación de contraseña ───────────────────────────────────────────
const recuperarLimiter = crearRateLimiter({ max: 3, ventanaMs: 15 * 60 * 1000 });
const MENSAJE_GENERICO = 'Si la cuenta existe, se envió un código a su correo de recuperación.';

async function buscarUsuarioPorIdentificador(identificador) {
  const [rows] = await db.promise().query(
    `SELECT id_usuario, nombre, correo_recuperacion FROM usuario WHERE (correo = ? OR ci = ?) AND activo = 1 LIMIT 1`,
    [identificador, identificador]
  );
  return rows[0] || null;
}

const solicitarRecuperacion = async (req, res) => {
  const { identificador } = req.body ?? {};
  if (!identificador?.trim()) {
    return res.status(400).json({ error: 'Debe indicar su correo o CI' });
  }

  const clave = identificador.trim().toLowerCase();
  const { bloqueado, restanteMin } = recuperarLimiter.verificar(clave);
  if (bloqueado) {
    return res.status(429).json({ error: `Demasiadas solicitudes. Intenta en ${restanteMin} minuto(s).` });
  }
  recuperarLimiter.registrar(clave);

  try {
    const usuario = await buscarUsuarioPorIdentificador(identificador.trim());
    if (!usuario) {
      return res.json({ mensaje: MENSAJE_GENERICO });
    }
    if (!usuario.correo_recuperacion) {
      return res.json({ mensaje: MENSAJE_GENERICO, sin_correo_recuperacion: true });
    }
    await passwordResetService.solicitarCodigo({
      tipoCuenta: 'usuario',
      idCuenta: usuario.id_usuario,
      correoRecuperacion: usuario.correo_recuperacion,
      nombre: usuario.nombre,
    });
    return res.json({ mensaje: MENSAJE_GENERICO });
  } catch (err) {
    console.error('[solicitarRecuperacion]', err);
    return res.status(502).json({ error: 'No se pudo enviar el correo. Intenta más tarde.' });
  }
};

const verificarCodigoRecuperacion = async (req, res) => {
  const { identificador, codigo } = req.body ?? {};
  if (!identificador?.trim() || !codigo?.trim()) {
    return res.status(400).json({ error: 'Correo/CI y código son requeridos' });
  }
  try {
    const usuario = await buscarUsuarioPorIdentificador(identificador.trim());
    if (!usuario) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
    const reset_token = await passwordResetService.verificarCodigo({
      tipoCuenta: 'usuario',
      idCuenta: usuario.id_usuario,
      codigo: codigo.trim(),
    });
    return res.json({ reset_token });
  } catch (err) {
    const status = err.status || 500;
    console.error('[verificarCodigoRecuperacion]', err);
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
      tipoCuenta: 'usuario',
      resetToken: reset_token,
      nuevaContrasena: nueva_contrasena,
    });
    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    const status = err.status || 500;
    console.error('[restablecerContrasena]', err);
    return res.status(status).json({ error: status < 500 ? err.message : 'Error en el servidor' });
  }
};

module.exports = {
  login,
  solicitarRecuperacion,
  verificarCodigoRecuperacion,
  restablecerContrasena,
};