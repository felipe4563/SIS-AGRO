import { describe, it, expect } from 'vitest';
import {
  init, align, bold, doubleSize, sanitizeText, text, line,
  feed, cut, raster, concatBytes, columns,
} from './escpos';

describe('escpos', () => {
  it('init() manda ESC @', () => {
    expect(Array.from(init())).toEqual([0x1B, 0x40]);
  });

  it('align acepta left/center/right y rechaza otros valores', () => {
    expect(Array.from(align('left'))).toEqual([0x1B, 0x61, 0]);
    expect(Array.from(align('center'))).toEqual([0x1B, 0x61, 1]);
    expect(Array.from(align('right'))).toEqual([0x1B, 0x61, 2]);
    expect(() => align('arriba')).toThrow();
  });

  it('bold on/off', () => {
    expect(Array.from(bold(true))).toEqual([0x1B, 0x45, 1]);
    expect(Array.from(bold(false))).toEqual([0x1B, 0x45, 0]);
  });

  it('doubleSize on/off', () => {
    expect(Array.from(doubleSize(true))).toEqual([0x1D, 0x21, 0x11]);
    expect(Array.from(doubleSize(false))).toEqual([0x1D, 0x21, 0x00]);
  });

  it('sanitizeText normaliza acentos, ñ y signos', () => {
    expect(sanitizeText('Compra a crédito, ¿está seguro? ¡Sí, señor!'))
      .toBe('Compra a credito, ?esta seguro? !Si, senor!');
  });

  it('text() produce bytes ASCII saneados', () => {
    expect(Array.from(text('ñu'))).toEqual([110, 117]); // 'n', 'u'
  });

  it('line() agrega salto de línea al final', () => {
    const bytes = Array.from(line('ok'));
    expect(bytes).toEqual([111, 107, 0x0A]);
  });

  it('feed(n) manda ESC d n', () => {
    expect(Array.from(feed(3))).toEqual([0x1B, 0x64, 3]);
  });

  it('cut() manda corte parcial GS V 66 0', () => {
    expect(Array.from(cut())).toEqual([0x1D, 0x56, 0x42, 0x00]);
  });

  it('raster arma el header GS v 0 con ancho/alto little-endian', () => {
    const data = new Uint8Array([0xFF, 0x00]);
    const bytes = Array.from(raster({ widthBytes: 1, height: 2, data }));
    expect(bytes).toEqual([0x1D, 0x76, 0x30, 0x00, 1, 0, 2, 0, 0xFF, 0x00]);
  });

  it('concatBytes une varios Uint8Array en uno', () => {
    const out = concatBytes(new Uint8Array([1, 2]), new Uint8Array([3]));
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });

  it('columns rellena con espacios hasta el ancho pedido', () => {
    expect(columns('A', 'B', 5)).toBe('A   B');
  });

  it('columns nunca deja menos de un espacio si el texto es más largo que el ancho', () => {
    expect(columns('12345', '67890', 5)).toBe('12345 67890');
  });
});
