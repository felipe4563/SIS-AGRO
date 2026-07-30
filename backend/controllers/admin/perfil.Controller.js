const db     = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { esCorreoValido } = require('../../utils/validarCorreo');

const getPerfil = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id_admin, nombre, correo, correo_recuperacion, ultimo_acceso FROM super_admin WHERE id_admin = ?',
      [req.admin.id_admin]
    );
    if (!rows.length) return res.status(404).json({ error: 'Administrador no encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[admin/perfil/get]', err);
    return res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

const updatePerfil = async (req, res) => {
  const { nombre, correo, correo_recuperacion } = req.body ?? {};
  if (!nombre?.trim() || !correo?.trim()) {
    return res.status(400).json({ error: 'Nombre y correo son requeridos' });
  }
  if (correo_recuperacion?.trim() && !esCorreoValido(correo_recuperacion.trim())) {
    return res.status(400).json({ error: 'El correo de recuperación no es válido' });
  }
  try {
    const [existing] = await db.promise().query(
      'SELECT id_admin FROM super_admin WHERE correo = ? AND id_admin != ?',
      [correo.trim().toLowerCase(), req.admin.id_admin]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'El correo ya está en uso por otro administrador' });
    }

    await db.promise().query(
      'UPDATE super_admin SET nombre = ?, correo = ?, correo_recuperacion = ? WHERE id_admin = ?',
      [nombre.trim(), correo.trim().toLowerCase(), correo_recuperacion?.trim() || null, req.admin.id_admin]
    );

    const token = jwt.sign(
      { id_admin: req.admin.id_admin, nombre: nombre.trim(), correo: correo.trim().toLowerCase(), rol: 'super_admin' },
      process.env.ADMIN_JWT_SECRET || 'admin_secret',
      { expiresIn: '8h' }
    );

    return res.json({
      admin: {
        id_admin: req.admin.id_admin,
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        correo_recuperacion: correo_recuperacion?.trim() || null,
      },
      token,
    });
  } catch (err) {
    console.error('[admin/perfil/update]', err);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

const updatePassword = async (req, res) => {
  const { contrasena_actual, contrasena_nueva } = req.body ?? {};
  if (!contrasena_actual || !contrasena_nueva) {
    return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
  }
  if (String(contrasena_nueva).length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const [rows] = await db.promise().query(
      'SELECT contrasena FROM super_admin WHERE id_admin = ?',
      [req.admin.id_admin]
    );
    if (!rows.length) return res.status(404).json({ error: 'Administrador no encontrado' });

    const coincide = await bcrypt.compare(String(contrasena_actual), rows[0].contrasena);
    if (!coincide) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    const hash = await bcrypt.hash(String(contrasena_nueva), 10);
    await db.promise().query(
      'UPDATE super_admin SET contrasena = ? WHERE id_admin = ?',
      [hash, req.admin.id_admin]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin/perfil/password]', err);
    return res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

module.exports = { getPerfil, updatePerfil, updatePassword };
