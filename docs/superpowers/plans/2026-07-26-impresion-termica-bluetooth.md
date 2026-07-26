# Impresión térmica Bluetooth (80mm) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un botón "Imprimir térmica (BT)" a `VentaTicket.jsx` que genera el comprobante en comandos ESC/POS y lo entrega a la impresora térmica de 80mm por Bluetooth, usando Web Serial en Windows y la app RawBT en Android, sin tocar el botón "Imprimir normal" existente.

**Architecture:** Módulo nuevo y autocontenido `frontend/src/lib/printing/` con un generador de comandos ESC/POS puro (`escpos.js`), un conversor de logo a bitmap monocromo (`logoBitmap.js`), un armador de ticket (`ticketBuilder.js`) y dos transportes intercambiables (`transports/webSerial.js`, `transports/rawbt.js`) orquestados por `index.js`. `VentaTicket.jsx` solo importa `imprimirTermica(venta, configuracion)`.

**Tech Stack:** React 19 + Vite (frontend existente), Web Serial API, esquema de URL `rawbt:base64,...` de la app RawBT, Vitest + jsdom (nuevo, para tests unitarios — el frontend no tenía test runner).

## Global Constraints

- No modificar el flujo ni el botón "Imprimir normal" (`window.print()`) existente en `VentaTicket.jsx`.
- Ancho de impresión térmica: 384 dots / ~42 columnas de texto (impresora de 80mm).
- Baudrate del puerto serie: 115200 (según ficha técnica de la impresora objetivo).
- Corte de papel: comando de corte parcial `GS V 66 0`.
- Logo incluido desde el inicio como bitmap monocromo (umbral simple, sin dithering).
- Caracteres acentuados (á é í ó ú ñ ¿ ¡) deben normalizarse a ASCII antes de imprimir, porque el mapeo de codepage del hardware genérico no es confiable.
- Cada transporte falla de forma aislada (nunca debe romper "Imprimir normal").
- Toasts de error/éxito siguen el patrón local ya usado en `frontend/src/pages/ventas/NuevaVenta.jsx` (componente `Toast` definido en el mismo archivo de página, `useState` + `setTimeout(4000)`), no una librería externa.

---

## Task 1: Configurar Vitest en el frontend

El frontend (`frontend/`) no tiene ningún test runner instalado. Esta tarea agrega Vitest + jsdom antes de escribir cualquier test real.

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.js`

**Interfaces:**
- Produces: comando `npm test` (alias de `vitest run`) ejecutable desde `frontend/`, entorno `jsdom` disponible para todos los tests futuros.

- [ ] **Step 1: Instalar Vitest y jsdom como devDependencies**

```bash
cd frontend
npm install -D vitest jsdom
```

- [ ] **Step 2: Agregar el bloque `test` a `vite.config.js`**

En `frontend/vite.config.js`, agregar la clave `test` al objeto que retorna `defineConfig`, junto a `plugins` y `server` (no reemplazar nada existente):

```js
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({ /* ...sin cambios... */ }),
  ],

  server: {
    allowedHosts: [
      'atm-zoo-measurements-newspapers.trycloudflare.com',
    ],
  },

  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 3: Agregar el script `test` en `package.json`**

En `frontend/package.json`, dentro de `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run"
}
```

- [ ] **Step 4: Verificar que el runner arranca sin tests (todavía no hay ninguno)**

Run: `cd frontend && npx vitest run --passWithNoTests`
Expected: termina en verde/sin errores (0 test files, exit code 0).

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js
git commit -m "chore(frontend): add vitest + jsdom test setup"
```

---

## Task 2: Generador de comandos ESC/POS (`escpos.js`)

Módulo puro (sin DOM) con las primitivas de bytes ESC/POS que usará el resto del sistema.

**Files:**
- Create: `frontend/src/lib/printing/escpos.js`
- Test: `frontend/src/lib/printing/escpos.test.js`

**Interfaces:**
- Produces:
  - `init(): Uint8Array`
  - `align(modo: 'left'|'center'|'right'): Uint8Array`
  - `bold(on: boolean): Uint8Array`
  - `doubleSize(on: boolean): Uint8Array`
  - `sanitizeText(str: string): string` — quita acentos/ñ/¿/¡
  - `text(str: string): Uint8Array`
  - `line(str?: string): Uint8Array` — `text(str) + 0x0A`
  - `feed(lineas?: number): Uint8Array`
  - `cut(): Uint8Array`
  - `raster({ widthBytes: number, height: number, data: Uint8Array }): Uint8Array`
  - `concatBytes(...chunks: Uint8Array[]): Uint8Array`
  - `columns(izq: string, der: string, ancho?: number): string`

- [ ] **Step 1: Escribir los tests (fallando)**

```js
// frontend/src/lib/printing/escpos.test.js
import { describe, it, expect } from 'vitest';
import {
  init, align, bold, doubleSize, sanitizeText, text, line,
  feed, cut, raster, concatBytes, columns,
} from './escpos';

