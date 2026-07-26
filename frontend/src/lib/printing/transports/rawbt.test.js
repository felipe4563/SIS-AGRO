// frontend/src/lib/printing/transports/rawbt.test.js
import { describe, it, expect, vi } from 'vitest';
import { bytesToBase64, imprimirPorRawBT } from './rawbt';

describe('bytesToBase64', () => {
  it('codifica bytes conocidos correctamente', () => {
    // "AB" en ASCII = [65, 66] -> base64 "QUI="
    expect(bytesToBase64(new Uint8Array([65, 66]))).toBe('QUI=');
  });
});

describe('imprimirPorRawBT', () => {
  it('navega a la URL rawbt:base64,... con los bytes codificados', async () => {
    const win = { location: { href: '' } };
    const doc = { addEventListener: vi.fn(), removeEventListener: vi.fn(), visibilityState: 'visible' };

    const promesa = imprimirPorRawBT(new Uint8Array([65, 66]), { win, doc, timeoutMs: 50 });

    expect(win.location.href).toBe('rawbt:base64,QUI=');

    // Simula que la app RawBT tomó el control (la pestaña se oculta) antes del timeout
    const listener = doc.addEventListener.mock.calls[0][1];
    doc.visibilityState = 'hidden';
    listener();

    await expect(promesa).resolves.toBeUndefined();
  });

  it('rechaza con un mensaje claro si nadie responde antes del timeout (RawBT no instalado)', async () => {
    const win = { location: { href: '' } };
    const doc = { addEventListener: vi.fn(), removeEventListener: vi.fn(), visibilityState: 'visible' };

    await expect(
      imprimirPorRawBT(new Uint8Array([1]), { win, doc, timeoutMs: 20 })
    ).rejects.toThrow(/RawBT/);
  });
});
