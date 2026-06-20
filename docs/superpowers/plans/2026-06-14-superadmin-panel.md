# Panel SuperAdmin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el panel SuperAdmin completo — backend (`/api/admin/*`) y app React separada (`frontend-admin/`) — para gestionar empresas, planes, suscripciones y pagos del sistema multi-tenant SIS-AGRO.

**Architecture:** El backend Node.js/Express existente recibe nuevas rutas `/api/admin/*` protegidas por `adminAuthMiddleware` (JWT firmado con `ADMIN_JWT_SECRET` separado). El frontend admin es una app Vite+React+Tailwind independiente en `frontend-admin/`, puerto 5174, con paleta indigo (distinta al verde del app principal).

**Tech Stack:** Node.js, Express, MariaDB (mysql2), bcrypt, jsonwebtoken — Vite 5, React 18, Tailwind CSS v4, React Router v6, Axios

**Constraint:** NO hacer commits — el usuario los hace manualmente.

---

## Mapa de archivos

### Backend (modificar/crear)
- Modify: `backend/app.js` — agregar CORS 5174 y montar `/api/admin`
- Modify: `backend/.env` — agregar `ADMIN_JWT_SECRET`
- Create: `backend/middlewares/adminAuthMiddleware.js`
- Create: `backend/controllers/admin/auth.Controller.js`
- Create: `backend/controllers/admin/dashboard.Controller.js`
- Create: `backend/controllers/admin/empresas.Controller.js`
- Create: `backend/controllers/admin/planes.Controller.js`
- Create: `backend/controllers/admin/suscripciones.Controller.js`
- Create: `backend/controllers/admin/pagos.Controller.js`
- Create: `backend/routes/admin/index.js`
- Create: `backend/routes/admin/auth.Routes.js`
- Create: `backend/routes/admin/dashboard.Routes.js`
- Create: `backend/routes/admin/empresas.Routes.js`
- Create: `backend/routes/admin/planes.Routes.js`
- Create: `backend/routes/admin/suscripciones.Routes.js`
- Create: `backend/routes/admin/pagos.Routes.js`

### Frontend Admin (todo nuevo)
- Create: `frontend-admin/package.json`
- Create: `frontend-admin/vite.config.js`
- Create: `frontend-admin/index.html`
- Create: `frontend-admin/src/main.jsx`
- Create: `frontend-admin/src/App.jsx`
- Create: `frontend-admin/src/api/adminApi.js`
- Create: `frontend-admin/src/contexts/AdminAuthContext.jsx`
- Create: `frontend-admin/src/contexts/ThemeContext.jsx`
- Create: `frontend-admin/src/components/AdminProtectedRoute.jsx`
- Create: `frontend-admin/src/components/AdminLayout.jsx`
- Create: `frontend-admin/src/components/AdminSidebar.jsx`
- Create: `frontend-admin/src/pages/Login.jsx`
- Create: `frontend-admin/src/pages/Dashboard.jsx`
- Create: `frontend-admin/src/pages/Empresas.jsx`
- Create: `frontend-admin/src/pages/Planes.jsx`
- Create: `frontend-admin/src/pages/Suscripciones.jsx`
- Create: `frontend-admin/src/pages/Pagos.jsx`

---

## Task 1: Backend — env y adminAuthMiddleware

**Files:**
- Modify: `backend/.env`
- Modify: `backend/.env.example`
- Create: `backend/middlewares/adminAuthMiddleware.js`

- [ ] **Step 1: Agregar ADMIN_JWT_SECRET al .env**

Abrir `backend/.env` y agregar al final:
```
# SuperAdmin JWT (secret DIFERENTE al JWT_SECRET de usuarios normales)
ADMIN_JWT_SECRET=superadmin_secret_cambiar_en_produccion_2026
```

Abrir `backend/.env.example` y agregar al final:
```
# SuperAdmin JWT
ADMIN_JWT_SECRET=
```

- [ ] **Step 2: Crear adminAuthMiddleware.js**

Crear `backend/middlewares/adminAuthMiddleware.js`:
```js
const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin_secret');
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
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { adminAuthMiddleware };
```

- [ ] **Step 3: Verificar que el backend arranca sin errores**

```bash
cd backend && node -e "require('./middlewares/adminAuthMiddleware'); console.log('OK')"
```
Expected: `OK`

---

## Task 2: Backend — Auth Controller y Routes

**Files:**
- Create: `backend/controllers/admin/auth.Controller.js`
- Create: `backend/routes/admin/auth.Routes.js`

- [ ] **Step 1: Crear directorio controllers/admin**

```bash
mkdir -p backend/controllers/admin
mkdir -p backend/routes/admin
```

- [ ] **Step 2: Crear auth.Controller.js**

Crear `backend/controllers/admin/auth.Controller.js`:
```js
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
```

- [ ] **Step 3: Crear auth.Routes.js**

Crear `backend/routes/admin/auth.Routes.js`:
```js
const router = require('express').Router();
const { login } = require('../../controllers/admin/auth.Controller');

router.post('/login', login);

module.exports = router;
```

- [ ] **Step 4: Verificar sintaxis**

```bash
cd backend && node -e "require('./controllers/admin/auth.Controller'); console.log('OK')"
```
Expected: `OK`

---

## Task 3: Backend — Dashboard Controller y Routes

**Files:**
- Create: `backend/controllers/admin/dashboard.Controller.js`
- Create: `backend/routes/admin/dashboard.Routes.js`

- [ ] **Step 1: Crear dashboard.Controller.js**

