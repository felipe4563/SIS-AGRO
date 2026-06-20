import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const inputCls = `w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
  bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition
  disabled:opacity-50 disabled:cursor-not-allowed placeholder-zinc-400`;

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isOk = toast.type === 'ok';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
      ${isOk
        ? 'bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-white dark:bg-zinc-900 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
      }`}>
      {isOk
        ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
      }
      {toast.msg}
    </div>
  );
}

function FieldErr({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 dark:text-red-400">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      {msg}
    </p>
  );
}

export default function Perfil() {
  const { admin, updateAdmin } = useAdminAuth();
  const [toast, setToast] = useState(null);

  /* ── Datos personales ── */
  const [datos,       setDatos]       = useState({ nombre: '', correo: '' });
  const [datosErr,    setDatosErr]    = useState('');
  const [guardandoD,  setGuardandoD]  = useState(false);

  /* ── Contraseña ── */
  const [pass,        setPass]        = useState({ actual: '', nueva: '', confirmar: '' });
  const [passErr,     setPassErr]     = useState('');
  const [showActual,  setShowActual]  = useState(false);
  const [showNueva,   setShowNueva]   = useState(false);
  const [guardandoP,  setGuardandoP]  = useState(false);

  useEffect(() => {
    adminApi.get('/perfil').then(({ data }) => {
      setDatos({ nombre: data.nombre, correo: data.correo });
    }).catch(console.error);
  }, []);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const guardarDatos = async (e) => {
    e.preventDefault();
    if (!datos.nombre.trim() || !datos.correo.trim()) {
      setDatosErr('Nombre y correo son requeridos');
      return;
    }
    setGuardandoD(true);
    setDatosErr('');
    try {
      const { data } = await adminApi.put('/perfil', datos);
      updateAdmin(data.admin, data.token);
      showToast('Datos actualizados correctamente');
    } catch (err) {
      setDatosErr(err.response?.data?.error || 'Error al guardar los datos');
    } finally {
      setGuardandoD(false);
    }
  };

  const guardarPassword = async (e) => {
    e.preventDefault();
    if (!pass.actual || !pass.nueva || !pass.confirmar) {
      setPassErr('Completa todos los campos');
      return;
    }
    if (pass.nueva !== pass.confirmar) {
      setPassErr('Las contraseñas nuevas no coinciden');
      return;
    }
    if (pass.nueva.length < 6) {
      setPassErr('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setGuardandoP(true);
    setPassErr('');
    try {
      await adminApi.put('/perfil/password', {
        contrasena_actual: pass.actual,
        contrasena_nueva:  pass.nueva,
      });
      setPass({ actual: '', nueva: '', confirmar: '' });
      showToast('Contraseña actualizada correctamente');
    } catch (err) {
      setPassErr(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setGuardandoP(false);
    }
  };

  const initials = admin?.nombre
    ? admin.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="max-w-2xl mx-auto">
      <Toast toast={toast} />

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Mi perfil</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Gestiona tu información personal y seguridad
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-zinc-800 dark:text-zinc-100 truncate">{admin?.nombre}</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 truncate">{admin?.correo}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            Super Admin
          </span>
        </div>
      </div>

      <div className="space-y-4">

        {/* Datos personales */}
        <SectionCard title="Datos personales" subtitle="Actualiza tu nombre y correo electrónico">
          <form onSubmit={guardarDatos} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                value={datos.nombre}
                onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))}
                placeholder="Tu nombre"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={datos.correo}
                onChange={e => setDatos(d => ({ ...d, correo: e.target.value }))}
                placeholder="tu@correo.com"
                className={inputCls}
              />
            </div>
            <FieldErr msg={datosErr} />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={guardandoD}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {guardandoD ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Cambiar contraseña */}
        <SectionCard title="Seguridad" subtitle="Cambia tu contraseña de acceso">
          <form onSubmit={guardarPassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showActual ? 'text' : 'password'}
                  value={pass.actual}
                  onChange={e => setPass(p => ({ ...p, actual: e.target.value }))}
                  placeholder="••••••••"
                  className={inputCls + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowActual(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showActual
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  }
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNueva ? 'text' : 'password'}
                  value={pass.nueva}
                  onChange={e => setPass(p => ({ ...p, nueva: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className={inputCls + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowNueva(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showNueva
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  }
                </button>
              </div>
              {pass.nueva && pass.nueva.length < 6 && (
                <p className="mt-1.5 text-xs text-amber-500 dark:text-amber-400">Al menos 6 caracteres</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                value={pass.confirmar}
                onChange={e => setPass(p => ({ ...p, confirmar: e.target.value }))}
                placeholder="Repite la nueva contraseña"
                className={inputCls + (pass.confirmar && pass.nueva !== pass.confirmar ? ' border-red-300 dark:border-red-500/50 focus:ring-red-400/40' : '')}
              />
              {pass.confirmar && pass.nueva !== pass.confirmar && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">Las contraseñas no coinciden</p>
              )}
            </div>

            <FieldErr msg={passErr} />

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={guardandoP}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {guardandoP ? 'Actualizando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </SectionCard>

      </div>
    </div>
  );
}
