import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TARGET = 'rusoft.dev';

export default function Landing() {
  const [display,    setDisplay]    = useState('          ');
  const [showSub,    setShowSub]    = useState(false);
  const [showBtn,    setShowBtn]    = useState(false);
  const [showCorner, setShowCorner] = useState(false);
  const [exiting,    setExiting]    = useState(false);
  const navigate = useNavigate();
  const { admin } = useAdminAuth();

  // Si ya está logueado, ir al dashboard
  useEffect(() => {
    if (admin) navigate('/dashboard', { replace: true });
  }, [admin, navigate]);

  // Scramble effect
  useEffect(() => {
    let iteration = 0;
    let animId;

    const tick = () => {
      setDisplay(
        TARGET.split('').map((_, i) =>
          i < Math.floor(iteration)
            ? TARGET[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
      );
      iteration += 0.25;
      if (iteration <= TARGET.length) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplay(TARGET);
        setTimeout(() => setShowSub(true),    150);
        setTimeout(() => setShowBtn(true),    500);
        setTimeout(() => setShowCorner(true), 800);
      }
    };

    const delay = setTimeout(() => { animId = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(delay); cancelAnimationFrame(animId); };
  }, []);

  const handleLogin = () => {
    setExiting(true);
    setTimeout(() => navigate('/login'), 650);
  };

  return (
    <>
      <style>{`
        @keyframes grid-drift {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        @keyframes orb-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.08; }
          50%       { transform: translate(-50%, -50%) scale(1.2); opacity: 0.14; }
        }
        @keyframes scan-line {
          0%   { top: 0%;   opacity: 0; }
          5%   { opacity: 0.7; }
          95%  { opacity: 0.7; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes btn-appear {
          0%   { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes btn-glow {
          0%, 100% { box-shadow: 0 0 24px rgba(99,102,241,0.35), 0 0 48px rgba(99,102,241,0.12); }
          50%       { box-shadow: 0 0 36px rgba(99,102,241,0.65), 0 0 72px rgba(99,102,241,0.22); }
        }
        @keyframes curtain-close {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0%   0 0); }
        }
        @keyframes corner-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .scramble {
          font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
        }
      `}</style>

      {/* Curtain de salida */}
      {exiting && (
        <div
          className="fixed inset-0 z-50 bg-[#030712]"
          style={{ animation: 'curtain-close 0.65s cubic-bezier(0.76,0,0.24,1) forwards' }}
        />
      )}

      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden select-none">

        {/* Grid animado de fondo */}
        <div
          className="absolute inset-[-80px] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            animation: 'grid-drift 8s linear infinite',
          }}
        />

        {/* Orbe central */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '700px', height: '700px',
            background: 'radial-gradient(circle, #4f46e5 0%, transparent 65%)',
            top: '50%', left: '50%',
            animation: 'orb-breathe 6s ease-in-out infinite',
          }}
        />

        {/* Líneas de borde decorativas */}
        <div className="absolute top-0 left-0 w-24 h-24 border-l border-t border-indigo-500/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-indigo-500/10 pointer-events-none" />

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-4 text-center">

          {/* Texto principal con scramble */}
          <div className="relative">
            <h1 className="scramble text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none">
              <span className="text-white">{display.slice(0, 6)}</span>
              <span className="text-indigo-400">{display.slice(6)}</span>
            </h1>

            {/* Línea de escaneo que pasa sobre el texto */}
            <div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
                animation: 'scan-line 1.8s ease-in-out 0.4s 1 forwards',
                top: 0,
              }}
            />
          </div>

          {/* Subtítulo */}
          {showSub && (
            <p
              className="text-zinc-500 text-xs sm:text-sm tracking-[0.35em] uppercase font-medium"
              style={{ animation: 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards' }}
            >
              Sistema de Gestión Agropecuaria
            </p>
          )}

          {/* Separador */}
          {showSub && (
            <div
              className="flex items-center gap-3"
              style={{ animation: 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
            >
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-indigo-500/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"
                style={{ animation: 'dot-blink 1.5s ease-in-out infinite' }} />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-indigo-500/40" />
            </div>
          )}

          {/* Botón */}
          {showBtn && (
            <button
              onClick={handleLogin}
              className="group relative mt-1 px-9 py-3.5 rounded-full text-sm font-bold text-white tracking-widest uppercase transition-all duration-300 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #4338ca, #7c3aed)',
                animation: 'btn-appear 0.6s cubic-bezier(0.16,1,0.3,1) forwards, btn-glow 3s ease-in-out 0.6s infinite',
              }}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />

              <span className="relative z-10 flex items-center gap-2.5">
                Iniciar Sesión
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          )}
        </div>

        {/* Esquina inferior */}
        {showCorner && (
          <div
            className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2"
            style={{ animation: 'corner-in 0.8s ease forwards' }}
          >
            <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
            <span className="text-zinc-700 text-[10px] tracking-[0.4em] uppercase">Powered by Rusoft</span>
            <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
          </div>
        )}
      </div>
    </>
  );
}
