import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme }     from '../contexts/ThemeContext';

const NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/empresas',
    label: 'Empresas',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
      </svg>
    ),
  },
  {
    to: '/planes',
    label: 'Planes',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    to: '/suscripciones',
    label: 'Suscripciones',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
      </svg>
    ),
  },
  {
    to: '/pagos',
    label: 'Pagos',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ porVencer = 0 }) {
  const { admin, logout } = useAdminAuth();
  const { dark, toggle }  = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = admin?.nombre
    ? admin.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <aside className="
      flex-shrink-0 flex flex-col h-screen
      bg-white dark:bg-zinc-950
      border-r border-zinc-100 dark:border-zinc-800/60
      w-14 lg:w-60
      transition-all duration-200
    ">

      {/* Logo */}
      <div className="flex items-center h-14 border-b border-zinc-100 dark:border-zinc-800/60
                      px-3.5 lg:px-5 justify-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.708.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.95 5.05l.707-.707" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <span className="hidden lg:block text-sm font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight whitespace-nowrap">
            SIS-AGRO
            <span className="ml-1 text-[10px] font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Admin</span>
          </span>
        </div>

        <button
          onClick={toggle}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg
                     text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
                     hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {dark
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 lg:px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="hidden lg:block px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Menú
        </p>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-100
               justify-center lg:justify-start
               px-0 py-2.5 lg:px-3 lg:py-2
               ${isActive
                 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                 : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-100'
               }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <span className={isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}>
                  {icon}
                </span>
                <span className="hidden lg:block flex-1">{label}</span>
                {to === '/suscripciones' && porVencer > 0 && (
                  <span className="
                    bg-red-500 text-white text-[10px] font-bold rounded-full
                    min-w-[18px] h-[18px] flex items-center justify-center px-1
                    absolute top-1 right-1 lg:static lg:top-auto lg:right-auto lg:ml-auto
                  ">
                    {porVencer}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-1.5 lg:px-3 py-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1">

        {/* Theme toggle — solo en móvil (en desktop ya está en el header) */}
        <button
          onClick={toggle}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          className="lg:hidden w-full flex items-center justify-center py-2.5 rounded-lg
                     text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
                     hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {dark
            ? <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
            : <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
          }
        </button>

        {/* Avatar / info → perfil */}
        <NavLink
          to="/perfil"
          title={`${admin?.nombre}\n${admin?.correo}\nIr a mi perfil`}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-0 py-1.5 lg:px-2 rounded-lg justify-center lg:justify-start transition-colors
             ${isActive
               ? 'bg-indigo-50 dark:bg-indigo-500/10'
               : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
             }`
          }
        >
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate leading-tight">{admin?.nombre}</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">{admin?.correo}</p>
          </div>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-full flex items-center gap-2.5 rounded-lg text-xs font-medium
                     justify-center lg:justify-start
                     px-0 py-2.5 lg:px-3 lg:py-2
                     text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400
                     hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          <span className="hidden lg:block">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
