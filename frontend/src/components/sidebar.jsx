import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }           from '../contexts/AuthContext';
import { useAbilityUpdater } from '../contexts/AbilityContext';
import { usePermission }     from '../hooks/usePermission';
import { useTheme }          from '../contexts/ThemeContext';
import { useConfig }         from '../contexts/ConfigContext';

// Heroicons outline 24 — paths embebidos (sin dependencia)
const ICONS = {
  dashboard:
    'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
  productos:
    'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  catalogos:
    'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z',
  clientes:
    'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  proveedores:
    'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z',
  ventas:
    'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z',
  caja:
    'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z',
  compras:
    'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  almacen:
    'M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z',
  libroCaja:
    'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  reportes:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  configuracion:
    'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  sucursales:
    'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  usuarios:
    'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  roles:
    'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
  creditos:
    'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
  mezclas:
    'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575 1.575M19.8 15l1.35 1.35m-1.35-1.35L15 19.8m4.8-4.8-1.575 1.575M5 14.5l-1.35 1.35M5 14.5l1.575 1.575',
  importar:
    'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5',
  logout:
    'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75',
  sun:
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  moon:
    'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
};

function SvgIcon({ name, className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

// modulo: clave del plan requerida para ver este ítem (null = sin restricción de plan)
const MENU_ITEMS = [
  { label: 'Dashboard',          path: '/dashboard',     icon: 'dashboard',     action: null,    subject: null,             modulo: null },
  { label: 'Ventas (POS)',       path: '/ventas',        icon: 'ventas',        action: 'ver',   subject: 'ventas',         modulo: 'ventas' },
  { label: 'Caja',               path: '/caja',          icon: 'caja',          action: 'ver',   subject: 'caja',           modulo: 'caja' },
  { label: 'Clientes',           path: '/clientes',      icon: 'clientes',      action: 'ver',   subject: 'clientes',       modulo: 'clientes' },
  { label: 'Productos',          path: '/productos',     icon: 'productos',     action: 'ver',   subject: 'productos',      modulo: 'inventario' },
  { label: 'Catálogos',          path: '/catalogos',     icon: 'catalogos',     modulo: 'inventario',
    anyPermission: [
      { action: 'ver', subject: 'clasificaciones' },
      { action: 'ver', subject: 'marcas'          },
      { action: 'ver', subject: 'unidades'        },
    ]},
  { label: 'Almacén',            path: '/almacen',         icon: 'almacen',   action: 'ver',      subject: 'almacen',  modulo: 'inventario' },
  { label: 'Importar Inventario',path: '/almacen/importar', icon: 'importar', action: 'importar', subject: 'almacen',  modulo: 'inventario' },
  { label: 'Compras / Ingresos', path: '/compras',       icon: 'compras',       action: 'ver',   subject: 'compras',        modulo: 'compras' },
  { label: 'Proveedores',        path: '/proveedores',   icon: 'proveedores',   action: 'ver',   subject: 'proveedores',    modulo: 'proveedores' },
  { label: 'Libro de Caja',      path: '/libro-caja',    icon: 'libroCaja',     action: 'ver',   subject: 'movimientos',    modulo: 'libro_caja' },
  { label: 'Créditos',           path: '/creditos',      icon: 'creditos',      action: 'ver',   subject: 'creditos',       modulo: null },
  { label: 'Mezclas',            path: '/mezclas',       icon: 'mezclas',       action: 'ver',   subject: 'mezclas',        modulo: 'inventario' },
  {
    label: 'Reportes', path: '/reportes', icon: 'reportes', action: null, subject: null,
    modulos: ['reportes_basicos', 'reportes_avanzados'],
    anyPermission: [
      { action: 'ventas_diarias',         subject: 'reportes' },
      { action: 'ventas_rango',           subject: 'reportes' },
      { action: 'ventas_vendedor',        subject: 'reportes' },
      { action: 'ventas_producto',        subject: 'reportes' },
      { action: 'ventas_cliente',         subject: 'reportes' },
      { action: 'compras',                subject: 'reportes' },
      { action: 'compras_proveedor',      subject: 'reportes' },
      { action: 'inventario',             subject: 'reportes' },
      { action: 'inventario_valorizado',  subject: 'reportes' },
      { action: 'ganancias',              subject: 'reportes' },
      { action: 'ganancias_producto',     subject: 'reportes' },
      { action: 'top_productos',          subject: 'reportes' },
      { action: 'vencimientos',           subject: 'reportes' },
      { action: 'stock_bajo',             subject: 'reportes' },
      { action: 'kardex',                 subject: 'reportes' },
      { action: 'traslados',              subject: 'reportes' },
      { action: 'comparativo_sucursales', subject: 'reportes' },
      { action: 'caja',                   subject: 'reportes' },
    ],
  },
  { label: 'Configuración',      path: '/configuracion', icon: 'configuracion', action: 'ver',   subject: 'configuracion',  modulo: null },
  { label: 'Sucursales',         path: '/sucursales',    icon: 'sucursales',    action: 'ver',   subject: 'sucursales',     modulo: null },
  { label: 'Usuarios',           path: '/usuarios',      icon: 'usuarios',      action: 'ver',   subject: 'usuarios',       modulo: null },
  { label: 'Roles y Permisos',   path: '/roles',         icon: 'roles',         action: 'ver',   subject: 'roles',          modulo: 'roles' },
];

// ── Toggle tema ───────────────────────────────────────────────────────────
function ToggleTema({ small = false }) {
  const { tema, toggleTema } = useTheme();
  return (
    <button
      onClick={toggleTema}
      title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`${small ? 'p-1' : 'p-1.5'} rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
                 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors`}
    >
      <SvgIcon name={tema === 'dark' ? 'sun' : 'moon'} className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
    </button>
  );
}

// ── Ítem de navegación — modo completo ────────────────────────────────────
function MenuItem({ path, label, icon, onClose }) {
  return (
    <NavLink
      to={path}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
         transition-all duration-150 ${
          isActive
            ? 'bg-yellow-400 text-zinc-900 shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`shrink-0 transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}>
            <SvgIcon name={icon} className="w-[18px] h-[18px]" />
          </span>
          <span className="truncate leading-none">{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ── Contenido del sidebar ─────────────────────────────────────────────────
function SidebarContent({ onClose }) {
  const { usuario, logout } = useAuth();
  const { limpiar }         = useAbilityUpdater();
  const { puede }           = usePermission();
  const { configuracion }   = useConfig();
  const navigate            = useNavigate();

  const handleLogout = () => {
    logout();
    limpiar();
    onClose?.();
    navigate('/login');
  };

  const planModulos = usuario?.modulos ?? [];

  const tieneModulo = (item) => {
    if (item.modulos) return item.modulos.some(m => planModulos.includes(m));
    if (item.modulo)  return planModulos.includes(item.modulo);
    return true;
  };

  const itemsVisibles = MENU_ITEMS.filter((item) => {
    if (!tieneModulo(item)) return false;
    if (item.anyPermission) return item.anyPermission.some(p => puede(p.action, p.subject));
    if (!item.action || !item.subject) return true;
    return puede(item.action, item.subject);
  });

  const iniciales = [usuario?.nombre?.[0], usuario?.apellido?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900
                    border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-300">

      {/* Logo */}
      <div className="relative flex flex-col items-center px-4 pt-5 pb-3
                      border-b border-zinc-100 dark:border-zinc-800">
        {/* Toggle tema — esquina derecha */}
        <div className="absolute right-3 top-4">
          <ToggleTema />
        </div>

        {configuracion.logo ? (
          <img
            src={configuracion.logo}
            alt={configuracion.nombre_empresa}
            className="h-10 w-auto object-contain"
          />
        ) : (
          <span className="font-bold text-base text-zinc-800 dark:text-white text-center leading-tight">
            {configuracion.nombre_empresa || 'SIS-AGRO'}
          </span>
        )}

        {/* Badge del plan */}
        {configuracion.plan_nombre && (
          <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                           text-[10px] font-semibold uppercase tracking-wide
                           bg-emerald-100 dark:bg-emerald-900/40
                           text-emerald-700 dark:text-emerald-300
                           border border-emerald-200 dark:border-emerald-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            {configuracion.plan_nombre}
          </span>
        )}
      </div>

      {/* Usuario */}
      <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl
                      bg-zinc-50 dark:bg-zinc-800/60
                      border border-zinc-100 dark:border-zinc-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-zinc-900 shrink-0
                          flex items-center justify-center text-xs font-bold">
            {iniciales}
          </div>
          <div className="min-w-0">
            <p className="text-zinc-900 dark:text-white text-xs font-semibold truncate leading-tight">
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              <span className="text-xs text-green-600 dark:text-green-400 truncate">
                {usuario?.rol_nombre ?? `Rol ${usuario?.rol}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5
                      scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
        <p className="text-[10px] font-semibold uppercase tracking-widest
                      text-zinc-400 dark:text-zinc-600 px-3 mb-1.5">
          Menú
        </p>
        {itemsVisibles.map((item) => (
          <MenuItem key={item.path} {...item} onClose={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                     text-zinc-500 dark:text-zinc-400 transition-all duration-150
                     hover:bg-red-50 dark:hover:bg-red-500/10
                     hover:text-red-600 dark:hover:text-red-400"
        >
          <SvgIcon name="logout" className="w-[18px] h-[18px] shrink-0" />
          <span>Cerrar sesión</span>
        </button>
        <p className="text-[10px] text-zinc-300 dark:text-zinc-700 text-center mt-2">
          v1.0.0
        </p>
      </div>
    </div>
  );
}

// ── Sidebar principal ─────────────────────────────────────────────────────
export default function Sidebar() {
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const location = useLocation();

  useEffect(() => { setDrawerAbierto(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerAbierto]);

  return (
    <>
      {/* Botón hamburguesa — mobile y desktop */}
      <button
        onClick={() => setDrawerAbierto(true)}
        aria-label="Abrir menú"
        className="fixed top-3 left-3 z-40 w-9 h-9
                   flex items-center justify-center rounded-xl
                   bg-white dark:bg-zinc-900
                   border border-zinc-200 dark:border-zinc-700
                   text-zinc-600 dark:text-white
                   shadow-sm hover:border-yellow-400 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Overlay — mobile y desktop */}
      <div
        onClick={() => setDrawerAbierto(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
                    transition-opacity duration-300
                    ${drawerAbierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer — sidebar completo con iconos + etiquetas */}
      <div
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50
                    shadow-2xl shadow-black/30
                    transform transition-transform duration-300 ease-in-out
                    ${drawerAbierto ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent onClose={() => setDrawerAbierto(false)} />
      </div>
    </>
  );
}
