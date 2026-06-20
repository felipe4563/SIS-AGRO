# Panel SuperAdmin — Diseño

## Contexto

SIS-AGRO es un sistema agropecuario multi-tenant (Node.js + React + MariaDB).
Cada cliente es una "empresa" con su propia suscripción a un plan.
El panel SuperAdmin permite al dueño del sistema gestionar empresas, planes, suscripciones y pagos desde una app completamente separada.

---

## Decisiones de diseño

| Decisión | Elección | Razón |
|---|---|---|
| Separación del frontend | App React independiente (`frontend-admin/`) | Mayor seguridad e isolamiento |
| Auth | Login simple correo+contraseña, JWT propio | 2FA se agrega en fase posterior |
| Backend | Rutas nuevas `/api/admin/*` en el mismo backend | Un solo backend, sin duplicar config de BD |
| Tema | Light + Dark mode (igual que app principal) | Preferencia del usuario |
| Paleta | Indigo como acento (vs verde del app principal) | Distinción visual clara entre apps |

---

## Arquitectura

```
SIS-AGRO/
├── backend/
│   ├── middlewares/
│   │   └── adminAuthMiddleware.js     ← JWT verificado contra ADMIN_JWT_SECRET
│   ├── controllers/admin/
│   │   ├── auth.Controller.js
│   │   ├── dashboard.Controller.js
│   │   ├── empresas.Controller.js
│   │   ├── planes.Controller.js
│   │   ├── suscripciones.Controller.js
│   │   └── pagos.Controller.js
│   └── routes/admin/
│       ├── index.js                   ← monta todas las rutas admin
│       ├── auth.Routes.js
│       ├── dashboard.Routes.js
│       ├── empresas.Routes.js
│       ├── planes.Routes.js
│       ├── suscripciones.Routes.js
│       └── pagos.Routes.js
│
└── frontend-admin/
    ├── package.json                   ← Vite + React + Tailwind, puerto 5174
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                    ← rutas: /login, /dashboard, /empresas,
        │                                /planes, /suscripciones, /pagos
        ├── api/
        │   └── adminApi.js            ← axios instance con baseURL=/api/admin y JWT header
        ├── contexts/
        │   └── AdminAuthContext.jsx   ← guarda JWT en localStorage('admin_token')
        ├── components/
        │   ├── AdminLayout.jsx        ← sidebar + main content
        │   ├── AdminSidebar.jsx       ← nav items + badge vencimientos
        │   ├── AdminProtectedRoute.jsx
        │   └── ThemeToggle.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Empresas.jsx
            ├── Planes.jsx
            ├── Suscripciones.jsx
            └── Pagos.jsx
```

---

## Backend

### Variable de entorno nueva

```env
ADMIN_JWT_SECRET=<secret diferente al JWT_SECRET normal>
```

### Middleware: `adminAuthMiddleware.js`

- Extrae Bearer token del header `Authorization`
- Verifica con `ADMIN_JWT_SECRET`
- Requiere que el payload contenga `rol: 'super_admin'`
- En caso de error retorna `401 { error: 'No autorizado' }`
- Expone `req.admin = { id_admin, nombre, correo, rol }`

### Montaje en `index.js`

```js
app.use('/api/admin', require('./routes/admin'));
```

Las rutas `/api/admin/*` NO usan el `authMiddleware` de usuario normal.

---

### Endpoints

#### Auth — `POST /api/admin/auth/login`
- Body: `{ correo, contrasena }`
- Busca en `super_admin` WHERE correo = ? AND activo = 1
- Verifica bcrypt
- Actualiza `ultimo_acceso = NOW()`
- Retorna: `{ token, admin: { id_admin, nombre, correo } }`
- Token expira en 8h
- Errores: 401 si credenciales inválidas, 403 si cuenta inactiva

#### Dashboard — `GET /api/admin/dashboard`
Requiere `adminAuthMiddleware`. Retorna:
```json
{
  "empresas_activas": 12,
  "empresas_total": 15,
  "suscripciones_activas": 11,
  "por_vencer_7dias": 2,
  "ingresos_mes": "4560.00",
  "distribucion_planes": [
    { "plan": "PRUEBA", "cantidad": 3 },
    { "plan": "BASICO", "cantidad": 4 },
    { "plan": "ESTANDAR", "cantidad": 3 },
    { "plan": "PREMIUM", "cantidad": 1 }
  ]
}
```

#### Empresas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/empresas` | Lista todas con suscripción activa (JOIN) |
| POST | `/api/admin/empresas` | Crea empresa + suscripción PRUEBA (7d, plan 1) automáticamente |
| PUT | `/api/admin/empresas/:id` | Edita nombre, nit, dirección, ciudad, teléfono, correo |
| PATCH | `/api/admin/empresas/:id/toggle` | Activa/desactiva (`activo = 0/1`, nunca DELETE) |

GET lista retorna por empresa:
```json
{
  "id_empresa": 2,
  "nombre": "Agro San Pedro",
  "nit": "1234567",
  "ciudad": "Cochabamba",
  "activo": 1,
  "suscripcion": {
    "id_suscripcion": 3,
    "plan": "BASICO",
    "estado": "ACTIVA",
    "fecha_fin": "2026-12-14"
  }
}
```

#### Planes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/planes` | Lista los 4 planes con todos sus campos |
| PUT | `/api/admin/planes/:id` | Edita precio_mensual, precio_anual, max_sucursales, max_usuarios, max_productos, modulos |

No se crean ni eliminan planes — los 4 son fijos.

#### Suscripciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/suscripciones` | Lista con filtro `?id_empresa=` y `?estado=` |
| POST | `/api/admin/suscripciones` | Crea nueva suscripción para una empresa |
| PUT | `/api/admin/suscripciones/:id` | Actualiza estado o extiende fecha_fin |