describe('escpos', () => {
  it('init() manda ESC @', () => {
    expect(Array.from(init())).toEqual([0x1B, 0x40]);
  });

  it('align acepta left/center/right y rechaza otros valores', () => {
    expect(Array.from(align('left'))).toEqual([0x1B, 0x61, 0]);
    expect(Array.from(align('center'))).toEqual([0x1B, 0x61, 1]);
    expect(Array.from(align('right'))).toEqual([0x1B, 0x61, 2]);
    expect(() => align('arriba')).toThrow();
  });

  it('bold on/off', () => {
    expect(Array.from(bold(true))).toEqual([0x1B, 0x45, 1]);
    expect(Array.from(bold(false))).toEqual([0x1B, 0x45, 0]);
  });

  it('doubleSize on/off', () => {
    expect(Array.from(doubleSize(true))).toEqual([0x1D, 0x21, 0x11]);
    expect(Array.from(doubleSize(false))).toEqual([0x1D, 0x21, 0x00]);
  });

  it('sanitizeText normaliza acentos, ñ y signos', () => {
    expect(sanitizeText('Compra a crédito, ¿está seguro? ¡Sí, señor!'))
      .toBe('Compra a credito, ?esta seguro? !Si, senor!');
  });

  it('text() produce bytes ASCII saneados', () => {
    expect(Array.from(text('ñu'))).toEqual([110, 117]); // 'n', 'u'
  });

  it('line() agrega salto de línea al final', () => {
    const bytes = Array.from(line('ok'));
    expect(bytes).toEqual([111, 107, 0x0A]);
  });

  it('feed(n) manda ESC d n', () => {
    expect(Array.from(feed(3))).toEqual([0x1B, 0x64, 3]);
  });

  it('cut() manda corte parcial GS V 66 0', () => {
    expect(Array.from(cut())).toEqual([0x1D, 0x56, 0x42, 0x00]);
  });

  it('raster arma el header GS v 0 con ancho/alto little-endian', () => {
    const data = new Uint8Array([0xFF, 0x00]);
    const bytes = Array.from(raster({ widthBytes: 1, height: 2, data }));
    expect(bytes).toEqual([0x1D, 0x76, 0x30, 0x00, 1, 0, 2, 0, 0xFF, 0x00]);
  });

  it('concatBytes une varios Uint8Array en uno', () => {
    const out = concatBytes(new Uint8Array([1, 2]), new Uint8Array([3]));
    expect(Array.from(out)).toEqual([1, 2, 3]);
  });

  it('columns rellena con espacios hasta el ancho pedido', () => {
    expect(columns('A', 'B', 5)).toBe('A   B');
  });

  it('columns nunca deja menos de un espacio si el texto es más largo que el ancho', () => {
    expect(columns('12345', '67890', 5)).toBe('12345 67890');
  });
});
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan (el módulo no existe)**

Run: `cd frontend && npx vitest run src/lib/printing/escpos.test.js`
Expected: FAIL — `Cannot find module './escpos'`

- [ ] **Step 3: Implementar `escpos.js`**

```js
// frontend/src/lib/printing/escpos.js
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
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `cd frontend && npx vitest run src/lib/printing/escpos.test.js`
Expected: PASS (13 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/printing/escpos.js frontend/src/lib/printing/escpos.test.js
git commit -m "feat(printing): add ESC/POS command builder"
```

---

## Task 3: Conversión de logo a bitmap monocromo (`logoBitmap.js`)

Separa la lógica pura de conversión de píxeles (testable sin DOM) de la carga de imagen vía `<canvas>` (requiere navegador real, se prueba manualmente).

