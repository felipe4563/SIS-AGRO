import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding, FaMapMarkerAlt, FaCashRegister, FaUserShield, FaLock,
  FaChevronRight, FaChevronLeft, FaCheck, FaSpinner, FaSignOutAlt, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const PASOS = [
  { id: 1, titulo: 'Empresa',     icono: FaBuilding },
  { id: 2, titulo: 'Sucursal',    icono: FaMapMarkerAlt },
  { id: 3, titulo: 'Caja',        icono: FaCashRegister },
  { id: 4, titulo: 'Roles',       icono: FaUserShield },
  { id: 5, titulo: 'Contraseña',  icono: FaLock },
];

// Módulos del plan que aplican a cada rol (debe coincidir con permisoSync.js)
const VENDEDOR_MODULOS   = ['ventas', 'clientes', 'caja', 'reportes_basicos'];
const ALMACENERO_MODULOS = ['inventario', 'compras', 'proveedores', 'traslados', 'libro_caja', 'reportes_basicos'];

const MODULO_LABEL = {
  ventas:             'Ventas',
  clientes:           'Clientes',
  caja:               'Caja',
  inventario:         'Almacén',
  compras:            'Compras',
  proveedores:        'Proveedores',
  traslados:          'Traslados',
  libro_caja:         'Libro de Caja',
  reportes_basicos:   'Reportes',
  reportes_avanzados: 'Reportes Avz.',
  roles:              'Roles',
};

const COLOR_MAP = {
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
  blue:    'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
  amber:   'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
};

function buildRolesPreview(modulos) {
  const vendedorMods   = VENDEDOR_MODULOS.filter(m => modulos.includes(m));
  const almaceneroMods = ALMACENERO_MODULOS.filter(m => modulos.includes(m));

  const vendedorBadge   = vendedorMods.map(m => MODULO_LABEL[m]).join(' · ') || 'Sin módulos asignados';
  const almaceneroBadge = almaceneroMods.map(m => MODULO_LABEL[m]).join(' · ') || 'Sin módulos asignados';

  const todosBadge = modulos
    .filter(m => MODULO_LABEL[m])
    .map(m => MODULO_LABEL[m])
    .join(' · ') || 'Acceso completo al plan';

  return [
    {
      nombre:     'ADMINISTRADOR',
      descripcion: 'Acceso completo a todos los módulos del plan. Puede gestionar usuarios, roles y configuración.',
      color:       'emerald',
      badge:       todosBadge,
    },
    {
      nombre:     'VENDEDOR',
      descripcion: vendedorMods.length
        ? 'Puede realizar ventas, gestionar clientes y operar caja según los módulos del plan.'
        : 'No tiene módulos de venta asignados en el plan actual.',
      color:       'blue',
      badge:       vendedorBadge,
    },
    {
      nombre:     'ALMACENERO',
      descripcion: almaceneroMods.length
        ? 'Gestiona el almacén, registra compras y controla el stock según los módulos del plan.'
        : 'No tiene módulos de almacén asignados en el plan actual.',
      color:       'amber',
      badge:       almaceneroBadge,
    },
  ];
}

