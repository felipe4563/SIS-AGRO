-- ============================================================================
-- Migración: soporte de mezclas en detalle_venta
-- Tu base de datos ya tiene las tablas `mezcla` y `aplicacion_mezcla`,
-- pero `detalle_venta` nunca se alteró para referenciarlas.
-- Aplicar ANTES de migracion_indices_y_constraints.sql
-- ============================================================================

-- id_producto pasa a ser opcional (una línea puede ser de mezcla en vez de producto)
ALTER TABLE `detalle_venta`
  MODIFY `id_producto` int(11) DEFAULT NULL;

-- Nuevas columnas: referencia a la mezcla vendida y a su aplicación (dosis/uso)
ALTER TABLE `detalle_venta`
  ADD COLUMN `id_mezcla` int(11) DEFAULT NULL AFTER `id_producto`,
  ADD COLUMN `id_aplicacion` int(11) DEFAULT NULL AFTER `id_mezcla`;

-- Llaves foráneas hacia mezcla y aplicacion_mezcla
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `fk_dv_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  ADD CONSTRAINT `fk_dv_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla` (`id_aplicacion`);
