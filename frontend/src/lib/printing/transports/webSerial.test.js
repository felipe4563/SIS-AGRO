// frontend/src/lib/printing/transports/webSerial.test.js
import { describe, it, expect, vi } from 'vitest';
import { soportaWebSerial, imprimirPorWebSerial } from './webSerial';

function crearPuertoFalso() {
  const escritos = [];
  const writer = {
    write: vi.fn(async (bytes) => { escritos.push(bytes); }),
    releaseLock: vi.fn(),
  };
  return {
    open: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    writable: { getWriter: () => writer },
    _escritos: escritos,
    _writer: writer,
  };
}

describe('soportaWebSerial', () => {
  it('true si navigator tiene la propiedad serial', () => {
    expect(soportaWebSerial({ serial: {} })).toBe(true);
  });

  it('false si no la tiene', () => {
    expect(soportaWebSerial({})).toBe(false);
  });
});

describe('imprimirPorWebSerial', () => {
  it('lanza un error claro si el navegador no soporta Web Serial', async () => {
    await expect(imprimirPorWebSerial(new Uint8Array([1]), {})).rejects.toThrow(/Web Serial/);
  });

  it('reutiliza un puerto ya autorizado sin pedir uno nuevo', async () => {
    const puerto = crearPuertoFalso();
    const nav = {
      serial: {
        getPorts: vi.fn(async () => [puerto]),
        requestPort: vi.fn(async () => { throw new Error('no debería llamarse'); }),
      },
    };

    const bytes = new Uint8Array([1, 2, 3]);
    await imprimirPorWebSerial(bytes, nav);

    expect(nav.serial.requestPort).not.toHaveBeenCalled();
    expect(puerto.open).toHaveBeenCalledWith({ baudRate: 115200 });
    expect(puerto._writer.write).toHaveBeenCalledWith(bytes);
    expect(puerto._writer.releaseLock).toHaveBeenCalled();
    expect(puerto.close).toHaveBeenCalled();
  });

  it('pide un puerto nuevo si no hay ninguno autorizado', async () => {
    const puerto = crearPuertoFalso();
    const nav = {
      serial: {
        getPorts: vi.fn(async () => []),
        requestPort: vi.fn(async () => puerto),
      },
    };

    await imprimirPorWebSerial(new Uint8Array([9]), nav);

    expect(nav.serial.requestPort).toHaveBeenCalled();
    expect(puerto.open).toHaveBeenCalled();
  });

  it('cierra el puerto incluso si la escritura falla', async () => {
    const puerto = crearPuertoFalso();
    puerto._writer.write = vi.fn(async () => { throw new Error('falla de escritura'); });
    const nav = { serial: { getPorts: vi.fn(async () => [puerto]) } };

    await expect(imprimirPorWebSerial(new Uint8Array([1]), nav)).rejects.toThrow('falla de escritura');
    expect(puerto.close).toHaveBeenCalled();
  });
});
