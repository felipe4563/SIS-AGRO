import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const KPI_META = [
  {
    key:   'empresas_activas',
    label: 'Empresas activas',
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
      </svg>
    ),
  },
  {
    key:   'suscripciones_activas',
    label: 'Suscripciones activas',
    color: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
      </svg>
    ),
  },
  {
    key:   'por_vencer_7dias',
    label: 'Por vencer (7 días)',
    color: 'amber',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    key:    'ingresos_mes',
    label:  'Ingresos del mes',
    color:  'violet',
    prefix: 'Bs ',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  {
    key:   'empresas_total',
    label: 'Total empresas',
    color: 'zinc',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
];

const COLOR = {
  emerald: {
    wrap:  'bg-emerald-50 dark:bg-emerald-500/10',
    icon:  'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  indigo: {
    wrap:  'bg-indigo-50 dark:bg-indigo-500/10',
    icon:  'text-indigo-600 dark:text-indigo-400',
    value: 'text-indigo-700 dark:text-indigo-300',
  },
  amber: {
    wrap:  'bg-amber-50 dark:bg-amber-500/10',
    icon:  'text-amber-600 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-300',
  },
  violet: {
    wrap:  'bg-violet-50 dark:bg-violet-500/10',
    icon:  'text-violet-600 dark:text-violet-400',
    value: 'text-violet-700 dark:text-violet-300',
  },
  zinc: {
    wrap:  'bg-zinc-100 dark:bg-zinc-800',
    icon:  'text-zinc-500 dark:text-zinc-400',
    value: 'text-zinc-700 dark:text-zinc-300',
  },
};

function KpiCard({ meta, value }) {
  const c = COLOR[meta.color];
  const display = value == null ? '—' : `${meta.prefix ?? ''}${value}`;
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider leading-tight">
          {meta.label}
        </p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.wrap} ${c.icon}`}>
          {meta.icon}
        </span>
      </div>
      <p className={`text-3xl font-extrabold tracking-tight ${c.value}`}>{display}</p>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="h-8 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

export default function Dashboard() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(false);

  useEffect(() => {
    adminApi.get('/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  const fecha = new Date().toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 capitalize mt-0.5">{fecha}</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10
                        border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          Error al cargar los datos del dashboard.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        {cargando
          ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
          : KPI_META.map(meta => (
              <KpiCard key={meta.key} meta={meta} value={data?.[meta.key]} />
            ))
        }
      </div>

      {/* Distribución por plan */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Distribución por plan</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Empresas con suscripción activa por tipo de plan</p>
        </div>

        {cargando ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 animate-pulse">
                <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : !data?.distribucion_planes?.length ? (
          <p className="px-5 py-6 text-sm text-zinc-400 dark:text-zinc-500 text-center">Sin datos disponibles</p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {data.distribucion_planes.map((row, i) => {
              const max = Math.max(...data.distribucion_planes.map(r => r.cantidad));
              const pct = max > 0 ? Math.round((row.cantidad / max) * 100) : 0;
              return (
                <div key={row.plan} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10
                                   text-indigo-600 dark:text-indigo-400 text-[10px] font-bold
                                   flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">{row.plan}</span>
                  <div className="hidden sm:flex flex-1 max-w-[140px] h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-400 dark:bg-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums w-6 text-right">
                    {row.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
