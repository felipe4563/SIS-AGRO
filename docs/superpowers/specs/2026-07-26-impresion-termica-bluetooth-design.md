# Impresión térmica Bluetooth (80mm) — Diseño

## Contexto

`VentaTicket.jsx` hoy solo soporta impresión "normal" vía `window.print()` (CSS `@media print`, pensado para impresoras láser/inkjet estándar). Las sucursales quieren poder imprimir el mismo comprobante en impresoras térmicas de 80mm conectadas por Bluetooth (ej. modelo genérico MTP-3B / clones ESC-POS de 80mm, interfaz USB & BT, 115200 baudios).

Estas sucursales usan tanto PCs/laptops con Windows como tablets/celulares Android, según el caso — la solución debe cubrir ambas plataformas.

---

## Limitación técnica clave

La gran mayoría de estas impresoras térmicas Bluetooth "genéricas" usan **Bluetooth clásico con perfil SPP** (puerto serie), no BLE. La Web Bluetooth API del navegador solo puede hablar con dispositivos **BLE (GATT)** — no puede abrir un socket SPP clásico, ni en Windows ni en Android. Esto descarta usar Web Bluetooth como transporte único y obliga a una solución distinta por plataforma:

| Plataforma | Mecanismo | Requiere instalar algo? |
|---|---|---|
| Windows (Chrome/Edge) | **Web Serial API** sobre el puerto COM virtual que crea Windows al emparejar la impresora Bluetooth | No (solo emparejar la impresora en el SO, como cualquier dispositivo Bluetooth) |
| Android (Chrome) | App **RawBT** (gratuita) recibiendo el ticket vía esquema de URL `rawbt:base64,<...>` | Sí, una vez por dispositivo |

Esta es la solución estándar usada por la mayoría de los sistemas POS web para este tipo de hardware.

---

## Decisiones de diseño

| Decisión | Elección | Razón |
|---|---|---|
| Transporte Windows | Web Serial API sobre COM virtual del emparejamiento BT del SO | No requiere instalar nada adicional; nativo en Chrome/Edge |
| Transporte Android | App RawBT vía `rawbt:base64,<ESC/POS en base64>` | Único mecanismo viable para Bluetooth SPP clásico desde un navegador Android |
| Selección de impresora en la UI | Dos botones separados: "Imprimir normal" (existente, sin cambios) e "Imprimir térmica (BT)" (nuevo) | El cajero decide explícitamente en cada ticket, sin lógica de auto-detección frágil |
| Formato del contenido térmico | Generador ESC/POS propio y reutilizable, no reutiliza el HTML/CSS del ticket normal | El HTML no es imprimible en ESC/POS; se necesita una representación en bytes independiente |
| Logo en el ticket térmico | Se incluye desde el inicio, convertido a bitmap monocromo (comando `GS v 0`) | Fidelidad visual con el ticket normal, aceptando el costo de implementación extra |
| Ancho de impresión | 384 dots (resolución típica de cabezal de 80mm en esta gama de impresoras), ~42-48 columnas de texto | Coincide con el ancho físico declarado (80mm) del hardware objetivo |
| Manejo de errores | Cada transporte falla de forma aislada y visible (toast), nunca bloquea "Imprimir normal" | Los dos flujos de impresión deben ser independientes entre sí |
| Testing | Unit tests solo sobre las funciones puras (`ticketBuilder`, `logoBitmap`); resto es verificación manual con hardware real | No es posible automatizar Bluetooth/apps externas en CI |

---

## Arquitectura

```
frontend/src/lib/printing/
  escpos.js            → builder de comandos ESC/POS: init, align, bold, doubleSize, text, feed, cut, raster
  ticketBuilder.js     → arma los bytes ESC/POS de un ticket a partir de (venta, configuracion)
  logoBitmap.js        → convierte configuracion.logo a bitmap monocromo para el comando GS v 0
  transports/
    webSerial.js       → entrega los bytes a un puerto Web Serial (Windows/desktop)
    rawbt.js            → entrega los bytes a la app RawBT vía rawbt:base64,... (Android)
  index.js             → detecta transporte disponible y expone imprimirTermica(venta, configuracion)
```

`frontend/src/pages/ventas/VentaTicket.jsx` importa únicamente `imprimirTermica` de `printing/index.js` y agrega un segundo botón junto al de "Imprimir normal" existente. El botón "Imprimir normal" no se modifica.

