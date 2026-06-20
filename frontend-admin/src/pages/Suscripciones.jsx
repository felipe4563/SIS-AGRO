import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../api/adminApi';

const ESTADO_BADGE = {
  ACTIVA:    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  PRUEBA:    'bg-amber-50   dark:bg-amber-500/10   text-amber-700   dark:text-amber-400',
  VENCIDA:   'bg-red-50     dark:bg-red-500/10     text-red-700     dark:text-red-400',
  CANCELADA: 'bg-zinc-100   dark:bg-zinc-700       text-zinc-600    dark:text-zinc-400',
};

const ESTADO_DOT = {
  ACTIVA:    'bg-emerald-500',
  PRUEBA:    'bg-amber-500',
  VENCIDA:   'bg-red-500',
  CANCELADA: 'bg-zinc-400',
};

function EstadoBadge({ estado }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${ESTADO_BADGE[estado] ?? ESTADO_BADGE.CANCELADA}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ESTADO_DOT[estado] ?? ESTADO_DOT.CANCELADA}`} />
      {estado}
    </span>
  );
}

const INPUT_CLASS = `w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
  bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`;

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[55, 40, 35, 55, 40, 40, 60].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-36 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800
                      shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400
                       hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Suscripciones() {
  const [searchParams]  = useSearchParams();
  const [suscripciones, setSuscripciones] = useState([]);
  const [empresas,      setEmpresas]      = useState([]);
  const [planes,        setPlanes]        = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState(searchParams.get('empresa') || '');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [modal,         setModal]         = useState(null);
  const [form,          setForm]          = useState({ id_empresa: '', id_plan: '', ciclo: 'MENSUAL', fecha_inicio: new Date().toISOString().split('T')[0] });
  const [extFecha,      setExtFecha]      = useState('');
  const [guardando,     setGuardando]     = useState(false);
  const [err,           setErr]           = useState('');
  const [toast,         setToast]         = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([adminApi.get('/empresas'), adminApi.get('/planes')])
      .then(([eRes, pRes]) => { setEmpresas(eRes.data); setPlanes(pRes.data); })
      .catch(console.error);
  }, []);

  const cargar = useCallback(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtroEmpresa) params.set('id_empresa', filtroEmpresa);
    if (filtroEstado)  params.set('estado', filtroEstado);
    adminApi.get(`/suscripciones?${params}`)
      .then(({ data }) => setSuscripciones(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [filtroEmpresa, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirNueva = () => {
    setForm({ id_empresa: '', id_plan: '', ciclo: 'MENSUAL', fecha_inicio: new Date().toISOString().split('T')[0] });
    setErr(''); setModal('nueva');
  };

  const crearSuscripcion = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      await adminApi.post('/suscripciones', form);
      setModal(null);
      mostrarToast('ok', 'Suscripción creada correctamente');
      cargar();
    } catch (er) { setErr(er.response?.data?.error || 'Error al crear'); }
    finally { setGuardando(false); }
  };

  const extender = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      await adminApi.put(`/suscripciones/${modal.sus.id_suscripcion}`, { fecha_fin: extFecha });
      setModal(null);
      mostrarToast('ok', 'Suscripción extendida');
      cargar();
    } catch (er) { setErr(er.response?.data?.error || 'Error al extender'); }
    finally { setGuardando(false); }
  };

  const cancelar = async (sus) => {
    try {
      await adminApi.put(`/suscripciones/${sus.id_suscripcion}`, { estado: 'CANCELADA' });
      setConfirmCancel(null);
      mostrarToast('ok', `Suscripción de ${sus.empresa_nombre} cancelada`);
      cargar();
    } catch { mostrarToast('error', 'Error al cancelar'); }
  };

  const hayFiltros = filtroEmpresa || filtroEstado;

  return (
    <div className="max-w-6xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium
          ${toast.tipo === 'ok'
            ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'}`}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {toast.tipo === 'ok'
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Suscripciones</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            {!cargando && `${suscripciones.length} suscripción${suscripciones.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        <button
          onClick={abrirNueva}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                     text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva suscripción
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                     bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition">
          <option value="">Todas las empresas</option>
          {empresas.map(e => <option key={e.id_empresa} value={e.id_empresa}>{e.nombre}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="sm:w-44 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                     bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition">
          <option value="">Todos los estados</option>
          {['PRUEBA', 'ACTIVA', 'VENCIDA', 'CANCELADA'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setFiltroEmpresa(''); setFiltroEstado(''); }}
            className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200
                       border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors shrink-0">
            Limpiar
          </button>
        )}
      </div>

      {/* ── Tabla (md+) ── */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <tr>
              {['Empresa', 'Plan', 'Ciclo', 'Estado', 'Inicio', 'Fin', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {cargando
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              : suscripciones.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                      Sin suscripciones registradas
                    </td>
                  </tr>
                )
                : suscripciones.map(s => (
                  <tr key={s.id_suscripcion} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-zinc-800 dark:text-zinc-100">{s.empresa_nombre}</td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">{s.plan_nombre}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {s.ciclo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><EstadoBadge estado={s.estado} /></td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{s.fecha_inicio}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{s.fecha_fin}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setExtFecha(s.fecha_fin); setErr(''); setModal({ type: 'extender', sus: s }); }}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                          Extender
                        </button>
                        {s.estado !== 'CANCELADA' && (
                          <button
                            onClick={() => setConfirmCancel(s)}
                            className="text-xs font-medium text-red-500 hover:text-red-400">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* ── Cards (móvil) ── */}
      <div className="md:hidden space-y-3">
        {cargando
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : suscripciones.length === 0
            ? <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm py-8">Sin suscripciones registradas</p>
            : suscripciones.map(s => (
              <div key={s.id_suscripcion}
                   className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">{s.empresa_nombre}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.plan_nombre}</p>
                  </div>
                  <EstadoBadge estado={s.estado} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    <span className="text-zinc-400 dark:text-zinc-500">Ciclo: </span>
                    <span className="font-medium text-zinc-600 dark:text-zinc-300">{s.ciclo}</span>
                  </span>
                  {s.fecha_inicio && <span>Inicio: {s.fecha_inicio}</span>}
                  {s.fecha_fin    && <span>Fin: {s.fecha_fin}</span>}
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => { setExtFecha(s.fecha_fin); setErr(''); setModal({ type: 'extender', sus: s }); }}
                    className="flex-1 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                    Extender
                  </button>
                  {s.estado !== 'CANCELADA' && (
                    <button
                      onClick={() => setConfirmCancel(s)}
                      className="flex-1 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
        }
      </div>

      {/* ── Modal: Nueva suscripción ── */}
      {modal === 'nueva' && (
        <ModalShell title="Nueva suscripción" onClose={() => setModal(null)}>
          <form onSubmit={crearSuscripcion} className="overflow-y-auto">
            <div className="px-6 py-4 space-y-3">
              {err && <ErrAlert msg={err} />}

              {[
                { label: 'Empresa', key: 'id_empresa', type: 'select', opts: empresas.map(e => ({ v: e.id_empresa, l: e.nombre })) },
                { label: 'Plan',    key: 'id_plan',    type: 'select', opts: planes.map(p => ({ v: p.id_plan, l: p.nombre })) },
                { label: 'Ciclo',   key: 'ciclo',      type: 'select', opts: [{ v: 'MENSUAL', l: 'Mensual' }, { v: 'ANUAL', l: 'Anual' }] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    {label}<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <select
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required
                    className={INPUT_CLASS}
                  >
                    {key !== 'ciclo' && <option value="">Seleccionar...</option>}
                    {opts.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Fecha inicio<span className="text-red-400 ml-0.5">*</span>
                </label>
                <input type="date" required value={form.fecha_inicio}
                  onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                  className={INPUT_CLASS} />
              </div>
            </div>
            <ModalFooter onCancel={() => setModal(null)} guardando={guardando} label="Crear" />
          </form>
        </ModalShell>
      )}

      {/* ── Modal: Extender ── */}
      {modal?.type === 'extender' && (
        <ModalShell title={`Extender — ${modal.sus.empresa_nombre}`} onClose={() => setModal(null)}>
          <form onSubmit={extender} className="overflow-y-auto">
            <div className="px-6 py-4 space-y-3">
              {err && <ErrAlert msg={err} />}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="w-4 h-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Fecha fin actual: <span className="font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">{modal.sus.fecha_fin}</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Nueva fecha fin<span className="text-red-400 ml-0.5">*</span>
                </label>
                <input type="date" required value={extFecha}
                  onChange={e => setExtFecha(e.target.value)}
                  className={INPUT_CLASS} />
              </div>
            </div>
            <ModalFooter onCancel={() => setModal(null)} guardando={guardando} label="Guardar" />
          </form>
        </ModalShell>
      )}

      {/* ── Modal: Confirmar cancelación ── */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">¿Cancelar suscripción?</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{confirmCancel.empresa_nombre}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Esta acción cambiará el estado a <strong>CANCELADA</strong>. Se puede reactivar creando una nueva suscripción.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCancel(null)}
                className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold
                           text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Mantener
              </button>
              <button onClick={() => cancelar(confirmCancel)}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ErrAlert({ msg }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10
                    border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      {msg}
    </div>
  );
}

function ModalFooter({ onCancel, guardando, label }) {
  return (
    <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 shrink-0">
      <button type="button" onClick={onCancel}
        className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold
                   text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
        Cancelar
      </button>
      <button type="submit" disabled={guardando}
        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                   text-white text-sm font-semibold transition-colors">
        {guardando ? 'Guardando...' : label}
      </button>
    </div>
  );
}
