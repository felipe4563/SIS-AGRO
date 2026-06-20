import { useState, useEffect } from 'react';
import reporteService from '../../../services/reporte.service';
import TablaReporte from '../components/TablaReporte';
import BotonesExportar from '../components/BotonesExportar';

const hoy          = new Date().toISOString().split('T')[0];
const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const fmt = (n) => parseFloat(n || 0).toFixed(2);
const fmtFechaCorta = (s) => s ? new Date(s).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const BADGE_CLASE = {
  PENDIENTE: 'bg-red-100 text-red-700',
  PARCIAL:   'bg-amber-100 text-amber-700',
  PAGADO:    'bg-emerald-100 text-emerald-700',
};

export default function VistaCreditos() {
  const [tab, setTab]               = useState('cobrar');
  const [datos, setDatos]           = useState([]);
  const [resumen, setResumen]       = useState(null);
  const [cargando, setCargando]     = useState(false);
  const [clientes, setClientes]     = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [filtros, setFiltros] = useState({
    estado:       'TODOS',
    id_cliente:   '',
    id_proveedor: '',
    fecha_inicio: primerDiaMes,
    fecha_fin:    hoy,
  });

  useEffect(() => {
    reporteService.catalogos.clientes().then(r => setClientes(r.data)).catch(() => {});
    reporteService.catalogos.proveedores().then(r => setProveedores(r.data)).catch(() => {});
  }, []);

  useEffect(() => { buscar(); }, [tab]); // eslint-disable-line

  const buscar = async () => {
    setCargando(true);
    try {
      const params = {
        estado:       filtros.estado !== 'TODOS' ? filtros.estado : undefined,
        fecha_inicio: filtros.fecha_inicio || undefined,
        fecha_fin:    filtros.fecha_fin    || undefined,
        ...(tab === 'cobrar' && filtros.id_cliente   ? { id_cliente:   filtros.id_cliente   } : {}),
        ...(tab === 'pagar'  && filtros.id_proveedor ? { id_proveedor: filtros.id_proveedor } : {}),
      };
      const res = await reporteService.creditos(tab, params);
      setDatos(res.data.data || []);
      setResumen(res.data.resumen || {});
    } catch {
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const setFiltro = (key, val) => setFiltros(prev => ({ ...prev, [key]: val }));

  const columnasCobrar = [
    { key: 'id_venta',    header: 'Venta',    render: v => `#${String(v).padStart(5,'0')}`, excelValue: r => r.id_venta },
    { key: 'fecha_venta', header: 'Fecha',    render: v => fmtFechaCorta(v) },
    { key: 'fecha_vencimiento_credito', header: 'Vencimiento', render: v => fmtFechaCorta(v) },
    { key: 'cliente_nombre', header: 'Cliente', render: (v, r) => `${r.cliente_nombre || ''} ${r.cliente_apellido || r.cliente_empresa || ''}`.trim() || '—', excelValue: r => `${r.cliente_nombre||''} ${r.cliente_apellido||r.cliente_empresa||''}`.trim() },
    { key: 'total',          header: 'Total (Bs)',    align: 'right', render: v => fmt(v), excelValue: r => parseFloat(r.total) },
    { key: 'cuota_inicial',  header: 'C. Inicial (Bs)', align: 'right', render: v => fmt(v), excelValue: r => parseFloat(r.cuota_inicial) },
    { key: 'total_abonado',  header: 'Abonado (Bs)', align: 'right', render: v => fmt(v), excelValue: r => parseFloat(r.total_abonado) },
    { key: 'saldo_pendiente',header: 'Saldo (Bs)',   align: 'right', render: v => fmt(Math.max(0, v)), excelValue: r => Math.max(0, parseFloat(r.saldo_pendiente)) },
    { key: 'estado_credito', header: 'Estado',  align: 'center',
      render: v => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${BADGE_CLASE[v] || ''}`}>{v}</span>
    },
    { key: 'sucursal_nombre', header: 'Sucursal' },
  ];

  const columnasPagar = [
    { key: 'id_compra',   header: 'Compra',  render: v => `#${String(v).padStart(5,'0')}`, excelValue: r => r.id_compra },
    { key: 'fecha_compra',header: 'Fecha',   render: v => fmtFechaCorta(v) },
    { key: 'fecha_vencimiento_credito', header: 'Vencimiento', render: v => fmtFechaCorta(v) },
    { key: 'proveedor_nombre', header: 'Proveedor', render: v => v || '—' },
    { key: 'total',           header: 'Total (Bs)',    align: 'right', render: v => fmt(v), excelValue: r => parseFloat(r.total) },
    { key: 'cuota_inicial',   header: 'C. Inicial (Bs)', align: 'right', render: v => fmt(v), excelValue: r => parseFloat(r.cuota_inicial) },
    { key: 'total_abonado',   header: 'Abonado (Bs)', align: 'right', render: v => fmt(v), excelValue: r => parseFloat(r.total_abonado) },
    { key: 'saldo_pendiente', header: 'Saldo (Bs)',   align: 'right', render: v => fmt(Math.max(0, v)), excelValue: r => Math.max(0, parseFloat(r.saldo_pendiente)) },
    { key: 'estado_credito',  header: 'Estado', align: 'center',
      render: v => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${BADGE_CLASE[v] || ''}`}>{v}</span>
    },
    { key: 'sucursal_nombre', header: 'Sucursal' },
  ];

  const columnas = tab === 'cobrar' ? columnasCobrar : columnasPagar;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {[
          { id: 'cobrar', label: 'Por Cobrar (Clientes)' },
          { id: 'pagar',  label: 'Por Pagar (Proveedores)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === t.id
                ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Estado */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={e => setFiltro('estado', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PARCIAL">Parcial</option>
              <option value="PAGADO">Pagado</option>
            </select>
          </div>

          {/* Cliente / Proveedor */}
          {tab === 'cobrar' ? (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Cliente</label>
              <select
                value={filtros.id_cliente}
                onChange={e => setFiltro('id_cliente', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los clientes</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.apellido || c.empresa || ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Proveedor</label>
              <select
                value={filtros.id_proveedor}
                onChange={e => setFiltro('id_proveedor', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>{p.empresa}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fecha inicio */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={e => setFiltro('fecha_inicio', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Fecha fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={e => setFiltro('fecha_fin', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={buscar}
          disabled={cargando}
          className="mt-3 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
        >
          {cargando ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Registros</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">{resumen.total_registros || 0}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Total Deuda (Bs)</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">
                {parseFloat(resumen.total_deuda || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                {tab === 'cobrar' ? 'Total Cobrado (Bs)' : 'Total Pagado (Bs)'}
              </p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {parseFloat(resumen.total_cobrado ?? resumen.total_pagado ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Saldo Pendiente (Bs)</p>
              <p className="text-xl font-black text-red-600 dark:text-red-400">
                {parseFloat(resumen.total_pendiente || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <BotonesExportar
            datos={datos}
            columnas={columnas}
            titulo={`Reporte_Creditos_${tab === 'cobrar' ? 'PorCobrar' : 'PorPagar'}`}
            resumen={resumen}
            subtitulo={filtros.fecha_inicio && filtros.fecha_fin ? `Período: ${filtros.fecha_inicio} al ${filtros.fecha_fin}` : ''}
          />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <TablaReporte columnas={columnas} datos={datos} cargando={cargando} />
      </div>
    </div>
  );
}
