require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

// ── Rutas ─────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.Routes');
const rolesRoutes       = require('./routes/roles.Routes');
const usuariosRoutes    = require('./routes/usuarios.Routes');
const sucursalesRoutes  = require('./routes/sucursales.Routes');
const catalogosRoutes   = require('./routes/catalogos.Routes');
const productosRoutes   = require('./routes/productos.Routes');
const clientesRoutes    = require('./routes/clientes.Routes');
const proveedoresRoutes = require('./routes/proveedores.Routes');
const comprasRoutes     = require('./routes/compras.Routes');
const almacenRoutes     = require('./routes/almacen.Routes');
const ventasRoutes      = require('./routes/ventas.Routes');
const cajaRoutes        = require('./routes/caja.Routes');
const reportesRoutes    = require('./routes/reportes.Routes');
const backupRoutes      = require('./routes/backup.Routes');
const configuracionRoutes = require('./routes/configuracion.Routes');
const movimientosRoutes          = require('./routes/movimientos.Routes');
const categoriasMovimientoRoutes = require('./routes/categoriasMovimiento.Routes');
const webhookRoutes              = require('./routes/webhook.Routes');
const setupRoutes                = require('./routes/setup.Routes');
const creditosRoutes             = require('./routes/creditos.Routes');
const mezclasRoutes              = require('./routes/mezclas.Routes');
const perfilRoutes               = require('./routes/perfil.Routes');
const { iniciarScheduler } = require('./services/backup.service');
const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://atm-zoo-measurements-newspapers.trycloudflare.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.set('trust proxy', 1); // confiar en X-Forwarded-Proto del proxy HTTPS
app.use(cors(corsOptions));

// El webhook de CodePay necesita el body como Buffer para verificar la firma.
// Se registra ANTES del parser JSON global para que express.raw() lo procese primero.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Archivos estáticos (imágenes de productos) ────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ── Rutas API ─────────────────────────────────────────────────────────────
app.use('/api/auth',authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/almacen', almacenRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/backups',  backupRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/movimientos',           movimientosRoutes);
app.use('/api/categorias-movimiento', categoriasMovimientoRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/setup', setupRoutes);
app.use('/api/creditos', creditosRoutes);
app.use('/api/mezclas',  mezclasRoutes);

// ── Servidor ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Conectado a la base de datos MySQL`);
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    iniciarScheduler();
  });
}

module.exports = app;