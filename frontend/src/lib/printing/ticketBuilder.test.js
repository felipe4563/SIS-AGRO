import { describe, it, expect } from 'vitest';
import { buildTicketBytes } from './ticketBuilder';

function bytesToTexto(bytes) {
  // Decodifica solo los bytes imprimibles (>=0x20) para poder buscar substrings en los tests,
  // ignorando los comandos de control ESC/GS que no son ASCII imprimible.
  return Array.from(bytes)
    .map((b) => (b >= 0x20 && b <= 0x7E ? String.fromCharCode(b) : ''))
    .join('');
}

const ventaBase = {
  id_venta: 42,
  fecha_venta: '2026-07-20T15:30:00',
  usuario_nombre: 'Juan',
  usuario_apellido: 'Perez',
  tipo_venta: 'MENOR',
  nro_factura: null,
  cliente_nombre: null,
  cliente_apellido: null,
  ci_nit: null,
  detalles: [
    { id_detalle_venta: 1, cantidad: 2, tipo_cantidad: 'UNIDAD', producto_nombre: 'Urea 50kg', subtotal: 100, precio_unitario: 50, descuento_pct: 0, numero_lote: 'L001' },
  ],
  subtotal: 100,
  descuento_total: 0,
  total: 100,
  metodo_pago: 'EFECTIVO',
  monto_pagado: 100,
  cambio: 0,
  estado: 'COMPLETADA',
};

const configBase = {
  nombre_empresa: 'Agropecuaria Test',
  nit: '123456',
  direccion: 'Av. Siempre Viva 123',
  ciudad: 'Santa Cruz',
  telefono: '70000000',
  logo: null,
};

describe('buildTicketBytes', () => {
  it('incluye el número de venta, el nombre de la empresa y el total', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    const textoPlano = bytesToTexto(bytes);

    expect(textoPlano).toContain('Nro 000042');
    expect(textoPlano).toContain('Agropecuaria Test');
    expect(textoPlano).toContain('TOTAL Bs:');
    expect(textoPlano).toContain('100.00');
  });

  it('usa "Consumidor Final" cuando no hay cliente', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    expect(bytesToTexto(bytes)).toContain('Consumidor Final');
  });

  it('incluye el nombre del cliente cuando existe', () => {
    const venta = { ...ventaBase, cliente_nombre: 'Maria', cliente_apellido: 'Lopez' };
    const bytes = buildTicketBytes(venta, configBase, null);
    expect(bytesToTexto(bytes)).toContain('Maria Lopez');
  });

  it('agrega el sello ANULADA cuando la venta está anulada', () => {
    const venta = { ...ventaBase, estado: 'ANULADA' };
    const bytes = buildTicketBytes(venta, configBase, null);
    expect(bytesToTexto(bytes)).toContain('ANULADA');
  });

  it('no incluye el sello ANULADA en una venta completada', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    expect(bytesToTexto(bytes)).not.toContain('ANULADA');
  });

  it('normaliza acentos del nombre de la empresa (sin logo)', () => {
    const config = { ...configBase, nombre_empresa: 'Agropecuaria López & Ñañez' };
    const bytes = buildTicketBytes(ventaBase, config, null);
    expect(bytesToTexto(bytes)).toContain('Agropecuaria Lopez & Nanez');
  });

  it('termina con el corte de papel (GS V 66 0)', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    const cola = Array.from(bytes.slice(-4));
    expect(cola).toEqual([0x1D, 0x56, 0x42, 0x00]);
  });

  it('incluye el comando raster cuando se pasa un logoBitmap', () => {
    const logoBitmap = { width: 8, height: 1, widthBytes: 1, data: new Uint8Array([0xFF]) };
    const bytes = buildTicketBytes(ventaBase, configBase, logoBitmap);
    const bytesArray = Array.from(bytes);
    // Busca la secuencia de header GS v 0 dentro del stream de bytes
    const idx = bytesArray.findIndex((b, i) =>
      b === 0x1D && bytesArray[i + 1] === 0x76 && bytesArray[i + 2] === 0x30);
    expect(idx).toBeGreaterThanOrEqual(0);
  });

  it('muestra "tandas" y el nombre de la mezcla en una línea de mezcla, sin lote', () => {
    const venta = {
      ...ventaBase,
      detalles: [
        ventaBase.detalles[0],
        {
          id_detalle_venta: 2, id_mezcla: 7, mezcla_nombre: 'Fumigacion Maiz',
          cantidad: 2, subtotal: 60, precio_unitario: 30, descuento_pct: 0,
        },
      ],
    };
    const bytes = buildTicketBytes(venta, configBase, null);
    const texto = bytesToTexto(bytes);

    expect(texto).toContain('2 tandas - Fumigacion Maiz');
    expect(texto).not.toContain('Lote: S/N');
  });
});
