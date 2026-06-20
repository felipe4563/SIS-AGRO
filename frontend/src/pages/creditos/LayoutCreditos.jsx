import { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import CuentasPorCobrar from './CuentasPorCobrar';
import CuentasPorPagar from './CuentasPorPagar';
import { usePermission } from '../../hooks/usePermission';

const TABS = [
  { key: 'cobrar', label: 'Cuentas por Cobrar', desc: 'Clientes que deben a la empresa' },
  { key: 'pagar',  label: 'Cuentas por Pagar',  desc: 'Deudas a proveedores' },
];

export default function LayoutCreditos() {
  const { puede } = usePermission();
  const [tab, setTab] = useState('cobrar');

  if (!puede('ver', 'creditos')) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver el módulo de créditos. Contacta al administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  const tabActual = TABS.find(t => t.key === tab);

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          💳 Créditos
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {tabActual?.desc}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cobrar' && <CuentasPorCobrar />}
      {tab === 'pagar'  && <CuentasPorPagar />}
    </PageWrapper>
  );
}
