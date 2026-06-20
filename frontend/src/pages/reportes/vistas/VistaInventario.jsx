import { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePermission } from '../../../hooks/usePermission';
import reporteService from '../../../services/reporte.service';
import configuracionService from '../../../services/configuracion.service';
import FiltrosAvanzados from '../components/FiltrosAvanzados';
import TablaReporte from '../components/TablaReporte';
import BotonesExportar from '../components/BotonesExportar';

// ── Constantes PDF ────────────────────────────────────────────────────────────
const BRAND_COLOR = [22, 163, 74];
const DARK_COLOR  = [24, 24, 27];
const LIGHT_GRAY  = [244, 244, 245];
const MID_GRAY    = [161, 161, 170];
const WHITE       = [255, 255, 255];

function pdfHeader(doc, titulo, logoUrl, empresa) {
  const pw = doc.internal.pageSize.getWidth();
  const hh = 32;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, hh, 'F');
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, 4, hh, 'F');
  doc.setDrawColor(...LIGHT_GRAY); doc.setLineWidth(0.5);
  doc.line(0, hh, pw, hh);
  if (logoUrl) doc.addImage(logoUrl, 'PNG', 9, 4, 20, 24);
  const tx = logoUrl ? 33 : 10;
  doc.setTextColor(...BRAND_COLOR); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(empresa, tx, 11);
  doc.setTextColor(...MID_GRAY); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión Agropecuaria', tx, 17);
  doc.setTextColor(...DARK_COLOR); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(titulo, tx, 27);
  doc.setTextColor(...MID_GRAY); doc.setFontSize(7);
  doc.text(`Generado: ${new Date().toLocaleString('es-BO')}`, pw - 10, 27, { align: 'right' });
  return hh;
}

function pdfFooter(doc, empresa) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LIGHT_GRAY); doc.setLineWidth(0.4);
    doc.line(10, ph - 12, pw - 10, ph - 12);
    doc.setTextColor(...MID_GRAY); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(`${empresa} — Sistema de Gestión Agropecuaria`, 10, ph - 7);
    doc.text(`Página ${i} de ${total}`, pw - 10, ph - 7, { align: 'right' });
  }
}

