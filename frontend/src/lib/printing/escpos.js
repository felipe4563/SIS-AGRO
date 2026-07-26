const ESC = 0x1B;
const GS  = 0x1D;

export function init() {
  return new Uint8Array([ESC, 0x40]);
}

export function align(modo) {
  const mapa = { left: 0, center: 1, right: 2 };
  if (!(modo in mapa)) throw new Error(`align: modo inválido "${modo}"`);
  return new Uint8Array([ESC, 0x61, mapa[modo]]);
}

export function bold(on) {
  return new Uint8Array([ESC, 0x45, on ? 1 : 0]);
}

export function doubleSize(on) {
  return new Uint8Array([GS, 0x21, on ? 0x11 : 0x00]);
}

const MAPA_ACENTOS = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u',
  Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U',
  ñ: 'n', Ñ: 'N', ü: 'u', Ü: 'U',
  '¿': '?', '¡': '!',
};

export function sanitizeText(str) {
  return String(str ?? '').replace(/[áéíóúÁÉÍÓÚñÑüÜ¿¡]/g, (c) => MAPA_ACENTOS[c] ?? c);
}

export function text(str) {
  const limpio = sanitizeText(str);
  const bytes = new Uint8Array(limpio.length);
  for (let i = 0; i < limpio.length; i++) bytes[i] = limpio.charCodeAt(i) & 0x7F;
  return bytes;
}

export function line(str = '') {
  return concatBytes(text(str), new Uint8Array([0x0A]));
}

export function feed(lineas = 1) {
  return new Uint8Array([ESC, 0x64, lineas]);
}

export function cut() {
  return new Uint8Array([GS, 0x56, 0x42, 0x00]);
}

export function raster({ widthBytes, height, data }) {
  const header = new Uint8Array([
    GS, 0x76, 0x30, 0x00,
    widthBytes & 0xFF, (widthBytes >> 8) & 0xFF,
    height & 0xFF, (height >> 8) & 0xFF,
  ]);
  return concatBytes(header, data);
}

export function concatBytes(...chunks) {
  const total = chunks.reduce((suma, c) => suma + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export function columns(izq = '', der = '', ancho = 42) {
  const l = sanitizeText(izq);
  const r = sanitizeText(der);
  const espacios = Math.max(1, ancho - l.length - r.length);
  return `${l}${' '.repeat(espacios)}${r}`;
}
