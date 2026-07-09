import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TARGET = 'rusoft.dev';
const STAR_COUNT = 220;

export default function Landing() {
  const [display,    setDisplay]    = useState('          ');
  const [showBtn,    setShowBtn]    = useState(false);
  const [showCorner, setShowCorner] = useState(false);
  const [showCollab, setShowCollab] = useState(false);
  const [exiting,    setExiting]    = useState(false);
  const navigate = useNavigate();
  const { admin } = useAdminAuth();

  // DOM refs — updated directly to avoid per-frame React re-renders
  const canvasRef  = useRef(null);
  const titleRef   = useRef(null);   // 3D tilt target
  const orbRef     = useRef(null);   // parallax orb
  const glowRef    = useRef(null);   // cursor glow
  const mouseRef   = useRef({ x: 0, y: 0 }); // raw normalized [-1,1]
  const lerpRef    = useRef({ x: 0, y: 0 }); // smoothed

  useEffect(() => {
    if (admin) navigate('/dashboard', { replace: true });
  }, [admin, navigate]);

  // ── Mouse tracking (no React state = zero re-renders) ──────────────
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Lerp loop — smooth tilt + parallax ─────────────────────────────
  useEffect(() => {
    let rafId;
    const SPEED = 0.07;
    const tick = () => {
      const { x: tx, y: ty } = mouseRef.current;
      lerpRef.current.x += (tx - lerpRef.current.x) * SPEED;
      lerpRef.current.y += (ty - lerpRef.current.y) * SPEED;
      const lx = lerpRef.current.x;
      const ly = lerpRef.current.y;

      if (titleRef.current) {
        titleRef.current.style.transform =
          `perspective(900px) rotateX(${ly * -13}deg) rotateY(${lx * 13}deg)`;
      }
      if (orbRef.current) {
        orbRef.current.style.transform =
          `translate(calc(-50% + ${lx * 45}px), calc(-50% + ${ly * 45}px))`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── Hyperspace starfield canvas ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x:  (Math.random() - 0.5) * 2000,
      y:  (Math.random() - 0.5) * 2000,
      z:  Math.random() * 1000,
      pz: 1000,
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Semi-transparent clear → streak / trail effect
      ctx.fillStyle = 'rgba(3, 7, 18, 0.28)';
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        s.pz = s.z;
        s.z -= 3.8;
        if (s.z <= 1) {
          s.x  = (Math.random() - 0.5) * 2000;
          s.y  = (Math.random() - 0.5) * 2000;
          s.z  = 1000;
          s.pz = 1000;
        }

        const f   = 400;
        const cx  = W / 2 + mouseRef.current.x * 55;
        const cy  = H / 2 + mouseRef.current.y * 55;

        const sx  = (s.x / s.z)  * f + cx;
        const sy  = (s.y / s.z)  * f + cy;
        const px  = (s.x / s.pz) * f + cx;
        const py  = (s.y / s.pz) * f + cy;

        const t   = 1 - s.z / 1000; // 0 far → 1 near
        const op  = Math.min(1, t * 1.6);
        const sz  = Math.max(0.4, t * 2.4);

        // Near = bright white-indigo, far = dim blue
        const r = Math.round(100 + t * 155);
        const g = Math.round(100 + t * 130);
        const b = Math.round(200 + t * 55);

        ctx.strokeStyle = `rgba(${r},${g},${b},${op})`;
        ctx.lineWidth   = sz;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Scramble text ───────────────────────────────────────────────────
  useEffect(() => {
    let iter = 0;
    let rafId;
    const tick = () => {
      setDisplay(
        TARGET.split('').map((_, i) =>
          i < Math.floor(iter)
            ? TARGET[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
      );
      iter += 0.25;
      if (iter <= TARGET.length) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(TARGET);
        setTimeout(() => setShowBtn(true),    300);
        setTimeout(() => setShowCorner(true), 600);
        setTimeout(() => setShowCollab(true), 900);
      }
    };
    const delay = setTimeout(() => { rafId = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(delay); cancelAnimationFrame(rafId); };
  }, []);

  const handleLogin = () => {
    setExiting(true);
    setTimeout(() => navigate('/login'), 650);
  };

  return (
    <>
      <style>{`
        @keyframes btn-corner-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes btn-glow {
          0%, 100% { box-shadow: 0 0 16px rgba(99,102,241,0.3); }
          50%       { box-shadow: 0 0 32px rgba(99,102,241,0.65); }
        }
        @keyframes curtain-close {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0%   0 0); }
        }
        @keyframes corner-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes collab-in {
          from { opacity: 0; transform: translateY(14px) scale(0.96); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
        }
        @keyframes wave-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
          50%       { box-shadow: 0 0 20px 3px rgba(6,182,212,0.22); }
        }
        @keyframes title-in {
          from { opacity: 0; transform: translateY(28px); filter: blur(10px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes scan-line {
          0%   { top: 0%;   opacity: 0; }
          5%   { opacity: 0.8; }
          95%  { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes radar-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
        }
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.07; }
          50%       { opacity: 0.13; }
        }
        @keyframes glow-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .scramble {
          font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
        }
        .wave-text {
          background: linear-gradient(90deg, #67e8f9, #22d3ee, #a5f3fc, #67e8f9);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: wave-shimmer 3s linear infinite;
        }
        .title-tilt {
          transform-style: preserve-3d;
          will-change: transform;
          transition: none;
        }
      `}</style>

      {/* ── Starfield canvas ── */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* ── Cursor glow ── */}
      <div
        ref={glowRef}
        className="fixed pointer-events-none rounded-full"
        style={{
          zIndex: 1,
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)',
          transform: 'translate(-50%, -50%)',
          top: '50%',
          left: '50%',
          animation: 'glow-fade-in 1.2s ease 1.5s both',
        }}
      />

      {/* ── Curtain de salida ── */}
      {exiting && (
        <div
          className="fixed inset-0 z-50 bg-[#030712]"
          style={{ animation: 'curtain-close 0.65s cubic-bezier(0.76,0,0.24,1) forwards' }}
        />
      )}

      {/* ── Botón esquina superior derecha ── */}
      {showBtn && (
        <button
          onClick={handleLogin}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white tracking-widest uppercase overflow-hidden transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #4338ca, #7c3aed)',
            animation: 'btn-corner-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards, btn-glow 3s ease-in-out 0.5s infinite',
          }}
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          <span className="relative z-10 hidden xs:inline">Iniciar Sesión</span>
          <span className="relative z-10 xs:hidden">Login</span>
          <svg
            className="relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      )}

      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden select-none">

        {/* ── Orbe central con parallax (transform via JS) ── */}
        <div
          ref={orbRef}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '820px',
            height: '820px',
            background: 'radial-gradient(circle, #4f46e5 0%, transparent 60%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'orb-pulse 6s ease-in-out infinite',
          }}
        />

        {/* ── Pulsos de radar ── */}
        {[0, 1.8, 3.6].map((delay, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-indigo-500/15 pointer-events-none"
            style={{
              width: '300px', height: '300px',
              top: '50%', left: '50%',
              animation: `radar-pulse 5.4s ease-out ${delay}s infinite`,
            }}
          />
        ))}

        {/* ── Esquinas decorativas ── */}
        <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-indigo-500/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-indigo-500/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-10 h-10 border-r border-t border-indigo-500/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-l border-b border-indigo-500/5 pointer-events-none" />

        {/* ── Contenido principal ── */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">

          {/* Entrada del título (animación CSS en wrapper externo) */}
          <div style={{ animation: 'title-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>

            {/* Tilt 3D (transform vía JS directo en titleRef) */}
            <div ref={titleRef} className="title-tilt relative">
              <h1 className="scramble text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none"
                style={{
                  textShadow: '0 8px 40px rgba(79,70,229,0.35), 0 2px 0 rgba(99,102,241,0.2)',
                }}
              >
                <span className="text-white">{display.slice(0, 6)}</span>
                <span className="text-indigo-400">{display.slice(6)}</span>
              </h1>

              {/* Reflejo/sombra 3D debajo del texto */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 scramble text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none pointer-events-none"
                style={{
                  top: '100%',
                  background: 'linear-gradient(to bottom, rgba(79,70,229,0.18), transparent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transform: 'scaleY(-1) translateY(2px)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 60%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 60%)',
                }}
              >
                {TARGET}
              </div>

              {/* Línea de escaneo */}
              <div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
                  animation: 'scan-line 1.8s ease-in-out 0.4s 1 forwards',
                  top: 0,
                }}
              />
            </div>
          </div>

          {/* Badge de colaboración */}
          {showCollab && (
            <div
              className="flex flex-col items-center gap-2"
              style={{ animation: 'collab-in 0.7s cubic-bezier(0.16,1,0.3,1) forwards' }}
            >
              <span className="text-zinc-600 text-[9px] tracking-[0.35em] uppercase font-medium">
                en colaboración con
              </span>
              <div
                className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/5 backdrop-blur-sm"
                style={{ animation: 'badge-glow 3s ease-in-out 0.5s infinite' }}
              >
                <svg className="w-3.5 h-3.5 text-cyan-400/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
                </svg>
                <span className="wave-text text-xs font-bold tracking-widest uppercase">
                  Code Wave
                </span>
                <svg className="w-3.5 h-3.5 text-cyan-400/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {showCorner && (
          <div
            className="absolute bottom-4 sm:bottom-5 left-0 right-0 flex items-center justify-center gap-2"
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
