import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';

const ESTADO_BADGE = {
  ACTIVA:    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  PRUEBA:    'bg-amber-50   dark:bg-amber-500/10   text-amber-700   dark:text-amber-400',
  VENCIDA:   'bg-red-50     dark:bg-red-500/10     text-red-700     dark:text-red-400',
  CANCELADA: 'bg-zinc-100   dark:bg-zinc-700       text-zinc-600    dark:text-zinc-400',
};

const EMPTY_FORM = {
  nombre: '', nit: '', direccion: '', ciudad: '', telefono: '', correo: '',
  nombre_admin: '', apellido_admin: '', ci_admin: '', correo_admin: '', contrasena_admin: '',
};

const EMPRESA_FIELDS = [
  { key: 'nombre',    label: 'Nombre',           type: 'text',  req: true },
  { key: 'nit',       label: 'NIT',              type: 'text',  req: false },
  { key: 'direccion', label: 'Dirección',        type: 'text',  req: false },
  { key: 'ciudad',    label: 'Ciudad',           type: 'text',  req: false },
  { key: 'telefono',  label: 'Teléfono',         type: 'text',  req: false },
  { key: 'correo',    label: 'Correo empresa',   type: 'email', req: false },
];

const ADMIN_FIELDS = [
  { key: 'nombre_admin',    label: 'Nombre',     type: 'text',     req: true },
  { key: 'apellido_admin',  label: 'Apellido',   type: 'text',     req: true },
  { key: 'ci_admin',        label: 'CI',         type: 'text',     req: true },
  { key: 'correo_admin',    label: 'Correo',     type: 'email',    req: true },
  { key: 'contrasena_admin',label: 'Contraseña', type: 'password', req: true },
];

