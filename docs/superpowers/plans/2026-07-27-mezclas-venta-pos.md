# Venta de mezclas desde el POS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir vender mezclas desde el POS (Nueva Venta), cobrándolas con el mismo motor de ventas (caja, crédito, QR) que los productos, mientras se sigue descontando el stock de sus ingredientes vía FEFO, y sin tocar el flujo interno "Aplicar" que ya existe.

**Architecture:** Se extrae la lógica de descuento FEFO de `aplicarMezcla` a una función compartida sin HTTP (`aplicarMezclaTx`), que tanto el endpoint "Aplicar" como el motor de ventas (`_insertarVentaFIFO`) llaman dentro de su propia transacción. `detalle_venta` gana columnas nullable `id_mezcla`/`id_aplicacion` (y `id_producto` pasa a nullable) para representar una línea de venta que es una mezcla en vez de un producto de un lote.

**Tech Stack:** Node.js/Express + MySQL2 (backend, sin test runner — verificación manual), React 19 + Vite (frontend, con Vitest ya configurado solo para `frontend/src/lib/printing/`).

## Global Constraints

- Precio de mezcla: manual, fijo por mezcla (`precio_mayor` / `precio_menor`, igual que `producto`), nunca calculado automáticamente de los ingredientes.
- Una fila de `detalle_venta` es **o** un producto **o** una mezcla, nunca ambos (`id_producto` XOR `id_mezcla`).
- El botón "Aplicar" interno de la pantalla de Mezclas no cambia de comportamiento visible para el usuario.
- Cantidad de una línea de mezcla en el carrito = "tandas" (decimal), sin `tipo_cantidad` CAJA/UNIDAD ni fraccionamiento.
- Un carrito mixto (productos + mezclas) se confirma todo o nada dentro de la misma transacción de la venta.
- Las mezclas aparecen en el mismo listado/grilla de productos del POS (no hay pestaña separada).
- Al anular una venta con líneas de mezcla, se restituye el stock de los ingredientes consumidos y se marca `aplicacion_mezcla.anulada = 1`.

---

## Task 1: Migración de base de datos

**Files:**
- Create: `bd/migracion_mezclas_venta.sql`

**Interfaces:**
- Produces: columnas `mezcla.precio_mayor`, `mezcla.precio_menor`; `detalle_venta.id_producto` (ahora nullable), `detalle_venta.id_mezcla`, `detalle_venta.id_aplicacion`; `aplicacion_mezcla.id_venta`, `aplicacion_mezcla.anulada`. Estas columnas son consumidas por las Tareas 2 y 3.

- [ ] **Step 1: Crear el script de migración**

```sql
-- bd/migracion_mezclas_venta.sql
-- ============================================================
--  MIGRACIÓN: Venta de mezclas desde el POS
--  SIS-AGRO — Multi-sucursal
--  Agrega precio a las mezclas y permite que una línea de
--  detalle_venta represente una mezcla en vez de un producto.
-- ============================================================

-- 1. Precio manual de venta para la mezcla (igual que producto)
ALTER TABLE `mezcla`
  ADD COLUMN `precio_mayor` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `descripcion`,
  ADD COLUMN `precio_menor` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `precio_mayor`;

-- 2. detalle_venta: una línea es O producto O mezcla, nunca ambos
ALTER TABLE `detalle_venta`
  MODIFY `id_producto` INT(11) NULL,
  ADD COLUMN `id_mezcla` INT(11) NULL AFTER `id_producto`,
  ADD COLUMN `id_aplicacion` INT(11) NULL AFTER `id_mezcla`;

ALTER TABLE `detalle_venta`
  ADD KEY `fk_dv_mezcla` (`id_mezcla`),
  ADD KEY `fk_dv_aplicacion` (`id_aplicacion`);

ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `fk_dv_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  ADD CONSTRAINT `fk_dv_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla` (`id_aplicacion`);

-- 3. aplicacion_mezcla: trazabilidad de origen (venta vs. uso interno) y anulación
ALTER TABLE `aplicacion_mezcla`
  ADD COLUMN `id_venta` INT(11) NULL AFTER `id_usuario`,
  ADD COLUMN `anulada` TINYINT(1) NOT NULL DEFAULT 0 AFTER `observaciones`;

ALTER TABLE `aplicacion_mezcla`
  ADD KEY `fk_am_venta` (`id_venta`);

ALTER TABLE `aplicacion_mezcla`
  ADD CONSTRAINT `fk_am_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);
```

- [ ] **Step 2: Ejecutar la migración contra la base de datos de desarrollo**

Run (ajusta usuario/host/nombre de BD según tu entorno):
```bash
mysql -u root -p sis_agro < bd/migracion_mezclas_venta.sql
```
Expected: sin errores. Si el motor de BD no soporta `MODIFY COLUMN` con foreign keys existentes apuntando a `id_producto`, revisar que no haya una FK previa sobre `detalle_venta.id_producto` que bloquee el cambio a nullable (no la hay en el esquema actual — `detalle_venta` no tiene FKs declaradas, solo índices lógicos).

- [ ] **Step 3: Verificar el resultado**

Run:
```bash
mysql -u root -p sis_agro -e "DESCRIBE mezcla; DESCRIBE detalle_venta; DESCRIBE aplicacion_mezcla;"
```
Expected: `mezcla` muestra `precio_mayor`/`precio_menor`; `detalle_venta` muestra `id_producto` como `YES` en la columna `Null`, más `id_mezcla`/`id_aplicacion`; `aplicacion_mezcla` muestra `id_venta`/`anulada`.

- [ ] **Step 4: Commit**

```bash
git add bd/migracion_mezclas_venta.sql
git commit -m "feat(db): add mezcla pricing and detalle_venta/aplicacion_mezcla linking for POS sales"
```

---

## Task 2: `aplicarMezclaTx` compartido + precio en `mezclas.Controller.js`

Extrae la lógica de descuento FEFO de `aplicarMezcla` a una función reutilizable sin HTTP, y agrega los campos de precio al crear/editar/listar mezclas.

**Files:**
- Modify: `backend/controllers/mezclas.Controller.js`

**Interfaces:**
- Consumes: columnas de la Tarea 1 (`mezcla.precio_mayor/precio_menor`, `aplicacion_mezcla.id_venta/anulada`).
- Produces:
  - `aplicarMezclaTx(conn, { id_mezcla, id_empresa, id_sucursal, id_usuario, cantidad_tandas, observaciones?, id_venta? }): Promise<{ id_aplicacion: number, mezcla: object }>` — usada por la Tarea 3 (`ventas.Controller.js`). Lanza un `Error` con `.status` (404 o 400) y, para stock insuficiente, `.detalle` (array de strings).
  - `module.exports.aplicarMezclaTx` agregado al export existente.

- [ ] **Step 1: Reemplazar el bloque de `aplicarMezcla` (líneas 169-297) por la versión extraída**

Reemplaza este bloque completo:

