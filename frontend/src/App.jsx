import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './contexts/AuthContext';
import { AbilityProvider } from './contexts/AbilityContext';
import { ThemeProvider }   from './contexts/ThemeContext';
import { ConfigProvider }  from './contexts/ConfigContext';
import ProtectedRoute      from './components/ProtectedRoute';
import Sidebar             from './components/sidebar';
import PwaPrompt           from './components/PwaPrompt';

// ── Pages ────────────────────────────────────────────────────────────────
import Login        from './pages/Login';
import RecuperarContrasena from './pages/RecuperarContrasena';
import SinPermiso   from './pages/SinPermiso';
import Dashboard    from './pages/Dashboard';
import Roles        from './pages/roles/Roles';
import Usuarios       from './pages/usuarios/Usuarios';
import Sucursales     from './pages/sucursales/Sucursales';
import Productos      from './pages/productos/Productos';
import Catalogos      from './pages/catalogos/Catalogos';
import Clientes       from './pages/clientes/Clientes';
import Proveedores    from './pages/proveedores/Proveedores';
import Compras        from './pages/compras/Compras';
import NuevaCompra    from './pages/compras/NuevaCompra';
import Almacen             from './pages/almacen/Almacen';
import ImportarInventario  from './pages/almacen/ImportarInventario';
import HistorialVentas from './pages/ventas/HistorialVentas';
import NuevaVenta     from './pages/ventas/NuevaVenta';
import VentaTicket    from './pages/ventas/VentaTicket';
import Caja           from './pages/caja/Caja';
import LayoutReportes from './pages/reportes/LayoutReportes';
import Backups        from './pages/backups/Backups';
import Configuracion from './pages/configuracion/Configuracion';
import LibroCaja from './pages/libroCaja/LibroCaja';
import LayoutCreditos from './pages/creditos/LayoutCreditos';
import Mezclas        from './pages/mezclas/Mezclas';

// Nota: Reportes/Órdenes de salida aún no están integrados aquí.

// ── Layout con Sidebar ───────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden
                    bg-gray-100  dark:bg-zinc-950
                    transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto
                       bg-gray-100  dark:bg-zinc-950
                       transition-colors duration-300">
        <div className="pt-16 px-4 sm:px-6 py-4 sm:py-6 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Rutas protegidas reutilizables ───────────────────────────────────────
