import { useState, useEffect, useCallback, useRef } from 'react';
import PageWrapper from '../../components/PageWrapper';
import configuracionService from '../../services/configuracion.service';
import { usePermission } from '../../hooks/usePermission';
import { useConfig } from '../../contexts/ConfigContext';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all sm:max-w-sm ${
      toast.tipo === 'ok'
        ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
    }`}>
      <span className="shrink-0">{toast.tipo === 'ok' ? '✅' : '⚠️'}</span>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}

const FORM_VACIO = {
  nombre_empresa: '',
  nit: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  correo: '',
  logo: null,
};

export default function Configuracion() {
  const { puede } = usePermission();
  const puedeVer    = puede('ver',    'configuracion');
  const puedeEditar = puede('editar', 'configuracion');
  const { recargarConfig } = useConfig();
  const fileInputRef = useRef(null);

  const [configOriginal, setConfigOriginal] = useState(null);
  const [form, setForm]       = useState(FORM_VACIO);
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast]         = useState(null);

  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const configToForm = (data) => ({
    nombre_empresa: data.nombre_empresa || '',
    nit:       data.nit       || '',
    direccion: data.direccion || '',
    ciudad:    data.ciudad    || '',
    telefono:  data.telefono  || '',
    correo:    data.correo    || '',
    logo:      data.logo      || null,
  });

  const cargarConfig = useCallback(async () => {
    setCargando(true);
    try {
      const res = await configuracionService.obtener();
      setConfigOriginal(res.data);
      setForm(configToForm(res.data));
    } catch {
      mostrarToast('error', 'Error al cargar la configuración');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { if (puedeVer) cargarConfig(); }, [cargarConfig, puedeVer]);

  const hayCambios = configOriginal !== null && (
    form.nombre_empresa !== (configOriginal.nombre_empresa || '') ||
    form.nit            !== (configOriginal.nit            || '') ||
    form.direccion      !== (configOriginal.direccion      || '') ||
    form.ciudad         !== (configOriginal.ciudad         || '') ||
    form.telefono       !== (configOriginal.telefono       || '') ||
    form.correo         !== (configOriginal.correo         || '') ||
    form.logo           !== (configOriginal.logo           || null)
  );

  const handleCampo = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      mostrarToast('error', 'El logo no puede superar 5 MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleGuardar = async () => {
    if (!form.nombre_empresa.trim()) {
      mostrarToast('error', 'El nombre de la empresa es obligatorio');
      return;
    }
    setGuardando(true);
    try {
      await configuracionService.actualizar(form);
      mostrarToast('ok', 'Configuración guardada correctamente');
      await cargarConfig();
      recargarConfig();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error || 'Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = (readonly) =>
    `w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors
     ${readonly
       ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
       : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'}`;

  if (!puedeVer) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-zinc-500 max-w-md">No tienes permiso para ver la configuración del sistema. Contacta al administrador.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Toast toast={toast} />

      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          ⚙️ Configuración del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Datos de la empresa que aparecen en los reportes PDF exportados.
        </p>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20">
          <span className="w-7 h-7 rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-4 sm:space-y-6">

          {/* Sección: Logo */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">
              Logo de la empresa
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              {/* Preview */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800 shrink-0">
                {form.logo
                  ? <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  : <span className="text-3xl sm:text-4xl text-zinc-300 dark:text-zinc-600">🖼️</span>
                }
              </div>
              {/* Controles */}
              <div className="flex flex-col items-center sm:items-start gap-2 w-full sm:w-auto">
                {puedeEditar && (
                  <>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors w-full sm:w-auto">
                      📁 Cambiar logo
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {form.logo && (
                      <button
                        onClick={() => { setForm(f => ({ ...f, logo: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors w-full sm:w-auto"
                      >
                        🗑 Quitar logo
                      </button>
                    )}
                  </>
                )}
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center sm:text-left">
                  Cualquier imagen (PNG, JPG, GIF, SVG…) · Máx 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Datos de la empresa */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4">
              Datos de la empresa
            </h2>
            <div className="space-y-3 sm:space-y-4">

              {/* Nombre */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_empresa"
                  value={form.nombre_empresa}
                  onChange={handleCampo}
                  readOnly={!puedeEditar}
                  placeholder="Ej: Cooperativa Agropecuaria del Norte"
                  className={inputClass(!puedeEditar)}
                />
              </div>

              {/* NIT */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">NIT</label>
                <input
                  type="text"
                  name="nit"
                  value={form.nit}
                  onChange={handleCampo}
                  readOnly={!puedeEditar}
                  placeholder="Ej: 123456789"
                  className={inputClass(!puedeEditar)}
                />
              </div>

              {/* Dirección + Ciudad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleCampo}
                    readOnly={!puedeEditar}
                    placeholder="Ej: Av. Principal 123"
                    className={inputClass(!puedeEditar)}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleCampo}
                    readOnly={!puedeEditar}
                    placeholder="Ej: Santa Cruz"
                    className={inputClass(!puedeEditar)}
                  />
                </div>
              </div>

              {/* Teléfono + Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleCampo}
                    readOnly={!puedeEditar}
                    placeholder="Ej: +591 3 3456789"
                    className={inputClass(!puedeEditar)}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleCampo}
                    readOnly={!puedeEditar}
                    placeholder="Ej: info@empresa.com"
                    className={inputClass(!puedeEditar)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          {puedeEditar && (
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pb-4 sm:pb-0">
              <button
                onClick={handleGuardar}
                disabled={guardando || !hayCambios}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold
                           bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm
                           disabled:bg-zinc-200 dark:disabled:bg-zinc-700
                           disabled:text-zinc-400 disabled:cursor-not-allowed
                           transition-colors"
              >
                {guardando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  '💾 Guardar cambios'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
