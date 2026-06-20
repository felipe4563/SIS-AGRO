import { useState, useEffect, useRef } from 'react';
import PageWrapper from '../../components/PageWrapper';
import reporteService from '../../services/reporte.service';
import { usePermission } from '../../hooks/usePermission';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function DashboardReportes() {
  const { puede } = usePermission();
  const puedeVerGanancias   = puede('ganancias',    'reportes');
  const puedeVerTop         = puede('top_productos','reportes');
  const puedeVerVencimientos = puede('vencimientos','reportes');

  const [financiero, setFinanciero] = useState(null);
  const [topProductos, setTopProductos] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);

  const dashboardRef = useRef(null);

  useEffect(() => {
    if (puedeVerGanancias || puedeVerTop || puedeVerVencimientos) {
      cargarReportes();
    } else {
      setCargando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const peticiones = [];
      if (puedeVerGanancias)    peticiones.push(reporteService.financiero().then(r => ({ tipo: 'financiero', data: r.data })).catch(() => null));
      if (puedeVerTop)          peticiones.push(reporteService.topProductos().then(r => ({ tipo: 'top', data: r.data })).catch(() => null));
      if (puedeVerVencimientos) peticiones.push(reporteService.vencimientos().then(r => ({ tipo: 'venc', data: r.data })).catch(() => null));

      const resultados = await Promise.all(peticiones);
      resultados.forEach(r => {
        if (!r) return;
        if (r.tipo === 'financiero') setFinanciero(r.data);
        if (r.tipo === 'top')        setTopProductos(r.data);
        if (r.tipo === 'venc')       setVencimientos(r.data);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = async () => {
    if (!dashboardRef.current) return;
    setExportando(true);

    try {
      // html-to-image usa el motor nativo del navegador, por lo que soporta OKLCH y CSS moderno
      const imgData = await htmlToImage.toJpeg(dashboardRef.current, { 
        quality: 0.98,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      // Calcular el alto de la imagen en el PDF manteniendo la proporción
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Reporte_Gerencial_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);

    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Hubo un error al generar el PDF: ' + error.message);
    } finally {
      setExportando(false);
    }
  };

  if (!puedeVerGanancias && !puedeVerTop && !puedeVerVencimientos) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver el dashboard gerencial. Contacta al administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  if (cargando) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
          <svg className="animate-spin h-8 w-8 mb-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando métricas...
        </div>
      </PageWrapper>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            📈 Dashboard Gerencial
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Resumen en tiempo real de las operaciones y estado del almacén.
          </p>
        </div>
        <button
          onClick={exportarPDF}
          disabled={exportando}
          className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {exportando ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          )}
          {exportando ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </div>

      {/* Contenedor Ref para PDF */}
      <div ref={dashboardRef} className="space-y-6 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-3xl -mx-4 sm:mx-0">
        
        {/* Encabezado PDF (Visible solo al exportar si se quisiera, pero lo dejamos integrado visualmente) */}
        <div className="hidden pdf-only:block text-center mb-6">
          <h2 className="text-2xl font-black">SIS-AGRO - Reporte Gerencial</h2>
          <p className="text-zinc-500">Generado el {new Date().toLocaleString()}</p>
        </div>

        {/* Tarjetas KPI (Financiero) */}
        {puedeVerGanancias && financiero && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Ventas del Mes</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Bs {parseFloat(financiero.ingresos_mes).toLocaleString()}</h3>
              <p className="text-xs text-zinc-400 mt-2">Ingresos hoy: Bs {parseFloat(financiero.ingresos_hoy).toLocaleString()}</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
              </div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Compras del Mes</p>
              <h3 className="text-3xl font-black text-red-600 dark:text-red-400">Bs {parseFloat(financiero.egresos_mes).toLocaleString()}</h3>
              <p className="text-xs text-zinc-400 mt-2">Gastos en inventario</p>
            </div>

          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Gráfico Top 5 */}
          {puedeVerTop && <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              🏆 Top 5 Productos Más Vendidos
            </h3>
            
            {topProductos.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-zinc-400">No hay datos de ventas suficientes</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={topProductos} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.2} />
                    <XAxis type="number" tick={{fill: '#71717a', fontSize: 12}} />
                    <YAxis dataKey="nombre" type="category" width={100} tick={{fill: '#71717a', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'rgba(16, 185, 129, 0.1)'}} 
                      contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff'}}
                      formatter={(value) => [`${value} unidades`, 'Vendido']}
                    />
                    <Bar dataKey="unidades_vendidas" radius={[0, 4, 4, 0]}>
                      {topProductos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>}

          {/* Alertas de Vencimiento */}
          {puedeVerVencimientos && <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h3 className="font-bold text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                ⚠️ Alertas de Vencimiento (Próximos 30 días)
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Lotes que requieren acción inmediata para evitar mermas.</p>
            </div>
            
            <div className="overflow-y-auto flex-1 max-h-[300px]">
              {vencimientos.length === 0 ? (
                <div className="h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium py-8">
                  ✅ Todo el inventario está vigente.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
                    <tr className="text-zinc-500 dark:text-zinc-400">
                      <th className="px-4 py-3 font-medium">Producto / Lote</th>
                      <th className="px-4 py-3 font-medium text-center">Stock</th>
                      <th className="px-4 py-3 font-medium text-right">Caducidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {vencimientos.map((v) => (
                      <tr key={v.id_lote} className={v.dias_restantes < 0 ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{v.producto_nombre}</p>
                          <p className="text-[10px] text-zinc-500">Lote: {v.numero_lote || v.id_lote}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-zinc-700 dark:text-zinc-300">
                          {v.stock_unidades} u
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${
                            v.dias_restantes < 0 
                              ? 'text-red-700 bg-red-100 border-red-300' 
                              : 'text-amber-700 bg-amber-100 border-amber-300'
                          }`}>
                            {v.dias_restantes < 0 ? `Vencido hace ${Math.abs(v.dias_restantes)}d` : `En ${v.dias_restantes} días`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>}
        </div>
      </div>
    </PageWrapper>
  );
}
