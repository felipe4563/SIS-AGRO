import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import movimientosService from '../../services/movimientos.service';
import categoriasMovimientoService from '../../services/categoriasMovimiento.service';
import sucursalService from '../../services/sucursal.service';
import { usePermission } from '../../hooks/usePermission';
import TablaLibroCaja from './components/TablaLibroCaja';
import MovimientoModal from './components/MovimientoModal';
import CategoriasModal from './components/CategoriasModal';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all max-w-xs sm:max-w-sm ${
      toast.tipo === 'ok'
        ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
    }`}>
      <span className="shrink-0">{toast.tipo === 'ok' ? '✅' : '⚠️'}</span>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

function fmtMonto(n) {
  return parseFloat(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 });
}

function fechaDefecto() {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const hasta = hoy.toISOString().split('T')[0];
  return { desde, hasta };
}

export default function LibroCaja() {
  const { puede } = usePermission();
  const puedeVer      = puede('ver',      'movimientos');
  const puedeCrear    = puede('crear',    'movimientos');
  const puedeEditar   = puede('editar',   'movimientos');
  const puedeEliminar = puede('eliminar', 'movimientos');
  const puedeVerTodas = puede('ver_todas','movimientos');
  const puedeGestCats = puede('gestionar','categorias_movimiento');

  const [datos, setDatos]       = useState({ movimientos: [], resumen: { total_ingresos: '0.00', total_egresos: '0.00', balance: '0.00' } });
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [toast, setToast]         = useState(null);
  const [filtros, setFiltros]     = useState({ ...fechaDefecto(), id_sucursal: '', tipo: '' });
  const [modalMov, setModalMov]   = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalCats, setModalCats] = useState(false);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarDatos = useCallback(async (f) => {
    setCargando(true);
    try {
      const params = {};
      if (f.desde)       params.desde        = f.desde;
      if (f.hasta)       params.hasta        = f.hasta;
      if (f.id_sucursal) params.id_sucursal  = f.id_sucursal;
      if (f.tipo)        params.tipo         = f.tipo;
      const res = await movimientosService.libroCaja(params);
      setDatos(res.data);
    } catch {
      mostrarToast('error', 'Error al cargar el libro de caja');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const res = await categoriasMovimientoService.listar();
      setCategorias(res.data);
    } catch { /* silencioso */ }
  }, []);

  const cargarSucursales = useCallback(async () => {
    if (!puedeVerTodas) return;
    try {
      const res = await sucursalService.listar();
      setSucursales(res.data);
    } catch { /* silencioso */ }
  }, [puedeVerTodas]);

  useEffect(() => {
    if (puedeVer) {
      cargarDatos(filtros);
      cargarCategorias();
      cargarSucursales();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(f => ({ ...f, [name]: value }));
  };

  const aplicarFiltros = () => cargarDatos(filtros);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return;
    try {
      await movimientosService.eliminar(id);
      mostrarToast('ok', 'Movimiento eliminado');
      cargarDatos(filtros);
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleGuardado = () => {
    setModalMov({ abierto: false, modo: 'crear', datos: null });
    mostrarToast('ok', 'Movimiento guardado correctamente');
    cargarDatos(filtros);
    cargarCategorias();
  };

  const handleCatsActualizado = () => cargarCategorias();

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
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver el libro de caja. Contacta al administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  const { total_ingresos, total_egresos, balance } = datos.resumen;
  const balanceNum = parseFloat(balance);

  const inputClass = 'px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none';

  return (
    <PageWrapper>
      <Toast toast={toast} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          📒 Libro de Caja
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Flujo completo: ventas, compras y movimientos manuales.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-5 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Desde</label>
          <input type="date" name="desde" value={filtros.desde} onChange={handleFiltro} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Hasta</label>
          <input type="date" name="hasta" value={filtros.hasta} onChange={handleFiltro} className={inputClass} />
        </div>
        {puedeVerTodas && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Sucursal</label>
            <select name="id_sucursal" value={filtros.id_sucursal} onChange={handleFiltro} className={inputClass}>
              <option value="">Todas</option>
              {sucursales.map(s => (
                <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Tipo</label>
          <select name="tipo" value={filtros.tipo} onChange={handleFiltro} className={inputClass}>
            <option value="">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
        </div>
        <button onClick={aplicarFiltros}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors">
          Aplicar
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Bs. {fmtMonto(total_ingresos)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-1">Total Egresos</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">Bs. {fmtMonto(total_egresos)}</p>
        </div>
        <div className={`border rounded-xl p-4 ${
          balanceNum >= 0
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-xs font-semibold uppercase mb-1 ${balanceNum >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>Balance</p>
          <p className={`text-2xl font-bold ${balanceNum >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
            Bs. {fmtMonto(balance)}
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 mb-4">
        {puedeCrear && (
          <button
            onClick={() => setModalMov({ abierto: true, modo: 'crear', datos: null })}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors"
          >
            + Nuevo movimiento
          </button>
        )}
        {puedeGestCats && (
          <button
            onClick={() => setModalCats(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors"
          >
            ⚙ Categorías
          </button>
        )}
      </div>

      {/* Tabla */}
      <TablaLibroCaja
        movimientos={datos.movimientos}
        cargando={cargando}
        onEditar={(mov) => setModalMov({ abierto: true, modo: 'editar', datos: mov })}
        onEliminar={handleEliminar}
        puedeEditar={puedeEditar}
        puedeEliminar={puedeEliminar}
      />

      {/* Modales */}
      <MovimientoModal
        modal={modalMov}
        categorias={categorias}
        sucursales={sucursales}
        puedeVerTodas={puedeVerTodas}
        onClose={() => setModalMov({ abierto: false, modo: 'crear', datos: null })}
        onGuardado={handleGuardado}
      />
      <CategoriasModal
        abierto={modalCats}
        onClose={() => setModalCats(false)}
        onActualizado={handleCatsActualizado}
      />
    </PageWrapper>
  );
}
