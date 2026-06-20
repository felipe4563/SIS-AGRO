import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function Login() {
  const [correo,    setCorreo]    = useState('');
  const [contrasena,setContrasena]= useState('');
  const [mostrar,   setMostrar]   = useState(false);
  const { login, cargando, error } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) return;
    try {
      await login(correo.trim(), contrasena);
      navigate('/dashboard', { replace: true });
    } catch { /* error ya en contexto */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold text-indigo-400 tracking-tight">SIS-AGRO</span>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Panel de Administración</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
              placeholder="admin@sisagro.bo"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              <button
                type="button"
                onClick={() => setMostrar(m => !m)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {mostrar
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={cargando || !correo || !contrasena}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors mt-2"
          >
            {cargando ? 'Autenticando...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
