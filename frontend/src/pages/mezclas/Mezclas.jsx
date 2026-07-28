import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import mezclaService from '../../services/mezcla.service';
import { usePermission } from '../../hooks/usePermission';

/* ── helpers ─────────────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.tipo === 'ok';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium max-w-sm
      ${ok ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
           : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'}`}>
      <span>{ok ? '✅' : '⚠️'}</span>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

const fmt = (n) => Number(n ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 4 });

/* ── Modal: crear / editar mezcla ────────────────────────────────────────── */
function ModalMezcla({ abierto, mezcla, productos, unidades, onGuardar, onCerrar }) {
  const [nombre, setNombre]       = useState('');
  const [descripcion, setDesc]    = useState('');
  const [precioMayor, setPrecioMayor] = useState('');
  const [precioMenor, setPrecioMenor] = useState('');
  const [ingredientes, setIngs]   = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!abierto) return;
    setNombre(mezcla?.nombre || '');
    setDesc(mezcla?.descripcion || '');
    setPrecioMayor(mezcla?.precio_mayor != null ? String(mezcla.precio_mayor) : '');
    setPrecioMenor(mezcla?.precio_menor != null ? String(mezcla.precio_menor) : '');
    setIngs(mezcla?.ingredientes?.map(i => ({
      id_producto: String(i.id_producto),
      cantidad:    String(i.cantidad),
      id_unidad:   String(i.id_unidad),
      observaciones: i.observaciones || '',
    })) || [{ id_producto: '', cantidad: '', id_unidad: '', observaciones: '' }]);
    setError(null);
  }, [abierto, mezcla]);

  const agregarFila = () =>
    setIngs(prev => [...prev, { id_producto: '', cantidad: '', id_unidad: '', observaciones: '' }]);

  const quitarFila = (i) =>
    setIngs(prev => prev.filter((_, idx) => idx !== i));

  const actualizarFila = (i, campo, val) =>
    setIngs(prev => prev.map((f, idx) => idx === i ? { ...f, [campo]: val } : f));

  // Cuando se elige un producto, pre-seleccionar su unidad nativa
  const alElegirProducto = (i, idProd) => {
    const prod = productos.find(p => String(p.id_producto) === idProd);
    setIngs(prev => prev.map((f, idx) =>
      idx === i ? { ...f, id_producto: idProd, id_unidad: prod ? String(prod.id_unidad) : '' } : f
    ));
  };

  const guardar = async () => {
    setError(null);
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    const ingsLimpios = ingredientes.filter(f => f.id_producto && f.cantidad && f.id_unidad);
    if (ingsLimpios.length === 0) { setError('Agrega al menos un ingrediente completo'); return; }
    const pMayor = parseFloat(precioMayor) || 0;
    const pMenor = parseFloat(precioMenor) || 0;
    if (pMayor < 0 || pMenor < 0) { setError('Los precios no pueden ser negativos'); return; }
    setGuardando(true);
    try {
      const payload = {
        nombre: nombre.trim(), descripcion: descripcion.trim(), ingredientes: ingsLimpios,
        precio_mayor: pMayor, precio_menor: pMenor,
      };
      if (mezcla) await mezclaService.editar(mezcla.id_mezcla, payload);
      else        await mezclaService.crear(payload);
      onGuardar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            {mezcla ? 'Editar mezcla' : 'Nueva mezcla'}
          </h2>
          <button onClick={onCerrar} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Nombre *</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="Ej: Fumigación maíz, Mezcla herbicida..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Descripción</label>
              <textarea value={descripcion} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="Instrucciones, uso recomendado..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Precio de venta mayor (Bs, por tanda)</label>
              <input type="number" min="0" step="0.5" value={precioMayor} onChange={e => setPrecioMayor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Precio de venta menor (Bs, por tanda)</label>
              <input type="number" min="0" step="0.5" value={precioMenor} onChange={e => setPrecioMenor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="0.00" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">Ingredientes</span>
              <button onClick={agregarFila}
                className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400
                           hover:text-green-700 dark:hover:text-green-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Agregar
              </button>
            </div>

            <div className="space-y-2">
              {ingredientes.map((fila, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <select value={fila.id_producto} onChange={e => alElegirProducto(i, e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                                 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs
                                 focus:outline-none focus:ring-2 focus:ring-green-500/40">
                      <option value="">— Producto —</option>
                      {productos.map(p => (
                        <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" step="0.001" value={fila.cantidad}
                      onChange={e => actualizarFila(i, 'cantidad', e.target.value)}
                      placeholder="Cant."
                      className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                                 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs
                                 focus:outline-none focus:ring-2 focus:ring-green-500/40" />
                  </div>
                  <div className="col-span-3">
                    <select value={fila.id_unidad} onChange={e => actualizarFila(i, 'id_unidad', e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                                 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs
                                 focus:outline-none focus:ring-2 focus:ring-green-500/40">
                      <option value="">— Unidad —</option>
                      {unidades.map(u => (
                        <option key={u.id_unidad} value={u.id_unidad}>{u.nombre} ({u.abreviatura})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {ingredientes.length > 1 && (
                      <button onClick={() => quitarFila(i)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onCerrar} disabled={guardando}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300
                       border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl
                       bg-green-600 hover:bg-green-500 disabled:opacity-50 transition-colors">
            {guardando ? 'Guardando...' : (mezcla ? 'Actualizar' : 'Crear mezcla')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: aplicar mezcla ───────────────────────────────────────────────── */
function ModalAplicar({ abierto, mezcla, onAplicar, onCerrar }) {
  const [tandas, setTandas]       = useState('1');
  const [obs, setObs]             = useState('');
  const [aplicando, setAplicando] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (abierto) { setTandas('1'); setObs(''); setError(null); }
  }, [abierto]);

  const aplicar = async () => {
    setError(null);
    const t = parseFloat(tandas);
    if (isNaN(t) || t <= 0) { setError('La cantidad de tandas debe ser mayor a 0'); return; }
    setAplicando(true);
    try {
      await mezclaService.aplicar(mezcla.id_mezcla, { cantidad_tandas: t, observaciones: obs.trim() || undefined });
      onAplicar();
    } catch (e) {
      const err = e.response?.data;
      if (err?.detalle) {
        setError(`Stock insuficiente:\n${err.detalle.join('\n')}`);
      } else {
        setError(err?.error || 'Error al aplicar la mezcla');
      }
    } finally {
      setAplicando(false);
    }
  };

  if (!abierto || !mezcla) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Aplicar mezcla</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{mezcla.nombre}</p>
          </div>
          <button onClick={onCerrar} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Ingredientes por tanda */}
          {mezcla.ingredientes?.length > 0 && (
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Ingredientes por tanda
              </div>
              {mezcla.ingredientes.map(ing => (
                <div key={ing.id_ingrediente} className="flex justify-between items-center px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{ing.producto_nombre}</span>
                  <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">
                    {fmt(ing.cantidad)} <span className="text-zinc-400 font-normal">{ing.unidad_abr}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Cantidad de tandas *
            </label>
            <input type="number" min="0.001" step="0.001" value={tandas}
              onChange={e => setTandas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                         bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500/40" />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Multiplica la cantidad de cada ingrediente. Ej: 2 tandas = el doble.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Observaciones</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Opcional..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                         bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-green-500/40" />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={onCerrar} disabled={aplicando}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300
                       border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancelar
          </button>
          <button onClick={aplicar} disabled={aplicando}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl
                       bg-green-600 hover:bg-green-500 disabled:opacity-50 transition-colors">
            {aplicando ? 'Aplicando...' : 'Aplicar y descontar stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────────────────────────── */
export default function Mezclas() {
  const { puede } = usePermission();
  const puedeVer         = puede('ver',           'mezclas');
  const puedeCrear       = puede('crear',         'mezclas');
  const puedeEditar      = puede('editar',        'mezclas');
  const puedeActivar     = puede('activar',       'mezclas');
  const puedeAplicar     = puede('aplicar',       'mezclas');
  const puedeHistorial   = puede('ver_historial', 'mezclas');

  const [tab, setTab]               = useState('mezclas');
  const [mezclas, setMezclas]       = useState([]);
  const [aplicaciones, setApls]     = useState([]);
  const [productos, setProductos]   = useState([]);
  const [unidades, setUnidades]     = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [toast, setToast]           = useState(null);

  // modales
  const [modalMezcla, setModalMezcla]   = useState({ abierto: false, mezcla: null });
  const [modalAplicar, setModalAplicar] = useState({ abierto: false, mezcla: null });
  const [mezclaDetalle, setDetalle]     = useState(null);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarMezclas = useCallback(async () => {
    setCargando(true);
    try {
      const [mRes, pRes, uRes] = await Promise.all([
        mezclaService.listar(),
        mezclaService.auxProductos(),
        mezclaService.auxUnidades(),
      ]);
      setMezclas(mRes.data);
      setProductos(pRes.data);
      setUnidades(uRes.data);
    } catch {
      mostrarToast('Error al cargar mezclas', 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarAplicaciones = useCallback(async () => {
    if (!puedeHistorial) return;
    try {
      const r = await mezclaService.listarAplicaciones();
      setApls(r.data);
    } catch { /* silencioso */ }
  }, [puedeHistorial]);

  useEffect(() => { cargarMezclas(); }, [cargarMezclas]);
  useEffect(() => { if (tab === 'historial') cargarAplicaciones(); }, [tab, cargarAplicaciones]);

  const abrirEditar = async (m) => {
    try {
      const r = await mezclaService.obtener(m.id_mezcla);
      setModalMezcla({ abierto: true, mezcla: r.data });
    } catch {
      mostrarToast('Error al cargar la mezcla', 'error');
    }
  };

  const abrirAplicar = async (m) => {
    try {
      const r = await mezclaService.obtener(m.id_mezcla);
      setModalAplicar({ abierto: true, mezcla: r.data });
    } catch {
      mostrarToast('Error al cargar la mezcla', 'error');
    }
  };

  const onGuardar = () => {
    setModalMezcla({ abierto: false, mezcla: null });
    mostrarToast('Mezcla guardada correctamente');
    cargarMezclas();
  };

  const onAplicar = () => {
    setModalAplicar({ abierto: false, mezcla: null });
    mostrarToast('Mezcla aplicada — stock descontado de tu sucursal');
    cargarMezclas();
    if (tab === 'historial') cargarAplicaciones();
  };

  const toggleActivo = async (m) => {
    try {
      await mezclaService.toggle(m.id_mezcla);
      mostrarToast(`Mezcla ${m.activo ? 'desactivada' : 'activada'}`);
      cargarMezclas();
    } catch {
      mostrarToast('Error al cambiar estado', 'error');
    }
  };

  const TABS = [
    { key: 'mezclas',   label: 'Fórmulas',  show: puedeVer },
    { key: 'historial', label: 'Historial',  show: puedeHistorial },
  ].filter(t => t.show);

  return (
    <PageWrapper titulo="Mezclas / Formulaciones">
      <Toast toast={toast} />

      <ModalMezcla
        abierto={modalMezcla.abierto}
        mezcla={modalMezcla.mezcla}
        productos={productos}
        unidades={unidades}
        onGuardar={onGuardar}
        onCerrar={() => setModalMezcla({ abierto: false, mezcla: null })}
      />

      <ModalAplicar
        abierto={modalAplicar.abierto}
        mezcla={modalAplicar.mezcla}
        onAplicar={onAplicar}
        onCerrar={() => setModalAplicar({ abierto: false, mezcla: null })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Mezclas</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            Define fórmulas con múltiples productos y aplícalas para descontar stock automáticamente
          </p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setModalMezcla({ abierto: true, mezcla: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500
                       text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva mezcla
          </button>
        )}
      </div>

      {/* Tabs */}
      {TABS.length > 1 && (
        <div className="flex gap-1 mb-5 border-b border-zinc-200 dark:border-zinc-800">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab: Fórmulas */}
      {tab === 'mezclas' && (
        cargando ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : mezclas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575 1.575M19.8 15l1.35 1.35m-1.35-1.35L15 19.8m4.8-4.8-1.575 1.575M5 14.5l-1.35 1.35M5 14.5l1.575 1.575" />
            </svg>
            <p className="text-sm font-medium">Sin mezclas registradas</p>
            {puedeCrear && <p className="text-xs mt-1">Crea tu primera fórmula con el botón de arriba</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mezclas.map(m => (
              <div key={m.id_mezcla}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 flex flex-col gap-3 transition-opacity
                  ${m.activo ? 'border-zinc-200 dark:border-zinc-800' : 'border-zinc-100 dark:border-zinc-800/50 opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{m.nombre}</h3>
                    {m.descripcion && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-2">{m.descripcion}</p>
                    )}
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                    ${m.activo
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
                    {m.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082" />
                  </svg>
                  {m.total_ingredientes} ingrediente{m.total_ingredientes !== 1 ? 's' : ''}
                </div>

                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  {puedeAplicar && m.activo && (
                    <button onClick={() => abrirAplicar(m)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors text-center">
                      Aplicar
                    </button>
                  )}
                  {puedeEditar && (
                    <button onClick={() => abrirEditar(m)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300
                                 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center">
                      Editar
                    </button>
                  )}
                  {puedeActivar && (
                    <button onClick={() => toggleActivo(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                        ${m.activo
                          ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                          : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10'}`}>
                      {m.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab: Historial */}
      {tab === 'historial' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                {['Fecha', 'Mezcla', 'Tandas', 'Sucursal', 'Usuario', 'Observaciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {aplicaciones.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500">Sin aplicaciones registradas</td></tr>
              ) : aplicaciones.map(a => (
                <tr key={a.id_aplicacion} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(a.fecha_aplicacion).toLocaleString('es-BO')}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{a.mezcla_nombre}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 tabular-nums">{fmt(a.cantidad_tandas)}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.sucursal_nombre}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.usuario_nombre} {a.usuario_apellido}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-500 max-w-xs truncate">{a.observaciones || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
