# Venta de mezclas desde el POS — Diseño

## Contexto

El módulo de mezclas (`mezcla`, `mezcla_ingrediente`, `aplicacion_mezcla`, `aplicacion_mezcla_detalle`) hoy solo permite **aplicar** una mezcla: descuenta el stock de sus ingredientes (por FEFO, lote a lote) sin generar ningún cobro. Es un flujo de uso interno (ej. la propia finca prepara y consume su mezcla), separado por completo del motor de ventas (`venta`, `detalle_venta`, caja, crédito, QR, tickets).

El negocio también necesita **vender** mezclas a un cliente: cobrarlas como cualquier producto del POS, con el mismo flujo de caja/crédito/QR y el mismo ticket (normal y térmico Bluetooth), mientras se sigue descontando el stock de los ingredientes que consume.

---

## Limitación clave

`detalle_venta` asume que cada línea de venta corresponde a **un producto de un lote** (`id_producto` + `id_lote`, `NOT NULL`). Una mezcla consume **varios** productos de **varios** lotes en una sola línea de venta, así que no encaja en ese modelo sin cambios de esquema.

---

## Decisiones de diseño

| Decisión | Elección | Razón |
|---|---|---|
| Precio de mezcla | Manual, fijo por mezcla (`precio_mayor` / `precio_menor`, igual que `producto`) | El dueño del negocio define el margen, no se calcula automático de los ingredientes |
| Relación venta↔mezcla | `detalle_venta` gana `id_mezcla` e `id_aplicacion` (nullable); `id_producto` pasa a nullable | Reutiliza `aplicacion_mezcla`/`aplicacion_mezcla_detalle`, que ya modelan el descuento FEFO de ingredientes, en vez de duplicar esa lógica en `detalle_venta` |
| Descuento de stock al vender | Se reutiliza la lógica de `aplicarMezcla`, extraída a una función compartida sin HTTP (`aplicarMezclaTx`) | DRY: el botón "Aplicar" interno y la venta del POS llaman a la misma función dentro de su propia transacción |
| Botón "Aplicar" interno | Se mantiene tal cual, sin cambios | Sigue sirviendo para consumo interno sin venta (ya aprobado con el usuario) |
| Trazabilidad | `aplicacion_mezcla` gana `id_venta` (nullable) y `anulada` (booleano) | Permite distinguir "aplicación interna" vs "vendida en venta #X", y reflejar cuando la venta que la generó se anula |
| UI del POS | Mezclas activas aparecen en el mismo listado de productos de Nueva Venta, con badge 🧪 | Ya aprobado con el usuario — no hay pestaña separada |
| Cantidad de mezcla en el carrito | Representa "tandas" (decimal), sin `tipo_cantidad` CAJA/UNIDAD ni fraccionamiento | Una mezcla no se vende por caja ni se fracciona; "tandas" es el concepto que ya usa `aplicacion_mezcla.cantidad_tandas` |
| Atomicidad | Un carrito mixto (productos + mezclas) se confirma todo o nada dentro de la misma transacción | Si falta stock de un ingrediente de una mezcla, se revierte toda la venta, igual que si faltara stock de un producto |
| Testing | Verificación manual (el backend no tiene test runner) | Igual que se hizo para la impresión térmica — se agrega un checklist al plan |

---

## Cambios de esquema

```sql
-- mezcla: precio de venta manual, igual que producto
ALTER TABLE `mezcla`
  ADD COLUMN `precio_mayor` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `descripcion`,
  ADD COLUMN `precio_menor` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `precio_mayor`;

-- detalle_venta: una línea es O producto O mezcla, nunca ambos
ALTER TABLE `detalle_venta`
  MODIFY `id_producto` INT(11) NULL,
  ADD COLUMN `id_mezcla` INT(11) NULL AFTER `id_producto`,
  ADD COLUMN `id_aplicacion` INT(11) NULL AFTER `id_mezcla`,
  ADD CONSTRAINT `fk_dv_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  ADD CONSTRAINT `fk_dv_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla` (`id_aplicacion`);
  -- Nota de implementación: si el motor de BD soporta CHECK (MariaDB 10.2+),
  -- agregar también:
  -- ADD CONSTRAINT `chk_dv_tipo_linea` CHECK (
  --   (id_producto IS NOT NULL AND id_mezcla IS NULL) OR
  --   (id_producto IS NULL AND id_mezcla IS NOT NULL)
  -- );
  -- Si no lo soporta, esta regla se valida solo en el backend (aplicarMezclaTx / _insertarVentaFIFO).

-- aplicacion_mezcla: trazabilidad de origen y estado
ALTER TABLE `aplicacion_mezcla`
  ADD COLUMN `id_venta` INT(11) NULL AFTER `id_usuario`,
  ADD COLUMN `anulada` TINYINT(1) NOT NULL DEFAULT 0 AFTER `observaciones`,
  ADD CONSTRAINT `fk_am_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);
```

---

## Arquitectura

### Backend

