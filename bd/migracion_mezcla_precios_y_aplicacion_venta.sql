-- ============================================================================
-- Migración: columnas faltantes en mezcla / aplicacion_mezcla
-- Tu base de datos de producción tenía estas tablas desactualizadas respecto
-- al código actual, lo que rompía /api/venta/pos-productos (listarProductosPOS)
-- con "Unknown column 'precio_mayor' in 'field list'".
-- ============================================================================

-- `mezcla` no tenía precio propio (el código ya lo espera para listarla en el POS)
ALTER TABLE `mezcla`
  ADD COLUMN `precio_mayor` decimal(12,2) NOT NULL DEFAULT 0.00 AFTER `descripcion`,
  ADD COLUMN `precio_menor` decimal(12,2) NOT NULL DEFAULT 0.00 AFTER `precio_mayor`;

-- `aplicacion_mezcla` no vinculaba con la venta que la generó, ni permitía anularla
ALTER TABLE `aplicacion_mezcla`
  ADD COLUMN `id_venta` int(11) DEFAULT NULL AFTER `id_usuario`,
  ADD COLUMN `anulada`  tinyint(1) NOT NULL DEFAULT 0;

ALTER TABLE `aplicacion_mezcla`
  ADD KEY `fk_am_venta` (`id_venta`),
  ADD CONSTRAINT `fk_am_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);
