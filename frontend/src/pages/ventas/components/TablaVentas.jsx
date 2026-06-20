import { usePermission } from '../../../hooks/usePermission';

const fmtFecha = (s) =>
  s ? new Date(s).toLocaleString('es-BO', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

function EstadoBadge({ estado }) {
  switch (estado) {
    case 'COMPLETADA':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                         bg-emerald-50 text-emerald-700 border border-emerald-200
                         dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          COMPLETADA
        </span>
      );
    case 'ANULADA':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                         bg-red-50 text-red-700 border border-red-200
                         dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          ANULADA
        </span>
      );
    case 'PENDIENTE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                         bg-amber-50 text-amber-700 border border-amber-200
                         dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          PENDIENTE
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold
                         bg-zinc-100 text-zinc-600 border border-zinc-200
                         dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
          {estado}
        </span>
      );
  }
}

export default function TablaVentas({ ventas, cargando, onVerDetalle, onAnular }) {
  const { puede } = usePermission();

  if (cargando) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <svg className="animate-spin h-7 w-7 text-emerald-500" xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm">Cargando ventas…</p>
      </div>
    );
  }

  if (!ventas || ventas.length === 0) {
    return (
      <div className="p-10 text-center text-zinc-500 dark:text-zinc-400
                      bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <svg className="w-10 h-10 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor"
             strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
        </svg>
        <p className="text-sm font-medium">No hay ventas registradas</p>
        <p className="text-xs mt-1 text-zinc-400">Usa "Punto de Venta" para registrar una venta.</p>
      </div>
    );
  }

  // ── Vista cards (móvil < md) ───────────────────────────────────────────────
  const CardView = () => (
    <div className="space-y-2 md:hidden">
      {ventas.map((v) => (
        <div
          key={v.id_venta}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800
                     shadow-sm overflow-hidden"
        >
          {/* Cabecera card */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-zinc-900 dark:text-white">
                #{v.id_venta.toString().padStart(5, '0')}
              </span>
              <EstadoBadge estado={v.estado} />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
              v.tipo_venta === 'MAYOR'
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
            }`}>
              {v.tipo_venta === 'MAYOR' ? 'Mayor' : 'Menor'}
            </span>
          </div>

          {/* Cuerpo card */}
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {v.cliente_nombre
                    ? `${v.cliente_nombre} ${v.cliente_apellido || ''}`
                    : 'Cliente Casual'}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {fmtFecha(v.fecha_venta)} · {v.usuario_nombre}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  Bs {parseFloat(v.total).toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-400 uppercase">{{QR_ESTATICO:'QR Estático',QR:'QR CodePay'}[v.metodo_pago] ?? v.metodo_pago}</p>
              </div>
            </div>
          </div>

          {/* Acciones card */}
          <div className="flex border-t border-zinc-100 dark:border-zinc-800 divide-x divide-zinc-100 dark:divide-zinc-800">
            <button
              onClick={() => onVerDetalle(v)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                         text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              Ver recibo
            </button>
            {v.estado === 'COMPLETADA' && puede('anular', 'ventas') && (
              <button
                onClick={() => onAnular(v)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                           text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Anular
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Vista tabla (desktop ≥ md) ─────────────────────────────────────────────
  const TableView = () => (
    <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200
                    dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800
                           text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <th className="px-4 py-3 font-semibold">Comprobante</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold text-center">Tipo</th>
              <th className="px-4 py-3 font-semibold text-right">Total (Bs)</th>
              <th className="px-4 py-3 font-semibold text-center">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {ventas.map((v) => (
              <tr key={v.id_venta}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    #{v.id_venta.toString().padStart(5, '0')}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {fmtFecha(v.fecha_venta)}
                  </p>
                  <p className="text-[11px] text-zinc-400">{v.usuario_nombre}</p>
                </td>

                <td className="px-4 py-3">
                  {v.cliente_nombre ? (
                    <>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {v.cliente_nombre} {v.cliente_apellido || ''}
                      </p>
                      <p className="text-[11px] text-zinc-400">CI/NIT: {v.ci_nit || 'S/N'}</p>
                    </>
                  ) : (
                    <span className="text-sm italic text-zinc-400">Cliente Casual</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    v.tipo_venta === 'MAYOR'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                  }`}>
                    {v.tipo_venta === 'MAYOR' ? 'Mayor' : 'Menor'}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {parseFloat(v.total).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-zinc-400 uppercase">{{QR_ESTATICO:'QR Estático',QR:'QR CodePay'}[v.metodo_pago] ?? v.metodo_pago}</p>
                </td>

                <td className="px-4 py-3 text-center">
                  <EstadoBadge estado={v.estado} />
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onVerDetalle(v)}
                      title="Ver recibo"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50
                                 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                      </svg>
                    </button>
                    {v.estado === 'COMPLETADA' && puede('anular', 'ventas') && (
                      <button
                        onClick={() => onAnular(v)}
                        title="Anular venta"
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50
                                   dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <CardView />
      <TableView />
    </>
  );
}
