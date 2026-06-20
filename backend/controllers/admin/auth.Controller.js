const db     = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

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
      admin: { id_admin: admin.id_admin, nombre: admin.nombre, correo: admin.correo },
    });
  } catch (err) {
    console.error('[admin/login]', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { login };
