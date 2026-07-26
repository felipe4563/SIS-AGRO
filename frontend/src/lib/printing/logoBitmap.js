export function imageDataToMonochromeBitmap(imageData, threshold = 128) {
  const { width, height, data } = imageData;
  const widthBytes = Math.ceil(width / 8);
  const out = new Uint8Array(widthBytes * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
      const esNegro = a >= 128 && luminancia < threshold;
      if (esNegro) {
        const byteIndex = y * widthBytes + (x >> 3);
        const bit = 7 - (x % 8);
        out[byteIndex] |= (1 << bit);
      }
    }
  }

  return { width, height, widthBytes, data: out };
}

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`));
    img.src = url;
  });
}

export async function loadLogoAsBitmap(logoUrl, targetWidthDots = 384) {
  if (!logoUrl) return null;

  try {
    const img = await cargarImagen(logoUrl);
    const escala = targetWidthDots / img.naturalWidth;
    const width = targetWidthDots;
    const height = Math.round(img.naturalHeight * escala);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    return imageDataToMonochromeBitmap(imageData);
  } catch (err) {
    console.warn('[logoBitmap] No se pudo convertir el logo para impresión térmica:', err);
    return null;
  }
}