**Files:**
- Create: `frontend/src/lib/printing/logoBitmap.js`
- Test: `frontend/src/lib/printing/logoBitmap.test.js`

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces:
  - `imageDataToMonochromeBitmap(imageData: { width, height, data: Uint8ClampedArray }, threshold?: number): { width, height, widthBytes, data: Uint8Array }` — función pura.
  - `loadLogoAsBitmap(logoUrl: string|null, targetWidthDots?: number): Promise<{ width, height, widthBytes, data: Uint8Array } | null>` — usada por `ticketBuilder.js` (Task 4).

- [ ] **Step 1: Escribir los tests (fallando)**

```js
// frontend/src/lib/printing/logoBitmap.test.js
import { describe, it, expect } from 'vitest';
import { imageDataToMonochromeBitmap, loadLogoAsBitmap } from './logoBitmap';

function pixel([r, g, b, a]) { return [r, g, b, a]; }

describe('imageDataToMonochromeBitmap', () => {
  it('convierte una imagen de 8x1 con blanco y negro alternado en un byte 10101010', () => {
    const negro = pixel([0, 0, 0, 255]);
    const blanco = pixel([255, 255, 255, 255]);
    const pixeles = [negro, blanco, negro, blanco, negro, blanco, negro, blanco];
    const data = new Uint8ClampedArray(pixeles.flat());
    const bitmap = imageDataToMonochromeBitmap({ width: 8, height: 1, data });

    expect(bitmap.width).toBe(8);
    expect(bitmap.height).toBe(1);
    expect(bitmap.widthBytes).toBe(1);
    expect(bitmap.data[0]).toBe(0b10101010);
  });

  it('rellena con ceros (blanco) los bits sobrantes cuando el ancho no es múltiplo de 8', () => {
    const negro = pixel([0, 0, 0, 255]);
    const data = new Uint8ClampedArray([...negro, ...negro, ...negro]); // 3px negros
    const bitmap = imageDataToMonochromeBitmap({ width: 3, height: 1, data });

    expect(bitmap.widthBytes).toBe(1);
    expect(bitmap.data[0]).toBe(0b11100000);
  });

  it('trata los píxeles transparentes como blancos (sin tinta)', () => {
    const negroTransparente = pixel([0, 0, 0, 0]);
    const data = new Uint8ClampedArray(new Array(8).fill(negroTransparente).flat());
    const bitmap = imageDataToMonochromeBitmap({ width: 8, height: 1, data });

    expect(bitmap.data[0]).toBe(0);
  });
});

describe('loadLogoAsBitmap', () => {
  it('devuelve null inmediatamente si no hay logoUrl', async () => {
    const resultado = await loadLogoAsBitmap(null);
    expect(resultado).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan**

Run: `cd frontend && npx vitest run src/lib/printing/logoBitmap.test.js`
Expected: FAIL — `Cannot find module './logoBitmap'`

- [ ] **Step 3: Implementar `logoBitmap.js`**

```js
// frontend/src/lib/printing/logoBitmap.js

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
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `cd frontend && npx vitest run src/lib/printing/logoBitmap.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/printing/logoBitmap.js frontend/src/lib/printing/logoBitmap.test.js
git commit -m "feat(printing): add logo-to-monochrome-bitmap conversion"
```

---

## Task 4: Armador del ticket (`ticketBuilder.js`)

Traduce el mismo contenido que hoy renderiza `VentaTicket.jsx` en HTML a la secuencia de bytes ESC/POS, usando `escpos.js` (Task 2) y `logoBitmap.js` (Task 3).

**Files:**
- Create: `frontend/src/lib/printing/ticketBuilder.js`
- Test: `frontend/src/lib/printing/ticketBuilder.test.js`

**Interfaces:**
- Consumes:
  - de `escpos.js`: todas las funciones listadas en Task 2.
  - de `logoBitmap.js`: `loadLogoAsBitmap(logoUrl, targetWidthDots?)`.
- Produces:
  - `buildTicketBytes(venta: object, configuracion: object, logoBitmap?: object|null): Uint8Array` — función pura, sin I/O.
  - `construirTicket(venta: object, configuracion: object): Promise<Uint8Array>` — orquestador async usado por `index.js` (Task 7): llama `loadLogoAsBitmap(configuracion.logo)` y luego `buildTicketBytes`.

- [ ] **Step 1: Escribir los tests (fallando)**

