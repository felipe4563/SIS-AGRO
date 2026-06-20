import { useState } from 'react';

export default function ModalAbono({ titulo, saldoPendiente, onConfirm, onClose, guardando }) {
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const m = parseFloat(monto);
    if (!m || m <= 0) return alert('Ingrese un monto válido');
    if (m > saldoPendiente + 0.01) return alert(`El abono no puede superar el saldo (Bs ${saldoPendiente.toFixed(2)})`);
    onConfirm({ monto: m, metodo_pago: metodoPago, observaciones });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-700">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">{titulo}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex justify-between items-center">
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Saldo pendiente</span>
            <span className="text-lg font-black text-amber-700 dark:text-amber-400">Bs {saldoPendiente.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Monto del abono (Bs) *</label>
            <input
              type="number" min="0.01" step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder={`Máx. ${saldoPendiente.toFixed(2)}`}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-right font-bold text-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Método de pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="QR">QR</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Observaciones</label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. pago parcial de cuota 1"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
              {guardando ? 'Guardando...' : 'Registrar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
