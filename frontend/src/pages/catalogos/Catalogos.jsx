import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import TablaCatalogos from './components/TablaCatalogos';
import { ModalCrearEditar, ModalEliminar } from './components/CatalogoModals';
import catalogoService from '../../services/catalogo.service';
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

const TABS_DEF = [
  { id: 'clasificaciones', label: 'Clasificaciones' },
  { id: 'marcas',          label: 'Marcas'          },
  { id: 'unidades',        label: 'Unidades'        },
  { id: 'conversiones',    label: 'Conversiones'    },
];

export default function Catalogos() {
  const { puede } = usePermission();

  const tabsVisibles = TABS_DEF.filter(t => puede('ver', t.id));

  const [activeTab, setActiveTab] = useState(() => tabsVisibles[0]?.id ?? null);

  const [datos, setDatos] = useState({
    clasificaciones: [],
    marcas: [],
    unidades: [],
    conversiones: []
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);

  const [modalType, setModalType] = useState(null); // 'crear', 'editar', 'eliminar', null
  const [itemActivo, setItemActivo] = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarDatos = useCallback(async () => {
    if (tabsVisibles.length === 0) return;
    setCargando(true);
    try {
      const calls = {
        clasificaciones: puede('ver', 'clasificaciones') ? catalogoService.listarClasificaciones() : null,
        marcas:          puede('ver', 'marcas')          ? catalogoService.listarMarcas()          : null,
        unidades:        puede('ver', 'unidades')        ? catalogoService.listarUnidades()        : null,
        conversiones:    puede('ver', 'conversiones')    ? catalogoService.listarConversiones()    : null,
      };
      // Siempre cargamos unidades (necesarias para el selector de conversiones)
      const unidadesCall = calls.unidades ?? catalogoService.listarUnidades();

      const [resClas, resMar, resUni, resCon] = await Promise.all([
        calls.clasificaciones ?? Promise.resolve({ data: [] }),
        calls.marcas          ?? Promise.resolve({ data: [] }),
        unidadesCall,
        calls.conversiones    ?? Promise.resolve({ data: [] }),
      ]);
      setDatos({
        clasificaciones: resClas.data,
        marcas:          resMar.data,
        unidades:        resUni.data,
        conversiones:    resCon.data,
      });
    } catch {
      mostrarToast('error', 'Error al cargar los catálogos');
    } finally {
      setCargando(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrear = () => {
    setItemActivo(null);
    setModalType('crear');
  };

  const handleEditar = (item) => {
    setItemActivo(item);
    setModalType('editar');
  };

  const handleEliminar = (item) => {
    setItemActivo(item);
    setModalType('eliminar');
  };

  const handleGuardar = async (formData) => {
    setGuardando(true);
    try {
      if (activeTab === 'clasificaciones') {
        if (modalType === 'crear') await catalogoService.crearClasificacion(formData);
        else await catalogoService.editarClasificacion(itemActivo.id_clasificacion, formData);
      } else if (activeTab === 'marcas') {
        if (modalType === 'crear') await catalogoService.crearMarca(formData);
        else await catalogoService.editarMarca(itemActivo.id_marca, formData);
      } else if (activeTab === 'unidades') {
        if (modalType === 'crear') await catalogoService.crearUnidad(formData);
        else await catalogoService.editarUnidad(itemActivo.id_unidad, formData);
      } else if (activeTab === 'conversiones') {
        if (modalType === 'crear') await catalogoService.crearConversion(formData);
        else await catalogoService.editarConversion(itemActivo.id_conversion, formData);
      }
      mostrarToast('ok', 'Guardado correctamente');
      setModalType(null);
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!itemActivo) return;
    setGuardando(true);
    try {
      if (activeTab === 'clasificaciones') await catalogoService.eliminarClasificacion(itemActivo.id_clasificacion);
      else if (activeTab === 'marcas') await catalogoService.eliminarMarca(itemActivo.id_marca);
      else if (activeTab === 'unidades') await catalogoService.eliminarUnidad(itemActivo.id_unidad);
      else if (activeTab === 'conversiones') await catalogoService.eliminarConversion(itemActivo.id_conversion);

      const esEliminar = activeTab === 'unidades' || activeTab === 'conversiones';
      mostrarToast('ok', esEliminar ? 'Eliminado correctamente' : 'Desactivado correctamente');
      setModalType(null);
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al eliminar');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (item) => {
    try {
      const nuevoEstado = item.activo ? 0 : 1;
      if (activeTab === 'clasificaciones') {
        await catalogoService.toggleActivoClasificacion(item.id_clasificacion, nuevoEstado);
      } else if (activeTab === 'marcas') {
        await catalogoService.toggleActivoMarca(item.id_marca, nuevoEstado);
      } else if (activeTab === 'conversiones') {
        await catalogoService.toggleActivoConversion(item.id_conversion, nuevoEstado);
      }
      mostrarToast('ok', `Estado actualizado`);
      await cargarDatos();
    } catch (err) {
      mostrarToast('error', 'Error al cambiar estado');
      await cargarDatos();
    }
  };

  const puedeCrear = activeTab ? puede('crear', activeTab) : false;

  if (tabsVisibles.length === 0) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver ningún catálogo. Contacta al administrador.</p>
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
            🏷️ Gestión de Catálogos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Administra las clasificaciones, marcas y unidades.
          </p>
        </div>
        {puedeCrear && (
          <button
            onClick={handleCrear}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro
          </button>
        )}
      </div>

      {/* TABS — solo los que el usuario puede ver */}
      <div className="flex space-x-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6 max-w-fit">
        {tabsVisibles.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TablaCatalogos
        activeTab={activeTab}
        datos={datos[activeTab]}
        cargando={cargando}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onToggleActivo={handleToggleActivo}
      />

      {(modalType === 'crear' || modalType === 'editar') && (
        <ModalCrearEditar
          activeTab={activeTab}
          item={modalType === 'editar' ? itemActivo : null}
          onConfirm={handleGuardar}
          onClose={() => setModalType(null)}
          guardando={guardando}
          unidades={datos.unidades}
        />
      )}

      {modalType === 'eliminar' && (
        <ModalEliminar
          activeTab={activeTab}
          item={itemActivo}
          onConfirm={handleConfirmarEliminar}
          onClose={() => setModalType(null)}
          guardando={guardando}
        />
      )}
    </PageWrapper>
  );
}