```js
// frontend/src/lib/printing/ticketBuilder.test.js
import { describe, it, expect } from 'vitest';
import { buildTicketBytes } from './ticketBuilder';

function bytesToTexto(bytes) {
  // Decodifica solo los bytes imprimibles (>=0x20) para poder buscar substrings en los tests,
  // ignorando los comandos de control ESC/GS que no son ASCII imprimible.
  return Array.from(bytes)
    .map((b) => (b >= 0x20 && b <= 0x7E ? String.fromCharCode(b) : ''))
    .join('');
}

const ventaBase = {
  id_venta: 42,
  fecha_venta: '2026-07-20T15:30:00',
  usuario_nombre: 'Juan',
  usuario_apellido: 'Perez',
  tipo_venta: 'MENOR',
  nro_factura: null,
  cliente_nombre: null,
  cliente_apellido: null,
  ci_nit: null,
  detalles: [
    { id_detalle_venta: 1, cantidad: 2, tipo_cantidad: 'UNIDAD', producto_nombre: 'Urea 50kg', subtotal: 100, precio_unitario: 50, descuento_pct: 0, numero_lote: 'L001' },
  ],
  subtotal: 100,
  descuento_total: 0,
  total: 100,
  metodo_pago: 'EFECTIVO',
  monto_pagado: 100,
  cambio: 0,
  estado: 'COMPLETADA',
};

const configBase = {
  nombre_empresa: 'Agropecuaria Test',
  nit: '123456',
  direccion: 'Av. Siempre Viva 123',
  ciudad: 'Santa Cruz',
  telefono: '70000000',
  logo: null,
};

describe('buildTicketBytes', () => {
  it('incluye el número de venta, el nombre de la empresa y el total', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    const textoPlano = bytesToTexto(bytes);

    expect(textoPlano).toContain('Nro 000042');
    expect(textoPlano).toContain('Agropecuaria Test');
    expect(textoPlano).toContain('TOTAL Bs:');
    expect(textoPlano).toContain('100.00');
  });

  it('usa "Consumidor Final" cuando no hay cliente', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    expect(bytesToTexto(bytes)).toContain('Consumidor Final');
  });

  it('incluye el nombre del cliente cuando existe', () => {
    const venta = { ...ventaBase, cliente_nombre: 'Maria', cliente_apellido: 'Lopez' };
    const bytes = buildTicketBytes(venta, configBase, null);
    expect(bytesToTexto(bytes)).toContain('Maria Lopez');
  });

  it('agrega el sello ANULADA cuando la venta está anulada', () => {
    const venta = { ...ventaBase, estado: 'ANULADA' };
    const bytes = buildTicketBytes(venta, configBase, null);
    expect(bytesToTexto(bytes)).toContain('ANULADA');
  });

  it('no incluye el sello ANULADA en una venta completada', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    expect(bytesToTexto(bytes)).not.toContain('ANULADA');
  });

  it('normaliza acentos del nombre de la empresa (sin logo)', () => {
    const config = { ...configBase, nombre_empresa: 'Agropecuaria López & Ñañez' };
    const bytes = buildTicketBytes(ventaBase, config, null);
    expect(bytesToTexto(bytes)).toContain('Agropecuaria Lopez & Nanez');
  });

  it('termina con el corte de papel (GS V 66 0)', () => {
    const bytes = buildTicketBytes(ventaBase, configBase, null);
    const cola = Array.from(bytes.slice(-4));
    expect(cola).toEqual([0x1D, 0x56, 0x42, 0x00]);
  });

  it('incluye el comando raster cuando se pasa un logoBitmap', () => {
    const logoBitmap = { width: 8, height: 1, widthBytes: 1, data: new Uint8Array([0xFF]) };
    const bytes = buildTicketBytes(ventaBase, configBase, logoBitmap);
    const bytesArray = Array.from(bytes);
    // Busca la secuencia de header GS v 0 dentro del stream de bytes
    const idx = bytesArray.findIndex((b, i) =>
      b === 0x1D && bytesArray[i + 1] === 0x76 && bytesArray[i + 2] === 0x30);
    expect(idx).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan**

Run: `cd frontend && npx vitest run src/lib/printing/ticketBuilder.test.js`
Expected: FAIL — `Cannot find module './ticketBuilder'`

- [ ] **Step 3: Implementar `ticketBuilder.js`**

```js
// frontend/src/lib/printing/ticketBuilder.js
import * as esc from './escpos';
import { loadLogoAsBitmap } from './logoBitmap';

const ANCHO_COLUMNAS = 42;

const METODOS_PAGO = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  QR: 'QR (CodePay)',
  QR_ESTATICO: 'QR (Estatico)',
  CREDITO: 'Credito',
  OTRO: 'Otro',
};

