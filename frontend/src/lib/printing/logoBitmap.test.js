import { describe, it, expect } from 'vitest';
import { imageDataToMonochromeBitmap, loadLogoAsBitmap } from './logoBitmap';

function pixel([r, g, b, a]) { return [r, g, b, a]; }

describe('imageDataToMonochromeBitmap', () => {
  it('convierte una imagen de 8x1 con blanco y negro alternado en un byte 10101010', () => {
    const negro = pixel([0, 0, 0, 255]);
    const blanco = pixel([255, 255, 255, 255]);
    const pixeles = [negro, blanco, negro, blanco, negro, blanco, negro, blanco];
    const data = new Uint8ClampedArray(pixeles.flat());
    const bitmap = imageDataToMonochromeBitmap({ width: 8, height: 1, data });

    expect(bitmap.width).toBe(8);
    expect(bitmap.height).toBe(1);
    expect(bitmap.widthBytes).toBe(1);
    expect(bitmap.data[0]).toBe(0b10101010);
  });

  it('rellena con ceros (blanco) los bits sobrantes cuando el ancho no es múltiplo de 8', () => {
    const negro = pixel([0, 0, 0, 255]);
    const data = new Uint8ClampedArray([...negro, ...negro, ...negro]); // 3px negros
    const bitmap = imageDataToMonochromeBitmap({ width: 3, height: 1, data });

    expect(bitmap.widthBytes).toBe(1);
    expect(bitmap.data[0]).toBe(0b11100000);
  });

  it('trata los píxeles transparentes como blancos (sin tinta)', () => {
    const negroTransparente = pixel([0, 0, 0, 0]);
    const data = new Uint8ClampedArray(new Array(8).fill(negroTransparente).flat());
    const bitmap = imageDataToMonochromeBitmap({ width: 8, height: 1, data });

    expect(bitmap.data[0]).toBe(0);
  });
});

describe('loadLogoAsBitmap', () => {
  it('devuelve null inmediatamente si no hay logoUrl', async () => {
    const resultado = await loadLogoAsBitmap(null);
    expect(resultado).toBeNull();
  });
});
