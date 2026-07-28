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
