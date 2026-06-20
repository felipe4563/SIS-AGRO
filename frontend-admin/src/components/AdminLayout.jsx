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
