-- ============================================================================
-- Migración: índices de rendimiento + constraint de integridad
-- Para bases de datos ya desplegadas (no incluidos en un dump previo)
-- Aplicar una sola vez contra la base de datos de producción.
-- ============================================================================

-- ── Índices de rendimiento (id_sucursal + columna de fecha, usados en
--    reportes y consultas filtradas por sucursal y rango de fechas) ────────

ALTER TABLE `compra`
  ADD KEY `idx_compra_sucursal_fecha` (`id_sucursal`,`fecha_compra`);

ALTER TABLE `lote`
  ADD KEY `idx_lote_sucursal_vencimiento` (`id_sucursal`,`fecha_vencimiento`);

ALTER TABLE `movimiento_almacen`
  ADD KEY `idx_mov_referencia` (`referencia_tipo`,`referencia_id`),
  ADD KEY `idx_mov_sucursal_fecha` (`id_sucursal`,`fecha_movimiento`);

ALTER TABLE `venta`
  ADD KEY `idx_venta_sucursal_fecha` (`id_sucursal`,`fecha_venta`);

-- ── Constraint: una línea de detalle_venta es O producto O mezcla,
--    nunca ambos ni ninguno ───────────────────────────────────────────────

ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `chk_dv_producto_xor_mezcla` CHECK (
    (`id_producto` IS NOT NULL AND `id_mezcla` IS NULL) OR
    (`id_producto` IS NULL AND `id_mezcla` IS NOT NULL)
  );