Crear `backend/controllers/admin/dashboard.Controller.js`:
```js
const db = require('../../config/db');

const getDashboard = async (req, res) => {
  try {
    const [[{ empresas_total }]] = await db.promise().query(
      'SELECT COUNT(*) AS empresas_total FROM empresa'
    );
    const [[{ empresas_activas }]] = await db.promise().query(
      'SELECT COUNT(*) AS empresas_activas FROM empresa WHERE activo = 1'
    );
    const [[{ suscripciones_activas }]] = await db.promise().query(
      "SELECT COUNT(*) AS suscripciones_activas FROM suscripcion WHERE estado IN ('ACTIVA','PRUEBA')"
    );
    const [[{ por_vencer_7dias }]] = await db.promise().query(
      `SELECT COUNT(*) AS por_vencer_7dias FROM suscripcion
       WHERE estado = 'ACTIVA' AND fecha_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );
    const [[{ ingresos_mes }]] = await db.promise().query(
      `SELECT COALESCE(SUM(monto), 0) AS ingresos_mes FROM pago_suscripcion
       WHERE estado = 'PAGADO' AND MONTH(fecha_pago) = MONTH(NOW()) AND YEAR(fecha_pago) = YEAR(NOW())`
    );
    const [distribucion_planes] = await db.promise().query(
      `SELECT p.nombre AS plan, COUNT(s.id_suscripcion) AS cantidad
       FROM suscripcion s
       JOIN plan p ON p.id_plan = s.id_plan
       WHERE s.estado IN ('ACTIVA','PRUEBA')
       GROUP BY p.id_plan, p.nombre
       ORDER BY p.id_plan`
    );

    return res.json({
      empresas_total,
      empresas_activas,
      suscripciones_activas,
      por_vencer_7dias,
      ingresos_mes: parseFloat(ingresos_mes).toFixed(2),
      distribucion_planes,
    });
  } catch (err) {
    console.error('[admin/dashboard]', err);
    return res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

module.exports = { getDashboard };
```

- [ ] **Step 2: Crear dashboard.Routes.js**

Crear `backend/routes/admin/dashboard.Routes.js`:
```js
const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { getDashboard } = require('../../controllers/admin/dashboard.Controller');

router.use(adminAuthMiddleware);
router.get('/', getDashboard);

module.exports = router;
```

- [ ] **Step 3: Verificar sintaxis**

```bash
cd backend && node -e "require('./controllers/admin/dashboard.Controller'); console.log('OK')"
```
Expected: `OK`

---

## Task 4: Backend — Empresas Controller y Routes

**Files:**
- Create: `backend/controllers/admin/empresas.Controller.js`
- Create: `backend/routes/admin/empresas.Routes.js`

- [ ] **Step 1: Crear empresas.Controller.js**

Crear `backend/controllers/admin/empresas.Controller.js`:
```js
const db = require('../../config/db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT e.*,
              s.id_suscripcion, s.estado AS sus_estado, s.fecha_fin,
              p.nombre AS plan_nombre
       FROM empresa e
       LEFT JOIN suscripcion s ON s.id_empresa = e.id_empresa
         AND s.estado IN ('ACTIVA','PRUEBA')
         AND s.fecha_fin = (
           SELECT MAX(s2.fecha_fin) FROM suscripcion s2
           WHERE s2.id_empresa = e.id_empresa AND s2.estado IN ('ACTIVA','PRUEBA')
         )
       LEFT JOIN plan p ON p.id_plan = s.id_plan
       ORDER BY e.creado_en DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin/empresas listar]', err);
    return res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

const crear = async (req, res) => {
  const { nombre, nit, direccion, ciudad, telefono, correo } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [result] = await db.promise().query(
      'INSERT INTO empresa (nombre, nit, direccion, ciudad, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre.trim(), nit || null, direccion || null, ciudad || null, telefono || null, correo || null]
    );
    const id_empresa = result.insertId;

    // Crear suscripción PRUEBA automáticamente (plan 1 = PRUEBA, 7 días)
    await db.promise().query(
      `INSERT INTO suscripcion (id_empresa, id_plan, ciclo, estado, fecha_inicio, fecha_fin)
       VALUES (?, 1, 'MENSUAL', 'PRUEBA', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY))`,
      [id_empresa]
    );

    return res.status(201).json({ mensaje: 'Empresa creada con suscripción de prueba', id_empresa });
  } catch (err) {
    console.error('[admin/empresas crear]', err);
    return res.status(500).json({ error: 'Error al crear empresa' });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, direccion, ciudad, telefono, correo } = req.body ?? {};
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [existing] = await db.promise().query(
      'SELECT id_empresa FROM empresa WHERE id_empresa = ?', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });

    await db.promise().query(
      'UPDATE empresa SET nombre=?, nit=?, direccion=?, ciudad=?, telefono=?, correo=? WHERE id_empresa=?',
      [nombre.trim(), nit || null, direccion || null, ciudad || null, telefono || null, correo || null, id]
    );
    return res.json({ mensaje: 'Empresa actualizada' });
  } catch (err) {
    console.error('[admin/empresas editar]', err);
    return res.status(500).json({ error: 'Error al actualizar empresa' });
  }
};

const toggle = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query(
      'SELECT activo FROM empresa WHERE id_empresa = ?', [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    const nuevo = rows[0].activo ? 0 : 1;
    await db.promise().query('UPDATE empresa SET activo = ? WHERE id_empresa = ?', [nuevo, id]);
    return res.json({ mensaje: `Empresa ${nuevo ? 'activada' : 'desactivada'}`, activo: nuevo });
  } catch (err) {
    console.error('[admin/empresas toggle]', err);
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

module.exports = { listar, crear, editar, toggle };
```

- [ ] **Step 2: Crear empresas.Routes.js**

Crear `backend/routes/admin/empresas.Routes.js`:
```js
const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const ctrl = require('../../controllers/admin/empresas.Controller');

router.use(adminAuthMiddleware);
router.get('/',           ctrl.listar);
router.post('/',          ctrl.crear);
router.put('/:id',        ctrl.editar);
router.patch('/:id/toggle', ctrl.toggle);

module.exports = router;
```

- [ ] **Step 3: Verificar sintaxis**

```bash
cd backend && node -e "require('./controllers/admin/empresas.Controller'); console.log('OK')"
```
Expected: `OK`

---

## Task 5: Backend — Planes Controller y Routes

**Files:**
- Create: `backend/controllers/admin/planes.Controller.js`
- Create: `backend/routes/admin/planes.Routes.js`

- [ ] **Step 1: Crear planes.Controller.js**

Crear `backend/controllers/admin/planes.Controller.js`:
```js
const db = require('../../config/db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM plan ORDER BY id_plan ASC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin/planes listar]', err);
    return res.status(500).json({ error: 'Error al obtener planes' });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const { precio_mensual, precio_anual, max_sucursales, max_usuarios, max_productos, modulos } = req.body ?? {};

  try {
    const [existing] = await db.promise().query(
      'SELECT id_plan FROM plan WHERE id_plan = ?', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });

    await db.promise().query(
      `UPDATE plan SET precio_mensual=?, precio_anual=?, max_sucursales=?,
       max_usuarios=?, max_productos=?, modulos=? WHERE id_plan=?`,
      [
        parseFloat(precio_mensual) || 0,
        parseFloat(precio_anual)   || 0,
        parseInt(max_sucursales)   || 1,
        parseInt(max_usuarios)     || 1,
        max_productos != null ? parseInt(max_productos) : null,
        JSON.stringify(modulos || []),
        id,
      ]
    );
    return res.json({ mensaje: 'Plan actualizado' });
  } catch (err) {
    console.error('[admin/planes editar]', err);
    return res.status(500).json({ error: 'Error al actualizar plan' });
  }
};