```js
// ── Aplicar mezcla — descuenta stock de la sucursal del usuario ───────────
const aplicarMezcla = async (req, res) => {
  const id_empresa  = req.user.id_empresa;
  const id_usuario  = req.user.id_usuario;
  const id_sucursal = req.user.id_sucursal;
  const { id }      = req.params;
  const { cantidad_tandas = 1, observaciones } = req.body;

  if (!id_sucursal)
    return res.status(400).json({ error: 'Tu usuario no tiene sucursal asignada' });

  const tandas = parseFloat(cantidad_tandas);
  if (isNaN(tandas) || tandas <= 0)
    return res.status(400).json({ error: 'La cantidad de tandas debe ser mayor a 0' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    // Verificar mezcla activa y de la misma empresa
    const [[mezcla]] = await conn.query(
      `SELECT m.* FROM mezcla m
       JOIN empresa e ON m.id_empresa = e.id_empresa
       WHERE m.id_mezcla = ? AND m.id_empresa = ? AND m.activo = 1`,
      [id, id_empresa]
    );
    if (!mezcla) {
      await conn.rollback();
      return res.status(404).json({ error: 'Mezcla no encontrada o inactiva' });
    }

    const [ingredientes] = await conn.query(
      `SELECT mi.*, p.nombre AS producto_nombre, u.abreviatura AS unidad_abr
       FROM mezcla_ingrediente mi
       JOIN producto p ON mi.id_producto = p.id_producto
       JOIN unidad_medida u ON mi.id_unidad = u.id_unidad
       WHERE mi.id_mezcla = ?`,
      [id]
    );
    if (ingredientes.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'La mezcla no tiene ingredientes definidos' });
    }

    // Crear cabecera de aplicacion_mezcla primero para obtener el ID
    const [apRes] = await conn.query(
      `INSERT INTO aplicacion_mezcla (id_mezcla, id_sucursal, id_usuario, cantidad_tandas, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [id, id_sucursal, id_usuario, tandas, observaciones || null]
    );
    const id_aplicacion = apRes.insertId;

    const stockInsuficiente = [];

    // Procesar cada ingrediente con lógica FEFO (First Expired First Out)
    for (const ing of ingredientes) {
      const totalNecesario = parseFloat(ing.cantidad) * tandas;

      // Lotes de ESTA sucursal, con stock, ordenados por vencimiento más próximo
      const [lotes] = await conn.query(
        `SELECT l.id_lote, l.stock_unidades, l.fecha_vencimiento
         FROM lote l
         WHERE l.id_producto = ? AND l.id_sucursal = ? AND l.stock_unidades > 0 AND l.activo = 1
         ORDER BY l.fecha_vencimiento ASC, l.id_lote ASC
         FOR UPDATE`,
        [ing.id_producto, id_sucursal]
      );

      const disponible = lotes.reduce((acc, l) => acc + parseFloat(l.stock_unidades), 0);
      if (disponible < totalNecesario) {
        stockInsuficiente.push(
          `${ing.producto_nombre}: necesario ${totalNecesario} ${ing.unidad_abr}, disponible ${disponible} ${ing.unidad_abr}`
        );
        continue;
      }

      let restante = totalNecesario;
      for (const lote of lotes) {
        if (restante <= 0) break;
        const descontar = Math.min(restante, parseFloat(lote.stock_unidades));
        restante -= descontar;

        // Actualizar stock del lote
        await conn.query(
          `UPDATE lote SET stock_unidades = stock_unidades - ? WHERE id_lote = ?`,
          [descontar, lote.id_lote]
        );

        // Registrar en kardex (movimiento_almacen)
        const [movRes] = await conn.query(
          `INSERT INTO movimiento_almacen
            (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_unidades,
             referencia_id, referencia_tipo, observaciones)
           VALUES (?, ?, ?, 'SALIDA', 'MEZCLA', ?, ?, 'MEZCLA', ?)`,
          [lote.id_lote, id_sucursal, id_usuario, descontar,
           id_aplicacion, `Mezcla: ${mezcla.nombre}`]
        );

        // Detalle de la aplicación
        await conn.query(
          `INSERT INTO aplicacion_mezcla_detalle
            (id_aplicacion, id_lote, id_producto, cantidad_descontada, id_unidad, id_movimiento_almacen)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id_aplicacion, lote.id_lote, ing.id_producto, descontar, ing.id_unidad, movRes.insertId]
        );
      }
    }

    if (stockInsuficiente.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: 'Stock insuficiente en esta sucursal',
        detalle: stockInsuficiente,
      });
    }

    await conn.commit();
    return res.status(201).json({
      id_aplicacion,
      mensaje: `Mezcla aplicada correctamente (${tandas} tanda${tandas !== 1 ? 's' : ''})`,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[aplicarMezcla]', err);
    return res.status(500).json({ error: 'Error al aplicar la mezcla' });
  } finally {
    conn.release();
  }
};
```

con esta versión, que separa la lógica de negocio (`aplicarMezclaTx`) del endpoint HTTP (`aplicarMezcla`):

```js
// ── Error tipado para stock insuficiente (usado por aplicarMezclaTx) ──────
class StockInsuficienteError extends Error {
  constructor(detalle) {
    super(`Stock insuficiente en esta sucursal: ${detalle.join('; ')}`);
    this.name = 'StockInsuficienteError';
    this.status = 400;
    this.detalle = detalle;
  }
}

// ── Lógica compartida: descuenta ingredientes de una mezcla vía FEFO ──────
// Sin HTTP — la usan tanto el endpoint "Aplicar" como el motor de ventas.
// Debe ejecutarse dentro de una transacción abierta por quien la llama.
async function aplicarMezclaTx(conn, {
  id_mezcla, id_empresa, id_sucursal, id_usuario,
  cantidad_tandas, observaciones = null, id_venta = null,
}) {
  // Verificar mezcla activa y de la misma empresa
  const [[mezcla]] = await conn.query(
    `SELECT m.* FROM mezcla m
     JOIN empresa e ON m.id_empresa = e.id_empresa
     WHERE m.id_mezcla = ? AND m.id_empresa = ? AND m.activo = 1`,
    [id_mezcla, id_empresa]
  );
  if (!mezcla) {
    throw Object.assign(new Error('Mezcla no encontrada o inactiva'), { status: 404 });
  }

  const [ingredientes] = await conn.query(
    `SELECT mi.*, p.nombre AS producto_nombre, u.abreviatura AS unidad_abr
     FROM mezcla_ingrediente mi
     JOIN producto p ON mi.id_producto = p.id_producto
     JOIN unidad_medida u ON mi.id_unidad = u.id_unidad
     WHERE mi.id_mezcla = ?`,
    [id_mezcla]
  );
  if (ingredientes.length === 0) {
    throw Object.assign(new Error('La mezcla no tiene ingredientes definidos'), { status: 400 });
  }

  // Crear cabecera de aplicacion_mezcla primero para obtener el ID
  const [apRes] = await conn.query(
    `INSERT INTO aplicacion_mezcla (id_mezcla, id_sucursal, id_usuario, id_venta, cantidad_tandas, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_mezcla, id_sucursal, id_usuario, id_venta, cantidad_tandas, observaciones]
  );
  const id_aplicacion = apRes.insertId;

  const stockInsuficiente = [];

  // Procesar cada ingrediente con lógica FEFO (First Expired First Out)
  for (const ing of ingredientes) {
    const totalNecesario = parseFloat(ing.cantidad) * cantidad_tandas;

    const [lotes] = await conn.query(
      `SELECT l.id_lote, l.stock_unidades, l.fecha_vencimiento
       FROM lote l
       WHERE l.id_producto = ? AND l.id_sucursal = ? AND l.stock_unidades > 0 AND l.activo = 1
       ORDER BY l.fecha_vencimiento ASC, l.id_lote ASC
       FOR UPDATE`,
      [ing.id_producto, id_sucursal]
    );

    const disponible = lotes.reduce((acc, l) => acc + parseFloat(l.stock_unidades), 0);
    if (disponible < totalNecesario) {
      stockInsuficiente.push(
        `${ing.producto_nombre}: necesario ${totalNecesario} ${ing.unidad_abr}, disponible ${disponible} ${ing.unidad_abr}`
      );
      continue;
    }

    let restante = totalNecesario;
    for (const lote of lotes) {
      if (restante <= 0) break;
      const descontar = Math.min(restante, parseFloat(lote.stock_unidades));
      restante -= descontar;

      await conn.query(
        `UPDATE lote SET stock_unidades = stock_unidades - ? WHERE id_lote = ?`,
        [descontar, lote.id_lote]
      );

      const [movRes] = await conn.query(
        `INSERT INTO movimiento_almacen
          (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_unidades,
           referencia_id, referencia_tipo, observaciones)
         VALUES (?, ?, ?, 'SALIDA', 'MEZCLA', ?, ?, 'MEZCLA', ?)`,
        [lote.id_lote, id_sucursal, id_usuario, descontar,
         id_aplicacion, `Mezcla: ${mezcla.nombre}`]
      );

      await conn.query(
        `INSERT INTO aplicacion_mezcla_detalle
          (id_aplicacion, id_lote, id_producto, cantidad_descontada, id_unidad, id_movimiento_almacen)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_aplicacion, lote.id_lote, ing.id_producto, descontar, ing.id_unidad, movRes.insertId]
      );
    }
  }

  if (stockInsuficiente.length > 0) {
    throw new StockInsuficienteError(stockInsuficiente);
  }

  return { id_aplicacion, mezcla };
}

// ── Aplicar mezcla (HTTP) — descuenta stock de la sucursal del usuario ────
const aplicarMezcla = async (req, res) => {
  const id_empresa  = req.user.id_empresa;
  const id_usuario  = req.user.id_usuario;
  const id_sucursal = req.user.id_sucursal;
  const { id }      = req.params;
  const { cantidad_tandas = 1, observaciones } = req.body;

  if (!id_sucursal)
    return res.status(400).json({ error: 'Tu usuario no tiene sucursal asignada' });

  const tandas = parseFloat(cantidad_tandas);
  if (isNaN(tandas) || tandas <= 0)
    return res.status(400).json({ error: 'La cantidad de tandas debe ser mayor a 0' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const { id_aplicacion } = await aplicarMezclaTx(conn, {
      id_mezcla: id, id_empresa, id_sucursal, id_usuario,
      cantidad_tandas: tandas, observaciones: observaciones || null,
    });

    await conn.commit();
    return res.status(201).json({
      id_aplicacion,
      mensaje: `Mezcla aplicada correctamente (${tandas} tanda${tandas !== 1 ? 's' : ''})`,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[aplicarMezcla]', err);
    const status = err.status || 500;
    const body = { error: err.message || 'Error al aplicar la mezcla' };
    if (err.detalle) body.detalle = err.detalle;
    return res.status(status).json(body);
  } finally {
    conn.release();
  }
};
```

- [ ] **Step 2: Agregar precio a `crearMezcla`**

Reemplaza:

```js
// ── Crear mezcla con ingredientes ─────────────────────────────────────────
const crearMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, descripcion, ingredientes } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!Array.isArray(ingredientes) || ingredientes.length === 0)
    return res.status(400).json({ error: 'Debe agregar al menos un ingrediente' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO mezcla (id_empresa, nombre, descripcion) VALUES (?, ?, ?)`,
      [id_empresa, nombre.trim(), descripcion?.trim() || null]
    );
    const id_mezcla = r.insertId;
```

con:

```js
// ── Crear mezcla con ingredientes ─────────────────────────────────────────
const crearMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { nombre, descripcion, ingredientes, precio_mayor, precio_menor } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!Array.isArray(ingredientes) || ingredientes.length === 0)
    return res.status(400).json({ error: 'Debe agregar al menos un ingrediente' });
  const precioMayorNum = parseFloat(precio_mayor) || 0;
  const precioMenorNum = parseFloat(precio_menor) || 0;
  if (precioMayorNum < 0 || precioMenorNum < 0)
    return res.status(400).json({ error: 'Los precios no pueden ser negativos' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO mezcla (id_empresa, nombre, descripcion, precio_mayor, precio_menor) VALUES (?, ?, ?, ?, ?)`,
      [id_empresa, nombre.trim(), descripcion?.trim() || null, precioMayorNum, precioMenorNum]
    );
    const id_mezcla = r.insertId;
```

(el resto de `crearMezcla` —el bucle de ingredientes, el `catch`— no cambia.)

- [ ] **Step 3: Agregar precio a `editarMezcla`**

Reemplaza:

```js
// ── Editar mezcla e ingredientes ──────────────────────────────────────────
const editarMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, descripcion, ingredientes } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!Array.isArray(ingredientes) || ingredientes.length === 0)
    return res.status(400).json({ error: 'Debe agregar al menos un ingrediente' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [[existe]] = await conn.query(
      `SELECT id_mezcla FROM mezcla WHERE id_mezcla = ? AND id_empresa = ?`,
      [id, id_empresa]
    );
    if (!existe) { await conn.rollback(); return res.status(404).json({ error: 'Mezcla no encontrada' }); }

    await conn.query(
      `UPDATE mezcla SET nombre = ?, descripcion = ? WHERE id_mezcla = ?`,
      [nombre.trim(), descripcion?.trim() || null, id]
    );
```

con:

```js
// ── Editar mezcla e ingredientes ──────────────────────────────────────────
const editarMezcla = async (req, res) => {
  const id_empresa = req.user.id_empresa;
  const { id } = req.params;
  const { nombre, descripcion, ingredientes, precio_mayor, precio_menor } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!Array.isArray(ingredientes) || ingredientes.length === 0)
    return res.status(400).json({ error: 'Debe agregar al menos un ingrediente' });
  const precioMayorNum = parseFloat(precio_mayor) || 0;
  const precioMenorNum = parseFloat(precio_menor) || 0;
  if (precioMayorNum < 0 || precioMenorNum < 0)
    return res.status(400).json({ error: 'Los precios no pueden ser negativos' });

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [[existe]] = await conn.query(
      `SELECT id_mezcla FROM mezcla WHERE id_mezcla = ? AND id_empresa = ?`,
      [id, id_empresa]
    );
    if (!existe) { await conn.rollback(); return res.status(404).json({ error: 'Mezcla no encontrada' }); }

    await conn.query(
      `UPDATE mezcla SET nombre = ?, descripcion = ?, precio_mayor = ?, precio_menor = ? WHERE id_mezcla = ?`,
      [nombre.trim(), descripcion?.trim() || null, precioMayorNum, precioMenorNum, id]
    );
```

(el resto de `editarMezcla` no cambia.)

- [ ] **Step 4: Incluir el precio en `listarMezclas`**

Reemplaza:

```js
    const [mezclas] = await db.promise().query(
      `SELECT m.id_mezcla, m.nombre, m.descripcion, m.activo, m.creado_en,
              COUNT(mi.id_ingrediente) AS total_ingredientes
       FROM mezcla m
       LEFT JOIN mezcla_ingrediente mi ON m.id_mezcla = mi.id_mezcla
       WHERE m.id_empresa = ?
       GROUP BY m.id_mezcla
       ORDER BY m.nombre ASC`,
      [id_empresa]
    );
```

con:

```js
    const [mezclas] = await db.promise().query(
      `SELECT m.id_mezcla, m.nombre, m.descripcion, m.activo, m.creado_en,
              m.precio_mayor, m.precio_menor,
              COUNT(mi.id_ingrediente) AS total_ingredientes
       FROM mezcla m
       LEFT JOIN mezcla_ingrediente mi ON m.id_mezcla = mi.id_mezcla
       WHERE m.id_empresa = ?
       GROUP BY m.id_mezcla
       ORDER BY m.nombre ASC`,
      [id_empresa]
    );
```

(`obtenerMezcla` usa `SELECT * FROM mezcla ...` — ya trae `precio_mayor`/`precio_menor` sin cambios.)

- [ ] **Step 5: Exportar `aplicarMezclaTx`**

Reemplaza:

```js
module.exports = {
  listarMezclas,
  obtenerMezcla,
  crearMezcla,
  editarMezcla,
  toggleMezcla,
  aplicarMezcla,
  listarAplicaciones,
  listarProductosAux,
  listarUnidadesAux,
};
```

con:

```js
module.exports = {
  listarMezclas,
  obtenerMezcla,
  crearMezcla,
  editarMezcla,
  toggleMezcla,
  aplicarMezcla,
  aplicarMezclaTx,
  listarAplicaciones,
  listarProductosAux,
  listarUnidadesAux,
};
```

- [ ] **Step 6: Verificar sintaxis**

Run: `cd backend && node --check controllers/mezclas.Controller.js`
Expected: sin salida (sintaxis válida).

- [ ] **Step 7: Verificación manual**

Con el backend corriendo contra una base ya migrada (Tarea 1): crear una mezcla con precio desde Postman/curl (`POST /api/mezclas` con `precio_mayor`/`precio_menor`), confirmar que `GET /api/mezclas` los devuelve, y que el botón "Aplicar" (endpoint `POST /api/mezclas/:id/aplicar`) sigue funcionando exactamente igual que antes (mismo mensaje de éxito, mismo error 400 con `detalle` si falta stock, mismo 404 si la mezcla no existe).

- [ ] **Step 8: Commit**

```bash
git add backend/controllers/mezclas.Controller.js
git commit -m "refactor(mezclas): extract aplicarMezclaTx and add precio_mayor/precio_menor"
```

---

## Task 3: Integrar mezclas en `ventas.Controller.js`

**Files:**
- Modify: `backend/controllers/ventas.Controller.js`

**Interfaces:**
- Consumes: `aplicarMezclaTx(conn, { id_mezcla, id_empresa, id_sucursal, id_usuario, cantidad_tandas, observaciones?, id_venta? })` de la Tarea 2 (`../controllers/mezclas.Controller` — mismo directorio, `require('./mezclas.Controller')`).
- Produces: `POST /api/ventas` y `POST /api/ventas/checkout-qr` aceptan líneas de `detalles` con `{ tipo: 'MEZCLA', id_mezcla, cantidad_tandas, precio_unitario, subtotal, descuento_pct?, descuento_monto? }` junto a las líneas de producto existentes (sin `tipo`, sin cambios). `GET /api/ventas/pos-productos` devuelve también mezclas activas con `tipo: 'MEZCLA'`. Usado por la Tarea 5 (frontend `NuevaVenta.jsx`).

- [ ] **Step 1: Importar `aplicarMezclaTx`**

Al inicio de `backend/controllers/ventas.Controller.js`, reemplaza:

```js
const db = require('../config/db');
const { generarOrderId, generarQR, consultarEstadoQR } = require('../services/codepay.service');
```

con:

```js
const db = require('../config/db');
const { generarOrderId, generarQR, consultarEstadoQR } = require('../services/codepay.service');
const { aplicarMezclaTx } = require('./mezclas.Controller');
```

- [ ] **Step 2: Separar líneas de producto y de mezcla en `_insertarVentaFIFO`, y agregar `id_empresa` al parámetro**

Reemplaza:

```js
async function _insertarVentaFIFO(connection, {
  id_sucursal, id_usuario, id_cliente, nro_factura, tipo_venta,
  subtotal, descuento_total, total, monto_pagado, cambio,
  metodo_pago, observaciones, detalles,
  estado, codepay_order_id,
  fecha_vencimiento_credito,
}) {
  // 0. Pre-fetch factores de conversión para ítems fraccionados
  const conversionIds = [...new Set(detalles.filter(d => d.id_conversion).map(d => d.id_conversion))];
  const factoresMap = {};
  if (conversionIds.length > 0) {
    const phs = conversionIds.map(() => '?').join(',');
    const [convRows] = await connection.query(
      `SELECT id_conversion, factor FROM conversion_unidad WHERE id_conversion IN (${phs})`,
      conversionIds
    );
    for (const c of convRows) factoresMap[c.id_conversion] = parseFloat(c.factor);
  }

  // 1. Validar y acumular requerimientos por producto
  const requerimientos = {};
  for (const item of detalles) {
```

con:

```js
async function _insertarVentaFIFO(connection, {
  id_empresa, id_sucursal, id_usuario, id_cliente, nro_factura, tipo_venta,
  subtotal, descuento_total, total, monto_pagado, cambio,
  metodo_pago, observaciones, detalles,
  estado, codepay_order_id,
  fecha_vencimiento_credito,
}) {
  // Separar líneas de producto (motor FIFO existente) de líneas de mezcla
  // (usan aplicarMezclaTx, que descuenta varios productos/lotes a la vez).
  const detallesProducto = detalles.filter(d => d.tipo !== 'MEZCLA');
  const detallesMezcla    = detalles.filter(d => d.tipo === 'MEZCLA');

  // 0. Pre-fetch factores de conversión para ítems fraccionados
  const conversionIds = [...new Set(detallesProducto.filter(d => d.id_conversion).map(d => d.id_conversion))];
  const factoresMap = {};
  if (conversionIds.length > 0) {
    const phs = conversionIds.map(() => '?').join(',');
    const [convRows] = await connection.query(
      `SELECT id_conversion, factor FROM conversion_unidad WHERE id_conversion IN (${phs})`,
      conversionIds
    );
    for (const c of convRows) factoresMap[c.id_conversion] = parseFloat(c.factor);
  }

  // 1. Validar y acumular requerimientos por producto
  const requerimientos = {};
  for (const item of detallesProducto) {
```

- [ ] **Step 3: Procesar las líneas de mezcla después del FIFO de productos, antes de devolver `id_venta`**

Reemplaza el final de la función:

```js
        if (loteActual.stock_unidades === 0) indexLote++;
      }
    }
  }

  return id_venta;
}
```

con:

```js
        if (loteActual.stock_unidades === 0) indexLote++;
      }
    }
  }

  // 4. Procesar líneas de mezcla — descuenta ingredientes vía aplicarMezclaTx
  //    (misma transacción: si falta stock de un ingrediente, se revierte toda la venta)
  for (const item of detallesMezcla) {
    const { id_aplicacion } = await aplicarMezclaTx(connection, {
      id_mezcla:       item.id_mezcla,
      id_empresa,
      id_sucursal,
      id_usuario,
      cantidad_tandas: parseFloat(item.cantidad_tandas),
      id_venta,
    });

    await connection.query(
      `INSERT INTO detalle_venta
        (id_venta, id_producto, id_mezcla, id_aplicacion, cantidad, precio_unitario, descuento_pct, descuento_monto, subtotal)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_venta, item.id_mezcla, id_aplicacion,
        parseFloat(item.cantidad_tandas), parseFloat(item.precio_unitario),
        parseFloat(item.descuento_pct || 0), parseFloat(item.descuento_monto || 0),
        parseFloat(item.subtotal),
      ]
    );
  }

  return id_venta;
}
```

- [ ] **Step 4: Pasar `id_empresa` en los dos call sites de `_insertarVentaFIFO`**

En `crear` (dentro del `try`), reemplaza:

```js
    const id_venta = await _insertarVentaFIFO(connection, {
      id_sucursal:  req.user.id_sucursal,
      id_usuario:   req.user.id_usuario,
      id_cliente, nro_factura, tipo_venta, subtotal,
      descuento_total, total, monto_pagado, cambio,
      metodo_pago, observaciones, detalles,
      fecha_vencimiento_credito,
      estado:             'COMPLETADA',
      codepay_order_id:   null,
    });
```

con:

```js
    const id_venta = await _insertarVentaFIFO(connection, {
      id_empresa:   req.user.id_empresa,
      id_sucursal:  req.user.id_sucursal,
      id_usuario:   req.user.id_usuario,
      id_cliente, nro_factura, tipo_venta, subtotal,
      descuento_total, total, monto_pagado, cambio,
      metodo_pago, observaciones, detalles,
      fecha_vencimiento_credito,
      estado:             'COMPLETADA',
      codepay_order_id:   null,
    });
```

En `iniciarPagoQR`, reemplaza:

```js
    const id_venta = await _insertarVentaFIFO(connection, {
      id_sucursal, id_usuario,
      id_cliente, nro_factura, tipo_venta, subtotal,
      descuento_total, total,
      monto_pagado: parseFloat(total),
      cambio: 0,
      metodo_pago: 'QR',
      observaciones, detalles,
      estado:           'PENDIENTE',
      codepay_order_id: order_id,
    });
```

con:

```js
    const id_venta = await _insertarVentaFIFO(connection, {
      id_empresa: req.user.id_empresa,
      id_sucursal, id_usuario,
      id_cliente, nro_factura, tipo_venta, subtotal,
      descuento_total, total,
      monto_pagado: parseFloat(total),
      cambio: 0,
      metodo_pago: 'QR',
      observaciones, detalles,
      estado:           'PENDIENTE',
      codepay_order_id: order_id,
    });
```

- [ ] **Step 5: `obtener` — traer el nombre de la mezcla en el detalle**

Reemplaza:

```js
    const [detalleRows] = await db.promise().query(
      `SELECT d.*, p.nombre as producto_nombre, l.numero_lote
       FROM detalle_venta d
       JOIN producto p ON d.id_producto = p.id_producto
       LEFT JOIN lote l ON d.id_lote = l.id_lote
       WHERE d.id_venta = ?`,
      [id]
    );
```

con:

```js
    const [detalleRows] = await db.promise().query(
      `SELECT d.*, p.nombre as producto_nombre, l.numero_lote, mz.nombre as mezcla_nombre
       FROM detalle_venta d
       LEFT JOIN producto p ON d.id_producto = p.id_producto
       LEFT JOIN lote l ON d.id_lote = l.id_lote
       LEFT JOIN mezcla mz ON d.id_mezcla = mz.id_mezcla
       WHERE d.id_venta = ?`,
      [id]
    );
```

(el `JOIN producto` pasa a `LEFT JOIN` porque ahora `id_producto` puede ser `NULL` en una línea de mezcla.)

- [ ] **Step 6: `listarProductosPOS` — incluir mezclas activas**

Reemplaza:

```js
// Productos disponibles para el POS — agrupados por producto, stock de la sucursal del usuario
const listarProductosPOS = async (req, res) => {
  const id_sucursal = req.user.id_sucursal;
  try {
    const [rows] = await db.promise().query(
      `SELECT
         p.id_producto,
         p.nombre,
         p.precio_menor,
         p.precio_mayor,
         p.descuento_menor,
         p.descuento_mayor,
         p.permite_fraccion,
         MIN(l.unidades_por_caja) AS unidades_por_caja,
         SUM(l.stock_unidades)   AS stock_unidades_total
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       WHERE l.id_sucursal = ?
         AND l.activo = 1
         AND l.stock_unidades > 0
         AND p.activo = 1
       GROUP BY
         p.id_producto, p.nombre,
         p.precio_menor, p.precio_mayor,
         p.descuento_menor, p.descuento_mayor,
         p.permite_fraccion
       ORDER BY p.nombre ASC`,
      [id_sucursal]
    );
```

con:

```js
// Productos y mezclas disponibles para el POS — de la sucursal/empresa del usuario
const listarProductosPOS = async (req, res) => {
  const id_sucursal = req.user.id_sucursal;
  const id_empresa  = req.user.id_empresa;
  try {
    const [rows] = await db.promise().query(
      `SELECT
         p.id_producto,
         p.nombre,
         p.precio_menor,
         p.precio_mayor,
         p.descuento_menor,
         p.descuento_mayor,
         p.permite_fraccion,
         MIN(l.unidades_por_caja) AS unidades_por_caja,
         SUM(l.stock_unidades)   AS stock_unidades_total
       FROM lote l
       JOIN producto p ON l.id_producto = p.id_producto
       WHERE l.id_sucursal = ?
         AND l.activo = 1
         AND l.stock_unidades > 0
         AND p.activo = 1
       GROUP BY
         p.id_producto, p.nombre,
         p.precio_menor, p.precio_mayor,
         p.descuento_menor, p.descuento_mayor,
         p.permite_fraccion
       ORDER BY p.nombre ASC`,
      [id_sucursal]
    );
```

Luego, reemplaza el final de la función:

```js
    const result = rows.map(p => ({
      ...p,
      fracciones: fraccionesMap[p.id_producto] || [],
    }));

    return res.json(result);
  } catch (err) {
    console.error('[listarProductosPOS]', err);
    return res.status(500).json({ error: 'Error al obtener productos para el POS' });
  }
};
```

con:

```js
    const result = rows.map(p => ({
      ...p,
      tipo:       'PRODUCTO',
      fracciones: fraccionesMap[p.id_producto] || [],
    }));

    // Mezclas activas de la empresa — sin filtrar por stock (se valida al vender,
    // ya que una mezcla consume varios productos/lotes distintos)
    const [mezclas] = await db.promise().query(
      `SELECT id_mezcla, nombre, precio_mayor, precio_menor
       FROM mezcla
       WHERE id_empresa = ? AND activo = 1
       ORDER BY nombre ASC`,
      [id_empresa]
    );
    const mezclasResult = mezclas.map(m => ({
      tipo:         'MEZCLA',
      id_mezcla:    m.id_mezcla,
      nombre:       m.nombre,
      precio_mayor: parseFloat(m.precio_mayor) || 0,
      precio_menor: parseFloat(m.precio_menor) || 0,
    }));

    return res.json([...result, ...mezclasResult]);
  } catch (err) {
    console.error('[listarProductosPOS]', err);
    return res.status(500).json({ error: 'Error al obtener productos para el POS' });
  }
};
```

- [ ] **Step 7: `anular` — revertir ingredientes de las líneas de mezcla**

Reemplaza el cuerpo del `for (const det of detalles)`:

```js
    for (const det of detalles) {
      // Necesitamos las unidades por caja del lote para el recalculo de cajas
      const [loteInfo] = await connection.query('SELECT stock_unidades, unidades_por_caja FROM lote WHERE id_lote = ? FOR UPDATE', [det.id_lote]);
      if (loteInfo.length === 0) continue;

      let unidades_a_devolver = parseFloat(det.cantidad);
      if (det.tipo_cantidad === 'CAJA') {
        unidades_a_devolver = parseFloat(det.cantidad) * loteInfo[0].unidades_por_caja;
      } else if (det.id_conversion && factoresAnularMap[det.id_conversion]) {
        unidades_a_devolver = parseFloat(det.cantidad) / factoresAnularMap[det.id_conversion];
      }

      const nuevoStockUnidades = loteInfo[0].stock_unidades + unidades_a_devolver;
      const nuevoStockCajas = Math.floor(nuevoStockUnidades / loteInfo[0].unidades_por_caja);

      // Actualizar stock del lote
      await connection.query(
        'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
        [nuevoStockUnidades, nuevoStockCajas, det.id_lote]
      );

      // Registrar movimiento de almacén (ENTRADA por Anulación)
      await connection.query(
        `INSERT INTO movimiento_almacen 
          (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
         VALUES (?, ?, ?, 'INGRESO', 'ANULACION DE VENTA', ?, ?, ?, 'ANULACION')`,
        [
          det.id_lote, id_sucursal, id_usuario,
          Math.floor(unidades_a_devolver / loteInfo[0].unidades_por_caja), unidades_a_devolver,
          id
        ]
      );
    }
```

con:

```js
    for (const det of detalles) {
      if (det.id_mezcla) {
        // Línea de mezcla: revertir cada ingrediente consumido por esta aplicación
        const [ingredientesConsumidos] = await connection.query(
          'SELECT id_lote, cantidad_descontada FROM aplicacion_mezcla_detalle WHERE id_aplicacion = ? FOR UPDATE',
          [det.id_aplicacion]
        );

        for (const ing of ingredientesConsumidos) {
          const [loteInfoIng] = await connection.query('SELECT stock_unidades, unidades_por_caja FROM lote WHERE id_lote = ? FOR UPDATE', [ing.id_lote]);
          if (loteInfoIng.length === 0) continue;

          const cantidadDevolver = parseFloat(ing.cantidad_descontada);
          const nuevoStockUnidadesIng = loteInfoIng[0].stock_unidades + cantidadDevolver;
          const nuevoStockCajasIng = Math.floor(nuevoStockUnidadesIng / loteInfoIng[0].unidades_por_caja);

          await connection.query(
            'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
            [nuevoStockUnidadesIng, nuevoStockCajasIng, ing.id_lote]
          );

          await connection.query(
            `INSERT INTO movimiento_almacen
              (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
             VALUES (?, ?, ?, 'INGRESO', 'ANULACION DE VENTA (MEZCLA)', ?, ?, ?, 'ANULACION')`,
            [
              ing.id_lote, id_sucursal, id_usuario,
              Math.floor(cantidadDevolver / loteInfoIng[0].unidades_por_caja), cantidadDevolver,
              id,
            ]
          );
        }

        await connection.query('UPDATE aplicacion_mezcla SET anulada = 1 WHERE id_aplicacion = ?', [det.id_aplicacion]);
        continue;
      }

      // Necesitamos las unidades por caja del lote para el recalculo de cajas
      const [loteInfo] = await connection.query('SELECT stock_unidades, unidades_por_caja FROM lote WHERE id_lote = ? FOR UPDATE', [det.id_lote]);
      if (loteInfo.length === 0) continue;

      let unidades_a_devolver = parseFloat(det.cantidad);
      if (det.tipo_cantidad === 'CAJA') {
        unidades_a_devolver = parseFloat(det.cantidad) * loteInfo[0].unidades_por_caja;
      } else if (det.id_conversion && factoresAnularMap[det.id_conversion]) {
        unidades_a_devolver = parseFloat(det.cantidad) / factoresAnularMap[det.id_conversion];
      }

      const nuevoStockUnidades = loteInfo[0].stock_unidades + unidades_a_devolver;
      const nuevoStockCajas = Math.floor(nuevoStockUnidades / loteInfo[0].unidades_por_caja);

      // Actualizar stock del lote
      await connection.query(
        'UPDATE lote SET stock_unidades = ?, stock_cajas = ? WHERE id_lote = ?',
        [nuevoStockUnidades, nuevoStockCajas, det.id_lote]
      );

      // Registrar movimiento de almacén (ENTRADA por Anulación)
      await connection.query(
        `INSERT INTO movimiento_almacen 
          (id_lote, id_sucursal, id_usuario, tipo, motivo, cantidad_cajas, cantidad_unidades, referencia_id, referencia_tipo)
         VALUES (?, ?, ?, 'INGRESO', 'ANULACION DE VENTA', ?, ?, ?, 'ANULACION')`,
        [
          det.id_lote, id_sucursal, id_usuario,
          Math.floor(unidades_a_devolver / loteInfo[0].unidades_por_caja), unidades_a_devolver,
          id
        ]
      );
    }
```

- [ ] **Step 8: Verificar sintaxis**

Run: `cd backend && node --check controllers/ventas.Controller.js`
Expected: sin salida (sintaxis válida).

- [ ] **Step 9: Verificación manual**

Con el backend corriendo contra una base ya migrada (Tareas 1 y 2), y una mezcla con precio ya creada:
1. `GET /api/ventas/pos-productos` debe incluir la mezcla con `tipo: 'MEZCLA'`.
2. `POST /api/ventas` con un carrito que incluya una línea `{ tipo: 'MEZCLA', id_mezcla, cantidad_tandas: 1, precio_unitario: X, subtotal: X }` junto a un producto normal: debe crear la venta, descontar el stock de los ingredientes de la mezcla (verificar en `lote`) y de los productos normales, y `GET /api/ventas/:id` debe devolver la línea de mezcla con `mezcla_nombre`.
3. Repetir con `cantidad_tandas` que exceda el stock de algún ingrediente: la venta completa debe fallar (nada se cobra, nada se descuenta).
4. `PATCH /api/ventas/:id/anular` sobre la venta con mezcla: el stock de los ingredientes debe volver a su valor original y `aplicacion_mezcla.anulada` debe quedar en 1.

- [ ] **Step 10: Commit**

```bash
git add backend/controllers/ventas.Controller.js
git commit -m "feat(ventas): sell mezclas through the POS sales engine"
```

---

## Task 4: Precio de mezcla en el formulario (`Mezclas.jsx`)

**Files:**
- Modify: `frontend/src/pages/mezclas/Mezclas.jsx`

**Interfaces:**
- Consumes: `mezclaService.crear`/`mezclaService.editar` (sin cambios de firma — ya aceptan cualquier objeto como `payload`), campos `precio_mayor`/`precio_menor` de la Tarea 2.

- [ ] **Step 1: Agregar estado de precios a `ModalMezcla`**

Reemplaza:

```js
function ModalMezcla({ abierto, mezcla, productos, unidades, onGuardar, onCerrar }) {
  const [nombre, setNombre]       = useState('');
  const [descripcion, setDesc]    = useState('');
  const [ingredientes, setIngs]   = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!abierto) return;
    setNombre(mezcla?.nombre || '');
    setDesc(mezcla?.descripcion || '');
    setIngs(mezcla?.ingredientes?.map(i => ({
      id_producto: String(i.id_producto),
      cantidad:    String(i.cantidad),
      id_unidad:   String(i.id_unidad),
      observaciones: i.observaciones || '',
    })) || [{ id_producto: '', cantidad: '', id_unidad: '', observaciones: '' }]);
    setError(null);
  }, [abierto, mezcla]);
