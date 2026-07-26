// frontend/src/lib/printing/transports/rawbt.js

export function bytesToBase64(bytes) {
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario);
}

export function imprimirPorRawBT(bytes, { win = window, doc = document, timeoutMs = 1500 } = {}) {
  const base64 = bytesToBase64(bytes);
  const url = `rawbt:base64,${base64}`;

  return new Promise((resolve, reject) => {
    let resuelto = false;

    const alCambiarVisibilidad = () => {
      if (doc.visibilityState === 'hidden' && !resuelto) {
        resuelto = true;
        doc.removeEventListener('visibilitychange', alCambiarVisibilidad);
        resolve();
      }
    };
    doc.addEventListener('visibilitychange', alCambiarVisibilidad);

    win.location.href = url;

    setTimeout(() => {
      if (!resuelto) {
        resuelto = true;
        doc.removeEventListener('visibilitychange', alCambiarVisibilidad);
        reject(new Error('No se pudo abrir RawBT. Instala la app gratuita "RawBT Print Service" desde Play Store.'));
      }
    }, timeoutMs);
  });
}
