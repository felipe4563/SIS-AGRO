import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const CLAVE_SESSION = 'admin_recordatorio_correo_recuperacion_oculto';

export default function RecordatorioCorreoRecuperacion() {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!admin) return;
    const yaOcultado = sessionStorage.getItem(CLAVE_SESSION);
    if (!admin.correo_recuperacion && !yaOcultado) {
      setVisible(true);
    }
  }, [admin]);

  const recordarDespues = () => {
    sessionStorage.setItem(CLAVE_SESSION, '1');
    setVisible(false);
  };

  const cargarAhora = () => {
    sessionStorage.setItem(CLAVE_SESSION, '1');
    setVisible(false);
    navigate('/perfil');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-white mb-2">Configura tu correo de recuperación</h3>
        <p className="text-sm text-zinc-400 mb-5">
          Todavía no tienes un correo de recuperación configurado. Sin él, no vas a poder recuperar el acceso al panel si olvidas tu contraseña.
        </p>
        <div className="flex gap-3">
          <button
            onClick={recordarDespues}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            Recordarme después
          </button>
          <button
            onClick={cargarAhora}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)' }}
          >
            Cargar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
