import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';

const ESTADO_DOT = {
  PAGADO:   'bg-emerald-500',
  PENDIENTE:'bg-amber-400',
  FALLIDO:  'bg-red-500',
};
const ESTADO_LABEL = {
  PAGADO:   'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
  PENDIENTE:'text-amber-700  dark:text-amber-400  bg-amber-50  dark:bg-amber-500/10',
  FALLIDO:  'text-red-700   dark:text-red-400   bg-red-50   dark:bg-red-500/10',
};

function EstadoBadge({ estado }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTADO_LABEL[estado] ?? 'bg-zinc-100 text-zinc-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ESTADO_DOT[estado] ?? 'bg-zinc-400'}`} />
      {estado}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${[60,50,40,55,65,45,70][i]}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-3.5 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex justify-between items-end">
        <div className="h-5 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ErrAlert({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      {msg}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isOk = toast.type === 'ok';
  return (
    <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
      ${isOk
        ? 'bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-white dark:bg-zinc-900 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
      }`}>
      {isOk
        ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
      }
      {toast.msg}
    </div>
  );
}

const inputCls = `w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
  bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-400`;

const selectCls = `px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
  bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`;

const fmtFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const fmtMonto = (m) => `Bs ${parseFloat(m).toFixed(2)}`;

export default function Pagos() {
  const [pagos,          setPagos]          = useState([]);
  const [empresas,       setEmpresas]       = useState([]);
  const [suscripciones,  setSuscripciones]  = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [filtroEmpresa,  setFiltroEmpresa]  = useState('');
  const [filtroEstado,   setFiltroEstado]   = useState('');
  const [modal,          setModal]          = useState(false);
  const [formEmpresa,    setFormEmpresa]    = useState('');
  const [form,           setForm]           = useState({ id_suscripcion: '', monto: '', referencia: '', notas: '' });
  const [guardando,      setGuardando]      = useState(false);
  const [formErr,        setFormErr]        = useState('');
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    adminApi.get('/empresas').then(({ data }) => setEmpresas(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!formEmpresa) { setSuscripciones([]); return; }
    adminApi.get(`/suscripciones?id_empresa=${formEmpresa}`)
      .then(({ data }) => setSuscripciones(data))
      .catch(console.error);
  }, [formEmpresa]);

  const cargar = useCallback(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroEmpresa) params.set('id_empresa', filtroEmpresa);
    if (filtroEstado)  params.set('estado',     filtroEstado);
    adminApi.get(`/pagos?${params}`)
      .then(({ data }) => setPagos(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [filtroEmpresa, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirModal = () => {
    setFormEmpresa('');
    setForm({ id_suscripcion: '', monto: '', referencia: '', notas: '' });
    setFormErr('');
    setModal(true);
  };

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setFormErr('');
    try {
      await adminApi.post('/pagos', { ...form, monto: parseFloat(form.monto) });
      setModal(false);
      cargar();
      showToast('Pago registrado correctamente');
    } catch (er) {
      setFormErr(er.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setGuardando(false);
    }
  };

  const hayFiltros = filtroEmpresa || filtroEstado;

  return (
    <div className="max-w-5xl mx-auto">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Pagos</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            {cargando ? 'Cargando…' : `${pagos.length} pago${pagos.length !== 1 ? 's' : ''} registrado${pagos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Registrar pago</span>
          <span className="sm:hidden">Registrar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} className={selectCls}>
          <option value="">Todas las empresas</option>
          {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={selectCls}>
          <option value="">Todos los estados</option>
          {['PAGADO', 'PENDIENTE', 'FALLIDO'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setFiltroEmpresa(''); setFiltroEstado(''); }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla — md+ */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              {['Empresa', 'Plan', 'Monto', 'Referencia', 'Estado', 'Fecha', 'Notas'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {cargando
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : pagos.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
                      Sin pagos registrados
                    </td>
                  </tr>
                )
                : pagos.map(p => (
                  <tr key={p.id_pago} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{p.empresa_nombre}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.plan_nombre}</td>
                    <td className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{fmtMonto(p.monto)}</td>
                    <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs font-mono">{p.referencia || '—'}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={p.estado} /></td>
                    <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs tabular-nums">{fmtFecha(p.fecha_pago)}</td>
                    <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs max-w-[180px] truncate">{p.notas || '—'}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {cargando
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : pagos.length === 0
            ? (
              <div className="py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Sin pagos registrados
              </div>
            )
            : pagos.map(p => (
              <div key={p.id_pago} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{p.empresa_nombre}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{p.plan_nombre}</p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{fmtMonto(p.monto)}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{fmtFecha(p.fecha_pago)}</span>
                </div>
                {(p.referencia || p.notas) && (
                  <div className="pt-0.5 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                    {p.referencia && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                        <span className="font-sans font-semibold text-zinc-500 dark:text-zinc-400">Ref:</span> {p.referencia}
                      </p>
                    )}
                    {p.notas && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                        <span className="font-semibold text-zinc-500 dark:text-zinc-400">Nota:</span> {p.notas}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
        }
      </div>

      {/* Modal registrar pago */}
      {modal && (
        <ModalShell title="Registrar pago manual" onClose={() => setModal(false)}>
          <form onSubmit={registrar} className="p-5 space-y-4">
            <ErrAlert msg={formErr} />

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Empresa
              </label>
              <select
                value={formEmpresa}
                onChange={e => { setFormEmpresa(e.target.value); setForm(f => ({ ...f, id_suscripcion: '' })); }}
                className={inputCls}
              >
                <option value="">Seleccionar empresa…</option>
                {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Suscripción <span className="text-red-400">*</span>
              </label>
              <select
                value={form.id_suscripcion}
                onChange={e => setForm(f => ({ ...f, id_suscripcion: e.target.value }))}
                required
                disabled={!formEmpresa}
                className={inputCls + (formEmpresa ? '' : ' opacity-50 cursor-not-allowed')}
              >
                <option value="">{formEmpresa ? 'Seleccionar suscripción…' : 'Primero selecciona empresa'}</option>
                {suscripciones.map(s => (
                  <option key={s.id_suscripcion} value={s.id_suscripcion}>
                    {s.plan_nombre} — {s.estado} ({s.fecha_fin})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Monto (Bs) <span className="text-red-400">*</span>
              </label>
              <input
                type="number" step="0.01" min="0.01"
                value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                required
                placeholder="0.00"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Referencia
              </label>
              <input
                type="text"
                value={form.referencia}
                onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
                placeholder="TRF-20260615"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Notas
              </label>
              <textarea
                value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                rows={2}
                className={inputCls + ' resize-none'}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {guardando ? 'Registrando…' : 'Registrar'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
