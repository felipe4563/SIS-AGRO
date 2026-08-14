import { construirTicket } from './ticketBuilder';
import { soportaWebSerial, imprimirPorWebSerial } from './transports/webSerial';
import { imprimirPorRawBT } from './transports/rawbt';

export function esAndroid(nav = navigator) {
  return Boolean(nav && /Android/i.test(nav.userAgent ?? ''));
}

export async function imprimirTermica(venta, configuracion, { nav = navigator } = {}) {
  const bytes = await construirTicket(venta, configuracion);

  // Android primero: Chrome en algunos equipos expone `navigator.serial`
  // sin backend real detrás, y el diálogo de Web Serial nunca encuentra
  // el dispositivo. En Android siempre se usa RawBT.
  if (esAndroid(nav)) {
    return imprimirPorRawBT(bytes);
  }

  if (soportaWebSerial(nav)) {
    return imprimirPorWebSerial(bytes);
  }

  throw new Error(
    'Este navegador no puede imprimir en la impresora térmica. ' +
    'Usa Chrome o Edge en Windows (Web Serial), o Chrome en Android con la app RawBT instalada.'
  );
}
