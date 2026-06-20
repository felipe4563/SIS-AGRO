import { useState, useEffect } from 'react';
import { usePermission } from '../../../hooks/usePermission';
import reporteService from '../../../services/reporte.service';
import FiltrosAvanzados from '../components/FiltrosAvanzados';
import TablaReporte from '../components/TablaReporte';
import BotonesExportar from '../components/BotonesExportar';

const hoy          = new Date().toISOString().split('T')[0];
const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];
const FILTROS_DEFECTO = { fechaInicio: primerDiaMes, fechaFin: hoy };

export default function VistaVentas() {
  const { puede } = usePermission();

  const SUB_TABS = [
    { id: 'diarias',  label: 'Ventas Diarias',   permiso: 'ventas_diarias' },
    { id: 'rango',    label: 'Ventas por Rango',  permiso: 'ventas_rango' },
    { id: 'vendedor', label: 'Por Vendedor',       permiso: 'ventas_vendedor' },
    { id: 'producto', label: 'Por Producto',       permiso: 'ventas_producto' },
    { id: 'cliente',  label: 'Por Cliente',        permiso: 'ventas_cliente' }
  ];

  const tabsPermitidos = SUB_TABS.filter(t => puede(t.permiso, 'reportes'));

  const [activeTab, setActiveTab] = useState(tabsPermitidos.length > 0 ? tabsPermitidos[0].id : null);
  const [datos,     setDatos]     = useState([]);
  const [resumen,   setResumen]   = useState(null);
  const [cargando,  setCargando]  = useState(false);
  const [filtros,   setFiltros]   = useState(FILTROS_DEFECTO);

  const [catalogos, setCatalogos] = useState({ clientes: [], productos: [], usuarios: [] });

  useEffect(() => {
    Promise.all([
      reporteService.catalogos.clientes().catch(() => ({ data: [] })),
      reporteService.catalogos.productos().catch(() => ({ data: [] })),
      reporteService.catalogos.usuarios().catch(() => ({ data: [] }))
    ]).then(([resCli, resProd, resUsu]) => {
      setCatalogos({ clientes: resCli.data, productos: resProd.data, usuarios: resUsu.data });
    });
  }, []);

  // Auto-consulta al cambiar tab o modificar filtros
  useEffect(() => {
    if (!activeTab) return;
    setCargando(true);
    reporteService.ventas(activeTab, filtros)
      .then(res => { setDatos(res.data.data || []); setResumen(res.data.resumen || {}); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [activeTab, filtros]);

  const cambiarTab = (tabId) => {
    setActiveTab(tabId);
    setFiltros(FILTROS_DEFECTO);
    setDatos([]);
    setResumen(null);
  };

  const limpiarFiltros = () => setFiltros(FILTROS_DEFECTO);

  // Forzar re-búsqueda con filtros actuales (botón "Aplicar")
  const buscarDatos = () => setFiltros(f => ({ ...f }));

  const opcionesFiltros = {
    fechas:     true,
    clientes:   ['rango', 'cliente'].includes(activeTab),
    productos:  ['producto'].includes(activeTab),
    vendedores: ['rango', 'vendedor'].includes(activeTab)
  };

  const getColumnas = () => {
    switch (activeTab) {
      case 'diarias':
        return [
          { key: 'fecha',             header: 'Fecha',                    excelValue: r => new Date(r.fecha).toLocaleDateString() },
          { key: 'total_operaciones', header: 'Cantidad Operaciones',     align: 'center' },
          { key: 'total_ingresos',    header: 'Ingresos Totales (Bs)',    align: 'right', render: v => parseFloat(v).toFixed(2), excelValue: r => parseFloat(r.total_ingresos) }
        ];
      case 'rango':
        return [
          { key: 'id_venta',       header: 'Nro Venta', render: v => `#${v.toString().padStart(5, '0')}`, excelValue: r => r.id_venta },
          { key: 'fecha_venta',    header: 'Fecha',     render: v => new Date(v).toLocaleString('es-BO'), excelValue: r => new Date(r.fecha_venta).toLocaleString('es-BO') },
          { key: 'nro_factura',    header: 'Factura',   render: v => v || 'S/N' },
          { key: 'cliente_nombre', header: 'Cliente',   render: (_, r) => r.cliente_nombre ? `${r.cliente_nombre} ${r.cliente_apellido || ''}` : 'Casual', excelValue: r => r.cliente_nombre ? `${r.cliente_nombre} ${r.cliente_apellido || ''}` : 'Casual' },
          { key: 'vendedor_nombre',header: 'Vendedor',  render: (_, r) => `${r.vendedor_nombre} ${r.vendedor_apellido}`, excelValue: r => `${r.vendedor_nombre} ${r.vendedor_apellido}` },
          { key: 'total',          header: 'Total (Bs)',align: 'right', render: v => parseFloat(v).toFixed(2), excelValue: r => parseFloat(r.total) }
        ];
      case 'vendedor':
        return [
          { key: 'nombre',          header: 'Vendedor',          render: (_, r) => `${r.nombre} ${r.apellido}`, excelValue: r => `${r.nombre} ${r.apellido}` },
          { key: 'cantidad_ventas', header: 'Ventas Cerradas',   align: 'center' },
          { key: 'total_vendido',   header: 'Total Vendido (Bs)',align: 'right', render: v => parseFloat(v).toFixed(2), excelValue: r => parseFloat(r.total_vendido) }
        ];
      case 'producto':
        return [
          { key: 'nombre',           header: 'Producto' },
          { key: 'unidades_vendidas',header: 'Unidades Vendidas',         align: 'center' },
          { key: 'total_generado',   header: 'Ingresos Generados (Bs)',   align: 'right', render: v => parseFloat(v).toFixed(2), excelValue: r => parseFloat(r.total_generado) }
        ];
      case 'cliente':
        return [
          { key: 'ci_nit',           header: 'CI/NIT',           render: v => v || 'N/A' },
          { key: 'nombre',           header: 'Cliente',          render: (_, r) => `${r.nombre} ${r.apellido || ''}`, excelValue: r => `${r.nombre} ${r.apellido || ''}` },
          { key: 'compras_realizadas',header: 'Nro. Compras',    align: 'center' },
          { key: 'total_gastado',    header: 'Total Gastado (Bs)',align: 'right', render: v => parseFloat(v).toFixed(2), excelValue: r => parseFloat(r.total_gastado) }
        ];
      default: return [];
    }
  };

  if (!activeTab) {
    return <div className="p-8 text-center text-zinc-500">No tienes permisos para ver los reportes de ventas.</div>;
  }

  const tituloActual = tabsPermitidos.find(t => t.id === activeTab)?.label || 'Reporte de Ventas';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabsPermitidos.map(tab => (
          <button
            key={tab.id}
            onClick={() => cambiarTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FiltrosAvanzados
        filtros={filtros}
        setFiltros={setFiltros}
        onBuscar={buscarDatos}
        onLimpiar={limpiarFiltros}
        cargando={cargando}
        opciones={opcionesFiltros}
        catalogos={catalogos}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Registros Encontrados</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white">{resumen?.total_registros || 0}</p>
          </div>
          {resumen?.suma_total !== undefined && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Valor Total (Bs)</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {parseFloat(resumen.suma_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {resumen?.unidades_total !== undefined && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Total Unidades</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                {resumen.unidades_total} u.
              </p>
            </div>
          )}
        </div>

        <BotonesExportar
          datos={datos}
          columnas={getColumnas()}
          titulo={`Reporte_Ventas_${tituloActual.replace(/\s+/g, '_')}`}
          resumen={resumen}
          subtitulo={filtros.fechaInicio && filtros.fechaFin ? `Período: ${filtros.fechaInicio} al ${filtros.fechaFin}` : ''}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <TablaReporte columnas={getColumnas()} datos={datos} cargando={cargando} />
      </div>
    </div>
  );
}
