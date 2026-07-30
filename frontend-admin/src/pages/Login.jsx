import { useState, useEffect } from 'react';
import { useNavigate, Link }  from 'react-router-dom';
import { useAdminAuth }       from '../contexts/AdminAuthContext';

export default function Login() {
  const [correo,     setCorreo]     = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrar,    setMostrar]    = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const { login, cargando, error }  = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) return;
    try {
      await login(correo.trim(), contrasena);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 700);
    } catch { /* error manejado en contexto */ }
  };

  return (
    <>
      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(36px) scale(0.97); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
        }
        @keyframes field-in {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes back-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes success-flash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes orb-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.05; }
          50%       { transform: translate(-50%, -50%) scale(1.15); opacity: 0.09; }
        }
        @keyframes icon-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* Flash de éxito */}
      {success && (
        <div
          className="fixed inset-0 z-50 bg-[#030712]"
          style={{ animation: 'success-flash 0.7s ease forwards' }}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-[#030712] px-4 relative overflow-hidden">

        {/* Orbe de fondo */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, #4f46e5 0%, transparent 65%)',
            top: '50%', left: '50%',
            animation: 'orb-breathe 6s ease-in-out infinite',
          }}
        />

        {/* Esquinas decorativas */}
        <div className="absolute top-0 left-0 w-20 h-20 border-l border-t border-indigo-500/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-r border-b border-indigo-500/10 pointer-events-none" />

        {/* Volver */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-zinc-600 hover:text-zinc-300 text-sm flex items-center gap-1.5 transition-colors duration-200 z-10"
          style={{ animation: 'back-in 0.5s ease 0.9s both' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span className="font-mono text-xs tracking-wider">rusoft.dev</span>
        </button>

        {/* Card */}
        <div
          className="w-full max-w-sm relative z-10"
          style={mounted ? { animation: 'card-in 0.65s cubic-bezier(0.16,1,0.3,1) forwards' } : { opacity: 0 }}
        >
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl">

            {/* Header */}
            <div
              className="text-center mb-8"
              style={{ animation: 'field-in 0.5s ease 0.25s both' }}
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-indigo-500/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                  animation: 'icon-pop 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both',
                }}
              >
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <p className="text-white font-bold text-lg tracking-tight">Panel de Administración</p>
              <p className="text-indigo-400/70 text-[10px] tracking-[0.4em] uppercase mt-0.5 font-mono">rusoft.dev</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-5"
                style={{ animation: 'field-in 0.3s ease forwards' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Correo */}
              <div style={{ animation: 'field-in 0.5s ease 0.35s both' }}>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wider uppercase">
                  Correo
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                  placeholder="admin@sisagro.bo"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              {/* Contraseña */}
              <div style={{ animation: 'field-in 0.5s ease 0.45s both' }}>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wider uppercase">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrar ? 'text' : 'password'}
                    value={contrasena}
                    onChange={e => setContrasena(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-zinc-800/70 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar(m => !m)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {mostrar
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Botón submit */}
              <div style={{ animation: 'field-in 0.5s ease 0.55s both' }}>
                <button
                  type="submit"
                  disabled={cargando || !correo || !contrasena}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2 relative overflow-hidden group transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />

                  <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest uppercase text-xs">
                    {cargando
                      ? <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Autenticando…
                        </>
                      : 'Ingresar'
                    }
                  </span>
                </button>
              </div>

              <div className="text-center mt-1">
                <Link to="/recuperar-contrasena" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
