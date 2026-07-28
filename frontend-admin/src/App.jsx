import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider }     from './contexts/ThemeContext';
import AdminProtectedRoute   from './components/AdminProtectedRoute';
import AdminLayout           from './components/AdminLayout';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Empresas       from './pages/Empresas';
import Planes         from './pages/Planes';
import Suscripciones  from './pages/Suscripciones';
import Pagos          from './pages/Pagos';
import Perfil         from './pages/Perfil';
import Reportes       from './pages/Reportes';

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
            <Route path="/"              element={<Landing />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/dashboard"     element={<PageRoute><Dashboard /></PageRoute>} />
            <Route path="/empresas"      element={<PageRoute><Empresas /></PageRoute>} />
            <Route path="/planes"        element={<PageRoute><Planes /></PageRoute>} />
            <Route path="/suscripciones" element={<PageRoute><Suscripciones /></PageRoute>} />
            <Route path="/pagos"         element={<PageRoute><Pagos /></PageRoute>} />
            <Route path="/perfil"        element={<PageRoute><Perfil /></PageRoute>} />
            <Route path="/reportes"      element={<PageRoute><Reportes /></PageRoute>} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </AdminAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