```

con:

```js
function ModalMezcla({ abierto, mezcla, productos, unidades, onGuardar, onCerrar }) {
  const [nombre, setNombre]       = useState('');
  const [descripcion, setDesc]    = useState('');
  const [precioMayor, setPrecioMayor] = useState('');
  const [precioMenor, setPrecioMenor] = useState('');
  const [ingredientes, setIngs]   = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!abierto) return;
    setNombre(mezcla?.nombre || '');
    setDesc(mezcla?.descripcion || '');
    setPrecioMayor(mezcla?.precio_mayor != null ? String(mezcla.precio_mayor) : '');
    setPrecioMenor(mezcla?.precio_menor != null ? String(mezcla.precio_menor) : '');
    setIngs(mezcla?.ingredientes?.map(i => ({
      id_producto: String(i.id_producto),
      cantidad:    String(i.cantidad),
      id_unidad:   String(i.id_unidad),
      observaciones: i.observaciones || '',
    })) || [{ id_producto: '', cantidad: '', id_unidad: '', observaciones: '' }]);
    setError(null);
  }, [abierto, mezcla]);
```

- [ ] **Step 2: Incluir los precios en el payload de guardado**

Reemplaza:

```js
  const guardar = async () => {
    setError(null);
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    const ingsLimpios = ingredientes.filter(f => f.id_producto && f.cantidad && f.id_unidad);
    if (ingsLimpios.length === 0) { setError('Agrega al menos un ingrediente completo'); return; }
    setGuardando(true);
    try {
      const payload = { nombre: nombre.trim(), descripcion: descripcion.trim(), ingredientes: ingsLimpios };
      if (mezcla) await mezclaService.editar(mezcla.id_mezcla, payload);
      else        await mezclaService.crear(payload);
      onGuardar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };
```

con:

```js
  const guardar = async () => {
    setError(null);
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    const ingsLimpios = ingredientes.filter(f => f.id_producto && f.cantidad && f.id_unidad);
    if (ingsLimpios.length === 0) { setError('Agrega al menos un ingrediente completo'); return; }
    const pMayor = parseFloat(precioMayor) || 0;
    const pMenor = parseFloat(precioMenor) || 0;
    if (pMayor < 0 || pMenor < 0) { setError('Los precios no pueden ser negativos'); return; }
    setGuardando(true);
    try {
      const payload = {
        nombre: nombre.trim(), descripcion: descripcion.trim(), ingredientes: ingsLimpios,
        precio_mayor: pMayor, precio_menor: pMenor,
      };
      if (mezcla) await mezclaService.editar(mezcla.id_mezcla, payload);
      else        await mezclaService.crear(payload);
      onGuardar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };
```

- [ ] **Step 3: Agregar los campos de precio al formulario**

Reemplaza:

```js
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Descripción</label>
              <textarea value={descripcion} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="Instrucciones, uso recomendado..." />
            </div>
          </div>
```

con:

```js
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Descripción</label>
              <textarea value={descripcion} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="Instrucciones, uso recomendado..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Precio de venta mayor (Bs, por tanda)</label>
              <input type="number" min="0" step="0.5" value={precioMayor} onChange={e => setPrecioMayor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Precio de venta menor (Bs, por tanda)</label>
              <input type="number" min="0" step="0.5" value={precioMenor} onChange={e => setPrecioMenor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500/40"
                placeholder="0.00" />
            </div>
          </div>
```

- [ ] **Step 4: Verificar que el frontend compila**

Run: `cd frontend && npm run build`
Expected: build exitoso, sin errores.

- [ ] **Step 5: Verificación manual**

`npm run dev`, ir a Mezclas → Nueva mezcla, confirmar que aparecen los campos de precio mayor/menor, que se pueden crear y editar mezclas con esos precios, y que el modal "Aplicar" (sin cambios) sigue funcionando igual.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/mezclas/Mezclas.jsx
git commit -m "feat(mezclas): add precio_mayor/precio_menor fields to the mezcla form"
```

---

## Task 5: Vender mezclas desde `NuevaVenta.jsx`

**Files:**
- Modify: `frontend/src/pages/ventas/NuevaVenta.jsx`

**Interfaces:**
- Consumes: `ventaService.listarProductosPOS()` (Tarea 3) — cada fila trae `tipo: 'PRODUCTO'|'MEZCLA'`; para mezclas: `{ tipo, id_mezcla, nombre, precio_mayor, precio_menor }`.
- Produces: payload de `ventaService.crear`/`iniciarPagoQR` con líneas de mezcla `{ tipo: 'MEZCLA', id_mezcla, nombre, cantidad_tandas, precio_unitario, descuento_pct, descuento_monto, subtotal }`, consumido por la Tarea 3.

- [ ] **Step 1: Parsear mezclas al cargar datos del POS**

Reemplaza:

```js
      setClientes(cliRes.data.filter(c => c.activo === 1));
      setProductosStock(posRes.data.map(p => ({
        ...p,
        precio_menor:        parseFloat(p.precio_menor) || 0,
        precio_mayor:        parseFloat(p.precio_mayor) || 0,
        descuento_menor:     parseFloat(p.descuento_menor) || 0,
        descuento_mayor:     parseFloat(p.descuento_mayor) || 0,
        stock_unidades_total: parseFloat(p.stock_unidades_total) || 0,
        permite_fraccion:    p.permite_fraccion || 0,
        fracciones:          p.fracciones || [],
      })));
      setTurnoActivo(turnoRes.data); // null si no hay turno abierto
```

con:

```js
      setClientes(cliRes.data.filter(c => c.activo === 1));
      setProductosStock(posRes.data.map(p => p.tipo === 'MEZCLA'
        ? {
            ...p,
            precio_menor: parseFloat(p.precio_menor) || 0,
            precio_mayor: parseFloat(p.precio_mayor) || 0,
          }
        : {
            ...p,
            precio_menor:        parseFloat(p.precio_menor) || 0,
            precio_mayor:        parseFloat(p.precio_mayor) || 0,
            descuento_menor:     parseFloat(p.descuento_menor) || 0,
            descuento_mayor:     parseFloat(p.descuento_mayor) || 0,
            stock_unidades_total: parseFloat(p.stock_unidades_total) || 0,
            permite_fraccion:    p.permite_fraccion || 0,
            fracciones:          p.fracciones || [],
          }
      ));
      setTurnoActivo(turnoRes.data); // null si no hay turno abierto
```

- [ ] **Step 2: Actualizar el `useEffect` que recalcula precios al cambiar `tipoVenta`**

Reemplaza:

```js
  useEffect(() => {
    if (carrito.length === 0 || productosStock.length === 0) return;
    setCarrito(prev => prev.map(item => {
      const prod = productosStock.find(p => p.id_producto === item.id_producto);
      if (!prod) return item;
      let nuevoPrecio;
      if (item.id_conversion) {
        const fracc = (prod.fracciones || []).find(f => f.id_conversion === item.id_conversion);
        nuevoPrecio = fracc
          ? (tipoVenta === 'MAYOR' ? fracc.precio_mayor : fracc.precio_menor)
          : (tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor);
      } else {
        nuevoPrecio = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;
      }
      const cant = parseFloat(item.cantidad) || 0;
      return { ...item, precio_unitario: nuevoPrecio || 0, subtotal: cant * (nuevoPrecio || 0) };
    }));
  }, [tipoVenta]); // eslint-disable-line react-hooks/exhaustive-deps
```

con:

```js
  useEffect(() => {
    if (carrito.length === 0 || productosStock.length === 0) return;
    setCarrito(prev => prev.map(item => {
      const cant = parseFloat(item.cantidad) || 0;

      if (item.es_mezcla) {
        const mezcla = productosStock.find(p => p.tipo === 'MEZCLA' && p.id_mezcla === item.id_mezcla);
        if (!mezcla) return item;
        const nuevoPrecio = tipoVenta === 'MAYOR' ? mezcla.precio_mayor : mezcla.precio_menor;
        return { ...item, precio_unitario: nuevoPrecio || 0, subtotal: cant * (nuevoPrecio || 0) };
      }

      const prod = productosStock.find(p => p.tipo !== 'MEZCLA' && p.id_producto === item.id_producto);
      if (!prod) return item;
      let nuevoPrecio;
      if (item.id_conversion) {
        const fracc = (prod.fracciones || []).find(f => f.id_conversion === item.id_conversion);
        nuevoPrecio = fracc
          ? (tipoVenta === 'MAYOR' ? fracc.precio_mayor : fracc.precio_menor)
          : (tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor);
      } else {
        nuevoPrecio = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;
      }
      return { ...item, precio_unitario: nuevoPrecio || 0, subtotal: cant * (nuevoPrecio || 0) };
    }));
  }, [tipoVenta]); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Manejar mezclas en `agregarAlCarrito`**

Reemplaza:

```js
  const agregarAlCarrito = (prod) => {
    const index = carrito.findIndex(item => item.id_producto === prod.id_producto);
    const precioBase = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;
    if (index >= 0) {
      const itemActual = carrito[index];
      const nuevaCant = itemActual.cantidad + 1;
      const unidadesReq = calcUnidadesBase(itemActual, nuevaCant);
      if (!puedeVenderSinStock && unidadesReq > prod.stock_unidades_total) {
        mostrarToast('error', 'No hay suficiente stock disponible');
        return;
      }
      setCarrito(carrito.map((item, i) =>
        i === index
          ? { ...item, cantidad: nuevaCant, subtotal: nuevaCant * item.precio_unitario }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id_producto:      prod.id_producto,
        nombre:           prod.nombre,
        tipo_cantidad:    'UNIDAD',
        id_conversion:    null,
        cantidad:         1,
        precio_unitario:  precioBase || 0,
        unidades_por_caja: prod.unidades_por_caja,
        stock_maximo:     prod.stock_unidades_total,
        subtotal:         precioBase || 0,
        permite_fraccion: prod.permite_fraccion || 0,
        fracciones:       prod.fracciones || [],
      }]);
    }
    setTabMovil('carrito');
  };
```

con:

```js
  const agregarAlCarrito = (prod) => {
    const esMezcla = prod.tipo === 'MEZCLA';
    const precioBase = tipoVenta === 'MAYOR' ? prod.precio_mayor : prod.precio_menor;

    const index = carrito.findIndex(item => esMezcla
      ? item.es_mezcla && item.id_mezcla === prod.id_mezcla
      : !item.es_mezcla && item.id_producto === prod.id_producto);

    if (index >= 0) {
      const itemActual = carrito[index];
      const nuevaCant = itemActual.cantidad + 1;
      if (!esMezcla) {
        const unidadesReq = calcUnidadesBase(itemActual, nuevaCant);
        if (!puedeVenderSinStock && unidadesReq > prod.stock_unidades_total) {
          mostrarToast('error', 'No hay suficiente stock disponible');
          return;
        }
      }
      setCarrito(carrito.map((item, i) =>
        i === index
          ? { ...item, cantidad: nuevaCant, subtotal: nuevaCant * item.precio_unitario }
          : item
      ));
    } else if (esMezcla) {
      setCarrito([...carrito, {
        es_mezcla:       true,
        id_mezcla:       prod.id_mezcla,
        nombre:          prod.nombre,
        cantidad:        1,
        precio_unitario: precioBase || 0,
        subtotal:        precioBase || 0,
      }]);
    } else {
      setCarrito([...carrito, {
        id_producto:      prod.id_producto,
        nombre:           prod.nombre,
        tipo_cantidad:    'UNIDAD',
        id_conversion:    null,
        cantidad:         1,
        precio_unitario:  precioBase || 0,
        unidades_por_caja: prod.unidades_por_caja,
        stock_maximo:     prod.stock_unidades_total,
        subtotal:         precioBase || 0,
        permite_fraccion: prod.permite_fraccion || 0,
        fracciones:       prod.fracciones || [],
      }]);
    }
    setTabMovil('carrito');
  };
```

- [ ] **Step 4: Omitir la validación de stock por unidad en `actualizarItem` para líneas de mezcla**

Reemplaza:

```js
      const updated = { ...item, [campo]: valor };
      if (campo === 'cantidad' || campo === 'precio_unitario') {
        const cant  = parseFloat(updated.cantidad) || 0;
        const precio = parseFloat(updated.precio_unitario) || 0;
        const unidadesReq = calcUnidadesBase(updated, cant);
        if (!puedeVenderSinStock && unidadesReq > updated.stock_maximo) {
          mostrarToast('error', `Stock disponible: ${updated.stock_maximo} unidades`);
          return { ...item, cantidad: 1, subtotal: parseFloat(item.precio_unitario) || 0 };
        }
        return { ...updated, subtotal: cant * precio };
      }
      return updated;
```

con:

```js
      const updated = { ...item, [campo]: valor };
      if (campo === 'cantidad' || campo === 'precio_unitario') {
        const cant  = parseFloat(updated.cantidad) || 0;
        const precio = parseFloat(updated.precio_unitario) || 0;
        if (!updated.es_mezcla) {
          const unidadesReq = calcUnidadesBase(updated, cant);
          if (!puedeVenderSinStock && unidadesReq > updated.stock_maximo) {
            mostrarToast('error', `Stock disponible: ${updated.stock_maximo} unidades`);
            return { ...item, cantidad: 1, subtotal: parseFloat(item.precio_unitario) || 0 };
          }
        }
        return { ...updated, subtotal: cant * precio };
      }
      return updated;
```

- [ ] **Step 5: Incluir líneas de mezcla en el payload de la venta**

Reemplaza:

```js
      detalles: carrito.map(c => ({
        id_producto:       c.id_producto,
        nombre:            c.nombre,
        tipo_cantidad:     c.tipo_cantidad,
        id_conversion:     c.id_conversion || null,
        cantidad:          parseFloat(c.cantidad),
        precio_unitario:   parseFloat(c.precio_unitario),
        unidades_por_caja: c.unidades_por_caja,
        descuento_pct:     parseFloat(descuentoPct) || 0,
        descuento_monto:   parseFloat(c.subtotal) * (1 - factor),
        subtotal:          parseFloat(c.subtotal) * factor,
      })),
```

con:

```js
      detalles: carrito.map(c => c.es_mezcla ? {
        tipo:            'MEZCLA',
        id_mezcla:       c.id_mezcla,
        nombre:          c.nombre,
        cantidad_tandas: parseFloat(c.cantidad),
        precio_unitario: parseFloat(c.precio_unitario),
        descuento_pct:   parseFloat(descuentoPct) || 0,
        descuento_monto: parseFloat(c.subtotal) * (1 - factor),
        subtotal:        parseFloat(c.subtotal) * factor,
      } : {
        id_producto:       c.id_producto,
        nombre:            c.nombre,
        tipo_cantidad:     c.tipo_cantidad,
        id_conversion:     c.id_conversion || null,
        cantidad:          parseFloat(c.cantidad),
        precio_unitario:   parseFloat(c.precio_unitario),
        unidades_por_caja: c.unidades_por_caja,
        descuento_pct:     parseFloat(descuentoPct) || 0,
        descuento_monto:   parseFloat(c.subtotal) * (1 - factor),
        subtotal:          parseFloat(c.subtotal) * factor,
      }),
```

- [ ] **Step 6: Mostrar el badge de mezcla en la grilla de productos**

Reemplaza:

```js
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2 flex-1">
                      {p.nombre}
                    </h3>
                    {p.permite_fraccion === 1 && (
                      <span className="shrink-0 text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold leading-none">
                        Frac
                      </span>
                    )}
```

con:

```js
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm leading-tight line-clamp-2 flex-1">
                      {p.nombre}
                    </h3>
                    {p.tipo === 'MEZCLA' && (
                      <span className="shrink-0 text-[9px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold leading-none">
                        🧪 Mezcla
                      </span>
                    )}
                    {p.permite_fraccion === 1 && (
                      <span className="shrink-0 text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold leading-none">
                        Frac
                      </span>
                    )}
```

- [ ] **Step 7: No mostrar el badge de stock para mezclas (no aplica un solo número de stock)**

Reemplaza:

```js
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      sinStock
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                        : p.stock_unidades_total <= 5
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {sinStock ? 'Sin stock' : `${p.stock_unidades_total}u`}
                    </span>
```

con:

```js
                    {p.tipo !== 'MEZCLA' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        sinStock
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                          : p.stock_unidades_total <= 5
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {sinStock ? 'Sin stock' : `${p.stock_unidades_total}u`}
                      </span>
                    )}
```

- [ ] **Step 8: `sinStock` no debe deshabilitar la tarjeta de una mezcla**

Reemplaza:

```js
            {productosFiltrados.map(p => {
              const precio = tipoVenta === 'MAYOR' ? p.precio_mayor : p.precio_menor;
              const sinStock = p.stock_unidades_total === 0;
              return (
```

con:

```js
            {productosFiltrados.map(p => {
              const precio = tipoVenta === 'MAYOR' ? p.precio_mayor : p.precio_menor;
              const sinStock = p.tipo !== 'MEZCLA' && p.stock_unidades_total === 0;
              return (
```

- [ ] **Step 9: Cantidad decimal (tandas) para líneas de mezcla en el carrito**

Reemplaza:

```js
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">Cant.</p>
                <input
                  type="number" min="1"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                  className="w-full text-center py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
```

con:

```js
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">
                  {item.es_mezcla ? 'Tandas' : 'Cant.'}
                </p>
                <input
                  type="number" min={item.es_mezcla ? '0.001' : '1'} step={item.es_mezcla ? '0.001' : '1'}
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                  className="w-full text-center py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
```

- [ ] **Step 10: No mostrar el selector de tipo/sub-unidad para líneas de mezcla**

Reemplaza:

```js
              {/* Tipo / Sub-unidad */}
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">
                  {item.permite_fraccion && item.fracciones?.length > 0 ? 'Sub-unidad' : 'Tipo'}
                </p>
                {item.permite_fraccion && item.fracciones?.length > 0 ? (
                  <select
                    value={item.id_conversion ?? ''}
                    onChange={(e) => actualizarItem(idx, 'id_conversion', e.target.value)}
                    className="w-full py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Unidad</option>
                    {item.fracciones.map(f => (
                      <option key={f.id_conversion} value={f.id_conversion}>
                        {f.nombre} ({f.abreviatura})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={item.tipo_cantidad}
                    onChange={(e) => actualizarItem(idx, 'tipo_cantidad', e.target.value)}
                    className="w-full py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="UNIDAD">Unidad</option>
                    <option value="CAJA">Caja</option>
                  </select>
                )}
              </div>
```

con:

```js
              {/* Tipo / Sub-unidad — no aplica a mezclas (siempre son "tandas") */}
              <div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-1">
                  {item.es_mezcla ? 'Mezcla' : item.permite_fraccion && item.fracciones?.length > 0 ? 'Sub-unidad' : 'Tipo'}
                </p>
                {item.es_mezcla ? (
                  <div className="w-full py-1.5 px-1 text-center text-xs text-zinc-400 dark:text-zinc-500">🧪</div>
                ) : item.permite_fraccion && item.fracciones?.length > 0 ? (
                  <select
                    value={item.id_conversion ?? ''}
                    onChange={(e) => actualizarItem(idx, 'id_conversion', e.target.value)}
                    className="w-full py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Unidad</option>
                    {item.fracciones.map(f => (
                      <option key={f.id_conversion} value={f.id_conversion}>
                        {f.nombre} ({f.abreviatura})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={item.tipo_cantidad}
                    onChange={(e) => actualizarItem(idx, 'tipo_cantidad', e.target.value)}
                    className="w-full py-1.5 px-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="UNIDAD">Unidad</option>
                    <option value="CAJA">Caja</option>
                  </select>
                )}
              </div>
```

- [ ] **Step 11: Verificar que el frontend compila**

Run: `cd frontend && npm run build`
Expected: build exitoso, sin errores.

- [ ] **Step 12: Verificación manual**

`npm run dev`, con turno de caja abierto y al menos una mezcla activa con precio: confirmar que la mezcla aparece en la grilla del POS con el badge 🧪, que se puede agregar al carrito con cantidad en tandas (decimal), que el precio cambia con el toggle Mayor/Menor, que se puede vender sola y mezclada con productos normales (efectivo, crédito y QR), y que si falta stock de un ingrediente el error se muestra igual que para un producto normal.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/pages/ventas/NuevaVenta.jsx
git commit -m "feat(ventas): sell mezclas from the POS cart"
```

---

## Task 6: Mostrar líneas de mezcla en los tickets

**Files:**
- Modify: `frontend/src/pages/ventas/VentaTicket.jsx`
- Modify: `frontend/src/lib/printing/ticketBuilder.js`
- Modify: `frontend/src/lib/printing/ticketBuilder.test.js`

**Interfaces:**
- Consumes: `d.id_mezcla`, `d.mezcla_nombre` en cada línea de `venta.detalles` (Tarea 3, endpoint `GET /api/ventas/:id`).

- [ ] **Step 1 (TDD): Agregar el test de la línea de mezcla en `ticketBuilder.test.js`**

Agrega este test dentro del `describe('buildTicketBytes', ...)` existente (después del último `it(...)`, antes del `});` de cierre del `describe`):

```js
  it('muestra "tandas" y el nombre de la mezcla en una línea de mezcla, sin lote', () => {
    const venta = {
      ...ventaBase,
      detalles: [
        ventaBase.detalles[0],
        {
          id_detalle_venta: 2, id_mezcla: 7, mezcla_nombre: 'Fumigacion Maiz',
          cantidad: 2, subtotal: 60, precio_unitario: 30, descuento_pct: 0,
        },
      ],
    };
    const bytes = buildTicketBytes(venta, configBase, null);
    const texto = bytesToTexto(bytes);

    expect(texto).toContain('2 tandas - Fumigacion Maiz');
    expect(texto).not.toContain('Lote: S/N');
  });
```

- [ ] **Step 2: Ejecutar el test y confirmar que falla**

Run: `cd frontend && npx vitest run src/lib/printing/ticketBuilder.test.js`
Expected: FAIL — el texto esperado no aparece (la línea de mezcla se imprime igual que una de producto, con `undefined` en `producto_nombre` y `Lote: S/N`).

- [ ] **Step 3: Implementar la rama de mezcla en `buildTicketBytes`**

En `frontend/src/lib/printing/ticketBuilder.js`, reemplaza:

```js
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
```

con:

```js
  partes.push(esc.line('-'.repeat(ANCHO_COLUMNAS)));
  partes.push(esc.bold(true));
  partes.push(esc.line('DETALLE'));
  partes.push(esc.bold(false));
  for (const d of venta.detalles || []) {
    const esMezcla = Boolean(d.id_mezcla);
    const cantidadTexto = esMezcla
      ? `${d.cantidad} tanda${parseFloat(d.cantidad) !== 1 ? 's' : ''} - ${d.mezcla_nombre}`
      : `${d.cantidad} ${d.tipo_cantidad === 'CAJA' ? 'cj' : 'un'} - ${d.producto_nombre}`;
    partes.push(esc.line(esc.columns(cantidadTexto, `Bs ${fmt(d.subtotal)}`, ANCHO_COLUMNAS)));
    let detalle = `  P.U.: Bs ${fmt(d.precio_unitario)}`;
    if (parseFloat(d.descuento_pct) > 0) detalle += ` (-${d.descuento_pct}%)`;
    if (!esMezcla) detalle += ` - Lote: ${d.numero_lote || 'S/N'}`;
    partes.push(esc.line(detalle));
  }
```

- [ ] **Step 4: Ejecutar el test y confirmar que pasa**

Run: `cd frontend && npx vitest run src/lib/printing/ticketBuilder.test.js`
Expected: PASS (9 tests: los 8 anteriores + el nuevo).

- [ ] **Step 5: Aplicar la misma rama en `VentaTicket.jsx` (ticket HTML)**

Reemplaza:

```js
          {/* Detalle de productos */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>DETALLE</div>
            {(venta.detalles || []).map((d) => (
              <div key={d.id_detalle_venta} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ maxWidth: '55mm', wordBreak: 'break-word' }}>
                    {d.cantidad} {d.tipo_cantidad === 'CAJA' ? 'cj' : 'un'} — {d.producto_nombre}
                  </span>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Bs {fmt(d.subtotal)}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#444', paddingLeft: '4px' }}>
                  P.U.: Bs {fmt(d.precio_unitario)}
                  {parseFloat(d.descuento_pct) > 0 && ` (-${d.descuento_pct}%)`}
                  {' · Lote: '}{d.numero_lote || 'S/N'}
                </div>
              </div>
            ))}
          </div>
```

con:

```js
          {/* Detalle de productos y mezclas */}
          <div style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>DETALLE</div>
            {(venta.detalles || []).map((d) => (
              <div key={d.id_detalle_venta} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ maxWidth: '55mm', wordBreak: 'break-word' }}>
                    {d.id_mezcla
                      ? `${d.cantidad} tanda${parseFloat(d.cantidad) !== 1 ? 's' : ''} — ${d.mezcla_nombre}`
                      : `${d.cantidad} ${d.tipo_cantidad === 'CAJA' ? 'cj' : 'un'} — ${d.producto_nombre}`}
                  </span>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Bs {fmt(d.subtotal)}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#444', paddingLeft: '4px' }}>
                  P.U.: Bs {fmt(d.precio_unitario)}
                  {parseFloat(d.descuento_pct) > 0 && ` (-${d.descuento_pct}%)`}
                  {!d.id_mezcla && <>{' · Lote: '}{d.numero_lote || 'S/N'}</>}
                </div>
              </div>
            ))}
          </div>
```

- [ ] **Step 6: Verificar que el frontend compila**

Run: `cd frontend && npm run build`
Expected: build exitoso, sin errores.

- [ ] **Step 7: Verificación manual**

Con una venta ya registrada que incluya una línea de mezcla: abrir su ticket (`/ventas/:id/ticket`) y confirmar que el HTML muestra "X tanda(s) — Nombre de la mezcla" sin "Lote:". Con una impresora térmica disponible (o revisando el flujo manualmente), confirmar que "Imprimir térmica (BT)" también muestra la línea de mezcla correctamente.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/ventas/VentaTicket.jsx frontend/src/lib/printing/ticketBuilder.js frontend/src/lib/printing/ticketBuilder.test.js
git commit -m "feat(ventas): render mezcla lines in HTML and thermal receipts"
```

---

## Task 7: Verificación manual end-to-end

Sin test runner en el backend y sin infraestructura de test de componentes en el frontend — esta tarea es un checklist de verificación manual antes de dar por terminada la funcionalidad.

**Files:** ninguno (checklist).

- [ ] **Step 1: Flujo completo con efectivo**

Crear una mezcla con precio, abrir turno de caja, venderla sola desde el POS en efectivo. Confirmar: se cobra, se descuenta el stock de cada ingrediente (revisar `lote` y `movimiento_almacen`), aparece en el historial de ventas y en el ticket con "X tanda(s) — nombre".

- [ ] **Step 2: Carrito mixto**

Vender en un mismo carrito una mezcla y uno o más productos normales. Confirmar que todo se cobra junto y se descuenta atómicamente (revisar que ambos tipos de línea aparecen en el detalle de la venta).

- [ ] **Step 3: Crédito y QR**

Repetir la venta de una mezcla a crédito (con cliente y fecha de vencimiento) y por QR (CodePay o estático). Confirmar que ambos flujos funcionan igual que con productos.

- [ ] **Step 4: Stock insuficiente**

Forzar que el stock de un ingrediente sea menor al necesario para la cantidad de tandas pedida. Confirmar que la venta completa falla (no se cobra ni se descuenta nada) y que el mensaje de error se muestra en el POS.

- [ ] **Step 5: Anulación**

Anular una venta que incluya una línea de mezcla. Confirmar que el stock de cada ingrediente vuelve a su valor previo, que se generan los `movimiento_almacen` de reingreso correspondientes, y que `aplicacion_mezcla.anulada = 1` para esa aplicación.

- [ ] **Step 6: El botón "Aplicar" interno sigue intacto**

Desde la pantalla de Mezclas, usar "Aplicar" sobre una mezcla (sin pasar por el POS). Confirmar que sigue descontando stock sin generar ninguna venta ni afectar caja.

- [ ] **Step 7: Tickets**

Confirmar que el ticket HTML y el térmico (Bluetooth) de una venta con mezcla muestran la línea correctamente, sin "Lote:" y con "tanda(s)" en vez de "un/cj".

- [ ] **Step 8: Registrar el resultado**

Anotar en la descripción del PR o commit final qué combinaciones se probaron y su resultado.
