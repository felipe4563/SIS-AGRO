import { useRef, useState } from 'react';

// Notificación flotente reutilizable — mismo look que se usaba duplicado en 16+ páginas.
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3
                     px-4 py-3 rounded-xl shadow-xl border text-sm font-medium
                     transition-all duration-300 max-w-xs sm:max-w-sm
                     ${toast.tipo === 'ok'
                       ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                       : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
                     }`}>
      <span className="shrink-0">{toast.tipo === 'ok' ? '✅' : '⚠️'}</span>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

// Hook compañero: const { toast, mostrarToast } = useToast(); <Toast toast={toast} />
export function useToast(duracionMs = 3500) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const mostrarToast = (tipo, msg) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ tipo, msg });
    timeoutRef.current = setTimeout(() => setToast(null), duracionMs);
  };

  return { toast, mostrarToast };
}