module.exports = { listar, editar };
```

- [ ] **Step 2: Crear planes.Routes.js**

Crear `backend/routes/admin/planes.Routes.js`:
```js
const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { listar, editar } = require('../../controllers/admin/planes.Controller');

router.use(adminAuthMiddleware);
router.get('/',     listar);
router.put('/:id',  editar);

module.exports = router;
```

- [ ] **Step 3: Verificar sintaxis**

```bash
cd backend && node -e "require('./controllers/admin/planes.Controller'); console.log('OK')"
```
Expected: `OK`

---

## Task 6: Backend — Suscripciones Controller y Routes

**Files:**
- Create: `backend/controllers/admin/suscripciones.Controller.js`
- Create: `backend/routes/admin/suscripciones.Routes.js`

- [ ] **Step 1: Crear suscripciones.Controller.js**

Crear `backend/controllers/admin/suscripciones.Controller.js`:
```js
const db = require('../../config/db');

const listar = async (req, res) => {
  const { id_empresa, estado } = req.query;
  const where  = [];
  const params = [];

  if (id_empresa) { where.push('s.id_empresa = ?'); params.push(id_empresa); }
  if (estado)     { where.push('s.estado = ?');      params.push(estado); }

  const sql = `
    SELECT s.*, e.nombre AS empresa_nombre, p.nombre AS plan_nombre
    FROM suscripcion s
    JOIN empresa e ON e.id_empresa = s.id_empresa
    JOIN plan    p ON p.id_plan    = s.id_plan
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY s.creado_en DESC
  `;

  try {
    const [rows] = await db.promise().query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('[admin/suscripciones listar]', err);
    return res.status(500).json({ error: 'Error al obtener suscripciones' });
  }
};

