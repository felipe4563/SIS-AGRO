import { useConfig } from '../../../contexts/ConfigContext';

const fmt = (n) => Number(n ?? 0).toFixed(2);
const fmtFecha = (s) =>
  s ? new Date(s).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtFechaCorta = (s) =>
  s ? new Date(s).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function ComprobanteCredito({ tipo, cuenta, abono, saldoRestante, nuevoEstado, pagos, onClose }) {
  const { configuracion } = useConfig();

  const row = { display: 'flex', justifyContent: 'space-between', marginBottom: '2px' };
  const sep = { borderTop: '1px dashed #000', margin: '4px 0' };

  const esAbono     = tipo === 'abono';
  const esCobrar    = !!cuenta.id_venta;
  const nroRef      = esCobrar
    ? `Venta #${cuenta.id_venta.toString().padStart(6, '0')}`
    : `Compra #${cuenta.id_compra.toString().padStart(6, '0')}`;
  const nombreEntidad = esCobrar
    ? `${cuenta.cliente_nombre || ''} ${cuenta.cliente_apellido || cuenta.cliente_empresa || ''}`.trim()
    : (cuenta.proveedor_nombre || '—');
  const telefonoEntidad = esCobrar ? cuenta.cliente_telefono : cuenta.proveedor_telefono;

  const estadoFinal = esAbono ? nuevoEstado : cuenta.estado_credito;
  const saldoFinal  = esAbono ? saldoRestante : Math.max(0, parseFloat(cuenta.saldo_pendiente));

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

          {/* Barra de acciones */}
          <div className="no-print flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-bold text-zinc-800 dark:text-white">
              {esAbono ? 'Comprobante de Abono' : 'Estado de Cuenta'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Vista previa del recibo */}
          <div className="overflow-y-auto max-h-[72vh] flex justify-center p-4 bg-zinc-100 dark:bg-zinc-950">
            <div
              id="ticket-credito"
              style={{
                width: '72mm',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '11px',
                lineHeight: '1.4',
                background: 'white',
                color: '#000',
                padding: '4mm',
              }}
            >
              {/* Cabecera empresa */}
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                {configuracion.logo && (
                  <img
                    src={configuracion.logo}
                    alt={configuracion.nombre_empresa}
                    style={{ maxHeight: '100px', maxWidth: '100%', margin: '0 auto 4px', display: 'block', objectFit: 'contain' }}
                  />
                )}
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{configuracion.nombre_empresa}</div>
                {configuracion.nit       && <div style={{ fontSize: '10px' }}>NIT: {configuracion.nit}</div>}
                {configuracion.direccion && <div style={{ fontSize: '10px' }}>{configuracion.direccion}{configuracion.ciudad ? `, ${configuracion.ciudad}` : ''}</div>}
                {configuracion.telefono  && <div style={{ fontSize: '10px' }}>Tel: {configuracion.telefono}</div>}
              </div>

              <div style={sep} />

              {/* Título */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                {esAbono ? 'COMPROBANTE DE ABONO' : 'ESTADO DE CUENTA'}
              </div>

              <div style={sep} />

              {/* Datos generales */}
              <div style={{ marginBottom: '4px' }}>
                <div style={row}><span>Referencia:</span><span>{nroRef}</span></div>
                <div style={row}><span>Fecha:</span><span>{fmtFecha(esAbono ? abono.fecha_pago : new Date())}</span></div>
                {cuenta.sucursal_nombre && <div style={row}><span>Sucursal:</span><span>{cuenta.sucursal_nombre}</span></div>}
                {cuenta.nro_factura && <div style={row}><span>N° Factura:</span><span>{cuenta.nro_factura}</span></div>}
              </div>

              <div style={sep} />

              {/* Cliente o Proveedor */}
              <div style={{ marginBottom: '4px' }}>
                <div style={{ fontWeight: 'bold' }}>{esCobrar ? 'CLIENTE' : 'PROVEEDOR'}</div>
                <div>{nombreEntidad}</div>
                {telefonoEntidad && <div style={{ fontSize: '10px' }}>Tel: {telefonoEntidad}</div>}
              </div>

              <div style={sep} />

              {/* Resumen del crédito */}
              <div style={{ marginBottom: '4px' }}>
                <div style={row}><span>Total crédito:</span><span>Bs {fmt(cuenta.total)}</span></div>
                <div style={row}><span>Cuota inicial:</span><span>Bs {fmt(cuenta.cuota_inicial)}</span></div>
                <div style={row}><span>Total abonado:</span><span>Bs {fmt(cuenta.total_abonado)}</span></div>
              </div>

              {/* Detalle del abono (solo tipo=abono) */}
              {esAbono && (
                <>
                  <div style={{ borderTop: '1px solid #000', margin: '4px 0' }} />
                  <div style={{ ...row, fontWeight: 'bold' }}>
                    <span>ESTE ABONO:</span>
                    <span>Bs {fmt(abono.monto)}</span>
                  </div>
                  <div style={row}><span>Método:</span><span>{abono.metodo_pago}</span></div>
                  {abono.observaciones && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>Obs: {abono.observaciones}</div>}
                </>
              )}

              <div style={{ borderTop: '1.5px solid #000', margin: '4px 0' }} />

              {/* Saldo y estado final */}
              <div style={{ ...row, fontWeight: 'bold', fontSize: '13px' }}>
                <span>SALDO PENDIENTE:</span>
                <span>Bs {fmt(saldoFinal)}</span>
              </div>
              <div style={{ ...row, marginTop: '2px' }}>
                <span>Estado:</span>
                <span style={{ fontWeight: 'bold' }}>{estadoFinal}</span>
              </div>
              {cuenta.fecha_vencimiento_credito && (
                <div style={row}>
                  <span>Vencimiento:</span>
                  <span>{fmtFechaCorta(cuenta.fecha_vencimiento_credito)}</span>
                </div>
              )}

              {/* Historial de abonos (solo tipo=estado) */}
              {!esAbono && pagos && pagos.length > 0 && (
                <>
                  <div style={sep} />
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>HISTORIAL DE ABONOS</div>
                  {pagos.map((p, i) => (
                    <div key={i} style={{ marginBottom: '2px' }}>
                      <div style={{ ...row, fontSize: '10px' }}>
                        <span>{fmtFechaCorta(p.fecha_pago)} — {p.metodo_pago}</span>
                        <span style={{ fontWeight: 'bold' }}>Bs {fmt(p.monto)}</span>
                      </div>
                      {p.observaciones && <div style={{ fontSize: '9px', paddingLeft: '4px', fontStyle: 'italic' }}>{p.observaciones}</div>}
                    </div>
                  ))}
                </>
              )}

              <div style={sep} />

              <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '4px' }}>
                <div>Gracias por su confianza</div>
                <div style={{ marginTop: '2px' }}>{configuracion.nombre_empresa}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden !important; }
          #ticket-credito, #ticket-credito * { visibility: visible !important; }
          #ticket-credito {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 72mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            font-size: 11px !important;
            background: white !important;
            color: #000 !important;
          }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
    </>
  );
}
