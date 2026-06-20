import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }       from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import reporteService    from '../services/reporte.service';
import PageWrapper       from '../components/PageWrapper';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtBs  = (n) =>
  new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(n || 0));
const fmtInt = (n) =>
  new Intl.NumberFormat('es-BO').format(parseInt(n || 0));

function saludoHora() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function fechaLarga() {
  return new Date().toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── SVG Icons (Heroicons outline 24px) ───────────────────────────────────────
const DASH_ICONS = {
  receipt:
    'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z',
  banknotes:
    'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z',
  shoppingCart:
    'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  trophy:
    'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0',
  clock:
    'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning:
    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  bolt:
    'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
  chartBar:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  cube:
    'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  users:
    'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  userGroup:
    'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  buildingOffice:
    'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  archiveBox:
    'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z',
  briefcase:
    'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z',
  clipboardList:
    'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z',
  checkCircle:
    'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  sparkles:
    'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z',
};

function DashIcon({ name, className = 'w-5 h-5' }) {
  if (!DASH_ICONS[name]) return null;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={DASH_ICONS[name]} />
    </svg>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ className = '' }) {
  return <div className={`animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg ${className}`} />;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KPI_META = {
  emerald: {
    bar:  'bg-emerald-500',
    ring: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  yellow: {
    bar:  'bg-yellow-400',
    ring: 'bg-yellow-50 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400',
  },
  orange: {
    bar:  'bg-orange-400',
    ring: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  sky:    {
    bar:  'bg-sky-500',
    ring: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  red:    {
    bar:  'bg-red-500',
    ring: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  },
  violet: {
    bar:  'bg-violet-500',
    ring: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
};

function KpiCard({ label, value, prefix = '', iconName, colorKey = 'emerald', cargando, sub }) {
  const meta = KPI_META[colorKey] ?? KPI_META.emerald;
  return (
    <div className="relative overflow-hidden rounded-2xl border
                    border-zinc-200 dark:border-zinc-800
                    bg-white dark:bg-zinc-900
                    shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${meta.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest
                        text-zinc-400 dark:text-zinc-500 mb-2">
            {label}
          </p>
          {cargando ? (
            <Skel className="h-7 w-28 mt-1" />
          ) : (
            <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">
              {prefix && (
                <span className="text-sm font-semibold text-zinc-400 mr-1">{prefix}</span>
              )}
              {value}
            </p>
          )}
          {!cargando && sub && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.ring}`}>
          <DashIcon name={iconName} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ── Barra de producto ─────────────────────────────────────────────────────────
const BAR_COLORS = [
  'bg-yellow-400', 'bg-emerald-500', 'bg-sky-500',
  'bg-violet-500', 'bg-orange-400',  'bg-pink-500',
  'bg-teal-500',   'bg-rose-400',
];

function BarProducto({ nombre, valor, max, rank }) {
  const pct   = max > 0 ? Math.max(4, (valor / max) * 100) : 4;
  const color = BAR_COLORS[rank % BAR_COLORS.length];
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-600 w-4 text-right shrink-0">
        {rank + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1 gap-2">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {nombre}
          </span>
          <span className="text-xs font-bold text-zinc-900 dark:text-white shrink-0">
            Bs {fmtBs(valor)}
          </span>
        </div>
        <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 delay-75 ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Alerta badge días ─────────────────────────────────────────────────────────
function DiasBadge({ dias }) {
  if (dias <= 0)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                       bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 shrink-0">
        Vencido
      </span>
    );
  if (dias <= 7)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                       bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 shrink-0">
        {dias}d
      </span>
    );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                     bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
      {dias}d
    </span>
  );
}

// ── Fila de alerta ────────────────────────────────────────────────────────────
function AlertRow({ nombre, sub, badge }) {
  return (
    <div className="flex items-center justify-between gap-2
                    px-3 py-2 rounded-xl
                    bg-zinc-50 dark:bg-zinc-800/50
                    border border-zinc-100 dark:border-zinc-800">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{nombre}</p>
        <p className="text-[10px] text-zinc-400">{sub}</p>
      </div>
      {badge}
    </div>
  );
}

// ── Panel contenedor ──────────────────────────────────────────────────────────
function Panel({ title, iconName, badge, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800
                     bg-white dark:bg-zinc-900 p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {iconName && (
            <DashIcon name={iconName} className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          )}
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ── Estado vacío ──────────────────────────────────────────────────────────────
function Empty({ iconName, msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <DashIcon name={iconName} className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
      <p className="text-xs text-zinc-400 text-center">{msg}</p>
    </div>
  );
}

// ── Acceso rápido ─────────────────────────────────────────────────────────────
function QuickBtn({ to, iconName, label, desc, onClick }) {
  return (
    <button
      onClick={() => onClick(to)}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left w-full
                 bg-zinc-50 dark:bg-zinc-800/50
                 border border-zinc-100 dark:border-zinc-700/60
                 hover:border-yellow-400 hover:bg-yellow-50/60 dark:hover:bg-yellow-400/5
                 transition-all duration-150 group"
    >
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800
                      border border-zinc-200 dark:border-zinc-700
                      group-hover:border-yellow-300 dark:group-hover:border-yellow-500/40
                      group-hover:bg-yellow-50 dark:group-hover:bg-yellow-400/10
                      flex items-center justify-center shrink-0 transition-all duration-150">
        <DashIcon
          name={iconName}
          className="w-[15px] h-[15px] text-zinc-400 dark:text-zinc-500
                     group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate
                      group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors">
          {label}
        </p>
        <p className="text-[10px] text-zinc-400 truncate leading-tight">{desc}</p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { usuario }  = useAuth();
  const { puede }    = usePermission();
  const navigate     = useNavigate();

  const modulos    = usuario?.modulos ?? [];
  const tieneMod   = (mod) => modulos.includes(mod);

  const pFinanciero = puede('ganancias',     'reportes') && tieneMod('reportes_avanzados');
  const pTop        = puede('top_productos', 'reportes') && tieneMod('reportes_avanzados');
  const pVenc       = puede('vencimientos',  'reportes') && tieneMod('inventario');
  const pStockBajo  = puede('stock_bajo',    'reportes') && tieneMod('inventario');

  const [fin,     setFin]     = useState(null);
  const [top,     setTop]     = useState([]);
  const [venc,    setVenc]    = useState([]);
  const [stock,   setStock]   = useState([]);

  const [ldFin,   setLdFin]   = useState(false);
  const [ldTop,   setLdTop]   = useState(false);
  const [ldVenc,  setLdVenc]  = useState(false);
  const [ldStock, setLdStock] = useState(false);

  const cargar = useCallback(async () => {
    if (pFinanciero) {
      setLdFin(true);
      try   { const r = await reporteService.financiero();             setFin(r.data); }
      catch { /* silencioso */ }
      finally { setLdFin(false); }
    }
    if (pTop) {
      setLdTop(true);
      try   { const r = await reporteService.topProductos();          setTop(r.data.slice(0, 8)); }
      catch { /* silencioso */ }
      finally { setLdTop(false); }
    }
    if (pVenc) {
      setLdVenc(true);
      try   { const r = await reporteService.vencimientos();          setVenc(r.data.slice(0, 6)); }
      catch { /* silencioso */ }
      finally { setLdVenc(false); }
    }
    if (pStockBajo) {
      setLdStock(true);
      try   { const r = await reporteService.inventario('stock_bajo'); setStock(r.data.data ?? []); }
      catch { /* silencioso */ }
      finally { setLdStock(false); }
    }
  }, [pFinanciero, pTop, pVenc, pStockBajo]);

  useEffect(() => { cargar(); }, [cargar]);

  const quickLinks = [
    { to: '/ventas/nueva',  iconName: 'receipt',        label: 'Nueva Venta',   desc: 'Registrar POS',        show: puede('crear', 'ventas')       && tieneMod('ventas')      },
    { to: '/compras/nueva', iconName: 'shoppingCart',   label: 'Nueva Compra',  desc: 'Registrar ingreso',    show: puede('crear', 'compras')      && tieneMod('compras')     },
    { to: '/ventas',        iconName: 'clipboardList',  label: 'Ventas',        desc: 'Historial',            show: puede('ver',   'ventas')       && tieneMod('ventas')      },
    { to: '/caja',          iconName: 'banknotes',      label: 'Caja',          desc: 'Turnos de caja',       show: puede('ver',   'caja')         && tieneMod('caja')        },
    { to: '/productos',     iconName: 'cube',           label: 'Productos',     desc: 'Catálogo',             show: puede('ver',   'productos')    && tieneMod('inventario')  },
    { to: '/almacen',       iconName: 'archiveBox',     label: 'Almacén',       desc: 'Stock e inventario',   show: puede('ver',   'almacen')      && tieneMod('inventario')  },
    { to: '/clientes',      iconName: 'users',          label: 'Clientes',      desc: 'Gestión de clientes',  show: puede('ver',   'clientes')     && tieneMod('clientes')    },
    { to: '/compras',       iconName: 'shoppingCart',   label: 'Compras',       desc: 'Historial compras',    show: puede('ver',   'compras')      && tieneMod('compras')     },
    { to: '/proveedores',   iconName: 'briefcase',      label: 'Proveedores',   desc: 'Gestión proveedores',  show: puede('ver',   'proveedores')  && tieneMod('proveedores') },
    { to: '/reportes',      iconName: 'chartBar',       label: 'Reportes',      desc: 'Estadísticas',         show: ['ventas_diarias','inventario','caja'].some(a => puede(a, 'reportes')) && tieneMod('reportes_basicos') },
    { to: '/usuarios',      iconName: 'userGroup',      label: 'Usuarios',      desc: 'Gestión de usuarios',  show: puede('ver',   'usuarios')     && tieneMod('roles')       },
    { to: '/sucursales',    iconName: 'buildingOffice', label: 'Sucursales',    desc: 'Gestión sucursales',   show: puede('ver',   'sucursales')   && tieneMod('traslados')   },
  ].filter(l => l.show);

  const maxTop = top.length > 0
    ? Math.max(...top.map(p => parseFloat(p.ingresos_generados || 0)))
    : 1;

  const iniciales = [usuario?.nombre?.[0], usuario?.apellido?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  const tieneAlgunWidget = pFinanciero || pTop || pVenc || pStockBajo;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto space-y-4">

        {/* ═══ HEADER ══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800
                        bg-white dark:bg-zinc-900 shadow-sm px-5 py-4
                        flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest
                          text-zinc-400 dark:text-zinc-500 mb-0.5">
              {saludoHora()}
            </p>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white truncate">
              {usuario?.nombre} {usuario?.apellido}
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 capitalize mt-0.5">
              {fechaLarga()}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Rol actual</span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {usuario?.rol_nombre ?? `Rol ${usuario?.rol}`}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-zinc-900
                            flex items-center justify-center text-sm font-black shrink-0">
              {iniciales}
            </div>
          </div>
        </div>

        {/* ═══ KPI CARDS ═══════════════════════════════════════════════════════ */}
        {pFinanciero && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <KpiCard
              label="Ventas hoy"
              value={fmtInt(fin?.ventas_hoy_cantidad)}
              iconName="receipt"
              colorKey="emerald"
              cargando={ldFin}
              sub={`Bs ${fmtBs(fin?.ingresos_hoy)} ingresos`}
            />
            <KpiCard
              label="Ingresos del mes"
              value={fmtBs(fin?.ingresos_mes)}
              prefix="Bs"
              iconName="banknotes"
              colorKey="yellow"
              cargando={ldFin}
            />
            <KpiCard
              label="Compras del mes"
              value={fmtBs(fin?.egresos_mes)}
              prefix="Bs"
              iconName="shoppingCart"
              colorKey="orange"
              cargando={ldFin}
            />
          </div>
        )}

        {/* ═══ GRID CENTRAL ════════════════════════════════════════════════════ */}
        {tieneAlgunWidget && (
          <div className={`grid gap-4 ${
            pTop && (pVenc || pStockBajo)
              ? 'grid-cols-1 xl:grid-cols-3'
              : 'grid-cols-1'
          }`}>

            {/* ─ Top Productos ─────────────────────────────────────────────── */}
            {pTop && (
              <Panel
                title="Top Productos"
                iconName="trophy"
                badge={<span className="text-[10px] text-zinc-400">por ingresos</span>}
                className={pVenc || pStockBajo ? 'xl:col-span-2' : ''}
              >
                {ldTop ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skel key={i} className="h-7 w-full" />)}
                  </div>
                ) : top.length === 0 ? (
                  <Empty iconName="cube" msg="Sin ventas registradas aún" />
                ) : (
                  <div className="space-y-3">
                    {top.map((p, i) => (
                      <BarProducto
                        key={p.id_producto}
                        nombre={p.nombre}
                        valor={parseFloat(p.ingresos_generados || 0)}
                        max={maxTop}
                        rank={i}
                      />
                    ))}
                  </div>
                )}
              </Panel>
            )}

            {/* ─ Columna alertas ───────────────────────────────────────────── */}
            {(pVenc || pStockBajo) && (
              <div className="flex flex-col gap-4">

                {pVenc && (
                  <Panel
                    title="Próximos a vencer"
                    iconName="clock"
                    badge={
                      venc.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                         bg-amber-100 dark:bg-amber-900/30
                                         text-amber-700 dark:text-amber-300">
                          {venc.length}
                        </span>
                      )
                    }
                    className="flex-1"
                  >
                    {ldVenc ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skel key={i} className="h-10 w-full" />)}
                      </div>
                    ) : venc.length === 0 ? (
                      <Empty iconName="checkCircle" msg="Sin productos próximos a vencer" />
                    ) : (
                      <div className="space-y-2">
                        {venc.map(v => (
                          <AlertRow
                            key={v.id_lote}
                            nombre={v.producto_nombre}
                            sub={v.numero_lote ? `Lote: ${v.numero_lote}` : `Lote #${v.id_lote}`}
                            badge={<DiasBadge dias={v.dias_restantes} />}
                          />
                        ))}
                      </div>
                    )}
                  </Panel>
                )}

                {pStockBajo && (
                  <Panel
                    title="Stock bajo"
                    iconName="warning"
                    badge={
                      stock.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                         bg-red-100 dark:bg-red-900/30
                                         text-red-700 dark:text-red-300">
                          {stock.length}
                        </span>
                      )
                    }
                    className="flex-1"
                  >
                    {ldStock ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skel key={i} className="h-10 w-full" />)}
                      </div>
                    ) : stock.length === 0 ? (
                      <Empty iconName="checkCircle" msg="Todos los productos en stock normal" />
                    ) : (
                      <div className="space-y-2">
                        {stock.map(s => (
                          <AlertRow
                            key={s.id_producto}
                            nombre={s.nombre}
                            sub={`Mínimo: ${s.stock_minimo} uds`}
                            badge={
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                               bg-red-100 dark:bg-red-900/40
                                               text-red-700 dark:text-red-300 shrink-0">
                                {s.stock_total_unidades} uds
                              </span>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </Panel>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ BIENVENIDA ══════════════════════════════════════════════════════ */}
        {!tieneAlgunWidget && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800
                          bg-white dark:bg-zinc-900 shadow-sm px-6 py-12
                          flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-400/10
                            flex items-center justify-center">
              <DashIcon name="sparkles" className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-800 dark:text-white mb-1">
                Bienvenido a SIS-AGRO
              </h2>
              <p className="text-sm text-zinc-400 max-w-xs">
                Usa el menú lateral para acceder a los módulos disponibles para tu rol.
              </p>
            </div>
          </div>
        )}

        {/* ═══ ACCESO RÁPIDO ═══════════════════════════════════════════════════ */}
        {quickLinks.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800
                          bg-white dark:bg-zinc-900 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <DashIcon name="bolt" className="w-4 h-4 text-yellow-500" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Acceso rápido</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
              {quickLinks.map(l => (
                <QuickBtn key={l.to} {...l} onClick={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-1 pb-2 text-[10px] text-zinc-300 dark:text-zinc-700">
          <span>SIS-AGRO v1.0.0</span>
          <span>Sucursal #{usuario?.id_sucursal} · {usuario?.rol_nombre}</span>
        </div>

      </div>
    </PageWrapper>
  );
}