const fmt = (n) => Number(n ?? 0).toFixed(2);

const fmtFecha = (s) =>
  s
    ? new Date(s).toLocaleString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '-';

export function buildTicketBytes(venta, configuracion, logoBitmap = null) {
  const partes = [esc.init(), esc.align('center')];

  if (logoBitmap) {
    partes.push(esc.raster(logoBitmap));
    partes.push(esc.line());
  } else {
    partes.push(esc.doubleSize(true), esc.bold(true));
    partes.push(esc.line(configuracion.nombre_empresa || ''));
    partes.push(esc.bold(false), esc.doubleSize(false));
  }

  if (configuracion.nit) partes.push(esc.line(`NIT: ${configuracion.nit}`));
  if (venta.sucursal_nombre) partes.push(esc.line(venta.sucursal_nombre));

  const direccion = venta.sucursal_direccion || configuracion.direccion;
  const ciudad = venta.sucursal_ciudad || configuracion.ciudad;
  if (direccion) partes.push(esc.line(`${direccion}${ciudad ? ', ' + ciudad : ''}`));

  const telefono = venta.sucursal_telefono || configuracion.telefono;
  if (telefono) partes.push(esc.line(`Tel: ${telefono}`));

  partes.push(esc.align('left'));
  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));

  partes.push(esc.bold(true));
  partes.push(esc.line(esc.columns('COMPROBANTE DE VENTA', `Nro ${String(venta.id_venta).padStart(6, '0')}`, ANCHO_COLUMNAS)));
  partes.push(esc.bold(false));
  partes.push(esc.line(esc.columns('Fecha:', fmtFecha(venta.fecha_venta), ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Cajero:', `${venta.usuario_nombre || ''} ${venta.usuario_apellido || ''}`.trim(), ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Tipo:', venta.tipo_venta === 'MAYOR' ? 'Por Mayor' : 'Por Menor', ANCHO_COLUMNAS)));
  if (venta.nro_factura) partes.push(esc.line(esc.columns('N. Factura:', venta.nro_factura, ANCHO_COLUMNAS)));

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.bold(true));
  partes.push(esc.line('CLIENTE'));
  partes.push(esc.bold(false));
  const clienteNombre = venta.cliente_nombre
    ? `${venta.cliente_nombre} ${venta.cliente_apellido || ''}`.trim()
    : 'Consumidor Final';
  partes.push(esc.line(clienteNombre));
  if (venta.ci_nit) partes.push(esc.line(`CI/NIT: ${venta.ci_nit}`));

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.bold(true));
  partes.push(esc.line('DETALLE'));
  partes.push(esc.bold(false));
  for (const d of venta.detalles || []) {
    const cantidadTexto = `${d.cantidad} ${d.tipo_cantidad === 'CAJA' ? 'cj' : 'un'} - ${d.producto_nombre}`;
    partes.push(esc.line(esc.columns(cantidadTexto, `Bs ${fmt(d.subtotal)}`, ANCHO_COLUMNAS)));
    let detalle = `  P.U.: Bs ${fmt(d.precio_unitario)}`;
    if (parseFloat(d.descuento_pct) > 0) detalle += ` (-${d.descuento_pct}%)`;
    detalle += ` - Lote: ${d.numero_lote || 'S/N'}`;
    partes.push(esc.line(detalle));
  }

  partes.push(esc.line('='.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Subtotal Bs:', fmt(venta.subtotal), ANCHO_COLUMNAS)));
  if (parseFloat(venta.descuento_total) > 0) {
    partes.push(esc.line(esc.columns('Descuento Bs:', `- ${fmt(venta.descuento_total)}`, ANCHO_COLUMNAS)));
  }
  partes.push(esc.bold(true), esc.doubleSize(true));
  partes.push(esc.line(esc.columns('TOTAL Bs:', fmt(venta.total), Math.floor(ANCHO_COLUMNAS / 2))));
  partes.push(esc.doubleSize(false), esc.bold(false));

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Metodo:', METODOS_PAGO[venta.metodo_pago] ?? venta.metodo_pago ?? '', ANCHO_COLUMNAS)));
  partes.push(esc.line(esc.columns('Pagado Bs:', fmt(venta.monto_pagado), ANCHO_COLUMNAS)));
  if (venta.metodo_pago !== 'QR' && venta.metodo_pago !== 'QR_ESTATICO') {
    partes.push(esc.line(esc.columns('Cambio Bs:', fmt(venta.cambio), ANCHO_COLUMNAS)));
  }
  if (venta.metodo_pago === 'QR' && venta.codepay_voucher) {
    partes.push(esc.line(esc.columns('Voucher:', venta.codepay_voucher, ANCHO_COLUMNAS)));
  }
  if (venta.metodo_pago === 'QR' && venta.codepay_tx_id) {
    partes.push(esc.line(`Ref: ${venta.codepay_tx_id}`));
  }

  if (venta.estado === 'ANULADA') {
    partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
    partes.push(esc.align('center'), esc.bold(true), esc.doubleSize(true));
    partes.push(esc.line('*** ANULADA ***'));
    partes.push(esc.doubleSize(false), esc.bold(false), esc.align('left'));
  }

  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.align('center'));
  partes.push(esc.line('Gracias por su compra!'));
  partes.push(esc.line(configuracion.nombre_empresa || ''));

  partes.push(esc.feed(3));
  partes.push(esc.cut());

  return esc.concatBytes(...partes);
}

