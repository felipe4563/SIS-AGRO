/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: bd_agropecuaria
-- ------------------------------------------------------
-- Server version	8.4.7-0ubuntu0.25.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `apertura_cierre_caja`
--

DROP TABLE IF EXISTS `apertura_cierre_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `apertura_cierre_caja` (
  `id_apertura` int NOT NULL AUTO_INCREMENT,
  `id_caja` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `monto_inicial` decimal(14,2) NOT NULL DEFAULT '0.00',
  `monto_esperado` decimal(14,2) DEFAULT NULL,
  `monto_final` decimal(14,2) DEFAULT NULL,
  `diferencia` decimal(14,2) DEFAULT NULL,
  `fecha_apertura` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` datetime DEFAULT NULL,
  `estado` enum('ABIERTA','CERRADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABIERTA',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_apertura`),
  KEY `fk_acc_caja` (`id_caja`),
  KEY `fk_acc_usuario` (`id_usuario`),
  KEY `fk_acc_sucursal` (`id_sucursal`),
  CONSTRAINT `fk_acc_caja` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  CONSTRAINT `fk_acc_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_acc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apertura_cierre_caja`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `apertura_cierre_caja` WRITE;
/*!40000 ALTER TABLE `apertura_cierre_caja` DISABLE KEYS */;
INSERT INTO `apertura_cierre_caja` VALUES
(1,1,2,1,100.00,100.00,100.00,0.00,'2026-06-20 18:32:18','2026-06-20 18:32:32','CERRADA',NULL),
(2,1,1,1,100.00,100.00,100.00,0.00,'2026-06-20 20:22:17','2026-06-25 11:17:30','CERRADA',NULL),
(3,3,5,3,100.00,100.00,100.00,0.00,'2026-06-25 11:17:49','2026-06-25 11:18:00','CERRADA',NULL),
(4,3,5,3,100.00,NULL,NULL,NULL,'2026-06-25 11:32:02',NULL,'ABIERTA',NULL),
(5,4,6,6,10.00,120.00,110.00,-10.00,'2026-06-29 22:42:16','2026-07-03 15:05:27','CERRADA',NULL),
(6,5,7,8,500.00,NULL,NULL,NULL,'2026-07-03 14:01:59',NULL,'ABIERTA',NULL),
(7,4,6,6,0.00,0.00,0.00,0.00,'2026-07-03 15:06:16','2026-07-03 15:06:48','CERRADA',NULL),
(8,6,6,6,0.00,NULL,NULL,NULL,'2026-07-03 15:11:44',NULL,'ABIERTA',NULL),
(9,7,5,4,0.00,86.00,1.00,-85.00,'2026-07-06 15:47:29','2026-07-09 01:06:46','CERRADA',NULL),
(10,8,6,7,1.00,NULL,NULL,NULL,'2026-07-22 09:12:08',NULL,'ABIERTA',NULL);
/*!40000 ALTER TABLE `apertura_cierre_caja` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `aplicacion_mezcla`
--

DROP TABLE IF EXISTS `aplicacion_mezcla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aplicacion_mezcla` (
  `id_aplicacion` int NOT NULL AUTO_INCREMENT,
  `id_mezcla` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `id_usuario` int NOT NULL,
  `cantidad_tandas` decimal(10,4) NOT NULL DEFAULT '1.0000',
  `fecha_aplicacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_aplicacion`),
  KEY `fk_am_mezcla` (`id_mezcla`),
  KEY `fk_am_sucursal` (`id_sucursal`),
  KEY `fk_am_usuario` (`id_usuario`),
  CONSTRAINT `fk_am_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  CONSTRAINT `fk_am_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_am_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aplicacion_mezcla`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `aplicacion_mezcla` WRITE;
/*!40000 ALTER TABLE `aplicacion_mezcla` DISABLE KEYS */;
/*!40000 ALTER TABLE `aplicacion_mezcla` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `aplicacion_mezcla_detalle`
--

DROP TABLE IF EXISTS `aplicacion_mezcla_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aplicacion_mezcla_detalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_aplicacion` int NOT NULL,
  `id_lote` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad_descontada` decimal(14,4) NOT NULL,
  `id_unidad` int NOT NULL,
  `id_movimiento_almacen` int DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_amd_aplicacion` (`id_aplicacion`),
  KEY `fk_amd_lote` (`id_lote`),
  KEY `fk_amd_producto` (`id_producto`),
  KEY `fk_amd_unidad` (`id_unidad`),
  KEY `fk_amd_movalmacen` (`id_movimiento_almacen`),
  CONSTRAINT `fk_amd_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla` (`id_aplicacion`) ON DELETE CASCADE,
  CONSTRAINT `fk_amd_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `fk_amd_movalmacen` FOREIGN KEY (`id_movimiento_almacen`) REFERENCES `movimiento_almacen` (`id_movimiento`),
  CONSTRAINT `fk_amd_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_amd_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_medida` (`id_unidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aplicacion_mezcla_detalle`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `aplicacion_mezcla_detalle` WRITE;
/*!40000 ALTER TABLE `aplicacion_mezcla_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `aplicacion_mezcla_detalle` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `id_caja` int NOT NULL AUTO_INCREMENT,
  `id_sucursal` int NOT NULL,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_caja`),
  KEY `fk_caja_sucursal` (`id_sucursal`),
  CONSTRAINT `fk_caja_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `caja` WRITE;
/*!40000 ALTER TABLE `caja` DISABLE KEYS */;
INSERT INTO `caja` VALUES
(1,1,'Caja Central',NULL,1,'2026-06-20 18:22:55'),
(2,2,'Caja Norte',NULL,1,'2026-06-20 18:31:41'),
(3,3,'Caja Chimore',NULL,1,'2026-06-25 11:11:59'),
(4,6,'Caja Principal',NULL,1,'2026-06-29 22:40:01'),
(5,8,'Caja Chimoré',NULL,1,'2026-07-03 14:01:32'),
(6,6,'Shinahota',NULL,1,'2026-07-03 15:09:01'),
(7,4,'sdsd',NULL,1,'2026-07-06 15:47:23'),
(8,7,'norte',NULL,1,'2026-07-22 09:11:59');
/*!40000 ALTER TABLE `caja` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `categoria_movimiento`
--

DROP TABLE IF EXISTS `categoria_movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_movimiento` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('INGRESO','EGRESO','AMBOS') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'AMBOS',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uq_nombre` (`nombre`,`id_empresa`),
  KEY `fk_cat_empresa` (`id_empresa`),
  CONSTRAINT `fk_cat_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_movimiento`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `categoria_movimiento` WRITE;
/*!40000 ALTER TABLE `categoria_movimiento` DISABLE KEYS */;
INSERT INTO `categoria_movimiento` VALUES
(1,1,'Luz','EGRESO',1,'2026-06-20 20:54:42');
/*!40000 ALTER TABLE `categoria_movimiento` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `clasificacion_producto`
--

DROP TABLE IF EXISTS `clasificacion_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clasificacion_producto` (
  `id_clasificacion` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_clasificacion`),
  UNIQUE KEY `uq_clasificacion_nombre` (`nombre`,`id_empresa`),
  KEY `fk_clasprod_empresa` (`id_empresa`),
  CONSTRAINT `fk_clasprod_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clasificacion_producto`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `clasificacion_producto` WRITE;
/*!40000 ALTER TABLE `clasificacion_producto` DISABLE KEYS */;
INSERT INTO `clasificacion_producto` VALUES
(1,1,'Semillas',NULL,1),
(2,1,'Fertilizantes',NULL,1),
(3,1,'Agroquímicos',NULL,1),
(4,1,'Veterinaria',NULL,1),
(5,1,'Alimento Animal',NULL,1),
(6,1,'Herramientas',NULL,1),
(7,1,'Riego',NULL,1),
(8,1,'Foliares',NULL,1),
(9,4,'Semillas',NULL,1),
(10,4,'Fertilizantes',NULL,1),
(11,4,'Agroquímicos',NULL,1),
(12,4,'Veterinaria',NULL,1),
(13,4,'Alimento Animal',NULL,1),
(14,4,'Herramientas',NULL,1),
(15,4,'Riego',NULL,1),
(16,4,'Foliares',NULL,1),
(17,5,'Semillas',NULL,1),
(18,5,'Fertilizantes',NULL,1),
(19,5,'Agroquímicos',NULL,1),
(20,5,'Veterinaria',NULL,1),
(21,5,'Alimento Animal',NULL,1),
(22,5,'Herramientas',NULL,1),
(23,5,'Riego',NULL,1),
(24,5,'Foliares',NULL,1);
/*!40000 ALTER TABLE `clasificacion_producto` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `ci_nit` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empresa` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_cliente` enum('MINORISTA','MAYORISTA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MINORISTA',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uq_cliente_cinit` (`ci_nit`,`id_empresa`),
  KEY `fk_cli_empresa` (`id_empresa`),
  CONSTRAINT `fk_cli_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES
(1,1,'9391669','Felipe','Mejia',NULL,'74819122',NULL,NULL,'MINORISTA',1,'2026-06-20 18:24:42'),
(2,5,'11484518','Julio','Ortega','J','74819122','juli@gmail.com',NULL,'MINORISTA',1,'2026-06-29 22:51:03'),
(3,5,'13904325','Adolf','3Rait',NULL,NULL,NULL,NULL,'MINORISTA',1,'2026-07-03 13:53:26'),
(4,4,'01041945','Joseph','Goebbels',NULL,NULL,NULL,NULL,'MINORISTA',1,'2026-07-03 13:55:37');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `id_proveedor` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `id_usuario` int NOT NULL,
  `nro_factura` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_compra` date NOT NULL,
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `estado` enum('PENDIENTE','CONFIRMADA','ANULADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','CREDITO','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EFECTIVO',
  `monto_pagado` decimal(14,2) NOT NULL DEFAULT '0.00',
  `fecha_vencimiento_credito` date DEFAULT NULL,
  `estado_credito` enum('PENDIENTE','PARCIAL','PAGADO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_compra`),
  KEY `fk_compra_proveedor` (`id_proveedor`),
  KEY `fk_compra_sucursal` (`id_sucursal`),
  KEY `fk_compra_usuario` (`id_usuario`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `fk_compra_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
INSERT INTO `compra` VALUES
(1,1,6,6,NULL,'2026-07-22',12.00,0.00,12.00,'PENDIENTE',NULL,'EFECTIVO',12.00,NULL,NULL,'2026-07-22 09:08:34');
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `conversion_unidad`
--

DROP TABLE IF EXISTS `conversion_unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversion_unidad` (
  `id_conversion` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abreviatura` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_unidad_base` int NOT NULL,
  `factor` decimal(10,4) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_conversion`),
  UNIQUE KEY `uq_conv_nombre` (`nombre`,`id_empresa`),
  KEY `fk_conv_empresa` (`id_empresa`),
  KEY `fk_conv_unidad_base` (`id_unidad_base`),
  CONSTRAINT `fk_conv_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_conv_unidad_base` FOREIGN KEY (`id_unidad_base`) REFERENCES `unidad_medida` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversion_unidad`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `conversion_unidad` WRITE;
/*!40000 ALTER TABLE `conversion_unidad` DISABLE KEYS */;
INSERT INTO `conversion_unidad` VALUES
(1,1,'arroba','@',1,4.0000,1),
(4,1,'arrobas','arb',2,4.0000,1),
(5,4,'arroba','arr',7,4.0000,1);
/*!40000 ALTER TABLE `conversion_unidad` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compra` (
  `id_detalle_compra` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_lote` int DEFAULT NULL,
  `id_producto` int NOT NULL,
  `numero_lote_fab` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_produccion` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_cajas` int NOT NULL DEFAULT '0',
  `unidades_por_caja` int NOT NULL DEFAULT '1',
  `precio_por_caja` decimal(12,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_detalle_compra`),
  KEY `fk_dc_compra` (`id_compra`),
  KEY `fk_dc_lote` (`id_lote`),
  KEY `fk_dc_producto` (`id_producto`),
  CONSTRAINT `fk_dc_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  CONSTRAINT `fk_dc_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `fk_dc_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
INSERT INTO `detalle_compra` VALUES
(1,1,NULL,239,NULL,NULL,NULL,12,12,1.00,12.00);
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_lote` int DEFAULT NULL,
  `id_producto` int NOT NULL,
  `tipo_cantidad` enum('CAJA','UNIDAD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNIDAD',
  `id_conversion` int DEFAULT NULL,
  `cantidad` decimal(14,4) NOT NULL DEFAULT '1.0000',
  `precio_unitario` decimal(12,2) NOT NULL DEFAULT '0.00',
  `descuento_pct` decimal(5,2) NOT NULL DEFAULT '0.00',
  `descuento_monto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_detalle_venta`),
  KEY `fk_dv_venta` (`id_venta`),
  KEY `fk_dv_lote` (`id_lote`),
  KEY `fk_dv_producto` (`id_producto`),
  KEY `fk_dv_conversion` (`id_conversion`),
  CONSTRAINT `fk_dv_conversion` FOREIGN KEY (`id_conversion`) REFERENCES `conversion_unidad` (`id_conversion`),
  CONSTRAINT `fk_dv_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `fk_dv_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_dv_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES
(1,1,33,33,'UNIDAD',NULL,1.0000,110.00,0.00,9.02,100.98),
(2,1,97,97,'UNIDAD',NULL,1.0000,134.00,0.00,10.98,123.02),
(3,2,249,248,'UNIDAD',NULL,1.0000,195.00,0.00,0.00,195.00),
(4,2,275,274,'UNIDAD',NULL,1.0000,90.00,0.00,0.00,90.00),
(5,3,267,266,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00),
(6,4,299,298,'UNIDAD',NULL,1.0000,134.00,0.00,0.00,134.00),
(7,4,301,300,'UNIDAD',NULL,1.0000,122.00,0.00,0.00,122.00),
(8,5,245,244,'UNIDAD',NULL,1.0000,110.00,0.00,0.00,110.00),
(9,6,275,274,'UNIDAD',NULL,1.0000,90.00,0.00,0.00,90.00),
(10,7,235,234,'UNIDAD',NULL,1.0000,110.00,0.00,0.00,110.00),
(11,7,245,244,'UNIDAD',NULL,1.0000,110.00,0.00,0.00,110.00),
(12,8,181,180,'UNIDAD',NULL,1.0000,86.00,0.00,0.00,86.00),
(13,9,247,246,'UNIDAD',NULL,1.0000,104.00,0.00,0.00,104.00),
(14,10,281,280,'UNIDAD',NULL,1.0000,86.00,0.00,0.00,86.00),
(15,11,281,280,'UNIDAD',NULL,1.0000,86.00,0.00,0.00,86.00),
(16,12,247,246,'UNIDAD',NULL,1.0000,104.00,0.00,0.00,104.00),
(17,13,241,240,'UNIDAD',NULL,1.0000,65.00,0.00,0.00,65.00),
(18,14,267,266,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00),
(19,15,267,266,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00),
(20,16,265,264,'UNIDAD',NULL,1.0000,72.00,0.00,0.00,72.00),
(21,17,267,266,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00),
(22,18,240,239,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00),
(23,19,240,239,'CAJA',NULL,1.0000,1.00,0.00,0.00,1.00),
(24,20,240,239,'CAJA',NULL,1.0000,1.00,0.00,0.00,1.00),
(25,21,240,239,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00),
(26,22,240,239,'UNIDAD',NULL,1.0000,1.00,0.00,0.00,1.00);
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id_empresa` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `setup_completado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
INSERT INTO `empresa` VALUES
(1,'AgroFelipe',NULL,NULL,NULL,NULL,NULL,'/uploads/config-logo-1.png',1,'2026-06-20 18:21:25',1),
(4,'AgroFelipeBasico',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-06-25 11:10:40',1),
(5,'AgroPrimiun',NULL,NULL,NULL,NULL,NULL,'/uploads/config-logo-5.png',1,'2026-06-29 22:37:22',1);
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lote`
--

DROP TABLE IF EXISTS `lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote` (
  `id_lote` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `numero_lote` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_produccion` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `fecha_ingreso_almacen` date NOT NULL,
  `cantidad_cajas` int NOT NULL DEFAULT '0',
  `unidades_por_caja` int NOT NULL DEFAULT '1',
  `precio_por_caja` decimal(12,2) NOT NULL DEFAULT '0.00',
  `stock_cajas` int NOT NULL DEFAULT '0',
  `stock_unidades` int NOT NULL DEFAULT '0',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lote`),
  KEY `fk_lote_producto` (`id_producto`),
  KEY `fk_lote_sucursal` (`id_sucursal`),
  CONSTRAINT `fk_lote_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_lote_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=519 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lote` WRITE;
/*!40000 ALTER TABLE `lote` DISABLE KEYS */;
INSERT INTO `lote` VALUES
(1,1,1,'L-SEM-26001','2025-01-01','2027-01-01','2026-01-01',20,1,108.00,20,0,'Almacenado en estantería principal',1,'2026-06-20 18:23:56'),
(2,2,2,'L-SEM-26002','2025-02-02','2028-02-02','2026-02-02',21,1,340.00,20,1,NULL,1,'2026-06-20 18:23:56'),
(3,3,1,'L-SEM-26003','2025-03-03','2027-03-03','2026-03-03',22,1,230.00,20,2,NULL,1,'2026-06-20 18:23:56'),
(4,4,2,'L-SEM-26004','2025-04-04','2028-04-04','2026-04-04',23,1,215.00,20,3,NULL,1,'2026-06-20 18:23:56'),
(5,5,1,'L-SEM-26005','2025-05-05','2027-05-05','2026-05-05',24,1,135.00,20,4,NULL,1,'2026-06-20 18:23:56'),
(6,6,2,'L-SEM-26006','2025-06-06','2028-06-06','2026-06-06',25,1,290.00,20,0,NULL,1,'2026-06-20 18:23:56'),
(7,7,1,'L-SEM-26007','2025-07-07','2027-07-07','2026-01-07',26,1,160.00,20,1,NULL,1,'2026-06-20 18:23:56'),
(8,8,2,'L-SEM-26008','2025-08-08','2028-08-08','2026-02-08',27,1,85.00,20,2,'Almacenado en estantería principal',1,'2026-06-20 18:23:56'),
(9,9,1,'L-SEM-26009','2025-09-09','2027-09-09','2026-03-09',28,1,125.00,20,3,NULL,1,'2026-06-20 18:23:56'),
(10,10,2,'L-SEM-26010','2025-10-10','2028-10-10','2026-04-10',29,1,98.00,20,4,NULL,1,'2026-06-20 18:23:56'),
(11,11,1,'L-SEM-26011','2025-11-11','2027-11-11','2026-05-11',30,2,38.00,20,0,NULL,1,'2026-06-20 18:23:56'),
(12,12,2,'L-SEM-26012','2025-12-12','2028-12-12','2026-06-12',31,3,34.00,20,1,NULL,1,'2026-06-20 18:23:56'),
(13,13,1,'L-SEM-26013','2025-01-13','2027-01-13','2026-01-13',32,1,29.00,32,2,NULL,1,'2026-06-20 18:23:56'),
(14,14,2,'L-SEM-26014','2025-02-14','2028-02-14','2026-02-14',33,2,25.00,32,3,NULL,1,'2026-06-20 18:23:56'),
(15,15,1,'L-SEM-26015','2025-03-15','2027-03-15','2026-03-15',34,3,46.00,32,4,'Almacenado en estantería principal',1,'2026-06-20 18:23:56'),
(16,16,2,'L-SEM-26016','2025-04-16','2028-04-16','2026-04-16',35,1,185.00,32,0,NULL,1,'2026-06-20 18:23:56'),
(17,17,1,'L-SEM-26017','2025-05-17','2027-05-17','2026-05-17',36,1,140.00,32,1,NULL,1,'2026-06-20 18:23:56'),
(18,18,2,'L-SEM-26018','2025-06-18','2028-06-18','2026-06-18',37,1,260.00,32,2,NULL,1,'2026-06-20 18:23:56'),
(19,19,1,'L-SEM-26019','2025-07-19','2027-07-19','2026-01-19',38,1,50.00,32,3,NULL,1,'2026-06-20 18:23:56'),
(20,20,2,'L-SEM-26020','2025-08-20','2028-08-20','2026-02-20',39,2,32.00,32,4,NULL,1,'2026-06-20 18:23:56'),
(21,21,1,'L-FER-26021','2025-09-21','2027-09-21','2026-03-21',40,1,185.00,32,0,NULL,1,'2026-06-20 18:23:56'),
(22,22,2,'L-FER-26022','2025-10-22','2028-10-22','2026-04-22',41,1,285.00,32,1,'Almacenado en estantería principal',1,'2026-06-20 18:23:56'),
(23,23,1,'L-FER-26023','2025-11-23','2027-11-23','2026-05-23',42,1,250.00,32,2,NULL,1,'2026-06-20 18:23:56'),
(24,24,2,'L-FER-26024','2025-12-24','2028-12-24','2026-06-24',43,1,168.00,32,3,NULL,1,'2026-06-20 18:23:56'),
(25,25,1,'L-FER-26025','2025-01-25','2027-01-25','2026-01-25',44,1,212.00,44,4,NULL,1,'2026-06-20 18:23:56'),
(26,26,2,'L-FER-26026','2025-02-01','2028-02-01','2026-02-26',45,1,230.00,44,0,NULL,1,'2026-06-20 18:23:56'),
(27,27,1,'L-FER-26027','2025-03-02','2027-03-02','2026-03-01',46,1,258.00,44,1,NULL,1,'2026-06-20 18:23:56'),
(28,28,2,'L-FER-26028','2025-04-03','2028-04-03','2026-04-02',47,1,222.00,44,2,NULL,1,'2026-06-20 18:23:56'),
(29,29,1,'L-FER-26029','2025-05-04','2027-05-04','2026-05-03',48,1,150.00,44,3,'Almacenado en estantería principal',1,'2026-06-20 18:23:56'),
(30,30,2,'L-FER-26030','2025-06-05','2028-06-05','2026-06-04',49,1,132.00,44,4,NULL,1,'2026-06-20 18:23:56'),
(31,31,1,'L-FER-26031','2025-07-06','2027-07-06','2026-01-05',50,1,68.00,44,0,NULL,1,'2026-06-20 18:23:56'),
(32,32,2,'L-FER-26032','2025-08-07','2028-08-07','2026-02-06',51,1,50.00,44,1,NULL,1,'2026-06-20 18:23:56'),
(33,33,1,'L-FER-26033','2025-09-08','2027-09-08','2026-03-07',52,1,82.00,1,1,NULL,1,'2026-06-20 18:23:56'),
(34,34,2,'L-FER-26034','2025-10-09','2028-10-09','2026-04-08',53,1,123.00,44,3,NULL,1,'2026-06-20 18:23:56'),
(35,35,1,'L-FER-26035','2025-11-10','2027-11-10','2026-05-09',54,1,266.00,44,4,NULL,1,'2026-06-20 18:23:56'),
(36,36,2,'L-AGQ-26036','2025-12-11','2028-12-11','2026-06-10',55,1,46.00,44,0,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(37,37,1,'L-AGQ-26037','2025-01-12','2027-01-12','2026-01-11',56,1,50.00,56,1,NULL,1,'2026-06-20 18:23:57'),
(38,38,2,'L-AGQ-26038','2025-02-13','2028-02-13','2026-02-12',57,1,40.00,56,2,NULL,1,'2026-06-20 18:23:57'),
(39,39,1,'L-AGQ-26039','2025-03-14','2027-03-14','2026-03-13',58,1,43.00,56,3,NULL,1,'2026-06-20 18:23:57'),
(40,40,2,'L-AGQ-26040','2025-04-15','2028-04-15','2026-04-14',59,1,58.00,56,4,NULL,1,'2026-06-20 18:23:57'),
(41,41,1,'L-AGQ-26041','2025-05-16','2027-05-16','2026-05-15',20,1,54.00,16,0,NULL,1,'2026-06-20 18:23:57'),
(42,42,2,'L-AGQ-26042','2025-06-17','2028-06-17','2026-06-16',21,1,100.00,16,1,NULL,1,'2026-06-20 18:23:57'),
(43,43,1,'L-AGQ-26043','2025-07-18','2027-07-18','2026-01-17',22,1,75.00,16,2,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(44,44,2,'L-AGQ-26044','2025-08-19','2028-08-19','2026-02-18',23,1,62.00,16,3,NULL,1,'2026-06-20 18:23:57'),
(45,45,1,'L-AGQ-26045','2025-09-20','2027-09-20','2026-03-19',24,1,70.00,16,4,NULL,1,'2026-06-20 18:23:57'),
(46,46,2,'L-AGQ-26046','2025-10-21','2028-10-21','2026-04-20',25,1,108.00,16,0,NULL,1,'2026-06-20 18:23:57'),
(47,47,1,'L-AGQ-26047','2025-11-22','2027-11-22','2026-05-21',26,2,133.00,16,1,NULL,1,'2026-06-20 18:23:57'),
(48,48,2,'L-AGQ-26048','2025-12-23','2028-12-23','2026-06-22',27,1,79.00,16,2,NULL,1,'2026-06-20 18:23:57'),
(49,49,1,'L-AGQ-26049','2025-01-24','2027-01-24','2026-01-23',28,1,92.00,28,3,NULL,1,'2026-06-20 18:23:57'),
(50,50,2,'L-AGQ-26050','2025-02-25','2028-02-25','2026-02-24',29,2,116.00,28,4,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(51,51,1,'L-AGQ-26051','2025-03-01','2027-03-01','2026-03-25',30,1,104.00,28,0,NULL,1,'2026-06-20 18:23:57'),
(52,52,2,'L-AGQ-26052','2025-04-02','2028-04-02','2026-04-26',31,1,73.00,28,1,NULL,1,'2026-06-20 18:23:57'),
(53,53,1,'L-AGQ-26053','2025-05-03','2027-05-03','2026-05-01',32,1,58.00,28,2,NULL,1,'2026-06-20 18:23:57'),
(54,54,2,'L-AGQ-26054','2025-06-04','2028-06-04','2026-06-02',33,1,95.00,28,3,NULL,1,'2026-06-20 18:23:57'),
(55,55,1,'L-AGQ-26055','2025-07-05','2027-07-05','2026-01-03',34,1,125.00,28,4,NULL,1,'2026-06-20 18:23:57'),
(56,56,2,'L-VET-26056','2025-08-06','2028-08-06','2026-02-04',35,2,37.00,28,0,NULL,1,'2026-06-20 18:23:57'),
(57,57,1,'L-VET-26057','2025-09-07','2027-09-07','2026-03-05',36,3,54.00,28,1,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(58,58,2,'L-VET-26058','2025-10-08','2028-10-08','2026-04-06',37,1,58.00,28,2,NULL,1,'2026-06-20 18:23:57'),
(59,59,1,'L-VET-26059','2025-11-09','2027-11-09','2026-05-07',38,2,46.00,28,3,NULL,1,'2026-06-20 18:23:57'),
(60,60,2,'L-VET-26060','2025-12-10','2028-12-10','2026-06-08',39,3,50.00,28,4,NULL,1,'2026-06-20 18:23:57'),
(61,61,1,'L-VET-26061','2025-01-11','2027-01-11','2026-01-09',40,1,40.00,40,0,NULL,1,'2026-06-20 18:23:57'),
(62,62,2,'L-VET-26062','2025-02-12','2028-02-12','2026-02-10',41,2,35.00,40,1,NULL,1,'2026-06-20 18:23:57'),
(63,63,1,'L-VET-26063','2025-03-13','2027-03-13','2026-03-11',42,3,48.00,40,2,NULL,1,'2026-06-20 18:23:57'),
(64,64,2,'L-VET-26064','2025-04-14','2028-04-14','2026-04-12',43,1,62.00,40,3,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(65,65,1,'L-VET-26065','2025-05-15','2027-05-15','2026-05-13',44,2,31.00,40,4,NULL,1,'2026-06-20 18:23:57'),
(66,66,2,'L-VET-26066','2025-06-16','2028-06-16','2026-06-14',45,1,79.00,40,0,NULL,1,'2026-06-20 18:23:57'),
(67,67,1,'L-VET-26067','2025-07-17','2027-07-17','2026-01-15',46,1,56.00,40,1,NULL,1,'2026-06-20 18:23:57'),
(68,68,2,'L-ALI-26068','2025-08-18','2028-08-18','2026-02-16',47,1,172.00,40,2,NULL,1,'2026-06-20 18:23:57'),
(69,69,1,'L-ALI-26069','2025-09-19','2027-09-19','2026-03-17',48,1,163.00,40,3,NULL,1,'2026-06-20 18:23:57'),
(70,70,2,'L-ALI-26070','2025-10-20','2028-10-20','2026-04-18',49,1,185.00,40,4,NULL,1,'2026-06-20 18:23:57'),
(71,71,1,'L-ALI-26071','2025-11-21','2027-11-21','2026-05-19',50,1,176.00,40,0,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(72,72,2,'L-ALI-26072','2025-12-22','2028-12-22','2026-06-20',51,1,76.00,40,1,NULL,1,'2026-06-20 18:23:57'),
(73,73,1,'L-ALI-26073','2025-01-23','2027-01-23','2026-01-21',52,1,63.00,52,2,NULL,1,'2026-06-20 18:23:57'),
(74,74,2,'L-ALI-26074','2025-02-24','2028-02-24','2026-02-22',53,1,95.00,52,3,NULL,1,'2026-06-20 18:23:57'),
(75,75,1,'L-ALI-26075','2025-03-25','2027-03-25','2026-03-23',54,1,54.00,52,4,NULL,1,'2026-06-20 18:23:57'),
(76,76,2,'L-HER-26076','2025-04-01',NULL,'2026-04-24',55,1,46.00,52,0,NULL,1,'2026-06-20 18:23:57'),
(77,77,1,'L-HER-26077','2025-05-02',NULL,'2026-05-25',56,2,70.00,52,1,NULL,1,'2026-06-20 18:23:57'),
(78,78,2,'L-HER-26078','2025-06-03',NULL,'2026-06-26',57,3,50.00,52,2,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(79,79,1,'L-HER-26079','2025-07-04',NULL,'2026-01-01',58,1,58.00,52,3,NULL,1,'2026-06-20 18:23:57'),
(80,80,2,'L-HER-26080','2025-08-05',NULL,'2026-02-02',59,2,275.00,52,4,NULL,1,'2026-06-20 18:23:57'),
(81,81,1,'L-HER-26081','2025-09-06',NULL,'2026-03-03',20,3,62.00,12,0,NULL,1,'2026-06-20 18:23:57'),
(82,82,2,'L-HER-26082','2025-10-07',NULL,'2026-04-04',21,1,390.00,12,1,NULL,1,'2026-06-20 18:23:57'),
(83,83,1,'L-HER-26083','2025-11-08',NULL,'2026-05-05',22,2,79.00,12,2,NULL,1,'2026-06-20 18:23:57'),
(84,84,2,'L-HER-26084','2025-12-09',NULL,'2026-06-06',23,3,23.00,12,3,NULL,1,'2026-06-20 18:23:57'),
(85,85,1,'L-HER-26085','2025-01-10',NULL,'2026-01-07',24,1,18.00,24,4,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(86,86,2,'L-HER-26086','2025-02-11',NULL,'2026-02-08',25,2,54.00,24,0,NULL,1,'2026-06-20 18:23:57'),
(87,87,1,'L-HER-26087','2025-03-12',NULL,'2026-03-09',26,3,37.00,24,1,NULL,1,'2026-06-20 18:23:57'),
(88,88,2,'L-RIE-26088','2025-04-13',NULL,'2026-04-10',27,1,3.00,24,2,NULL,1,'2026-06-20 18:23:57'),
(89,89,1,'L-RIE-26089','2025-05-14',NULL,'2026-05-11',28,2,2.00,24,3,NULL,1,'2026-06-20 18:23:57'),
(90,90,2,'L-RIE-26090','2025-06-15',NULL,'2026-06-12',29,3,37.00,24,4,NULL,1,'2026-06-20 18:23:57'),
(91,91,1,'L-RIE-26091','2025-07-16',NULL,'2026-01-13',30,1,6.00,24,0,NULL,1,'2026-06-20 18:23:57'),
(92,92,2,'L-RIE-26092','2025-08-17',NULL,'2026-02-14',31,2,1.00,5,10,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(93,93,1,'L-RIE-26093','2025-09-18',NULL,'2026-03-15',32,3,14.00,24,2,NULL,1,'2026-06-20 18:23:57'),
(94,94,2,'L-RIE-26094','2025-10-19',NULL,'2026-04-16',33,1,100.00,24,3,NULL,1,'2026-06-20 18:23:57'),
(95,95,1,'L-RIE-26095','2025-11-20',NULL,'2026-05-17',34,2,2.00,24,4,NULL,1,'2026-06-20 18:23:57'),
(96,96,2,'L-FOL-26096','2025-12-21','2028-12-21','2026-06-18',35,1,108.00,24,0,NULL,1,'2026-06-20 18:23:57'),
(97,97,1,'L-FOL-26097','2025-01-22','2027-01-22','2026-01-19',36,1,92.00,0,0,NULL,1,'2026-06-20 18:23:57'),
(98,98,2,'L-FOL-26098','2025-02-23','2028-02-23','2026-02-20',37,1,79.00,36,2,NULL,1,'2026-06-20 18:23:57'),
(99,99,1,'L-FOL-26099','2025-03-24','2027-03-24','2026-03-21',38,1,83.00,36,3,'Almacenado en estantería principal',1,'2026-06-20 18:23:57'),
(100,100,2,'L-FOL-26100','2025-04-25','2028-04-25','2026-04-22',39,1,87.00,36,4,NULL,1,'2026-06-20 18:23:57'),
(103,102,4,'L-SEM-26001','2025-01-01','2027-01-01','2026-01-01',20,1,108.00,20,0,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(104,103,5,'L-SEM-26002','2025-02-02','2028-02-02','2026-02-02',21,1,340.00,20,1,NULL,1,'2026-06-25 11:13:13'),
(105,104,4,'L-SEM-26003','2025-03-03','2027-03-03','2026-03-03',22,1,230.00,20,2,NULL,1,'2026-06-25 11:13:13'),
(106,105,5,'L-SEM-26004','2025-04-04','2028-04-04','2026-04-04',23,1,215.00,20,3,NULL,1,'2026-06-25 11:13:13'),
(107,106,4,'L-SEM-26005','2025-05-05','2027-05-05','2026-05-05',24,1,135.00,20,4,NULL,1,'2026-06-25 11:13:13'),
(108,107,5,'L-SEM-26006','2025-06-06','2028-06-06','2026-06-06',25,1,290.00,20,0,NULL,1,'2026-06-25 11:13:13'),
(109,108,4,'L-SEM-26007','2025-07-07','2027-07-07','2026-01-07',26,1,160.00,20,1,NULL,1,'2026-06-25 11:13:13'),
(110,109,5,'L-SEM-26008','2025-08-08','2028-08-08','2026-02-08',27,1,85.00,20,2,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(111,110,4,'L-SEM-26009','2025-09-09','2027-09-09','2026-03-09',28,1,125.00,20,3,NULL,1,'2026-06-25 11:13:13'),
(112,111,5,'L-SEM-26010','2025-10-10','2028-10-10','2026-04-10',29,1,98.00,20,4,NULL,1,'2026-06-25 11:13:13'),
(113,112,4,'L-SEM-26011','2025-11-11','2027-11-11','2026-05-11',30,2,38.00,20,0,NULL,1,'2026-06-25 11:13:13'),
(114,113,5,'L-SEM-26012','2025-12-12','2028-12-12','2026-06-12',31,3,34.00,20,1,NULL,1,'2026-06-25 11:13:13'),
(115,114,4,'L-SEM-26013','2025-01-13','2027-01-13','2026-01-13',32,1,29.00,32,2,NULL,1,'2026-06-25 11:13:13'),
(116,115,5,'L-SEM-26014','2025-02-14','2028-02-14','2026-02-14',33,2,25.00,32,3,NULL,1,'2026-06-25 11:13:13'),
(117,116,4,'L-SEM-26015','2025-03-15','2027-03-15','2026-03-15',34,3,46.00,32,4,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(118,117,5,'L-SEM-26016','2025-04-16','2028-04-16','2026-04-16',35,1,185.00,32,0,NULL,1,'2026-06-25 11:13:13'),
(119,118,4,'L-SEM-26017','2025-05-17','2027-05-17','2026-05-17',36,1,140.00,32,1,NULL,1,'2026-06-25 11:13:13'),
(120,119,5,'L-SEM-26018','2025-06-18','2028-06-18','2026-06-18',37,1,260.00,32,2,NULL,1,'2026-06-25 11:13:13'),
(121,120,4,'L-SEM-26019','2025-07-19','2027-07-19','2026-01-19',38,1,50.00,32,3,NULL,1,'2026-06-25 11:13:13'),
(122,121,5,'L-SEM-26020','2025-08-20','2028-08-20','2026-02-20',39,2,32.00,32,4,NULL,1,'2026-06-25 11:13:13'),
(123,122,4,'L-FER-26021','2025-09-21','2027-09-21','2026-03-21',40,1,185.00,32,0,NULL,1,'2026-06-25 11:13:13'),
(124,123,5,'L-FER-26022','2025-10-22','2028-10-22','2026-04-22',41,1,285.00,32,1,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(125,124,4,'L-FER-26023','2025-11-23','2027-11-23','2026-05-23',42,1,250.00,32,2,NULL,1,'2026-06-25 11:13:13'),
(126,125,5,'L-FER-26024','2025-12-24','2028-12-24','2026-06-24',43,1,168.00,32,3,NULL,1,'2026-06-25 11:13:13'),
(127,126,4,'L-FER-26025','2025-01-25','2027-01-25','2026-01-25',44,1,212.00,44,4,NULL,1,'2026-06-25 11:13:13'),
(128,127,5,'L-FER-26026','2025-02-01','2028-02-01','2026-02-26',45,1,230.00,44,0,NULL,1,'2026-06-25 11:13:13'),
(129,128,4,'L-FER-26027','2025-03-02','2027-03-02','2026-03-01',46,1,258.00,44,1,NULL,1,'2026-06-25 11:13:13'),
(130,129,5,'L-FER-26028','2025-04-03','2028-04-03','2026-04-02',47,1,222.00,44,2,NULL,1,'2026-06-25 11:13:13'),
(131,130,4,'L-FER-26029','2025-05-04','2027-05-04','2026-05-03',48,1,150.00,44,3,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(132,131,5,'L-FER-26030','2025-06-05','2028-06-05','2026-06-04',49,1,132.00,44,4,NULL,1,'2026-06-25 11:13:13'),
(133,132,4,'L-FER-26031','2025-07-06','2027-07-06','2026-01-05',50,1,68.00,44,0,NULL,1,'2026-06-25 11:13:13'),
(134,133,5,'L-FER-26032','2025-08-07','2028-08-07','2026-02-06',51,1,50.00,44,1,NULL,1,'2026-06-25 11:13:13'),
(135,134,4,'L-FER-26033','2025-09-08','2027-09-08','2026-03-07',52,1,82.00,44,2,NULL,1,'2026-06-25 11:13:13'),
(136,135,5,'L-FER-26034','2025-10-09','2028-10-09','2026-04-08',53,1,123.00,44,3,NULL,1,'2026-06-25 11:13:13'),
(137,136,4,'L-FER-26035','2025-11-10','2027-11-10','2026-05-09',54,1,266.00,44,4,NULL,1,'2026-06-25 11:13:13'),
(138,137,5,'L-AGQ-26036','2025-12-11','2028-12-11','2026-06-10',55,1,46.00,44,0,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(139,138,4,'L-AGQ-26037','2025-01-12','2027-01-12','2026-01-11',56,1,50.00,56,1,NULL,1,'2026-06-25 11:13:13'),
(140,139,5,'L-AGQ-26038','2025-02-13','2028-02-13','2026-02-12',57,1,40.00,56,2,NULL,1,'2026-06-25 11:13:13'),
(141,140,4,'L-AGQ-26039','2025-03-14','2027-03-14','2026-03-13',58,1,43.00,56,3,NULL,1,'2026-06-25 11:13:13'),
(142,141,5,'L-AGQ-26040','2025-04-15','2028-04-15','2026-04-14',59,1,58.00,56,4,NULL,1,'2026-06-25 11:13:13'),
(143,142,4,'L-AGQ-26041','2025-05-16','2027-05-16','2026-05-15',20,1,54.00,16,0,NULL,1,'2026-06-25 11:13:13'),
(144,143,5,'L-AGQ-26042','2025-06-17','2028-06-17','2026-06-16',21,1,100.00,16,1,NULL,1,'2026-06-25 11:13:13'),
(145,144,4,'L-AGQ-26043','2025-07-18','2027-07-18','2026-01-17',22,1,75.00,16,2,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(146,145,5,'L-AGQ-26044','2025-08-19','2028-08-19','2026-02-18',23,1,62.00,16,3,NULL,1,'2026-06-25 11:13:13'),
(147,146,4,'L-AGQ-26045','2025-09-20','2027-09-20','2026-03-19',24,1,70.00,16,4,NULL,1,'2026-06-25 11:13:13'),
(148,147,5,'L-AGQ-26046','2025-10-21','2028-10-21','2026-04-20',25,1,108.00,16,0,NULL,1,'2026-06-25 11:13:13'),
(149,148,4,'L-AGQ-26047','2025-11-22','2027-11-22','2026-05-21',26,2,133.00,16,1,NULL,1,'2026-06-25 11:13:13'),
(150,149,5,'L-AGQ-26048','2025-12-23','2028-12-23','2026-06-22',27,1,79.00,16,2,NULL,1,'2026-06-25 11:13:13'),
(151,150,4,'L-AGQ-26049','2025-01-24','2027-01-24','2026-01-23',28,1,92.00,28,3,NULL,1,'2026-06-25 11:13:13'),
(152,151,5,'L-AGQ-26050','2025-02-25','2028-02-25','2026-02-24',29,2,116.00,28,4,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(153,152,4,'L-AGQ-26051','2025-03-01','2027-03-01','2026-03-25',30,1,104.00,28,0,NULL,1,'2026-06-25 11:13:13'),
(154,153,5,'L-AGQ-26052','2025-04-02','2028-04-02','2026-04-26',31,1,73.00,28,1,NULL,1,'2026-06-25 11:13:13'),
(155,154,4,'L-AGQ-26053','2025-05-03','2027-05-03','2026-05-01',32,1,58.00,28,2,NULL,1,'2026-06-25 11:13:13'),
(156,155,5,'L-AGQ-26054','2025-06-04','2028-06-04','2026-06-02',33,1,95.00,28,3,NULL,1,'2026-06-25 11:13:13'),
(157,156,4,'L-AGQ-26055','2025-07-05','2027-07-05','2026-01-03',34,1,125.00,28,4,NULL,1,'2026-06-25 11:13:13'),
(158,157,5,'L-VET-26056','2025-08-06','2028-08-06','2026-02-04',35,2,37.00,28,0,NULL,1,'2026-06-25 11:13:13'),
(159,158,4,'L-VET-26057','2025-09-07','2027-09-07','2026-03-05',36,3,54.00,28,1,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(160,159,5,'L-VET-26058','2025-10-08','2028-10-08','2026-04-06',37,1,58.00,28,2,NULL,1,'2026-06-25 11:13:13'),
(161,160,4,'L-VET-26059','2025-11-09','2027-11-09','2026-05-07',38,2,46.00,28,3,NULL,1,'2026-06-25 11:13:13'),
(162,161,5,'L-VET-26060','2025-12-10','2028-12-10','2026-06-08',39,3,50.00,28,4,NULL,1,'2026-06-25 11:13:13'),
(163,162,4,'L-VET-26061','2025-01-11','2027-01-11','2026-01-09',40,1,40.00,40,0,NULL,1,'2026-06-25 11:13:13'),
(164,163,5,'L-VET-26062','2025-02-12','2028-02-12','2026-02-10',41,2,35.00,40,1,NULL,1,'2026-06-25 11:13:13'),
(165,164,4,'L-VET-26063','2025-03-13','2027-03-13','2026-03-11',42,3,48.00,40,2,NULL,1,'2026-06-25 11:13:13'),
(166,165,5,'L-VET-26064','2025-04-14','2028-04-14','2026-04-12',43,1,62.00,40,3,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(167,166,4,'L-VET-26065','2025-05-15','2027-05-15','2026-05-13',44,2,31.00,40,4,NULL,1,'2026-06-25 11:13:13'),
(168,167,5,'L-VET-26066','2025-06-16','2028-06-16','2026-06-14',45,1,79.00,40,0,NULL,1,'2026-06-25 11:13:13'),
(169,168,4,'L-VET-26067','2025-07-17','2027-07-17','2026-01-15',46,1,56.00,40,1,NULL,1,'2026-06-25 11:13:13'),
(170,169,5,'L-ALI-26068','2025-08-18','2028-08-18','2026-02-16',47,1,172.00,40,2,NULL,1,'2026-06-25 11:13:13'),
(171,170,4,'L-ALI-26069','2025-09-19','2027-09-19','2026-03-17',48,1,163.00,40,3,NULL,1,'2026-06-25 11:13:13'),
(172,171,5,'L-ALI-26070','2025-10-20','2028-10-20','2026-04-18',49,1,185.00,40,4,NULL,1,'2026-06-25 11:13:13'),
(173,172,4,'L-ALI-26071','2025-11-21','2027-11-21','2026-05-19',50,1,176.00,40,0,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(174,173,5,'L-ALI-26072','2025-12-22','2028-12-22','2026-06-20',51,1,76.00,40,1,NULL,1,'2026-06-25 11:13:13'),
(175,174,4,'L-ALI-26073','2025-01-23','2027-01-23','2026-01-21',52,1,63.00,52,2,NULL,1,'2026-06-25 11:13:13'),
(176,175,5,'L-ALI-26074','2025-02-24','2028-02-24','2026-02-22',53,1,95.00,52,3,NULL,1,'2026-06-25 11:13:13'),
(177,176,4,'L-ALI-26075','2025-03-25','2027-03-25','2026-03-23',54,1,54.00,52,4,NULL,1,'2026-06-25 11:13:13'),
(178,177,5,'L-HER-26076','2025-04-01',NULL,'2026-04-24',55,1,46.00,52,0,NULL,1,'2026-06-25 11:13:13'),
(179,178,4,'L-HER-26077','2025-05-02',NULL,'2026-05-25',56,2,70.00,52,1,NULL,1,'2026-06-25 11:13:13'),
(180,179,5,'L-HER-26078','2025-06-03',NULL,'2026-06-26',57,3,50.00,52,2,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(181,180,4,'L-HER-26079','2025-07-04',NULL,'2026-01-01',58,1,58.00,2,2,NULL,1,'2026-06-25 11:13:13'),
(182,181,5,'L-HER-26080','2025-08-05',NULL,'2026-02-02',59,2,275.00,52,4,NULL,1,'2026-06-25 11:13:13'),
(183,182,4,'L-HER-26081','2025-09-06',NULL,'2026-03-03',20,3,62.00,12,0,NULL,1,'2026-06-25 11:13:13'),
(184,183,5,'L-HER-26082','2025-10-07',NULL,'2026-04-04',21,1,390.00,12,1,NULL,1,'2026-06-25 11:13:13'),
(185,184,4,'L-HER-26083','2025-11-08',NULL,'2026-05-05',22,2,79.00,12,2,NULL,1,'2026-06-25 11:13:13'),
(186,185,5,'L-HER-26084','2025-12-09',NULL,'2026-06-06',23,3,23.00,12,3,NULL,1,'2026-06-25 11:13:13'),
(187,186,4,'L-HER-26085','2025-01-10',NULL,'2026-01-07',24,1,18.00,24,4,'Almacenado en estantería principal',1,'2026-06-25 11:13:13'),
(188,187,5,'L-HER-26086','2025-02-11',NULL,'2026-02-08',25,2,54.00,10,20,NULL,1,'2026-06-25 11:13:13'),
(189,188,4,'L-HER-26087','2025-03-12',NULL,'2026-03-09',26,3,37.00,24,1,NULL,1,'2026-06-25 11:13:13'),
(190,189,5,'L-RIE-26088','2025-04-13',NULL,'2026-04-10',27,1,3.00,24,2,NULL,1,'2026-06-25 11:13:13'),
(191,190,4,'L-RIE-26089','2025-05-14',NULL,'2026-05-11',28,2,2.00,24,3,NULL,1,'2026-06-25 11:13:13'),
(192,191,5,'L-RIE-26090','2025-06-15',NULL,'2026-06-12',29,3,37.00,24,4,NULL,1,'2026-06-25 11:13:13'),
(193,192,4,'L-RIE-26091','2025-07-16',NULL,'2026-01-13',30,1,6.00,20,20,NULL,1,'2026-06-25 11:13:14'),
(194,193,5,'L-RIE-26092','2025-08-17',NULL,'2026-02-14',31,2,1.00,24,1,'Almacenado en estantería principal',1,'2026-06-25 11:13:14'),
(195,194,4,'L-RIE-26093','2025-09-18',NULL,'2026-03-15',32,3,14.00,24,2,NULL,1,'2026-06-25 11:13:14'),
(196,195,5,'L-RIE-26094','2025-10-19',NULL,'2026-04-16',33,1,100.00,24,3,NULL,1,'2026-06-25 11:13:14'),
(197,196,4,'L-RIE-26095','2025-11-20',NULL,'2026-05-17',34,2,2.00,24,4,NULL,1,'2026-06-25 11:13:14'),
(198,197,5,'L-FOL-26096','2025-12-21','2028-12-21','2026-06-18',35,1,108.00,24,0,NULL,1,'2026-06-25 11:13:14'),
(199,198,4,'L-FOL-26097','2025-01-22','2027-01-22','2026-01-19',36,1,92.00,36,1,NULL,1,'2026-06-25 11:13:14'),
(200,199,5,'L-FOL-26098','2025-02-23','2028-02-23','2026-02-20',37,1,79.00,36,2,NULL,1,'2026-06-25 11:13:14'),
(201,200,4,'L-FOL-26099','2025-03-24','2027-03-24','2026-03-21',38,1,83.00,36,3,'Almacenado en estantería principal',1,'2026-06-25 11:13:14'),
(202,201,5,'L-FOL-26100','2025-04-25','2028-04-25','2026-04-22',39,1,87.00,36,4,NULL,1,'2026-06-25 11:13:14'),
(203,202,6,'L-SEM-26001','2025-01-01','2027-01-01','2026-01-01',20,1,108.00,20,0,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(204,203,7,'L-SEM-26002','2025-02-02','2028-02-02','2026-02-02',21,1,340.00,20,1,NULL,1,'2026-06-29 22:41:20'),
(205,204,6,'L-SEM-26003','2025-03-03','2027-03-03','2026-03-03',22,1,230.00,20,2,NULL,1,'2026-06-29 22:41:20'),
(206,205,7,'L-SEM-26004','2025-04-04','2028-04-04','2026-04-04',23,1,215.00,20,3,NULL,1,'2026-06-29 22:41:20'),
(207,206,6,'L-SEM-26005','2025-05-05','2027-05-05','2026-05-05',24,1,135.00,20,4,NULL,1,'2026-06-29 22:41:20'),
(208,207,7,'L-SEM-26006','2025-06-06','2028-06-06','2026-06-06',25,1,290.00,20,0,NULL,1,'2026-06-29 22:41:20'),
(209,208,6,'L-SEM-26007','2025-07-07','2027-07-07','2026-01-07',26,1,160.00,20,1,NULL,1,'2026-06-29 22:41:20'),
(210,209,7,'L-SEM-26008','2025-08-08','2028-08-08','2026-02-08',27,1,85.00,20,2,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(211,210,6,'L-SEM-26009','2025-09-09','2027-09-09','2026-03-09',28,1,125.00,20,3,NULL,1,'2026-06-29 22:41:20'),
(212,211,7,'L-SEM-26010','2025-10-10','2028-10-10','2026-04-10',29,1,98.00,20,4,NULL,1,'2026-06-29 22:41:20'),
(213,212,6,'L-SEM-26011','2025-11-11','2027-11-11','2026-05-11',30,2,38.00,20,0,NULL,1,'2026-06-29 22:41:20'),
(214,213,7,'L-SEM-26012','2025-12-12','2028-12-12','2026-06-12',31,3,34.00,20,1,NULL,1,'2026-06-29 22:41:20'),
(215,214,6,'L-SEM-26013','2025-01-13','2027-01-13','2026-01-13',32,1,29.00,32,2,NULL,1,'2026-06-29 22:41:20'),
(216,215,7,'L-SEM-26014','2025-02-14','2028-02-14','2026-02-14',33,2,25.00,32,3,NULL,1,'2026-06-29 22:41:20'),
(217,216,6,'L-SEM-26015','2025-03-15','2027-03-15','2026-03-15',34,3,46.00,32,4,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(218,217,7,'L-SEM-26016','2025-04-16','2028-04-16','2026-04-16',35,1,185.00,32,0,NULL,1,'2026-06-29 22:41:20'),
(219,218,6,'L-SEM-26017','2025-05-17','2027-05-17','2026-05-17',36,1,140.00,32,1,NULL,1,'2026-06-29 22:41:20'),
(220,219,7,'L-SEM-26018','2025-06-18','2028-06-18','2026-06-18',37,1,260.00,32,2,NULL,1,'2026-06-29 22:41:20'),
(221,220,6,'L-SEM-26019','2025-07-19','2027-07-19','2026-01-19',38,1,50.00,32,3,NULL,1,'2026-06-29 22:41:20'),
(222,221,7,'L-SEM-26020','2025-08-20','2028-08-20','2026-02-20',39,2,32.00,32,4,NULL,1,'2026-06-29 22:41:20'),
(223,222,6,'L-FER-26021','2025-09-21','2027-09-21','2026-03-21',40,1,185.00,32,0,NULL,1,'2026-06-29 22:41:20'),
(224,223,7,'L-FER-26022','2025-10-22','2028-10-22','2026-04-22',41,1,285.00,32,1,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(225,224,6,'L-FER-26023','2025-11-23','2027-11-23','2026-05-23',42,1,250.00,32,2,NULL,1,'2026-06-29 22:41:20'),
(226,225,7,'L-FER-26024','2025-12-24','2028-12-24','2026-06-24',43,1,168.00,32,3,NULL,1,'2026-06-29 22:41:20'),
(227,226,6,'L-FER-26025','2025-01-25','2027-01-25','2026-01-25',44,1,212.00,44,4,NULL,1,'2026-06-29 22:41:20'),
(228,227,7,'L-FER-26026','2025-02-01','2028-02-01','2026-02-26',45,1,230.00,44,0,NULL,1,'2026-06-29 22:41:20'),
(229,228,6,'L-FER-26027','2025-03-02','2027-03-02','2026-03-01',46,1,258.00,44,1,NULL,1,'2026-06-29 22:41:20'),
(230,229,7,'L-FER-26028','2025-04-03','2028-04-03','2026-04-02',47,1,222.00,44,2,NULL,1,'2026-06-29 22:41:20'),
(231,230,6,'L-FER-26029','2025-05-04','2027-05-04','2026-05-03',48,1,150.00,44,3,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(232,231,7,'L-FER-26030','2025-06-05','2028-06-05','2026-06-04',49,1,132.00,44,4,NULL,1,'2026-06-29 22:41:20'),
(233,232,6,'L-FER-26031','2025-07-06','2027-07-06','2026-01-05',50,1,68.00,44,0,NULL,1,'2026-06-29 22:41:20'),
(234,233,7,'L-FER-26032','2025-08-07','2028-08-07','2026-02-06',51,1,50.00,44,1,NULL,1,'2026-06-29 22:41:20'),
(235,234,6,'L-FER-26033','2025-09-08','2027-09-08','2026-03-07',52,1,82.00,1,1,NULL,1,'2026-06-29 22:41:20'),
(236,235,7,'L-FER-26034','2025-10-09','2028-10-09','2026-04-08',53,1,123.00,44,3,NULL,1,'2026-06-29 22:41:20'),
(237,236,6,'L-FER-26035','2025-11-10','2027-11-10','2026-05-09',54,1,266.00,44,4,NULL,1,'2026-06-29 22:41:20'),
(238,237,7,'L-AGQ-26036','2025-12-11','2028-12-11','2026-06-10',55,1,46.00,44,0,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(239,238,6,'L-AGQ-26037','2025-01-12','2027-01-12','2026-01-11',56,1,50.00,56,1,NULL,1,'2026-06-29 22:41:20'),
(240,239,7,'L-AGQ-26038','2025-02-13','2028-02-13','2026-02-12',57,1,40.00,7,7,NULL,1,'2026-06-29 22:41:20'),
(241,240,6,'L-AGQ-26039','2025-03-14','2027-03-14','2026-03-13',58,1,43.00,2,2,NULL,1,'2026-06-29 22:41:20'),
(242,241,7,'L-AGQ-26040','2025-04-15','2028-04-15','2026-04-14',59,1,58.00,56,4,NULL,1,'2026-06-29 22:41:20'),
(243,242,6,'L-AGQ-26041','2025-05-16','2027-05-16','2026-05-15',20,1,54.00,16,0,NULL,1,'2026-06-29 22:41:20'),
(244,243,7,'L-AGQ-26042','2025-06-17','2028-06-17','2026-06-16',21,1,100.00,16,1,NULL,1,'2026-06-29 22:41:20'),
(245,244,6,'L-AGQ-26043','2025-07-18','2027-07-18','2026-01-17',22,1,75.00,0,0,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(246,245,7,'L-AGQ-26044','2025-08-19','2028-08-19','2026-02-18',23,1,62.00,16,3,NULL,1,'2026-06-29 22:41:20'),
(247,246,6,'L-AGQ-26045','2025-09-20','2027-09-20','2026-03-19',24,1,70.00,2,2,NULL,1,'2026-06-29 22:41:20'),
(248,247,7,'L-AGQ-26046','2025-10-21','2028-10-21','2026-04-20',25,1,108.00,16,0,NULL,1,'2026-06-29 22:41:20'),
(249,248,6,'L-AGQ-26047','2025-11-22','2027-11-22','2026-05-21',26,2,133.00,0,0,NULL,1,'2026-06-29 22:41:20'),
(250,249,7,'L-AGQ-26048','2025-12-23','2028-12-23','2026-06-22',27,1,79.00,16,2,NULL,1,'2026-06-29 22:41:20'),
(251,250,6,'L-AGQ-26049','2025-01-24','2027-01-24','2026-01-23',28,1,92.00,28,3,NULL,1,'2026-06-29 22:41:20'),
(252,251,7,'L-AGQ-26050','2025-02-25','2028-02-25','2026-02-24',29,2,116.00,28,4,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(253,252,6,'L-AGQ-26051','2025-03-01','2027-03-01','2026-03-25',30,1,104.00,28,0,NULL,1,'2026-06-29 22:41:20'),
(254,253,7,'L-AGQ-26052','2025-04-02','2028-04-02','2026-04-26',31,1,73.00,28,1,NULL,1,'2026-06-29 22:41:20'),
(255,254,6,'L-AGQ-26053','2025-05-03','2027-05-03','2026-05-01',32,1,58.00,28,2,NULL,1,'2026-06-29 22:41:20'),
(256,255,7,'L-AGQ-26054','2025-06-04','2028-06-04','2026-06-02',33,1,95.00,28,3,NULL,1,'2026-06-29 22:41:20'),
(257,256,6,'L-AGQ-26055','2025-07-05','2027-07-05','2026-01-03',34,1,125.00,28,4,NULL,1,'2026-06-29 22:41:20'),
(258,257,7,'L-VET-26056','2025-08-06','2028-08-06','2026-02-04',35,2,37.00,28,0,NULL,1,'2026-06-29 22:41:20'),
(259,258,6,'L-VET-26057','2025-09-07','2027-09-07','2026-03-05',36,3,54.00,28,1,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(260,259,7,'L-VET-26058','2025-10-08','2028-10-08','2026-04-06',37,1,58.00,28,2,NULL,1,'2026-06-29 22:41:20'),
(261,260,6,'L-VET-26059','2025-11-09','2027-11-09','2026-05-07',38,2,46.00,28,3,NULL,1,'2026-06-29 22:41:20'),
(262,261,7,'L-VET-26060','2025-12-10','2028-12-10','2026-06-08',39,3,50.00,28,4,NULL,1,'2026-06-29 22:41:20'),
(263,262,6,'L-VET-26061','2025-01-11','2027-01-11','2026-01-09',40,1,40.00,40,0,NULL,1,'2026-06-29 22:41:20'),
(264,263,7,'L-VET-26062','2025-02-12','2028-02-12','2026-02-10',41,2,35.00,40,1,NULL,1,'2026-06-29 22:41:20'),
(265,264,6,'L-VET-26063','2025-03-13','2027-03-13','2026-03-11',42,3,48.00,0,1,NULL,1,'2026-06-29 22:41:20'),
(266,265,7,'L-VET-26064','2025-04-14','2028-04-14','2026-04-12',43,1,62.00,40,3,'Almacenado en estantería principal',1,'2026-06-29 22:41:20'),
(267,266,6,'L-VET-26065','2025-05-15','2027-05-15','2026-05-13',44,2,31.00,0,0,NULL,1,'2026-06-29 22:41:20'),
(268,267,7,'L-VET-26066','2025-06-16','2028-06-16','2026-06-14',45,1,79.00,40,0,NULL,1,'2026-06-29 22:41:20'),
(269,268,6,'L-VET-26067','2025-07-17','2027-07-17','2026-01-15',46,1,56.00,40,1,NULL,1,'2026-06-29 22:41:20'),
(270,269,7,'L-ALI-26068','2025-08-18','2028-08-18','2026-02-16',47,1,172.00,40,2,NULL,1,'2026-06-29 22:41:20'),
(271,270,6,'L-ALI-26069','2025-09-19','2027-09-19','2026-03-17',48,1,163.00,40,3,NULL,1,'2026-06-29 22:41:21'),
(272,271,7,'L-ALI-26070','2025-10-20','2028-10-20','2026-04-18',49,1,185.00,40,4,NULL,1,'2026-06-29 22:41:21'),
(273,272,6,'L-ALI-26071','2025-11-21','2027-11-21','2026-05-19',50,1,176.00,40,0,'Almacenado en estantería principal',1,'2026-06-29 22:41:21'),
(274,273,7,'L-ALI-26072','2025-12-22','2028-12-22','2026-06-20',51,1,76.00,40,1,NULL,1,'2026-06-29 22:41:21'),
(275,274,6,'L-ALI-26073','2025-01-23','2027-01-23','2026-01-21',52,1,63.00,0,0,NULL,1,'2026-06-29 22:41:21'),
(276,275,7,'L-ALI-26074','2025-02-24','2028-02-24','2026-02-22',53,1,95.00,52,3,NULL,1,'2026-06-29 22:41:21'),
(277,276,6,'L-ALI-26075','2025-03-25','2027-03-25','2026-03-23',54,1,54.00,52,4,NULL,1,'2026-06-29 22:41:21'),
(278,277,7,'L-HER-26076','2025-04-01',NULL,'2026-04-24',55,1,46.00,52,0,NULL,1,'2026-06-29 22:41:21'),
(279,278,6,'L-HER-26077','2025-05-02',NULL,'2026-05-25',56,2,70.00,52,1,NULL,1,'2026-06-29 22:41:21'),
(280,279,7,'L-HER-26078','2025-06-03',NULL,'2026-06-26',57,3,50.00,52,2,'Almacenado en estantería principal',1,'2026-06-29 22:41:21'),
(281,280,6,'L-HER-26079','2025-07-04',NULL,'2026-01-01',58,1,58.00,1,1,NULL,1,'2026-06-29 22:41:21'),
(282,281,7,'L-HER-26080','2025-08-05',NULL,'2026-02-02',59,2,275.00,52,4,NULL,1,'2026-06-29 22:41:21'),
(283,282,6,'L-HER-26081','2025-09-06',NULL,'2026-03-03',20,3,62.00,12,0,NULL,1,'2026-06-29 22:41:21'),
(284,283,7,'L-HER-26082','2025-10-07',NULL,'2026-04-04',21,1,390.00,12,1,NULL,1,'2026-06-29 22:41:21'),
(285,284,6,'L-HER-26083','2025-11-08',NULL,'2026-05-05',22,2,79.00,12,2,NULL,1,'2026-06-29 22:41:21'),
(286,285,7,'L-HER-26084','2025-12-09',NULL,'2026-06-06',23,3,23.00,12,3,NULL,1,'2026-06-29 22:41:21'),
(287,286,6,'L-HER-26085','2025-01-10',NULL,'2026-01-07',24,1,18.00,24,4,'Almacenado en estantería principal',1,'2026-06-29 22:41:21'),
(288,287,7,'L-HER-26086','2025-02-11',NULL,'2026-02-08',25,2,54.00,24,0,NULL,1,'2026-06-29 22:41:21'),
(289,288,6,'L-HER-26087','2025-03-12',NULL,'2026-03-09',26,3,37.00,24,1,NULL,1,'2026-06-29 22:41:21'),
(290,289,7,'L-RIE-26088','2025-04-13',NULL,'2026-04-10',27,1,3.00,24,2,NULL,1,'2026-06-29 22:41:21'),
(291,290,6,'L-RIE-26089','2025-05-14',NULL,'2026-05-11',28,2,2.00,24,3,NULL,1,'2026-06-29 22:41:21'),
(292,291,7,'L-RIE-26090','2025-06-15',NULL,'2026-06-12',29,3,37.00,24,4,NULL,1,'2026-06-29 22:41:21'),
(293,292,6,'L-RIE-26091','2025-07-16',NULL,'2026-01-13',30,1,6.00,24,0,NULL,1,'2026-06-29 22:41:21'),
(294,293,7,'L-RIE-26092','2025-08-17',NULL,'2026-02-14',31,2,1.00,24,1,'Almacenado en estantería principal',1,'2026-06-29 22:41:21'),
(295,294,6,'L-RIE-26093','2025-09-18',NULL,'2026-03-15',32,3,14.00,24,2,NULL,1,'2026-06-29 22:41:21'),
(296,295,7,'L-RIE-26094','2025-10-19',NULL,'2026-04-16',33,1,100.00,24,3,NULL,1,'2026-06-29 22:41:21'),
(297,296,6,'L-RIE-26095','2025-11-20',NULL,'2026-05-17',34,2,2.00,24,4,NULL,1,'2026-06-29 22:41:21'),
(298,297,7,'L-FOL-26096','2025-12-21','2028-12-21','2026-06-18',35,1,108.00,24,0,NULL,1,'2026-06-29 22:41:21'),
(299,298,6,'L-FOL-26097','2025-01-22','2027-01-22','2026-01-19',36,1,92.00,0,0,NULL,1,'2026-06-29 22:41:21'),
(300,299,7,'L-FOL-26098','2025-02-23','2028-02-23','2026-02-20',37,1,79.00,36,2,NULL,1,'2026-06-29 22:41:21'),
(301,300,6,'L-FOL-26099','2025-03-24','2027-03-24','2026-03-21',38,1,83.00,2,2,'Almacenado en estantería principal',1,'2026-06-29 22:41:21'),
(302,301,7,'L-FOL-26100','2025-04-25','2028-04-25','2026-04-22',39,1,87.00,36,4,NULL,1,'2026-06-29 22:41:21'),
(313,102,4,'L-SEM-26001','2025-01-01','2027-01-01','2026-01-01',20,1,108.00,20,0,'Almacenado en estantería principal',1,'2026-07-05 15:49:08'),
(314,103,5,'L-SEM-26002','2025-02-02','2028-02-02','2026-02-02',21,1,340.00,20,1,NULL,1,'2026-07-05 15:49:08'),
(315,104,4,'L-SEM-26003','2025-03-03','2027-03-03','2026-03-03',22,1,230.00,20,2,NULL,1,'2026-07-05 15:49:08'),
(316,105,5,'L-SEM-26004','2025-04-04','2028-04-04','2026-04-04',23,1,215.00,20,3,NULL,1,'2026-07-05 15:49:08'),
(317,106,4,'L-SEM-26005','2025-05-05','2027-05-05','2026-05-05',24,1,135.00,20,4,NULL,1,'2026-07-05 15:49:08'),
(318,107,5,'L-SEM-26006','2025-06-06','2028-06-06','2026-06-06',25,1,290.00,20,0,NULL,1,'2026-07-05 15:49:08'),
(319,108,4,'L-SEM-26007','2025-07-07','2027-07-07','2026-01-07',26,1,160.00,20,1,NULL,1,'2026-07-05 15:49:08'),
(320,109,5,'L-SEM-26008','2025-08-08','2028-08-08','2026-02-08',27,1,85.00,20,2,'Almacenado en estantería principal',1,'2026-07-05 15:49:08'),
(321,110,4,'L-SEM-26009','2025-09-09','2027-09-09','2026-03-09',28,1,125.00,20,3,NULL,1,'2026-07-05 15:49:09'),
(322,111,5,'L-SEM-26010','2025-10-10','2028-10-10','2026-04-10',29,1,98.00,20,4,NULL,1,'2026-07-05 15:49:09'),
(323,112,4,'L-SEM-26011','2025-11-11','2027-11-11','2026-05-11',30,2,38.00,20,0,NULL,1,'2026-07-05 15:49:09'),
(324,113,5,'L-SEM-26012','2025-12-12','2028-12-12','2026-06-12',31,3,34.00,20,1,NULL,1,'2026-07-05 15:49:09'),
(325,114,4,'L-SEM-26013','2025-01-13','2027-01-13','2026-01-13',32,1,29.00,32,2,NULL,1,'2026-07-05 15:49:09'),
(326,115,5,'L-SEM-26014','2025-02-14','2028-02-14','2026-02-14',33,2,25.00,32,3,NULL,1,'2026-07-05 15:49:09'),
(327,116,4,'L-SEM-26015','2025-03-15','2027-03-15','2026-03-15',34,3,46.00,32,4,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(328,117,5,'L-SEM-26016','2025-04-16','2028-04-16','2026-04-16',35,1,185.00,32,0,NULL,1,'2026-07-05 15:49:09'),
(329,118,4,'L-SEM-26017','2025-05-17','2027-05-17','2026-05-17',36,1,140.00,32,1,NULL,1,'2026-07-05 15:49:09'),
(330,119,5,'L-SEM-26018','2025-06-18','2028-06-18','2026-06-18',37,1,260.00,32,2,NULL,1,'2026-07-05 15:49:09'),
(331,120,4,'L-SEM-26019','2025-07-19','2027-07-19','2026-01-19',38,1,50.00,32,3,NULL,1,'2026-07-05 15:49:09'),
(332,121,5,'L-SEM-26020','2025-08-20','2028-08-20','2026-02-20',39,2,32.00,32,4,NULL,1,'2026-07-05 15:49:09'),
(333,122,4,'L-FER-26021','2025-09-21','2027-09-21','2026-03-21',40,1,185.00,32,0,NULL,1,'2026-07-05 15:49:09'),
(334,123,5,'L-FER-26022','2025-10-22','2028-10-22','2026-04-22',41,1,285.00,32,1,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(335,124,4,'L-FER-26023','2025-11-23','2027-11-23','2026-05-23',42,1,250.00,32,2,NULL,1,'2026-07-05 15:49:09'),
(336,125,5,'L-FER-26024','2025-12-24','2028-12-24','2026-06-24',43,1,168.00,32,3,NULL,1,'2026-07-05 15:49:09'),
(337,126,4,'L-FER-26025','2025-01-25','2027-01-25','2026-01-25',44,1,212.00,44,4,NULL,1,'2026-07-05 15:49:09'),
(338,127,5,'L-FER-26026','2025-02-01','2028-02-01','2026-02-26',45,1,230.00,44,0,NULL,1,'2026-07-05 15:49:09'),
(339,128,4,'L-FER-26027','2025-03-02','2027-03-02','2026-03-01',46,1,258.00,44,1,NULL,1,'2026-07-05 15:49:09'),
(340,129,5,'L-FER-26028','2025-04-03','2028-04-03','2026-04-02',47,1,222.00,44,2,NULL,1,'2026-07-05 15:49:09'),
(341,130,4,'L-FER-26029','2025-05-04','2027-05-04','2026-05-03',48,1,150.00,44,3,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(342,131,5,'L-FER-26030','2025-06-05','2028-06-05','2026-06-04',49,1,132.00,44,4,NULL,1,'2026-07-05 15:49:09'),
(343,132,4,'L-FER-26031','2025-07-06','2027-07-06','2026-01-05',50,1,68.00,44,0,NULL,1,'2026-07-05 15:49:09'),
(344,133,5,'L-FER-26032','2025-08-07','2028-08-07','2026-02-06',51,1,50.00,44,1,NULL,1,'2026-07-05 15:49:09'),
(345,134,4,'L-FER-26033','2025-09-08','2027-09-08','2026-03-07',52,1,82.00,44,2,NULL,1,'2026-07-05 15:49:09'),
(346,135,5,'L-FER-26034','2025-10-09','2028-10-09','2026-04-08',53,1,123.00,44,3,NULL,1,'2026-07-05 15:49:09'),
(347,136,4,'L-FER-26035','2025-11-10','2027-11-10','2026-05-09',54,1,266.00,44,4,NULL,1,'2026-07-05 15:49:09'),
(348,137,5,'L-AGQ-26036','2025-12-11','2028-12-11','2026-06-10',55,1,46.00,44,0,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(349,138,4,'L-AGQ-26037','2025-01-12','2027-01-12','2026-01-11',56,1,50.00,56,1,NULL,1,'2026-07-05 15:49:09'),
(350,139,5,'L-AGQ-26038','2025-02-13','2028-02-13','2026-02-12',57,1,40.00,56,2,NULL,1,'2026-07-05 15:49:09'),
(351,140,4,'L-AGQ-26039','2025-03-14','2027-03-14','2026-03-13',58,1,43.00,56,3,NULL,1,'2026-07-05 15:49:09'),
(352,141,5,'L-AGQ-26040','2025-04-15','2028-04-15','2026-04-14',59,1,58.00,56,4,NULL,1,'2026-07-05 15:49:09'),
(353,142,4,'L-AGQ-26041','2025-05-16','2027-05-16','2026-05-15',20,1,54.00,16,0,NULL,1,'2026-07-05 15:49:09'),
(354,143,5,'L-AGQ-26042','2025-06-17','2028-06-17','2026-06-16',21,1,100.00,16,1,NULL,1,'2026-07-05 15:49:09'),
(355,144,4,'L-AGQ-26043','2025-07-18','2027-07-18','2026-01-17',22,1,75.00,16,2,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(356,145,5,'L-AGQ-26044','2025-08-19','2028-08-19','2026-02-18',23,1,62.00,16,3,NULL,1,'2026-07-05 15:49:09'),
(357,146,4,'L-AGQ-26045','2025-09-20','2027-09-20','2026-03-19',24,1,70.00,16,4,NULL,1,'2026-07-05 15:49:09'),
(358,147,5,'L-AGQ-26046','2025-10-21','2028-10-21','2026-04-20',25,1,108.00,16,0,NULL,1,'2026-07-05 15:49:09'),
(359,148,4,'L-AGQ-26047','2025-11-22','2027-11-22','2026-05-21',26,2,133.00,16,1,NULL,1,'2026-07-05 15:49:09'),
(360,149,5,'L-AGQ-26048','2025-12-23','2028-12-23','2026-06-22',27,1,79.00,16,2,NULL,1,'2026-07-05 15:49:09'),
(361,150,4,'L-AGQ-26049','2025-01-24','2027-01-24','2026-01-23',28,1,92.00,28,3,NULL,1,'2026-07-05 15:49:09'),
(362,151,5,'L-AGQ-26050','2025-02-25','2028-02-25','2026-02-24',29,2,116.00,28,4,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(363,152,4,'L-AGQ-26051','2025-03-01','2027-03-01','2026-03-25',30,1,104.00,28,0,NULL,1,'2026-07-05 15:49:09'),
(364,153,5,'L-AGQ-26052','2025-04-02','2028-04-02','2026-04-26',31,1,73.00,28,1,NULL,1,'2026-07-05 15:49:09'),
(365,154,4,'L-AGQ-26053','2025-05-03','2027-05-03','2026-05-01',32,1,58.00,28,2,NULL,1,'2026-07-05 15:49:09'),
(366,155,5,'L-AGQ-26054','2025-06-04','2028-06-04','2026-06-02',33,1,95.00,28,3,NULL,1,'2026-07-05 15:49:09'),
(367,156,4,'L-AGQ-26055','2025-07-05','2027-07-05','2026-01-03',34,1,125.00,28,4,NULL,1,'2026-07-05 15:49:09'),
(368,157,5,'L-VET-26056','2025-08-06','2028-08-06','2026-02-04',35,2,37.00,28,0,NULL,1,'2026-07-05 15:49:09'),
(369,158,4,'L-VET-26057','2025-09-07','2027-09-07','2026-03-05',36,3,54.00,28,1,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(370,159,5,'L-VET-26058','2025-10-08','2028-10-08','2026-04-06',37,1,58.00,28,2,NULL,1,'2026-07-05 15:49:09'),
(371,160,4,'L-VET-26059','2025-11-09','2027-11-09','2026-05-07',38,2,46.00,28,3,NULL,1,'2026-07-05 15:49:09'),
(372,161,5,'L-VET-26060','2025-12-10','2028-12-10','2026-06-08',39,3,50.00,28,4,NULL,1,'2026-07-05 15:49:09'),
(373,162,4,'L-VET-26061','2025-01-11','2027-01-11','2026-01-09',40,1,40.00,40,0,NULL,1,'2026-07-05 15:49:09'),
(374,163,5,'L-VET-26062','2025-02-12','2028-02-12','2026-02-10',41,2,35.00,40,1,NULL,1,'2026-07-05 15:49:09'),
(375,164,4,'L-VET-26063','2025-03-13','2027-03-13','2026-03-11',42,3,48.00,40,2,NULL,1,'2026-07-05 15:49:09'),
(376,165,5,'L-VET-26064','2025-04-14','2028-04-14','2026-04-12',43,1,62.00,40,3,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(377,166,4,'L-VET-26065','2025-05-15','2027-05-15','2026-05-13',44,2,31.00,40,4,NULL,1,'2026-07-05 15:49:09'),
(378,167,5,'L-VET-26066','2025-06-16','2028-06-16','2026-06-14',45,1,79.00,40,0,NULL,1,'2026-07-05 15:49:09'),
(379,168,4,'L-VET-26067','2025-07-17','2027-07-17','2026-01-15',46,1,56.00,40,1,NULL,1,'2026-07-05 15:49:09'),
(380,169,5,'L-ALI-26068','2025-08-18','2028-08-18','2026-02-16',47,1,172.00,40,2,NULL,1,'2026-07-05 15:49:09'),
(381,170,4,'L-ALI-26069','2025-09-19','2027-09-19','2026-03-17',48,1,163.00,40,3,NULL,1,'2026-07-05 15:49:09'),
(382,171,5,'L-ALI-26070','2025-10-20','2028-10-20','2026-04-18',49,1,185.00,40,4,NULL,1,'2026-07-05 15:49:09'),
(383,172,4,'L-ALI-26071','2025-11-21','2027-11-21','2026-05-19',50,1,176.00,40,0,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(384,173,5,'L-ALI-26072','2025-12-22','2028-12-22','2026-06-20',51,1,76.00,40,1,NULL,1,'2026-07-05 15:49:09'),
(385,174,4,'L-ALI-26073','2025-01-23','2027-01-23','2026-01-21',52,1,63.00,52,2,NULL,1,'2026-07-05 15:49:09'),
(386,175,5,'L-ALI-26074','2025-02-24','2028-02-24','2026-02-22',53,1,95.00,52,3,NULL,1,'2026-07-05 15:49:09'),
(387,176,4,'L-ALI-26075','2025-03-25','2027-03-25','2026-03-23',54,1,54.00,52,4,NULL,1,'2026-07-05 15:49:09'),
(388,177,5,'L-HER-26076','2025-04-01',NULL,'2026-04-24',55,1,46.00,52,0,NULL,1,'2026-07-05 15:49:09'),
(389,178,4,'L-HER-26077','2025-05-02',NULL,'2026-05-25',56,2,70.00,52,1,NULL,1,'2026-07-05 15:49:09'),
(390,179,5,'L-HER-26078','2025-06-03',NULL,'2026-06-26',57,3,50.00,52,2,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(391,180,4,'L-HER-26079','2025-07-04',NULL,'2026-01-01',58,1,58.00,52,3,NULL,1,'2026-07-05 15:49:09'),
(392,181,5,'L-HER-26080','2025-08-05',NULL,'2026-02-02',59,2,275.00,52,4,NULL,1,'2026-07-05 15:49:09'),
(393,182,4,'L-HER-26081','2025-09-06',NULL,'2026-03-03',20,3,62.00,12,0,NULL,1,'2026-07-05 15:49:09'),
(394,183,5,'L-HER-26082','2025-10-07',NULL,'2026-04-04',21,1,390.00,12,1,NULL,1,'2026-07-05 15:49:09'),
(395,184,4,'L-HER-26083','2025-11-08',NULL,'2026-05-05',22,2,79.00,12,2,NULL,1,'2026-07-05 15:49:09'),
(396,185,5,'L-HER-26084','2025-12-09',NULL,'2026-06-06',23,3,23.00,12,3,NULL,1,'2026-07-05 15:49:09'),
(397,186,4,'L-HER-26085','2025-01-10',NULL,'2026-01-07',24,1,18.00,24,4,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(398,187,5,'L-HER-26086','2025-02-11',NULL,'2026-02-08',25,2,54.00,24,0,NULL,1,'2026-07-05 15:49:09'),
(399,188,4,'L-HER-26087','2025-03-12',NULL,'2026-03-09',26,3,37.00,24,1,NULL,1,'2026-07-05 15:49:09'),
(400,189,5,'L-RIE-26088','2025-04-13',NULL,'2026-04-10',27,1,3.00,24,2,NULL,1,'2026-07-05 15:49:09'),
(401,190,4,'L-RIE-26089','2025-05-14',NULL,'2026-05-11',28,2,2.00,24,3,NULL,1,'2026-07-05 15:49:09'),
(402,191,5,'L-RIE-26090','2025-06-15',NULL,'2026-06-12',29,3,37.00,24,4,NULL,1,'2026-07-05 15:49:09'),
(403,192,4,'L-RIE-26091','2025-07-16',NULL,'2026-01-13',30,1,6.00,24,0,NULL,1,'2026-07-05 15:49:09'),
(404,193,5,'L-RIE-26092','2025-08-17',NULL,'2026-02-14',31,2,1.00,24,1,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(405,194,4,'L-RIE-26093','2025-09-18',NULL,'2026-03-15',32,3,14.00,24,2,NULL,1,'2026-07-05 15:49:09'),
(406,195,5,'L-RIE-26094','2025-10-19',NULL,'2026-04-16',33,1,100.00,24,3,NULL,1,'2026-07-05 15:49:09'),
(407,196,4,'L-RIE-26095','2025-11-20',NULL,'2026-05-17',34,2,2.00,24,4,NULL,1,'2026-07-05 15:49:09'),
(408,197,5,'L-FOL-26096','2025-12-21','2028-12-21','2026-06-18',35,1,108.00,24,0,NULL,1,'2026-07-05 15:49:09'),
(409,198,4,'L-FOL-26097','2025-01-22','2027-01-22','2026-01-19',36,1,92.00,36,1,NULL,1,'2026-07-05 15:49:09'),
(410,199,5,'L-FOL-26098','2025-02-23','2028-02-23','2026-02-20',37,1,79.00,36,2,NULL,1,'2026-07-05 15:49:09'),
(411,200,4,'L-FOL-26099','2025-03-24','2027-03-24','2026-03-21',38,1,83.00,36,3,'Almacenado en estantería principal',1,'2026-07-05 15:49:09'),
(412,201,5,'L-FOL-26100','2025-04-25','2028-04-25','2026-04-22',39,1,87.00,36,4,NULL,1,'2026-07-05 15:49:09'),
(413,102,4,'L-SEM-26001','2025-01-01','2027-01-01','2026-01-01',20,1,108.00,20,0,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(414,103,5,'L-SEM-26002','2025-02-02','2028-02-02','2026-02-02',21,1,340.00,20,1,NULL,1,'2026-07-05 15:50:37'),
(415,104,4,'L-SEM-26003','2025-03-03','2027-03-03','2026-03-03',22,1,230.00,20,2,NULL,1,'2026-07-05 15:50:37'),
(416,105,5,'L-SEM-26004','2025-04-04','2028-04-04','2026-04-04',23,1,215.00,20,3,NULL,1,'2026-07-05 15:50:37'),
(417,106,4,'L-SEM-26005','2025-05-05','2027-05-05','2026-05-05',24,1,135.00,20,4,NULL,1,'2026-07-05 15:50:37'),
(418,107,5,'L-SEM-26006','2025-06-06','2028-06-06','2026-06-06',25,1,290.00,20,0,NULL,1,'2026-07-05 15:50:37'),
(419,108,4,'L-SEM-26007','2025-07-07','2027-07-07','2026-01-07',26,1,160.00,20,1,NULL,1,'2026-07-05 15:50:37'),
(420,109,5,'L-SEM-26008','2025-08-08','2028-08-08','2026-02-08',27,1,85.00,20,2,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(421,110,4,'L-SEM-26009','2025-09-09','2027-09-09','2026-03-09',28,1,125.00,20,3,NULL,1,'2026-07-05 15:50:37'),
(422,111,5,'L-SEM-26010','2025-10-10','2028-10-10','2026-04-10',29,1,98.00,20,4,NULL,1,'2026-07-05 15:50:37'),
(423,112,4,'L-SEM-26011','2025-11-11','2027-11-11','2026-05-11',30,2,38.00,20,0,NULL,1,'2026-07-05 15:50:37'),
(424,113,5,'L-SEM-26012','2025-12-12','2028-12-12','2026-06-12',31,3,34.00,20,1,NULL,1,'2026-07-05 15:50:37'),
(425,114,4,'L-SEM-26013','2025-01-13','2027-01-13','2026-01-13',32,1,29.00,32,2,NULL,1,'2026-07-05 15:50:37'),
(426,115,5,'L-SEM-26014','2025-02-14','2028-02-14','2026-02-14',33,2,25.00,32,3,NULL,1,'2026-07-05 15:50:37'),
(427,116,4,'L-SEM-26015','2025-03-15','2027-03-15','2026-03-15',34,3,46.00,32,4,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(428,117,5,'L-SEM-26016','2025-04-16','2028-04-16','2026-04-16',35,1,185.00,32,0,NULL,1,'2026-07-05 15:50:37'),
(429,118,4,'L-SEM-26017','2025-05-17','2027-05-17','2026-05-17',36,1,140.00,32,1,NULL,1,'2026-07-05 15:50:37'),
(430,119,5,'L-SEM-26018','2025-06-18','2028-06-18','2026-06-18',37,1,260.00,32,2,NULL,1,'2026-07-05 15:50:37'),
(431,120,4,'L-SEM-26019','2025-07-19','2027-07-19','2026-01-19',38,1,50.00,32,3,NULL,1,'2026-07-05 15:50:37'),
(432,121,5,'L-SEM-26020','2025-08-20','2028-08-20','2026-02-20',39,2,32.00,32,4,NULL,1,'2026-07-05 15:50:37'),
(433,122,4,'L-FER-26021','2025-09-21','2027-09-21','2026-03-21',40,1,185.00,32,0,NULL,1,'2026-07-05 15:50:37'),
(434,123,5,'L-FER-26022','2025-10-22','2028-10-22','2026-04-22',41,1,285.00,32,1,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(435,124,4,'L-FER-26023','2025-11-23','2027-11-23','2026-05-23',42,1,250.00,32,2,NULL,1,'2026-07-05 15:50:37'),
(436,125,5,'L-FER-26024','2025-12-24','2028-12-24','2026-06-24',43,1,168.00,32,3,NULL,1,'2026-07-05 15:50:37'),
(437,126,4,'L-FER-26025','2025-01-25','2027-01-25','2026-01-25',44,1,212.00,44,4,NULL,1,'2026-07-05 15:50:37'),
(438,127,5,'L-FER-26026','2025-02-01','2028-02-01','2026-02-26',45,1,230.00,44,0,NULL,1,'2026-07-05 15:50:37'),
(439,128,4,'L-FER-26027','2025-03-02','2027-03-02','2026-03-01',46,1,258.00,44,1,NULL,1,'2026-07-05 15:50:37'),
(440,129,5,'L-FER-26028','2025-04-03','2028-04-03','2026-04-02',47,1,222.00,44,2,NULL,1,'2026-07-05 15:50:37'),
(441,130,4,'L-FER-26029','2025-05-04','2027-05-04','2026-05-03',48,1,150.00,44,3,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(442,131,5,'L-FER-26030','2025-06-05','2028-06-05','2026-06-04',49,1,132.00,44,4,NULL,1,'2026-07-05 15:50:37'),
(443,132,4,'L-FER-26031','2025-07-06','2027-07-06','2026-01-05',50,1,68.00,44,0,NULL,1,'2026-07-05 15:50:37'),
(444,133,5,'L-FER-26032','2025-08-07','2028-08-07','2026-02-06',51,1,50.00,44,1,NULL,1,'2026-07-05 15:50:37'),
(445,134,4,'L-FER-26033','2025-09-08','2027-09-08','2026-03-07',52,1,82.00,44,2,NULL,1,'2026-07-05 15:50:37'),
(446,135,5,'L-FER-26034','2025-10-09','2028-10-09','2026-04-08',53,1,123.00,44,3,NULL,1,'2026-07-05 15:50:37'),
(447,136,4,'L-FER-26035','2025-11-10','2027-11-10','2026-05-09',54,1,266.00,44,4,NULL,1,'2026-07-05 15:50:37'),
(448,137,5,'L-AGQ-26036','2025-12-11','2028-12-11','2026-06-10',55,1,46.00,44,0,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(449,138,4,'L-AGQ-26037','2025-01-12','2027-01-12','2026-01-11',56,1,50.00,56,1,NULL,1,'2026-07-05 15:50:37'),
(450,139,5,'L-AGQ-26038','2025-02-13','2028-02-13','2026-02-12',57,1,40.00,56,2,NULL,1,'2026-07-05 15:50:37'),
(451,140,4,'L-AGQ-26039','2025-03-14','2027-03-14','2026-03-13',58,1,43.00,56,3,NULL,1,'2026-07-05 15:50:37'),
(452,141,5,'L-AGQ-26040','2025-04-15','2028-04-15','2026-04-14',59,1,58.00,56,4,NULL,1,'2026-07-05 15:50:37'),
(453,142,4,'L-AGQ-26041','2025-05-16','2027-05-16','2026-05-15',20,1,54.00,16,0,NULL,1,'2026-07-05 15:50:37'),
(454,143,5,'L-AGQ-26042','2025-06-17','2028-06-17','2026-06-16',21,1,100.00,16,1,NULL,1,'2026-07-05 15:50:37'),
(455,144,4,'L-AGQ-26043','2025-07-18','2027-07-18','2026-01-17',22,1,75.00,16,2,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(456,145,5,'L-AGQ-26044','2025-08-19','2028-08-19','2026-02-18',23,1,62.00,16,3,NULL,1,'2026-07-05 15:50:37'),
(457,146,4,'L-AGQ-26045','2025-09-20','2027-09-20','2026-03-19',24,1,70.00,16,4,NULL,1,'2026-07-05 15:50:37'),
(458,147,5,'L-AGQ-26046','2025-10-21','2028-10-21','2026-04-20',25,1,108.00,16,0,NULL,1,'2026-07-05 15:50:37'),
(459,148,4,'L-AGQ-26047','2025-11-22','2027-11-22','2026-05-21',26,2,133.00,16,1,NULL,1,'2026-07-05 15:50:37'),
(460,149,5,'L-AGQ-26048','2025-12-23','2028-12-23','2026-06-22',27,1,79.00,16,2,NULL,1,'2026-07-05 15:50:37'),
(461,150,4,'L-AGQ-26049','2025-01-24','2027-01-24','2026-01-23',28,1,92.00,28,3,NULL,1,'2026-07-05 15:50:37'),
(462,151,5,'L-AGQ-26050','2025-02-25','2028-02-25','2026-02-24',29,2,116.00,28,4,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(463,152,4,'L-AGQ-26051','2025-03-01','2027-03-01','2026-03-25',30,1,104.00,28,0,NULL,1,'2026-07-05 15:50:37'),
(464,153,5,'L-AGQ-26052','2025-04-02','2028-04-02','2026-04-26',31,1,73.00,28,1,NULL,1,'2026-07-05 15:50:37'),
(465,154,4,'L-AGQ-26053','2025-05-03','2027-05-03','2026-05-01',32,1,58.00,28,2,NULL,1,'2026-07-05 15:50:37'),
(466,155,5,'L-AGQ-26054','2025-06-04','2028-06-04','2026-06-02',33,1,95.00,28,3,NULL,1,'2026-07-05 15:50:37'),
(467,156,4,'L-AGQ-26055','2025-07-05','2027-07-05','2026-01-03',34,1,125.00,28,4,NULL,1,'2026-07-05 15:50:37'),
(468,157,5,'L-VET-26056','2025-08-06','2028-08-06','2026-02-04',35,2,37.00,28,0,NULL,1,'2026-07-05 15:50:37'),
(469,158,4,'L-VET-26057','2025-09-07','2027-09-07','2026-03-05',36,3,54.00,28,1,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(470,159,5,'L-VET-26058','2025-10-08','2028-10-08','2026-04-06',37,1,58.00,28,2,NULL,1,'2026-07-05 15:50:37'),
(471,160,4,'L-VET-26059','2025-11-09','2027-11-09','2026-05-07',38,2,46.00,28,3,NULL,1,'2026-07-05 15:50:37'),
(472,161,5,'L-VET-26060','2025-12-10','2028-12-10','2026-06-08',39,3,50.00,28,4,NULL,1,'2026-07-05 15:50:37'),
(473,162,4,'L-VET-26061','2025-01-11','2027-01-11','2026-01-09',40,1,40.00,40,0,NULL,1,'2026-07-05 15:50:37'),
(474,163,5,'L-VET-26062','2025-02-12','2028-02-12','2026-02-10',41,2,35.00,40,1,NULL,1,'2026-07-05 15:50:37'),
(475,164,4,'L-VET-26063','2025-03-13','2027-03-13','2026-03-11',42,3,48.00,40,2,NULL,1,'2026-07-05 15:50:37'),
(476,165,5,'L-VET-26064','2025-04-14','2028-04-14','2026-04-12',43,1,62.00,40,3,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(477,166,4,'L-VET-26065','2025-05-15','2027-05-15','2026-05-13',44,2,31.00,40,4,NULL,1,'2026-07-05 15:50:37'),
(478,167,5,'L-VET-26066','2025-06-16','2028-06-16','2026-06-14',45,1,79.00,40,0,NULL,1,'2026-07-05 15:50:37'),
(479,168,4,'L-VET-26067','2025-07-17','2027-07-17','2026-01-15',46,1,56.00,40,1,NULL,1,'2026-07-05 15:50:37'),
(480,169,5,'L-ALI-26068','2025-08-18','2028-08-18','2026-02-16',47,1,172.00,40,2,NULL,1,'2026-07-05 15:50:37'),
(481,170,4,'L-ALI-26069','2025-09-19','2027-09-19','2026-03-17',48,1,163.00,40,3,NULL,1,'2026-07-05 15:50:37'),
(482,171,5,'L-ALI-26070','2025-10-20','2028-10-20','2026-04-18',49,1,185.00,40,4,NULL,1,'2026-07-05 15:50:37'),
(483,172,4,'L-ALI-26071','2025-11-21','2027-11-21','2026-05-19',50,1,176.00,40,0,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(484,173,5,'L-ALI-26072','2025-12-22','2028-12-22','2026-06-20',51,1,76.00,40,1,NULL,1,'2026-07-05 15:50:37'),
(485,174,4,'L-ALI-26073','2025-01-23','2027-01-23','2026-01-21',52,1,63.00,52,2,NULL,1,'2026-07-05 15:50:37'),
(486,175,5,'L-ALI-26074','2025-02-24','2028-02-24','2026-02-22',53,1,95.00,52,3,NULL,1,'2026-07-05 15:50:37'),
(487,176,4,'L-ALI-26075','2025-03-25','2027-03-25','2026-03-23',54,1,54.00,52,4,NULL,1,'2026-07-05 15:50:37'),
(488,177,5,'L-HER-26076','2025-04-01',NULL,'2026-04-24',55,1,46.00,52,0,NULL,1,'2026-07-05 15:50:37'),
(489,178,4,'L-HER-26077','2025-05-02',NULL,'2026-05-25',56,2,70.00,52,1,NULL,1,'2026-07-05 15:50:37'),
(490,179,5,'L-HER-26078','2025-06-03',NULL,'2026-06-26',57,3,50.00,52,2,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(491,180,4,'L-HER-26079','2025-07-04',NULL,'2026-01-01',58,1,58.00,52,3,NULL,1,'2026-07-05 15:50:37'),
(492,181,5,'L-HER-26080','2025-08-05',NULL,'2026-02-02',59,2,275.00,52,4,NULL,1,'2026-07-05 15:50:37'),
(493,182,4,'L-HER-26081','2025-09-06',NULL,'2026-03-03',20,3,62.00,12,0,NULL,1,'2026-07-05 15:50:37'),
(494,183,5,'L-HER-26082','2025-10-07',NULL,'2026-04-04',21,1,390.00,12,1,NULL,1,'2026-07-05 15:50:37'),
(495,184,4,'L-HER-26083','2025-11-08',NULL,'2026-05-05',22,2,79.00,12,2,NULL,1,'2026-07-05 15:50:37'),
(496,185,5,'L-HER-26084','2025-12-09',NULL,'2026-06-06',23,3,23.00,12,3,NULL,1,'2026-07-05 15:50:37'),
(497,186,4,'L-HER-26085','2025-01-10',NULL,'2026-01-07',24,1,18.00,24,4,'Almacenado en estantería principal',1,'2026-07-05 15:50:37'),
(498,187,5,'L-HER-26086','2025-02-11',NULL,'2026-02-08',25,2,54.00,24,0,NULL,1,'2026-07-05 15:50:37'),
(499,188,4,'L-HER-26087','2025-03-12',NULL,'2026-03-09',26,3,37.00,24,1,NULL,1,'2026-07-05 15:50:37'),
(500,189,5,'L-RIE-26088','2025-04-13',NULL,'2026-04-10',27,1,3.00,24,2,NULL,1,'2026-07-05 15:50:37'),
(501,190,4,'L-RIE-26089','2025-05-14',NULL,'2026-05-11',28,2,2.00,24,3,NULL,1,'2026-07-05 15:50:37'),
(502,191,5,'L-RIE-26090','2025-06-15',NULL,'2026-06-12',29,3,37.00,24,4,NULL,1,'2026-07-05 15:50:37'),
(503,192,4,'L-RIE-26091','2025-07-16',NULL,'2026-01-13',30,1,6.00,24,0,NULL,1,'2026-07-05 15:50:38'),
(504,193,5,'L-RIE-26092','2025-08-17',NULL,'2026-02-14',31,2,1.00,24,1,'Almacenado en estantería principal',1,'2026-07-05 15:50:38'),
(505,194,4,'L-RIE-26093','2025-09-18',NULL,'2026-03-15',32,3,14.00,24,2,NULL,1,'2026-07-05 15:50:38'),
(506,195,5,'L-RIE-26094','2025-10-19',NULL,'2026-04-16',33,1,100.00,24,3,NULL,1,'2026-07-05 15:50:38'),
(507,196,4,'L-RIE-26095','2025-11-20',NULL,'2026-05-17',34,2,2.00,24,4,NULL,1,'2026-07-05 15:50:38'),
(508,197,5,'L-FOL-26096','2025-12-21','2028-12-21','2026-06-18',35,1,108.00,24,0,NULL,1,'2026-07-05 15:50:38'),
(509,198,4,'L-FOL-26097','2025-01-22','2027-01-22','2026-01-19',36,1,92.00,36,1,NULL,1,'2026-07-05 15:50:38'),
(510,199,5,'L-FOL-26098','2025-02-23','2028-02-23','2026-02-20',37,1,79.00,36,2,NULL,1,'2026-07-05 15:50:38'),
(511,200,4,'L-FOL-26099','2025-03-24','2027-03-24','2026-03-21',38,1,83.00,36,3,'Almacenado en estantería principal',1,'2026-07-05 15:50:38'),
(512,201,5,'L-FOL-26100','2025-04-25','2028-04-25','2026-04-22',39,1,87.00,36,4,NULL,1,'2026-07-05 15:50:38');
/*!40000 ALTER TABLE `lote` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `id_marca` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais_origen` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_marca`),
  UNIQUE KEY `uq_marca_nombre` (`nombre`,`id_empresa`),
  KEY `fk_marca_empresa` (`id_empresa`),
  CONSTRAINT `fk_marca_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES
(1,1,'SeedCo',NULL,NULL,1),
(2,1,'Sementes',NULL,NULL,1),
(3,1,'INIAF',NULL,NULL,1),
(4,1,'ANAPO',NULL,NULL,1),
(5,1,'Advanta',NULL,NULL,1),
(6,1,'Nidera',NULL,NULL,1),
(7,1,'PROINPA',NULL,NULL,1),
(8,1,'CIAT',NULL,NULL,1),
(9,1,'ANAPQUI',NULL,NULL,1),
(10,1,'Local',NULL,NULL,1),
(11,1,'Seminis',NULL,NULL,1),
(12,1,'Hortus',NULL,NULL,1),
(13,1,'Forratec',NULL,NULL,1),
(14,1,'Matsuda',NULL,NULL,1),
(15,1,'Yara',NULL,NULL,1),
(16,1,'Nutrien',NULL,NULL,1),
(17,1,'Misti',NULL,NULL,1),
(18,1,'Haifa',NULL,NULL,1),
(19,1,'Fertiper',NULL,NULL,1),
(20,1,'EcoAgro',NULL,NULL,1),
(21,1,'Stoller',NULL,NULL,1),
(22,1,'Bayer',NULL,NULL,1),
(23,1,'Syngenta',NULL,NULL,1),
(24,1,'Atanor',NULL,NULL,1),
(25,1,'Adama',NULL,NULL,1),
(26,1,'UPL',NULL,NULL,1),
(27,1,'DuPont',NULL,NULL,1),
(28,1,'Kumiai',NULL,NULL,1),
(29,1,'BASF',NULL,NULL,1),
(30,1,'Zoetis',NULL,NULL,1),
(31,1,'MSD',NULL,NULL,1),
(32,1,'Ceva',NULL,NULL,1),
(33,1,'Ciproquim',NULL,NULL,1),
(34,1,'Agripac',NULL,NULL,1),
(35,1,'Purina',NULL,NULL,1),
(36,1,'Sales del Sur',NULL,NULL,1),
(37,1,'Molinera',NULL,NULL,1),
(38,1,'Tramontina',NULL,NULL,1),
(39,1,'Bellota',NULL,NULL,1),
(40,1,'Truper',NULL,NULL,1),
(41,1,'Jacto',NULL,NULL,1),
(42,1,'Nicholson',NULL,NULL,1),
(43,1,'Netafim',NULL,NULL,1),
(44,1,'Rain Bird',NULL,NULL,1),
(45,1,'Hidroriego',NULL,NULL,1),
(46,4,'SeedCo',NULL,NULL,1),
(47,4,'Sementes',NULL,NULL,1),
(48,4,'INIAF',NULL,NULL,1),
(49,4,'ANAPO',NULL,NULL,1),
(50,4,'Advanta',NULL,NULL,1),
(51,4,'Nidera',NULL,NULL,1),
(52,4,'PROINPA',NULL,NULL,1),
(53,4,'CIAT',NULL,NULL,1),
(54,4,'ANAPQUI',NULL,NULL,1),
(55,4,'Local',NULL,NULL,1),
(56,4,'Seminis',NULL,NULL,1),
(57,4,'Hortus',NULL,NULL,1),
(58,4,'Forratec',NULL,NULL,1),
(59,4,'Matsuda',NULL,NULL,1),
(60,4,'Yara',NULL,NULL,1),
(61,4,'Nutrien',NULL,NULL,1),
(62,4,'Misti',NULL,NULL,1),
(63,4,'Haifa',NULL,NULL,1),
(64,4,'Fertiper',NULL,NULL,1),
(65,4,'EcoAgro',NULL,NULL,1),
(66,4,'Stoller',NULL,NULL,1),
(67,4,'Bayer',NULL,NULL,1),
(68,4,'Syngenta',NULL,NULL,1),
(69,4,'Atanor',NULL,NULL,1),
(70,4,'Adama',NULL,NULL,1),
(71,4,'UPL',NULL,NULL,1),
(72,4,'DuPont',NULL,NULL,1),
(73,4,'Kumiai',NULL,NULL,1),
(74,4,'BASF',NULL,NULL,1),
(75,4,'Zoetis',NULL,NULL,1),
(76,4,'MSD',NULL,NULL,1),
(77,4,'Ceva',NULL,NULL,1),
(78,4,'Ciproquim',NULL,NULL,1),
(79,4,'Agripac',NULL,NULL,1),
(80,4,'Purina',NULL,NULL,1),
(81,4,'Sales del Sur',NULL,NULL,1),
(82,4,'Molinera',NULL,NULL,1),
(83,4,'Tramontina',NULL,NULL,1),
(84,4,'Bellota',NULL,NULL,1),
(85,4,'Truper',NULL,NULL,1),
(86,4,'Jacto',NULL,NULL,1),
(87,4,'Nicholson',NULL,NULL,1),
(88,4,'Netafim',NULL,NULL,1),
(89,4,'Rain Bird',NULL,NULL,1),
(90,4,'Hidroriego',NULL,NULL,1),
(91,5,'SeedCo',NULL,NULL,1),
(92,5,'Sementes',NULL,NULL,1),
(93,5,'INIAF',NULL,NULL,1),
(94,5,'ANAPO',NULL,NULL,1),
(95,5,'Advanta',NULL,NULL,1),
(96,5,'Nidera',NULL,NULL,1),
(97,5,'PROINPA',NULL,NULL,1),
(98,5,'CIAT',NULL,NULL,1),
(99,5,'ANAPQUI',NULL,NULL,1),
(100,5,'Local',NULL,NULL,1),
(101,5,'Seminis',NULL,NULL,1),
(102,5,'Hortus',NULL,NULL,1),
(103,5,'Forratec',NULL,NULL,1),
(104,5,'Matsuda',NULL,NULL,1),
(105,5,'Yara',NULL,NULL,1),
(106,5,'Nutrien',NULL,NULL,1),
(107,5,'Misti',NULL,NULL,1),
(108,5,'Haifa',NULL,NULL,1),
(109,5,'Fertiper',NULL,NULL,1),
(110,5,'EcoAgro',NULL,NULL,1),
(111,5,'Stoller',NULL,NULL,1),
(112,5,'Bayer',NULL,NULL,1),
(113,5,'Syngenta',NULL,NULL,1),
(114,5,'Atanor',NULL,NULL,1),
(115,5,'Adama',NULL,NULL,1),
(116,5,'UPL',NULL,NULL,1),
(117,5,'DuPont',NULL,NULL,1),
(118,5,'Kumiai',NULL,NULL,1),
(119,5,'BASF',NULL,NULL,1),
(120,5,'Zoetis',NULL,NULL,1),
(121,5,'MSD',NULL,NULL,1),
(122,5,'Ceva',NULL,NULL,1),
(123,5,'Ciproquim',NULL,NULL,1),
(124,5,'Agripac',NULL,NULL,1),
(125,5,'Purina',NULL,NULL,1),
(126,5,'Sales del Sur',NULL,NULL,1),
(127,5,'Molinera',NULL,NULL,1),
(128,5,'Tramontina',NULL,NULL,1),
(129,5,'Bellota',NULL,NULL,1),
(130,5,'Truper',NULL,NULL,1),
(131,5,'Jacto',NULL,NULL,1),
(132,5,'Nicholson',NULL,NULL,1),
(133,5,'Netafim',NULL,NULL,1),
(134,5,'Rain Bird',NULL,NULL,1),
(135,5,'Hidroriego',NULL,NULL,1);
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mezcla`
--

DROP TABLE IF EXISTS `mezcla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mezcla` (
  `id_mezcla` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mezcla`),
  UNIQUE KEY `uq_mezcla_nombre` (`nombre`,`id_empresa`),
  KEY `fk_mezcla_empresa` (`id_empresa`),
  CONSTRAINT `fk_mezcla_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mezcla`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mezcla` WRITE;
/*!40000 ALTER TABLE `mezcla` DISABLE KEYS */;
/*!40000 ALTER TABLE `mezcla` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mezcla_ingrediente`
--

DROP TABLE IF EXISTS `mezcla_ingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mezcla_ingrediente` (
  `id_ingrediente` int NOT NULL AUTO_INCREMENT,
  `id_mezcla` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` decimal(14,4) NOT NULL,
  `id_unidad` int NOT NULL,
  `observaciones` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_ingrediente`),
  UNIQUE KEY `uq_mezcla_prod` (`id_mezcla`,`id_producto`),
  KEY `fk_mi_mezcla` (`id_mezcla`),
  KEY `fk_mi_producto` (`id_producto`),
  KEY `fk_mi_unidad` (`id_unidad`),
  CONSTRAINT `fk_mi_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  CONSTRAINT `fk_mi_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `fk_mi_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_medida` (`id_unidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mezcla_ingrediente`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mezcla_ingrediente` WRITE;
/*!40000 ALTER TABLE `mezcla_ingrediente` DISABLE KEYS */;
/*!40000 ALTER TABLE `mezcla_ingrediente` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `movimiento`
--

DROP TABLE IF EXISTS `movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('INGRESO','EGRESO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_categoria` int NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `fecha` date NOT NULL,
  `id_sucursal` int NOT NULL,
  `id_usuario` int NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_categoria` (`id_categoria`),
  KEY `id_sucursal` (`id_sucursal`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `movimiento_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_movimiento` (`id_categoria`),
  CONSTRAINT `movimiento_ibfk_2` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `movimiento_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `movimiento` WRITE;
/*!40000 ALTER TABLE `movimiento` DISABLE KEYS */;
INSERT INTO `movimiento` VALUES
(1,'EGRESO',1,'pago de junio',100.00,'2026-06-20',1,1,NULL,'2026-06-20 20:55:09');
/*!40000 ALTER TABLE `movimiento` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `movimiento_almacen`
--

DROP TABLE IF EXISTS `movimiento_almacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_almacen` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_lote` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo` enum('INGRESO','SALIDA','AJUSTE','TRASLADO_SALIDA','TRASLADO_ENTRADA','BAJA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad_cajas` int NOT NULL DEFAULT '0',
  `cantidad_unidades` int NOT NULL DEFAULT '0',
  `fecha_movimiento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `referencia_id` int DEFAULT NULL,
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_mov_lote` (`id_lote`),
  KEY `fk_mov_sucursal` (`id_sucursal`),
  KEY `fk_mov_usuario` (`id_usuario`),
  CONSTRAINT `fk_mov_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `fk_mov_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_almacen`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `movimiento_almacen` WRITE;
/*!40000 ALTER TABLE `movimiento_almacen` DISABLE KEYS */;
INSERT INTO `movimiento_almacen` VALUES
(1,33,1,1,'SALIDA','VENTA',1,1,'2026-06-20 20:23:55',1,'VENTA',NULL),
(2,97,1,1,'SALIDA','VENTA',1,1,'2026-06-20 20:23:55',1,'VENTA',NULL),
(3,92,2,1,'AJUSTE','conteo fisico',4,9,'2026-06-20 21:05:16',NULL,'MANUAL',NULL),
(4,188,5,5,'AJUSTE','Conteo fisico',10,20,'2026-06-25 11:30:01',NULL,'MANUAL',NULL),
(5,193,4,5,'AJUSTE','Conteo fisico',20,20,'2026-06-25 11:30:24',NULL,'MANUAL',NULL),
(6,249,6,6,'SALIDA','VENTA',0,1,'2026-06-29 22:43:22',2,'VENTA',NULL),
(7,275,6,6,'SALIDA','VENTA',1,1,'2026-06-29 22:43:22',2,'VENTA',NULL),
(8,267,6,6,'SALIDA','VENTA',0,1,'2026-06-29 22:46:49',3,'VENTA',NULL),
(9,299,6,6,'SALIDA','VENTA',1,1,'2026-06-29 22:51:37',4,'VENTA',NULL),
(10,301,6,6,'SALIDA','VENTA',1,1,'2026-06-29 22:51:37',4,'VENTA',NULL),
(11,245,6,6,'SALIDA','VENTA',1,1,'2026-07-03 15:01:23',5,'VENTA',NULL),
(12,275,6,6,'SALIDA','VENTA',1,1,'2026-07-03 15:03:15',6,'VENTA',NULL),
(13,235,6,6,'SALIDA','VENTA',1,1,'2026-07-05 15:51:49',7,'VENTA',NULL),
(14,245,6,6,'SALIDA','VENTA',1,1,'2026-07-05 15:51:49',7,'VENTA',NULL),
(15,181,4,5,'SALIDA','VENTA',1,1,'2026-07-06 15:47:38',8,'VENTA',NULL),
(16,247,6,6,'SALIDA','VENTA',1,1,'2026-07-09 01:08:21',9,'VENTA',NULL),
(17,281,6,6,'SALIDA','VENTA',1,1,'2026-07-09 01:10:08',10,'VENTA',NULL),
(18,281,6,6,'SALIDA','VENTA',1,1,'2026-07-09 01:10:52',11,'VENTA',NULL),
(19,247,6,6,'SALIDA','VENTA',1,1,'2026-07-09 01:14:37',12,'VENTA',NULL),
(20,241,6,6,'SALIDA','VENTA',1,1,'2026-07-09 01:15:24',13,'VENTA',NULL),
(21,267,6,6,'SALIDA','VENTA',0,1,'2026-07-09 01:30:15',14,'VENTA',NULL),
(22,267,6,6,'SALIDA','VENTA',0,1,'2026-07-09 01:30:36',15,'VENTA',NULL),
(23,265,6,6,'SALIDA','VENTA',0,1,'2026-07-09 01:51:16',16,'VENTA',NULL),
(24,267,6,6,'SALIDA','VENTA',0,1,'2026-07-09 01:59:50',17,'VENTA',NULL),
(25,240,7,6,'AJUSTE','bh',10,10,'2026-07-22 09:09:41',NULL,'MANUAL',NULL),
(26,240,7,6,'SALIDA','VENTA',1,1,'2026-07-22 09:16:01',18,'VENTA',NULL),
(27,240,7,6,'SALIDA','VENTA',1,1,'2026-07-22 09:18:12',19,'VENTA',NULL),
(28,240,7,6,'SALIDA','VENTA',1,1,'2026-07-22 09:20:58',20,'VENTA',NULL),
(29,240,7,6,'SALIDA','VENTA',1,1,'2026-07-23 07:06:35',21,'VENTA',NULL),
(30,240,7,6,'SALIDA','VENTA',1,1,'2026-07-23 07:25:23',22,'VENTA',NULL);
/*!40000 ALTER TABLE `movimiento_almacen` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `pago_compra`
--

DROP TABLE IF EXISTS `pago_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago_compra` (
  `id_pago_compra` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_usuario` int NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','QR','QR_ESTATICO','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EFECTIVO',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_pago` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago_compra`),
  KEY `fk_pc_compra` (`id_compra`),
  KEY `fk_pc_usuario` (`id_usuario`),
  CONSTRAINT `fk_pc_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_compra`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pago_compra` WRITE;
/*!40000 ALTER TABLE `pago_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago_compra` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `pago_suscripcion`
--

DROP TABLE IF EXISTS `pago_suscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago_suscripcion` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_suscripcion` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `referencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('PENDIENTE','PAGADO','FALLIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `fecha_pago` datetime DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago`),
  KEY `fk_pago_sus` (`id_suscripcion`),
  CONSTRAINT `fk_pago_sus` FOREIGN KEY (`id_suscripcion`) REFERENCES `suscripcion` (`id_suscripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_suscripcion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pago_suscripcion` WRITE;
/*!40000 ALTER TABLE `pago_suscripcion` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago_suscripcion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `pago_venta`
--

DROP TABLE IF EXISTS `pago_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago_venta` (
  `id_pago_venta` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_usuario` int NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','QR','QR_ESTATICO','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EFECTIVO',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_pago` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago_venta`),
  KEY `fk_pv_venta` (`id_venta`),
  KEY `fk_pv_usuario` (`id_usuario`),
  CONSTRAINT `fk_pv_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `fk_pv_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_venta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `pago_venta` WRITE;
/*!40000 ALTER TABLE `pago_venta` DISABLE KEYS */;
INSERT INTO `pago_venta` VALUES
(1,1,1,100.00,'EFECTIVO',NULL,'2026-06-20 20:26:27'),
(2,1,1,124.00,'EFECTIVO',NULL,'2026-06-20 20:27:00'),
(3,4,6,40.00,'EFECTIVO',NULL,'2026-06-29 22:52:19');
/*!40000 ALTER TABLE `pago_venta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `permiso`
--

DROP TABLE IF EXISTS `permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permiso` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_clave` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `uq_permiso_clave` (`nombre_clave`)
) ENGINE=InnoDB AUTO_INCREMENT=144 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permiso`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `permiso` WRITE;
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` VALUES
(1,'roles','ver','roles.ver','Ver listado de roles del sistema'),
(2,'roles','crear','roles.crear','Crear nuevos roles'),
(3,'roles','editar','roles.editar','Editar nombre de un rol'),
(4,'roles','eliminar','roles.eliminar','Eliminar roles del sistema'),
(5,'roles','gestionar_permisos','roles.gestionar_permisos','Asignar y quitar permisos a un rol'),
(6,'usuarios','ver','usuarios.ver','Ver listado de usuarios del sistema'),
(7,'usuarios','ver_detalle','usuarios.ver_detalle','Ver ficha completa de un usuario'),
(8,'usuarios','crear','usuarios.crear','Crear nuevos usuarios'),
(9,'usuarios','editar','usuarios.editar','Editar datos de un usuario'),
(10,'usuarios','eliminar','usuarios.eliminar','Eliminar usuarios del sistema'),
(11,'usuarios','activar','usuarios.activar','Activar o desactivar un usuario'),
(12,'usuarios','cambiar_rol','usuarios.cambiar_rol','Cambiar el rol asignado a un usuario'),
(13,'usuarios','cambiar_sucursal','usuarios.cambiar_sucursal','Reasignar usuario a otra sucursal'),
(14,'usuarios','resetear_clave','usuarios.resetear_clave','Restablecer contraseña de un usuario'),
(15,'sucursales','ver','sucursales.ver','Ver listado de sucursales'),
(16,'sucursales','ver_detalle','sucursales.ver_detalle','Ver ficha completa de una sucursal'),
(17,'sucursales','crear','sucursales.crear','Registrar nuevas sucursales'),
(18,'sucursales','editar','sucursales.editar','Editar datos de una sucursal'),
(19,'sucursales','eliminar','sucursales.eliminar','Eliminar sucursales del sistema'),
(20,'sucursales','activar','sucursales.activar','Activar o desactivar una sucursal'),
(21,'clasificaciones','ver','clasificaciones.ver','Ver listado de clasificaciones'),
(22,'clasificaciones','crear','clasificaciones.crear','Crear clasificaciones de producto'),
(23,'clasificaciones','editar','clasificaciones.editar','Editar una clasificación'),
(24,'clasificaciones','eliminar','clasificaciones.eliminar','Eliminar una clasificación'),
(25,'marcas','ver','marcas.ver','Ver listado de marcas'),
(26,'marcas','crear','marcas.crear','Registrar nuevas marcas'),
(27,'marcas','editar','marcas.editar','Editar datos de una marca'),
(28,'marcas','eliminar','marcas.eliminar','Eliminar marcas del sistema'),
(29,'unidades','ver','unidades.ver','Ver listado de unidades de medida'),
(30,'unidades','crear','unidades.crear','Crear unidades de medida'),
(31,'unidades','editar','unidades.editar','Editar una unidad de medida'),
(32,'unidades','eliminar','unidades.eliminar','Eliminar unidades de medida'),
(33,'productos','ver','productos.ver','Ver catálogo de productos'),
(34,'productos','ver_detalle','productos.ver_detalle','Ver ficha completa de un producto'),
(35,'productos','crear','productos.crear','Agregar productos al catálogo'),
(36,'productos','editar','productos.editar','Editar datos generales del producto'),
(37,'productos','eliminar','productos.eliminar','Eliminar productos del catálogo'),
(38,'productos','activar','productos.activar','Activar o desactivar un producto'),
(39,'productos','ver_costo','productos.ver_costo','Ver precio de costo (precio_por_caja del lote)'),
(40,'productos','ver_precios','productos.ver_precios','Ver precios de venta mayor y menor'),
(41,'productos','editar_precios','productos.editar_precios','Modificar precios de venta mayor y menor'),
(42,'productos','editar_descuentos','productos.editar_descuentos','Modificar porcentajes de descuento'),
(43,'productos','ver_stock','productos.ver_stock','Ver stock disponible de productos'),
(44,'productos','gestionar_imagen','productos.gestionar_imagen','Subir o eliminar imagen del producto'),
(45,'almacen','ver','almacen.ver','Ver inventario general del almacén'),
(46,'almacen','ver_lotes','almacen.ver_lotes','Ver listado detallado de lotes'),
(47,'almacen','ver_lote_detalle','almacen.ver_lote_detalle','Ver ficha completa de un lote'),
(48,'almacen','ver_costo_lote','almacen.ver_costo_lote','Ver precio de costo de cada lote'),
(49,'almacen','ingresar','almacen.ingresar','Registrar entradas de productos al almacén'),
(50,'almacen','ajustar','almacen.ajustar','Registrar ajustes de inventario'),
(51,'almacen','trasladar','almacen.trasladar','Trasladar stock entre sucursales'),
(52,'almacen','ver_movimientos','almacen.ver_movimientos','Ver historial de movimientos (kardex)'),
(53,'almacen','ver_vencimientos','almacen.ver_vencimientos','Ver productos próximos a vencer'),
(54,'almacen','dar_baja_lote','almacen.dar_baja_lote','Dar de baja un lote (vencido o dañado)'),
(55,'proveedores','ver','proveedores.ver','Ver listado de proveedores'),
(56,'proveedores','ver_detalle','proveedores.ver_detalle','Ver ficha completa de un proveedor'),
(57,'proveedores','crear','proveedores.crear','Registrar nuevos proveedores'),
(58,'proveedores','editar','proveedores.editar','Editar datos de un proveedor'),
(59,'proveedores','eliminar','proveedores.eliminar','Eliminar proveedores del sistema'),
(60,'proveedores','activar','proveedores.activar','Activar o desactivar un proveedor'),
(61,'compras','ver','compras.ver','Ver historial de compras'),
(62,'compras','ver_detalle','compras.ver_detalle','Ver detalle completo de una compra'),
(63,'compras','ver_costo','compras.ver_costo','Ver precios de costo en las compras'),
(64,'compras','crear','compras.crear','Registrar nuevas compras'),
(65,'compras','editar','compras.editar','Editar compras en estado PENDIENTE'),
(66,'compras','confirmar','compras.confirmar','Confirmar y cerrar una compra'),
(67,'compras','anular','compras.anular','Anular una compra registrada'),
(68,'compras','ver_todas_sucursales','compras.ver_todas_sucursales','Ver compras de todas las sucursales'),
(69,'clientes','ver','clientes.ver','Ver listado de clientes'),
(70,'clientes','ver_detalle','clientes.ver_detalle','Ver ficha completa de un cliente'),
(71,'clientes','crear','clientes.crear','Registrar nuevos clientes'),
(72,'clientes','editar','clientes.editar','Editar datos de un cliente'),
(73,'clientes','eliminar','clientes.eliminar','Eliminar clientes del sistema'),
(74,'clientes','activar','clientes.activar','Activar o desactivar un cliente'),
(75,'clientes','ver_historial','clientes.ver_historial','Ver historial de compras de un cliente'),
(76,'clientes','cambiar_tipo','clientes.cambiar_tipo','Cambiar tipo de cliente: minorista / mayorista'),
(77,'ventas','ver','ventas.ver','Ver historial de ventas propias'),
(78,'ventas','ver_detalle','ventas.ver_detalle','Ver detalle completo de una venta'),
(79,'ventas','ver_todas','ventas.ver_todas','Ver ventas de todos los vendedores'),
(80,'ventas','ver_todas_sucursales','ventas.ver_todas_sucursales','Ver ventas de todas las sucursales'),
(81,'ventas','crear','ventas.crear','Registrar nuevas ventas'),
(82,'ventas','anular','ventas.anular','Anular una venta realizada'),
(83,'ventas','aplicar_descuento','ventas.aplicar_descuento','Aplicar descuento adicional en una venta'),
(84,'ventas','descuento_libre','ventas.descuento_libre','Ingresar descuento libre (sin límite de porcentaje)'),
(85,'ventas','vender_sin_stock','ventas.vender_sin_stock','Registrar venta aunque el stock sea 0'),
(86,'ventas','ver_costo','ventas.ver_costo','Ver el costo y la utilidad de cada venta'),
(87,'ventas','cambiar_precio','ventas.cambiar_precio','Modificar el precio en el momento de la venta'),
(88,'ventas','reimprimir','ventas.reimprimir','Reimprimir comprobante de una venta'),
(89,'traslados','ver','traslados.ver','Ver listado de traslados entre sucursales'),
(90,'traslados','crear','traslados.crear','Crear un traslado de stock'),
(91,'traslados','confirmar','traslados.confirmar','Confirmar un traslado pendiente'),
(92,'traslados','cancelar','traslados.cancelar','Cancelar un traslado pendiente'),
(93,'caja','ver','caja.ver','Ver listado de cajas registradas'),
(94,'caja','crear','caja.crear','Registrar nuevas cajas'),
(95,'caja','editar','caja.editar','Editar datos de una caja'),
(96,'caja','activar','caja.activar','Activar o desactivar una caja'),
(97,'caja','abrir','caja.abrir','Abrir turno de caja con monto inicial'),
(98,'caja','cerrar','caja.cerrar','Cerrar turno de caja y registrar monto final'),
(99,'caja','ver_movimientos','caja.ver_movimientos','Ver movimientos de efectivo de una caja'),
(100,'caja','ver_todas','caja.ver_todas','Ver cajas de todas las sucursales'),
(101,'caja','ver_historial','caja.ver_historial','Ver historial de aperturas y cierres de caja'),
(102,'reportes','ventas_diarias','reportes.ventas_diarias','Ver reporte de ventas del día'),
(103,'reportes','ventas_rango','reportes.ventas_rango','Ver reporte de ventas por rango de fechas'),
(104,'reportes','ventas_vendedor','reportes.ventas_vendedor','Ver reporte de ventas por vendedor'),
(105,'reportes','ventas_producto','reportes.ventas_producto','Ver reporte de ventas por producto'),
(106,'reportes','ventas_cliente','reportes.ventas_cliente','Ver reporte de ventas por cliente'),
(107,'reportes','compras','reportes.compras','Ver reporte de compras realizadas'),
(108,'reportes','compras_proveedor','reportes.compras_proveedor','Ver reporte de compras por proveedor'),
(109,'reportes','inventario','reportes.inventario','Ver reporte de inventario actual'),
(110,'reportes','inventario_valorizado','reportes.inventario_valorizado','Ver inventario con valor de costo total'),
(111,'reportes','ganancias','reportes.ganancias','Ver reporte de ganancias y utilidad bruta'),
(112,'reportes','ganancias_producto','reportes.ganancias_producto','Ver utilidad desglosada por producto'),
(113,'reportes','top_productos','reportes.top_productos','Ver ranking de productos más vendidos'),
(114,'reportes','vencimientos','reportes.vencimientos','Ver reporte de productos próximos a vencer'),
(115,'reportes','stock_bajo','reportes.stock_bajo','Ver productos por debajo del stock mínimo'),
(116,'reportes','kardex','reportes.kardex','Ver kardex (historial de movimientos por lote)'),
(117,'reportes','traslados','reportes.traslados','Ver reporte de traslados entre sucursales'),
(118,'reportes','comparativo_sucursales','reportes.comparativo_sucursales','Comparar ventas y ganancias entre sucursales'),
(119,'reportes','caja','reportes.caja','Ver reporte de arqueos y movimientos de caja'),
(120,'configuracion','ver','configuracion.ver','Ver configuración general del sistema'),
(121,'configuracion','editar','configuracion.editar','Editar configuración general del sistema'),
(122,'movimientos','','movimientos.ver','Ver libro de caja y movimientos'),
(123,'movimientos','','movimientos.crear','Registrar gasto/ingreso manual'),
(124,'movimientos','','movimientos.editar','Editar un movimiento manual'),
(125,'movimientos','','movimientos.eliminar','Eliminar un movimiento manual'),
(126,'movimientos','','movimientos.ver_todas','Ver movimientos de todas las sucursales'),
(127,'categorias_movimiento','','categorias_movimiento.ver','Ver categorías de movimientos'),
(128,'categorias_movimiento','','categorias_movimiento.gestionar','Crear/editar/eliminar categorías'),
(129,'creditos','ver','creditos.ver','Ver cuentas por cobrar y por pagar'),
(130,'creditos','abonar','creditos.abonar','Registrar abonos a créditos'),
(131,'creditos','reporte','creditos.reporte','Ver reporte de créditos (cuentas por cobrar y por pagar)'),
(132,'conversiones','ver','conversiones.ver','Ver listado de conversiones de unidad'),
(133,'conversiones','crear','conversiones.crear','Crear nuevas conversiones de unidad'),
(134,'conversiones','editar','conversiones.editar','Editar conversiones de unidad existentes'),
(135,'conversiones','eliminar','conversiones.eliminar','Eliminar conversiones de unidad'),
(136,'almacen','importar','almacen.importar','Importar inventario masivo desde Excel'),
(137,'mezclas','ver','mezclas.ver','Ver listado de mezclas/fórmulas'),
(138,'mezclas','crear','mezclas.crear','Crear nuevas mezclas con su receta'),
(139,'mezclas','editar','mezclas.editar','Editar receta de una mezcla'),
(140,'mezclas','eliminar','mezclas.eliminar','Eliminar mezclas del sistema'),
(141,'mezclas','activar','mezclas.activar','Activar o desactivar una mezcla'),
(142,'mezclas','aplicar','mezclas.aplicar','Registrar una aplicación (descuenta stock de la sucursal)'),
(143,'mezclas','ver_historial','mezclas.ver_historial','Ver historial de aplicaciones de mezclas');
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `id_plan` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_mensual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio_anual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `max_sucursales` int NOT NULL DEFAULT '1',
  `max_usuarios` int NOT NULL DEFAULT '3',
  `max_productos` int DEFAULT NULL,
  `modulos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `dias_prueba` int NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_plan`),
  CONSTRAINT `plan_chk_1` CHECK (json_valid(`modulos`))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES
(1,'PRUEBA',0.00,0.00,1,2,30,'[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"roles\"]',7,1),
(2,'BASICO',150.00,1500.00,1,3,50,'[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"roles\",\"proveedores\",\"compras\"]',0,1),
(3,'ESTANDAR',250.00,2500.00,3,8,0,'[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"compras\",\"proveedores\",\"traslados\",\"libro_caja\",\"reportes_avanzados\",\"roles\"]',0,1),
(4,'PREMIUM',400.00,4000.00,0,0,0,'[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"qr\",\"reportes_basicos\",\"compras\",\"proveedores\",\"traslados\",\"libro_caja\",\"reportes_avanzados\",\"roles\",\"soporte_prioritario\"]',0,1);
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `id_clasificacion` int NOT NULL,
  `id_marca` int NOT NULL,
  `id_unidad` int NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio_mayor` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_menor` decimal(12,2) NOT NULL DEFAULT '0.00',
  `descuento_mayor` decimal(5,2) NOT NULL DEFAULT '0.00',
  `descuento_menor` decimal(5,2) NOT NULL DEFAULT '0.00',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `permite_fraccion` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  KEY `fk_prod_clasificacion` (`id_clasificacion`),
  KEY `fk_prod_marca` (`id_marca`),
  KEY `fk_prod_unidad` (`id_unidad`),
  KEY `fk_pro_empresa` (`id_empresa`),
  CONSTRAINT `fk_pro_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_prod_clasificacion` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion_producto` (`id_clasificacion`),
  CONSTRAINT `fk_prod_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  CONSTRAINT `fk_prod_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_medida` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES
(1,1,1,1,1,'Semilla Maíz Híbrido DK-7088',NULL,NULL,120.00,135.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(2,1,1,2,1,'Semilla Soya Munasqa',NULL,NULL,380.00,420.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(3,1,1,3,2,'Semilla Trigo San Pedro',NULL,NULL,260.00,290.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(4,1,1,4,2,'Semilla Arroz Patitas',NULL,NULL,240.00,270.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(5,1,1,5,1,'Semilla Sorgo Forrajero',NULL,NULL,150.00,170.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(6,1,1,6,1,'Semilla Girasol Aromo',NULL,NULL,320.00,360.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(7,1,1,7,2,'Semilla Papa Waych\'a',NULL,NULL,180.00,205.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(8,1,1,8,1,'Semilla Frejol Carioca',NULL,NULL,95.00,110.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(9,1,1,9,1,'Semilla Quinua Real',NULL,NULL,140.00,160.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(10,1,1,10,1,'Semilla Maní Overo',NULL,NULL,110.00,128.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(11,1,1,11,3,'Semilla Tomate Río Grande',NULL,NULL,45.00,55.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(12,1,1,11,3,'Semilla Cebolla Roja',NULL,NULL,40.00,50.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(13,1,1,12,3,'Semilla Zanahoria Chantenay',NULL,NULL,35.00,44.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(14,1,1,12,3,'Semilla Lechuga Crespa',NULL,NULL,30.00,38.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(15,1,1,11,3,'Semilla Pimentón Californiano',NULL,NULL,55.00,66.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(16,1,1,13,2,'Semilla Alfalfa Ranger',NULL,NULL,210.00,240.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(17,1,1,3,2,'Semilla Avena Forrajera',NULL,NULL,160.00,185.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(18,1,1,14,2,'Semilla Pasto Brachiaria',NULL,NULL,290.00,330.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(19,1,1,11,3,'Semilla Sandía Charleston',NULL,NULL,60.00,72.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(20,1,1,12,3,'Semilla Pepino Marketmore',NULL,NULL,38.00,47.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(21,1,2,15,2,'Urea 46% Granulada',NULL,NULL,210.00,235.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(22,1,2,16,2,'Fosfato Diamónico DAP',NULL,NULL,320.00,355.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(23,1,2,15,2,'Cloruro de Potasio KCl',NULL,NULL,280.00,310.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(24,1,2,15,2,'Sulfato de Amonio',NULL,NULL,190.00,215.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(25,1,2,15,2,'Nitrato de Calcio',NULL,NULL,240.00,270.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(26,1,2,17,2,'NPK 15-15-15',NULL,NULL,260.00,290.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(27,1,2,17,2,'NPK 20-20-20',NULL,NULL,290.00,320.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(28,1,2,16,2,'Superfosfato Triple',NULL,NULL,250.00,280.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(29,1,2,18,2,'Sulfato de Magnesio',NULL,NULL,170.00,195.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(30,1,2,19,2,'Guano de Isla',NULL,NULL,150.00,175.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(31,1,2,20,2,'Humus de Lombriz',NULL,NULL,80.00,95.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(32,1,2,20,2,'Compost Orgánico',NULL,NULL,60.00,72.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(33,1,2,21,4,'Abono Foliar Completo',NULL,NULL,95.00,110.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(34,1,2,19,2,'Roca Fosfórica',NULL,NULL,140.00,162.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(35,1,2,18,2,'Nitrato de Potasio',NULL,NULL,300.00,335.00,0.00,0.00,0,0,1,'2026-06-20 18:23:56'),
(36,1,3,22,4,'Glifosato 48% SL',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(37,1,3,23,4,'Paraquat 20% SL',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(38,1,3,24,4,'2,4-D Amina',NULL,NULL,48.00,60.00,0.00,0.00,6,0,1,'2026-06-20 18:23:57'),
(39,1,3,23,4,'Atrazina 50% SC',NULL,NULL,52.00,65.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(40,1,3,22,4,'Cipermetrina 25% EC',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(41,1,3,25,4,'Clorpirifos 48% EC',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(42,1,3,22,4,'Imidacloprid 35% SC',NULL,NULL,120.00,145.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(43,1,3,23,3,'Abamectina 1.8% EC',NULL,NULL,90.00,110.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(44,1,3,26,5,'Mancozeb 80% WP',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(45,1,3,25,4,'Carbendazim 50% SC',NULL,NULL,85.00,104.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(46,1,3,22,4,'Tebuconazol 25% EW',NULL,NULL,130.00,158.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(47,1,3,23,3,'Azoxistrobina 25% SC',NULL,NULL,160.00,195.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(48,1,3,23,4,'Lambda Cialotrina 5% EC',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(49,1,3,27,5,'Metomilo 90% SP',NULL,NULL,110.00,134.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(50,1,3,28,3,'Bispiribac Sodio',NULL,NULL,140.00,170.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(51,1,3,29,4,'Fipronil 20% SC',NULL,NULL,125.00,152.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(52,1,3,26,5,'Acefato 75% SP',NULL,NULL,88.00,108.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(53,1,3,25,5,'Diuron 80% WP',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(54,1,3,23,4,'Propiconazol 25% EC',NULL,NULL,115.00,140.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(55,1,3,23,3,'Emamectina Benzoato',NULL,NULL,150.00,182.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(56,1,4,30,3,'Vacuna Aftosa Bovina',NULL,NULL,45.00,58.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(57,1,4,30,3,'Ivermectina 1% Inyectable',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(58,1,4,31,3,'Oxitetraciclina LA',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(59,1,4,22,3,'Vitamina AD3E',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(60,1,4,30,3,'Desparasitante Bovino',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(61,1,4,31,3,'Antibiótico Penicilina',NULL,NULL,48.00,60.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(62,1,4,22,3,'Hierro Dextrano Inyectable',NULL,NULL,42.00,52.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(63,1,4,30,3,'Calcio Magnesio Inyectable',NULL,NULL,58.00,72.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(64,1,4,32,3,'Vacuna Triple Aviar',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(65,1,4,22,3,'Cicatrizante Spray',NULL,NULL,38.00,47.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(66,1,4,31,4,'Garrapaticida Pour-On',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(67,1,4,30,3,'Reconstituyente Energético',NULL,NULL,68.00,84.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(68,1,5,33,2,'Balanceado Iniciador Pollos',NULL,NULL,195.00,215.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(69,1,5,34,2,'Balanceado Engorde Cerdos',NULL,NULL,185.00,205.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(70,1,5,35,2,'Concentrado Lechero 18%',NULL,NULL,210.00,232.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(71,1,5,33,2,'Alimento Ponedoras',NULL,NULL,200.00,222.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(72,1,5,36,2,'Sal Mineral Bovina',NULL,NULL,90.00,108.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(73,1,5,37,2,'Afrecho de Trigo',NULL,NULL,75.00,90.00,0.00,0.00,0,1,1,'2026-06-20 18:23:57'),
(74,1,5,10,2,'Maíz Molido Forrajero',NULL,NULL,110.00,128.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(75,1,5,35,5,'Suplemento Vitamínico Aves',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(76,1,6,38,6,'Machete 24 Pulgadas',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(77,1,6,39,6,'Pala Cuchara Reforzada',NULL,NULL,85.00,104.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(78,1,6,40,6,'Rastrillo 14 Dientes',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(79,1,6,39,6,'Azadón Forjado',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(80,1,6,41,6,'Mochila Fumigadora 20L',NULL,NULL,320.00,375.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(81,1,6,40,6,'Tijera de Podar',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(82,1,6,40,6,'Carretilla Reforzada',NULL,NULL,450.00,520.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(83,1,6,39,6,'Pico Punta y Pala',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(84,1,6,42,6,'Lima Triangular',NULL,NULL,28.00,36.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(85,1,6,10,6,'Guantes de Cuero',NULL,NULL,22.00,30.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(86,1,6,41,6,'Aspersor Manual 5L',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(87,1,6,39,6,'Hoz Segadora',NULL,NULL,45.00,56.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(88,1,7,43,6,'Manguera Goteo 16mm',NULL,NULL,4.00,5.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(89,1,7,43,6,'Cinta de Goteo 8mil',NULL,NULL,3.00,4.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(90,1,7,44,6,'Aspersor Rotativo',NULL,NULL,45.00,56.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(91,1,7,43,6,'Microaspersor 360°',NULL,NULL,8.00,11.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(92,1,7,45,6,'Conector Inicial 16mm',NULL,NULL,2.00,3.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(93,1,7,45,6,'Válvula de Bola 1 Pulg',NULL,NULL,18.00,24.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(94,1,7,43,6,'Filtro de Anillos',NULL,NULL,120.00,145.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(95,1,7,44,6,'Goteros Autocompensados',NULL,NULL,3.00,4.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(96,1,8,21,4,'Bioestimulante Algas',NULL,NULL,130.00,158.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(97,1,8,15,4,'Aminoácidos Foliar',NULL,NULL,110.00,134.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(98,1,8,18,5,'Quelato de Hierro',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(99,1,8,21,4,'Calcio Boro Foliar',NULL,NULL,100.00,122.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(100,1,8,15,4,'Zinc Manganeso Foliar',NULL,NULL,105.00,128.00,0.00,0.00,0,0,1,'2026-06-20 18:23:57'),
(101,1,2,25,1,'Abono 1',NULL,NULL,1200.00,1250.00,0.00,0.00,4,1,1,'2026-06-20 20:31:55'),
(102,4,9,46,7,'Semilla Maíz Híbrido DK-7088',NULL,NULL,120.00,135.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(103,4,9,47,7,'Semilla Soya Munasqa',NULL,NULL,380.00,420.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(104,4,9,48,8,'Semilla Trigo San Pedro',NULL,NULL,260.00,290.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(105,4,9,49,8,'Semilla Arroz Patitas',NULL,NULL,240.00,270.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(106,4,9,50,7,'Semilla Sorgo Forrajero',NULL,NULL,150.00,170.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(107,4,9,51,7,'Semilla Girasol Aromo',NULL,NULL,320.00,360.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(108,4,9,52,8,'Semilla Papa Waych\'a',NULL,NULL,180.00,205.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(109,4,9,53,7,'Semilla Frejol Carioca',NULL,NULL,95.00,110.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(110,4,9,54,7,'Semilla Quinua Real',NULL,NULL,140.00,160.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(111,4,9,55,7,'Semilla Maní Overo',NULL,NULL,110.00,128.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(112,4,9,56,9,'Semilla Tomate Río Grande',NULL,NULL,45.00,55.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(113,4,9,56,9,'Semilla Cebolla Roja',NULL,NULL,40.00,50.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(114,4,9,57,9,'Semilla Zanahoria Chantenay',NULL,NULL,35.00,44.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(115,4,9,57,9,'Semilla Lechuga Crespa',NULL,NULL,30.00,38.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(116,4,9,56,9,'Semilla Pimentón Californiano',NULL,NULL,55.00,66.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(117,4,9,58,8,'Semilla Alfalfa Ranger',NULL,NULL,210.00,240.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(118,4,9,48,8,'Semilla Avena Forrajera',NULL,NULL,160.00,185.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(119,4,9,59,8,'Semilla Pasto Brachiaria',NULL,NULL,290.00,330.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(120,4,9,56,9,'Semilla Sandía Charleston',NULL,NULL,60.00,72.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(121,4,9,57,9,'Semilla Pepino Marketmore',NULL,NULL,38.00,47.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(122,4,10,60,8,'Urea 46% Granulada',NULL,NULL,210.00,235.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(123,4,10,61,8,'Fosfato Diamónico DAP',NULL,NULL,320.00,355.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(124,4,10,60,8,'Cloruro de Potasio KCl',NULL,NULL,280.00,310.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(125,4,10,60,8,'Sulfato de Amonio',NULL,NULL,190.00,215.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(126,4,10,60,8,'Nitrato de Calcio',NULL,NULL,240.00,270.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(127,4,10,62,8,'NPK 15-15-15',NULL,NULL,260.00,290.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(128,4,10,62,8,'NPK 20-20-20',NULL,NULL,290.00,320.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(129,4,10,61,8,'Superfosfato Triple',NULL,NULL,250.00,280.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(130,4,10,63,8,'Sulfato de Magnesio',NULL,NULL,170.00,195.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(131,4,10,64,8,'Guano de Isla',NULL,NULL,150.00,175.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(132,4,10,65,8,'Humus de Lombriz',NULL,NULL,80.00,95.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(133,4,10,65,8,'Compost Orgánico',NULL,NULL,60.00,72.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(134,4,10,66,10,'Abono Foliar Completo',NULL,NULL,95.00,110.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(135,4,10,64,8,'Roca Fosfórica',NULL,NULL,140.00,162.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(136,4,10,63,8,'Nitrato de Potasio',NULL,NULL,300.00,335.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(137,4,11,67,10,'Glifosato 48% SL',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(138,4,11,68,10,'Paraquat 20% SL',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(139,4,11,69,10,'2,4-D Amina',NULL,NULL,48.00,60.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(140,4,11,68,10,'Atrazina 50% SC',NULL,NULL,52.00,65.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(141,4,11,67,10,'Cipermetrina 25% EC',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(142,4,11,70,10,'Clorpirifos 48% EC',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(143,4,11,67,10,'Imidacloprid 35% SC',NULL,NULL,120.00,145.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(144,4,11,68,9,'Abamectina 1.8% EC',NULL,NULL,90.00,110.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(145,4,11,71,11,'Mancozeb 80% WP',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(146,4,11,70,10,'Carbendazim 50% SC',NULL,NULL,85.00,104.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(147,4,11,67,10,'Tebuconazol 25% EW',NULL,NULL,130.00,158.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(148,4,11,68,9,'Azoxistrobina 25% SC',NULL,NULL,160.00,195.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(149,4,11,68,10,'Lambda Cialotrina 5% EC',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(150,4,11,72,7,'Metomilo 90% SP',NULL,NULL,110.00,134.00,0.00,0.00,0,1,1,'2026-06-25 11:13:13'),
(151,4,11,73,9,'Bispiribac Sodio',NULL,NULL,140.00,170.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(152,4,11,74,10,'Fipronil 20% SC',NULL,NULL,125.00,152.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(153,4,11,71,11,'Acefato 75% SP',NULL,NULL,88.00,108.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(154,4,11,70,11,'Diuron 80% WP',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(155,4,11,68,10,'Propiconazol 25% EC',NULL,NULL,115.00,140.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(156,4,11,68,9,'Emamectina Benzoato',NULL,NULL,150.00,182.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(157,4,12,75,9,'Vacuna Aftosa Bovina',NULL,NULL,45.00,58.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(158,4,12,75,9,'Ivermectina 1% Inyectable',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(159,4,12,76,9,'Oxitetraciclina LA',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(160,4,12,67,9,'Vitamina AD3E',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(161,4,12,75,9,'Desparasitante Bovino',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(162,4,12,76,9,'Antibiótico Penicilina',NULL,NULL,48.00,60.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(163,4,12,67,9,'Hierro Dextrano Inyectable',NULL,NULL,42.00,52.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(164,4,12,75,9,'Calcio Magnesio Inyectable',NULL,NULL,58.00,72.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(165,4,12,77,9,'Vacuna Triple Aviar',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(166,4,12,67,9,'Cicatrizante Spray',NULL,NULL,38.00,47.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(167,4,12,76,10,'Garrapaticida Pour-On',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(168,4,12,75,9,'Reconstituyente Energético',NULL,NULL,68.00,84.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(169,4,13,78,8,'Balanceado Iniciador Pollos',NULL,NULL,195.00,215.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(170,4,13,79,8,'Balanceado Engorde Cerdos',NULL,NULL,185.00,205.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(171,4,13,80,8,'Concentrado Lechero 18%',NULL,NULL,210.00,232.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(172,4,13,78,8,'Alimento Ponedoras',NULL,NULL,200.00,222.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(173,4,13,81,8,'Sal Mineral Bovina',NULL,NULL,90.00,108.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(174,4,13,82,8,'Afrecho de Trigo',NULL,NULL,75.00,90.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(175,4,13,55,8,'Maíz Molido Forrajero',NULL,NULL,110.00,128.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(176,4,13,80,11,'Suplemento Vitamínico Aves',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(177,4,14,83,12,'Machete 24 Pulgadas',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(178,4,14,84,12,'Pala Cuchara Reforzada',NULL,NULL,85.00,104.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(179,4,14,85,12,'Rastrillo 14 Dientes',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(180,4,14,84,12,'Azadón Forjado',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(181,4,14,86,12,'Mochila Fumigadora 20L',NULL,NULL,320.00,375.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(182,4,14,85,12,'Tijera de Podar',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(183,4,14,85,12,'Carretilla Reforzada',NULL,NULL,450.00,520.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(184,4,14,84,12,'Pico Punta y Pala',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(185,4,14,87,12,'Lima Triangular',NULL,NULL,28.00,36.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(186,4,14,55,12,'Guantes de Cuero',NULL,NULL,22.00,30.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(187,4,14,86,12,'Aspersor Manual 5L',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(188,4,14,84,12,'Hoz Segadora',NULL,NULL,45.00,56.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(189,4,15,88,12,'Manguera Goteo 16mm',NULL,NULL,4.00,5.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(190,4,15,88,12,'Cinta de Goteo 8mil',NULL,NULL,3.00,4.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(191,4,15,89,12,'Aspersor Rotativo',NULL,NULL,45.00,56.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(192,4,15,88,12,'Microaspersor 360°',NULL,NULL,8.00,11.00,0.00,0.00,0,0,1,'2026-06-25 11:13:13'),
(193,4,15,90,12,'Conector Inicial 16mm',NULL,NULL,2.00,3.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(194,4,15,90,12,'Válvula de Bola 1 Pulg',NULL,NULL,18.00,24.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(195,4,15,88,12,'Filtro de Anillos',NULL,NULL,120.00,145.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(196,4,15,89,12,'Goteros Autocompensados',NULL,NULL,3.00,4.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(197,4,16,66,10,'Bioestimulante Algas',NULL,NULL,130.00,158.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(198,4,16,60,10,'Aminoácidos Foliar',NULL,NULL,110.00,134.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(199,4,16,63,11,'Quelato de Hierro',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(200,4,16,66,10,'Calcio Boro Foliar',NULL,NULL,100.00,122.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(201,4,16,60,10,'Zinc Manganeso Foliar',NULL,NULL,105.00,128.00,0.00,0.00,0,0,1,'2026-06-25 11:13:14'),
(202,5,17,91,13,'Semilla Maíz Híbrido DK-7088',NULL,NULL,120.00,135.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(203,5,17,92,13,'Semilla Soya Munasqa',NULL,NULL,380.00,420.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(204,5,17,93,14,'Semilla Trigo San Pedro',NULL,NULL,260.00,290.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(205,5,17,94,14,'Semilla Arroz Patitas',NULL,NULL,240.00,270.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(206,5,17,95,13,'Semilla Sorgo Forrajero',NULL,NULL,150.00,170.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(207,5,17,96,13,'Semilla Girasol Aromo',NULL,NULL,320.00,360.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(208,5,17,97,14,'Semilla Papa Waych\'a',NULL,NULL,180.00,205.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(209,5,17,98,13,'Semilla Frejol Carioca',NULL,NULL,95.00,110.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(210,5,17,99,13,'Semilla Quinua Real',NULL,NULL,140.00,160.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(211,5,17,100,13,'Semilla Maní Overo',NULL,NULL,110.00,128.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(212,5,17,101,15,'Semilla Tomate Río Grande',NULL,NULL,45.00,55.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(213,5,17,101,15,'Semilla Cebolla Roja',NULL,NULL,40.00,50.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(214,5,17,102,15,'Semilla Zanahoria Chantenay',NULL,NULL,35.00,44.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(215,5,17,102,15,'Semilla Lechuga Crespa',NULL,NULL,30.00,38.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(216,5,17,101,15,'Semilla Pimentón Californiano',NULL,NULL,55.00,66.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(217,5,17,103,14,'Semilla Alfalfa Ranger',NULL,NULL,210.00,240.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(218,5,17,93,14,'Semilla Avena Forrajera',NULL,NULL,160.00,185.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(219,5,17,104,14,'Semilla Pasto Brachiaria',NULL,NULL,290.00,330.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(220,5,17,101,15,'Semilla Sandía Charleston',NULL,NULL,60.00,72.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(221,5,17,102,15,'Semilla Pepino Marketmore',NULL,NULL,38.00,47.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(222,5,18,105,14,'Urea 46% Granulada',NULL,NULL,210.00,235.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(223,5,18,106,14,'Fosfato Diamónico DAP',NULL,NULL,320.00,355.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(224,5,18,105,14,'Cloruro de Potasio KCl',NULL,NULL,280.00,310.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(225,5,18,105,14,'Sulfato de Amonio',NULL,NULL,190.00,215.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(226,5,18,105,14,'Nitrato de Calcio',NULL,NULL,240.00,270.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(227,5,18,107,14,'NPK 15-15-15',NULL,NULL,260.00,290.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(228,5,18,107,14,'NPK 20-20-20',NULL,NULL,290.00,320.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(229,5,18,106,14,'Superfosfato Triple',NULL,NULL,250.00,280.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(230,5,18,108,14,'Sulfato de Magnesio',NULL,NULL,170.00,195.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(231,5,18,109,14,'Guano de Isla',NULL,NULL,150.00,175.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(232,5,18,110,14,'Humus de Lombriz',NULL,NULL,80.00,95.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(233,5,18,110,14,'Compost Orgánico',NULL,NULL,60.00,72.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(234,5,18,111,16,'Abono Foliar Completo',NULL,NULL,95.00,110.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(235,5,18,109,14,'Roca Fosfórica',NULL,NULL,140.00,162.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(236,5,18,108,14,'Nitrato de Potasio',NULL,NULL,300.00,335.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(237,5,19,112,16,'Glifosato 48% SL',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(238,5,19,113,16,'Paraquat 20% SL',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(239,5,19,114,16,'2,4-D Amina',NULL,NULL,1.00,1.00,0.00,0.00,1,0,1,'2026-06-29 22:41:20'),
(240,5,19,113,16,'Atrazina 50% SC',NULL,NULL,52.00,65.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(241,5,19,112,16,'Cipermetrina 25% EC',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(242,5,19,115,16,'Clorpirifos 48% EC',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(243,5,19,112,16,'Imidacloprid 35% SC',NULL,NULL,120.00,145.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(244,5,19,113,15,'Abamectina 1.8% EC',NULL,NULL,90.00,110.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(245,5,19,116,17,'Mancozeb 80% WP',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(246,5,19,115,16,'Carbendazim 50% SC',NULL,NULL,85.00,104.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(247,5,19,112,16,'Tebuconazol 25% EW',NULL,NULL,130.00,158.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(248,5,19,113,15,'Azoxistrobina 25% SC',NULL,NULL,160.00,195.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(249,5,19,113,16,'Lambda Cialotrina 5% EC',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(250,5,19,117,17,'Metomilo 90% SP',NULL,NULL,110.00,134.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(251,5,19,118,15,'Bispiribac Sodio',NULL,NULL,140.00,170.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(252,5,19,119,16,'Fipronil 20% SC',NULL,NULL,125.00,152.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(253,5,19,116,17,'Acefato 75% SP',NULL,NULL,88.00,108.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(254,5,19,115,17,'Diuron 80% WP',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(255,5,19,113,16,'Propiconazol 25% EC',NULL,NULL,115.00,140.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(256,5,19,113,15,'Emamectina Benzoato',NULL,NULL,150.00,182.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(257,5,20,120,15,'Vacuna Aftosa Bovina',NULL,NULL,45.00,58.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(258,5,20,120,15,'Ivermectina 1% Inyectable',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(259,5,20,121,15,'Oxitetraciclina LA',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(260,5,20,112,15,'Vitamina AD3E',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(261,5,20,120,15,'Desparasitante Bovino',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(262,5,20,121,15,'Antibiótico Penicilina',NULL,NULL,48.00,60.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(263,5,20,112,15,'Hierro Dextrano Inyectable',NULL,NULL,42.00,52.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(264,5,20,120,15,'Calcio Magnesio Inyectable',NULL,NULL,58.00,72.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(265,5,20,122,15,'Vacuna Triple Aviar',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(266,5,20,112,15,'Cicatrizante Spray',NULL,NULL,1.00,1.00,0.00,0.00,10,0,1,'2026-06-29 22:41:20'),
(267,5,20,121,16,'Garrapaticida Pour-On',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(268,5,20,120,15,'Reconstituyente Energético',NULL,NULL,68.00,84.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(269,5,21,123,14,'Balanceado Iniciador Pollos',NULL,NULL,195.00,215.00,0.00,0.00,0,0,1,'2026-06-29 22:41:20'),
(270,5,21,124,14,'Balanceado Engorde Cerdos',NULL,NULL,185.00,205.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(271,5,21,125,14,'Concentrado Lechero 18%',NULL,NULL,210.00,232.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(272,5,21,123,14,'Alimento Ponedoras',NULL,NULL,200.00,222.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(273,5,21,126,14,'Sal Mineral Bovina',NULL,NULL,90.00,108.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(274,5,21,127,14,'Afrecho de Trigo',NULL,NULL,75.00,90.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(275,5,21,100,14,'Maíz Molido Forrajero',NULL,NULL,110.00,128.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(276,5,21,125,17,'Suplemento Vitamínico Aves',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(277,5,22,128,18,'Machete 24 Pulgadas',NULL,NULL,55.00,68.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(278,5,22,129,18,'Pala Cuchara Reforzada',NULL,NULL,85.00,104.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(279,5,22,130,18,'Rastrillo 14 Dientes',NULL,NULL,60.00,74.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(280,5,22,129,18,'Azadón Forjado',NULL,NULL,70.00,86.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(281,5,22,131,18,'Mochila Fumigadora 20L',NULL,NULL,320.00,375.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(282,5,22,130,18,'Tijera de Podar',NULL,NULL,75.00,92.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(283,5,22,130,18,'Carretilla Reforzada',NULL,NULL,450.00,520.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(284,5,22,129,18,'Pico Punta y Pala',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(285,5,22,132,18,'Lima Triangular',NULL,NULL,28.00,36.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(286,5,22,100,18,'Guantes de Cuero',NULL,NULL,22.00,30.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(287,5,22,131,18,'Aspersor Manual 5L',NULL,NULL,65.00,80.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(288,5,22,129,18,'Hoz Segadora',NULL,NULL,45.00,56.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(289,5,23,133,18,'Manguera Goteo 16mm',NULL,NULL,4.00,5.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(290,5,23,133,18,'Cinta de Goteo 8mil',NULL,NULL,3.00,4.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(291,5,23,134,18,'Aspersor Rotativo',NULL,NULL,45.00,56.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(292,5,23,133,18,'Microaspersor 360°',NULL,NULL,8.00,11.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(293,5,23,135,18,'Conector Inicial 16mm',NULL,NULL,2.00,3.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(294,5,23,135,18,'Válvula de Bola 1 Pulg',NULL,NULL,18.00,24.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(295,5,23,133,18,'Filtro de Anillos',NULL,NULL,120.00,145.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(296,5,23,134,18,'Goteros Autocompensados',NULL,NULL,3.00,4.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(297,5,24,111,16,'Bioestimulante Algas',NULL,NULL,130.00,158.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(298,5,24,105,16,'Aminoácidos Foliar',NULL,NULL,110.00,134.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(299,5,24,108,17,'Quelato de Hierro',NULL,NULL,95.00,116.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(300,5,24,111,16,'Calcio Boro Foliar',NULL,NULL,100.00,122.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(301,5,24,105,16,'Zinc Manganeso Foliar',NULL,NULL,105.00,128.00,0.00,0.00,0,0,1,'2026-06-29 22:41:21'),
(302,5,19,115,18,'PRODUCTO PRUEBA 1',NULL,NULL,1.00,1.00,0.00,0.00,10,0,1,'2026-06-29 22:44:06'),
(303,5,19,130,16,'Omega1',NULL,NULL,95.00,100.00,5.00,0.00,100,0,1,'2026-07-03 13:14:54'),
(304,5,19,115,16,'avante',NULL,NULL,95.00,100.00,5.00,0.00,50,0,1,'2026-07-03 13:18:45');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `producto_fraccion`
--

DROP TABLE IF EXISTS `producto_fraccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_fraccion` (
  `id_prod_fraccion` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_conversion` int NOT NULL,
  `precio_mayor` decimal(12,2) NOT NULL DEFAULT '0.00',
  `precio_menor` decimal(12,2) NOT NULL DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_prod_fraccion`),
  UNIQUE KEY `uq_prod_conv` (`id_producto`,`id_conversion`),
  KEY `fk_pf_conversion` (`id_conversion`),
  KEY `fk_pf_producto` (`id_producto`),
  CONSTRAINT `fk_pf_conversion` FOREIGN KEY (`id_conversion`) REFERENCES `conversion_unidad` (`id_conversion`),
  CONSTRAINT `fk_pf_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_fraccion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `producto_fraccion` WRITE;
/*!40000 ALTER TABLE `producto_fraccion` DISABLE KEYS */;
INSERT INTO `producto_fraccion` VALUES
(1,101,1,200.00,300.00,1),
(3,73,4,200.00,300.00,1),
(4,150,5,20.00,30.00,1);
/*!40000 ALTER TABLE `producto_fraccion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `empresa` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `uq_proveedor_nit` (`nit`,`id_empresa`),
  KEY `fk_prov_empresa` (`id_empresa`),
  CONSTRAINT `fk_prov_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES
(1,5,'sddsd','4',NULL,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int DEFAULT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES
(1,1,'Administrador'),
(2,1,'VENDEDOR'),
(3,1,'ALMACENERO'),
(6,4,'Administrador'),
(7,4,'VENDEDOR'),
(8,4,'ALMACENERO'),
(9,5,'Administrador'),
(10,5,'VENDEDOR'),
(11,5,'ALMACENERO');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `fk_rp_permiso` (`id_permiso`),
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES
(1,1),
(6,1),
(9,1),
(1,2),
(6,2),
(9,2),
(1,3),
(6,3),
(9,3),
(1,4),
(6,4),
(9,4),
(1,5),
(6,5),
(9,5),
(1,6),
(2,6),
(6,6),
(7,6),
(9,6),
(10,6),
(1,7),
(6,7),
(9,7),
(1,8),
(6,8),
(9,8),
(1,9),
(6,9),
(9,9),
(1,10),
(6,10),
(9,10),
(1,11),
(6,11),
(9,11),
(1,12),
(6,12),
(9,12),
(1,13),
(6,13),
(9,13),
(1,14),
(6,14),
(9,14),
(1,15),
(2,15),
(3,15),
(6,15),
(7,15),
(8,15),
(9,15),
(10,15),
(11,15),
(1,16),
(6,16),
(9,16),
(1,17),
(6,17),
(9,17),
(1,18),
(6,18),
(9,18),
(1,19),
(6,19),
(9,19),
(1,20),
(6,20),
(9,20),
(1,21),
(6,21),
(9,21),
(1,22),
(6,22),
(9,22),
(1,23),
(6,23),
(9,23),
(1,24),
(6,24),
(9,24),
(1,25),
(6,25),
(9,25),
(1,26),
(6,26),
(9,26),
(1,27),
(6,27),
(9,27),
(1,28),
(6,28),
(9,28),
(1,29),
(6,29),
(9,29),
(1,30),
(6,30),
(9,30),
(1,31),
(6,31),
(9,31),
(1,32),
(6,32),
(9,32),
(1,33),
(2,33),
(3,33),
(6,33),
(7,33),
(8,33),
(9,33),
(10,33),
(11,33),
(1,34),
(2,34),
(3,34),
(6,34),
(7,34),
(8,34),
(9,34),
(10,34),
(11,34),
(1,35),
(6,35),
(9,35),
(1,36),
(6,36),
(9,36),
(1,37),
(6,37),
(9,37),
(1,38),
(6,38),
(9,38),
(1,39),
(3,39),
(6,39),
(8,39),
(9,39),
(11,39),
(1,40),
(2,40),
(6,40),
(7,40),
(9,40),
(10,40),
(1,41),
(6,41),
(9,41),
(1,42),
(6,42),
(9,42),
(1,43),
(2,43),
(3,43),
(6,43),
(7,43),
(8,43),
(9,43),
(10,43),
(11,43),
(1,44),
(6,44),
(9,44),
(1,45),
(3,45),
(6,45),
(8,45),
(9,45),
(11,45),
(1,46),
(3,46),
(6,46),
(8,46),
(9,46),
(11,46),
(1,47),
(3,47),
(6,47),
(8,47),
(9,47),
(11,47),
(1,48),
(3,48),
(6,48),
(8,48),
(9,48),
(11,48),
(1,49),
(3,49),
(6,49),
(8,49),
(9,49),
(11,49),
(1,50),
(3,50),
(6,50),
(8,50),
(9,50),
(11,50),
(1,51),
(3,51),
(6,51),
(9,51),
(11,51),
(1,52),
(3,52),
(6,52),
(8,52),
(9,52),
(11,52),
(1,53),
(3,53),
(6,53),
(8,53),
(9,53),
(11,53),
(1,54),
(3,54),
(6,54),
(8,54),
(9,54),
(11,54),
(1,55),
(3,55),
(8,55),
(9,55),
(11,55),
(1,56),
(3,56),
(8,56),
(9,56),
(11,56),
(1,57),
(3,57),
(8,57),
(9,57),
(11,57),
(1,58),
(3,58),
(8,58),
(9,58),
(11,58),
(1,59),
(9,59),
(1,60),
(3,60),
(8,60),
(9,60),
(11,60),
(1,61),
(3,61),
(8,61),
(9,61),
(11,61),
(1,62),
(3,62),
(8,62),
(9,62),
(11,62),
(1,63),
(3,63),
(8,63),
(9,63),
(11,63),
(1,64),
(3,64),
(8,64),
(9,64),
(11,64),
(1,65),
(9,65),
(1,66),
(3,66),
(8,66),
(9,66),
(11,66),
(1,67),
(9,67),
(1,68),
(9,68),
(1,69),
(2,69),
(6,69),
(7,69),
(9,69),
(10,69),
(1,70),
(2,70),
(6,70),
(7,70),
(9,70),
(10,70),
(1,71),
(2,71),
(6,71),
(7,71),
(9,71),
(10,71),
(1,72),
(2,72),
(6,72),
(7,72),
(9,72),
(10,72),
(1,73),
(6,73),
(9,73),
(1,74),
(6,74),
(9,74),
(1,75),
(2,75),
(6,75),
(7,75),
(9,75),
(10,75),
(1,76),
(2,76),
(6,76),
(7,76),
(9,76),
(10,76),
(1,77),
(2,77),
(6,77),
(7,77),
(9,77),
(10,77),
(1,78),
(2,78),
(6,78),
(7,78),
(9,78),
(10,78),
(1,79),
(2,79),
(6,79),
(7,79),
(9,79),
(10,79),
(1,80),
(6,80),
(9,80),
(1,81),
(2,81),
(6,81),
(7,81),
(9,81),
(10,81),
(1,82),
(2,82),
(6,82),
(7,82),
(9,82),
(10,82),
(1,83),
(2,83),
(6,83),
(7,83),
(9,83),
(10,83),
(1,84),
(6,84),
(9,84),
(1,85),
(6,85),
(9,85),
(1,86),
(6,86),
(9,86),
(1,87),
(6,87),
(9,87),
(1,88),
(2,88),
(6,88),
(7,88),
(9,88),
(10,88),
(1,89),
(3,89),
(9,89),
(11,89),
(1,90),
(3,90),
(9,90),
(11,90),
(1,91),
(3,91),
(9,91),
(11,91),
(1,92),
(3,92),
(9,92),
(11,92),
(1,93),
(2,93),
(6,93),
(7,93),
(9,93),
(10,93),
(1,94),
(6,94),
(9,94),
(1,95),
(6,95),
(9,95),
(1,96),
(6,96),
(9,96),
(1,97),
(2,97),
(6,97),
(7,97),
(9,97),
(10,97),
(1,98),
(2,98),
(6,98),
(7,98),
(9,98),
(10,98),
(1,99),
(2,99),
(6,99),
(7,99),
(9,99),
(10,99),
(1,100),
(2,100),
(6,100),
(7,100),
(9,100),
(10,100),
(1,101),
(2,101),
(6,101),
(7,101),
(9,101),
(10,101),
(1,102),
(2,102),
(6,102),
(7,102),
(9,102),
(10,102),
(1,103),
(2,103),
(6,103),
(7,103),
(9,103),
(10,103),
(1,104),
(2,104),
(6,104),
(7,104),
(9,104),
(10,104),
(1,105),
(2,105),
(6,105),
(7,105),
(9,105),
(10,105),
(1,106),
(2,106),
(6,106),
(7,106),
(9,106),
(10,106),
(1,107),
(3,107),
(6,107),
(8,107),
(9,107),
(11,107),
(1,108),
(3,108),
(6,108),
(8,108),
(9,108),
(11,108),
(1,109),
(3,109),
(6,109),
(8,109),
(9,109),
(11,109),
(1,110),
(3,110),
(6,110),
(8,110),
(9,110),
(11,110),
(1,111),
(9,111),
(1,112),
(9,112),
(1,113),
(6,113),
(9,113),
(1,114),
(3,114),
(6,114),
(8,114),
(9,114),
(11,114),
(1,115),
(3,115),
(6,115),
(8,115),
(9,115),
(11,115),
(1,116),
(3,116),
(6,116),
(8,116),
(9,116),
(11,116),
(1,117),
(9,117),
(1,118),
(9,118),
(1,119),
(2,119),
(3,119),
(6,119),
(7,119),
(8,119),
(9,119),
(10,119),
(11,119),
(1,120),
(6,120),
(9,120),
(1,121),
(6,121),
(9,121),
(1,122),
(3,122),
(9,122),
(11,122),
(1,123),
(3,123),
(9,123),
(11,123),
(1,124),
(9,124),
(1,125),
(9,125),
(1,126),
(9,126),
(1,127),
(3,127),
(9,127),
(11,127),
(1,128),
(9,128),
(1,129),
(2,129),
(3,129),
(6,129),
(7,129),
(8,129),
(9,129),
(10,129),
(11,129),
(1,130),
(2,130),
(3,130),
(6,130),
(7,130),
(8,130),
(9,130),
(10,130),
(11,130),
(1,131),
(2,131),
(3,131),
(6,131),
(7,131),
(8,131),
(9,131),
(10,131),
(11,131),
(1,132),
(6,132),
(9,132),
(1,133),
(6,133),
(9,133),
(1,134),
(6,134),
(9,134),
(1,135),
(6,135),
(9,135),
(1,136),
(6,136),
(9,136);
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `id_sucursal` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sucursal`),
  KEY `fk_suc_empresa` (`id_empresa`),
  CONSTRAINT `fk_suc_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
INSERT INTO `sucursal` VALUES
(1,1,'Sucursal Central','Chimore','Cochabamba',NULL,NULL,1,'2026-06-20 18:22:55'),
(2,1,'Sucursal Norte','','','','',1,'2026-06-20 18:23:56'),
(3,4,'Sucursal chimore','Av. estudiante','Chimores',NULL,NULL,1,'2026-06-25 11:11:59'),
(4,4,'Sucursal Central','','','','',1,'2026-06-25 11:13:13'),
(5,4,'Sucursal Norte','','','','',1,'2026-06-25 11:13:13'),
(6,5,'Sucursal Central','Av 1','Santa Cruz',NULL,NULL,1,'2026-06-29 22:40:01'),
(7,5,'Sucursal Norte','','','','',1,'2026-06-29 22:41:20'),
(8,5,'Chimoré','Av.ajedrez','Chimoré-Cochabamba',NULL,NULL,1,'2026-07-03 13:46:42');
/*!40000 ALTER TABLE `sucursal` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `super_admin`
--

DROP TABLE IF EXISTS `super_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `super_admin` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `uq_admin_correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admin`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `super_admin` WRITE;
/*!40000 ALTER TABLE `super_admin` DISABLE KEYS */;
INSERT INTO `super_admin` VALUES
(1,'Ruben Felipe','ruben16felipe@gmail.com','$2b$10$d4lbs5r6ZzArqhXcfdcyAO8ZyGbZKkJWErP1QhNC1weRpYY/aUmQi','2026-06-29 23:11:53',1,'2026-06-19 13:38:39');
/*!40000 ALTER TABLE `super_admin` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `suscripcion`
--

DROP TABLE IF EXISTS `suscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `suscripcion` (
  `id_suscripcion` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `id_plan` int NOT NULL,
  `ciclo` enum('MENSUAL','ANUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MENSUAL',
  `estado` enum('PRUEBA','ACTIVA','VENCIDA','CANCELADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRUEBA',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_suscripcion`),
  KEY `fk_sus_empresa` (`id_empresa`),
  KEY `fk_sus_plan` (`id_plan`),
  CONSTRAINT `fk_sus_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_sus_plan` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id_plan`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suscripcion`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `suscripcion` WRITE;
/*!40000 ALTER TABLE `suscripcion` DISABLE KEYS */;
INSERT INTO `suscripcion` VALUES
(1,1,1,'MENSUAL','CANCELADA','2026-06-20','2026-06-27','2026-06-20 18:21:25'),
(2,1,3,'MENSUAL','ACTIVA','2026-06-20','2026-07-20','2026-06-20 18:21:39'),
(5,4,1,'MENSUAL','CANCELADA','2026-06-25','2026-07-02','2026-06-25 11:10:40'),
(6,4,2,'ANUAL','ACTIVA','2026-06-25','2027-06-25','2026-06-25 11:11:55'),
(7,5,1,'MENSUAL','CANCELADA','2026-06-29','2026-07-06','2026-06-29 22:37:22'),
(8,5,4,'MENSUAL','ACTIVA','2026-06-29','2026-07-29','2026-06-29 22:39:06');
/*!40000 ALTER TABLE `suscripcion` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `traslado`
--

DROP TABLE IF EXISTS `traslado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `traslado` (
  `id_traslado` int NOT NULL AUTO_INCREMENT,
  `id_lote_origen` int NOT NULL,
  `id_sucursal_dest` int NOT NULL,
  `id_usuario` int NOT NULL,
  `cantidad_cajas` int NOT NULL DEFAULT '0',
  `cantidad_unidades` int NOT NULL DEFAULT '0',
  `fecha_traslado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('PENDIENTE','CONFIRMADO','CANCELADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_traslado`),
  KEY `fk_tras_lote` (`id_lote_origen`),
  KEY `fk_tras_sucursal` (`id_sucursal_dest`),
  KEY `fk_tras_usuario` (`id_usuario`),
  CONSTRAINT `fk_tras_lote` FOREIGN KEY (`id_lote_origen`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `fk_tras_sucursal` FOREIGN KEY (`id_sucursal_dest`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_tras_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traslado`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `traslado` WRITE;
/*!40000 ALTER TABLE `traslado` DISABLE KEYS */;
INSERT INTO `traslado` VALUES
(1,151,3,5,8,0,'2026-06-25 11:32:39','PENDIENTE',NULL),
(2,297,8,6,0,4,'2026-07-03 19:15:27','CANCELADO',NULL),
(3,297,8,6,0,4,'2026-07-03 19:15:52','CANCELADO',NULL);
/*!40000 ALTER TABLE `traslado` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `unidad_medida`
--

DROP TABLE IF EXISTS `unidad_medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidad_medida` (
  `id_unidad` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abreviatura` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `uq_unidad_abreviatura` (`abreviatura`,`id_empresa`),
  KEY `fk_unidad_empresa` (`id_empresa`),
  CONSTRAINT `fk_unidad_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidad_medida`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `unidad_medida` WRITE;
/*!40000 ALTER TABLE `unidad_medida` DISABLE KEYS */;
INSERT INTO `unidad_medida` VALUES
(1,1,'bolsa','bolsa'),
(2,1,'saco','saco'),
(3,1,'frasco','frasc'),
(4,1,'lt','lt'),
(5,1,'kg','kg'),
(6,1,'unidad','unida'),
(7,4,'bolsa','bolsa'),
(8,4,'saco','saco'),
(9,4,'frasco','frasc'),
(10,4,'lt','lt'),
(11,4,'kg','kg'),
(12,4,'unidad','unida'),
(13,5,'bolsa','bolsa'),
(14,5,'saco','saco'),
(15,5,'frasco','frasc'),
(16,5,'lt','lt'),
(17,5,'kg','kg'),
(18,5,'unidad','unida');
/*!40000 ALTER TABLE `unidad_medida` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `id_rol` int DEFAULT NULL,
  `id_sucursal` int DEFAULT NULL,
  `ci` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `celular` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_ci` (`ci`),
  UNIQUE KEY `uq_usuario_correo` (`correo`),
  KEY `fk_usuario_rol` (`id_rol`),
  KEY `fk_usuario_sucursal` (`id_sucursal`),
  KEY `fk_usu_empresa` (`id_empresa`),
  CONSTRAINT `fk_usu_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES
(1,1,1,1,'9391668','Ruben','Felipe',NULL,'rubenfelipe@agro.bo','$2b$10$4wKYMgOIvJ96YrOFWAw4iuIB.C596fM9s7ayV91L6OeJh21gDIFwW',1,'2026-06-20 18:21:25'),
(2,1,2,1,'9391667','Felipe','Mejia','74819133','felipe@agro.bo','$2b$10$bN/GalIhRjDotbLcbQDyjePXga5V4AO9rp.qVhXQ6oeLV7w5YefXO',1,'2026-06-20 18:30:01'),
(5,4,6,4,'9391664','Felipe','Mejia',NULL,'felipe@agrobasico.bo','$2b$10$WNlmMVsTgDk2zVHGqSs7du3IRIPuOeC9eygzVOLNnExOzir3UUyki',1,'2026-06-25 11:10:41'),
(6,5,9,7,'858484','David','Campos',NULL,'campos@agropecuaria.bo','$2b$10$7TQzDi1/4kxWACzEt9A.UuhPrkFMGFkzjb.PO7sIgPUfSEMX403PC',1,'2026-06-29 22:37:22'),
(7,5,10,8,'13678942','pedro','gold',NULL,'venta@agropecuaria.bo','$2b$10$2w1.YHr2AI5e7NSH/KvlueJ3G2.bn6VkEt1H6F.THXQR1/fii3JZa',1,'2026-07-03 13:45:45'),
(8,4,6,NULL,'13456789','Tonny','Montana',NULL,'tonny@agrobasico.bo','$2b$10$EM5gRbhoVjqY/pDnVmtTWO.wo2B0q36spwgvfdoQqvvnGhkHrxAwa',1,'2026-07-03 19:23:44'),
(9,4,8,NULL,'12453245','Mani','de Montana',NULL,'mani@agrobasico.bo','$2b$10$7jrz7Xv.SBh/a8QdhRZtp.QV5FliIgUBchgP7hoIPhfc4ttGPpg5u',1,'2026-07-03 19:27:10');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `id_sucursal` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_apertura` int DEFAULT NULL,
  `nro_factura` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_venta` enum('MENOR','MAYOR') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MENOR',
  `subtotal` decimal(14,2) NOT NULL DEFAULT '0.00',
  `descuento_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `monto_pagado` decimal(14,2) NOT NULL DEFAULT '0.00',
  `cambio` decimal(14,2) NOT NULL DEFAULT '0.00',
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','QR','QR_ESTATICO','CREDITO','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EFECTIVO',
  `estado` enum('COMPLETADA','ANULADA','PENDIENTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETADA',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_vencimiento_credito` date DEFAULT NULL,
  `estado_credito` enum('PENDIENTE','PARCIAL','PAGADO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codepay_order_id` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codepay_tx_id` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codepay_voucher` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `fk_venta_sucursal` (`id_sucursal`),
  KEY `fk_venta_usuario` (`id_usuario`),
  KEY `fk_venta_cliente` (`id_cliente`),
  KEY `fk_venta_apertura` (`id_apertura`),
  CONSTRAINT `fk_venta_apertura` FOREIGN KEY (`id_apertura`) REFERENCES `apertura_cierre_caja` (`id_apertura`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_venta_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES
(1,1,1,1,NULL,NULL,'2026-06-20 20:23:55','MENOR',244.00,20.00,224.00,0.00,0.00,'CREDITO','COMPLETADA',NULL,'2026-07-20','PAGADO',NULL,NULL,NULL),
(2,6,6,NULL,NULL,NULL,'2026-06-29 22:43:22','MENOR',285.00,0.00,285.00,285.00,0.00,'QR','PENDIENTE',NULL,NULL,NULL,'VTA_mqzt0kbw_wod',NULL,NULL),
(3,6,6,NULL,NULL,NULL,'2026-06-29 22:46:49','MENOR',1.00,0.00,1.00,1.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mqzt50am_uka','tx_1782773211875_c601068d','0'),
(4,6,6,2,NULL,NULL,'2026-06-29 22:51:37','MENOR',256.00,0.00,256.00,0.00,0.00,'CREDITO','COMPLETADA',NULL,'2026-09-29','PARCIAL',NULL,NULL,NULL),
(5,6,6,NULL,NULL,NULL,'2026-07-03 15:01:23','MENOR',110.00,0.00,110.00,110.00,0.00,'EFECTIVO','COMPLETADA',NULL,NULL,NULL,NULL,NULL,NULL),
(6,6,6,NULL,NULL,NULL,'2026-07-03 15:03:15','MENOR',90.00,0.00,90.00,90.00,0.00,'QR_ESTATICO','COMPLETADA',NULL,NULL,NULL,NULL,NULL,NULL),
(7,6,6,NULL,NULL,NULL,'2026-07-05 15:51:49','MENOR',220.00,0.00,220.00,220.00,0.00,'EFECTIVO','COMPLETADA',NULL,NULL,NULL,NULL,NULL,NULL),
(8,4,5,NULL,NULL,NULL,'2026-07-06 15:47:38','MENOR',86.00,0.00,86.00,86.00,0.00,'EFECTIVO','COMPLETADA',NULL,NULL,NULL,NULL,NULL,NULL),
(9,6,6,NULL,NULL,NULL,'2026-07-09 01:08:21','MENOR',104.00,0.00,104.00,104.00,0.00,'QR','PENDIENTE',NULL,NULL,NULL,'VTA_mrct5oi9_rzv',NULL,NULL),
(10,6,6,NULL,NULL,NULL,'2026-07-09 01:10:08','MENOR',86.00,0.00,86.00,86.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrct7z9i_3ds','tx_1783559409518_086125a9','SANDBOX_1783545839'),
(11,6,6,NULL,NULL,NULL,'2026-07-09 01:10:52','MENOR',86.00,0.00,86.00,86.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrct8xfq_1fx','tx_1783559452852_5d31ba7a','SANDBOX_1783545832'),
(12,6,6,NULL,NULL,NULL,'2026-07-09 01:14:37','MENOR',104.00,0.00,104.00,104.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrctdr24_fig','tx_1783559677989_e9e5186b','SANDBOX_1783545826'),
(13,6,6,NULL,NULL,NULL,'2026-07-09 01:15:24','MENOR',65.00,0.00,65.00,65.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrcter2d_5p2','tx_1783559724789_204b2384','SANDBOX_1783545352'),
(14,6,6,NULL,NULL,NULL,'2026-07-09 01:30:15','MENOR',1.00,0.00,1.00,1.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrctxurk_ibq','tx_1783560615943_831a508d','SANDBOX_1783546275'),
(15,6,6,NULL,NULL,NULL,'2026-07-09 01:30:36','MENOR',1.00,0.00,1.00,1.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrctyauy_l93','tx_1783560636637_a6cfd36c','SANDBOX_1783546282'),
(16,6,6,NULL,NULL,NULL,'2026-07-09 01:51:16','MENOR',72.00,0.00,72.00,72.00,0.00,'QR','PENDIENTE',NULL,NULL,NULL,'VTA_mrcuovu0_4i4','tx_1783561877101_846b26f3',NULL),
(17,6,6,NULL,NULL,NULL,'2026-07-09 01:59:50','MENOR',1.00,0.00,1.00,1.00,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrcuzw5k_iw1','tx_1783562391729_0afb7069','0'),
(18,7,6,NULL,NULL,NULL,'2026-07-22 09:16:01','MENOR',1.00,0.00,1.00,1.00,0.00,'QR','PENDIENTE',NULL,NULL,NULL,'VTA_mrvvaww9_yb4','tx_1784711763511_6907c9bb',NULL),
(19,7,6,NULL,NULL,NULL,'2026-07-22 09:18:12','MENOR',1.00,0.00,1.00,1.00,0.00,'QR','PENDIENTE',NULL,NULL,NULL,'VTA_mrvvdpuq_k03','tx_1784711894028_b7896db4',NULL),
(20,7,6,NULL,NULL,NULL,'2026-07-22 09:20:58','MENOR',1.00,0.00,1.00,0.95,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrvvh9pw_afe','tx_1784712059712_84010726','0'),
(21,7,6,NULL,NULL,NULL,'2026-07-23 07:06:35','MENOR',1.00,0.00,1.00,0.95,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrx64atp_kji','tx_1784790397622_81246131','0'),
(22,7,6,NULL,NULL,NULL,'2026-07-23 07:25:23','MENOR',1.00,0.00,1.00,0.95,0.00,'QR','COMPLETADA',NULL,NULL,NULL,'VTA_mrx6shax_hka','tx_1784791525510_98fd46ba','0');
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-08-05  7:00:03
