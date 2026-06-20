import { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { useAuth }       from '../../contexts/AuthContext';
import PageWrapper from '../../components/PageWrapper';
import VistaVentas      from './vistas/VistaVentas';
import VistaCompras     from './vistas/VistaCompras';
import VistaInventario  from './vistas/VistaInventario';
import VistaGanancias   from './vistas/VistaGanancias';
import VistaSucursales  from './vistas/VistaSucursales';
import VistaCaja        from './vistas/VistaCaja';
import VistaCreditos    from './vistas/VistaCreditos';

/* ── Icono candado ─────────────────────────────────────────────────────── */
function IconLock() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

/* ── Overlay de plan requerido ─────────────────────────────────────────── */
function LockedOverlay() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1">
        Reporte Avanzado
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        Este reporte requiere el plan <span className="font-semibold text-zinc-700 dark:text-zinc-300">Estándar</span> o superior.
        Contacta al administrador para actualizar tu suscripción.
      </p>
    </div>
  );
}

export default function LayoutReportes() {
  const { puede }    = usePermission();
  const { usuario }  = useAuth();

  const modulos      = usuario?.modulos ?? [];
  const tieneAvanzado = modulos.includes('reportes_avanzados');

  /* ── Definición de tabs ───────────────────────────────────────────────── */
  /*
   * nivel: 'basico'   → incluido en planes PRUEBA, BÁSICO, ESTÁNDAR, PREMIUM
   * nivel: 'avanzado' → solo en ESTÁNDAR y PREMIUM (módulo reportes_avanzados)
   */
  const TABS = [
    /* ── BÁSICOS ── */
    {
      id: 'ventas',
      label: 'Ventas',
      icono: '🧾',
      nivel: 'basico',
      component: <VistaVentas />,
      visible: puede('ventas_diarias', 'reportes') || puede('ventas_rango', 'reportes')
             || puede('ventas_vendedor', 'reportes') || puede('ventas_producto', 'reportes')
             || puede('ventas_cliente', 'reportes'),
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icono: '📦',
      nivel: 'basico',
      component: <VistaInventario />,
      visible: puede('inventario', 'reportes') || puede('inventario_valorizado', 'reportes')
             || puede('stock_bajo', 'reportes') || puede('vencimientos', 'reportes')
             || puede('kardex', 'reportes'),
    },
    {
      id: 'caja',
      label: 'Caja',
      icono: '🏧',
      nivel: 'basico',
      component: <VistaCaja />,
      visible: puede('caja', 'reportes'),
    },
    /* ── AVANZADOS ── */
    {
      id: 'ganancias',
      label: 'Ganancias',
      icono: '📈',
      nivel: 'avanzado',
      component: <VistaGanancias />,
      visible: puede('ganancias', 'reportes') || puede('top_productos', 'reportes') || puede('ganancias_producto', 'reportes'),
    },
    {
      id: 'compras',
      label: 'Compras',
      icono: '🛒',
      nivel: 'avanzado',
      component: <VistaCompras />,
      visible: puede('compras', 'reportes') || puede('compras_proveedor', 'reportes'),
    },
    {
      id: 'sucursales',
      label: 'Sucursales',
      icono: '🏢',
      nivel: 'avanzado',
      component: <VistaSucursales />,
      visible: puede('traslados', 'reportes') || puede('comparativo_sucursales', 'reportes'),
    },
    {
      id: 'creditos',
      label: 'Créditos',
      icono: '💳',
      nivel: 'avanzado',
      component: <VistaCreditos />,
      visible: puede('creditos', 'reportes'),
    },
  ];

  /* ── Filtrar por permiso de rol (siempre) ─────────────────────────────── */
  const tabsVisibles = TABS.filter(t => t.visible);

  const [activeTab, setActiveTab] = useState(
    tabsVisibles.length > 0 ? tabsVisibles[0].id : null
  );

  if (tabsVisibles.length === 0) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-zinc-500 max-w-md">No tienes permisos asignados para visualizar ningún reporte. Contacta a un administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  const tabActivo   = tabsVisibles.find(t => t.id === activeTab);
  const esAvanzado  = tabActivo?.nivel === 'avanzado';
  const bloqueado   = esAvanzado && !tieneAvanzado;

  /* ── Separar tabs para la barra de navegación ────────────────────────── */
  const tabsBasicos   = tabsVisibles.filter(t => t.nivel === 'basico');
  const tabsAvanzados = tabsVisibles.filter(t => t.nivel === 'avanzado');

  const renderTab = (tab) => {
    const isActive  = activeTab === tab.id;
    const locked    = tab.nivel === 'avanzado' && !tieneAvanzado;

    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        title={locked ? 'Requiere Plan Estándar o superior' : tab.label}
        className={`
          relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold
          transition-all whitespace-nowrap border-b-2 -mb-[2px]
          ${isActive
            ? tab.nivel === 'basico'
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10 dark:text-emerald-400'
              : 'border-indigo-500 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 dark:text-indigo-400'
            : locked
              ? 'border-transparent text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50'
          }
        `}
      >
        <span className="text-base">{tab.icono}</span>
        {tab.label}

        {/* Badge nivel */}
        {tab.nivel === 'avanzado' && (
          locked ? (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
              <IconLock />
              Pro
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
              Avanzado
            </span>
          )
        )}
      </button>
    );
  };

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            📊 Centro de Reportes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Analíticas y exportación de documentos (PDF/Excel).
          </p>
        </div>

        {/* Leyenda de niveles */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Básico
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Avanzado
          </span>
        </div>
      </div>

      {/* Barra de tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <div className="flex overflow-x-auto gap-1 pb-0 scrollbar-hide">

          {/* Tabs básicos */}
          {tabsBasicos.map(renderTab)}

          {/* Separador visual si hay ambos grupos */}
          {tabsBasicos.length > 0 && tabsAvanzados.length > 0 && (
            <div className="flex items-center px-2 pb-[2px]">
              <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />
            </div>
          )}

          {/* Tabs avanzados */}
          {tabsAvanzados.map(renderTab)}
        </div>
      </div>

      {/* Contenido */}
      <div className="animate-fade-in">
        {bloqueado ? <LockedOverlay /> : tabActivo?.component}
      </div>
    </PageWrapper>
  );
}