**`mezclas.Controller.js`** — se extrae de `aplicarMezcla` una función interna sin HTTP:

```js
async function aplicarMezclaTx(conn, { id_mezcla, id_empresa, id_sucursal, id_usuario, cantidad_tandas, observaciones, id_venta = null })
// devuelve { id_aplicacion, mezcla, stockInsuficiente: [] } o lanza Error si falta stock
```

El endpoint HTTP `aplicarMezcla` pasa a ser un wrapper delgado: abre su propia conexión/transacción, llama a `aplicarMezclaTx`, hace commit/rollback y responde. La única diferencia funcional es el nuevo parámetro opcional `id_venta`, que se guarda en `aplicacion_mezcla.id_venta` (queda `NULL` cuando se usa desde el botón "Aplicar").

**`ventas.Controller.js`**:
- `listarProductosPOS`: además de los productos con stock, se agregan las mezclas activas de la empresa (`SELECT id_mezcla, nombre, precio_mayor, precio_menor FROM mezcla WHERE id_empresa = ? AND activo = 1`), cada fila con `tipo: 'MEZCLA'`; los productos existentes se marcan `tipo: 'PRODUCTO'`.
- `_insertarVentaFIFO`: el array `detalles` admite ahora líneas con `tipo: 'MEZCLA'` (`{ tipo: 'MEZCLA', id_mezcla, cantidad_tandas, precio_unitario, subtotal }`), separadas de las líneas de producto existentes (que no llevan `tipo` o llevan `tipo: 'PRODUCTO'`, por compatibilidad con lo ya construido). Para cada línea de mezcla: llama a `aplicarMezclaTx(connection, {..., id_venta})` (misma conexión/transacción de la venta) e inserta la fila de `detalle_venta` correspondiente (`id_producto: null, id_mezcla, id_aplicacion, cantidad: cantidad_tandas, precio_unitario, subtotal`).
- `anular`: por cada `detalle_venta`, si `id_mezcla` está presente en vez de `id_producto`, se buscan las filas de `aplicacion_mezcla_detalle` de `id_aplicacion`, se devuelve `cantidad_descontada` a cada `id_lote` (con su `movimiento_almacen` de reingreso), y se marca `aplicacion_mezcla.anulada = 1`.
- `obtener` (detalle de venta): el `JOIN` de `detalle_venta` se cambia a `LEFT JOIN producto` y se agrega `LEFT JOIN mezcla ON d.id_mezcla = m.id_mezcla` para traer `mezcla_nombre`.

### Frontend

**`NuevaVenta.jsx`**: la grilla/búsqueda de productos del POS incluye las mezclas activas (badge 🧪). Al agregar una mezcla al carrito: cantidad = tandas (decimal, sin selector caja/fracción), precio tomado de `precio_mayor`/`precio_menor` según `tipo_venta`, igual que los productos. El payload hacia `POST /api/ventas` incluye las líneas de mezcla con su forma propia (`tipo: 'MEZCLA', id_mezcla, cantidad_tandas, precio_unitario, subtotal`).

**Pantalla de Mezclas** (`mezclas.service.js` / formulario de mezcla): se agregan los campos `precio_mayor` y `precio_menor` al crear/editar, igual que Productos.

**`VentaTicket.jsx`** y **`frontend/src/lib/printing/ticketBuilder.js`**: cuando una línea de `detalle` trae `id_mezcla`, se muestra `mezcla_nombre` y "X tanda(s)" en vez de `producto_nombre` y "cj/un".

---

## Manejo de errores

Si falta stock de algún ingrediente al vender una mezcla, `aplicarMezclaTx` lanza el mismo error de stock insuficiente que ya usa "Aplicar"; al estar dentro de la transacción de `_insertarVentaFIFO`, esto revierte la venta completa (no se cobra ni se descuenta nada parcialmente), y el frontend lo muestra con el mismo mecanismo de error que ya usa para stock insuficiente de productos.

---

## Testing

Sin test runner en el backend — verificación manual, con un checklist en el plan de implementación:
- Vender una mezcla sola desde el POS (efectivo, crédito y QR) y confirmar que descuenta los ingredientes correctos.
- Vender un carrito mixto (productos + mezclas) y confirmar que todo se cobra/descuenta atómicamente.
- Forzar stock insuficiente de un ingrediente y confirmar que no se cobra nada.
- Anular una venta con una línea de mezcla y confirmar que el stock de los ingredientes se restituye y `aplicacion_mezcla.anulada = 1`.
- Confirmar que el ticket normal y el térmico muestran la línea de mezcla correctamente (nombre + tandas).
- Confirmar que el botón "Aplicar" interno sigue funcionando sin generar ninguna venta.

---

## Fuera de alcance

- Cálculo automático de precio de mezcla a partir de sus ingredientes (se descartó — precio manual).
- Edición/reversión parcial de una venta con mezclas (la anulación es de la venta completa, no de líneas individuales).
- Pestaña o vista separada de "Mezclas" en el POS (se descartó — mismo listado que productos).
