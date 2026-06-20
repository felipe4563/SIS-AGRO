import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import ModalAbono from './components/ModalAbono';
import ComprobanteCredito from './components/ComprobanteCredito';
import { usePermission } from '../../hooks/usePermission';

const BADGE = {
  PENDIENTE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  PARCIAL:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  PAGADO:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
};

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtMonto(n) { return `Bs ${parseFloat(n || 0).toFixed(2)}`; }

export default function CuentasPorPagar() {
  const { puede } = usePermission();
  const puedeAbonar = puede('abonar', 'creditos');

  const [cuentas, setCuentas]       = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [expandido, setExpandido]   = useState(null);
  const [pagos, setPagos]           = useState({});
  const [modalAbono, setModalAbono] = useState(null);
  const [guardando, setGuardando]   = useState(false);
  const [toast, setToast]           = useState(null);
  const [filtro, setFiltro]         = useState('TODOS');
  const [busqueda, setBusqueda]     = useState('');
  const [comprobante, setComprobante] = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await axios.get('/creditos/pagar');
      setCuentas(res.data);
    } catch {
      mostrarToast('error', 'Error al cargar cuentas por pagar');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cargarPagos = async (id_compra) => {
    if (pagos[id_compra]) return;
    try {
      const res = await axios.get(`/creditos/pagar/${id_compra}/pagos`);
      setPagos(prev => ({ ...prev, [id_compra]: res.data }));
    } catch {
      mostrarToast('error', 'Error al cargar historial de pagos');
    }
  };

  const toggleExpandido = (id) => {
    const siguiente = expandido === id ? null : id;
    setExpandido(siguiente);
    if (siguiente) cargarPagos(siguiente);
  };

  const handleAbono = async (datos) => {
    if (!modalAbono) return;
    setGuardando(true);
    try {
      const cuentaActual = cuentas.find(c => c.id_compra === modalAbono.id_compra);
      const resp = await axios.post(`/creditos/pagar/${modalAbono.id_compra}/abono`, datos);
      setModalAbono(null);
      setPagos(prev => { const n = { ...prev }; delete n[modalAbono.id_compra]; return n; });
      await cargar();
      setComprobante({
        tipo: 'abono',
        cuenta: cuentaActual,
        abono: { ...datos, fecha_pago: new Date().toISOString() },
        saldoRestante: resp.data.saldo_restante,
        nuevoEstado: resp.data.nuevo_estado,
      });
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al registrar abono');
    } finally {
      setGuardando(false);
    }
  };

  const imprimirEstado = async (cuenta) => {
    let historial = pagos[cuenta.id_compra];
    if (!historial) {
      try {
        const res = await axios.get(`/creditos/pagar/${cuenta.id_compra}/pagos`);
        historial = res.data;
        setPagos(prev => ({ ...prev, [cuenta.id_compra]: res.data }));
      } catch {
        historial = [];
      }
    }
    setComprobante({ tipo: 'estado', cuenta, pagos: historial });
  };

  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const cuentasFiltradas = cuentas
    .filter(c => filtro === 'TODOS' || c.estado_credito === filtro)
    .filter(c => {
      if (!busqueda.trim()) return true;
      const b = normalizar(busqueda);
      return normalizar(c.proveedor_nombre || '').includes(b);
    });

  const vencida = (c) => {
    if (!c.fecha_vencimiento_credito || c.estado_credito === 'PAGADO') return false;
    return new Date(c.fecha_vencimiento_credito) < new Date();
  };

  if (cargando) return <div className="py-12 text-center text-zinc-500 text-sm">Cargando...</div>;

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium max-w-xs ${
          toast.tipo === 'ok'
            ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
        }`}>{toast.msg}</div>
      )}

      {/* Buscador */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por proveedor..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 flex-wrap">
        {['TODOS', 'PENDIENTE', 'PARCIAL', 'PAGADO'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtro === f
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {f === 'TODOS' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {cuentasFiltradas.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          {busqueda ? `Sin resultados para "${busqueda}"` : `No hay cuentas por pagar${filtro !== 'TODOS' ? ` con estado ${filtro}` : ''}.`}
        </div>
      ) : (
        <div className="space-y-3">
          {cuentasFiltradas.map(c => (
            <div key={c.id_compra} className={`bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${
              vencida(c) ? 'border-red-300 dark:border-red-700' : 'border-zinc-200 dark:border-zinc-800'
            }`}>
              {/* Fila principal */}
              <div
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                onClick={() => toggleExpandido(c.id_compra)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">
                      {c.proveedor_nombre || 'Proveedor desconocido'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${BADGE[c.estado_credito] || BADGE.PENDIENTE}`}>
                      {c.estado_credito || 'PENDIENTE'}
                    </span>
                    {vencida(c) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400">
                        Vencida
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 flex gap-3 flex-wrap">
                    <span>Compra: {fmtFecha(c.fecha_compra)}</span>
                    <span>Vence: {fmtFecha(c.fecha_vencimiento_credito)}</span>
                    {c.nro_factura && <span>F: {c.nro_factura}</span>}
                    <span>{c.sucursal_nombre}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Total</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{fmtMonto(c.total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Saldo</p>
                    <p className={`text-base font-black ${parseFloat(c.saldo_pendiente) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {fmtMonto(Math.max(0, c.saldo_pendiente))}
                    </p>
                  </div>

                  {parseFloat(c.saldo_pendiente) > 0.01 && puedeAbonar && (
                    <button
                      onClick={e => { e.stopPropagation(); setModalAbono({ id_compra: c.id_compra, saldo: parseFloat(c.saldo_pendiente) }); }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      + Abono
                    </button>
                  )}

                  <button
                    onClick={e => { e.stopPropagation(); imprimirEstado(c); }}
                    title="Imprimir estado de cuenta"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                    </svg>
                  </button>

                  <svg className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${expandido === c.id_compra ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Historial expandido */}
              {expandido === c.id_compra && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-950/30">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 text-center">
                      <p className="text-zinc-500">Total compra</p>
                      <p className="font-bold text-zinc-900 dark:text-white">{fmtMonto(c.total)}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 text-center">
                      <p className="text-zinc-500">Cuota inicial</p>
                      <p className="font-bold text-zinc-900 dark:text-white">{fmtMonto(c.cuota_inicial)}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 text-center">
                      <p className="text-zinc-500">Abonado</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{fmtMonto(c.total_abonado)}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 text-center">
                      <p className="text-zinc-500">Saldo</p>
                      <p className="font-bold text-red-600 dark:text-red-400">{fmtMonto(Math.max(0, c.saldo_pendiente))}</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-zinc-500 mb-2">Historial de abonos</p>
                  {!pagos[c.id_compra] ? (
                    <p className="text-xs text-zinc-400">Cargando...</p>
                  ) : pagos[c.id_compra].length === 0 ? (
                    <p className="text-xs text-zinc-400">Sin abonos registrados</p>
                  ) : (
                    <div className="space-y-1.5">
                      {pagos[c.id_compra].map(p => (
                        <div key={p.id_pago_compra} className="flex items-center justify-between text-xs bg-white dark:bg-zinc-800 rounded-lg px-3 py-2">
                          <div>
                            <span className="font-medium text-zinc-900 dark:text-white">{fmtFecha(p.fecha_pago)}</span>
                            <span className="ml-2 text-zinc-400">{p.metodo_pago}</span>
                            {p.observaciones && <span className="ml-2 text-zinc-400 italic">— {p.observaciones}</span>}
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtMonto(p.monto)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAbono && (
        <ModalAbono
          titulo="Registrar Abono — Cuenta por Pagar"
          saldoPendiente={modalAbono.saldo}
          onConfirm={handleAbono}
          onClose={() => setModalAbono(null)}
          guardando={guardando}
        />
      )}

      {comprobante && (
        <ComprobanteCredito
          tipo={comprobante.tipo}
          cuenta={comprobante.cuenta}
          abono={comprobante.abono}
          saldoRestante={comprobante.saldoRestante}
          nuevoEstado={comprobante.nuevoEstado}
          pagos={comprobante.pagos}
          onClose={() => setComprobante(null)}
        />
      )}
    </div>
  );
}