function Field({ label, req, type, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
        {label}{req && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={req}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                   bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
      />
    </div>
  );
}

function EstadoBadge({ estado }) {
  if (!estado) return <span className="text-xs text-zinc-400">Sin suscripción</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${ESTADO_BADGE[estado] ?? ESTADO_BADGE.CANCELADA}`}>
      {estado}
    </span>
  );
}

function ActivoBadge({ activo }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
      ${activo
        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${[60,40,50,55,60,45,70][i]}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-5 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function Empresas() {
  const [empresas,  setEmpresas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [busqueda,  setBusqueda]  = useState('');
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);
  const [err,       setErr]       = useState('');
  const [toast,     setToast]     = useState(null);
  const navigate = useNavigate();

  const cargar = useCallback(() => {
    setCargando(true);
    adminApi.get('/empresas')
      .then(({ data }) => setEmpresas(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const abrirCrear = () => { setForm(EMPTY_FORM); setErr(''); setModal('crear'); };
  const abrirEditar = (e) => {
    setForm({ nombre: e.nombre, nit: e.nit || '', direccion: e.direccion || '',
              ciudad: e.ciudad || '', telefono: e.telefono || '', correo: e.correo || '',
              nombre_admin: '', apellido_admin: '', ci_admin: '', correo_admin: '', contrasena_admin: '' });
    setErr('');
    setModal(e);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setErr('');
    try {
      if (modal === 'crear') {
        await adminApi.post('/empresas', form);
        mostrarToast('ok', 'Empresa creada correctamente');
      } else {
        await adminApi.put(`/empresas/${modal.id_empresa}`, form);
        mostrarToast('ok', 'Empresa actualizada');
      }
      setModal(null);
      cargar();
    } catch (er) {
      setErr(er.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (empresa) => {
    try {
      await adminApi.patch(`/empresas/${empresa.id_empresa}/toggle`);
      mostrarToast('ok', `Empresa ${empresa.activo ? 'desactivada' : 'activada'}`);
      cargar();
    } catch {
      mostrarToast('error', 'Error al cambiar estado');
    }
  };

  const lista = busqueda.trim()
    ? empresas.filter(e => {
        const q = busqueda.toLowerCase();
        return e.nombre?.toLowerCase().includes(q)
            || e.ciudad?.toLowerCase().includes(q)
            || e.nit?.toLowerCase().includes(q)
            || e.plan_nombre?.toLowerCase().includes(q);
      })
    : empresas;

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
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Empresas</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            {!cargando && `${empresas.length} empresa${empresas.length !== 1 ? 's' : ''} registrada${empresas.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                     text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva empresa
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-4 relative">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre, NIT, ciudad o plan..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                     bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
        />
      </div>

      {/* ── Tabla (md+) ── */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <tr>
              {['Empresa', 'Ciudad', 'Plan', 'Suscripción', 'Vence', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {cargando
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              : lista.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                      {busqueda ? 'Sin resultados para la búsqueda' : 'Sin empresas registradas'}
                    </td>
                  </tr>
                )
                : lista.map(e => (
                  <tr key={e.id_empresa} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{e.nombre}</p>
                      {e.nit && <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">NIT: {e.nit}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 dark:text-zinc-400">{e.ciudad || '—'}</td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">{e.plan_nombre || '—'}</td>
                    <td className="px-4 py-3.5"><EstadoBadge estado={e.sus_estado} /></td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">{e.fecha_fin || '—'}</td>
                    <td className="px-4 py-3.5"><ActivoBadge activo={e.activo} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => abrirEditar(e)}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                          Editar
                        </button>
                        <button onClick={() => navigate(`/suscripciones?empresa=${e.id_empresa}`)}
                          className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100">
                          Suscripciones
                        </button>
                        <button onClick={() => toggleActivo(e)}
                          className={`text-xs font-medium ${e.activo ? 'text-red-500 hover:text-red-400' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'}`}>
                          {e.activo ? 'Desactivar' : 'Activar'}
                        </button>
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
          : lista.length === 0
            ? (
              <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm py-8">
                {busqueda ? 'Sin resultados para la búsqueda' : 'Sin empresas registradas'}
              </p>
            )
            : lista.map(e => (
              <div key={e.id_empresa}
                   className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">{e.nombre}</p>
                    {e.nit && <p className="text-[11px] text-zinc-400 mt-0.5">NIT: {e.nit}</p>}
                  </div>
                  <ActivoBadge activo={e.activo} />
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {e.ciudad && <span>{e.ciudad}</span>}
                  {e.plan_nombre && <span className="font-medium text-zinc-600 dark:text-zinc-300">{e.plan_nombre}</span>}
                  {e.fecha_fin && <span>Vence: {e.fecha_fin}</span>}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  <EstadoBadge estado={e.sus_estado} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button onClick={() => abrirEditar(e)}
                    className="flex-1 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button onClick={() => navigate(`/suscripciones?empresa=${e.id_empresa}`)}
                    className="flex-1 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    Suscripciones
                  </button>
                  <button onClick={() => toggleActivo(e)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors
                      ${e.activo
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}>
                    {e.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))
        }
      </div>

      {/* ── Modal crear / editar ── */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800
                          shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                {modal === 'crear' ? 'Nueva empresa' : `Editar: ${modal.nombre}`}
              </h2>
              <button onClick={() => setModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400
                           hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={guardar} className="overflow-y-auto flex-1">
              <div className="px-6 py-4 space-y-3">
                {err && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10
                                  border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {err}
                  </div>
                )}

                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Datos de la empresa
                </p>
                {EMPRESA_FIELDS.map(({ key, label, type, req }) => (
                  <Field key={key} label={label} req={req} type={type}
                    value={form[key]} onChange={ev => setForm(f => ({ ...f, [key]: ev.target.value }))} />
                ))}

                {modal === 'crear' && (
                  <>
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">
                        Administrador inicial
                      </p>
                      <div className="space-y-3">
                        {ADMIN_FIELDS.map(({ key, label, type, req }) => (
                          <Field key={key} label={label} req={req} type={type}
                            value={form[key]} onChange={ev => setForm(f => ({ ...f, [key]: ev.target.value }))} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 shrink-0">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold
                             text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                             text-white text-sm font-semibold transition-colors">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
