const db = require('../config/db');

const CAMPOS_PERFIL = 'id_usuario, nombre, apellido, correo, celular, correo_recuperacion';

const getPerfil = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT ${CAMPOS_PERFIL} FROM usuario WHERE id_usuario = ?`,
      [req.user.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[perfil/get]', err);
    return res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

const updatePerfil = async (req, res) => {
  const { celular, correo_recuperacion } = req.body ?? {};
  try {
    await db.promise().query(
      'UPDATE usuario SET celular = ?, correo_recuperacion = ? WHERE id_usuario = ?',
      [celular?.trim() || null, correo_recuperacion?.trim() || null, req.user.id_usuario]
    );
    const [rows] = await db.promise().query(
      `SELECT ${CAMPOS_PERFIL} FROM usuario WHERE id_usuario = ?`,
      [req.user.id_usuario]
    );
    return res.json({ usuario: rows[0] });
  } catch (err) {
    console.error('[perfil/update]', err);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

module.exports = { getPerfil, updatePerfil };
