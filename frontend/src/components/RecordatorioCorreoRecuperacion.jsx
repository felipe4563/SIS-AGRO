import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CLAVE_SESSION = 'recordatorio_correo_recuperacion_oculto';

export default function RecordatorioCorreoRecuperacion() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    const yaOcultado = sessionStorage.getItem(CLAVE_SESSION);
    if (!usuario.correo_recuperacion && !yaOcultado) {
      setVisible(true);
    }
  }, [usuario]);

  const recordarDespues = () => {
    sessionStorage.setItem(CLAVE_SESSION, '1');
    setVisible(false);
  };

  const cargarAhora = () => {
    sessionStorage.setItem(CLAVE_SESSION, '1');
    setVisible(false);
    navigate('/mi-perfil');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
          Configura tu correo de recuperación
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Todavía no tienes un correo de recuperación configurado. Sin él, no vas a poder recuperar tu cuenta si olvidas tu contraseña.
        </p>
        <div className="flex gap-3">
          <button
            onClick={recordarDespues}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Recordarme después
          </button>
          <button
            onClick={cargarAhora}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
          >
            Cargar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
