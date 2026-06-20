import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import TablaCompras from './components/TablaCompras';
import DetalleCompraModal from './components/DetalleCompraModal';
import compraService from '../../services/compra.service';
import { usePermission } from '../../hooks/usePermission';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 max-w-xs sm:max-w-sm ${
      toast.tipo === 'ok'
        ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
    }`}>
      <span className="shrink-0">{toast.tipo === 'ok' ? '✅' : '⚠️'}</span>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

export default function Compras() {
  const { puede } = usePermission();
  const puedeVer = puede('ver', 'compras');
  const navigate = useNavigate();

  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);

  const [detalleId, setDetalleId] = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await compraService.listar();
      setCompras(res.data);
    } catch (err) {
      mostrarToast('error', 'Error al cargar el historial de compras');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (puedeVer) cargarDatos();
  }, [cargarDatos, puedeVer]);

  const handleVerDetalle = (compra) => {
    setDetalleId(compra.id_compra);
  };

  const handleConfirmar = async (compra) => {
    if (!window.confirm('¿Estás seguro de confirmar la recepción? Esta acción ingresará el stock al Almacén y no se puede deshacer de forma sencilla.')) {
      return;
    }
    
    try {
      await compraService.confirmar(compra.id_compra);
      mostrarToast('ok', 'Compra confirmada. Lotes ingresados al Almacén.');
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al confirmar la compra');
    }
  };

  const handleAnular = async (compra) => {
    if (!window.confirm('¿Anular esta compra PENDIENTE?')) return;

    try {
      await compraService.anular(compra.id_compra);
      mostrarToast('ok', 'Compra anulada.');
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al anular compra');
    }
  };

  if (!puedeVer) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver el historial de compras. Contacta al administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Toast toast={toast} />

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            🛒 Compras e Ingresos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Historial de compras realizadas a proveedores.
          </p>
        </div>
        {puede('crear', 'compras') && (
          <button
            onClick={() => navigate('/compras/nueva')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Compra
          </button>
        )}
      </div>

      <TablaCompras
        compras={compras}
        cargando={cargando}
        onVerDetalle={handleVerDetalle}
        onConfirmar={handleConfirmar}
        onAnular={handleAnular}
      />

      {detalleId && (
        <DetalleCompraModal
          compraId={detalleId}
          onClose={() => setDetalleId(null)}
        />
      )}

    </PageWrapper>
  );
}
