import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const MODULOS_DISPONIBLES = [
  { key: 'ventas',              label: 'Ventas',              icon: '🛒' },
  { key: 'caja',                label: 'Caja',                icon: '💰' },
  { key: 'clientes',            label: 'Clientes',            icon: '👥' },
  { key: 'inventario',          label: 'Inventario',          icon: '📦' },
  { key: 'qr',                  label: 'Pagos QR',            icon: '📲' },
  { key: 'reportes_basicos',    label: 'Reportes básicos',    icon: '📊' },
  { key: 'compras',             label: 'Compras',             icon: '🧾' },
  { key: 'proveedores',         label: 'Proveedores',         icon: '🚚' },
  { key: 'traslados',           label: 'Traslados',           icon: '🔄' },
  { key: 'libro_caja',          label: 'Libro de caja',       icon: '📒' },
  { key: 'reportes_avanzados',  label: 'Reportes avanzados',  icon: '📈' },
  { key: 'roles',               label: 'Gestión de roles',    icon: '🔐' },
  { key: 'soporte_prioritario', label: 'Soporte prioritario', icon: '⭐' },
];

const PLAN_ACCENT = ['indigo', 'emerald', 'amber', 'violet'];

const ACCENT = {
  indigo:  { ring: 'focus:ring-indigo-500/40',  btn: 'bg-indigo-600 hover:bg-indigo-500',  chip: 'bg-indigo-600 border-indigo-600 text-white', dot: 'bg-indigo-500',  header: 'border-indigo-100 dark:border-indigo-500/20' },
  emerald: { ring: 'focus:ring-emerald-500/40', btn: 'bg-emerald-600 hover:bg-emerald-500', chip: 'bg-emerald-600 border-emerald-600 text-white', dot: 'bg-emerald-500', header: 'border-emerald-100 dark:border-emerald-500/20' },
  amber:   { ring: 'focus:ring-amber-500/40',   btn: 'bg-amber-500 hover:bg-amber-400',    chip: 'bg-amber-500 border-amber-500 text-white',    dot: 'bg-amber-500',   header: 'border-amber-100 dark:border-amber-500/20' },
  violet:  { ring: 'focus:ring-violet-500/40',  btn: 'bg-violet-600 hover:bg-violet-500',  chip: 'bg-violet-600 border-violet-600 text-white',  dot: 'bg-violet-500',  header: 'border-violet-100 dark:border-violet-500/20' },
};

const NUM_FIELDS = [
  { label: 'Precio mensual',  field: 'precio_mensual', suffix: 'Bs' },
  { label: 'Precio anual',    field: 'precio_anual',   suffix: 'Bs' },
  { label: 'Max sucursales',  field: 'max_sucursales', hint: '0 = ilimitado' },
  { label: 'Max usuarios',    field: 'max_usuarios',   hint: '0 = ilimitado' },
  { label: 'Max productos',   field: 'max_productos',  hint: 'vacío = ilimitado' },
];

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
        <div className="pt-2 grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Planes() {
  const [planes,   setPlanes]   = useState([]);
  const [edits,    setEdits]    = useState({});
  const [saving,   setSaving]   = useState({});
  const [msgs,     setMsgs]     = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    adminApi.get('/planes')
      .then(({ data }) => {
        setPlanes(data);
        const init = {};
        data.forEach(p => {
          init[p.id_plan] = {
            precio_mensual: p.precio_mensual,
            precio_anual:   p.precio_anual,
            max_sucursales: p.max_sucursales,
            max_usuarios:   p.max_usuarios,
            max_productos:  p.max_productos ?? '',
            modulos: Array.isArray(p.modulos)
              ? p.modulos
              : (typeof p.modulos === 'string' ? JSON.parse(p.modulos) : []),
          };
        });
        setEdits(init);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const changeField = (id, field, val) =>
    setEdits(e => ({ ...e, [id]: { ...e[id], [field]: val } }));

  const toggleModulo = (id, modulo) => {
    setEdits(e => {
      const raw = e[id]?.modulos;
      const actuales = Array.isArray(raw)
        ? raw
        : (typeof raw === 'string' ? JSON.parse(raw) : []);
      const nuevos = actuales.includes(modulo)
        ? actuales.filter(m => m !== modulo)
        : [...actuales, modulo];
      return { ...e, [id]: { ...e[id], modulos: nuevos } };
    });
  };

  const guardar = async (plan) => {
    const id = plan.id_plan;
    setSaving(s => ({ ...s, [id]: true }));
    setMsgs(m => ({ ...m, [id]: '' }));
    try {
      await adminApi.put(`/planes/${id}`, {
        ...edits[id],
        max_productos: edits[id].max_productos !== '' ? parseInt(edits[id].max_productos) : null,
      });
      setMsgs(m => ({ ...m, [id]: 'ok' }));
      setTimeout(() => setMsgs(m => ({ ...m, [id]: '' })), 2500);
    } catch (er) {
      setMsgs(m => ({ ...m, [id]: er.response?.data?.error || 'Error al guardar' }));
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Planes</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Configura precios y módulos disponibles por plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cargando
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : planes.map((plan, i) => {
              const e       = edits[plan.id_plan] || {};
              const mods    = e.modulos ?? [];
              const accent  = PLAN_ACCENT[i % 4];
              const ac      = ACCENT[accent];

              return (
                <div key={plan.id_plan}
                     className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col">

                  {/* Card header */}
                  <div className={`flex items-center justify-between px-5 py-4 border-b ${ac.header} dark:border-zinc-800`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ac.dot}`} />
                      <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{plan.nombre}</h2>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                      {mods.length}/{MODULOS_DISPONIBLES.length} módulos
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-5 flex-1">

                    {/* Campos numéricos */}
                    <div className="grid grid-cols-2 gap-3">
                      {NUM_FIELDS.map(({ label, field, suffix, hint }) => (
                        <div key={field}>
                          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            {label}
                            {(suffix || hint) && (
                              <span className="ml-1 font-normal text-zinc-400">
                                {suffix ? `(${suffix})` : `(${hint})`}
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={e[field] ?? ''}
                            onChange={ev => changeField(plan.id_plan, field, ev.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                                        bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm
                                        focus:outline-none focus:ring-2 transition ${ac.ring}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Módulos */}
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
                        Módulos incluidos
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {MODULOS_DISPONIBLES.map(({ key, label, icon }) => {
                          const activo = mods.includes(key);
                          return (
                            <label
                              key={key}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer
                                          border text-xs font-medium select-none transition-all
                                          ${activo
                                            ? `${ac.chip} shadow-sm`
                                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                                          }`}
                            >
                              <input type="checkbox" checked={activo}
                                onChange={() => toggleModulo(plan.id_plan, key)}
                                className="hidden" />
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors
                                ${activo ? 'bg-white/20 border-white/40' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                {activo && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className="text-[10px] mr-0.5">{icon}</span>
                              <span className="truncate">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer acción */}
                    <div className="flex items-center gap-3 pt-1 mt-auto">
                      <button
                        onClick={() => guardar(plan)}
                        disabled={saving[plan.id_plan]}
                        className={`px-5 py-2 rounded-xl text-white text-sm font-semibold
                                    disabled:opacity-50 transition-colors shadow-sm ${ac.btn}`}
                      >
                        {saving[plan.id_plan] ? 'Guardando...' : 'Guardar cambios'}
                      </button>

                      {msgs[plan.id_plan] && (
                        msgs[plan.id_plan] === 'ok' ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Guardado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            {msgs[plan.id_plan]}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
