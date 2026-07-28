import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const fmt   = (n) => Number(n ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ESTADO_COLOR = {
  ACTIVA:    'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  PRUEBA:    'bg-amber-100   dark:bg-amber-500/20   text-amber-700   dark:text-amber-300',
  VENCIDA:   'bg-red-100     dark:bg-red-500/20     text-red-700     dark:text-red-300',
  CANCELADA: 'bg-zinc-100    dark:bg-zinc-700       text-zinc-600    dark:text-zinc-400',
};

function KpiCard({ label, value, sub, color = 'indigo' }) {
  const C = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    emerald:'text-emerald-600 dark:text-emerald-400',
    violet: 'text-violet-600 dark:text-violet-400',
    amber:  'text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 print:border print:shadow-none">
      <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-extrabold tabular-nums ${C[color]}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-3 mt-6 first:mt-0 print:mt-4">
      {children}
    </h2>
  );
}

function Table({ headers, rows, empty = 'Sin datos' }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 print:border">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-3 text-left font-semibold ${i > 0 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.length === 0
            ? <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500">{empty}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-3 text-zinc-700 dark:text-zinc-300 ${j > 0 ? 'text-right tabular-nums' : 'font-medium'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default function Reportes() {
  const anioActual = new Date().getFullYear();
  const mesActual  = new Date().getMonth() + 1;

  const [year,    setYear]    = useState(anioActual);
  const [month,   setMonth]   = useState(''); // '' = anual
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    const params = new URLSearchParams({ year });
    if (month) params.set('month', month);
    adminApi.get(`/reportes?${params}`)
      .then(({ data }) => setData(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [year, month]);

  const aniosOpciones = data?.anios_disponibles?.length
    ? data.anios_disponibles
    : [anioActual];

  const periodoLabel = month
    ? `${MESES[month - 1]} ${year}`
    : `Año ${year}`;

  const [descargando, setDescargando] = useState(false);

  const handleDescargarPDF = async () => {
    setDescargando(true);
    try {
      const params = new URLSearchParams({ year });
      if (month) params.set('month', month);
      const token = localStorage.getItem('admin_token');
      const baseURL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseURL}/reportes/pdf?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al generar PDF');
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `reporte-sisagro-${month ? `${String(month).padStart(2,'0')}-` : ''}${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo descargar el PDF. Intenta de nuevo.');
    } finally {
      setDescargando(false);
    }
  };

  // Filas de la tabla de ingresos por período
  const filasIngresos = (data?.ingresos_filtro ?? []).map(r =>
    month
      ? [`${String(r.dia).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`, r.cantidad_pagos, `Bs ${fmt(r.total)}`]
      : [MESES[(r.mes ?? 1) - 1], r.cantidad_pagos, `Bs ${fmt(r.total)}`]
  );

  const filasPlanes = (data?.ingresos_plan ?? []).map(r => [
    r.plan, r.cantidad, `Bs ${fmt(r.total)}`,
  ]);

  const filasEstado = (data?.estado_suscripciones ?? []).map(r => [
    <span key={r.estado} className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${ESTADO_COLOR[r.estado] ?? ESTADO_COLOR.CANCELADA}`}>
      {r.estado}
    </span>,
    r.cantidad,
  ]);

  return (
    <>
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Reportes financieros</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">Resumen de ingresos, suscripciones y empresas</p>
          </div>
          <button
            onClick={handleDescargarPDF}
            disabled={loading || error || descargando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                       disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            {descargando
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            }
            {descargando ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>

        {/* ── Filtros ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Año</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                         bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
            >
              {aniosOpciones.includes(anioActual)
                ? aniosOpciones.map(a => <option key={a} value={a}>{a}</option>)
                : [anioActual, ...aniosOpciones].map(a => <option key={a} value={a}>{a}</option>)
              }
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Mes</label>
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                         bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
            >
              <option value="">Año completo</option>
              {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          {month && (
            <button
              onClick={() => setMonth('')}
              className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200
                         border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors"
            >
              Ver año completo
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10
                          border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
            Error al cargar el reporte.
          </div>
        )}

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 animate-pulse">
                <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800 mb-3" />
                <div className="h-8 w-28 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))
          ) : (
            <>
              <KpiCard
                label="Ingresos"
                value={`Bs ${fmt(data?.periodo?.total)}`}
                sub={periodoLabel}
                color="emerald"
              />
              <KpiCard
                label="Pagos recibidos"
                value={data?.periodo?.cantidad_pagos ?? 0}
                sub="transacciones"
                color="indigo"
              />
              <KpiCard
                label="Empresas activas"
                value={data?.estado_suscripciones?.find(e => e.estado === 'ACTIVA')?.cantidad ?? 0}
                sub="con suscripción activa"
                color="violet"
              />
              <KpiCard
                label="En prueba"
                value={data?.estado_suscripciones?.find(e => e.estado === 'PRUEBA')?.cantidad ?? 0}
                sub="período de prueba"
                color="amber"
              />
            </>
          )}
        </div>

        {/* ── Ingresos del período ── */}
        <SectionTitle>
          {month ? `Ingresos diarios — ${MESES[month - 1]} ${year}` : `Ingresos mensuales — ${year}`}
        </SectionTitle>
        {loading
          ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}</div>
          : <Table
              headers={[month ? 'Fecha' : 'Mes', 'Pagos', 'Total']}
              rows={filasIngresos}
              empty="Sin ingresos en este período"
            />
        }

        {/* ── Ingresos por plan ── */}
        <SectionTitle>Ingresos por plan — {periodoLabel}</SectionTitle>
        {loading
          ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}</div>
          : <Table
              headers={['Plan', 'Pagos', 'Total']}
              rows={filasPlanes}
              empty="Sin pagos en este período"
            />
        }

        {/* ── Estado actual de suscripciones ── */}
        <SectionTitle>Estado actual de suscripciones</SectionTitle>
        {loading
          ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}</div>
          : <Table
              headers={['Estado', 'Cantidad']}
              rows={filasEstado}
              empty="Sin suscripciones"
            />
        }

        {/* ── Registros por mes (solo vista anual) ── */}
        {!month && (
          <>
            <SectionTitle>Nuevas suscripciones y empresas por mes — {year}</SectionTitle>
            {loading
              ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}</div>
              : (() => {
                  const susMap  = Object.fromEntries((data?.suscripciones_mes ?? []).map(r => [r.mes, r.cantidad]));
                  const empMap  = Object.fromEntries((data?.empresas_mes ?? []).map(r => [r.mes, r.cantidad]));
                  const mesesConDatos = [...new Set([
                    ...(data?.suscripciones_mes ?? []).map(r => r.mes),
                    ...(data?.empresas_mes ?? []).map(r => r.mes),
                  ])].sort((a,b) => a - b);
                  const filas = mesesConDatos.map(m => [
                    MESES[m - 1],
                    susMap[m] ?? 0,
                    empMap[m] ?? 0,
                  ]);
                  return (
                    <Table
                      headers={['Mes', 'Suscripciones nuevas', 'Empresas nuevas']}
                      rows={filas}
                      empty="Sin registros en este año"
                    />
                  );
                })()
            }
          </>
        )}
      </div>
    </>
  );
}