// ── Tabla pivotada por sucursal ───────────────────────────────────────────────
function TablaPorSucursal({ datos, cargando, resumen }) {
  const [exportando, setExportando] = useState(false);

  const { sucursales, productos } = useMemo(() => {
    if (!datos || datos.length === 0) return { sucursales: [], productos: [] };

    const sucMap = new Map();
    const prodMap = new Map();

    datos.forEach(row => {
      if (!sucMap.has(row.id_sucursal)) {
        sucMap.set(row.id_sucursal, { id: row.id_sucursal, nombre: row.sucursal_nombre, ciudad: row.ciudad });
      }
      if (!prodMap.has(row.id_producto)) {
        prodMap.set(row.id_producto, {
          id: row.id_producto,
          nombre: row.nombre,
          categoria: row.categoria,
          stock: {},
          total: 0,
        });
      }
      const prod = prodMap.get(row.id_producto);
      const unidades = parseInt(row.stock_unidades || 0);
      prod.stock[row.id_sucursal] = (prod.stock[row.id_sucursal] || 0) + unidades;
      prod.total += unidades;
    });

    return {
      sucursales: Array.from(sucMap.values()),
      productos: Array.from(prodMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    };
  }, [datos]);

  if (cargando) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-zinc-400">
        <svg className="animate-spin w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Cargando inventario por sucursal...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-400">
        <p className="font-medium">Sin datos de inventario</p>
        <p className="text-sm mt-1">No hay lotes activos con stock registrado en ninguna sucursal.</p>
      </div>
    );
  }

  const exportarPDF = async () => {
    if (productos.length === 0) return;
    setExportando(true);
    try {
      let config = { nombre_empresa: 'SIS-AGRO', logo: null };
      try { const r = await configuracionService.obtener(); config = r.data; } catch { /* usa defaults */ }

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const titulo = 'Inventario por Sucursal';

      const startY = pdfHeader(doc, titulo, config.logo || null, config.nombre_empresa) + 5;

      // Tarjetas de resumen
      if (resumen) {
        const pw   = doc.internal.pageSize.getWidth();
        const cards = [
          ['Productos distintos', resumen.total_registros ?? 0],
          ['Unidades totales',    resumen.total_unidades   ?? 0],
        ];
        const cardW = (pw - 20 - (cards.length - 1) * 4) / cards.length;
        cards.forEach(([label, val], i) => {
          const x = 10 + i * (cardW + 4);
          doc.setFillColor(...LIGHT_GRAY);
          doc.roundedRect(x, startY, cardW, 16, 2, 2, 'F');
          doc.setFillColor(...BRAND_COLOR);
          doc.rect(x, startY, cardW, 1.5, 'F');
          doc.setTextColor(...MID_GRAY); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
          doc.text(label, x + 4, startY + 6);
          doc.setTextColor(...DARK_COLOR); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
          doc.text(String(parseInt(val).toLocaleString('es-BO')), x + 4, startY + 13);
        });
      }

      const tableStartY = startY + (resumen ? 21 : 0);

      // Cabeceras dinámicas
      const head = [
        ['Producto', 'Categoría', ...sucursales.map(s => s.nombre), 'Total'],
      ];
      // Filas
      const body = productos.map(p => [
        p.nombre,
        p.categoria || 'Sin categoría',
        ...sucursales.map(s => p.stock[s.id] ? p.stock[s.id].toLocaleString() : '—'),
        p.total.toLocaleString(),
      ]);
      // Fila de totales
      const totalesPorSucursal = {};
      let granTotal = 0;
      sucursales.forEach(s => {
        const t = productos.reduce((acc, p) => acc + (p.stock[s.id] || 0), 0);
        totalesPorSucursal[s.id] = t;
        granTotal += t;
      });
      body.push([
        '', 'TOTAL', '',
        ...sucursales.map(s => (totalesPorSucursal[s.id] || 0).toLocaleString()),
        granTotal.toLocaleString(),
      ]);

      // Índices de columnas de sucursal y total (centradas)
      const firstSucCol = 3;
      const lastCol = 3 + sucursales.length;
      const columnStyles = { 0: { cellWidth: 22 }, 2: { cellWidth: 28 } };
      for (let i = firstSucCol; i <= lastCol; i++) {
        columnStyles[i] = { halign: 'center', cellWidth: 22 };
      }

      autoTable(doc, {
        head,
        body,
        startY: tableStartY,
        margin: { left: 10, right: 10 },
        styles: { fontSize: 7.5, cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 }, textColor: DARK_COLOR, lineColor: [228, 228, 231], lineWidth: 0.2 },
        headStyles: { fillColor: [209, 250, 229], textColor: DARK_COLOR, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles,
        willDrawCell: (data) => {
          // Fila de total (última) en gris
          if (data.section === 'body' && data.row.index === body.length - 1) {
            doc.setFillColor(...LIGHT_GRAY);
          }
          // Columna total en fondo suave
          if (data.section === 'body' && data.column.index === lastCol) {
            doc.setFillColor(240, 253, 244);
          }
          // Línea verde bajo cabecera
          if (data.section === 'head') {
            doc.setFillColor(...BRAND_COLOR);
            doc.rect(data.cell.x, data.cell.y + data.cell.height - 1, data.cell.width, 1, 'F');
          }
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) pdfHeader(doc, titulo, config.logo || null, config.nombre_empresa);
        },
      });

      pdfFooter(doc, config.nombre_empresa);
      doc.save(`Inventario_Por_Sucursal_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al generar el PDF: ' + err.message);
    } finally {
      setExportando(false);
    }
  };

  // Totales por sucursal (pie de tabla)
  const totalesPorSucursal = {};
  let granTotal = 0;
  sucursales.forEach(s => {
    const t = productos.reduce((acc, p) => acc + (p.stock[s.id] || 0), 0);
    totalesPorSucursal[s.id] = t;
    granTotal += t;
  });

  return (
    <div className="space-y-3">
      {/* Botón exportar PDF */}
      <div className="flex justify-end">
        <button
          onClick={exportarPDF}
          disabled={exportando}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exportando ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v6h6"/>
            </svg>
          )}
          {exportando ? 'Generando PDF...' : 'Exportar PDF'}
        </button>
      </div>

    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sticky left-0 bg-zinc-50 dark:bg-zinc-800/60 min-w-[180px]">
              Producto
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden md:table-cell whitespace-nowrap">
              Categoría
            </th>
            {sucursales.map(s => (
              <th key={s.id} className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 whitespace-nowrap min-w-[110px]">
                <div>{s.nombre}</div>
                {s.ciudad && <div className="text-zinc-400 font-normal normal-case text-[10px]">{s.ciudad}</div>}
              </th>
            ))}
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 min-w-[90px]">
              Total
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {productos.map(p => (
            <tr key={p.id} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-4 py-3 sticky left-0 bg-white dark:bg-zinc-900">
                <p className="font-medium text-zinc-900 dark:text-white leading-tight">{p.nombre}</p>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                {p.categoria || 'Sin categoría'}
              </td>
              {sucursales.map(s => {
                const val = p.stock[s.id] || 0;
                return (
                  <td key={s.id} className="px-4 py-3 text-center">
                    {val > 0 ? (
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs min-w-[40px]">
                        {val.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center bg-zinc-50 dark:bg-zinc-800/40">
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{p.total.toLocaleString()}</span>
              </td>
            </tr>
          ))}
        </tbody>

        {/* Pie: totales por sucursal */}
        <tfoot className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <td className="px-4 py-3 font-bold text-xs uppercase text-zinc-600 dark:text-zinc-300 sticky left-0 bg-zinc-100 dark:bg-zinc-800">
              Total sucursal
            </td>
            <td className="hidden md:table-cell" />
            {sucursales.map(s => (
              <td key={s.id} className="px-4 py-3 text-center">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {(totalesPorSucursal[s.id] || 0).toLocaleString()}
                </span>
              </td>
            ))}
            <td className="px-4 py-3 text-center bg-zinc-200 dark:bg-zinc-700">
              <span className="font-black text-zinc-900 dark:text-white">{granTotal.toLocaleString()}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VistaInventario() {
  const { puede } = usePermission();

  const SUB_TABS = [
    { id: 'actual',       label: 'Inventario Actual',    permiso: 'inventario' },
    { id: 'por_sucursal', label: 'Por Sucursal',         permiso: 'inventario' },
    { id: 'valorizado',   label: 'Inv. Valorizado',      permiso: 'inventario_valorizado' },
    { id: 'stock_bajo',   label: 'Stock Bajo',           permiso: 'stock_bajo' },
    { id: 'vencimientos', label: 'Próximos a Vencer',    permiso: 'vencimientos' },
    { id: 'kardex',       label: 'Kardex de Lotes',      permiso: 'kardex' },
  ];

  const tabsPermitidos = SUB_TABS.filter(t => puede(t.permiso, 'reportes'));

  const [activeTab, setActiveTab] = useState(tabsPermitidos.length > 0 ? tabsPermitidos[0].id : null);
  const [datos, setDatos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({});
  const [catalogos, setCatalogos] = useState({ productos: [] });

  useEffect(() => {
    reporteService.catalogos.productos().then(res => {
      setCatalogos({ productos: res.data });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab) {
      if (activeTab === 'kardex' && !filtros.id_producto) {
        setDatos([]);
        return;
      }
      buscarDatos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const buscarDatos = async () => {
    if (activeTab === 'kardex' && !filtros.id_producto) {
      return alert('Debe seleccionar un producto para generar el Kardex.');
    }
    setCargando(true);
    try {
      const res = await reporteService.inventario(activeTab, filtros);
      setDatos(res.data.data || []);
      setResumen(res.data.resumen || {});
    } catch (err) {
      console.error(err);
      alert('Error cargando reporte de inventario');
    } finally {
      setCargando(false);
    }
  };

  const opcionesFiltros = {
    fechas: false,
    productos: activeTab === 'kardex',
  };

  const getColumnas = () => {
    switch (activeTab) {
      case 'actual':
        return [
          { key: 'nombre', header: 'Producto' },
          { key: 'categoria', header: 'Categoría', render: v => v || 'Sin Categoría' },
          { key: 'stock_total_unidades', header: 'Stock Total (Unid.)', align: 'center',
            render: v => <span className="font-bold text-emerald-600">{v} u</span>,
            excelValue: r => r.stock_total_unidades },
        ];
      case 'valorizado':
        return [
          { key: 'nombre', header: 'Producto' },
          { key: 'stock_total_unidades', header: 'Stock Total', align: 'center' },
          { key: 'costo_total_estimado', header: 'Valor Estimado (Bs)', align: 'right',
            render: v => parseFloat(v).toFixed(2),
            excelValue: r => parseFloat(r.costo_total_estimado) },
        ];
      case 'stock_bajo':
        return [
          { key: 'nombre', header: 'Producto' },
          { key: 'stock_minimo', header: 'Mínimo', align: 'center', excelValue: r => r.stock_minimo },
          { key: 'stock_total_unidades', header: 'Stock Actual', align: 'center',
            render: v => <span className="font-bold text-red-600">{v} u</span>,
            excelValue: r => r.stock_total_unidades },
        ];
      case 'vencimientos':
        return [
          { key: 'numero_lote', header: 'Lote', render: (v, r) => v || r.id_lote },
          { key: 'producto_nombre', header: 'Producto' },
          { key: 'stock_unidades', header: 'Stock (Unid.)', align: 'center' },
          { key: 'fecha_vencimiento', header: 'Caducidad', excelValue: r => new Date(r.fecha_vencimiento).toLocaleDateString() },
          { key: 'dias_restantes', header: 'Estado', align: 'center',
            render: v => (
              <span className={`px-2 py-1 rounded text-xs font-bold ${v < 0 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'}`}>
                {v < 0 ? `Vencido (${Math.abs(v)}d)` : `En ${v} d`}
              </span>
            ),
            excelValue: r => r.dias_restantes < 0 ? 'VENCIDO' : 'POR VENCER' },
        ];
      case 'kardex':
        return [
          { key: 'fecha', header: 'Fecha', excelValue: r => new Date(r.fecha).toLocaleString() },
          { key: 'tipo', header: 'Movimiento',
            render: v => (
              <span className={`px-2 py-0.5 rounded text-xs border ${v === 'ENTRADA' ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'}`}>{v}</span>
            ),
            excelValue: r => r.tipo },
          { key: 'motivo', header: 'Motivo' },
          { key: 'cantidad_unidades', header: 'Cantidad', align: 'right',
            render: (v, r) => (
              <span className={`font-bold ${r.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'}`}>
                {r.tipo === 'ENTRADA' ? '+' : '-'}{v}
              </span>
            ),
            excelValue: r => r.tipo === 'ENTRADA' ? r.cantidad_unidades : -r.cantidad_unidades },
          { key: 'numero_lote', header: 'Lote Afectado', render: v => v || 'N/A' },
          { key: 'usuario_nombre', header: 'Usuario' },
        ];
      default:
        return [];
    }
  };

  if (!activeTab) {
    return <div className="p-8 text-center text-zinc-500">No tienes permisos para ver reportes de inventario.</div>;
  }

  const tituloActual = tabsPermitidos.find(t => t.id === activeTab)?.label || 'Reporte de Inventario';
  const esPorSucursal = activeTab === 'por_sucursal';

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {tabsPermitidos.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setDatos([]); setResumen(null); }}
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

      {/* Filtros — ocultos para por_sucursal (no necesita filtros) */}
      {!esPorSucursal && (
        <FiltrosAvanzados
          filtros={filtros}
          setFiltros={setFiltros}
          onBuscar={buscarDatos}
          cargando={cargando}
          opciones={opcionesFiltros}
          catalogos={catalogos}
        />
      )}

      {/* Barra de resumen + exportar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              {esPorSucursal ? 'Productos distintos' : 'Registros'}
            </p>
            <p className="text-xl font-black text-zinc-900 dark:text-white">
              {resumen?.total_registros || 0}
            </p>
          </div>
          {esPorSucursal && resumen?.total_unidades !== undefined && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Unidades totales</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {parseInt(resumen.total_unidades).toLocaleString()} u
              </p>
            </div>
          )}
          {resumen?.valor_total !== undefined && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Costo total del almacén</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                Bs {parseFloat(resumen.valor_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        {!esPorSucursal && (
          <BotonesExportar
            datos={datos}
            columnas={getColumnas()}
            titulo={`Reporte_Inventario_${tituloActual.replace(/\s+/g, '_')}`}
            resumen={resumen}
          />
        )}

        {esPorSucursal && (
          <button
            onClick={buscarDatos}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {cargando ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {cargando ? 'Cargando...' : 'Actualizar'}
          </button>
        )}
      </div>

      {/* Contenido de la tab */}
      {esPorSucursal ? (
        <TablaPorSucursal datos={datos} cargando={cargando} resumen={resumen} />
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <TablaReporte columnas={getColumnas()} datos={datos} cargando={cargando} />
        </div>
      )}
    </div>
  );
}
