import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./ticketBuilder', () => ({
  construirTicket: vi.fn(async () => new Uint8Array([1, 2, 3]))
}));
vi.mock('./transports/webSerial', () => ({
  soportaWebSerial: vi.fn(),
  imprimirPorWebSerial: vi.fn(async () => {}),
}));
vi.mock('./transports/rawbt', () => ({
  imprimirPorRawBT: vi.fn(async () => {}),
}));

import { construirTicket } from './ticketBuilder';
import { soportaWebSerial, imprimirPorWebSerial } from './transports/webSerial';
import { imprimirPorRawBT } from './transports/rawbt';
import { imprimirTermica, esAndroid } from './index';

const construirTicketMock = vi.mocked(construirTicket);
const soportaWebSerialMock = vi.mocked(soportaWebSerial);
const imprimirPorWebSerialMock = vi.mocked(imprimirPorWebSerial);
const imprimirPorRawBTMock = vi.mocked(imprimirPorRawBT);

beforeEach(() => {
  construirTicketMock.mockClear();
  soportaWebSerialMock.mockReset();
  imprimirPorWebSerialMock.mockClear();
  imprimirPorRawBTMock.mockClear();
});

describe('imprimirTermica', () => {
  it('usa Web Serial cuando el navegador lo soporta', async () => {
    soportaWebSerialMock.mockReturnValue(true);

    await imprimirTermica({ id_venta: 1 }, { nombre_empresa: 'X' });

    expect(construirTicketMock).toHaveBeenCalledWith({ id_venta: 1 }, { nombre_empresa: 'X' });
    expect(imprimirPorWebSerialMock).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(imprimirPorRawBTMock).not.toHaveBeenCalled();
  });

  it('usa RawBT cuando el navegador no soporta Web Serial pero es Android', async () => {
    soportaWebSerialMock.mockReturnValue(false);
    const navAndroid = { userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/115.0' };

    await imprimirTermica({ id_venta: 2 }, { nombre_empresa: 'Y' }, { nav: navAndroid });

    expect(imprimirPorRawBTMock).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(imprimirPorWebSerialMock).not.toHaveBeenCalled();
  });

  it('usa RawBT en Android aunque navigator.serial exista sin backend real (bug real observado)', async () => {
    // Algunos Chrome de Android exponen `navigator.serial` pero el diálogo
    // de emparejamiento nunca encuentra el dispositivo ("No se encontraron
    // dispositivos compatibles"). Android debe ir siempre por RawBT.
    soportaWebSerialMock.mockReturnValue(true);
    const navAndroid = { userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/115.0' };

    await imprimirTermica({ id_venta: 4 }, { nombre_empresa: 'W' }, { nav: navAndroid });

    expect(imprimirPorRawBTMock).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(imprimirPorWebSerialMock).not.toHaveBeenCalled();
  });

  it('lanza un error claro en escritorio sin Web Serial (Firefox/Safari en Windows), sin llamar a RawBT', async () => {
    soportaWebSerialMock.mockReturnValue(false);
    const navFirefoxWindows = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
    };

    await expect(
      imprimirTermica({ id_venta: 3 }, { nombre_empresa: 'Z' }, { nav: navFirefoxWindows })
    ).rejects.toThrow(/Chrome o Edge en Windows.*Chrome en Android.*RawBT/s);

    expect(imprimirPorRawBTMock).not.toHaveBeenCalled();
    expect(imprimirPorWebSerialMock).not.toHaveBeenCalled();
  });

  it('esAndroid detecta el user agent de Android', () => {
    expect(esAndroid({ userAgent: 'Mozilla/5.0 (Linux; Android 13)' })).toBe(true);
    expect(esAndroid({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0' })).toBe(false);
  });
});
