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
import { imprimirTermica } from './index';

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

  it('usa RawBT cuando el navegador no soporta Web Serial', async () => {
    soportaWebSerialMock.mockReturnValue(false);

    await imprimirTermica({ id_venta: 2 }, { nombre_empresa: 'Y' });

    expect(imprimirPorRawBTMock).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(imprimirPorWebSerialMock).not.toHaveBeenCalled();
  });
});
