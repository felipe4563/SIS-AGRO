import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import cajaService from '../../services/caja.service';
import sucursalService from '../../services/sucursal.service';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../contexts/AuthContext';
import { ModalCaja, ModalAbrirTurno, ModalCerrarTurno } from './components/CajaModals';

// ── Iconos ───────────────────────────────────────────────────────────────────
function IconCaja() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
    </svg>
  );
}
function IconHistorial() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function IconUnlock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconWarn() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.tipo === 'ok';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium max-w-xs sm:max-w-sm ${
      ok
        ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
    }`}>
      <span className={`shrink-0 mt-0.5 p-1 rounded-full ${ok ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300' : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'}`}>
        {ok ? <IconCheck /> : <IconWarn />}
      </span>
      <span className="break-words leading-snug">{toast.msg}</span>
    </div>
  );
}

// ── Badges ───────────────────────────────────────────────────────────────────
function BadgeActivo({ activo }) {
  return activo
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Activa
      </span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />Inactiva
      </span>;
}

function BadgeTurno({ estado }) {
  return estado === 'ABIERTA'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Abierta
      </span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />Cerrada
      </span>;
}

// ── Utilidades ───────────────────────────────────────────────────────────────
function fmt(n) { return parseFloat(n || 0).toFixed(2); }
function fmtFecha(d) { return d ? new Date(d).toLocaleString('es-BO') : '—'; }

// ── Componente principal ─────────────────────────────────────────────────────
function IconMovimientos() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

const ALL_TABS = ['cajas', 'movimientos', 'turnos'];
const TAB_LABELS = { cajas: 'Cajas', movimientos: 'Movimientos del turno', turnos: 'Historial de turnos' };
const TAB_ICONS = {
  cajas:        <IconCaja />,
  movimientos:  <IconMovimientos />,
  turnos:       <IconHistorial />,
};

export default function Caja() {
  const { puede } = usePermission();
  const { usuario } = useAuth();

  const [tab, setTab] = useState('cajas');
  const [cajas, setCajas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [cargandoCajas, setCargandoCajas] = useState(true);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [movimientosTurno, setMovimientosTurno] = useState([]);
  const [turnoMovimientos, setTurnoMovimientos] = useState(null);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [cajaActiva, setCajaActiva] = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3800);
  };

  const cargarCajas = useCallback(async () => {
    setCargandoCajas(true);
    try {
      const res = await cajaService.listarCajas();
      setCajas(res.data);
    } catch {
      mostrarToast('error', 'Error al cargar cajas');
    } finally {
      setCargandoCajas(false);
    }
  }, []);

  const puedeVerTodasCajas   = puede('ver_todas',       'caja');
  const puedeVerHistorial    = puede('ver_historial',   'caja');
  const puedeVerMovimientos  = puede('ver_movimientos', 'caja');

  const cargarSucursales = useCallback(async () => {
    if (!puedeVerTodasCajas) return;
    try {
      const res = await sucursalService.listar();
      setSucursales(res.data);
    } catch { /* silencioso */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeVerTodasCajas]);

  const cargarTurnoActivo = useCallback(async () => {
    try {
      const res = await cajaService.obtenerTurnoActivo();
      setTurnoActivo(res.data);
    } catch {
      setTurnoActivo(null);
    }
  }, []);

  const cargarMovimientosTurno = useCallback(async () => {
    setCargandoMovimientos(true);
    try {
      const res = await cajaService.listarMovimientosTurno();
      setTurnoMovimientos(res.data.turno);
      setMovimientosTurno(res.data.movimientos);
    } catch {
      mostrarToast('error', 'Error al cargar movimientos del turno');
    } finally {
      setCargandoMovimientos(false);
    }
  }, []);

  const cargarTurnos = useCallback(async () => {
    setCargandoTurnos(true);
    try {
      const res = await cajaService.listarTurnos();
      setTurnos(res.data);
    } catch {
      mostrarToast('error', 'Error al cargar historial de turnos');
    } finally {
      setCargandoTurnos(false);
    }
  }, []);

  const TABS = ALL_TABS.filter(t => {
    if (t === 'movimientos') return puedeVerMovimientos;
    if (t === 'turnos')      return puedeVerHistorial;
    return true;
  });

  useEffect(() => {
    cargarCajas();
    cargarTurnoActivo();
    cargarSucursales();
  }, [cargarCajas, cargarTurnoActivo, cargarSucursales]);

  useEffect(() => {
    if (tab === 'turnos'      && puedeVerHistorial)   cargarTurnos();
    if (tab === 'movimientos' && puedeVerMovimientos)  cargarMovimientosTurno();
  }, [tab, cargarTurnos, cargarMovimientosTurno, puedeVerHistorial, puedeVerMovimientos]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleGuardarCaja = async (form) => {
    setGuardando(true);
    try {
      if (cajaActiva) {
        await cajaService.editarCaja(cajaActiva.id_caja, form);
        mostrarToast('ok', 'Caja actualizada');
      } else {
        await cajaService.crearCaja(form);
        mostrarToast('ok', 'Caja creada');
      }
      setModal(null);
      await cargarCajas();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al guardar caja');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleCaja = async (caja) => {
    try {
      await cajaService.toggleCaja(caja.id_caja);
      mostrarToast('ok', `Caja ${caja.activo ? 'desactivada' : 'activada'}`);
      await cargarCajas();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleAbrirTurno = async (form) => {
    setGuardando(true);
    try {
      await cajaService.abrirCaja(form);
      mostrarToast('ok', 'Turno abierto correctamente');
      setModal(null);
      await cargarTurnoActivo();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al abrir turno');
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarTurno = async (id, form) => {
    setGuardando(true);
    try {
      const res = await cajaService.cerrarCaja(id, form);
      const d = res.data;
      mostrarToast('ok', `Turno cerrado — Esperado: Bs ${fmt(d.monto_esperado)} | Contado: Bs ${fmt(d.monto_final)} | Dif: Bs ${fmt(d.diferencia)}`);
      setModal(null);
      await Promise.all([cargarTurnoActivo(), tab === 'turnos' ? cargarTurnos() : Promise.resolve()]);
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al cerrar turno');
    } finally {
      setGuardando(false);
    }
  };

  const diferenciaBadge = (dif) => {
    const n = parseFloat(dif || 0);
    if (n === 0) return <span className="text-zinc-500 font-mono">Bs 0.00</span>;
    if (n > 0) return <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">+Bs {fmt(n)}</span>;
    return <span className="text-red-500 font-mono font-semibold">-Bs {fmt(Math.abs(n))}</span>;
  };

  return (
    <PageWrapper>
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <IconCaja />
            </span>
            Módulo de Caja
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-10">
            Gestión de cajas físicas, apertura y cierre de turnos.
          </p>
        </div>
      </div>

      {/* ── Banner turno activo / sin turno ── */}
      {turnoActivo ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-800/60 text-emerald-600 dark:text-emerald-400">
                <IconUnlock />
              </span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                    Turno abierto — {turnoActivo.caja_nombre}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Cajero: <strong>{turnoActivo.usuario_nombre} {turnoActivo.usuario_apellido}</strong>
                  &nbsp;·&nbsp; Apertura: {fmtFecha(turnoActivo.fecha_apertura)}
                  &nbsp;·&nbsp; Monto inicial: <strong>Bs {fmt(turnoActivo.monto_inicial)}</strong>
                </p>
              </div>
            </div>
            {puede('cerrar', 'caja') && turnoActivo.id_usuario == (usuario?.id_usuario ?? usuario?.id) && (
              <button
                onClick={() => setModal('cerrarTurno')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium shrink-0 transition-colors"
              >
                <IconLock />
                Cerrar turno
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                <IconLock />
              </span>
              <div>
                <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">Sin turno activo</p>
                {cajas.some(c => c.activo == true || c.activo === 1)
                  ? <p className="text-xs text-zinc-500 mt-0.5">Abra un turno de caja para registrar ventas en esta sucursal.</p>
                  : <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Primero cree una caja desde la pestaña <strong>Cajas</strong>.</p>
                }
              </div>
            </div>
            {puede('abrir', 'caja') && (
              <button
                onClick={() => setModal('abrirTurno')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium shrink-0 transition-colors"
              >
                <IconUnlock />
                Abrir turno
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {TAB_ICONS[t]}
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Tab: Cajas ── */}
      {tab === 'cajas' && (
        <div>
          {puede('crear', 'caja') && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setCajaActiva(null); setModal('nuevaCaja'); }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
              >
                <IconPlus />
                Nueva caja
              </button>
            </div>
          )}

          {cargandoCajas ? (
            <div className="py-16 flex flex-col items-center gap-3 text-zinc-400">
              <svg className="animate-spin w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Cargando cajas...</p>
            </div>
          ) : cajas.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">
              <div className="flex justify-center mb-3 opacity-30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <p className="font-medium">No hay cajas registradas</p>
              <p className="text-sm mt-1">Crea una caja para comenzar a gestionar turnos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {cajas.map(c => (
                <div
                  key={c.id_caja}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 flex flex-col gap-3"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        <IconCaja />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight truncate">{c.nombre}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{c.sucursal_nombre}</p>
                      </div>
                    </div>
                    <BadgeActivo activo={c.activo} />
                  </div>

                  {c.descripcion && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{c.descripcion}</p>
                  )}

                  {/* Card actions */}
                  <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                    {puede('editar', 'caja') && (
                      <button
                        onClick={() => { setCajaActiva(c); setModal('nuevaCaja'); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <IconEdit />
                        Editar
                      </button>
                    )}
                    {puede('activar', 'caja') && (
                      <button
                        onClick={() => handleToggleCaja(c)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border transition-colors ${
                          c.activo
                            ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        {c.activo ? <><IconLock /> Desactivar</> : <><IconUnlock /> Activar</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Movimientos del turno ── */}
      {tab === 'movimientos' && (
        <div>
          {cargandoMovimientos ? (
            <div className="py-16 flex flex-col items-center gap-3 text-zinc-400">
              <svg className="animate-spin w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Cargando movimientos...</p>
            </div>
          ) : !turnoMovimientos ? (
            <div className="py-16 text-center text-zinc-400">
              <div className="flex justify-center mb-3 opacity-30">
                <IconMovimientos />
              </div>
              <p className="font-medium">Sin turno activo</p>
              <p className="text-sm mt-1">Abre un turno de caja para ver sus movimientos de efectivo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumen del turno */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-4 text-sm flex flex-wrap gap-x-6 gap-y-1">
                <span className="text-zinc-500">Caja: <strong className="text-zinc-800 dark:text-zinc-200">{turnoMovimientos.caja_nombre || '—'}</strong></span>
                <span className="text-zinc-500">Apertura: <strong className="text-zinc-800 dark:text-zinc-200">{fmtFecha(turnoMovimientos.fecha_apertura)}</strong></span>
                <span className="text-zinc-500">Monto inicial: <strong className="text-zinc-800 dark:text-zinc-200">Bs {fmt(turnoMovimientos.monto_inicial)}</strong></span>
              </div>

              {movimientosTurno.length === 0 ? (
                <div className="py-10 text-center text-zinc-400">
                  <p className="text-sm">Sin movimientos registrados en este turno.</p>
                </div>
              ) : (
                <>
                  {/* Totales */}
                  {(() => {
                    const ingresos = movimientosTurno.filter(m => m.tipo === 'INGRESO').reduce((s, m) => s + parseFloat(m.monto || 0), 0);
                    const egresos  = movimientosTurno.filter(m => m.tipo === 'EGRESO').reduce((s, m) => s + parseFloat(m.monto || 0), 0);
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Total ingresos', value: ingresos, color: 'emerald' },
                          { label: 'Total egresos',  value: egresos,  color: 'red'     },
                          { label: 'Balance neto',   value: ingresos - egresos, color: ingresos - egresos >= 0 ? 'emerald' : 'red' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className={`rounded-xl border p-3 text-center
                            ${color === 'emerald'
                              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
                            <p className={`font-bold text-sm font-mono
                              ${color === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              Bs {fmt(Math.abs(value))}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Lista */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                          <tr className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            <th className="text-left px-4 py-3 font-medium">Tipo</th>
                            <th className="text-left px-4 py-3 font-medium">Descripción</th>
                            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Origen</th>
                            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                            <th className="text-right px-4 py-3 font-medium">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {movimientosTurno.map((m, i) => (
                            <tr key={i} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                              <td className="px-4 py-3">
                                {m.tipo === 'INGRESO'
                                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">↑ Ingreso</span>
                                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">↓ Egreso</span>
                                }
                              </td>
                              <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                                {m.descripcion}
                                {m.referencia && <span className="ml-1 text-xs text-zinc-400">({m.referencia})</span>}
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  m.origen === 'VENTA'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                  {m.origen === 'VENTA' ? 'Venta' : 'Manual'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs hidden md:table-cell">
                                {fmtFecha(m.fecha)}
                              </td>
                              <td className={`px-4 py-3 text-right font-mono font-semibold ${
                                m.tipo === 'INGRESO'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-500 dark:text-red-400'}`}>
                                {m.tipo === 'INGRESO' ? '+' : '-'}Bs {fmt(m.monto)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Turnos ── */}
      {tab === 'turnos' && (
        <div>
          {cargandoTurnos ? (
            <div className="py-16 flex flex-col items-center gap-3 text-zinc-400">
              <svg className="animate-spin w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Cargando historial...</p>
            </div>
          ) : turnos.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">
              <div className="flex justify-center mb-3 opacity-30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium">Sin historial de turnos</p>
              <p className="text-sm mt-1">Los turnos cerrados aparecerán aquí.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                    <tr className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <th className="text-left px-4 py-3 font-medium">Caja / Sucursal</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Cajero</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Apertura</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cierre</th>
                      <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Inicial</th>
                      <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Esperado</th>
                      <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Contado</th>
                      <th className="text-right px-4 py-3 font-medium">Diferencia</th>
                      <th className="text-center px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {turnos.map(t => (
                      <tr key={t.id_apertura} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-zinc-900 dark:text-white">{t.caja_nombre}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{t.sucursal_nombre}</p>
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 hidden md:table-cell">
                          {t.usuario_nombre} {t.usuario_apellido}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs hidden lg:table-cell">
                          {fmtFecha(t.fecha_apertura)}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs hidden lg:table-cell">
                          {fmtFecha(t.fecha_cierre)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                          Bs {fmt(t.monto_inicial)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                          {t.monto_esperado != null ? `Bs ${fmt(t.monto_esperado)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                          {t.monto_final != null ? `Bs ${fmt(t.monto_final)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {t.diferencia != null ? diferenciaBadge(t.diferencia) : <span className="text-zinc-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <BadgeTurno estado={t.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modales ── */}
      {modal === 'nuevaCaja' && (
        <ModalCaja
          caja={cajaActiva}
          onConfirm={handleGuardarCaja}
          onClose={() => setModal(null)}
          guardando={guardando}
          sucursales={sucursales}
          defaultSucursal={usuario?.id_sucursal}
        />
      )}
      {modal === 'abrirTurno' && (
        <ModalAbrirTurno
          cajas={cajas}
          onConfirm={handleAbrirTurno}
          onClose={() => setModal(null)}
          guardando={guardando}
        />
      )}
      {modal === 'cerrarTurno' && turnoActivo && (
        <ModalCerrarTurno
          turno={turnoActivo}
          onConfirm={handleCerrarTurno}
          onClose={() => setModal(null)}
          guardando={guardando}
        />
      )}
    </PageWrapper>
  );
}
