import { useState, useEffect, useCallback, useMemo } from 'react';
import PageWrapper from '../../components/PageWrapper';
import TablaProductos from './components/TablaProductos';
import { ModalCrearEditar, ModalEliminar, ModalImagen } from './components/ProductoModals';
import productoService from '../../services/producto.service';
import catalogoService from '../../services/catalogo.service';
import { usePermission } from '../../hooks/usePermission';
import PlanLimiteModal from '../../components/PlanLimiteModal';

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

export default function Productos() {
  const { puede } = usePermission();
  const puedeVer = puede('ver', 'productos');

  const [productos, setProductos] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [conversiones, setConversiones] = useState([]);
  const [fraccionesIniciales, setFraccionesIniciales] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroClasificacion, setFiltroClasificacion] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);
  const [mensajeLimite, setMensajeLimite] = useState(null);

  const [modalType, setModalType] = useState(null);
  const [productoActivo, setProductoActivo] = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resProd, resClas, resMar, resUni, resConv] = await Promise.all([
        productoService.listar(),
        catalogoService.listarClasificaciones(),
        catalogoService.listarMarcas(),
        catalogoService.listarUnidades(),
        catalogoService.listarConversiones(),
      ]);
      setProductos(resProd.data);
      setClasificaciones(resClas.data);
      setMarcas(resMar.data);
      setUnidades(resUni.data);
      setConversiones(resConv.data);
    } catch (err) {
      mostrarToast('error', 'Error al cargar los datos. Verifica tu conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (puedeVer) cargarDatos();
  }, [cargarDatos, puedeVer]);

  const handleCrear = () => {
    setProductoActivo(null);
    setModalType('crear');
  };

  const handleEditar = async (p) => {
    setProductoActivo(p);
    setFraccionesIniciales([]);
    try {
      const res = await productoService.listarFracciones(p.id_producto);
      setFraccionesIniciales(res.data);
    } catch {
      // si falla simplemente abre sin fracciones precargadas
    }
    setModalType('editar');
  };

  const handleEliminar = (p) => {
    setProductoActivo(p);
    setModalType('eliminar');
  };

  const handleGestionarImagen = (p) => {
    setProductoActivo(p);
    setModalType('imagen');
  };

  const handleGuardarProducto = async ({ fracciones, ...formData }) => {
    setGuardando(true);
    try {
      let id_producto;
      if (modalType === 'crear') {
        const res = await productoService.crear(formData);
        id_producto = res.data.id_producto;
        mostrarToast('ok', 'Producto creado correctamente');
      } else {
        await productoService.editar(productoActivo.id_producto, formData);
        id_producto = productoActivo.id_producto;
        mostrarToast('ok', 'Producto actualizado correctamente');
      }
      // Guardar fracciones solo si el toggle está activo (no borrar al deshabilitar)
      if (formData.permite_fraccion && Array.isArray(fracciones)) {
        await productoService.guardarFracciones(id_producto, fracciones);
      }
      setModalType(null);
      await cargarDatos();
    } catch (err) {
      if (err.response?.status === 403) {
        setModalType(null);
        setMensajeLimite(err.response.data?.error);
      } else {
        mostrarToast('error', err.response?.data?.error || 'Error al guardar producto');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!productoActivo) return;
    setGuardando(true);
    try {
      await productoService.eliminar(productoActivo.id_producto);
      mostrarToast('ok', 'Producto desactivado');
      setModalType(null);
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al desactivar producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleSubirImagen = async (formData) => {
    setGuardando(true);
    try {
      await productoService.subirImagen(productoActivo.id_producto, formData);
      mostrarToast('ok', 'Imagen actualizada correctamente');
      setModalType(null);
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al subir imagen');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarImagen = async () => {
    setGuardando(true);
    try {
      await productoService.eliminarImagen(productoActivo.id_producto);
      mostrarToast('ok', 'Imagen eliminada');
      setModalType(null);
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al eliminar imagen');
    } finally {
      setGuardando(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (filtroClasificacion && String(p.id_clasificacion) !== filtroClasificacion) return false;
      if (filtroMarca && String(p.id_marca) !== filtroMarca) return false;
      if (q && !p.nombre.toLowerCase().includes(q) && !(p.codigo_barras || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [productos, busqueda, filtroClasificacion, filtroMarca]);

  const hayFiltros = busqueda || filtroClasificacion || filtroMarca;

  const handleToggleActivo = async (p) => {
    try {
      const nuevoEstado = p.activo ? 0 : 1;
      await productoService.toggleActivo(p.id_producto, nuevoEstado);
      setProductos(prev => prev.map(prod => 
        prod.id_producto === p.id_producto ? { ...prod, activo: nuevoEstado } : prod
      ));
      mostrarToast('ok', `Producto ${nuevoEstado ? 'activado' : 'desactivado'}`);
    } catch (err) {
      mostrarToast('error', 'Error al cambiar estado');
      await cargarDatos();
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
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver el catálogo de productos. Contacta al administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Toast toast={toast} />
      <PlanLimiteModal mensaje={mensajeLimite} onClose={() => setMensajeLimite(null)} />

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            📦 Gestión de Productos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Administra el catálogo, precios y configuración de stock.
          </p>
        </div>
        {puede('crear', 'productos') && (
          <button
            onClick={handleCrear}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        )}
      </div>

      {/* ── Barra de filtros ── */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filtroClasificacion}
          onChange={(e) => setFiltroClasificacion(e.target.value)}
          className="sm:w-44 px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas las categorías</option>
          {clasificaciones.map((c) => (
            <option key={c.id_clasificacion} value={String(c.id_clasificacion)}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
          className="sm:w-40 px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m.id_marca} value={String(m.id_marca)}>{m.nombre}</option>
          ))}
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setBusqueda(''); setFiltroClasificacion(''); setFiltroMarca(''); }}
            className="px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
            title="Limpiar filtros"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      <TablaProductos
        productos={productosFiltrados}
        cargando={cargando}
        hayFiltros={!!hayFiltros}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onToggleActivo={handleToggleActivo}
        onGestionarImagen={handleGestionarImagen}
      />

      {(modalType === 'crear' || modalType === 'editar') && (
        <ModalCrearEditar
          producto={modalType === 'editar' ? productoActivo : null}
          clasificaciones={clasificaciones}
          marcas={marcas}
          unidades={unidades}
          conversiones={conversiones}
          fraccionesIniciales={fraccionesIniciales}
          onConfirm={handleGuardarProducto}
          onClose={() => setModalType(null)}
          guardando={guardando}
        />
      )}

      {modalType === 'eliminar' && (
        <ModalEliminar
          producto={productoActivo}
          onConfirm={handleConfirmarEliminar}
          onClose={() => setModalType(null)}
          guardando={guardando}
        />
      )}

      {modalType === 'imagen' && (
        <ModalImagen
          producto={productoActivo}
          onSubir={handleSubirImagen}
          onEliminar={handleEliminarImagen}
          onClose={() => setModalType(null)}
          guardando={guardando}
        />
      )}
    </PageWrapper>
  );
}
