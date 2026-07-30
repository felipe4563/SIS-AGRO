import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';
import { Toast, useToast } from '../components/Toast';

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50';
const btnCls   = 'w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold transition-colors';

export default function RecuperarContrasena() {
  const [paso, setPaso]                     = useState(1);
  const [identificador, setIdentificador]   = useState('');
  const [codigo, setCodigo]                 = useState('');
  const [resetToken, setResetToken]         = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmar, setConfirmar]           = useState('');
  const [cargando, setCargando]             = useState(false);
  const { toast, mostrarToast }             = useToast();
  const navigate                            = useNavigate();

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!identificador.trim()) return;
    setCargando(true);
    try {
      const { data } = await authService.solicitarRecuperacion(identificador.trim());
      if (data.sin_correo_recuperacion) {
        mostrarToast('error', 'Esta cuenta no tiene un correo de recuperación configurado. Contacta a un administrador.');
      } else {
        mostrarToast('ok', data.mensaje);
        setPaso(2);
      }
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'No se pudo procesar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    if (codigo.trim().length !== 6) return;
    setCargando(true);
    try {
      const { data } = await authService.verificarCodigoRecuperacion(identificador.trim(), codigo.trim());
      setResetToken(data.reset_token);
      setPaso(3);
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Código inválido o expirado');
    } finally {
      setCargando(false);
    }
  };

  const handleRestablecer = async (e) => {
    e.preventDefault();
    if (nuevaContrasena.length < 6) {
      mostrarToast('error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaContrasena !== confirmar) {
      mostrarToast('error', 'Las contraseñas no coinciden');
      return;
    }
    setCargando(true);
    try {
      await authService.restablecerContrasena(resetToken, nuevaContrasena);
      mostrarToast('ok', 'Contraseña actualizada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'No se pudo restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Toast toast={toast} />
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Recuperar contraseña</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {paso === 1 && 'Ingresa tu correo institucional o CI'}
          {paso === 2 && 'Ingresa el código que enviamos a tu correo de recuperación'}
          {paso === 3 && 'Elige tu nueva contraseña'}
        </p>

        {paso === 1 && (
          <form onSubmit={handleSolicitar} className="space-y-4">
            <input
              type="text" required value={identificador}
              onChange={e => setIdentificador(e.target.value)}
              placeholder="Correo o CI" className={inputCls}
            />
            <button type="submit" disabled={cargando} className={btnCls}>
              {cargando ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {paso === 2 && (
          <form onSubmit={handleVerificar} className="space-y-4">
            <input
              type="text" required value={codigo} maxLength={6} inputMode="numeric"
              onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
              placeholder="Código de 6 dígitos"
              className={inputCls + ' text-center tracking-[0.5em] font-bold'}
            />
            <button type="submit" disabled={cargando || codigo.length !== 6} className={btnCls}>
              {cargando ? 'Verificando...' : 'Verificar código'}
            </button>
            <button
              type="button" onClick={handleSolicitar} disabled={cargando}
              className="w-full text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Reenviar código
            </button>
          </form>
        )}

        {paso === 3 && (
          <form onSubmit={handleRestablecer} className="space-y-4">
            <input
              type="password" required value={nuevaContrasena}
              onChange={e => setNuevaContrasena(e.target.value)}
              placeholder="Nueva contraseña (mín. 6 caracteres)" className={inputCls}
            />
            <input
              type="password" required value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="Repetir contraseña" className={inputCls}
            />
            <button type="submit" disabled={cargando} className={btnCls}>
              {cargando ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="block text-center text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 mt-6 transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