POST body:
```json
{ "id_empresa": 2, "id_plan": 3, "ciclo": "MENSUAL", "fecha_inicio": "2026-06-14" }
```
La `fecha_fin` se calcula automáticamente (MENSUAL +1 mes, ANUAL +1 año).
El estado de la suscripción anterior de esa empresa pasa a CANCELADA.

PUT body (extender):
```json
{ "fecha_fin": "2026-09-14" }
```
PUT body (cambiar estado):
```json
{ "estado": "CANCELADA" }
```

#### Pagos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/pagos` | Lista con filtro `?id_empresa=` y `?estado=` |
| POST | `/api/admin/pagos` | Registra pago manual |

POST body:
```json
{
  "id_suscripcion": 3,
  "monto": 220.00,
  "referencia": "TRF-20260614",
  "notas": "Pago por transferencia"
}
```
Al registrar pago manual el estado se guarda como `PAGADO` y `fecha_pago = NOW()`.

---

## Frontend Admin (`frontend-admin/`)

### Stack
- Vite 5 + React 18 + Tailwind CSS 3
- React Router v6
- Axios (instancia `adminApi.js` con interceptor de JWT)
- Puerto dev: **5174**

### Tema
- Light + Dark mode via clase `dark` en `<html>` (igual que app principal)
- Toggle en header del sidebar
- Paleta acento: **indigo** (`indigo-600` / `indigo-500`)
- Fondo light: `gray-100` / Dark: `zinc-950`
- Cards light: `white` / Dark: `zinc-900`

### AdminAuthContext
- Guarda `admin_token` en `localStorage`
- Expone `{ admin, token, login, logout, isAuthenticated }`
- `login(correo, contrasena)` → llama `POST /api/admin/auth/login`, guarda token
- `logout()` → limpia localStorage, redirige a `/login`
- Al iniciar: decodifica token (sin verificar firma, solo para UI) para recuperar sesión

### AdminProtectedRoute
- Si no hay token → `<Navigate to="/login" />`
- Si hay token → renderiza children

### App.jsx — Rutas

```
/login                  → Login.jsx (sin layout)
/dashboard              → Dashboard.jsx (con AdminLayout)
/empresas               → Empresas.jsx
/planes                 → Planes.jsx
/suscripciones          → Suscripciones.jsx (acepta ?empresa=ID para filtrar)
/pagos                  → Pagos.jsx
/                       → <Navigate to="/dashboard" />
*                       → <Navigate to="/dashboard" />
```

### AdminSidebar
- Logo "SIS-AGRO Admin" en la parte superior
- Items: Dashboard, Empresas, Planes, Suscripciones (+ badge rojo si hay `por_vencer_7dias > 0`), Pagos
- Pie: nombre del admin logueado + botón Cerrar Sesión
- Toggle de tema (light/dark) en el header

### Páginas

#### Login.jsx
- Fondo oscuro siempre (independiente del tema)
- Card centrada con logo, campos correo y contraseña, botón "Ingresar"
- Muestra error si credenciales inválidas

#### Dashboard.jsx
- 5 KPI cards: Empresas Activas, Suscripciones Activas, Por Vencer (7d), Ingresos del Mes, Total Empresas
- Tabla debajo: distribución de empresas por plan

#### Empresas.jsx
- Tabla: Nombre, NIT, Ciudad, Plan Actual, Estado Suscripción, Fecha Vencimiento, Activo
- Badge color por estado suscripción: PRUEBA=amarillo, ACTIVA=verde, VENCIDA=rojo, CANCELADA=gris
- Botón "Nueva Empresa" → modal con campos: nombre*, nit, dirección, ciudad, teléfono, correo
- Acciones por fila: Editar (modal), Ver Suscripciones (link a /suscripciones?empresa=ID), Activar/Desactivar

#### Planes.jsx
- 4 cards (una por plan), layout 2x2
- Cada card muestra y permite editar: precio mensual, precio anual, max_sucursales, max_usuarios, max_productos, módulos (lista de chips)
- Botón "Guardar" por card individualmente

#### Suscripciones.jsx
- Filtro por empresa (select) y estado (select)
- Tabla: Empresa, Plan, Ciclo, Estado, Fecha Inicio, Fecha Fin
- Badge color por estado
- Botón "Nueva Suscripción" → modal: selecciona empresa, plan, ciclo (MENSUAL/ANUAL), fecha inicio
- Acciones por fila: Extender (modal: nueva fecha_fin), Cancelar (confirm)

#### Pagos.jsx
- Filtro por empresa y estado
- Tabla: Empresa, Monto, Referencia, Estado, Fecha Pago, Notas
- Botón "Registrar Pago Manual" → modal: selecciona suscripción, monto, referencia, notas

---

## Base de datos

No se requieren migraciones adicionales. Las tablas ya fueron creadas en `migracion_multitenant.sql`:
- `super_admin` — usuarios del panel
- `empresa` — clientes del sistema
- `plan` — 4 planes fijos
- `suscripcion` — vínculo empresa-plan
- `pago_suscripcion` — historial de pagos

---

## Seguridad

- JWT SuperAdmin firmado con `ADMIN_JWT_SECRET` (distinto de `JWT_SECRET`)
- `adminAuthMiddleware` verifica `rol === 'super_admin'` — rechaza tokens de usuario normal aunque sean válidos
- No existe endpoint de registro público de super_admin — se crean directamente en BD
- Frontend admin en puerto separado (5174 dev, dominio separado en prod)
- No hay CORS compartido entre app principal y app admin