export async function construirTicket(venta, configuracion) {
  const logoBitmap = await loadLogoAsBitmap(configuracion.logo);
  return buildTicketBytes(venta, configuracion, logoBitmap);
}
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `cd frontend && npx vitest run src/lib/printing/ticketBuilder.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/printing/ticketBuilder.js frontend/src/lib/printing/ticketBuilder.test.js
git commit -m "feat(printing): add ESC/POS ticket builder from venta data"
```

---

## Task 5: Transporte Web Serial (Windows)

**Files:**
- Create: `frontend/src/lib/printing/transports/webSerial.js`
- Test: `frontend/src/lib/printing/transports/webSerial.test.js`

**Interfaces:**
- Consumes: nada de tareas anteriores (recibe los bytes ya armados).
- Produces:
  - `soportaWebSerial(nav?: object): boolean`
  - `imprimirPorWebSerial(bytes: Uint8Array, nav?: object): Promise<void>` — usado por `index.js` (Task 7). El parámetro `nav` es inyectable para tests (default `navigator`); si el usuario cancela el selector de puerto, la promesa nativa de `requestPort()` rechaza con `DOMException` `name === 'NotFoundError'` — este módulo deja pasar ese error tal cual (no lo intercepta), para que la UI (Task 8) lo distinga de un error real.

- [ ] **Step 1: Escribir los tests (fallando)**

```js
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
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan**

Run: `cd frontend && npx vitest run src/lib/printing/transports/webSerial.test.js`
Expected: FAIL — `Cannot find module './webSerial'`

- [ ] **Step 3: Implementar `webSerial.js`**

```js
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
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `cd frontend && npx vitest run src/lib/printing/transports/webSerial.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/printing/transports/webSerial.js frontend/src/lib/printing/transports/webSerial.test.js
git commit -m "feat(printing): add Web Serial transport for Windows thermal printing"
```

---

## Task 6: Transporte RawBT (Android)

**Files:**
- Create: `frontend/src/lib/printing/transports/rawbt.js`
- Test: `frontend/src/lib/printing/transports/rawbt.test.js`

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces:
  - `bytesToBase64(bytes: Uint8Array): string`
  - `imprimirPorRawBT(bytes: Uint8Array, opciones?: { win?: object, doc?: object, timeoutMs?: number }): Promise<void>` — usado por `index.js` (Task 7).

- [ ] **Step 1: Escribir los tests (fallando)**

```js
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
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan**

Run: `cd frontend && npx vitest run src/lib/printing/transports/rawbt.test.js`
Expected: FAIL — `Cannot find module './rawbt'`

- [ ] **Step 3: Implementar `rawbt.js`**

```js
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
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `cd frontend && npx vitest run src/lib/printing/transports/rawbt.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/printing/transports/rawbt.js frontend/src/lib/printing/transports/rawbt.test.js
git commit -m "feat(printing): add RawBT transport for Android thermal printing"
```

---

## Task 7: Orquestador (`index.js`)

Une los módulos anteriores en la única función pública que usará la UI.

**Files:**
- Create: `frontend/src/lib/printing/index.js`
- Test: `frontend/src/lib/printing/index.test.js`

**Interfaces:**
- Consumes:
  - `construirTicket` de `./ticketBuilder` (Task 4)
  - `soportaWebSerial`, `imprimirPorWebSerial` de `./transports/webSerial` (Task 5)
  - `imprimirPorRawBT` de `./transports/rawbt` (Task 6)
