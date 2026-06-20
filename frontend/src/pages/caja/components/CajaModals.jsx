import { useState } from 'react';

function IconClose() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconCaja() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
    </svg>
  );
}
function IconUnlock() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function IconWarn() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

// ── Base modal wrapper ────────────────────────────────────────────────────────
function Modal({ onClose, icon, iconColor = 'emerald', title, children }) {
  const colorMap = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
    amber:   'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap[iconColor]}`}>
              {icon}
            </span>
            <h2 className="font-semibold text-zinc-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Componentes de formulario ─────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed';

// ── Modal crear / editar caja ─────────────────────────────────────────────────
export function ModalCaja({ caja, onConfirm, onClose, guardando, sucursales = [], defaultSucursal = null }) {
  const [form, setForm] = useState({
    nombre: caja?.nombre || '',
    descripcion: caja?.descripcion || '',
    id_sucursal: caja?.id_sucursal || defaultSucursal || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onConfirm(form);
  };

  return (
    <Modal
      onClose={onClose}
      icon={<IconCaja />}
      iconColor="emerald"
      title={caja ? 'Editar caja' : 'Nueva caja'}
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <Field label="Nombre *">
          <input
            autoFocus
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            className={inputCls}
            placeholder="Ej. Caja Principal"
            required
          />
        </Field>

        {sucursales.length > 0 && (
          <Field label="Sucursal">
            <select
              value={form.id_sucursal}
              onChange={e => set('id_sucursal', e.target.value)}
              className={inputCls}
            >
              <option value="">Mi sucursal</option>
              {sucursales.map(s => (
                <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Descripción">
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Opcional"
          />
        </Field>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Guardando...' : caja ? 'Guardar cambios' : 'Crear caja'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Modal abrir turno ─────────────────────────────────────────────────────────
export function ModalAbrirTurno({ cajas, onConfirm, onClose, guardando }) {
  const [form, setForm] = useState({ id_caja: '', monto_inicial: '', observaciones: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const cajasActivas = cajas.filter(c => c.activo == true || c.activo === 1);
  const sinCajas = cajasActivas.length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_caja) return;
    onConfirm({ ...form, monto_inicial: parseFloat(form.monto_inicial) || 0 });
  };

  return (
    <Modal
      onClose={onClose}
      icon={<IconUnlock />}
      iconColor="emerald"
      title="Abrir turno de caja"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {sinCajas && (
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
            <span className="shrink-0 text-amber-500 dark:text-amber-400 mt-0.5"><IconWarn /></span>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Sin cajas activas</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Cree al menos una caja desde la pestaña <strong>Cajas</strong> antes de abrir un turno.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <Field label="Caja *">
          <select
            value={form.id_caja}
            onChange={e => set('id_caja', e.target.value)}
            required
            disabled={sinCajas}
            className={inputCls}
          >
            <option value="">{sinCajas ? 'Sin cajas disponibles' : 'Seleccionar caja...'}</option>
            {cajasActivas.map(c => (
              <option key={c.id_caja} value={c.id_caja}>{c.nombre}</option>
            ))}
          </select>
        </Field>

        <Field label="Monto inicial (Bs)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.monto_inicial}
            onChange={e => set('monto_inicial', e.target.value)}
            disabled={sinCajas}
            className={inputCls}
            placeholder="0.00"
          />
        </Field>

        <Field label="Observaciones">
          <textarea
            rows={2}
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)}
            disabled={sinCajas}
            className={`${inputCls} resize-none`}
            placeholder="Opcional"
          />
        </Field>

        {!sinCajas && (
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              {guardando ? 'Abriendo...' : 'Abrir turno'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}

// ── Modal cerrar turno ────────────────────────────────────────────────────────
export function ModalCerrarTurno({ turno, onConfirm, onClose, guardando }) {
  const [form, setForm] = useState({ monto_final: '', observaciones: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fmtN = (n) => parseFloat(n || 0).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(turno.id_apertura, {
      monto_final: parseFloat(form.monto_final) || 0,
      observaciones: form.observaciones,
    });
  };

  return (
    <Modal
      onClose={onClose}
      icon={<IconLock />}
      iconColor="red"
      title="Cerrar turno — Arqueo"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Resumen del turno */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
          {[
            ['Caja', turno.caja_nombre],
            ['Monto inicial', `Bs ${fmtN(turno.monto_inicial)}`],
            ['Apertura', new Date(turno.fecha_apertura).toLocaleString('es-BO')],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5">
              <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{val}</span>
            </div>
          ))}
        </div>

        <Field label="Monto contado en caja (Bs) *">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.monto_final}
            onChange={e => set('monto_final', e.target.value)}
            required
            autoFocus
            className={inputCls}
            placeholder="0.00"
          />
          <p className="text-xs text-zinc-400 mt-1.5">El sistema calculará la diferencia automáticamente.</p>
        </Field>

        <Field label="Observaciones de cierre">
          <textarea
            rows={2}
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Opcional"
          />
        </Field>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-xl disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Cerrando...' : 'Cerrar turno'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
