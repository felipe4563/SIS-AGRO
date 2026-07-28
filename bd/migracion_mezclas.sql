-- ============================================================
--  MIGRACIÓN: Módulo de Mezclas / Formulaciones
--  SIS-AGRO — Multi-sucursal
--  La receta (mezcla + ingredientes) es a nivel empresa.
--  La aplicación (descuento de stock) es a nivel sucursal.
-- ============================================================

-- ------------------------------------------------------------
-- 1. MEZCLA — Fórmula/receta a nivel empresa
-- ------------------------------------------------------------
CREATE TABLE `mezcla` (
  `id_mezcla`   INT(11)      NOT NULL AUTO_INCREMENT,
  `id_empresa`  INT(11)      NOT NULL,
  `nombre`      VARCHAR(150) NOT NULL,
  `descripcion` TEXT         DEFAULT NULL,
  `activo`      TINYINT(1)   NOT NULL DEFAULT 1,
  `creado_en`   DATETIME     NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_mezcla`),
  UNIQUE KEY `uq_mezcla_nombre` (`nombre`, `id_empresa`),
  KEY `fk_mezcla_empresa` (`id_empresa`),
  CONSTRAINT `fk_mezcla_empresa`
    FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. MEZCLA_INGREDIENTE — Ingredientes de la receta
--    cantidad usa DECIMAL para fracciones (0.5 arrobas, 1.5 litros)
--    id_unidad indica en qué unidad está expresada la cantidad
-- ------------------------------------------------------------
CREATE TABLE `mezcla_ingrediente` (
  `id_ingrediente` INT(11)        NOT NULL AUTO_INCREMENT,
  `id_mezcla`      INT(11)        NOT NULL,
  `id_producto`    INT(11)        NOT NULL,
  `cantidad`       DECIMAL(14,4)  NOT NULL,
  `id_unidad`      INT(11)        NOT NULL,
  `observaciones`  VARCHAR(200)   DEFAULT NULL,
  PRIMARY KEY (`id_ingrediente`),
  UNIQUE KEY `uq_mezcla_prod` (`id_mezcla`, `id_producto`),
  KEY `fk_mi_mezcla`   (`id_mezcla`),
  KEY `fk_mi_producto` (`id_producto`),
  KEY `fk_mi_unidad`   (`id_unidad`),
  CONSTRAINT `fk_mi_mezcla`
    FOREIGN KEY (`id_mezcla`)   REFERENCES `mezcla`       (`id_mezcla`),
  CONSTRAINT `fk_mi_producto`
    FOREIGN KEY (`id_producto`) REFERENCES `producto`     (`id_producto`),
  CONSTRAINT `fk_mi_unidad`
    FOREIGN KEY (`id_unidad`)   REFERENCES `unidad_medida` (`id_unidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. APLICACION_MEZCLA — Registro de uso por sucursal
--    cantidad_tandas: cuántas veces se preparó la receta
--    Ej: cantidad_tandas=2 descuenta el doble de cada ingrediente
-- ------------------------------------------------------------
CREATE TABLE `aplicacion_mezcla` (
  `id_aplicacion`    INT(11)       NOT NULL AUTO_INCREMENT,
  `id_mezcla`        INT(11)       NOT NULL,
  `id_sucursal`      INT(11)       NOT NULL,   -- sucursal que descuenta stock
  `id_usuario`       INT(11)       NOT NULL,
  `cantidad_tandas`  DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  `fecha_aplicacion` DATETIME      NOT NULL DEFAULT current_timestamp(),
  `observaciones`    TEXT          DEFAULT NULL,
  PRIMARY KEY (`id_aplicacion`),
  KEY `fk_am_mezcla`   (`id_mezcla`),
  KEY `fk_am_sucursal` (`id_sucursal`),
  KEY `fk_am_usuario`  (`id_usuario`),
  CONSTRAINT `fk_am_mezcla`
    FOREIGN KEY (`id_mezcla`)   REFERENCES `mezcla`   (`id_mezcla`),
  CONSTRAINT `fk_am_sucursal`
    FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_am_usuario`
    FOREIGN KEY (`id_usuario`)  REFERENCES `usuario`  (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. APLICACION_MEZCLA_DETALLE — Qué se descontó exactamente
--    Registra lote a lote lo que se consumió (trazabilidad)
--    Enlaza con movimiento_almacen para el kardex
-- ------------------------------------------------------------
CREATE TABLE `aplicacion_mezcla_detalle` (
  `id_detalle`          INT(11)       NOT NULL AUTO_INCREMENT,
  `id_aplicacion`       INT(11)       NOT NULL,
  `id_lote`             INT(11)       NOT NULL,
  `id_producto`         INT(11)       NOT NULL,
  `cantidad_descontada` DECIMAL(14,4) NOT NULL,
  `id_unidad`           INT(11)       NOT NULL,
  `id_movimiento_almacen` INT(11)     DEFAULT NULL, -- referencia al kardex
  PRIMARY KEY (`id_detalle`),
  KEY `fk_amd_aplicacion` (`id_aplicacion`),
  KEY `fk_amd_lote`       (`id_lote`),
  KEY `fk_amd_producto`   (`id_producto`),
  KEY `fk_amd_unidad`     (`id_unidad`),
  KEY `fk_amd_movalmacen` (`id_movimiento_almacen`),
  CONSTRAINT `fk_amd_aplicacion`
    FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla`   (`id_aplicacion`) ON DELETE CASCADE,
  CONSTRAINT `fk_amd_lote`
    FOREIGN KEY (`id_lote`)       REFERENCES `lote`                (`id_lote`),
  CONSTRAINT `fk_amd_producto`
    FOREIGN KEY (`id_producto`)   REFERENCES `producto`            (`id_producto`),
  CONSTRAINT `fk_amd_unidad`
    FOREIGN KEY (`id_unidad`)     REFERENCES `unidad_medida`       (`id_unidad`),
  CONSTRAINT `fk_amd_movalmacen`
    FOREIGN KEY (`id_movimiento_almacen`) REFERENCES `movimiento_almacen` (`id_movimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. PERMISOS — Nuevos permisos para el módulo de mezclas
-- ------------------------------------------------------------
INSERT INTO `permiso` (`modulo`, `accion`, `nombre_clave`, `descripcion`) VALUES
('mezclas', 'ver',      'mezclas.ver',      'Ver listado de mezclas/fórmulas'),
('mezclas', 'crear',    'mezclas.crear',    'Crear nuevas mezclas con su receta'),
('mezclas', 'editar',   'mezclas.editar',   'Editar receta de una mezcla'),
('mezclas', 'eliminar', 'mezclas.eliminar', 'Eliminar mezclas del sistema'),
('mezclas', 'activar',  'mezclas.activar',  'Activar o desactivar una mezcla'),
('mezclas', 'aplicar',  'mezclas.aplicar',  'Registrar una aplicación (descuenta stock de la sucursal)'),
('mezclas', 'ver_historial', 'mezclas.ver_historial', 'Ver historial de aplicaciones de mezclas');