### Generación del ticket (`ticketBuilder.js`)

Recorre la misma información que hoy renderiza el HTML (cabecera de empresa, número/fecha/cajero/tipo de venta, cliente, detalle de productos con cantidad/precio/subtotal, totales, método de pago y datos de voucher/QR si aplica, sello "ANULADA" si corresponde, y pie de página), y la traduce a la secuencia de comandos ESC/POS equivalente, usando padding de texto para alinear columnas (igual efecto que el `justify-content: space-between` actual).

### Logo (`logoBitmap.js`)

Dibuja `configuracion.logo` en un `<canvas>` oculto (`crossOrigin="anonymous"`, ya cubierto por la config CORS existente para `/uploads` en `backend/app.js`), lo reescala a 384px de ancho, aplica umbral blanco/negro simple (sin dithering en esta primera versión) y empaqueta los bits en el formato esperado por `GS v 0`. Si falla la carga de la imagen por cualquier motivo, se hace *fallback* silencioso a mostrar el nombre de la empresa en texto grande/negrita — nunca bloquea la impresión.

### Transporte Windows (`webSerial.js`)

1. Al hacer clic en "Imprimir térmica (BT)", intenta `navigator.serial.getPorts()`; si ya existe un puerto autorizado de una sesión previa, lo reutiliza sin volver a preguntar.
2. Si no hay ninguno, llama a `navigator.serial.requestPort()` (selector nativo del navegador) para que el cajero elija el puerto COM ya emparejado en Windows.
3. Abre el puerto a 115200 baudios, escribe los bytes ESC/POS generados, cierra el puerto.
4. Si `navigator.serial` no existe (navegador sin soporte), se informa al usuario con un mensaje explicando los requisitos.

### Transporte Android (`rawbt.js`)

1. Codifica los bytes ESC/POS en base64.
2. Navega a `rawbt:base64,<base64>` vía `window.location.href`.
3. Si la app RawBT no está instalada, Android no puede resolver el esquema; se usa un temporizador corto para detectar que no hubo "salida" de la pestaña y mostrar un mensaje propio ("Instala la app gratuita RawBT para imprimir por Bluetooth") en vez de fallar en silencio.

### Selección de transporte (`index.js`)

```js
export async function imprimirTermica(venta, configuracion) {
  const bytes = await construirTicket(venta, configuracion); // ticketBuilder + logoBitmap
  if ('serial' in navigator) return imprimirPorWebSerial(bytes);
  return imprimirPorRawBT(bytes);
}
```

`navigator.serial` solo existe en Chrome/Edge de escritorio, por lo que esta detección es suficiente para elegir entre Windows y Android sin necesidad de parsear el user-agent.

---

## Errores y estados en la UI

El botón "Imprimir térmica (BT)" maneja tres estados: `idle` → `imprimiendo…` (deshabilitado) → `idle`. Casos a cubrir:

- Sin `navigator.serial` ni RawBT disponible/instalado → mensaje explicando los requisitos según plataforma.
- Cancelación del selector de puerto COM (Windows) → no se muestra error, es una cancelación intencional del usuario.
- Puerto ocupado / error de escritura serial → toast de error con opción de reintentar.
- RawBT no instalado (Android) → mensaje pidiendo instalar la app.

El flujo de "Imprimir normal" (`window.print()`) permanece completamente intacto y funcional en cualquiera de estos casos de error.

---

## Testing

- Unit tests de `ticketBuilder.js`: dado un `venta`/`configuracion` de prueba, verificar que la secuencia de bytes contiene los comandos ESC/POS esperados (init, align, bold, cut, etc.) en el orden correcto.
- Unit tests de `logoBitmap.js`: verificar que una imagen de prueba conocida produce un bitmap del ancho/alto esperado y maneja el caso de fallo de carga con el fallback a texto.
- Verificación manual obligatoria con hardware real antes de dar por cerrada la funcionalidad: impresión en Windows vía Web Serial y en Android vía RawBT, con ticket real de una venta.

---

## Fuera de alcance (v1)

- Dithering de imágenes (solo umbral simple blanco/negro).
- Recuperación automática de conexión Bluetooth caída a mitad de impresión (se informa el error y se deja reintentar manualmente).
- Cualquier soporte para iOS/Safari (Web Serial no existe en Safari; quedaría fuera de esta versión).
