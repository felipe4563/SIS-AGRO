import * as esc from './escpos';
import { loadLogoAsBitmap } from './logoBitmap';

const ANCHO_COLUMNAS = 42;

const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  QR: 'QR (CodePay)',
  QR_ESTATICO: 'QR (Estatico)',
  CREDITO: 'Credito',
  OTRO: 'Otro',
};

const fmt = (n) => Number(n ?? 0).toFixed(2);

const fmtFecha = (s) =>
  s
    ? new Date(s).toLocaleString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '-';

export function buildTicketBytes(venta, configuracion, logoBitmap = null) {
  const partes = [esc.init(), esc.align('center')];

  if (logoBitmap) {
    partes.push(esc.raster(logoBitmap));
    partes.push(esc.line());
  } else {
    partes.push(esc.doubleSize(true), esc.bold(true));
    partes.push(esc.line(configuracion.nombre_empresa || ''));
    partes.push(esc.bold(false), esc.doubleSize(false));
  }

  if (configuracion.nit) partes.push(esc.line(`NIT: ${configuracion.nit}`));
  if (venta.sucursal_nombre) partes.push(esc.line(venta.sucursal_nombre));

  const direccion = venta.sucursal_direccion || configuracion.direccion;
  const ciudad = venta.sucursal_ciudad || configuracion.ciudad;
  if (direccion) partes.push(esc.line(`${direccion}${ciudad ? ', ' + ciudad : ''}`));

  const telefono = venta.sucursal_telefono || configuracion.telefono;
  if (telefono) partes.push(esc.line(`Tel: ${telefono}`));

  partes.push(esc.align('left'));
  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));

  partes.push(esc.bold(true));
  partes.push(esc.line(esc.columns('COMPROBANTE DE VENTA', `Nro ${String(venta.id_venta).padStart(6, '0')}`, ANCHO_COLUMNAS)));
  partes.push(esc.bold(false));
  partes.push(esc.line(esc.columns('Fecha:', fmtFecha(venta.fecha_venta), ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Cajero:', `${venta.usuario_nombre || ''} ${venta.usuario_apellido || ''}`.trim(), ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Tipo:', venta.tipo_venta === 'MAYOR' ? 'Por Mayor' : 'Por Menor', ANCHO_COLUMNAS)));
  if (venta.nro_factura) partes.push(esc.line(esc.columns('N. Factura:', venta.nro_factura, ANCHO_COLUMNAS)));

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.bold(true));
  partes.push(esc.line('CLIENTE'));
  partes.push(esc.bold(false));
  const clienteNombre = venta.cliente_nombre
    ? `${venta.cliente_nombre} ${venta.cliente_apellido || ''}`.trim()
    : 'Consumidor Final';
  partes.push(esc.line(clienteNombre));
  if (venta.ci_nit) partes.push(esc.line(`CI/NIT: ${venta.ci_nit}`));

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.bold(true));
  partes.push(esc.line('DETALLE'));
  partes.push(esc.bold(false));
  for (const d of venta.detalles || []) {
    const cantidadTexto = `${d.cantidad} ${d.tipo_cantidad === 'CAJA' ? 'cj' : 'un'} - ${d.producto_nombre}`;
    partes.push(esc.line(esc.columns(cantidadTexto, `Bs ${fmt(d.subtotal)}`, ANCHO_COLUMNAS)));
    let detalle = `  P.U.: Bs ${fmt(d.precio_unitario)}`;
    if (parseFloat(d.descuento_pct) > 0) detalle += ` (-${d.descuento_pct}%)`;
    detalle += ` - Lote: ${d.numero_lote || 'S/N'}`;
    partes.push(esc.line(detalle));
  }

  partes.push(esc.line('='.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Subtotal Bs:', fmt(venta.subtotal), ANCHO_COLUMNAS)));
  if (parseFloat(venta.descuento_total) > 0) {
    partes.push(esc.line(esc.columns('Descuento Bs:', `- ${fmt(venta.descuento_total)}`, ANCHO_COLUMNAS)));
  }
  partes.push(esc.bold(true), esc.doubleSize(true));
  partes.push(esc.line(esc.columns('TOTAL Bs:', fmt(venta.total), Math.floor(ANCHO_COLUMNAS / 2))));
  partes.push(esc.doubleSize(false), esc.bold(false));

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Metodo:', METODOS_PAGO[venta.metodo_pago] ?? venta.metodo_pago ?? '', ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Pagado Bs:', fmt(venta.monto_pagado), ANCHO_COLUMNAS)));
  if (venta.metodo_pago !== 'QR' && venta.metodo_pago !== 'QR_ESTATICO') {
    partes.push(esc.line(esc.columns('Cambio Bs:', fmt(venta.cambio), ANCHO_COLUMNAS)));
  }
  if (venta.metodo_pago === 'QR' && venta.codepay_voucher) {
    partes.push(esc.line(esc.columns('Voucher:', venta.codepay_voucher, ANCHO_COLUMNAS)));
  }
  if (venta.metodo_pago === 'QR' && venta.codepay_tx_id) {
    partes.push(esc.line(`Ref: ${venta.codepay_tx_id}`));
  }

  if (venta.estado === 'ANULADA') {
    partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
    partes.push(esc.align('center'), esc.bold(true), esc.doubleSize(true));
    partes.push(esc.line('*** ANULADA ***'));
    partes.push(esc.doubleSize(false), esc.bold(false), esc.align('left'));
  }

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.align('center'));
  partes.push(esc.line('Gracias por su compra!'));
  partes.push(esc.line(configuracion.nombre_empresa || ''));

  partes.push(esc.feed(3));
  partes.push(esc.cut());

  return esc.concatBytes(...partes);
}

export async function construirTicket(venta, configuracion) {
  const logoBitmap = await loadLogoAsBitmap(configuracion.logo);
  return buildTicketBytes(venta, configuracion, logoBitmap);
}
