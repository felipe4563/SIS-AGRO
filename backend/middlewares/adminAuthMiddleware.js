const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin_secret');
    if (!decoded.id_admin || !decoded.rol) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (decoded.rol !== 'super_admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    req.admin = {
      id_admin: decoded.id_admin,
      nombre:   decoded.nombre,
      correo:   decoded.correo,
      rol:      decoded.rol,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    console.error('[adminAuthMiddleware] Error:', error);
    return res.status(500).json({ error: 'Error interno de autenticación' });
  }
};

module.exports = { adminAuthMiddleware };
