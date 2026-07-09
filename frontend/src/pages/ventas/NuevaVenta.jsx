import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ventaService from '../../services/venta.service';
import clienteService from '../../services/cliente.service';
import cajaService from '../../services/caja.service';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../contexts/AuthContext';

/* ── Toast ────────────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.tipo === 'ok';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold max-w-xs sm:max-w-sm backdrop-blur-sm ${
      ok
        ? 'bg-white/90 dark:bg-zinc-900/90 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
        : 'bg-white/90 dark:bg-zinc-900/90 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
    }`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          {ok
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />}
        </svg>
      </div>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

/* ── Modal nuevo cliente ────────────────────────────────────────────── */
function ModalNuevoCliente({ onClose, onCreado }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', ci_nit: '', tipo_cliente: 'MINORISTA' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    setGuardando(true);
    setError('');
    try {
      const res = await clienteService.crear(form);
      onCreado({ id_cliente: res.data.id_cliente, ...form, activo: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar cliente');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-5 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-zinc-900 dark:text-white text-base">Nuevo Cliente</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <input autoFocus type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Nombre *" />
          <input type="text" value={form.apellido} onChange={e => set('apellido', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Apellido" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={form.ci_nit} onChange={e => set('ci_nit', e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="CI / NIT" />
            <input type="text" value={form.telefono} onChange={e => set('telefono', e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Teléfono" />
          </div>
          <div className="flex gap-2">
            {['MINORISTA', 'MAYORISTA'].map(t => (
              <button key={t} onClick={() => set('tipo_cliente', t)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                  form.tipo_cliente === t
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                {t === 'MINORISTA' ? 'Minorista' : 'Mayorista'}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Cancelar
            </button>
            <button onClick={guardar} disabled={guardando}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold transition-colors">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Iconos de métodos de pago ──────────────────────────────────────── */
const IconEfectivo = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
);
const IconQR = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
  </svg>
);
const IconPhone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 9h3" />
  </svg>
);
const IconTransfer = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);
const IconCredito = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

/* ── Modal QR CodePay ───────────────────────────────────────────────── */
function ModalQR({ qrData, onCompletado, onCancelar }) {
  const [estado, setEstado] = useState('pending'); // pending | completed | failed
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!qrData?.tx_id) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await ventaService.estadoPagoQR(qrData.tx_id);
        if (res.data.status === 'completed') {
          clearInterval(intervalRef.current);
          setEstado('completed');
          setTimeout(() => onCompletado(), 1200);
        } else if (res.data.status === 'failed') {
          clearInterval(intervalRef.current);
          setEstado('failed');
        }
      } catch {
        // silenciar errores de polling
      }
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [qrData?.tx_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!qrData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">CodePay QR</p>
            <p className="text-lg font-black text-zinc-900 dark:text-white mt-0.5">
              Bs {parseFloat(qrData.amount).toFixed(2)}
            </p>
            {qrData.commission_amount > 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Neto: Bs {parseFloat(qrData.net_amount).toFixed(2)} + comisión: Bs {parseFloat(qrData.commission_amount).toFixed(2)}
              </p>
            )}
          </div>
          {estado === 'completed' && (
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            </div>
          )}
        </div>

        {/* QR image */}
        <div className="px-5 pb-4 flex justify-center">
          <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
            <img src={qrData.qr_code} alt="QR de pago" className="w-full h-full object-contain" />
            {estado === 'completed' && (
              <div className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center rounded-xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
              </div>
            )}
            {estado === 'failed' && (
              <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center rounded-xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="px-5 pb-2 text-center">
          {estado === 'pending' && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
              Esperando pago...
            </p>
          )}
          {estado === 'completed' && (
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">¡Pago confirmado!</p>
          )}
          {estado === 'failed' && (
            <p className="text-sm font-bold text-red-500">El pago falló o expiró</p>
          )}
        </div>

        {/* Actions */}
        {estado !== 'completed' && (
          <div className="px-5 pb-5 pt-2">
            <button onClick={onCancelar}
              className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Componente principal ───────────────────────────────────────────── */
export default function NuevaVenta() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { puede } = usePermission();
  const { usuario } = useAuth();
  const tieneQRCodePay = (usuario?.modulos ?? []).includes('qr');

  const [clientes, setClientes] = useState([]);
  const [productosStock, setProductosStock] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [turnoActivo, setTurnoActivo] = useState(undefined); // undefined = cargando, null = sin turno
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);
  const [ventaCompletadaId, setVentaCompletadaId] = useState(null);
  const [tabMovil, setTabMovil] = useState('productos');
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [modalQR, setModalQR] = useState(null); // { qr_code, tx_id, amount, net_amount, commission_amount, id_venta }

  const [busqueda, setBusqueda] = useState('');
  const busquedaRef = useRef(null);
  const [carrito, setCarrito] = useState([]);
  const [idCliente, setIdCliente] = useState('');
  const [tipoVenta, setTipoVenta] = useState('MENOR');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState('');
  const [nroFactura, setNroFactura] = useState('');
  const [tipoDescuento, setTipoDescuento] = useState('pct');
  const [descuentoPct, setDescuentoPct] = useState('');
  const [descuentoMonto, setDescuentoMonto] = useState('');
  const [fechaVencimientoCredito, setFechaVencimientoCredito] = useState('');

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    cargarDatos();
    busquedaRef.current?.focus();
    if (searchParams.get('qr_failed')) {
      mostrarToast('error', 'El pago con QR fue cancelado o expiró. Puede intentarlo de nuevo.');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (carrito.length === 0 || productosStock.length === 0) return;
    setCarrito(prev => prev.map(item => {
      const prod = productosStock.find(p => p.id_producto === item.id_producto);
      if (!prod) return item;
      let nuevoPrecio;
      if (item.id_conversion) {
        const fracc = (prod.fracciones || []).find(f => f.id_conversion === item.id_conversion);
        nuevoPrecio = fracc
          ? (tipoVenta === 'MAYOR' ? fracc.precio_mayor : fracc.precio_menor)
          : (tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor);
      } else {
        nuevoPrecio = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;
      }
      const cant = parseFloat(item.cantidad) || 0;
      return { ...item, precio_unitario: nuevoPrecio || 0, subtotal: cant * (nuevoPrecio || 0) };
    }));
  }, [tipoVenta]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ventaCompletadaId) {
      navigate(`/ventas/${ventaCompletadaId}/ticket`);
    }
  }, [ventaCompletadaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClienteCreado = (nuevoCliente) => {
    setClientes(prev => [...prev, nuevoCliente]);
    setIdCliente(String(nuevoCliente.id_cliente));
    setModalNuevoCliente(false);
    mostrarToast('ok', `Cliente "${[nuevoCliente.nombre, nuevoCliente.apellido].filter(Boolean).join(' ')}" registrado`);
  };

  const cargarDatos = async () => {
    try {
      const [cliRes, posRes, turnoRes] = await Promise.all([
        clienteService.listar(),
        ventaService.listarProductosPOS(),
        cajaService.obtenerTurnoActivo(),
      ]);
      setClientes(cliRes.data.filter(c => c.activo === 1));
      setProductosStock(posRes.data.map(p => ({
        ...p,
        precio_menor:        parseFloat(p.precio_menor) || 0,
        precio_mayor:        parseFloat(p.precio_mayor) || 0,
        descuento_menor:     parseFloat(p.descuento_menor) || 0,
        descuento_mayor:     parseFloat(p.descuento_mayor) || 0,
        stock_unidades_total: parseFloat(p.stock_unidades_total) || 0,
        permite_fraccion:    p.permite_fraccion || 0,
        fracciones:          p.fracciones || [],
      })));
      setTurnoActivo(turnoRes.data); // null si no hay turno abierto
    } catch {
      mostrarToast('error', 'Error al cargar datos del POS');
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    if (!busqueda) return productosStock;
    const b = busqueda.toLowerCase();
    return productosStock.filter(p => p.nombre.toLowerCase().includes(b));
  }, [busqueda, productosStock]);

  const puedeDescuento      = puede('aplicar_descuento', 'ventas');
  const puedeDescuentoLibre = puede('descuento_libre', 'ventas');
  const puedeCambiarPrecio  = puede('cambiar_precio', 'ventas');
  const puedeVenderSinStock = puede('vender_sin_stock', 'ventas');

  // Calcula cuántas unidades base se consumirían para validar stock
  const calcUnidadesBase = (item, cantidad) => {
    if (item.id_conversion && item.fracciones) {
      const f = item.fracciones.find(fr => fr.id_conversion === item.id_conversion);
      if (f) return cantidad / f.factor;
    }
    if (item.tipo_cantidad === 'CAJA') return cantidad * (item.unidades_por_caja || 1);
    return cantidad;
  };

  const agregarAlCarrito = (prod) => {
    const index = carrito.findIndex(item => item.id_producto === prod.id_producto);
    const precioBase = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;
    if (index >= 0) {
      const nuevoCar = [...carrito];
      const nuevaCant = nuevoCar[index].cantidad + 1;
      const unidadesReq = calcUnidadesBase(nuevoCar[index], nuevaCant);
      if (!puedeVenderSinStock && unidadesReq > prod.stock_unidades_total) {
        mostrarToast('error', 'No hay suficiente stock disponible');
        return;
      }
      nuevoCar[index].cantidad = nuevaCant;
      nuevoCar[index].subtotal = nuevaCant * nuevoCar[index].precio_unitario;
      setCarrito(nuevoCar);
    } else {
      setCarrito([...carrito, {
        id_producto:      prod.id_producto,
        nombre:           prod.nombre,
        tipo_cantidad:    'UNIDAD',
        id_conversion:    null,
        cantidad:         1,
        precio_unitario:  precioBase || 0,
        unidades_por_caja: prod.unidades_por_caja,
        stock_maximo:     prod.stock_unidades_total,
        subtotal:         precioBase || 0,
        permite_fraccion: prod.permite_fraccion || 0,
        fracciones:       prod.fracciones || [],
      }]);
    }
    setTabMovil('carrito');
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevoCar = [...carrito];

    // Cambio de conversión: auto-actualiza precio y limpia tipo_cantidad
    if (campo === 'id_conversion') {
      const idConv = valor === '' ? null : parseInt(valor);
      nuevoCar[index].id_conversion = idConv;
      const prod = productosStock.find(p => p.id_producto === nuevoCar[index].id_producto);
      if (idConv && nuevoCar[index].fracciones) {
        const fracc = nuevoCar[index].fracciones.find(f => f.id_conversion === idConv);
        if (fracc) {
          nuevoCar[index].precio_unitario = tipoVenta === 'MAYOR' ? fracc.precio_mayor : fracc.precio_menor;
        }
      } else if (prod) {
        nuevoCar[index].precio_unitario = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;
      }
      const cant = parseFloat(nuevoCar[index].cantidad) || 0;
      nuevoCar[index].subtotal = cant * (parseFloat(nuevoCar[index].precio_unitario) || 0);
      setCarrito(nuevoCar);
      return;
    }

    nuevoCar[index][campo] = valor;
    if (campo === 'cantidad' || campo === 'precio_unitario') {
      const cant = parseFloat(nuevoCar[index].cantidad) || 0;
      const precio = parseFloat(nuevoCar[index].precio_unitario) || 0;
      const unidadesReq = calcUnidadesBase(nuevoCar[index], cant);
      if (!puedeVenderSinStock && unidadesReq > nuevoCar[index].stock_maximo) {
        mostrarToast('error', `Stock disponible: ${nuevoCar[index].stock_maximo} unidades`);
        nuevoCar[index].cantidad = 1;
        nuevoCar[index].subtotal = precio;
      } else {
        nuevoCar[index].subtotal = cant * precio;
      }
    }
    setCarrito(nuevoCar);
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const handleBusquedaKeyDown = (e) => {
    if (e.key !== 'Enter' || !busqueda.trim()) return;
    if (productosFiltrados.length === 1) {
      agregarAlCarrito(productosFiltrados[0]);
      setBusqueda('');
    }
  };

  const totales = useMemo(() => {
    const subtotal = carrito.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);
    let descuento_total;
    if (tipoDescuento === 'monto') {
      descuento_total = Math.min(parseFloat(descuentoMonto) || 0, subtotal);
    } else {
      const pct = parseFloat(descuentoPct) || 0;
      descuento_total = subtotal * (pct / 100);
    }
    const total = Math.max(0, subtotal - descuento_total);
    const pagado = parseFloat(montoPagado) || 0;
    const cambio = pagado > 0 ? pagado - total : 0;
    return { subtotal, descuento_total, total, cambio };
  }, [carrito, montoPagado, descuentoPct, descuentoMonto, tipoDescuento]);

  const buildPayload = () => {
    const factor = totales.subtotal > 0
      ? (totales.subtotal - totales.descuento_total) / totales.subtotal
      : 1;
    const esCredito = metodoPago === 'CREDITO';
    return {
      id_cliente:      idCliente || null,
      nro_factura:     nroFactura || null,
      tipo_venta:      tipoVenta,
      subtotal:        totales.subtotal,
      descuento_total: totales.descuento_total,
      total:           totales.total,
      monto_pagado:    esCredito ? (parseFloat(montoPagado) || 0) : (parseFloat(montoPagado) || totales.total),
      cambio:          esCredito ? 0 : (totales.cambio > 0 ? totales.cambio : 0),
      metodo_pago:     metodoPago,
      fecha_vencimiento_credito: esCredito ? fechaVencimientoCredito || null : null,
      detalles: carrito.map(c => ({
        id_producto:       c.id_producto,
        nombre:            c.nombre,
        tipo_cantidad:     c.tipo_cantidad,
        id_conversion:     c.id_conversion || null,
        cantidad:          parseFloat(c.cantidad),
        precio_unitario:   parseFloat(c.precio_unitario),
        unidades_por_caja: c.unidades_por_caja,
        descuento_pct:     parseFloat(descuentoPct) || 0,
        descuento_monto:   parseFloat(c.subtotal) * (1 - factor),
        subtotal:          parseFloat(c.subtotal) * factor,
      })),
    };
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) { mostrarToast('error', 'El carrito está vacío'); return; }
    if (totales.total <= 0)   { mostrarToast('error', 'El total debe ser mayor a 0'); return; }
    const sinPrecio = carrito.find(c => parseFloat(c.precio_unitario) <= 0);
    if (sinPrecio) { mostrarToast('error', `Establezca precio para: ${sinPrecio.nombre}`); return; }
    if (metodoPago === 'CREDITO' && !idCliente) {
      mostrarToast('error', 'Para ventas a crédito debe seleccionar un cliente'); return;
    }
    if (metodoPago === 'CREDITO' && !fechaVencimientoCredito) {
      mostrarToast('error', 'Debe indicar la fecha de vencimiento del crédito'); return;
    }
    if (metodoPago !== 'QR' && metodoPago !== 'CREDITO' && parseFloat(montoPagado) > 0 && totales.cambio < 0) {
      mostrarToast('error', 'El monto pagado es insuficiente'); return;
    }

    setGuardando(true);
    try {
      const payload = buildPayload();
      if (metodoPago === 'QR') {
        const res = await ventaService.iniciarPagoQR(payload);
        setModalQR({ ...res.data });
        setGuardando(false);
        return;
      } else {
        const res = await ventaService.crear(payload);
        mostrarToast('ok', 'Venta registrada correctamente');
        setVentaCompletadaId(res.data.id_venta);
        setCarrito([]);
        setMontoPagado('');
        setNroFactura('');
        setDescuentoPct('');
      }
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al procesar la venta');
    } finally {
      setGuardando(false);
    }
  };

  /* ── Métodos de pago disponibles ──────────────────────────────────── */
  const METODOS = [
    { value: 'EFECTIVO',     label: 'Efectivo',    icon: <IconEfectivo />,  color: 'emerald' },
    { value: 'QR_ESTATICO',  label: 'QR',          icon: <IconQR />,        color: 'teal'    },
    ...(tieneQRCodePay ? [{ value: 'QR', label: 'CodePay', icon: <IconPhone />, color: 'blue' }] : []),
    { value: 'TRANSFERENCIA',label: 'Transfer.',   icon: <IconTransfer />,  color: 'violet'  },
    { value: 'CREDITO',      label: 'Crédito',     icon: <IconCredito />,   color: 'amber'   },
  ];

  const colorMap = {
    emerald: 'bg-emerald-600 text-white shadow-emerald-500/25',
    teal:    'bg-teal-600 text-white shadow-teal-500/25',
    blue:    'bg-blue-600 text-white shadow-blue-500/25',
    violet:  'bg-violet-600 text-white shadow-violet-500/25',
    amber:   'bg-amber-600 text-white shadow-amber-500/25',
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Cargando POS...</p>
      </div>
    </div>
  );

  if (!turnoActivo) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-6 p-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <svg className="w-9 h-9 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Caja cerrada</h2>
        <p className="text-zinc-500 text-sm max-w-xs">
          Debes abrir un turno de caja antes de registrar ventas.
        </p>
      </div>
      <button
        onClick={() => navigate('/caja')}
        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
      >
        Ir a Caja
      </button>
    </div>
  );

  /* ── Panel catálogo ────────────────────────────────────────────────── */
  const panelCatalogo = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 md:px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 flex gap-2 items-center">
        <button
          onClick={() => navigate('/ventas')}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={busquedaRef}
            type="text"
            placeholder="Buscar producto o escanear código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={handleBusquedaKeyDown}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 border-none"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Tipo venta badge */}
        <div className="shrink-0 flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
          {['MENOR', 'MAYOR'].map(t => (
            <button key={t} onClick={() => setTipoVenta(t)}
              className={`px-3 py-2 text-xs font-bold transition-colors ${
                tipoVenta === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}>
              {t === 'MENOR' ? 'Min' : 'May'}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado búsqueda */}
      {busqueda && (
        <div className="px-3 md:px-4 py-1.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <p className="text-xs text-zinc-400">
            {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''} para <span className="font-semibold text-zinc-600 dark:text-zinc-300">"{busqueda}"</span>
          </p>
        </div>
      )}

      {/* Grid de productos */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-zinc-50 dark:bg-zinc-950">
        {productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 py-16">
            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-sm">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {productosFiltrados.map(p => {
              const precio = tipoVenta === 'MAYOR' ? p.precio_mayor : p.precio_menor;
              const sinStock = p.stock_unidades_total === 0;
              return (
                <button
                  key={p.id_producto}
                  onClick={() => agregarAlCarrito(p)}
                  disabled={sinStock && !puedeVenderSinStock}
                  className={`group relative bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-sm border transition-all text-left flex flex-col gap-1 ${
                    sinStock && !puedeVenderSinStock
                      ? 'border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md active:scale-95 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2 flex-1">
                      {p.nombre}
                    </h3>
                    {p.permite_fraccion === 1 && (
                      <span className="shrink-0 text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold leading-none">
                        Frac
                      </span>
                    )}
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${sinStock && !puedeVenderSinStock ? '' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}>
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {tipoVenta === 'MAYOR' ? 'Mayorista' : 'Minorista'}
                      </p>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base leading-tight">
                        Bs {precio.toFixed(2)}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      sinStock
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                        : p.stock_unidades_total <= 5
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {sinStock ? 'Sin stock' : `${p.stock_unidades_total}u`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Panel carrito ─────────────────────────────────────────────────── */
  const panelCarrito = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">

      {/* Cabecera del carrito */}
      <div className="p-3 md:p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0 space-y-2">
        {/* Cliente + botón nuevo */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <select
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
            >
              <option value="">Cliente casual</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido || c.empresa || ''}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setModalNuevoCliente(true)}
            title="Registrar nuevo cliente"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </button>
        </div>

        {/* Factura */}
        <div className="relative">
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <input
            type="text"
            placeholder="N° Factura (opcional)"
            value={nroFactura}
            onChange={e => setNroFactura(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Items del carrito */}
      <div className="flex-1 overflow-y-auto px-3 py-2 md:px-4 space-y-2 bg-zinc-50/50 dark:bg-zinc-900">
        {carrito.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3 py-10">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <p className="text-sm font-medium">Carrito vacío</p>
            <p className="text-xs text-zinc-400">Selecciona productos del catálogo</p>
          </div>
        ) : carrito.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {/* Nombre + eliminar */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
              <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate flex-1 pr-2">{item.nombre}</p>
              <button
                onClick={() => eliminarDelCarrito(idx)}
                className="shrink-0 w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Controles */}
            <div className="grid grid-cols-3 gap-1.5 px-3 pb-2.5">
              {/* Cantidad */}
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">Cant.</p>
                <input
                  type="number" min="1"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                  className="w-full text-center py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {/* Tipo / Sub-unidad */}
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">
                  {item.permite_fraccion && item.fracciones?.length > 0 ? 'Sub-unidad' : 'Tipo'}
                </p>
                {item.permite_fraccion && item.fracciones?.length > 0 ? (
                  <select
                    value={item.id_conversion ?? ''}
                    onChange={(e) => actualizarItem(idx, 'id_conversion', e.target.value)}
                    className="w-full py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Unidad</option>
                    {item.fracciones.map(f => (
                      <option key={f.id_conversion} value={f.id_conversion}>
                        {f.nombre} ({f.abreviatura})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={item.tipo_cantidad}
                    onChange={(e) => actualizarItem(idx, 'tipo_cantidad', e.target.value)}
                    className="w-full py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="UNIDAD">Unidad</option>
                    <option value="CAJA">Caja</option>
                  </select>
                )}
              </div>
              {/* Precio */}
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">Precio</p>
                <input
                  type="number" step="0.5"
                  value={item.precio_unitario || ''}
                  readOnly={!puedeCambiarPrecio}
                  onChange={(e) => puedeCambiarPrecio && actualizarItem(idx, 'precio_unitario', e.target.value)}
                  className={`w-full text-center py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500 ${!puedeCambiarPrecio ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Subtotal fila */}
            <div className="bg-zinc-50 dark:bg-zinc-700/40 px-3 py-1.5 flex justify-between items-center">
              <p className="text-xs text-zinc-400">Subtotal</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                Bs {(parseFloat(item.subtotal) || 0).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totales + Cobro */}
      <div className="p-3 md:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-3">

        {/* Subtotal y descuento */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>Subtotal</span>
            <span>Bs {totales.subtotal.toFixed(2)}</span>
          </div>

          {(puedeDescuento || puedeDescuentoLibre) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 shrink-0">Descuento</span>
              <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                {['pct', 'monto'].map(t => (
                  <button key={t} onClick={() => { setTipoDescuento(t); setDescuentoPct(''); setDescuentoMonto(''); }}
                    className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                      tipoDescuento === t
                        ? 'bg-zinc-700 dark:bg-zinc-600 text-white'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-50'
                    }`}>
                    {t === 'pct' ? '%' : 'Bs'}
                  </button>
                ))}
              </div>
              {tipoDescuento === 'pct' ? (
                <input type="number" min="0" max={puedeDescuentoLibre ? 100 : 50} step="0.5"
                  value={descuentoPct} onChange={e => setDescuentoPct(e.target.value)}
                  className="flex-1 px-2 py-1 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded-lg text-sm outline-none text-right"
                  placeholder="0" />
              ) : (
                <input type="number" min="0" max={totales.subtotal} step="0.5"
                  value={descuentoMonto} onChange={e => setDescuentoMonto(e.target.value)}
                  className="flex-1 px-2 py-1 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded-lg text-sm outline-none text-right"
                  placeholder="0.00" />
              )}
              {totales.descuento_total > 0 && (
                <span className="text-xs font-bold text-red-500 shrink-0">-{totales.descuento_total.toFixed(2)}</span>
              )}
            </div>
          )}
        </div>

        {/* Total destacado */}
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total a cobrar</span>
          <span className="text-2xl font-black text-zinc-900 dark:text-white">Bs {totales.total.toFixed(2)}</span>
        </div>

        {/* Métodos de pago — pills */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Método de pago</p>
          <div className="flex flex-wrap gap-1.5">
            {METODOS.map(m => (
              <button
                key={m.value}
                onClick={() => setMetodoPago(m.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  metodoPago === m.value
                    ? `${colorMap[m.color]} shadow-md border-transparent`
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campo monto (no aplica a QR CodePay) */}
        {metodoPago !== 'QR' && (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">Bs</span>
            <input
              type="number"
              placeholder={metodoPago === 'CREDITO' ? 'Cuota inicial (0 = sin inicial)' : 'Monto recibido'}
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm font-semibold text-right text-emerald-600 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Fecha vencimiento crédito */}
        {metodoPago === 'CREDITO' && (
          <div>
            <p className="text-xs text-zinc-400 mb-1.5">Fecha de vencimiento del crédito *</p>
            <input
              type="date"
              value={fechaVencimientoCredito}
              onChange={(e) => setFechaVencimientoCredito(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Info box según método */}
        {metodoPago === 'QR' && (
          <div className="flex gap-2 items-start p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <span>Serás redirigido a CodePay. El cliente escanea el QR y el sistema confirma automáticamente.</span>
          </div>
        )}

        {metodoPago === 'QR_ESTATICO' && (
          <div className="flex gap-2 items-start p-2.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-700 dark:text-teal-300">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <span>Muestra el QR de tu cuenta al cliente. Confirma manualmente una vez recibido el pago.</span>
          </div>
        )}

        {metodoPago === 'CREDITO' && (
          <div className="flex gap-2 items-start p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <span>Deuda pendiente: <strong>Bs {Math.max(0, totales.total - (parseFloat(montoPagado) || 0)).toFixed(2)}</strong>. Gestiona abonos en Créditos → Cuentas por Cobrar.</span>
          </div>
        )}

        {/* Cambio */}
        {metodoPago !== 'QR' && metodoPago !== 'QR_ESTATICO' && totales.cambio > 0 && (
          <div className="flex justify-between items-center px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Cambio</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">Bs {totales.cambio.toFixed(2)}</span>
          </div>
        )}

        {/* Botón confirmar */}
        <button
          onClick={finalizarVenta}
          disabled={guardando || carrito.length === 0}
          className={`w-full py-3.5 rounded-2xl text-white font-black text-sm tracking-wide shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
            metodoPago === 'QR'
              ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
              : metodoPago === 'CREDITO'
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
              : metodoPago === 'QR_ESTATICO'
              ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
          }`}
        >
          {guardando ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {metodoPago === 'QR' ? 'Generando QR...' : 'Procesando...'}
            </>
          ) : metodoPago === 'QR' ? (
            <>
              <IconPhone />
              PAGAR CON CODEPAY — Bs {totales.total.toFixed(2)}
            </>
          ) : metodoPago === 'QR_ESTATICO' ? (
            <>
              <IconQR />
              CONFIRMAR PAGO QR — Bs {totales.total.toFixed(2)}
            </>
          ) : metodoPago === 'CREDITO' ? (
            <>
              <IconCredito />
              REGISTRAR EN CRÉDITO — Bs {totales.total.toFixed(2)}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              COBRAR Bs {totales.total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );

  /* ── Layout principal ──────────────────────────────────────────────── */
  return (
    <div className="h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col overflow-hidden">
      <Toast toast={toast} />

      {modalNuevoCliente && (
        <ModalNuevoCliente
          onClose={() => setModalNuevoCliente(false)}
          onCreado={handleClienteCreado}
        />
      )}

      {modalQR && (
        <ModalQR
          qrData={modalQR}
          onCompletado={() => {
            setModalQR(null);
            mostrarToast('ok', 'Pago confirmado correctamente');
            setVentaCompletadaId(modalQR.id_venta);
            setCarrito([]);
            setMontoPagado('');
            setNroFactura('');
            setDescuentoPct('');
          }}
          onCancelar={() => setModalQR(null)}
        />
      )}

      {/* Tabs móvil — en la parte superior */}
      <div className="md:hidden flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <button
          onClick={() => setTabMovil('productos')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            tabMovil === 'productos'
              ? 'text-emerald-600 border-b-2 border-emerald-500'
              : 'text-zinc-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          Productos
        </button>
        <button
          onClick={() => setTabMovil('carrito')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 relative ${
            tabMovil === 'carrito'
              ? 'text-emerald-600 border-b-2 border-emerald-500'
              : 'text-zinc-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          Carrito
          {carrito.length > 0 && (
            <span className="absolute right-6 top-2 flex items-center justify-center w-5 h-5 text-[10px] font-black bg-emerald-500 text-white rounded-full">
              {carrito.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`md:hidden flex-1 overflow-hidden ${tabMovil === 'productos' ? 'block' : 'hidden'}`}>
          {panelCatalogo}
        </div>
        <div className={`md:hidden flex-1 overflow-hidden ${tabMovil === 'carrito' ? 'block' : 'hidden'}`}>
          {panelCarrito}
        </div>

        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="w-7/12 lg:w-2/3 flex flex-col overflow-hidden border-r border-zinc-200 dark:border-zinc-800">
            {panelCatalogo}
          </div>
          <div className="w-5/12 lg:w-1/3 flex flex-col overflow-hidden shadow-2xl z-20">
            {panelCarrito}
          </div>
        </div>
      </div>
    </div>
  );
}
