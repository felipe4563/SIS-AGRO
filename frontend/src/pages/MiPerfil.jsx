import { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import perfilService from '../services/perfil.service';
import { useAuth } from '../contexts/AuthContext';
import { Toast, useToast } from '../components/Toast';

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60';

export default function MiPerfil() {
  const { usuario, actualizarUsuario } = useAuth();
  const { toast, mostrarToast } = useToast();
  const [datos, setDatos] = useState({ celular: '', correo_recuperacion: '' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    perfilService.obtener()
      .then(({ data }) => setDatos({ celular: data.celular || '', correo_recuperacion: data.correo_recuperacion || '' }))
      .catch(() => mostrarToast('error', 'No se pudo cargar tu perfil'))
      .finally(() => setCargando(false));
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const { data } = await perfilService.actualizar(datos);
      actualizarUsuario({ correo_recuperacion: data.usuario.correo_recuperacion, celular: data.usuario.celular });
      mostrarToast('ok', 'Perfil actualizado correctamente');
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'No se pudo guardar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <PageWrapper>
      <Toast toast={toast} />
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Mi perfil</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Tus datos de contacto y de recuperación de cuenta</p>

        {cargando ? (
          <p className="text-sm text-zinc-500">Cargando...</p>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Nombre</label>
              <input disabled value={`${usuario?.nombre || ''} ${usuario?.apellido || ''}`} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Correo institucional (login)</label>
              <input disabled value={usuario?.correo || ''} className={inputCls} />
            </div>

            <form onSubmit={guardar} className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Celular</label>
                <input
                  type="text" value={datos.celular}
                  onChange={e => setDatos(d => ({ ...d, celular: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Correo de recuperación (personal — ej. Gmail)
                </label>
                <input
                  type="email" value={datos.correo_recuperacion}
                  onChange={e => setDatos(d => ({ ...d, correo_recuperacion: e.target.value }))}
                  placeholder="tu-correo@gmail.com"
                  className={inputCls}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Aquí te llegará el código si alguna vez necesitas recuperar tu contraseña.
                </p>
              </div>
              <button
                type="submit" disabled={guardando}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
