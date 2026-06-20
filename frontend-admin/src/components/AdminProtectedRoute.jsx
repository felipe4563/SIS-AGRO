import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { admin } = useAdminAuth();
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}
