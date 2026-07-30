import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../api/adminApi';

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200';
const btnCls   = 'w-full py-3 rounded-xl font-bold text-sm text-white mt-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed';
const btnStyle = { background: 'linear-gradient(135deg, #4338ca, #7c3aed)' };

export default function RecuperarContrasena() {
  const [paso, setPaso]                       = useState(1);
  const [correo, setCorreo]                   = useState('');
  const [codigo, setCodigo]                   = useState('');
  const [resetToken, setResetToken]           = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmar, setConfirmar]             = useState('');
  const [cargando, setCargando]               = useState(false);
  const [error, setError]                     = useState('');
  const [mensajeOk, setMensajeOk]             = useState('');
  const navigate                              = useNavigate();

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!correo.trim()) return;
    setCargando(true);
    setError('');
    try {
      const { data } = await adminApi.post('/auth/recuperar/solicitar', { identificador: correo.trim() });
      if (data.sin_correo_recuperacion) {
        setError('Esta cuenta no tiene un correo de recuperación configurado. Contacta a otro administrador.');
      } else {
        setMensajeOk(data.mensaje);
        setPaso(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo procesar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    if (codigo.trim().length !== 6) return;
    setCargando(true);
    setError('');
    try {
      const { data } = await adminApi.post('/auth/recuperar/verificar', { identificador: correo.trim(), codigo: codigo.trim() });
      setResetToken(data.reset_token);
      setPaso(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido o expirado');
    } finally {
      setCargando(false);
    }
  };

  const handleRestablecer = async (e) => {
    e.preventDefault();
    setError('');
    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaContrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setCargando(true);
    try {
      await adminApi.post('/auth/recuperar/restablecer', { reset_token: resetToken, nueva_contrasena: nuevaContrasena });
      setMensajeOk('Contraseña actualizada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-white font-bold text-lg mb-1">Recuperar contraseña</h1>
          <p className="text-zinc-500 text-sm mb-6">
            {paso === 1 && 'Ingresa tu correo de administrador'}
            {paso === 2 && 'Ingresa el código que enviamos a tu correo de recuperación'}
            {paso === 3 && 'Elige tu nueva contraseña'}
          </p>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}
          {mensajeOk && !error && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm mb-5">{mensajeOk}</div>}

          {paso === 1 && (
            <form onSubmit={handleSolicitar} className="space-y-4">
              <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} placeholder="admin@sisagro.bo" className={inputCls} />
              <button type="submit" disabled={cargando} className={btnCls} style={btnStyle}>
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
              <button type="submit" disabled={cargando || codigo.length !== 6} className={btnCls} style={btnStyle}>
                {cargando ? 'Verificando...' : 'Verificar código'}
              </button>
            </form>
          )}

          {paso === 3 && (
            <form onSubmit={handleRestablecer} className="space-y-4">
              <input type="password" required value={nuevaContrasena} onChange={e => setNuevaContrasena(e.target.value)} placeholder="Nueva contraseña (mín. 6 caracteres)" className={inputCls} />
              <input type="password" required value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="Repetir contraseña" className={inputCls} />
              <button type="submit" disabled={cargando} className={btnCls} style={btnStyle}>
                {cargando ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}

          <Link to="/login" className="block text-center text-xs text-zinc-500 hover:text-zinc-300 mt-6 transition-colors">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