- Produces:
  - `imprimirTermica(venta: object, configuracion: object): Promise<void>` — usado por `VentaTicket.jsx` (Task 8).

- [ ] **Step 1: Escribir los tests (fallando)**

```js
// frontend/src/lib/printing/index.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const construirTicketMock = vi.fn(async () => new Uint8Array([1, 2, 3]));
const soportaWebSerialMock = vi.fn();
const imprimirPorWebSerialMock = vi.fn(async () => {});
const imprimirPorRawBTMock = vi.fn(async () => {});

vi.mock('./ticketBuilder', () => ({ construirTicket: construirTicketMock }));
vi.mock('./transports/webSerial', () => ({
  soportaWebSerial: soportaWebSerialMock,
  imprimirPorWebSerial: imprimirPorWebSerialMock,
}));
vi.mock('./transports/rawbt', () => ({ imprimirPorRawBT: imprimirPorRawBTMock }));

import { imprimirTermica } from './index';

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
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan**

Run: `cd frontend && npx vitest run src/lib/printing/index.test.js`
Expected: FAIL — `Cannot find module './index'`

- [ ] **Step 3: Implementar `index.js`**

```js
// frontend/src/lib/printing/index.js
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
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `cd frontend && npx vitest run src/lib/printing/index.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Correr toda la suite de `printing/` junta**

Run: `cd frontend && npx vitest run src/lib/printing`
Expected: PASS (todos los tests de las Tasks 2-7, ~30 tests en total)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/printing/index.js frontend/src/lib/printing/index.test.js
git commit -m "feat(printing): add imprimirTermica orchestrator (Web Serial / RawBT)"
```

---

## Task 8: Integrar el botón "Imprimir térmica (BT)" en `VentaTicket.jsx`

**Files:**
- Modify: `frontend/src/pages/ventas/VentaTicket.jsx`

**Interfaces:**
- Consumes: `imprimirTermica(venta, configuracion)` de `../../lib/printing` (Task 7).

No hay test automatizado para este paso (el proyecto no tiene infraestructura de test de componentes React); se verifica manualmente en el navegador como parte de esta misma tarea.

- [ ] **Step 1: Agregar el import y el estado local**

En `frontend/src/pages/ventas/VentaTicket.jsx`, junto a los imports existentes (línea 1-4):

```jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ventaService from '../../services/venta.service';
import { useConfig } from '../../contexts/ConfigContext';
import { imprimirTermica } from '../../lib/printing';
```

Dentro del componente, junto a los demás `useState` (después de la línea `const [esperandoPago, setEsperandoPago] = useState(false);`):

```jsx
const [imprimiendoTermica, setImprimiendoTermica] = useState(false);
const [toast, setToast] = useState(null);

const mostrarToast = (tipo, msg) => {
  setToast({ tipo, msg });
  setTimeout(() => setToast(null), 4000);
};

const handleImprimirTermica = async () => {
  setImprimiendoTermica(true);
  try {
    await imprimirTermica(venta, configuracion);
  } catch (err) {
    if (err?.name === 'NotFoundError') return; // el usuario cerró el selector de puerto, no es un error
    mostrarToast('error', err.message || 'Error al imprimir en la impresora térmica');
  } finally {
    setImprimiendoTermica(false);
  }
};
```

- [ ] **Step 2: Agregar el componente `Toast` local (mismo patrón que `NuevaVenta.jsx`)**

Antes de `export default function VentaTicket()`:

