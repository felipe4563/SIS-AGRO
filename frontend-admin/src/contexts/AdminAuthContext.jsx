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

  const updateAdmin = useCallback((newData, newToken) => {
    const updated = { ...JSON.parse(localStorage.getItem('admin_user') || '{}'), ...newData };
    localStorage.setItem('admin_user', JSON.stringify(updated));
    if (newToken) localStorage.setItem('admin_token', newToken);
    setAdmin(updated);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, updateAdmin, cargando, error }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
