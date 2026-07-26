import { construirTicket } from './ticketBuilder';
import { soportaWebSerial, imprimirPorWebSerial } from './transports/webSerial';
import { imprimirPorRawBT } from './transports/rawbt';

export async function imprimirTermica(venta, configuracion) {
  const bytes = await construirTicket(venta, configuracion);

  if (soportaWebSerial()) {
    return imprimirPorWebSerial(bytes);
  }
  return imprimirPorRawBT(bytes);
}
