const db = require('../config/db');
const { esCorreoValido } = require('../utils/validarCorreo');

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

  if (correo_recuperacion !== undefined && correo_recuperacion?.trim() && !esCorreoValido(correo_recuperacion.trim())) {
    return res.status(400).json({ error: 'El correo de recuperación no es válido' });
  }

  try {
    const fields = [];
    const values = [];

    if (celular !== undefined) { fields.push('celular = ?'); values.push(celular?.trim() || null); }
    if (correo_recuperacion !== undefined) { fields.push('correo_recuperacion = ?'); values.push(correo_recuperacion?.trim() || null); }

    if (fields.length > 0) {
      values.push(req.user.id_usuario);
      await db.promise().query(
        `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`,
        values
      );
    }

    const [rows] = await db.promise().query(
      `SELECT ${CAMPOS_PERFIL} FROM usuario WHERE id_usuario = ?`,
      [req.user.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ usuario: rows[0] });
  } catch (err) {
    console.error('[perfil/update]', err);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

module.exports = { getPerfil, updatePerfil };
