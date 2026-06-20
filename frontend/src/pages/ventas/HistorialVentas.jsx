import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import TablaVentas from './components/TablaVentas';
import ventaService from '../../services/venta.service';
import { usePermission } from '../../hooks/usePermission';

function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.tipo === 'ok';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
                     shadow-xl border text-sm font-medium max-w-xs sm:max-w-sm transition-all ${
      ok
        ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
    }`}>
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        {ok
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />}
      </svg>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

const toLocalDateStr = (d = new Date()) => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const hoy          = toLocalDateStr();
const primerDiaMes = toLocalDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

export default function HistorialVentas() {
  const { puede }  = usePermission();
  const navigate   = useNavigate();

  const [ventas,    setVentas]    = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [toast,     setToast]     = useState(null);

  const [busqueda,      setBusqueda]      = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [fechaDesde,    setFechaDesde]    = useState(primerDiaMes);
  const [fechaHasta,    setFechaHasta]    = useState(hoy);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await ventaService.listar();
      setVentas(res.data);
    } catch {
      mostrarToast('error', 'Error al cargar el historial de ventas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const ventasFiltradas = useMemo(() => {
    let lista = ventas;
    if (filtroEstado) lista = lista.filter(v => v.estado === filtroEstado);
    if (fechaDesde) {
      lista = lista.filter(v => toLocalDateStr(v.fecha_venta) >= fechaDesde);
    }
    if (fechaHasta) {
      lista = lista.filter(v => toLocalDateStr(v.fecha_venta) <= fechaHasta);
    }
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      lista = lista.filter(v => {
        const cliente  = `${v.cliente_nombre || ''} ${v.cliente_apellido || ''}`.toLowerCase();
        const vendedor = `${v.usuario_nombre || ''} ${v.usuario_apellido || ''}`.toLowerCase();
        const factura  = (v.nro_factura || '').toLowerCase();
        return cliente.includes(b) || vendedor.includes(b) || factura.includes(b) || String(v.id_venta).includes(b);
      });
    }
    return lista;
  }, [ventas, busqueda, filtroEstado, fechaDesde, fechaHasta]);

  const handleAnular = async (venta) => {
    if (!window.confirm(`¿Anular la venta #${venta.id_venta}? Se devolverá el stock al inventario.`)) return;
    try {
      await ventaService.anular(venta.id_venta);
      mostrarToast('ok', 'Venta anulada. Stock retornado.');
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al anular la venta');
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
    setFechaDesde(primerDiaMes);
    setFechaHasta(hoy);
  };

  const hayFiltros = busqueda || filtroEstado || fechaDesde !== primerDiaMes || fechaHasta !== hoy;

  return (
    <PageWrapper>
      <Toast toast={toast} />

      {/* ── Cabecera ── */}
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none"
                 stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
            </svg>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Registro de Ventas</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-7">
            Historial de todas las transacciones realizadas.
          </p>
        </div>
        {puede('crear', 'ventas') && (
          <button
            onClick={() => navigate('/ventas/nueva')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                       bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Punto de Venta
          </button>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className="mb-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
                      rounded-2xl p-3 space-y-2.5">

        {/* Búsqueda + estado */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                 fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar cliente, vendedor, factura o N°..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800
                         border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm
                         outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                       rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
          >
            <option value="">Todos los estados</option>
            <option value="COMPLETADA">Completada</option>
            <option value="ANULADA">Anulada</option>
            <option value="PENDIENTE">Pendiente</option>
          </select>
        </div>

        {/* Fechas + limpiar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs text-zinc-500 shrink-0">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="flex-1 min-w-0 px-2 py-2 bg-zinc-50 dark:bg-zinc-800
                         border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm
                         outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <label className="text-xs text-zinc-500 shrink-0">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="flex-1 min-w-0 px-2 py-2 bg-zinc-50 dark:bg-zinc-800
                         border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm
                         outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800
                         dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700
                         rounded-xl transition-colors shrink-0"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contador */}
      {!cargando && (
        <p className="text-xs text-zinc-400 mb-3">
          {ventasFiltradas.length} de {ventas.length} ventas
        </p>
      )}

      <TablaVentas
        ventas={ventasFiltradas}
        cargando={cargando}
        onVerDetalle={(v) => navigate(`/ventas/${v.id_venta}/ticket`)}
        onAnular={handleAnular}
      />
    </PageWrapper>
  );
}