```jsx
function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.tipo === 'ok';
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold max-w-xs sm:max-w-sm backdrop-blur-sm ${
      ok
        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
    }`}>
      <span className="break-words">{toast.msg}</span>
    </div>
  );
}
```

- [ ] **Step 3: Agregar el `<Toast />` y el nuevo botón en el JSX**

En el bloque de botones (líneas 106-120), agregar el botón nuevo entre "Imprimir (80mm)" y "Volver", y renderizar `<Toast />` al inicio del fragment devuelto:

```jsx
return (
  <>
    <Toast toast={toast} />

    {/* ── Barra de botones (se oculta al imprimir) ── */}
    <div className="no-print flex gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <button
        onClick={() => window.print()}
        className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors flex items-center gap-2"
      >
        🖨️ Imprimir (80mm)
      </button>
      <button
        onClick={handleImprimirTermica}
        disabled={imprimiendoTermica}
        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center gap-2"
      >
        🖨️ {imprimiendoTermica ? 'Imprimiendo…' : 'Imprimir térmica (BT)'}
      </button>
      <button
        onClick={() => navigate('/ventas')}
        className="px-5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-sm transition-colors"
      >
        ← Volver
      </button>
    </div>
```

(El resto del JSX no cambia — solo se agrega el botón y el `<Toast />`.)

- [ ] **Step 4: Verificar que el frontend compila y la página carga sin errores**

Run: `cd frontend && npm run build`
Expected: build exitoso, sin errores de sintaxis ni de import.

- [ ] **Step 5: Verificación manual en navegador (sin hardware todavía)**

Run: `cd frontend && npm run dev`, abrir una venta ya registrada en `/ventas/:id/ticket`.
Expected:
- Se ven los tres botones: "Imprimir (80mm)", "Imprimir térmica (BT)", "Volver".
- Al hacer clic en "Imprimir térmica (BT)" en un navegador de escritorio (Chrome/Edge) sin impresora conectada, aparece el selector nativo de Web Serial (se puede cancelar sin que la app se rompa ni muestre un toast de error).
- El botón "Imprimir (80mm)" sigue funcionando exactamente igual que antes.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/ventas/VentaTicket.jsx
git commit -m "feat(ventas): add thermal Bluetooth print button to VentaTicket"
```

---

## Task 9: Verificación manual con hardware real

Esta tarea no es código — es la validación final con la impresora física, imposible de automatizar. Documentar el resultado (aunque sea en la descripción del PR) antes de considerar la funcionalidad terminada.

**Files:** ninguno (checklist de verificación).

- [ ] **Step 1: Verificar en Windows con Web Serial**
  1. Emparejar la impresora térmica Bluetooth desde la configuración de Bluetooth de Windows (esto crea un puerto COM saliente).
  2. Abrir el ticket de una venta real en Chrome o Edge.
  3. Hacer clic en "Imprimir térmica (BT)", elegir el puerto COM de la impresora en el selector.
  4. Confirmar que el ticket sale impreso con: logo (o nombre en negrita si no hay logo), datos de la venta, detalle de productos, totales, y que el papel se corta al final.
  5. Repetir el clic una segunda vez y confirmar que **no** vuelve a pedir el puerto (permiso recordado por el navegador).
  6. Imprimir un ticket con muchos productos (ticket largo) y confirmar que **no se trunca al final** — `webSerial.js` libera el lock y cierra el puerto justo después de que `write()` resuelve, lo cual solo garantiza que los bytes entraron al buffer de escritura, no que ya se transmitieron por el enlace Bluetooth SPP (más lento que USB); esto solo se puede detectar con hardware real.
  7. Probar un producto cuyo nombre tenga una comilla tipográfica (" o ') o el símbolo de grados (°) y confirmar que el ticket no sale corrupto ni corta el texto a mitad de línea (verifica en hardware real el fix de `escpos.js` que evita inyectar bytes de control ESC/POS).

- [ ] **Step 2: Verificar en Android con RawBT**
  1. Instalar la app "RawBT Print Service" desde Play Store en el dispositivo Android.
  2. Emparejar la impresora térmica por Bluetooth en la configuración de Android y configurarla dentro de RawBT como impresora por defecto (según el flujo propio de la app).
  3. Abrir el ticket de una venta real en Chrome para Android.
  4. Hacer clic en "Imprimir térmica (BT)" y confirmar que Android abre RawBT y el ticket sale impreso correctamente.
  5. Repetir la prueba con una empresa que tenga **logo configurado** (no solo texto) — el payload en base64 de un ticket con logo es bastante más grande (~10-25 KB) que uno sin logo (~1.5 KB), y solo la prueba con logo real confirma que RawBT/Android no tienen un límite de longitud de URL que rompa silenciosamente este flujo.
  6. Desinstalar temporalmente RawBT (o probar en un dispositivo sin la app) y confirmar que aparece el toast de error "Instala la app gratuita RawBT..." en vez de que la página se quede colgada.

- [ ] **Step 3: Confirmar que "Imprimir normal" sigue intacto**

En cualquiera de las dos plataformas, confirmar que "Imprimir (80mm)" (`window.print()`) sigue abriendo el diálogo de impresión del sistema operativo sin cambios de comportamiento.

- [ ] **Step 4: Registrar el resultado**

Anotar en la descripción del PR o commit final qué combinaciones de hardware/SO se probaron y su resultado (ya que no hay manera de dejar esto como test automatizado).