const crear = async (req, res) => {
  const { id_empresa, id_plan, ciclo, fecha_inicio } = req.body ?? {};
  if (!id_empresa || !id_plan || !ciclo || !fecha_inicio) {
    return res.status(400).json({ error: 'id_empresa, id_plan, ciclo y fecha_inicio son requeridos' });
  }
  if (!['MENSUAL','ANUAL'].includes(ciclo)) {
    return res.status(400).json({ error: 'ciclo debe ser MENSUAL o ANUAL' });
  }

  try {
    // Calcular fecha_fin
    const intervalo = ciclo === 'ANUAL' ? 'INTERVAL 1 YEAR' : 'INTERVAL 1 MONTH';
    const [[{ fecha_fin }]] = await db.promise().query(
      `SELECT DATE_ADD(?, ${intervalo}) AS fecha_fin`, [fecha_inicio]
    );

    // Cancelar suscripciones activas anteriores de esta empresa
    await db.promise().query(
      `UPDATE suscripcion SET estado = 'CANCELADA'
       WHERE id_empresa = ? AND estado IN ('ACTIVA','PRUEBA')`,
      [id_empresa]
    );

    const [result] = await db.promise().query(
      `INSERT INTO suscripcion (id_empresa, id_plan, ciclo, estado, fecha_inicio, fecha_fin)
       VALUES (?, ?, ?, 'ACTIVA', ?, ?)`,
      [id_empresa, id_plan, ciclo, fecha_inicio, fecha_fin]
    );

    return res.status(201).json({ mensaje: 'Suscripción creada', id_suscripcion: result.insertId, fecha_fin });
  } catch (err) {
    console.error('[admin/suscripciones crear]', err);
    return res.status(500).json({ error: 'Error al crear suscripción' });
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { fecha_fin, estado } = req.body ?? {};

  try {
    const [existing] = await db.promise().query(
      'SELECT id_suscripcion FROM suscripcion WHERE id_suscripcion = ?', [id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Suscripción no encontrada' });

    const sets  = [];
    const vals  = [];
    if (fecha_fin) { sets.push('fecha_fin = ?'); vals.push(fecha_fin); }
    if (estado)    {
      if (!['PRUEBA','ACTIVA','VENCIDA','CANCELADA'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      sets.push('estado = ?'); vals.push(estado);
    }
    if (sets.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

    vals.push(id);
    await db.promise().query(`UPDATE suscripcion SET ${sets.join(', ')} WHERE id_suscripcion = ?`, vals);
    return res.json({ mensaje: 'Suscripción actualizada' });
  } catch (err) {
    console.error('[admin/suscripciones actualizar]', err);
    return res.status(500).json({ error: 'Error al actualizar suscripción' });
  }
};

module.exports = { listar, crear, actualizar };
```

- [ ] **Step 2: Crear suscripciones.Routes.js**

Crear `backend/routes/admin/suscripciones.Routes.js`:
```js
const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const ctrl = require('../../controllers/admin/suscripciones.Controller');

router.use(adminAuthMiddleware);
router.get('/',     ctrl.listar);
router.post('/',    ctrl.crear);
router.put('/:id',  ctrl.actualizar);

module.exports = router;
```

- [ ] **Step 3: Verificar sintaxis**

```bash
cd backend && node -e "require('./controllers/admin/suscripciones.Controller'); console.log('OK')"
```
Expected: `OK`

---

## Task 7: Backend — Pagos Controller y Routes

**Files:**
- Create: `backend/controllers/admin/pagos.Controller.js`
- Create: `backend/routes/admin/pagos.Routes.js`

- [ ] **Step 1: Crear pagos.Controller.js**

Crear `backend/controllers/admin/pagos.Controller.js`:
```js
const db = require('../../config/db');

const listar = async (req, res) => {
  const { id_empresa, estado } = req.query;
  const where  = [];
  const params = [];

  if (id_empresa) { where.push('e.id_empresa = ?'); params.push(id_empresa); }
  if (estado)     { where.push('ps.estado = ?');     params.push(estado); }

  const sql = `
    SELECT ps.*, e.nombre AS empresa_nombre, p.nombre AS plan_nombre
    FROM pago_suscripcion ps
    JOIN suscripcion s ON s.id_suscripcion = ps.id_suscripcion
    JOIN empresa     e ON e.id_empresa     = s.id_empresa
    JOIN plan        p ON p.id_plan        = s.id_plan
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ps.creado_en DESC
  `;

  try {
    const [rows] = await db.promise().query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('[admin/pagos listar]', err);
    return res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

const registrar = async (req, res) => {
  const { id_suscripcion, monto, referencia, notas } = req.body ?? {};
  if (!id_suscripcion || !monto) {
    return res.status(400).json({ error: 'id_suscripcion y monto son requeridos' });
  }
  if (parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
  }

  try {
    const [susRows] = await db.promise().query(
      'SELECT id_suscripcion FROM suscripcion WHERE id_suscripcion = ?', [id_suscripcion]
    );
    if (susRows.length === 0) return res.status(404).json({ error: 'Suscripción no encontrada' });

    const [result] = await db.promise().query(
      `INSERT INTO pago_suscripcion (id_suscripcion, monto, referencia, estado, fecha_pago, notas)
       VALUES (?, ?, ?, 'PAGADO', NOW(), ?)`,
      [id_suscripcion, parseFloat(monto), referencia || null, notas || null]
    );

    return res.status(201).json({ mensaje: 'Pago registrado', id_pago: result.insertId });
  } catch (err) {
    console.error('[admin/pagos registrar]', err);
    return res.status(500).json({ error: 'Error al registrar pago' });
  }
};

module.exports = { listar, registrar };
```

- [ ] **Step 2: Crear pagos.Routes.js**

Crear `backend/routes/admin/pagos.Routes.js`:
```js
const router = require('express').Router();
const { adminAuthMiddleware } = require('../../middlewares/adminAuthMiddleware');
const { listar, registrar } = require('../../controllers/admin/pagos.Controller');

router.use(adminAuthMiddleware);
router.get('/',  listar);
router.post('/', registrar);

module.exports = router;
```

- [ ] **Step 3: Verificar sintaxis**

```bash
cd backend && node -e "require('./controllers/admin/pagos.Controller'); console.log('OK')"
```
Expected: `OK`

---

## Task 8: Backend — Routes index y app.js

**Files:**
- Create: `backend/routes/admin/index.js`
- Modify: `backend/app.js`

- [ ] **Step 1: Crear routes/admin/index.js**

Crear `backend/routes/admin/index.js`:
```js
const router = require('express').Router();

router.use('/auth',           require('./auth.Routes'));
router.use('/dashboard',      require('./dashboard.Routes'));
router.use('/empresas',       require('./empresas.Routes'));
router.use('/planes',         require('./planes.Routes'));
router.use('/suscripciones',  require('./suscripciones.Routes'));
router.use('/pagos',          require('./pagos.Routes'));

module.exports = router;
```

- [ ] **Step 2: Modificar backend/app.js — agregar CORS 5174 y montar rutas admin**

En `backend/app.js`, en el array `corsOptions.origin` agregar `'http://localhost:5174'`:
```js
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',                                    // ← admin frontend
    'https://atm-zoo-measurements-newspapers.trycloudflare.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};
```

Al final de los `app.use('/api/...')`, agregar antes del bloque del servidor:
```js
app.use('/api/admin', require('./routes/admin'));
```

- [ ] **Step 3: Verificar que el backend arranca sin errores**

```bash
cd backend && node -e "require('./app'); console.log('app cargada OK')" 2>&1 | head -5
```
Expected: líneas de log normales sin errores de sintaxis.

- [ ] **Step 4: Probar el login del admin con curl**

Primero asegurarse de que el backend está corriendo (`npm run dev` o `node app.js`). Luego:

```bash
curl -s -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@sisagro.bo","contrasena":"SuperAdmin2026!"}' | head -c 200
```
Expected: JSON con `token` y `admin.nombre`.

> Nota: La contraseña en la migración es `SuperAdmin2026!`. Si el hash no está actualizado en la BD, ejecutar primero:
> ```
> node -e "require('bcrypt').hash('SuperAdmin2026!',10).then(console.log)"
> ```
> Y actualizar la BD: `UPDATE super_admin SET contrasena='<hash>' WHERE id_admin=1;`

---

## Task 9: Frontend-Admin — Scaffolding del proyecto

**Files:**
- Create: `frontend-admin/package.json`
- Create: `frontend-admin/vite.config.js`
- Create: `frontend-admin/index.html`
- Create: `frontend-admin/.gitignore`

- [ ] **Step 1: Crear package.json**

Crear `frontend-admin/package.json`:
```json
{
  "name": "frontend-admin",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "vite build",
    "preview": "vite preview --port 5174"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "axios": "^1.13.5",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "tailwindcss": "^4.1.18"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "vite": "^7.3.1"
  }
}
```

- [ ] **Step 2: Crear vite.config.js**

Crear `frontend-admin/vite.config.js`:
```js
import { defineConfig } from 'vite';
import react       from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
});
```

- [ ] **Step 3: Crear index.html**

Crear `frontend-admin/index.html`:
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SIS-AGRO Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Crear .gitignore**

Crear `frontend-admin/.gitignore`:
```
node_modules
dist
.env
```

- [ ] **Step 5: Instalar dependencias**

```bash
cd frontend-admin && npm install
```
Expected: instalación exitosa, carpeta `node_modules` creada.

- [ ] **Step 6: Crear estructura de carpetas**

```bash
mkdir -p frontend-admin/src/api
mkdir -p frontend-admin/src/contexts
mkdir -p frontend-admin/src/components
mkdir -p frontend-admin/src/pages
```

---

## Task 10: Frontend-Admin — API client y Contextos

**Files:**
- Create: `frontend-admin/src/api/adminApi.js`
- Create: `frontend-admin/src/contexts/AdminAuthContext.jsx`
- Create: `frontend-admin/src/contexts/ThemeContext.jsx`

- [ ] **Step 1: Crear adminApi.js**

Crear `frontend-admin/src/api/adminApi.js`:
```js
import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:3000/api/admin',
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default adminApi;
```

- [ ] **Step 2: Crear AdminAuthContext.jsx**

Crear `frontend-admin/src/contexts/AdminAuthContext.jsx`:
```jsx
import { createContext, useContext, useState, useCallback } from 'react';
import adminApi from '../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState(null);

  const login = useCallback(async (correo, contrasena) => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await adminApi.post('/auth/login', { correo, contrasena });
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user',  JSON.stringify(data.admin));
      setAdmin(data.admin);
      return data.admin;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, cargando, error }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
```

- [ ] **Step 3: Crear ThemeContext.jsx**

Crear `frontend-admin/src/contexts/ThemeContext.jsx`:
```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('admin_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('admin_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## Task 11: Frontend-Admin — Componentes de Layout

**Files:**
- Create: `frontend-admin/src/components/AdminProtectedRoute.jsx`
- Create: `frontend-admin/src/components/AdminSidebar.jsx`
- Create: `frontend-admin/src/components/AdminLayout.jsx`

- [ ] **Step 1: Crear AdminProtectedRoute.jsx**

Crear `frontend-admin/src/components/AdminProtectedRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { admin } = useAdminAuth();
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}
```

- [ ] **Step 2: Crear AdminSidebar.jsx**

Crear `frontend-admin/src/components/AdminSidebar.jsx`:
```jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme }     from '../contexts/ThemeContext';

const NAV = [
  { to: '/dashboard',     label: 'Dashboard',      icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { to: '/empresas',      label: 'Empresas',       icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  )},
  { to: '/planes',        label: 'Planes',         icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
  )},
  { to: '/suscripciones', label: 'Suscripciones',  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  )},
  { to: '/pagos',         label: 'Pagos',          icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  )},
];

export default function AdminSidebar({ porVencer = 0 }) {
  const { admin, logout } = useAdminAuth();
  const { dark, toggle }  = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen
                      bg-white dark:bg-zinc-900
                      border-r border-gray-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
          SIS-AGRO Admin
        </span>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
          title={dark ? 'Modo claro' : 'Modo oscuro'}
        >
          {dark
            ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
            : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-100'
               }`
            }
          >
            {icon}
            <span>{label}</span>
            {to === '/suscripciones' && porVencer > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {porVencer}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-800">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{admin?.nombre}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 truncate mb-2">{admin?.correo}</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Crear AdminLayout.jsx**

Crear `frontend-admin/src/components/AdminLayout.jsx`:
```jsx
import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import adminApi    from '../api/adminApi';

export default function AdminLayout({ children }) {
  const [porVencer, setPorVencer] = useState(0);

  useEffect(() => {
    adminApi.get('/dashboard')
      .then(({ data }) => setPorVencer(data.por_vencer_7dias || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
      <AdminSidebar porVencer={porVencer} />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## Task 12: Frontend-Admin — Login Page

**Files:**
- Create: `frontend-admin/src/pages/Login.jsx`

- [ ] **Step 1: Crear Login.jsx**

Crear `frontend-admin/src/pages/Login.jsx`:
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function Login() {
  const [correo,    setCorreo]    = useState('');
  const [contrasena,setContrasena]= useState('');
  const [mostrar,   setMostrar]   = useState(false);
  const { login, cargando, error } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) return;
    try {
      await login(correo.trim(), contrasena);
      navigate('/dashboard', { replace: true });
    } catch { /* error ya en contexto */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold text-indigo-400 tracking-tight">SIS-AGRO</span>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Panel de Administración</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
              placeholder="admin@sisagro.bo"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              <button
                type="button"
                onClick={() => setMostrar(m => !m)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {mostrar
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={cargando || !correo || !contrasena}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors mt-2"
          >
            {cargando ? 'Autenticando...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## Task 13: Frontend-Admin — Dashboard Page

**Files:**
- Create: `frontend-admin/src/pages/Dashboard.jsx`

- [ ] **Step 1: Crear Dashboard.jsx**

Crear `frontend-admin/src/pages/Dashboard.jsx`:
```jsx
import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

function KpiCard({ label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    green:  'bg-green-50  dark:bg-green-500/10  text-green-600  dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    red:    'bg-red-50    dark:bg-red-500/10    text-red-600    dark:text-red-400',
    gray:   'bg-gray-50   dark:bg-zinc-800      text-gray-700   dark:text-gray-300',
  };
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-extrabold ${colors[color]}`}>{value ?? '—'}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    adminApi.get('/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="text-gray-500 dark:text-gray-400 text-sm">Cargando...</div>;
  if (!data)    return <div className="text-red-500 text-sm">Error al cargar dashboard</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Empresas Activas"      value={data.empresas_activas}      color="green" />
        <KpiCard label="Suscripciones Activas" value={data.suscripciones_activas} color="indigo" />
        <KpiCard label="Por Vencer (7d)"       value={data.por_vencer_7dias}      color="red" />
        <KpiCard label="Ingresos del Mes"      value={`Bs ${data.ingresos_mes}`}  color="yellow" />
        <KpiCard label="Total Empresas"        value={data.empresas_total}        color="gray" />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Distribución por Plan</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-zinc-800">
              <th className="pb-2 text-left font-semibold">Plan</th>
              <th className="pb-2 text-right font-semibold">Empresas</th>
            </tr>
          </thead>
          <tbody>
            {data.distribucion_planes.map(row => (
              <tr key={row.plan} className="border-b border-gray-50 dark:border-zinc-800/50">
                <td className="py-2 font-medium text-gray-700 dark:text-gray-300">{row.plan}</td>
                <td className="py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">{row.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Task 14: Frontend-Admin — Empresas Page

**Files:**
- Create: `frontend-admin/src/pages/Empresas.jsx`

- [ ] **Step 1: Crear Empresas.jsx**

Crear `frontend-admin/src/pages/Empresas.jsx`:
```jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';

const ESTADO_COLORS = {
  ACTIVA:    'bg-green-100  dark:bg-green-500/10  text-green-700  dark:text-green-400',
  PRUEBA:    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  VENCIDA:   'bg-red-100    dark:bg-red-500/10    text-red-700    dark:text-red-400',
  CANCELADA: 'bg-gray-100   dark:bg-zinc-700      text-gray-600   dark:text-gray-400',
};

const EMPTY_FORM = { nombre: '', nit: '', direccion: '', ciudad: '', telefono: '', correo: '' };

export default function Empresas() {
  const [empresas,  setEmpresas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(null); // null | 'crear' | empresa object
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);
  const [err,       setErr]       = useState('');
  const navigate = useNavigate();

  const cargar = useCallback(() => {
    setCargando(true);
    adminApi.get('/empresas')
      .then(({ data }) => setEmpresas(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => { setForm(EMPTY_FORM); setErr(''); setModal('crear'); };
  const abrirEditar = (e) => {
    setForm({ nombre: e.nombre, nit: e.nit || '', direccion: e.direccion || '',
              ciudad: e.ciudad || '', telefono: e.telefono || '', correo: e.correo || '' });
    setErr('');
    setModal(e);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      if (modal === 'crear') {
        await adminApi.post('/empresas', form);
      } else {
        await adminApi.put(`/empresas/${modal.id_empresa}`, form);
      }
      setModal(null);
      cargar();
    } catch (er) {
      setErr(er.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (empresa) => {
    try {
      await adminApi.patch(`/empresas/${empresa.id_empresa}/toggle`);
      cargar();
    } catch { alert('Error al cambiar estado'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Empresas</h1>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Empresa
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                {['Nombre', 'NIT', 'Ciudad', 'Plan', 'Suscripción', 'Vence', 'Activo', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {empresas.map(e => (
                <tr key={e.id_empresa} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{e.nombre}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{e.nit || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{e.ciudad || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{e.plan_nombre || '—'}</td>
                  <td className="px-4 py-3">
                    {e.sus_estado
                      ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_COLORS[e.sus_estado]}`}>{e.sus_estado}</span>
                      : <span className="text-gray-400 text-xs">Sin suscripción</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{e.fecha_fin || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.activo ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400'}`}>
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => abrirEditar(e)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Editar</button>
                      <button onClick={() => navigate(`/suscripciones?empresa=${e.id_empresa}`)} className="text-xs text-gray-500 dark:text-gray-400 hover:underline font-medium">Suscripciones</button>
                      <button onClick={() => toggleActivo(e)} className={`text-xs font-medium hover:underline ${e.activo ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                        {e.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {empresas.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">Sin empresas registradas</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">
              {modal === 'crear' ? 'Nueva Empresa' : `Editar: ${modal.nombre}`}
            </h2>
            {err && <div className="text-red-500 text-xs mb-3 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">{err}</div>}
            <form onSubmit={guardar} className="space-y-3">
              {[
                { key: 'nombre',    label: 'Nombre *',   type: 'text',  req: true },
                { key: 'nit',       label: 'NIT',        type: 'text',  req: false },
                { key: 'direccion', label: 'Dirección',  type: 'text',  req: false },
                { key: 'ciudad',    label: 'Ciudad',     type: 'text',  req: false },
                { key: 'telefono',  label: 'Teléfono',   type: 'text',  req: false },
                { key: 'correo',    label: 'Correo',     type: 'email', req: false },
              ].map(({ key, label, type, req }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={req}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Task 15: Frontend-Admin — Planes Page

**Files:**
- Create: `frontend-admin/src/pages/Planes.jsx`

- [ ] **Step 1: Crear Planes.jsx**

Crear `frontend-admin/src/pages/Planes.jsx`:
```jsx
import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const PLAN_COLORS = ['indigo', 'green', 'yellow', 'purple'];
const BG = ['bg-indigo-50 dark:bg-indigo-500/10', 'bg-green-50 dark:bg-green-500/10',
            'bg-yellow-50 dark:bg-yellow-500/10', 'bg-purple-50 dark:bg-purple-500/10'];

export default function Planes() {
  const [planes,   setPlanes]   = useState([]);
  const [edits,    setEdits]    = useState({});
  const [saving,   setSaving]   = useState({});
  const [msgs,     setMsgs]     = useState({});

  useEffect(() => {
    adminApi.get('/planes').then(({ data }) => {
      setPlanes(data);
      const init = {};
      data.forEach(p => {
        init[p.id_plan] = {
          precio_mensual: p.precio_mensual,
          precio_anual:   p.precio_anual,
          max_sucursales: p.max_sucursales,
          max_usuarios:   p.max_usuarios,
          max_productos:  p.max_productos ?? '',
          modulos:        Array.isArray(p.modulos) ? p.modulos.join(', ') : (p.modulos ?? ''),
        };
      });
      setEdits(init);
    }).catch(console.error);
  }, []);

  const change = (id, field, val) => setEdits(e => ({ ...e, [id]: { ...e[id], [field]: val } }));

  const guardar = async (plan) => {
    const id = plan.id_plan;
    setSaving(s => ({ ...s, [id]: true }));
    setMsgs(m => ({ ...m, [id]: '' }));
    try {
      const body = {
        ...edits[id],
        modulos: edits[id].modulos.split(',').map(m => m.trim()).filter(Boolean),
        max_productos: edits[id].max_productos !== '' ? parseInt(edits[id].max_productos) : null,
      };
      await adminApi.put(`/planes/${id}`, body);
      setMsgs(m => ({ ...m, [id]: 'Guardado ✓' }));
      setTimeout(() => setMsgs(m => ({ ...m, [id]: '' })), 2000);
    } catch (er) {
      setMsgs(m => ({ ...m, [id]: er.response?.data?.error || 'Error' }));
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Planes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {planes.map((plan, i) => {
          const e = edits[plan.id_plan] || {};
          return (
            <div key={plan.id_plan} className={`rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 ${BG[i % 4]} bg-opacity-50`}>
              <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100 mb-4">{plan.nombre}</h2>
              <div className="space-y-3">
                {[
                  { label: 'Precio mensual (Bs)', field: 'precio_mensual', type: 'number' },
                  { label: 'Precio anual (Bs)',   field: 'precio_anual',   type: 'number' },
                  { label: 'Max sucursales (0=∞)',field: 'max_sucursales', type: 'number' },
                  { label: 'Max usuarios (0=∞)',  field: 'max_usuarios',   type: 'number' },
                  { label: 'Max productos (vacío=∞)', field: 'max_productos', type: 'number' },
                  { label: 'Módulos (separados por coma)', field: 'modulos', type: 'text' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                    <input
                      type={type}
                      value={e[field] ?? ''}
                      onChange={ev => change(plan.id_plan, field, ev.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => guardar(plan)}
                  disabled={saving[plan.id_plan]}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {saving[plan.id_plan] ? 'Guardando...' : 'Guardar'}
                </button>
                {msgs[plan.id_plan] && (
                  <span className={`text-xs font-medium ${msgs[plan.id_plan].includes('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {msgs[plan.id_plan]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Task 16: Frontend-Admin — Suscripciones Page

**Files:**
- Create: `frontend-admin/src/pages/Suscripciones.jsx`

- [ ] **Step 1: Crear Suscripciones.jsx**

Crear `frontend-admin/src/pages/Suscripciones.jsx`:
```jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../api/adminApi';

const ESTADO_COLORS = {
  ACTIVA:    'bg-green-100  dark:bg-green-500/10  text-green-700  dark:text-green-400',
  PRUEBA:    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  VENCIDA:   'bg-red-100    dark:bg-red-500/10    text-red-700    dark:text-red-400',
  CANCELADA: 'bg-gray-100   dark:bg-zinc-700      text-gray-600   dark:text-gray-400',
};

export default function Suscripciones() {
  const [searchParams] = useSearchParams();
  const [suscripciones, setSuscripciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [planes,   setPlanes]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState(searchParams.get('empresa') || '');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [modal,    setModal]    = useState(null); // null | 'nueva' | { type: 'extender'|'cancelar', sus }
  const [form,     setForm]     = useState({ id_empresa: '', id_plan: '', ciclo: 'MENSUAL', fecha_inicio: new Date().toISOString().split('T')[0] });
  const [extFecha, setExtFecha] = useState('');
  const [guardando,setGuardando]= useState(false);
  const [err,      setErr]      = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.get('/empresas'),
      adminApi.get('/planes'),
    ]).then(([eRes, pRes]) => {
      setEmpresas(eRes.data);
      setPlanes(pRes.data);
    }).catch(console.error);
  }, []);

  const cargar = useCallback(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroEmpresa) params.set('id_empresa', filtroEmpresa);
    if (filtroEstado)  params.set('estado', filtroEstado);
    adminApi.get(`/suscripciones?${params}`)
      .then(({ data }) => setSuscripciones(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [filtroEmpresa, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const crearSuscripcion = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      await adminApi.post('/suscripciones', form);
      setModal(null);
      cargar();
    } catch (er) { setErr(er.response?.data?.error || 'Error'); }
    finally { setGuardando(false); }
  };

  const extender = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      await adminApi.put(`/suscripciones/${modal.sus.id_suscripcion}`, { fecha_fin: extFecha });
      setModal(null);
      cargar();
    } catch (er) { setErr(er.response?.data?.error || 'Error'); }
    finally { setGuardando(false); }
  };

  const cancelar = async (sus) => {
    if (!confirm(`¿Cancelar suscripción de ${sus.empresa_nombre}?`)) return;
    try {
      await adminApi.put(`/suscripciones/${sus.id_suscripcion}`, { estado: 'CANCELADA' });
      cargar();
    } catch { alert('Error al cancelar'); }
  };

  const selectClass = "px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Suscripciones</h1>
        <button
          onClick={() => { setForm({ id_empresa: '', id_plan: '', ciclo: 'MENSUAL', fecha_inicio: new Date().toISOString().split('T')[0] }); setErr(''); setModal('nueva'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Suscripción
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} className={selectClass}>
          <option value="">Todas las empresas</option>
          {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={selectClass}>
          <option value="">Todos los estados</option>
          {['PRUEBA','ACTIVA','VENCIDA','CANCELADA'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                {['Empresa','Plan','Ciclo','Estado','Inicio','Fin','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {suscripciones.map(s => (
                <tr key={s.id_suscripcion} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{s.empresa_nombre}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.plan_nombre}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{s.ciclo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_COLORS[s.estado]}`}>{s.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{s.fecha_inicio}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{s.fecha_fin}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setExtFecha(s.fecha_fin); setErr(''); setModal({ type: 'extender', sus: s }); }} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Extender</button>
                      {s.estado !== 'CANCELADA' && (
                        <button onClick={() => cancelar(s)} className="text-xs text-red-500 hover:underline font-medium">Cancelar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {suscripciones.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Sin suscripciones</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nueva suscripción */}
      {modal === 'nueva' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Nueva Suscripción</h2>
            {err && <div className="text-red-500 text-xs mb-3 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">{err}</div>}
            <form onSubmit={crearSuscripcion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Empresa *</label>
                <select value={form.id_empresa} onChange={e => setForm(f => ({ ...f, id_empresa: e.target.value }))} required className={selectClass + ' w-full'}>
                  <option value="">Seleccionar...</option>
                  {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Plan *</label>
                <select value={form.id_plan} onChange={e => setForm(f => ({ ...f, id_plan: e.target.value }))} required className={selectClass + ' w-full'}>
                  <option value="">Seleccionar...</option>
                  {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ciclo *</label>
                <select value={form.ciclo} onChange={e => setForm(f => ({ ...f, ciclo: e.target.value }))} className={selectClass + ' w-full'}>
                  <option value="MENSUAL">MENSUAL</option>
                  <option value="ANUAL">ANUAL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fecha inicio *</label>
                <input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} required className={selectClass + ' w-full'} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-400">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold">{guardando ? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal extender */}
      {modal?.type === 'extender' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Extender: {modal.sus.empresa_nombre}</h2>
            {err && <div className="text-red-500 text-xs mb-3">{err}</div>}
            <form onSubmit={extender} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nueva fecha fin *</label>
                <input type="date" value={extFecha} onChange={e => setExtFecha(e.target.value)} required className={selectClass + ' w-full'} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-400">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold">{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Task 17: Frontend-Admin — Pagos Page

**Files:**
- Create: `frontend-admin/src/pages/Pagos.jsx`

- [ ] **Step 1: Crear Pagos.jsx**

Crear `frontend-admin/src/pages/Pagos.jsx`:
```jsx
import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';

const ESTADO_COLORS = {
  PAGADO:   'bg-green-100  dark:bg-green-500/10  text-green-700  dark:text-green-400',
  PENDIENTE:'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  FALLIDO:  'bg-red-100    dark:bg-red-500/10    text-red-700    dark:text-red-400',
};

export default function Pagos() {
  const [pagos,    setPagos]    = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [suscripciones, setSuscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ id_suscripcion: '', monto: '', referencia: '', notas: '' });
  const [guardando,setGuardando]= useState(false);
  const [err,      setErr]      = useState('');

  useEffect(() => {
    adminApi.get('/empresas').then(({ data }) => setEmpresas(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!filtroEmpresa) { setSuscripciones([]); return; }
    adminApi.get(`/suscripciones?id_empresa=${filtroEmpresa}`)
      .then(({ data }) => setSuscripciones(data))
      .catch(console.error);
  }, [filtroEmpresa]);

  const cargar = useCallback(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroEmpresa) params.set('id_empresa', filtroEmpresa);
    if (filtroEstado)  params.set('estado', filtroEstado);
    adminApi.get(`/pagos?${params}`)
      .then(({ data }) => setPagos(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [filtroEmpresa, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      await adminApi.post('/pagos', {
        ...form,
        monto: parseFloat(form.monto),
      });
      setModal(false);
      cargar();
    } catch (er) { setErr(er.response?.data?.error || 'Error'); }
    finally { setGuardando(false); }
  };

  const selectClass = "px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50";

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pagos</h1>
        <button
          onClick={() => { setForm({ id_suscripcion: '', monto: '', referencia: '', notas: '' }); setErr(''); setModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Registrar Pago Manual
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} className={selectClass}>
          <option value="">Todas las empresas</option>
          {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={selectClass}>
          <option value="">Todos los estados</option>
          {['PAGADO','PENDIENTE','FALLIDO'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                {['Empresa','Plan','Monto','Referencia','Estado','Fecha','Notas'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {pagos.map(p => (
                <tr key={p.id_pago} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{p.empresa_nombre}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.plan_nombre}</td>
                  <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-200">Bs {parseFloat(p.monto).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.referencia || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_COLORS[p.estado]}`}>{p.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{fmtFecha(p.fecha_pago)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{p.notas || '—'}</td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Sin pagos registrados</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Registrar Pago Manual</h2>
            {err && <div className="text-red-500 text-xs mb-3 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">{err}</div>}
            <form onSubmit={registrar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Empresa</label>
                <select
                  value={filtroEmpresa}
                  onChange={e => setFiltroEmpresa(e.target.value)}
                  className={selectClass + ' w-full'}
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Suscripción *</label>
                <select value={form.id_suscripcion} onChange={e => setForm(f => ({ ...f, id_suscripcion: e.target.value }))} required className={selectClass + ' w-full'}>
                  <option value="">Seleccionar...</option>
                  {suscripciones.map(s => <option key={s.id_suscripcion} value={s.id_suscripcion}>{s.plan_nombre} — {s.estado} ({s.fecha_fin})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Monto (Bs) *</label>
                <input type="number" step="0.01" min="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required className={selectClass + ' w-full'} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Referencia</label>
                <input type="text" value={form.referencia} onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))} placeholder="TRF-20260614" className={selectClass + ' w-full'} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Notas</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} className={selectClass + ' w-full resize-none'} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-400">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold">{guardando ? 'Guardando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Task 18: Frontend-Admin — main.jsx y App.jsx

**Files:**
- Create: `frontend-admin/src/main.jsx`
- Create: `frontend-admin/src/App.jsx`

- [ ] **Step 1: Crear main.jsx**

Crear `frontend-admin/src/main.jsx`:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 2: Crear index.css** (necesaria para Tailwind v4)

Crear `frontend-admin/src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 3: Crear App.jsx**

Crear `frontend-admin/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider }     from './contexts/ThemeContext';
import AdminProtectedRoute   from './components/AdminProtectedRoute';
import AdminLayout           from './components/AdminLayout';

import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Empresas       from './pages/Empresas';
import Planes         from './pages/Planes';
import Suscripciones  from './pages/Suscripciones';
import Pagos          from './pages/Pagos';

function PageRoute({ children }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminAuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard"     element={<PageRoute><Dashboard /></PageRoute>} />
            <Route path="/empresas"      element={<PageRoute><Empresas /></PageRoute>} />
            <Route path="/planes"        element={<PageRoute><Planes /></PageRoute>} />
            <Route path="/suscripciones" element={<PageRoute><Suscripciones /></PageRoute>} />
            <Route path="/pagos"         element={<PageRoute><Pagos /></PageRoute>} />
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AdminAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Arrancar el frontend-admin y verificar**

```bash
cd frontend-admin && npm run dev
```
Expected: `Local: http://localhost:5174/`

Abrir `http://localhost:5174/login` en el navegador. Debe mostrar la pantalla de login con fondo oscuro, logo "SIS-AGRO" y campos de correo/contraseña.

- [ ] **Step 5: Probar login completo**

Con el backend corriendo, ingresar con `admin@sisagro.bo` / `SuperAdmin2026!`.
Expected: redirige a `/dashboard` y muestra los KPIs.

- [ ] **Step 6: Verificar sidebar y navegación**

Navegar a `/empresas`, `/planes`, `/suscripciones`, `/pagos`.
Expected: cada sección carga su tabla correctamente. El toggle de tema cambia entre light/dark.

---

## Checklist de verificación final

- [ ] `POST /api/admin/auth/login` retorna token válido
- [ ] `GET /api/admin/dashboard` retorna KPIs (requiere token)
- [ ] `GET /api/admin/empresas` retorna lista con suscripción activa
- [ ] `POST /api/admin/empresas` crea empresa + suscripción PRUEBA
- [ ] `GET /api/admin/planes` retorna los 4 planes
- [ ] `PUT /api/admin/planes/:id` actualiza precios y límites
- [ ] `GET /api/admin/suscripciones` filtra por empresa y estado
- [ ] `POST /api/admin/suscripciones` cancela anterior y crea nueva
- [ ] `GET /api/admin/pagos` retorna historial
- [ ] `POST /api/admin/pagos` registra pago manual
- [ ] Token de usuario normal rechazado en rutas `/api/admin/*`
- [ ] Frontend admin corre en puerto 5174
- [ ] Login redirige a dashboard
- [ ] Logout limpia localStorage y redirige a `/login`
- [ ] Modo dark/light funciona y persiste en localStorage
- [ ] Badge de vencimientos en sidebar aparece si `por_vencer_7dias > 0`
- [ ] Filtro de empresa en suscripciones funciona con `?empresa=ID` en la URL
