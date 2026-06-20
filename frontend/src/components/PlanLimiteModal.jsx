import { FaLock, FaTimes, FaArrowUp } from 'react-icons/fa';

/**
 * Modal que se muestra cuando el backend devuelve 403 por límite de plan.
 * Props:
 *   mensaje  — string con el texto del error (viene del backend)
 *   onClose  — función para cerrar
 */
export default function PlanLimiteModal({ mensaje, onClose }) {
  if (!mensaje) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm">

        {/* Encabezado */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <FaLock className="text-amber-500 dark:text-amber-400 text-base" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-800 dark:text-white text-base">
                Límite del plan alcanzado
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Actualiza tu plan para continuar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mt-0.5"
          >
            <FaTimes />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            {mensaje}
          </div>
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                       text-sm font-medium text-zinc-600 dark:text-zinc-400
                       hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Entendido
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold
                       shadow-sm transition-colors"
          >
            <FaArrowUp className="text-xs" />
            Mejorar plan
          </button>
        </div>
      </div>
    </div>
  );
}
