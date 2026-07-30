const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { enviarCodigoRecuperacion } = require('./mailer.service');

const EXPIRA_MIN   = 10;
const MAX_INTENTOS = 5;

function hashSha256(valor) {
  return crypto.createHash('sha256').update(String(valor)).digest('hex');
}

function generarCodigo() {
  // 6 dígitos, siempre en el rango 100000-999999 (nunca con cero a la izquierda "perdido")
  return String(crypto.randomInt(100000, 1000000));
}

// tipoCuenta SIEMPRE viene fijo desde el controller ('usuario' | 'super_admin'),
// nunca de req.body — por eso es seguro interpolarlo en el nombre de tabla/columna.
function tablaYColumna(tipoCuenta) {
  return tipoCuenta === 'usuario'
    ? { tabla: 'usuario', columnaId: 'id_usuario' }
    : { tabla: 'super_admin', columnaId: 'id_admin' };
}

async function solicitarCodigo({ tipoCuenta, idCuenta, correoRecuperacion, nombre }) {
  const conn = await db.promise().getConnection();
  let codigo;
  try {
    await conn.beginTransaction();

    // Invalidar cualquier código anterior sin usar de esta cuenta —
    // nunca deben coexistir dos códigos vigentes.
    await conn.query(
      `UPDATE password_reset SET usado = 1 WHERE tipo_cuenta = ? AND id_cuenta = ? AND usado = 0`,
      [tipoCuenta, idCuenta]
    );

    codigo = generarCodigo();
    const expiraEn = new Date(Date.now() + EXPIRA_MIN * 60 * 1000);
    await conn.query(
      `INSERT INTO password_reset (tipo_cuenta, id_cuenta, codigo_hash, expira_en) VALUES (?, ?, ?, ?)`,
      [tipoCuenta, idCuenta, hashSha256(codigo), expiraEn]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // El código ya quedó guardado; si el envío de correo falla, se propaga el
  // error pero el código sigue disponible en base (permite soporte manual).
  await enviarCodigoRecuperacion(correoRecuperacion, codigo, nombre);
}

async function verificarCodigo({ tipoCuenta, idCuenta, codigo }) {
  const [rows] = await db.promise().query(
    `SELECT id_reset, codigo_hash, intentos FROM password_reset
     WHERE tipo_cuenta = ? AND id_cuenta = ? AND usado = 0 AND expira_en > NOW()
     ORDER BY creado_en DESC LIMIT 1`,
    [tipoCuenta, idCuenta]
  );

  const fallar = () => {
    const err = new Error('Código inválido o expirado');
    err.status = 400;
    throw err;
  };

  if (rows.length === 0) fallar();
  const fila = rows[0];

  if (fila.intentos >= MAX_INTENTOS) {
    await db.promise().query(`UPDATE password_reset SET usado = 1 WHERE id_reset = ?`, [fila.id_reset]);
    fallar();
  }

  if (hashSha256(codigo) !== fila.codigo_hash) {
    await db.promise().query(`UPDATE password_reset SET intentos = intentos + 1 WHERE id_reset = ?`, [fila.id_reset]);
    fallar();
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await db.promise().query(
    `UPDATE password_reset SET reset_token_hash = ? WHERE id_reset = ?`,
    [hashSha256(resetToken), fila.id_reset]
  );

  return resetToken;
}

async function restablecer({ tipoCuenta, resetToken, nuevaContrasena }) {
  const [rows] = await db.promise().query(
    `SELECT id_reset, id_cuenta FROM password_reset
     WHERE tipo_cuenta = ? AND reset_token_hash = ? AND usado = 0 AND expira_en > NOW()
     LIMIT 1`,
    [tipoCuenta, hashSha256(resetToken)]
  );

  if (rows.length === 0) {
    const err = new Error('El código de restablecimiento es inválido o expiró');
    err.status = 400;
    throw err;
  }

  const fila = rows[0];
  const { tabla, columnaId } = tablaYColumna(tipoCuenta);
  const hash = await bcrypt.hash(String(nuevaContrasena), 10);

  await db.promise().query(
    `UPDATE \`${tabla}\` SET contrasena = ? WHERE \`${columnaId}\` = ?`,
    [hash, fila.id_cuenta]
  );
  await db.promise().query(`UPDATE password_reset SET usado = 1 WHERE id_reset = ?`, [fila.id_reset]);
}

module.exports = { solicitarCodigo, verificarCodigo, restablecer };
