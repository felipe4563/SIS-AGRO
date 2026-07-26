// frontend/src/lib/printing/transports/webSerial.js

export function soportaWebSerial(nav = navigator) {
  return Boolean(nav && 'serial' in nav);
}

export async function imprimirPorWebSerial(bytes, nav = navigator) {
  if (!soportaWebSerial(nav)) {
    throw new Error('Este navegador no soporta Web Serial. Usa Chrome o Edge en Windows.');
  }

  const autorizados = await nav.serial.getPorts();
  const port = autorizados.length > 0 ? autorizados[0] : await nav.serial.requestPort();

  await port.open({ baudRate: 115200 });
  try {
    const writer = port.writable.getWriter();
    try {
      await writer.write(bytes);
    } finally {
      writer.releaseLock();
    }
  } finally {
    await port.close();
  }
}