// Agrupa ProtectedRoute + AppLayout para no repetir estructura
function PageRoute({ action, subject, children }) {
  return (
    <ProtectedRoute action={action} subject={subject}>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}

// ── App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ConfigProvider>
        <AbilityProvider>
          {/* Notificaciones PWA: offline banner, update prompt, ready toast */}
          <PwaPrompt />
          <Routes>

            {/* ── Rutas públicas ──────────────────────────────────────── */}
            <Route path="/login"       element={<Login />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/sin-permiso" element={<SinPermiso />} />

            {/* ── Roles y permisos ────────────────────────────────────── */}
            <Route path="/roles" element={
              <PageRoute action="ver" subject="roles">
                <Roles />
              </PageRoute>
            }/>

            {/* ── Usuarios ───────────────────────────────────────────── */}
            <Route path="/usuarios" element={
              <PageRoute action="ver" subject="usuarios">
                <Usuarios />
              </PageRoute>
            }/>

            {/* ── Sucursales ───────────────────────────────────────────── */}
            <Route path="/sucursales" element={
              <PageRoute action="ver" subject="sucursales">
                <Sucursales />
              </PageRoute>
            }/>

            {/* ── Productos ────────────────────────────────────────────── */}
            <Route path="/productos" element={
              <PageRoute action="ver" subject="productos">
                <Productos />
              </PageRoute>
            }/>

            {/* ── Catálogos ────────────────────────────────────────────── */}
            <Route path="/catalogos" element={
              <PageRoute anyPermission={[
                { action: 'ver', subject: 'clasificaciones' },
                { action: 'ver', subject: 'marcas'          },
                { action: 'ver', subject: 'unidades'        },
                { action: 'ver', subject: 'conversiones'    },
              ]}>
                <Catalogos />
              </PageRoute>
            }/>

            {/* ── Clientes ─────────────────────────────────────────────── */}
            <Route path="/clientes" element={
              <PageRoute action="ver" subject="clientes">
                <Clientes />
              </PageRoute>
            }/>

            {/* ── Proveedores ──────────────────────────────────────────── */}
            <Route path="/proveedores" element={
              <PageRoute action="ver" subject="proveedores">
                <Proveedores />
              </PageRoute>
            }/>

            {/* ── Compras ────────────────────────────────────────────── */}
            <Route path="/compras" element={
              <PageRoute action="ver" subject="compras">
                <Compras />
              </PageRoute>
            }/>
            <Route path="/compras/nueva" element={
              <PageRoute action="crear" subject="compras">
                <NuevaCompra />
              </PageRoute>
            }/>

            {/* ── Almacén ────────────────────────────────────────────── */}
            <Route path="/almacen" element={
              <PageRoute action="ver" subject="almacen">
                <Almacen />
              </PageRoute>
            }/>
            <Route path="/almacen/importar" element={
              <PageRoute action="importar" subject="almacen">
                <ImportarInventario />
              </PageRoute>
            }/>

            {/* ── Ventas (POS) ───────────────────────────────────────── */}
            <Route path="/ventas" element={
              <PageRoute action="ver" subject="ventas">
                <HistorialVentas />
              </PageRoute>
            }/>
            <Route path="/ventas/nueva" element={
              <PageRoute action="crear" subject="ventas">
                <NuevaVenta />
              </PageRoute>
            }/>
            {/* Sin AppLayout: página full-screen para impresión 80mm */}
            <Route path="/ventas/:id/ticket" element={
              <ProtectedRoute action="ver" subject="ventas">
                <VentaTicket />
              </ProtectedRoute>
            }/>

            {/* ── Caja ───────────────────────────────────────────────── */}
            <Route path="/caja" element={
              <PageRoute action="ver" subject="caja">
                <Caja />
              </PageRoute>
            }/>

            {/* ── Reportes ───────────────────────────────────────────── */}
            {/* No existe 'reportes.ver' en BD; acceso si tiene cualquier permiso de reportes */}
            <Route path="/reportes" element={
              <ProtectedRoute anyPermission={[
                { action: 'ventas_diarias',        subject: 'reportes' },
                { action: 'ventas_rango',          subject: 'reportes' },
                { action: 'ventas_vendedor',       subject: 'reportes' },
                { action: 'ventas_producto',       subject: 'reportes' },
                { action: 'ventas_cliente',        subject: 'reportes' },
                { action: 'compras',               subject: 'reportes' },
                { action: 'compras_proveedor',     subject: 'reportes' },
                { action: 'inventario',            subject: 'reportes' },
                { action: 'inventario_valorizado', subject: 'reportes' },
                { action: 'ganancias',             subject: 'reportes' },
                { action: 'ganancias_producto',    subject: 'reportes' },
                { action: 'top_productos',         subject: 'reportes' },
                { action: 'vencimientos',          subject: 'reportes' },
                { action: 'stock_bajo',            subject: 'reportes' },
                { action: 'kardex',                subject: 'reportes' },
                { action: 'traslados',             subject: 'reportes' },
                { action: 'comparativo_sucursales',subject: 'reportes' },
                { action: 'caja',                  subject: 'reportes' },
              ]}>
                <AppLayout>
                  <LayoutReportes />
                </AppLayout>
              </ProtectedRoute>
            }/>

            {/* ── Backups ────────────────────────────────────────────── */}
            <Route path="/backups" element={
              <PageRoute action="ver" subject="roles">
                <Backups />
              </PageRoute>
            }/>

            {/* ── Configuración ──────────────────────────────────────────── */}
            <Route path="/configuracion" element={
              <PageRoute action="ver" subject="configuracion">
                <Configuracion />
              </PageRoute>
            }/>

            {/* ── Créditos ───────────────────────────────────────────────── */}
            <Route path="/creditos" element={
              <PageRoute action="ver" subject="creditos">
                <LayoutCreditos />
              </PageRoute>
            }/>

            {/* ── Mezclas ────────────────────────────────────────────────── */}
            <Route path="/mezclas" element={
              <PageRoute action="ver" subject="mezclas">
                <Mezclas />
              </PageRoute>
            }/>

            {/* ── Libro de Caja ──────────────────────────────────────────── */}
            <Route path="/libro-caja" element={
              <PageRoute action="ver" subject="movimientos">
                <LibroCaja />
              </PageRoute>
            }/>

            {/* ── Dashboard ───────────────────────────────────────────── */}
            <Route path="/dashboard" element={
              <PageRoute>
                <Dashboard />
              </PageRoute>
            }/>


            {/* ── Rutas desconocidas ──────────────────────────────────── */}
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </AbilityProvider>
        </ConfigProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}