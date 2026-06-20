const fs   = require('fs');
const path = require('path');
const db   = require('../config/db');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

function buildLogoUrl(req, logoPath, creado_en) {
  if (!logoPath) return null;
  const ts = creado_en ? new Date(creado_en).getTime() : Date.now();
  return `${req.protocol}://${req.get('host')}${logoPath}?v=${ts}`;
}

function eliminarLogoAnterior(id_empresa) {
  try {
    fs.readdirSync(UPLOADS_DIR)
      .filter(f => f.startsWith(`config-logo-${id_empresa}.`))
      .forEach(f => fs.unlinkSync(path.join(UPLOADS_DIR, f)));
  } catch { /* silencioso */ }
}

const obtener = async (req, res) => {
  const id_empresa = req.user?.id_empresa;
  if (!id_empresa) return res.status(401).json({ error: 'Token sin empresa asignada — vuelve a iniciar sesión' });
  try {
    const [rows] = await db.promise().query(
      `SELECT e.id_empresa, e.nombre AS nombre_empresa, e.nit, e.direccion,
              e.ciudad, e.telefono, e.correo, e.logo, e.creado_en,
              p.nombre AS plan_nombre
       FROM empresa e
       LEFT JOIN suscripcion s ON s.id_empresa = e.id_empresa AND s.estado IN ('ACTIVA','PRUEBA')
       LEFT JOIN plan p ON p.id_plan = s.id_plan
       WHERE e.id_empresa = ?
       LIMIT 1`,
      [id_empresa]
    );
    if (rows.length === 0) {
      return res.json({
        nombre_empresa: 'SIS-AGRO',
        nit: null, direccion: null, ciudad: null,
        telefono: null, correo: null, logo: null, plan_nombre: null,
      });
    }
    const config = { ...rows[0], logo: buildLogoUrl(req, rows[0].logo, rows[0].creado_en) };
    return res.json(config);
  } catch (err) {
    console.error('[obtener]', err);
    return res.status(500).json({ error: 'Error al obtener la configuración' });
  }
};

const actualizar = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre_empresa, nit, direccion, ciudad, telefono, correo, logo } = req.body;

  if (!nombre_empresa || !nombre_empresa.trim()) {
    return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });
  }

  let logoPath = null;

  if (logo && logo.startsWith('data:image/')) {
    const matches = logo.match(/^data:image\/(\w+);base64,(.+)$/s);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de logo inválido' });
    }
    const rawExt   = matches[1];
    const ext      = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const b64Data  = matches[2];
    const sizeBytes = Math.ceil(b64Data.length * 3 / 4);
    if (sizeBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'El logo supera el tamaño máximo permitido (5 MB)' });
    }
    eliminarLogoAnterior(id_empresa);
    const filename = `config-logo-${id_empresa}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(b64Data, 'base64'));
    logoPath = `/uploads/${filename}`;

  } else if (logo && logo.startsWith('http')) {
    try {
      logoPath = new URL(logo).pathname;
    } catch {
      logoPath = null;
    }

  } else {
    eliminarLogoAnterior(id_empresa);
    logoPath = null;
  }

  try {
    await db.promise().query(
      `UPDATE empresa
       SET nombre=?, nit=?, direccion=?, ciudad=?, telefono=?, correo=?, logo=?
       WHERE id_empresa=?`,
      [
        nombre_empresa.trim(),
        nit       || null,
        direccion || null,
        ciudad    || null,
        telefono  || null,
        correo    || null,
        logoPath,
        id_empresa,
      ]
    );
    const [rows] = await db.promise().query(
      'SELECT id_empresa, nombre AS nombre_empresa, nit, direccion, ciudad, telefono, correo, logo, creado_en FROM empresa WHERE id_empresa = ?',
      [id_empresa]
    );
    const config = { ...rows[0], logo: buildLogoUrl(req, rows[0].logo, rows[0].creado_en) };
    return res.json(config);
  } catch (err) {
    console.error('[actualizar]', err);
    return res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
};

module.exports = { obtener, actualizar };