function InputField({ label, value, onChange, placeholder, required = false, type = 'text', readOnly = false }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => !readOnly && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 text-sm border rounded-xl
                   text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                   transition-colors
                   ${readOnly
                     ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 cursor-default'
                     : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'}`}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, required = false }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 text-sm border rounded-xl
                     bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700
                     text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
                     focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                     transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {visible ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
        </button>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { usuario, logout, actualizarUsuario } = useAuth();

  const [paso, setPaso]           = useState(1);
  const [guardando, setGuardando]   = useState(false);
  const [cargandoEmpresa, setCargandoEmpresa] = useState(true);
  const [error, setError]         = useState(null);

  const [password, setPassword] = useState({ nueva: '', confirmar: '' });
  const setPasswordField = (k, v) => setPassword(p => ({ ...p, [k]: v }));

  const modulos = Array.isArray(usuario?.modulos) ? usuario.modulos : [];

  const [empresa, setEmpresa] = useState({
    nombre_empresa: '',
    nit:            '',
    ciudad:         '',
    direccion:      '',
    telefono:       '',
    correo:         '',
  });

  const [sucursal, setSucursal] = useState({
    nombre:    'Sucursal Central',
    ciudad:    '',
    direccion: '',
    telefono:  '',
  });

  const [caja, setCaja] = useState({ nombre: 'Caja Principal' });

  // Pre-rellenar empresa desde el servidor (nombre puesto por el superadmin)
  useEffect(() => {
    api.get('/setup/empresa-info')
      .then(({ data }) => {
        setEmpresa({
          nombre_empresa: data.nombre  || '',
          nit:            data.nit     || '',
          ciudad:         data.ciudad  || '',
          direccion:      data.direccion || '',
          telefono:       data.telefono || '',
          correo:         data.correo  || '',
        });
      })
      .catch(() => { /* si falla, el form queda vacío */ })
      .finally(() => setCargandoEmpresa(false));
  }, []);

  const setEmpresaField  = (k, v) => setEmpresa(p => ({ ...p, [k]: v }));
  const setSucursalField = (k, v) => setSucursal(p => ({ ...p, [k]: v }));

  const errorPassword = () => {
    if (!password.nueva && !password.confirmar) return null;
    if (password.nueva.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (password.nueva !== password.confirmar) return 'Las contraseñas no coinciden.';
    return null;
  };

  const puedeAvanzar = () => {
    if (paso === 1) return empresa.nombre_empresa.trim() !== '';
    if (paso === 2) return sucursal.nombre.trim() && sucursal.ciudad.trim() && sucursal.direccion.trim();
    if (paso === 3) return caja.nombre.trim() !== '';
    if (paso === 4) return true;
    if (paso === 5) return errorPassword() === null;
    return true;
  };

  const handleCompletar = async () => {
    const errPwd = errorPassword();
    if (errPwd) { setError(errPwd); return; }
    setGuardando(true);
    setError(null);
    try {
      const body = { empresa, sucursal, caja };
      if (password.nueva) body.nueva_contrasena = password.nueva;
      await api.post('/setup/completar', body);
      actualizarUsuario({ setup_completado: true });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        actualizarUsuario({ setup_completado: true });
        navigate('/dashboard', { replace: true });
        return;
      }
      setError(err.response?.data?.error || 'Error al completar la configuración. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const rolesPreview = buildRolesPreview(modulos);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SIS-AGRO" className="h-8 w-auto object-contain" />
          <span className="font-bold text-zinc-800 dark:text-white text-sm hidden sm:block">Configuración Inicial</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }); }}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <FaSignOutAlt />
          <span>Salir</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Bienvenida */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-white mb-1">
            ¡Bienvenido, {usuario?.nombre || 'Administrador'}!
          </h1>
          {empresa.nombre_empresa && (
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">
              {empresa.nombre_empresa}
            </p>
          )}
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
            Configuremos tu sistema en 4 pasos rápidos para que puedas empezar a trabajar.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 sm:gap-4 mb-8">
          {PASOS.map((p, i) => {
            const Icono    = p.icono;
            const activo   = paso === p.id;
            const completado = paso > p.id;
            return (
              <div key={p.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                    ${completado ? 'bg-emerald-500 border-emerald-500 text-white' :
                      activo     ? 'bg-white dark:bg-zinc-900 border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                                   'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-400'}`}
                  >
                    {completado ? <FaCheck className="text-xs" /> : <Icono className="text-sm" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${activo ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                    {p.titulo}
                  </span>
                </div>
                {i < PASOS.length - 1 && (
                  <div className={`w-8 sm:w-14 h-0.5 mx-1 sm:mx-2 mb-4 sm:mb-5 transition-colors
                    ${paso > p.id ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card del paso actual */}
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">

          {/* ── Paso 1: Empresa ─────────────────────────────────────────── */}
          {paso === 1 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <FaBuilding className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-800 dark:text-white">Datos de la empresa</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Confirma o completa la información de tu negocio</p>
                </div>
              </div>

              {cargandoEmpresa ? (
                <div className="flex items-center justify-center py-8 text-zinc-400 gap-2">
                  <FaSpinner className="animate-spin" />
                  <span className="text-sm">Cargando datos...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <InputField label="Nombre de la empresa" value={empresa.nombre_empresa}
                    onChange={v => setEmpresaField('nombre_empresa', v)}
                    placeholder="Ej. Agropecuaria del Sur S.R.L." required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="NIT / RUC" value={empresa.nit}
                      onChange={v => setEmpresaField('nit', v)} placeholder="1234567890" />
                    <InputField label="Ciudad" value={empresa.ciudad}
                      onChange={v => setEmpresaField('ciudad', v)} placeholder="Santa Cruz" />
                  </div>
                  <InputField label="Dirección" value={empresa.direccion}
                    onChange={v => setEmpresaField('direccion', v)} placeholder="Av. Principal #123" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Teléfono" value={empresa.telefono}
                      onChange={v => setEmpresaField('telefono', v)} placeholder="33412300" />
                    <InputField label="Correo" type="email" value={empresa.correo}
                      onChange={v => setEmpresaField('correo', v)} placeholder="info@empresa.bo" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Paso 2: Sucursal ────────────────────────────────────────── */}
          {paso === 2 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-800 dark:text-white">Primera sucursal</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Puedes agregar más sucursales después</p>
                </div>
              </div>
              <div className="space-y-4">
                <InputField label="Nombre de la sucursal" value={sucursal.nombre}
                  onChange={v => setSucursalField('nombre', v)} placeholder="Sucursal Central" required />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Ciudad" value={sucursal.ciudad}
                    onChange={v => setSucursalField('ciudad', v)} placeholder="Santa Cruz" required />
                  <InputField label="Teléfono" value={sucursal.telefono}
                    onChange={v => setSucursalField('telefono', v)} placeholder="33412300" />
                </div>
                <InputField label="Dirección" value={sucursal.direccion}
                  onChange={v => setSucursalField('direccion', v)} placeholder="Av. Principal #123" required />
              </div>
            </div>
          )}

          {/* ── Paso 3: Caja ─────────────────────────────────────────────── */}
          {paso === 3 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FaCashRegister className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-800 dark:text-white">Primera caja</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Se asignará a la sucursal que creaste</p>
                </div>
              </div>
              <div className="space-y-4">
                <InputField label="Nombre de la caja" value={caja.nombre}
                  onChange={v => setCaja({ nombre: v })} placeholder="Caja Principal" required />
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Esta caja estará disponible en{' '}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{sucursal.nombre || 'tu sucursal'}</span>.
                  Podrás crear más cajas desde el módulo Caja una vez configurado el sistema.
                </div>
              </div>
            </div>
          )}

          {/* ── Paso 4: Roles ─────────────────────────────────────────────── */}
          {paso === 4 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FaUserShield className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-800 dark:text-white">Roles predeterminados</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Se crearán según los módulos de tu plan
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                {rolesPreview.map(rol => (
                  <div key={rol.nombre} className={`rounded-xl border p-4 ${COLOR_MAP[rol.color]}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm">{rol.nombre}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 font-medium whitespace-nowrap shrink-0 max-w-[55%] truncate" title={rol.badge}>
                        {rol.badge}
                      </span>
                    </div>
                    <p className="text-xs opacity-80">{rol.descripcion}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 text-xs text-zinc-500 dark:text-zinc-400">
                Tu cuenta de <span className="font-semibold text-zinc-700 dark:text-zinc-200">{usuario?.nombre}</span> quedará
                asignada como <span className="font-semibold text-emerald-600 dark:text-emerald-400">Administrador</span> y
                se asociará a la sucursal que configuraste.
              </div>

              {error && paso === 4 && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Paso 5: Contraseña ─────────────────────────────────────────── */}
          {paso === 5 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <FaLock className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-800 dark:text-white">Cambiar contraseña</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Opcional — puedes omitir este paso</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 p-3 text-xs text-indigo-700 dark:text-indigo-300">
                  Recomendamos establecer una contraseña segura antes de comenzar. Si lo prefieres, puedes omitir este paso y cambiarla más adelante desde tu perfil.
                </div>
                <PasswordField
                  label="Nueva contraseña"
                  value={password.nueva}
                  onChange={v => setPasswordField('nueva', v)}
                  placeholder="Mínimo 8 caracteres"
                />
                <PasswordField
                  label="Confirmar contraseña"
                  value={password.confirmar}
                  onChange={v => setPasswordField('confirmar', v)}
                  placeholder="Repite la contraseña"
                />
                {password.nueva && errorPassword() && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errorPassword()}</p>
                )}
              </div>
              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navegación */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex items-center justify-between gap-3">
            <button
              onClick={() => { setError(null); setPaso(p => p - 1); }}
              disabled={paso === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                         text-sm font-medium text-zinc-600 dark:text-zinc-400
                         hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              <FaChevronLeft className="text-xs" />
              Anterior
            </button>

            {paso < 5 ? (
              <button
                onClick={() => { setError(null); setPaso(p => p + 1); }}
                disabled={!puedeAvanzar() || (paso === 1 && cargandoEmpresa)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                           text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed
                           shadow-sm transition-colors"
              >
                Siguiente
                <FaChevronRight className="text-xs" />
              </button>
            ) : (
              <button
                onClick={handleCompletar}
                disabled={guardando || errorPassword() !== null}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                           text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed
                           shadow-sm transition-colors"
              >
                {guardando ? (
                  <><FaSpinner className="animate-spin text-xs" /> Configurando...</>
                ) : (
                  <><FaCheck className="text-xs" /> Completar configuración</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">
          Paso {paso} de {PASOS.length}
          {paso === 5 && !password.nueva && (
            <span className="ml-2 text-indigo-400">· Puedes omitir el cambio de contraseña</span>
          )}
        </p>
      </div>
    </div>
  );
}
