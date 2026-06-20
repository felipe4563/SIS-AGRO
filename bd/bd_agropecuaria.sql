-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-06-2026 a las 22:32:05
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_agropecuaria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apertura_cierre_caja`
--

CREATE TABLE `apertura_cierre_caja` (
  `id_apertura` int(11) NOT NULL,
  `id_caja` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `monto_inicial` decimal(14,2) NOT NULL DEFAULT 0.00,
  `monto_esperado` decimal(14,2) DEFAULT NULL,
  `monto_final` decimal(14,2) DEFAULT NULL,
  `diferencia` decimal(14,2) DEFAULT NULL,
  `fecha_apertura` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` datetime DEFAULT NULL,
  `estado` enum('ABIERTA','CERRADA') NOT NULL DEFAULT 'ABIERTA',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `apertura_cierre_caja`
--

INSERT INTO `apertura_cierre_caja` (`id_apertura`, `id_caja`, `id_usuario`, `id_sucursal`, `monto_inicial`, `monto_esperado`, `monto_final`, `diferencia`, `fecha_apertura`, `fecha_cierre`, `estado`, `observaciones`) VALUES
(1, 1, 2, 1, 500.00, 4070.00, 4080.00, 10.00, '2026-05-20 08:00:00', '2026-05-20 18:30:00', 'CERRADA', 'Turno sin novedad. Sobrante Bs 10 por redondeo en cambio.'),
(2, 1, 3, 1, 500.00, 815.00, 500.00, -315.00, '2026-05-26 08:00:00', '2026-05-27 11:27:53', 'CERRADA', NULL),
(3, 3, 4, 2, 300.00, 300.00, 200.00, -100.00, '2026-05-26 08:30:00', '2026-06-01 04:26:43', 'CERRADA', NULL),
(4, 4, 1, 3, 50.00, 1025.00, 2000.00, 975.00, '2026-05-27 08:23:56', '2026-05-27 09:02:53', 'CERRADA', NULL),
(5, 4, 1, 3, 100.00, 1500.00, 1500.00, 0.00, '2026-05-27 09:03:35', '2026-05-27 09:05:21', 'CERRADA', NULL),
(6, 1, 5, 1, 100.00, 345.00, 345.00, 0.00, '2026-05-27 14:52:59', '2026-05-27 14:54:14', 'CERRADA', NULL),
(7, 5, 9, 4, 2.00, 2.00, 2.00, 0.00, '2026-06-15 16:31:02', '2026-06-15 16:31:06', 'CERRADA', NULL),
(8, 6, 10, 5, 0.00, 0.00, 0.00, 0.00, '2026-06-15 22:48:03', '2026-06-15 22:55:13', 'CERRADA', NULL),
(9, 4, 1, 3, 100.00, 500.00, 520.00, 20.00, '2026-06-16 12:16:29', '2026-06-16 12:22:37', 'CERRADA', NULL),
(10, 7, 15, 7, 100.00, 100.00, 100.00, 0.00, '2026-06-17 11:29:35', '2026-06-17 11:33:16', 'CERRADA', NULL),
(11, 7, 15, 7, 100.00, 100.00, 100.00, 0.00, '2026-06-17 11:37:23', '2026-06-17 11:53:36', 'CERRADA', NULL),
(12, 9, 16, 8, 100.00, 100.00, 100.00, 0.00, '2026-06-17 11:48:40', '2026-06-17 11:53:54', 'CERRADA', NULL),
(13, 4, 1, 3, 100.00, 380.00, 380.00, 0.00, '2026-06-17 12:08:48', '2026-06-17 12:11:28', 'CERRADA', NULL),
(14, 4, 1, 3, 200.00, 200.00, 200.00, 0.00, '2026-06-18 13:08:36', '2026-06-18 13:19:25', 'CERRADA', NULL),
(15, 4, 1, 3, 100.00, NULL, NULL, NULL, '2026-06-18 13:19:57', NULL, 'ABIERTA', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja`
--

CREATE TABLE `caja` (
  `id_caja` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `caja`
--

INSERT INTO `caja` (`id_caja`, `id_sucursal`, `nombre`, `descripcion`, `activo`, `creado_en`) VALUES
(1, 1, 'Caja Principal Sucursal Central', 'Caja principal de atención — Sucursal Central', 1, '2026-05-26 15:27:53'),
(2, 1, 'Caja 2 Sucursal central', 'Segunda caja para temporada alta — Sucursal Central', 1, '2026-05-26 15:27:53'),
(3, 2, 'Caja Principal Sucursal Norte', 'Caja única — Sucursal Norte', 1, '2026-05-26 15:27:53'),
(4, 3, 'Caja Principal Sucursal Cochabamba', 'Caja única — Sucursal Cochabamba', 1, '2026-05-26 15:27:53'),
(5, 4, 'caja shina', NULL, 1, '2026-06-15 16:30:52'),
(6, 5, 'Caja Chimore', NULL, 1, '2026-06-15 22:32:24'),
(7, 8, 'Segunda Caja chimore', NULL, 1, '2026-06-16 12:29:14'),
(8, 8, 'Caja segunda', NULL, 1, '2026-06-17 11:41:31'),
(9, 8, 'Caja Chimore', NULL, 1, '2026-06-17 11:47:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_movimiento`
--

CREATE TABLE `categoria_movimiento` (
  `id_categoria` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('INGRESO','EGRESO','AMBOS') NOT NULL DEFAULT 'AMBOS',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria_movimiento`
--

INSERT INTO `categoria_movimiento` (`id_categoria`, `id_empresa`, `nombre`, `tipo`, `activo`, `created_at`) VALUES
(1, 1, 'Servicios básicos', 'EGRESO', 1, '2026-06-03 07:23:32'),
(2, 1, 'Sueldos y salarios', 'EGRESO', 1, '2026-06-03 07:23:32'),
(3, 1, 'Alquiler', 'EGRESO', 1, '2026-06-03 07:23:32'),
(4, 1, 'Transporte', 'EGRESO', 1, '2026-06-03 07:23:32'),
(5, 1, 'Mantenimiento', 'EGRESO', 1, '2026-06-03 07:23:32'),
(6, 1, 'Otros gastos', 'EGRESO', 1, '2026-06-03 07:23:32'),
(7, 1, 'Ingresos varios', 'INGRESO', 1, '2026-06-03 07:23:32'),
(8, 1, 'Préstamos recibidos', 'INGRESO', 1, '2026-06-03 07:23:32'),
(9, 1, 'aatecnicos', 'EGRESO', 1, '2026-06-16 12:34:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clasificacion_producto`
--

CREATE TABLE `clasificacion_producto` (
  `id_clasificacion` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clasificacion_producto`
--

INSERT INTO `clasificacion_producto` (`id_clasificacion`, `id_empresa`, `nombre`, `descripcion`, `activo`) VALUES
(1, 1, 'Semillas', 'Semillas certificadas para siembra', 1),
(2, 1, 'Fertilizantes', 'Abonos y nutrientes para el suelo', 1),
(3, 1, 'Agroquímicos', 'Herbicidas, fungicidas e insecticidas', 1),
(4, 1, 'Veterinaria', 'Medicamentos y vacunas para animales', 1),
(5, 1, 'Herramientas', 'Equipos y herramientas de labranza', 1),
(6, 1, 'Alimento Animal', 'Balanceados y suplementos para ganado y aves', 1),
(7, 1, 'Riego', 'Equipos y accesorios para sistemas de riego', 1),
(8, 2, 'Insecticida', NULL, 1),
(9, 1, 'Foliares', NULL, 1),
(10, 4, 'Herbicida', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `ci_nit` varchar(20) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `empresa` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `tipo_cliente` enum('MINORISTA','MAYORISTA') NOT NULL DEFAULT 'MINORISTA',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `id_empresa`, `ci_nit`, `nombre`, `apellido`, `empresa`, `telefono`, `correo`, `direccion`, `tipo_cliente`, `activo`, `creado_en`) VALUES
(1, 1, '6012345001', 'Gerencia', NULL, 'Agroindustrias El Campo S.R.L.', '33412300', 'compras@elcampo.bo', 'Km 12 Carretera al Norte, Santa Cruz', 'MAYORISTA', 1, '2026-05-26 15:27:53'),
(2, 1, '7023456002', 'Gerencia', NULL, 'Cooperativa Agrícola San Juan', '33423456', 'coop.sanjuan@gmail.com', 'Municipio San Juan, Santa Cruz', 'MAYORISTA', 1, '2026-05-26 15:27:53'),
(3, 1, '8034567003', 'Gerencia', NULL, 'Hacienda Los Pinos', '71534560', 'lospinos@hotmail.com', 'Yapacaní, Santa Cruz', 'MAYORISTA', 1, '2026-05-26 15:27:53'),
(4, 1, '3456701', 'Pedro', 'Quisbert Mamani', NULL, '76345678', NULL, 'Comunidad El Palmar, Cochabamba', 'MINORISTA', 1, '2026-05-26 15:27:53'),
(5, 1, '4567802', 'Rosa', 'Torrico Alvarado', NULL, '71456789', NULL, 'Barrio San Aurelio, Santa Cruz', 'MINORISTA', 1, '2026-05-26 15:27:53'),
(6, 1, '5678903', 'Jorge', 'Vaca Suárez', NULL, '68567890', NULL, 'Montero, Santa Cruz', 'MINORISTA', 1, '2026-05-26 15:27:53'),
(7, 1, '6789004', 'Carmen', 'Aguilar López', NULL, '79678901', NULL, 'Warnes, Santa Cruz', 'MINORISTA', 1, '2026-05-26 15:27:53'),
(8, 1, '7890105', 'Efraín', 'Chura Condori', NULL, '73789012', NULL, 'Colcapirhua, Cochabamba', 'MINORISTA', 1, '2026-05-26 15:27:53'),
(9, 4, NULL, 'juani', 'h', NULL, NULL, NULL, NULL, 'MINORISTA', 1, '2026-06-18 09:22:54'),
(10, 1, '93916698', 'Juan', 'Perez', NULL, '74819122', NULL, NULL, 'MINORISTA', 1, '2026-06-18 13:20:18'),
(11, 1, '89945154', 'Delicia', 'Condori', NULL, '74819169', NULL, NULL, 'MAYORISTA', 1, '2026-06-18 13:21:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id_compra` int(11) NOT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nro_factura` varchar(60) DEFAULT NULL,
  `fecha_compra` date NOT NULL,
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `estado` enum('PENDIENTE','RECIBIDO','CANCELADO') NOT NULL DEFAULT 'RECIBIDO',
  `observaciones` text DEFAULT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','CREDITO','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  `monto_pagado` decimal(14,2) NOT NULL DEFAULT 0.00,
  `fecha_vencimiento_credito` date DEFAULT NULL,
  `estado_credito` enum('PENDIENTE','PARCIAL','PAGADO') DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compra`
--

INSERT INTO `compra` (`id_compra`, `id_proveedor`, `id_sucursal`, `id_usuario`, `nro_factura`, `fecha_compra`, `subtotal`, `descuento`, `total`, `estado`, `observaciones`, `metodo_pago`, `monto_pagado`, `fecha_vencimiento_credito`, `estado_credito`, `creado_en`) VALUES
(1, 1, 1, 6, 'FACT-AGR-0001-2026', '2026-01-10', 24750.00, 750.00, 24000.00, 'RECIBIDO', NULL, 'EFECTIVO', 24000.00, NULL, NULL, '2026-05-26 15:27:53'),
(2, 5, 1, 6, 'FACT-AGR-0002-2026', '2026-02-05', 15900.00, 400.00, 15500.00, 'RECIBIDO', NULL, 'EFECTIVO', 15500.00, NULL, NULL, '2026-05-26 15:27:53'),
(3, 4, 2, 7, 'FACT-AGR-0003-2026', '2026-03-15', 14050.00, 50.00, 14000.00, 'RECIBIDO', NULL, 'EFECTIVO', 14000.00, NULL, NULL, '2026-05-26 15:27:53'),
(4, 3, 3, 8, 'FACT-AGR-0004-2026', '2026-04-20', 20000.00, 0.00, 20000.00, 'RECIBIDO', NULL, 'EFECTIVO', 20000.00, NULL, NULL, '2026-05-26 15:27:53'),
(5, 1, 3, 1, NULL, '2026-05-27', 40000.00, 0.00, 40000.00, 'RECIBIDO', NULL, 'EFECTIVO', 40000.00, NULL, NULL, '2026-05-27 08:56:36'),
(6, 1, 3, 1, NULL, '2026-05-27', 400.00, 0.00, 400.00, 'RECIBIDO', NULL, 'EFECTIVO', 400.00, NULL, NULL, '2026-05-27 08:58:51'),
(7, 1, 3, 1, NULL, '2026-05-27', 2400.00, 0.00, 2400.00, 'RECIBIDO', NULL, 'EFECTIVO', 2400.00, NULL, NULL, '2026-05-27 15:02:25'),
(8, 1, 3, 1, NULL, '2026-05-27', 5000.00, 0.00, 5000.00, 'RECIBIDO', NULL, 'EFECTIVO', 5000.00, NULL, NULL, '2026-05-27 18:27:36'),
(9, 2, 3, 1, 'F-001', '2026-06-01', 1200.00, 0.00, 1200.00, 'RECIBIDO', 'nada', 'EFECTIVO', 1200.00, NULL, NULL, '2026-06-01 04:18:07'),
(10, 5, 3, 1, 'F001', '2026-06-17', 1200.00, 0.00, 1200.00, 'RECIBIDO', NULL, 'CREDITO', 200.00, '2026-07-17', 'PAGADO', '2026-06-17 09:56:58'),
(11, 1, 3, 1, NULL, '2026-06-17', 1200.00, 0.00, 1200.00, 'RECIBIDO', NULL, 'CREDITO', 20.00, '2026-08-17', 'PARCIAL', '2026-06-17 10:28:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conversion_unidad`
--

CREATE TABLE `conversion_unidad` (
  `id_conversion` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL COMMENT 'Nombre de la sub-unidad: Arroba, Cuarta, Libra…',
  `abreviatura` varchar(10) NOT NULL COMMENT 'Símbolo corto: arr, cta, lb, kg',
  `id_unidad_base` int(11) NOT NULL COMMENT 'FK a unidad_medida (la unidad de compra/almacén)',
  `factor` decimal(10,4) NOT NULL COMMENT 'Cuántas sub-unidades = 1 unidad_base',
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sub-unidades de venta y su equivalencia con la unidad de almacén';

--
-- Volcado de datos para la tabla `conversion_unidad`
--

INSERT INTO `conversion_unidad` (`id_conversion`, `id_empresa`, `nombre`, `abreviatura`, `id_unidad_base`, `factor`, `activo`) VALUES
(1, 1, 'Arroba', 'arr', 4, 4.0000, 1),
(2, 1, 'Medio', 'med', 4, 2.0000, 1),
(3, 1, 'Kilo', 'kg', 4, 50.0000, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_compra`
--

CREATE TABLE `detalle_compra` (
  `id_detalle_compra` int(11) NOT NULL,
  `id_compra` int(11) NOT NULL,
  `id_lote` int(11) DEFAULT NULL,
  `id_producto` int(11) NOT NULL,
  `numero_lote_fab` varchar(60) DEFAULT NULL,
  `fecha_produccion` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_cajas` int(11) NOT NULL DEFAULT 0,
  `unidades_por_caja` int(11) NOT NULL DEFAULT 1,
  `precio_por_caja` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_compra`
--

INSERT INTO `detalle_compra` (`id_detalle_compra`, `id_compra`, `id_lote`, `id_producto`, `numero_lote_fab`, `fecha_produccion`, `fecha_vencimiento`, `cantidad_cajas`, `unidades_por_caja`, `precio_por_caja`, `subtotal`) VALUES
(1, 1, 1, 1, 'L-MAI-2601', '2025-10-01', '2027-09-30', 50, 1, 120.00, 6000.00),
(2, 1, 2, 2, 'L-SOY-2601', '2025-10-15', '2027-10-14', 30, 1, 95.00, 2850.00),
(3, 1, 3, 5, 'L-URE-2601', '2025-08-01', '2028-07-31', 40, 1, 210.00, 8400.00),
(4, 1, 4, 6, 'L-NPK-2601', '2025-09-01', '2028-08-31', 30, 1, 250.00, 7500.00),
(5, 2, 5, 8, 'L-RDP-2602', '2025-06-01', '2027-05-31', 20, 1, 180.00, 3600.00),
(6, 2, 6, 9, 'L-AMX-2602', '2025-07-01', '2027-06-30', 15, 1, 450.00, 6750.00),
(7, 2, 7, 10, 'L-DEC-2602', '2025-07-15', '2027-07-14', 10, 1, 280.00, 2800.00),
(8, 2, 8, 11, 'L-24D-2602', '2025-08-01', '2027-07-31', 25, 1, 90.00, 2250.00),
(9, 3, 9, 12, 'L-IVM-2603', '2025-11-01', '2027-10-31', 15, 1, 320.00, 4800.00),
(10, 3, 10, 13, 'L-VAC-2603', '2025-12-01', '2026-11-30', 20, 1, 280.00, 5600.00),
(11, 3, 11, 14, 'L-OXI-2603', '2025-11-15', '2027-11-14', 12, 1, 150.00, 1800.00),
(12, 3, 12, 15, 'L-BAL-2603', '2026-01-01', '2026-12-31', 30, 1, 195.00, 5850.00),
(13, 4, 13, 5, 'L-URE-2604', '2025-08-01', '2028-07-31', 35, 1, 210.00, 7350.00),
(14, 4, 14, 6, 'L-NPK-2604', '2025-09-01', '2028-08-31', 25, 1, 250.00, 6250.00),
(15, 4, 15, 7, 'L-SOP-2604', '2025-10-01', '2028-09-30', 20, 1, 320.00, 6400.00),
(16, 5, 18, 15, 'L-0903902', '2025-07-27', '2027-02-27', 20, 12, 2000.00, 40000.00),
(17, 6, 19, 15, 'L-1234', '2023-02-27', '2027-03-27', 2, 12, 200.00, 400.00),
(18, 7, 20, 9, NULL, '2025-09-27', '2026-06-27', 2, 12, 1200.00, 2400.00),
(19, 8, 21, 6, NULL, '2025-11-27', '2026-08-27', 1, 12, 5000.00, 5000.00),
(20, 9, 23, 16, 'L-0000', '2026-01-01', '2026-09-01', 1, 12, 1200.00, 1200.00),
(21, 10, 27, 17, 'L-2585', '2025-03-17', '2027-03-17', 1, 1, 1200.00, 1200.00),
(22, 11, 30, 17, NULL, '2025-12-17', '2026-10-17', 1, 4, 1200.00, 1200.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `tipo_cantidad` enum('CAJA','UNIDAD') NOT NULL DEFAULT 'UNIDAD',
  `id_conversion` int(11) DEFAULT NULL COMMENT 'Sub-unidad usada en esta línea; NULL = unidad normal del lote',
  `cantidad` decimal(14,4) NOT NULL DEFAULT 1.0000,
  `precio_unitario` decimal(12,2) NOT NULL,
  `descuento_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `descuento_monto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id_detalle_venta`, `id_venta`, `id_lote`, `id_producto`, `tipo_cantidad`, `id_conversion`, `cantidad`, `precio_unitario`, `descuento_pct`, `descuento_monto`, `subtotal`) VALUES
(1, 1, 3, 5, 'CAJA', NULL, 10.0000, 235.00, 8.00, 188.00, 2162.00),
(2, 1, 4, 6, 'CAJA', NULL, 7.0000, 280.00, 8.00, 156.80, 1803.20),
(3, 2, 1, 1, 'CAJA', NULL, 3.0000, 135.00, 0.00, 0.00, 405.00),
(4, 3, 5, 8, 'CAJA', NULL, 1.0000, 210.00, 0.00, 0.00, 210.00),
(5, 3, 8, 11, 'CAJA', NULL, 1.0000, 105.00, 0.00, 0.00, 105.00),
(6, 4, 3, 5, 'CAJA', NULL, 8.0000, 210.00, 8.00, 134.40, 1545.60),
(7, 4, 4, 6, 'CAJA', NULL, 8.0000, 250.00, 8.00, 160.00, 1840.00),
(8, 4, 6, 9, 'CAJA', NULL, 2.0000, 450.00, 8.00, 72.00, 828.00),
(9, 5, 5, 8, 'CAJA', NULL, 1.0000, 210.00, 0.00, 0.00, 210.00),
(10, 6, 9, 12, 'CAJA', NULL, 10.0000, 320.00, 6.00, 192.00, 3008.00),
(11, 6, 10, 13, 'CAJA', NULL, 6.0000, 280.00, 6.00, 100.80, 1579.20),
(12, 7, 18, 15, 'UNIDAD', NULL, 2.0000, 215.00, 0.00, 0.00, 430.00),
(13, 8, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(14, 8, 16, 13, 'UNIDAD', NULL, 1.0000, 310.00, 0.00, 0.00, 310.00),
(15, 9, 14, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(16, 9, 18, 15, 'UNIDAD', NULL, 1.0000, 215.00, 0.00, 0.00, 215.00),
(17, 10, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(18, 10, 15, 7, 'UNIDAD', NULL, 1.0000, 360.00, 0.00, 0.00, 360.00),
(19, 10, 16, 13, 'UNIDAD', NULL, 1.0000, 310.00, 0.00, 0.00, 310.00),
(20, 11, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(21, 11, 15, 7, 'UNIDAD', NULL, 1.0000, 360.00, 0.00, 0.00, 360.00),
(22, 12, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(23, 12, 15, 7, 'UNIDAD', NULL, 1.0000, 360.00, 0.00, 0.00, 360.00),
(24, 13, 14, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(25, 13, 15, 7, 'UNIDAD', NULL, 1.0000, 360.00, 0.00, 0.00, 360.00),
(26, 14, 1, 1, 'UNIDAD', NULL, 1.0000, 135.00, 0.00, 0.00, 135.00),
(27, 14, 2, 2, 'UNIDAD', NULL, 1.0000, 110.00, 0.00, 0.00, 110.00),
(28, 15, 21, 6, 'UNIDAD', NULL, 1.0000, 280.00, 3.00, 8.40, 271.60),
(29, 15, 18, 15, 'UNIDAD', NULL, 1.0000, 215.00, 3.00, 6.45, 208.55),
(30, 16, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(31, 16, 20, 9, 'UNIDAD', NULL, 1.0000, 490.00, 0.00, 0.00, 490.00),
(32, 17, 21, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(33, 17, 15, 7, 'UNIDAD', NULL, 1.0000, 360.00, 0.00, 0.00, 360.00),
(34, 18, 22, 14, 'UNIDAD', NULL, 1.0000, 175.00, 0.00, 0.00, 175.00),
(35, 19, 23, 16, 'UNIDAD', NULL, 1.0000, 190.00, 0.00, 0.00, 190.00),
(36, 20, 18, 15, 'UNIDAD', NULL, 1.0000, 215.00, 0.00, 10.00, 205.00),
(37, 21, 20, 9, 'UNIDAD', NULL, 1.0000, 490.00, 0.00, 20.00, 470.00),
(38, 22, 20, 9, 'UNIDAD', NULL, 1.0000, 490.00, 0.00, 20.00, 470.00),
(39, 23, 25, 17, 'UNIDAD', NULL, 1.0000, 430.00, 0.00, 30.00, 400.00),
(40, 24, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(41, 24, 21, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(42, 24, 20, 9, 'UNIDAD', NULL, 1.0000, 490.00, 0.00, 0.00, 490.00),
(43, 24, 16, 13, 'UNIDAD', NULL, 1.0000, 310.00, 0.00, 0.00, 310.00),
(44, 25, 21, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(45, 26, 25, 17, 'UNIDAD', NULL, 1.0000, 430.00, 0.00, 0.00, 430.00),
(46, 27, 21, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(47, 28, 29, 18, 'UNIDAD', NULL, 1.0000, 200.00, 0.00, 0.00, 200.00),
(48, 29, 27, 17, 'UNIDAD', NULL, 1.0000, 430.00, 0.00, 0.00, 430.00),
(49, 30, 21, 6, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(50, 31, 13, 5, 'UNIDAD', NULL, 1.0000, 235.00, 0.00, 0.00, 235.00),
(51, 32, 20, 9, 'UNIDAD', NULL, 1.0000, 450.00, 0.00, 0.00, 450.00),
(52, 32, 16, 13, 'UNIDAD', NULL, 1.0000, 280.00, 0.00, 0.00, 280.00),
(53, 33, 31, 20, 'UNIDAD', 2, 1.0000, 1.00, 0.00, 0.00, 1.00),
(54, 34, 32, 21, 'UNIDAD', 1, 1.0000, 60.00, 0.00, 0.00, 60.00),
(55, 35, 32, 21, 'UNIDAD', 2, 1.0000, 40.00, 0.00, 0.00, 40.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `setup_completado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`id_empresa`, `nombre`, `nit`, `direccion`, `ciudad`, `telefono`, `correo`, `logo`, `activo`, `creado_en`, `setup_completado`) VALUES
(1, 'Agro', '1234567890', 'Av. Principal #123, Santa Cruz', NULL, '74819122', 'felipe@agropecuaria.bo', '/uploads/config-logo-1.png', 1, '2026-06-03 09:47:18', 1),
(2, 'Zepita', '78949', 'Shinahota', 'Cochabamba', NULL, 'zepita@agropecuaria.bo', '/uploads/config-logo-2.png', 1, '2026-06-15 10:25:25', 1),
(3, 'FelipeAgros', '969696969', 'Av Suecia', 'Cbba', '74819122', 'agrofelipe@gmail.com', '/uploads/config-logo-3.png', 1, '2026-06-15 22:29:50', 1),
(4, 'Agro nutri', NULL, 'Entre rios', 'Cochabamba', '74819122', 'pedro@gmail.com', '/uploads/config-logo-4.png', 1, '2026-06-16 12:25:16', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lote`
--

CREATE TABLE `lote` (
  `id_lote` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `numero_lote` varchar(60) DEFAULT NULL,
  `fecha_produccion` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `fecha_ingreso_almacen` date NOT NULL,
  `cantidad_cajas` int(11) NOT NULL DEFAULT 0,
  `unidades_por_caja` int(11) NOT NULL DEFAULT 1,
  `precio_por_caja` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock_cajas` int(11) NOT NULL DEFAULT 0,
  `stock_unidades` decimal(14,4) NOT NULL DEFAULT 0.0000,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lote`
--

INSERT INTO `lote` (`id_lote`, `id_producto`, `id_sucursal`, `numero_lote`, `fecha_produccion`, `fecha_vencimiento`, `fecha_ingreso_almacen`, `cantidad_cajas`, `unidades_por_caja`, `precio_por_caja`, `stock_cajas`, `stock_unidades`, `observaciones`, `activo`, `creado_en`) VALUES
(1, 1, 1, 'L-MAI-2601', '2025-10-01', '2027-09-30', '2026-01-10', 50, 1, 120.00, 89, 89.0000, NULL, 1, '2026-05-26 15:27:53'),
(2, 2, 1, 'L-SOY-2601', '2025-10-15', '2027-10-14', '2026-01-10', 30, 1, 95.00, 99, 99.0000, NULL, 1, '2026-05-26 15:27:53'),
(3, 5, 1, 'L-URE-2601', '2025-08-01', '2028-07-31', '2026-01-10', 40, 1, 210.00, 200, 200.0000, NULL, 1, '2026-05-26 15:27:53'),
(4, 6, 1, 'L-NPK-2601', '2025-09-01', '2028-08-31', '2026-01-10', 30, 1, 250.00, 40, 40.0000, NULL, 1, '2026-05-26 15:27:53'),
(5, 8, 1, 'L-RDP-2602', '2025-06-01', '2027-05-31', '2026-02-05', 20, 1, 180.00, 25, 25.0000, NULL, 1, '2026-05-26 15:27:53'),
(6, 9, 1, 'L-AMX-2602', '2025-07-01', '2027-06-30', '2026-02-05', 15, 1, 450.00, 80, 80.0000, NULL, 1, '2026-05-26 15:27:53'),
(7, 10, 1, 'L-DEC-2602', '2025-07-15', '2027-07-14', '2026-02-05', 10, 1, 280.00, 60, 60.0000, NULL, 1, '2026-05-26 15:27:53'),
(8, 11, 1, 'L-24D-2602', '2025-08-01', '2027-07-31', '2026-02-05', 25, 1, 90.00, 50, 50.0000, NULL, 1, '2026-05-26 15:27:53'),
(9, 12, 2, 'L-IVM-2603', '2025-11-01', '2027-10-31', '2026-03-15', 15, 1, 320.00, 20, 20.0000, NULL, 1, '2026-05-26 15:27:53'),
(10, 13, 2, 'L-VAC-2603', '2025-12-01', '2026-11-30', '2026-03-15', 20, 1, 280.00, 20, 20.0000, NULL, 1, '2026-05-26 15:27:53'),
(11, 14, 2, 'L-OXI-2603', '2025-11-15', '2027-11-14', '2026-03-15', 12, 1, 150.00, 59, 59.0000, NULL, 1, '2026-05-26 15:27:53'),
(12, 15, 2, 'L-BAL-2603', '2026-01-01', '2026-12-31', '2026-03-15', 30, 1, 195.00, 10, 30.0000, NULL, 1, '2026-05-26 15:27:53'),
(13, 5, 3, 'L-URE-2604', '2025-08-01', '2028-07-31', '2026-04-20', 35, 1, 210.00, 13, 13.0000, NULL, 1, '2026-05-26 15:27:53'),
(14, 6, 3, 'L-NPK-2604', '2025-09-01', '2028-08-31', '2026-04-20', 25, 1, 250.00, 68, 68.0000, NULL, 1, '2026-05-26 15:27:53'),
(15, 7, 3, 'L-SOP-2604', '2025-10-01', '2028-09-30', '2026-04-20', 20, 1, 320.00, 35, 35.0000, NULL, 1, '2026-05-26 15:27:53'),
(16, 13, 3, 'L-VAC-2603', NULL, '2026-11-30', '2026-05-26', 1, 1, 280.00, 16, 16.0000, NULL, 1, '2026-05-26 17:30:41'),
(17, 15, 3, 'L-BAL-2603', NULL, '2026-12-31', '2026-05-27', 20, 1, 195.00, 20, 0.0000, NULL, 1, '2026-05-27 08:55:07'),
(18, 15, 3, 'L-0903902', '2025-07-27', '2027-02-27', '2026-05-27', 20, 12, 2000.00, 19, 236.0000, NULL, 1, '2026-05-27 08:56:46'),
(19, 15, 3, 'L-1234', '2023-02-27', '2027-03-27', '2026-05-27', 2, 12, 200.00, 2, 24.0000, NULL, 1, '2026-05-27 08:58:53'),
(20, 9, 3, NULL, '2025-09-27', '2026-06-27', '2026-05-27', 2, 12, 1200.00, 1, 13.0000, NULL, 1, '2026-05-27 15:02:27'),
(21, 6, 3, NULL, '2025-11-27', '2026-08-27', '2026-05-27', 1, 12, 5000.00, 0, 6.0000, NULL, 1, '2026-05-27 18:27:47'),
(22, 14, 3, 'L-OXI-2603', NULL, '2027-11-14', '2026-05-27', 1, 1, 150.00, 0, 0.0000, NULL, 1, '2026-05-27 18:28:46'),
(23, 16, 3, 'L-0000', '2026-01-01', '2026-09-01', '2026-06-01', 1, 12, 1200.00, 0, 5.0000, NULL, 1, '2026-06-01 04:18:19'),
(24, 16, 2, 'L-0000', NULL, '2026-09-01', '2026-06-01', 0, 12, 1200.00, 0, 6.0000, NULL, 1, '2026-06-01 04:19:09'),
(25, 17, 3, 'LAG 001', '2025-05-02', '2027-07-02', '2026-06-16', 1, 4, 1200.00, 0, 2.0000, 'N', 1, '2026-06-16 12:05:03'),
(26, 9, 2, NULL, NULL, '2026-06-27', '2026-06-17', 0, 12, 1200.00, 0, 6.0000, NULL, 1, '2026-06-17 09:21:13'),
(27, 17, 3, 'L-2585', '2025-03-17', '2027-03-17', '2026-06-17', 1, 1, 1200.00, 0, 0.0000, NULL, 1, '2026-06-17 10:27:56'),
(28, 18, 7, NULL, '2026-01-18', '2026-07-18', '2026-06-18', 1, 16, 1200.00, 1, 8.0000, NULL, 1, '2026-06-18 09:21:05'),
(29, 18, 9, NULL, NULL, '2026-07-18', '2026-06-18', 0, 16, 1200.00, 0, 7.0000, NULL, 1, '2026-06-18 09:22:18'),
(30, 17, 3, NULL, '2025-12-17', '2026-10-17', '2026-06-18', 1, 4, 1200.00, 1, 4.0000, NULL, 1, '2026-06-18 10:46:27'),
(31, 20, 3, NULL, '2026-02-18', '2026-09-18', '2026-06-18', 1, 1, 1200.00, 0, 0.5000, NULL, 1, '2026-06-18 14:35:55'),
(32, 21, 3, NULL, '2026-07-18', '2026-07-18', '2026-06-18', 1, 1, 1200.00, 0, 0.2500, NULL, 1, '2026-06-18 15:11:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--

CREATE TABLE `marca` (
  `id_marca` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `pais_origen` varchar(60) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `marca`
--

INSERT INTO `marca` (`id_marca`, `id_empresa`, `nombre`, `pais_origen`, `descripcion`, `activo`) VALUES
(1, 1, 'Bayer CropScience', 'Alemania', 'Semillas y protección de cultivos', 1),
(2, 1, 'Yara', 'Noruega', 'Fertilizantes y nutrición de cultivos', 1),
(3, 1, 'Syngenta', 'Suiza', 'Agroquímicos y semillas protegidas', 1),
(4, 1, 'Zoetis', 'Estados Unidos', 'Salud animal, vacunas y antiparasitarios', 1),
(5, 1, 'SeedCo', 'Zimbabue', 'Semillas híbridas para trópico y subtrópico', 1),
(6, 1, 'BASF', 'Alemania', 'Agroquímicos y soluciones agrícolas', 1),
(7, 1, 'Ciproquim', 'Bolivia', 'Productos agropecuarios de fabricación nacional', 1),
(8, 1, 'Disagro', 'Guatemala', 'Fertilizantes especializados para Latinoamérica', 1),
(9, 2, 'A', 'Bolivia', NULL, 0),
(10, 1, 'AgroNutri', 'Bolivia', NULL, 1),
(11, 4, 'MARCA 2', 'Bolivia', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento`
--

CREATE TABLE `movimiento` (
  `id_movimiento` int(11) NOT NULL,
  `tipo` enum('INGRESO','EGRESO') NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL,
  `id_sucursal` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento`
--

INSERT INTO `movimiento` (`id_movimiento`, `tipo`, `id_categoria`, `descripcion`, `monto`, `fecha`, `id_sucursal`, `id_usuario`, `observaciones`, `created_at`) VALUES
(1, 'EGRESO', 3, 'Pago Alquiler Junio', 200.00, '2026-06-03', 3, 1, NULL, '2026-06-03 08:01:11'),
(2, 'INGRESO', 7, 'ojito', 2000.00, '2026-06-03', 3, 1, NULL, '2026-06-03 08:01:39'),
(3, 'EGRESO', 3, 'alquiler', 3600.00, '2026-06-16', 3, 1, NULL, '2026-06-16 12:33:25'),
(4, 'EGRESO', 9, 'tecnicso', 1000.00, '2026-06-16', 3, 1, NULL, '2026-06-16 12:34:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_almacen`
--

CREATE TABLE `movimiento_almacen` (
  `id_movimiento` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo` enum('ENTRADA','SALIDA','AJUSTE','TRASLADO') NOT NULL,
  `motivo` varchar(100) NOT NULL,
  `cantidad_cajas` int(11) NOT NULL DEFAULT 0,
  `cantidad_unidades` decimal(14,4) NOT NULL DEFAULT 0.0000,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `referencia_id` int(11) DEFAULT NULL,
  `referencia_tipo` varchar(30) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `movimiento_almacen`
--

INSERT INTO `movimiento_almacen` (`id_movimiento`, `id_lote`, `id_sucursal`, `id_usuario`, `tipo`, `motivo`, `cantidad_cajas`, `cantidad_unidades`, `fecha_movimiento`, `referencia_id`, `referencia_tipo`, `observaciones`) VALUES
(1, 1, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0001-2026', 50, 0.0000, '2026-01-10 09:00:00', 1, 'COMPRA', NULL),
(2, 2, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0001-2026', 30, 0.0000, '2026-01-10 09:00:00', 1, 'COMPRA', NULL),
(3, 3, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0001-2026', 40, 0.0000, '2026-01-10 09:00:00', 1, 'COMPRA', NULL),
(4, 4, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0001-2026', 30, 0.0000, '2026-01-10 09:00:00', 1, 'COMPRA', NULL),
(5, 5, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0002-2026', 20, 0.0000, '2026-02-05 10:00:00', 2, 'COMPRA', NULL),
(6, 6, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0002-2026', 15, 0.0000, '2026-02-05 10:00:00', 2, 'COMPRA', NULL),
(7, 7, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0002-2026', 10, 0.0000, '2026-02-05 10:00:00', 2, 'COMPRA', NULL),
(8, 8, 1, 6, 'ENTRADA', 'Compra FACT-AGR-0002-2026', 25, 0.0000, '2026-02-05 10:00:00', 2, 'COMPRA', NULL),
(9, 9, 2, 7, 'ENTRADA', 'Compra FACT-AGR-0003-2026', 15, 0.0000, '2026-03-15 08:30:00', 3, 'COMPRA', NULL),
(10, 10, 2, 7, 'ENTRADA', 'Compra FACT-AGR-0003-2026', 20, 0.0000, '2026-03-15 08:30:00', 3, 'COMPRA', NULL),
(11, 11, 2, 7, 'ENTRADA', 'Compra FACT-AGR-0003-2026', 12, 0.0000, '2026-03-15 08:30:00', 3, 'COMPRA', NULL),
(12, 12, 2, 7, 'ENTRADA', 'Compra FACT-AGR-0003-2026', 30, 0.0000, '2026-03-15 08:30:00', 3, 'COMPRA', NULL),
(13, 13, 3, 8, 'ENTRADA', 'Compra FACT-AGR-0004-2026', 35, 0.0000, '2026-04-20 09:00:00', 4, 'COMPRA', NULL),
(14, 14, 3, 8, 'ENTRADA', 'Compra FACT-AGR-0004-2026', 25, 0.0000, '2026-04-20 09:00:00', 4, 'COMPRA', NULL),
(15, 15, 3, 8, 'ENTRADA', 'Compra FACT-AGR-0004-2026', 20, 0.0000, '2026-04-20 09:00:00', 4, 'COMPRA', NULL),
(16, 3, 1, 2, 'SALIDA', 'Venta VTA-0001-2026', 10, 0.0000, '2026-05-20 09:30:00', 1, 'VENTA', NULL),
(17, 4, 1, 2, 'SALIDA', 'Venta VTA-0001-2026', 7, 0.0000, '2026-05-20 09:30:00', 1, 'VENTA', NULL),
(18, 1, 1, 2, 'SALIDA', 'Venta VTA-0002-2026', 3, 0.0000, '2026-05-20 11:00:00', 2, 'VENTA', NULL),
(19, 5, 1, 3, 'SALIDA', 'Venta VTA-0003-2026', 1, 0.0000, '2026-05-26 09:15:00', 3, 'VENTA', NULL),
(20, 8, 1, 3, 'SALIDA', 'Venta VTA-0003-2026', 1, 0.0000, '2026-05-26 09:15:00', 3, 'VENTA', NULL),
(21, 3, 1, 3, 'SALIDA', 'Venta VTA-0004-2026', 8, 0.0000, '2026-05-26 10:00:00', 4, 'VENTA', NULL),
(22, 4, 1, 3, 'SALIDA', 'Venta VTA-0004-2026', 8, 0.0000, '2026-05-26 10:00:00', 4, 'VENTA', NULL),
(23, 6, 1, 3, 'SALIDA', 'Venta VTA-0004-2026', 2, 0.0000, '2026-05-26 10:00:00', 4, 'VENTA', NULL),
(24, 5, 1, 3, 'SALIDA', 'Venta VTA-0005-2026', 1, 0.0000, '2026-05-26 11:30:00', 5, 'VENTA', NULL),
(25, 9, 2, 4, 'SALIDA', 'Venta VTA-0006-2026', 10, 0.0000, '2026-05-26 09:00:00', 6, 'VENTA', NULL),
(26, 10, 2, 4, 'SALIDA', 'Venta VTA-0006-2026', 6, 0.0000, '2026-05-26 09:00:00', 6, 'VENTA', NULL),
(27, 8, 1, 6, 'TRASLADO', 'Salida traslado a Sucursal Norte', 5, 0.0000, '2026-05-15 14:00:00', 1, 'TRASLADO', NULL),
(28, 10, 2, 1, 'AJUSTE', 'Conteo fisico', 20, 20.0000, '2026-05-26 17:29:05', NULL, 'MANUAL', NULL),
(29, 10, 2, 1, 'TRASLADO', 'Salida por traslado confirmado', 1, 20.0000, '2026-05-26 17:30:41', 3, 'TRASLADO', NULL),
(30, 16, 3, 1, 'ENTRADA', 'Entrada por traslado confirmado', 1, 20.0000, '2026-05-26 17:30:41', 3, 'TRASLADO', NULL),
(31, 10, 2, 1, 'AJUSTE', 'Conteo fisico', 20, 20.0000, '2026-05-27 08:24:37', NULL, 'MANUAL', NULL),
(32, 12, 2, 1, 'AJUSTE', 'Conteo fisico', 30, 30.0000, '2026-05-27 08:24:56', NULL, 'MANUAL', NULL),
(33, 5, 1, 1, 'AJUSTE', 'Conteo fisico', 25, 25.0000, '2026-05-27 08:25:20', NULL, 'MANUAL', NULL),
(34, 6, 1, 1, 'AJUSTE', 'Conteo fisico', 80, 80.0000, '2026-05-27 08:25:41', NULL, 'MANUAL', NULL),
(35, 7, 1, 1, 'AJUSTE', 'Conteo fisico', 60, 60.0000, '2026-05-27 08:26:00', NULL, 'MANUAL', NULL),
(36, 8, 1, 1, 'AJUSTE', 'Conteo fisico', 50, 50.0000, '2026-05-27 08:26:15', NULL, 'MANUAL', NULL),
(37, 1, 1, 1, 'AJUSTE', 'Conteo fisico', 90, 90.0000, '2026-05-27 08:26:31', NULL, 'MANUAL', NULL),
(38, 2, 1, 1, 'AJUSTE', 'Conteo fisico', 100, 100.0000, '2026-05-27 08:26:46', NULL, 'MANUAL', NULL),
(39, 9, 2, 1, 'AJUSTE', 'Conteo fisico', 20, 20.0000, '2026-05-27 08:27:03', NULL, 'MANUAL', NULL),
(40, 11, 2, 1, 'AJUSTE', 'Conteo fisico', 60, 60.0000, '2026-05-27 08:27:22', NULL, 'MANUAL', NULL),
(41, 13, 3, 1, 'AJUSTE', 'Conteo fisico', 20, 20.0000, '2026-05-27 08:27:34', NULL, 'MANUAL', NULL),
(42, 3, 1, 1, 'AJUSTE', 'Conteo fisico', 200, 200.0000, '2026-05-27 08:27:48', NULL, 'MANUAL', NULL),
(43, 14, 3, 1, 'AJUSTE', 'Conteo fisico', 70, 70.0000, '2026-05-27 08:28:01', NULL, 'MANUAL', NULL),
(44, 4, 1, 1, 'AJUSTE', 'Conteo fisico', 40, 40.0000, '2026-05-27 08:28:13', NULL, 'MANUAL', NULL),
(45, 15, 3, 1, 'AJUSTE', 'Conteo fisico', 40, 40.0000, '2026-05-27 08:31:22', NULL, 'MANUAL', NULL),
(46, 12, 2, 1, 'TRASLADO', 'Salida por traslado confirmado', 20, 0.0000, '2026-05-27 08:55:07', 4, 'TRASLADO', NULL),
(47, 17, 3, 1, 'ENTRADA', 'Entrada por traslado confirmado', 20, 0.0000, '2026-05-27 08:55:07', 4, 'TRASLADO', NULL),
(48, 18, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 20, 240.0000, '2026-05-27 08:56:46', 5, 'COMPRA', NULL),
(49, 19, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 2, 24.0000, '2026-05-27 08:58:53', 6, 'COMPRA', NULL),
(50, 18, 3, 1, 'SALIDA', 'VENTA', 0, 2.0000, '2026-05-27 09:00:39', 7, 'VENTA', NULL),
(51, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 09:01:37', 8, 'VENTA', NULL),
(52, 16, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 09:01:37', 8, 'VENTA', NULL),
(53, 14, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 09:03:50', 9, 'VENTA', NULL),
(54, 18, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-05-27 09:03:50', 9, 'VENTA', NULL),
(55, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 09:04:26', 10, 'VENTA', NULL),
(56, 15, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 09:04:26', 10, 'VENTA', NULL),
(57, 16, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 09:04:26', 10, 'VENTA', NULL),
(58, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 10:16:32', 11, 'VENTA', NULL),
(59, 15, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 10:16:32', 11, 'VENTA', NULL),
(60, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 11:20:30', 12, 'VENTA', NULL),
(61, 15, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 11:20:30', 12, 'VENTA', NULL),
(62, 14, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 14:35:51', 13, 'VENTA', NULL),
(63, 15, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 14:35:51', 13, 'VENTA', NULL),
(64, 1, 1, 5, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 14:53:07', 14, 'VENTA', NULL),
(65, 2, 1, 5, 'SALIDA', 'VENTA', 1, 1.0000, '2026-05-27 14:53:07', 14, 'VENTA', NULL),
(66, 20, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 2, 24.0000, '2026-05-27 15:02:27', 7, 'COMPRA', NULL),
(67, 21, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 1, 12.0000, '2026-05-27 18:27:47', 8, 'COMPRA', NULL),
(68, 11, 2, 1, 'TRASLADO', 'Salida por traslado confirmado', 1, 1.0000, '2026-05-27 18:28:46', 5, 'TRASLADO', NULL),
(69, 22, 3, 1, 'ENTRADA', 'Entrada por traslado confirmado', 1, 1.0000, '2026-05-27 18:28:46', 5, 'TRASLADO', NULL),
(70, 21, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-01 04:10:59', 15, 'VENTA', NULL),
(71, 18, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-01 04:10:59', 15, 'VENTA', NULL),
(72, 23, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 1, 12.0000, '2026-06-01 04:18:19', 9, 'COMPRA', NULL),
(73, 23, 3, 1, 'TRASLADO', 'Salida por traslado confirmado', 0, 6.0000, '2026-06-01 04:19:09', 6, 'TRASLADO', NULL),
(74, 24, 2, 1, 'ENTRADA', 'Entrada por traslado confirmado', 0, 6.0000, '2026-06-01 04:19:09', 6, 'TRASLADO', NULL),
(75, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-04 18:32:05', 16, 'VENTA', NULL),
(76, 20, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-04 18:32:05', 16, 'VENTA', NULL),
(77, 21, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-04 18:32:58', 17, 'VENTA', NULL),
(78, 15, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-04 18:32:58', 17, 'VENTA', NULL),
(79, 22, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-04 19:10:46', 18, 'VENTA', NULL),
(80, 23, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-04 19:25:57', 19, 'VENTA', NULL),
(81, 18, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-15 10:45:03', 20, 'VENTA', NULL),
(82, 18, 3, 1, 'ENTRADA', 'ANULACION DE VENTA', 0, 1.0000, '2026-06-15 22:57:54', 20, 'ANULACION', NULL),
(83, 20, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-15 23:05:26', 21, 'VENTA', NULL),
(84, 20, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-15 23:05:55', 22, 'VENTA', NULL),
(85, 25, 3, 1, 'ENTRADA', 'Ingreso manual de lote', 1, 4.0000, '2026-06-16 12:05:03', NULL, 'MANUAL', NULL),
(86, 25, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-16 12:20:12', 23, 'VENTA', NULL),
(87, 20, 3, 1, 'TRASLADO', 'Salida por traslado confirmado', 0, 6.0000, '2026-06-17 09:21:13', 7, 'TRASLADO', NULL),
(88, 26, 2, 1, 'ENTRADA', 'Entrada por traslado confirmado', 0, 6.0000, '2026-06-17 09:21:13', 7, 'TRASLADO', NULL),
(89, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-17 09:59:19', 24, 'VENTA', NULL),
(90, 21, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-17 09:59:19', 24, 'VENTA', NULL),
(91, 20, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-17 09:59:19', 24, 'VENTA', NULL),
(92, 16, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-17 09:59:19', 24, 'VENTA', NULL),
(93, 21, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-17 10:07:07', 25, 'VENTA', NULL),
(94, 25, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-17 10:25:58', 26, 'VENTA', NULL),
(95, 27, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 1, 1.0000, '2026-06-17 10:27:56', 10, 'COMPRA', NULL),
(96, 21, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-17 12:08:59', 27, 'VENTA', NULL),
(97, 28, 7, 11, 'ENTRADA', 'Ingreso manual de lote', 1, 16.0000, '2026-06-18 09:21:05', NULL, 'MANUAL', NULL),
(98, 28, 7, 15, 'TRASLADO', 'Salida por traslado confirmado', 0, 8.0000, '2026-06-18 09:22:18', 8, 'TRASLADO', NULL),
(99, 29, 9, 15, 'ENTRADA', 'Entrada por traslado confirmado', 0, 8.0000, '2026-06-18 09:22:18', 8, 'TRASLADO', NULL),
(100, 29, 9, 15, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-18 09:22:57', 28, 'VENTA', NULL),
(101, 27, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-18 10:31:58', 29, 'VENTA', NULL),
(102, 21, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-18 10:32:11', 30, 'VENTA', NULL),
(103, 30, 3, 1, 'ENTRADA', 'INGRESO POR COMPRA', 1, 4.0000, '2026-06-18 10:46:27', 11, 'COMPRA', NULL),
(104, 13, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-18 13:20:25', 31, 'VENTA', NULL),
(105, 20, 3, 1, 'SALIDA', 'VENTA', 0, 1.0000, '2026-06-18 13:21:17', 32, 'VENTA', NULL),
(106, 16, 3, 1, 'SALIDA', 'VENTA', 1, 1.0000, '2026-06-18 13:21:17', 32, 'VENTA', NULL),
(107, 31, 3, 1, 'ENTRADA', 'Ingreso manual de lote', 1, 1.0000, '2026-06-18 14:35:55', NULL, 'MANUAL', NULL),
(108, 31, 3, 1, 'SALIDA', 'VENTA', 0, 0.5000, '2026-06-18 14:54:56', 33, 'VENTA', NULL),
(109, 32, 3, 1, 'ENTRADA', 'Ingreso manual de lote', 1, 1.0000, '2026-06-18 15:11:46', NULL, 'MANUAL', NULL),
(110, 32, 3, 1, 'SALIDA', 'VENTA', 0, 0.2500, '2026-06-18 15:13:08', 34, 'VENTA', NULL),
(111, 32, 3, 1, 'SALIDA', 'VENTA', 0, 0.5000, '2026-06-18 15:14:39', 35, 'VENTA', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_compra`
--

CREATE TABLE `pago_compra` (
  `id_pago_compra` int(11) NOT NULL,
  `id_compra` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','QR','QR_ESTATICO','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  `observaciones` text DEFAULT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pago_compra`
--

INSERT INTO `pago_compra` (`id_pago_compra`, `id_compra`, `id_usuario`, `monto`, `metodo_pago`, `observaciones`, `fecha_pago`) VALUES
(1, 10, 1, 200.00, 'EFECTIVO', NULL, '2026-06-17 09:57:43'),
(2, 10, 1, 800.00, 'EFECTIVO', NULL, '2026-06-17 09:58:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_suscripcion`
--

CREATE TABLE `pago_suscripcion` (
  `id_pago` int(11) NOT NULL,
  `id_suscripcion` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `estado` enum('PENDIENTE','PAGADO','FALLIDO') NOT NULL DEFAULT 'PENDIENTE',
  `fecha_pago` datetime DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_venta`
--

CREATE TABLE `pago_venta` (
  `id_pago_venta` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','QR','QR_ESTATICO','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  `observaciones` text DEFAULT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pago_venta`
--

INSERT INTO `pago_venta` (`id_pago_venta`, `id_venta`, `id_usuario`, `monto`, `metodo_pago`, `observaciones`, `fecha_pago`) VALUES
(1, 24, 1, 165.00, 'EFECTIVO', NULL, '2026-06-17 10:00:09'),
(2, 24, 1, 500.00, 'EFECTIVO', NULL, '2026-06-17 10:00:28'),
(3, 24, 1, 500.00, 'QR', NULL, '2026-06-17 10:00:57'),
(4, 25, 1, 80.00, 'EFECTIVO', NULL, '2026-06-17 10:16:32'),
(5, 25, 1, 200.00, 'EFECTIVO', NULL, '2026-06-17 10:17:42'),
(6, 26, 1, 30.00, 'EFECTIVO', NULL, '2026-06-17 10:26:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permiso`
--

CREATE TABLE `permiso` (
  `id_permiso` int(11) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `nombre_clave` varchar(80) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `permiso`
--

INSERT INTO `permiso` (`id_permiso`, `modulo`, `accion`, `nombre_clave`, `descripcion`) VALUES
(1, 'roles', 'ver', 'roles.ver', 'Ver listado de roles del sistema'),
(2, 'roles', 'crear', 'roles.crear', 'Crear nuevos roles'),
(3, 'roles', 'editar', 'roles.editar', 'Editar nombre de un rol'),
(4, 'roles', 'eliminar', 'roles.eliminar', 'Eliminar roles del sistema'),
(5, 'roles', 'gestionar_permisos', 'roles.gestionar_permisos', 'Asignar y quitar permisos a un rol'),
(6, 'usuarios', 'ver', 'usuarios.ver', 'Ver listado de usuarios del sistema'),
(7, 'usuarios', 'ver_detalle', 'usuarios.ver_detalle', 'Ver ficha completa de un usuario'),
(8, 'usuarios', 'crear', 'usuarios.crear', 'Crear nuevos usuarios'),
(9, 'usuarios', 'editar', 'usuarios.editar', 'Editar datos de un usuario'),
(10, 'usuarios', 'eliminar', 'usuarios.eliminar', 'Eliminar usuarios del sistema'),
(11, 'usuarios', 'activar', 'usuarios.activar', 'Activar o desactivar un usuario'),
(12, 'usuarios', 'cambiar_rol', 'usuarios.cambiar_rol', 'Cambiar el rol asignado a un usuario'),
(13, 'usuarios', 'cambiar_sucursal', 'usuarios.cambiar_sucursal', 'Reasignar usuario a otra sucursal'),
(14, 'usuarios', 'resetear_clave', 'usuarios.resetear_clave', 'Restablecer contraseña de un usuario'),
(15, 'sucursales', 'ver', 'sucursales.ver', 'Ver listado de sucursales'),
(16, 'sucursales', 'ver_detalle', 'sucursales.ver_detalle', 'Ver ficha completa de una sucursal'),
(17, 'sucursales', 'crear', 'sucursales.crear', 'Registrar nuevas sucursales'),
(18, 'sucursales', 'editar', 'sucursales.editar', 'Editar datos de una sucursal'),
(19, 'sucursales', 'eliminar', 'sucursales.eliminar', 'Eliminar sucursales del sistema'),
(20, 'sucursales', 'activar', 'sucursales.activar', 'Activar o desactivar una sucursal'),
(21, 'clasificaciones', 'ver', 'clasificaciones.ver', 'Ver listado de clasificaciones'),
(22, 'clasificaciones', 'crear', 'clasificaciones.crear', 'Crear clasificaciones de producto'),
(23, 'clasificaciones', 'editar', 'clasificaciones.editar', 'Editar una clasificación'),
(24, 'clasificaciones', 'eliminar', 'clasificaciones.eliminar', 'Eliminar una clasificación'),
(25, 'marcas', 'ver', 'marcas.ver', 'Ver listado de marcas'),
(26, 'marcas', 'crear', 'marcas.crear', 'Registrar nuevas marcas'),
(27, 'marcas', 'editar', 'marcas.editar', 'Editar datos de una marca'),
(28, 'marcas', 'eliminar', 'marcas.eliminar', 'Eliminar marcas del sistema'),
(29, 'unidades', 'ver', 'unidades.ver', 'Ver listado de unidades de medida'),
(30, 'unidades', 'crear', 'unidades.crear', 'Crear unidades de medida'),
(31, 'unidades', 'editar', 'unidades.editar', 'Editar una unidad de medida'),
(32, 'unidades', 'eliminar', 'unidades.eliminar', 'Eliminar unidades de medida'),
(33, 'productos', 'ver', 'productos.ver', 'Ver catálogo de productos'),
(34, 'productos', 'ver_detalle', 'productos.ver_detalle', 'Ver ficha completa de un producto'),
(35, 'productos', 'crear', 'productos.crear', 'Agregar productos al catálogo'),
(36, 'productos', 'editar', 'productos.editar', 'Editar datos generales del producto'),
(37, 'productos', 'eliminar', 'productos.eliminar', 'Eliminar productos del catálogo'),
(38, 'productos', 'activar', 'productos.activar', 'Activar o desactivar un producto'),
(39, 'productos', 'ver_costo', 'productos.ver_costo', 'Ver precio de costo (precio_por_caja del lote)'),
(40, 'productos', 'ver_precios', 'productos.ver_precios', 'Ver precios de venta mayor y menor'),
(41, 'productos', 'editar_precios', 'productos.editar_precios', 'Modificar precios de venta mayor y menor'),
(42, 'productos', 'editar_descuentos', 'productos.editar_descuentos', 'Modificar porcentajes de descuento'),
(43, 'productos', 'ver_stock', 'productos.ver_stock', 'Ver stock disponible de productos'),
(44, 'productos', 'gestionar_imagen', 'productos.gestionar_imagen', 'Subir o eliminar imagen del producto'),
(45, 'almacen', 'ver', 'almacen.ver', 'Ver inventario general del almacén'),
(46, 'almacen', 'ver_lotes', 'almacen.ver_lotes', 'Ver listado detallado de lotes'),
(47, 'almacen', 'ver_lote_detalle', 'almacen.ver_lote_detalle', 'Ver ficha completa de un lote'),
(48, 'almacen', 'ver_costo_lote', 'almacen.ver_costo_lote', 'Ver precio de costo de cada lote'),
(49, 'almacen', 'ingresar', 'almacen.ingresar', 'Registrar entradas de productos al almacén'),
(50, 'almacen', 'ajustar', 'almacen.ajustar', 'Registrar ajustes de inventario'),
(51, 'almacen', 'trasladar', 'almacen.trasladar', 'Trasladar stock entre sucursales'),
(52, 'almacen', 'ver_movimientos', 'almacen.ver_movimientos', 'Ver historial de movimientos (kardex)'),
(53, 'almacen', 'ver_vencimientos', 'almacen.ver_vencimientos', 'Ver productos próximos a vencer'),
(54, 'almacen', 'dar_baja_lote', 'almacen.dar_baja_lote', 'Dar de baja un lote (vencido o dañado)'),
(55, 'proveedores', 'ver', 'proveedores.ver', 'Ver listado de proveedores'),
(56, 'proveedores', 'ver_detalle', 'proveedores.ver_detalle', 'Ver ficha completa de un proveedor'),
(57, 'proveedores', 'crear', 'proveedores.crear', 'Registrar nuevos proveedores'),
(58, 'proveedores', 'editar', 'proveedores.editar', 'Editar datos de un proveedor'),
(59, 'proveedores', 'eliminar', 'proveedores.eliminar', 'Eliminar proveedores del sistema'),
(60, 'proveedores', 'activar', 'proveedores.activar', 'Activar o desactivar un proveedor'),
(61, 'compras', 'ver', 'compras.ver', 'Ver historial de compras'),
(62, 'compras', 'ver_detalle', 'compras.ver_detalle', 'Ver detalle completo de una compra'),
(63, 'compras', 'ver_costo', 'compras.ver_costo', 'Ver precios de costo en las compras'),
(64, 'compras', 'crear', 'compras.crear', 'Registrar nuevas compras'),
(65, 'compras', 'editar', 'compras.editar', 'Editar compras en estado PENDIENTE'),
(66, 'compras', 'confirmar', 'compras.confirmar', 'Confirmar y cerrar una compra'),
(67, 'compras', 'anular', 'compras.anular', 'Anular una compra registrada'),
(68, 'compras', 'ver_todas_sucursales', 'compras.ver_todas_sucursales', 'Ver compras de todas las sucursales'),
(69, 'clientes', 'ver', 'clientes.ver', 'Ver listado de clientes'),
(70, 'clientes', 'ver_detalle', 'clientes.ver_detalle', 'Ver ficha completa de un cliente'),
(71, 'clientes', 'crear', 'clientes.crear', 'Registrar nuevos clientes'),
(72, 'clientes', 'editar', 'clientes.editar', 'Editar datos de un cliente'),
(73, 'clientes', 'eliminar', 'clientes.eliminar', 'Eliminar clientes del sistema'),
(74, 'clientes', 'activar', 'clientes.activar', 'Activar o desactivar un cliente'),
(75, 'clientes', 'ver_historial', 'clientes.ver_historial', 'Ver historial de compras de un cliente'),
(76, 'clientes', 'cambiar_tipo', 'clientes.cambiar_tipo', 'Cambiar tipo de cliente: minorista / mayorista'),
(77, 'ventas', 'ver', 'ventas.ver', 'Ver historial de ventas propias'),
(78, 'ventas', 'ver_detalle', 'ventas.ver_detalle', 'Ver detalle completo de una venta'),
(79, 'ventas', 'ver_todas', 'ventas.ver_todas', 'Ver ventas de todos los vendedores'),
(80, 'ventas', 'ver_todas_sucursales', 'ventas.ver_todas_sucursales', 'Ver ventas de todas las sucursales'),
(81, 'ventas', 'crear', 'ventas.crear', 'Registrar nuevas ventas'),
(82, 'ventas', 'anular', 'ventas.anular', 'Anular una venta realizada'),
(83, 'ventas', 'aplicar_descuento', 'ventas.aplicar_descuento', 'Aplicar descuento adicional en una venta'),
(84, 'ventas', 'descuento_libre', 'ventas.descuento_libre', 'Ingresar descuento libre (sin límite de porcentaje)'),
(85, 'ventas', 'vender_sin_stock', 'ventas.vender_sin_stock', 'Registrar venta aunque el stock sea 0'),
(86, 'ventas', 'ver_costo', 'ventas.ver_costo', 'Ver el costo y la utilidad de cada venta'),
(87, 'ventas', 'cambiar_precio', 'ventas.cambiar_precio', 'Modificar el precio en el momento de la venta'),
(88, 'ventas', 'reimprimir', 'ventas.reimprimir', 'Reimprimir comprobante de una venta'),
(89, 'traslados', 'ver', 'traslados.ver', 'Ver listado de traslados entre sucursales'),
(90, 'traslados', 'crear', 'traslados.crear', 'Crear un traslado de stock'),
(91, 'traslados', 'confirmar', 'traslados.confirmar', 'Confirmar un traslado pendiente'),
(92, 'traslados', 'cancelar', 'traslados.cancelar', 'Cancelar un traslado pendiente'),
(93, 'caja', 'ver', 'caja.ver', 'Ver listado de cajas registradas'),
(94, 'caja', 'crear', 'caja.crear', 'Registrar nuevas cajas'),
(95, 'caja', 'editar', 'caja.editar', 'Editar datos de una caja'),
(96, 'caja', 'activar', 'caja.activar', 'Activar o desactivar una caja'),
(97, 'caja', 'abrir', 'caja.abrir', 'Abrir turno de caja con monto inicial'),
(98, 'caja', 'cerrar', 'caja.cerrar', 'Cerrar turno de caja y registrar monto final'),
(99, 'caja', 'ver_movimientos', 'caja.ver_movimientos', 'Ver movimientos de efectivo de una caja'),
(100, 'caja', 'ver_todas', 'caja.ver_todas', 'Ver cajas de todas las sucursales'),
(101, 'caja', 'ver_historial', 'caja.ver_historial', 'Ver historial de aperturas y cierres de caja'),
(102, 'reportes', 'ventas_diarias', 'reportes.ventas_diarias', 'Ver reporte de ventas del día'),
(103, 'reportes', 'ventas_rango', 'reportes.ventas_rango', 'Ver reporte de ventas por rango de fechas'),
(104, 'reportes', 'ventas_vendedor', 'reportes.ventas_vendedor', 'Ver reporte de ventas por vendedor'),
(105, 'reportes', 'ventas_producto', 'reportes.ventas_producto', 'Ver reporte de ventas por producto'),
(106, 'reportes', 'ventas_cliente', 'reportes.ventas_cliente', 'Ver reporte de ventas por cliente'),
(107, 'reportes', 'compras', 'reportes.compras', 'Ver reporte de compras realizadas'),
(108, 'reportes', 'compras_proveedor', 'reportes.compras_proveedor', 'Ver reporte de compras por proveedor'),
(109, 'reportes', 'inventario', 'reportes.inventario', 'Ver reporte de inventario actual'),
(110, 'reportes', 'inventario_valorizado', 'reportes.inventario_valorizado', 'Ver inventario con valor de costo total'),
(111, 'reportes', 'ganancias', 'reportes.ganancias', 'Ver reporte de ganancias y utilidad bruta'),
(112, 'reportes', 'ganancias_producto', 'reportes.ganancias_producto', 'Ver utilidad desglosada por producto'),
(113, 'reportes', 'top_productos', 'reportes.top_productos', 'Ver ranking de productos más vendidos'),
(114, 'reportes', 'vencimientos', 'reportes.vencimientos', 'Ver reporte de productos próximos a vencer'),
(115, 'reportes', 'stock_bajo', 'reportes.stock_bajo', 'Ver productos por debajo del stock mínimo'),
(116, 'reportes', 'kardex', 'reportes.kardex', 'Ver kardex (historial de movimientos por lote)'),
(117, 'reportes', 'traslados', 'reportes.traslados', 'Ver reporte de traslados entre sucursales'),
(118, 'reportes', 'comparativo_sucursales', 'reportes.comparativo_sucursales', 'Comparar ventas y ganancias entre sucursales'),
(119, 'reportes', 'caja', 'reportes.caja', 'Ver reporte de arqueos y movimientos de caja'),
(120, 'configuracion', 'ver', 'configuracion.ver', 'Ver configuración general del sistema'),
(121, 'configuracion', 'editar', 'configuracion.editar', 'Editar configuración general del sistema'),
(122, 'movimientos', '', 'movimientos.ver', 'Ver libro de caja y movimientos'),
(123, 'movimientos', '', 'movimientos.crear', 'Registrar gasto/ingreso manual'),
(124, 'movimientos', '', 'movimientos.editar', 'Editar un movimiento manual'),
(125, 'movimientos', '', 'movimientos.eliminar', 'Eliminar un movimiento manual'),
(126, 'movimientos', '', 'movimientos.ver_todas', 'Ver movimientos de todas las sucursales'),
(127, 'categorias_movimiento', '', 'categorias_movimiento.ver', 'Ver categorías de movimientos'),
(128, 'categorias_movimiento', '', 'categorias_movimiento.gestionar', 'Crear/editar/eliminar categorías'),
(129, 'creditos', 'ver', 'creditos.ver', 'Ver cuentas por cobrar y por pagar'),
(130, 'creditos', 'abonar', 'creditos.abonar', 'Registrar abonos a créditos'),
(131, 'reportes', 'creditos', 'reportes.creditos', 'Ver reporte de créditos (cuentas por cobrar y por pagar)'),
(132, 'conversiones', 'ver', 'conversiones.ver', 'Ver listado de conversiones de unidad'),
(133, 'conversiones', 'crear', 'conversiones.crear', 'Crear nuevas conversiones de unidad'),
(134, 'conversiones', 'editar', 'conversiones.editar', 'Editar conversiones de unidad existentes'),
(135, 'conversiones', 'eliminar', 'conversiones.eliminar', 'Eliminar conversiones de unidad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan`
--

CREATE TABLE `plan` (
  `id_plan` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `precio_mensual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_anual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_sucursales` int(11) NOT NULL DEFAULT 1,
  `max_usuarios` int(11) NOT NULL DEFAULT 3,
  `max_productos` int(11) DEFAULT NULL,
  `modulos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`modulos`)),
  `dias_prueba` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `plan`
--

INSERT INTO `plan` (`id_plan`, `nombre`, `precio_mensual`, `precio_anual`, `max_sucursales`, `max_usuarios`, `max_productos`, `modulos`, `dias_prueba`, `activo`) VALUES
(1, 'PRUEBA', 0.00, 0.00, 1, 2, 30, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"qr\",\"reportes_basicos\",\"roles\"]', 7, 1),
(2, 'BASICO', 120.00, 1200.00, 1, 3, 50, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"roles\",\"proveedores\",\"compras\"]', 0, 1),
(3, 'ESTANDAR', 250.00, 2500.00, 3, 8, 0, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"compras\",\"proveedores\",\"traslados\",\"libro_caja\",\"reportes_avanzados\",\"roles\"]', 0, 1),
(4, 'PREMIUM', 400.00, 4000.00, 1, 1, 0, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"compras\",\"proveedores\",\"traslados\",\"libro_caja\",\"reportes_avanzados\",\"roles\",\"soporte_prioritario\",\"qr\"]', 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_clasificacion` int(11) NOT NULL,
  `id_marca` int(11) NOT NULL,
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `precio_mayor` decimal(12,2) NOT NULL DEFAULT 0.00,
  `precio_menor` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento_mayor` decimal(5,2) NOT NULL DEFAULT 0.00,
  `descuento_menor` decimal(5,2) NOT NULL DEFAULT 0.00,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  `permite_fraccion` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = se puede vender en sub-unidades (arrobas, cuartas, etc.)',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `id_empresa`, `id_clasificacion`, `id_marca`, `id_unidad`, `nombre`, `descripcion`, `imagen`, `precio_mayor`, `precio_menor`, `descuento_mayor`, `descuento_menor`, `stock_minimo`, `permite_fraccion`, `activo`, `creado_en`) VALUES
(1, 1, 1, 5, 5, 'Semilla Maíz Híbrido DK-7088', 'Maíz híbrido de alto rendimiento, apto para riego y secano', NULL, 120.00, 135.00, 5.00, 0.00, 20, 0, 1, '2026-05-26 15:27:53'),
(2, 1, 1, 1, 5, 'Semilla Soya NK-S7209', 'Soya ciclo medio, alta tolerancia a enfermedades', NULL, 95.00, 110.00, 5.00, 0.00, 15, 0, 1, '2026-05-26 15:27:53'),
(3, 1, 1, 5, 5, 'Semilla Sorgo NK-7829', 'Sorgo granífero resistente a sequía', NULL, 75.00, 88.00, 4.00, 0.00, 10, 0, 1, '2026-05-26 15:27:53'),
(4, 1, 1, 5, 5, 'Semilla Girasol SY-4045', 'Girasol de alto contenido oleico', NULL, 85.00, 98.00, 4.00, 0.00, 10, 0, 1, '2026-05-26 15:27:53'),
(5, 1, 2, 2, 4, 'Urea 46% Granulada', 'Nitrógeno al 46%, granulado, para todo tipo de cultivo', NULL, 210.00, 235.00, 8.00, 2.00, 30, 0, 1, '2026-05-26 15:27:53'),
(6, 1, 2, 8, 4, 'Fertilizante NPK 15-15-15', 'Fórmula balanceada para inicio de cultivo', NULL, 250.00, 280.00, 8.00, 2.00, 10, 0, 1, '2026-05-26 15:27:53'),
(7, 1, 2, 2, 4, 'Sulfato de Potasio K2SO4', 'Potasio de alta pureza, libre de cloro', NULL, 320.00, 360.00, 6.00, 0.00, 15, 0, 1, '2026-05-26 15:27:53'),
(8, 1, 3, 1, 2, 'Herbicida Roundup 48 SL', 'Glifosato 48%, control total de malezas, envase 1 lt', NULL, 180.00, 210.00, 10.00, 3.00, 20, 0, 1, '2026-05-26 15:27:53'),
(9, 1, 3, 3, 2, 'Fungicida Amistar Xtra 280 SC', 'Control de enfermedades foliares en soya y maíz, 1 lt', NULL, 450.00, 490.00, 8.00, 2.00, 10, 0, 1, '2026-05-26 15:27:53'),
(10, 1, 3, 6, 2, 'Insecticida Decis Forte 100 EC', 'Control de insectos masticadores y chupadores, 1 lt', NULL, 280.00, 310.00, 7.00, 0.00, 10, 0, 1, '2026-05-26 15:27:53'),
(11, 1, 3, 7, 2, 'Herbicida 2,4-D Amina 72%', 'Control de malezas de hoja ancha, envase 1 lt', NULL, 90.00, 105.00, 5.00, 0.00, 15, 0, 1, '2026-05-26 15:27:53'),
(12, 1, 4, 4, 3, 'Ivermectina 1% Inyectable 500ml', 'Antiparasitario de amplio espectro para bovinos y porcinos', NULL, 320.00, 360.00, 6.00, 0.00, 15, 0, 1, '2026-05-26 15:27:53'),
(13, 1, 4, 4, 3, 'Vacuna Triple Bovina Clostridial 50 dosis', 'Protección contra clostridiosis en bovinos, frasco x50 dosis', NULL, 280.00, 310.00, 5.00, 0.00, 10, 0, 1, '2026-05-26 15:27:53'),
(14, 1, 4, 4, 2, 'Oxitetraciclina 20% LA 100ml', 'Antibiótico de larga acción para bovinos y porcinos', NULL, 150.00, 175.00, 5.00, 0.00, 12, 0, 1, '2026-05-26 15:27:53'),
(15, 1, 6, 7, 4, 'Balanceado Iniciador Pollos Parrillero', 'Alimento completo fase inicial 0-21 días, saco 50 kg', 'producto_15_1780297659599.png', 195.00, 215.00, 7.00, 2.00, 10, 0, 1, '2026-05-26 15:27:53'),
(16, 1, 3, 6, 2, 'PRODUCTO PRUEBA 1', 'PRODUCTO DE PRUEBA', NULL, 200.00, 190.00, 0.00, 0.00, 10, 0, 1, '2026-06-01 04:16:40'),
(17, 1, 9, 10, 2, 'FERTIALGASBROTE', NULL, NULL, 325.00, 430.00, 0.00, 0.00, 2, 0, 1, '2026-06-16 12:01:33'),
(18, 4, 10, 11, 10, 'FERTIALGASBROTE', 'p', NULL, 200.00, 250.00, 0.00, 0.00, 5, 0, 1, '2026-06-18 09:20:25'),
(19, 1, 7, 8, 1, 'Abono', NULL, NULL, 110.00, 20.00, 0.00, 0.00, 5, 0, 1, '2026-06-18 13:22:32'),
(20, 1, 3, 10, 4, 'Fertilizante NPK 15-15-19', NULL, NULL, 1200.00, 1400.00, 0.00, 0.00, 4, 1, 1, '2026-06-18 14:30:13'),
(21, 1, 3, 10, 4, 'Abono 1', NULL, NULL, 200.00, 300.00, 0.00, 0.00, 5, 1, 1, '2026-06-18 15:11:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_fraccion`
--

CREATE TABLE `producto_fraccion` (
  `id_prod_fraccion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_conversion` int(11) NOT NULL,
  `precio_mayor` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio al por mayor por 1 sub-unidad',
  `precio_menor` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio al por menor por 1 sub-unidad',
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Precios de venta por sub-unidad para cada producto';

--
-- Volcado de datos para la tabla `producto_fraccion`
--

INSERT INTO `producto_fraccion` (`id_prod_fraccion`, `id_producto`, `id_conversion`, `precio_mayor`, `precio_menor`, `activo`) VALUES
(1, 20, 1, 200.00, 300.00, 1),
(2, 20, 3, 20.00, 10.00, 1),
(3, 20, 2, 1.00, 10.00, 1),
(13, 21, 1, 50.00, 60.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `empresa` varchar(150) NOT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id_proveedor`, `id_empresa`, `empresa`, `nit`, `contacto`, `telefono`, `correo`, `direccion`, `activo`) VALUES
(1, 1, 'Distribuidora Agro Bolivia S.R.L.', '1023456001', 'Fernando Suárez', '33491234', 'fsuarez@agrobolivia.com', 'Av. Grigotá N° 1200, Santa Cruz', 1),
(2, 1, 'SeedCo Bolivia', '2034567002', 'Claudia Montaño', '33478965', 'cmontano@seedco.bo', 'Parque Industrial PI-7, Santa Cruz', 1),
(3, 1, 'Yara Bolivia S.A.', '3045678003', 'Rodrigo Antezana', '44567891', 'rantezana@yara.com.bo', 'Av. América N° 450, Cochabamba', 1),
(4, 1, 'Laboratorios Zoetis Bolivia', '4056789004', 'Valeria Peña', '76345678', 'vpena@zoetis.com.bo', 'Calle Comercio N° 300, La Paz', 1),
(5, 1, 'Agroquímicos del Sur Ltda.', '5067890005', 'Marco Vargas', '72456789', 'mvargas@agrosur.com.bo', 'Barrio Urbari, Santa Cruz', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `id_empresa` int(11) DEFAULT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `id_empresa`, `nombre`) VALUES
(1, 1, 'Administrador'),
(2, 1, 'Vendedor'),
(3, 1, 'Almacenero'),
(4, 2, 'ADMIN'),
(5, 3, 'ADMINISTRADOR'),
(6, 3, 'VENDEDOR'),
(7, 3, 'ALMACENERO'),
(8, 4, 'ADMINISTRADOR'),
(9, 4, 'VENDEDOR'),
(10, 4, 'ALMACENERO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permiso`
--

CREATE TABLE `rol_permiso` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rol_permiso`
--

INSERT INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 39),
(1, 40),
(1, 41),
(1, 42),
(1, 43),
(1, 44),
(1, 45),
(1, 46),
(1, 47),
(1, 48),
(1, 49),
(1, 50),
(1, 51),
(1, 52),
(1, 53),
(1, 54),
(1, 55),
(1, 56),
(1, 57),
(1, 58),
(1, 59),
(1, 60),
(1, 61),
(1, 62),
(1, 63),
(1, 64),
(1, 65),
(1, 66),
(1, 67),
(1, 68),
(1, 69),
(1, 70),
(1, 71),
(1, 72),
(1, 73),
(1, 74),
(1, 75),
(1, 76),
(1, 77),
(1, 78),
(1, 79),
(1, 80),
(1, 81),
(1, 82),
(1, 83),
(1, 84),
(1, 85),
(1, 86),
(1, 87),
(1, 88),
(1, 89),
(1, 90),
(1, 91),
(1, 92),
(1, 93),
(1, 94),
(1, 95),
(1, 96),
(1, 97),
(1, 98),
(1, 99),
(1, 100),
(1, 101),
(1, 102),
(1, 103),
(1, 104),
(1, 105),
(1, 106),
(1, 107),
(1, 108),
(1, 109),
(1, 110),
(1, 111),
(1, 112),
(1, 113),
(1, 114),
(1, 115),
(1, 116),
(1, 117),
(1, 118),
(1, 119),
(1, 120),
(1, 121),
(1, 122),
(1, 123),
(1, 124),
(1, 125),
(1, 126),
(1, 127),
(1, 128),
(1, 129),
(1, 130),
(1, 131),
(1, 132),
(1, 133),
(1, 134),
(1, 135),
(2, 6),
(2, 15),
(2, 33),
(2, 34),
(2, 40),
(2, 43),
(2, 45),
(2, 51),
(2, 69),
(2, 70),
(2, 71),
(2, 72),
(2, 75),
(2, 76),
(2, 77),
(2, 78),
(2, 79),
(2, 81),
(2, 82),
(2, 83),
(2, 88),
(2, 93),
(2, 97),
(2, 98),
(2, 99),
(2, 100),
(2, 101),
(2, 102),
(2, 103),
(2, 106),
(3, 33),
(3, 34),
(3, 39),
(3, 43),
(3, 45),
(3, 46),
(3, 47),
(3, 48),
(3, 49),
(3, 50),
(3, 51),
(3, 52),
(3, 53),
(3, 54),
(3, 55),
(3, 56),
(3, 61),
(3, 62),
(3, 63),
(3, 64),
(3, 66),
(3, 89),
(3, 90),
(3, 91),
(3, 92),
(3, 109),
(3, 110),
(3, 114),
(3, 115),
(3, 116),
(3, 117),
(3, 119),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 5),
(4, 6),
(4, 7),
(4, 8),
(4, 9),
(4, 10),
(4, 11),
(4, 12),
(4, 13),
(4, 14),
(4, 15),
(4, 16),
(4, 17),
(4, 18),
(4, 19),
(4, 20),
(4, 21),
(4, 22),
(4, 23),
(4, 24),
(4, 25),
(4, 26),
(4, 27),
(4, 28),
(4, 29),
(4, 30),
(4, 31),
(4, 32),
(4, 33),
(4, 34),
(4, 35),
(4, 36),
(4, 37),
(4, 38),
(4, 39),
(4, 40),
(4, 41),
(4, 42),
(4, 43),
(4, 44),
(4, 45),
(4, 46),
(4, 47),
(4, 48),
(4, 49),
(4, 50),
(4, 51),
(4, 52),
(4, 53),
(4, 54),
(4, 55),
(4, 56),
(4, 57),
(4, 58),
(4, 59),
(4, 60),
(4, 61),
(4, 62),
(4, 63),
(4, 64),
(4, 65),
(4, 66),
(4, 67),
(4, 68),
(4, 69),
(4, 70),
(4, 71),
(4, 72),
(4, 73),
(4, 74),
(4, 75),
(4, 76),
(4, 77),
(4, 78),
(4, 79),
(4, 80),
(4, 81),
(4, 82),
(4, 83),
(4, 84),
(4, 85),
(4, 86),
(4, 87),
(4, 88),
(4, 89),
(4, 90),
(4, 91),
(4, 92),
(4, 93),
(4, 94),
(4, 95),
(4, 96),
(4, 97),
(4, 98),
(4, 99),
(4, 100),
(4, 101),
(4, 102),
(4, 103),
(4, 104),
(4, 105),
(4, 106),
(4, 107),
(4, 108),
(4, 109),
(4, 110),
(4, 111),
(4, 112),
(4, 113),
(4, 114),
(4, 115),
(4, 116),
(4, 117),
(4, 118),
(4, 119),
(4, 120),
(4, 121),
(4, 122),
(4, 123),
(4, 124),
(4, 125),
(4, 126),
(4, 127),
(4, 128),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(5, 5),
(5, 6),
(5, 7),
(5, 8),
(5, 9),
(5, 10),
(5, 11),
(5, 12),
(5, 13),
(5, 14),
(5, 15),
(5, 16),
(5, 17),
(5, 18),
(5, 19),
(5, 20),
(5, 21),
(5, 22),
(5, 23),
(5, 24),
(5, 25),
(5, 26),
(5, 27),
(5, 28),
(5, 29),
(5, 30),
(5, 31),
(5, 32),
(5, 33),
(5, 34),
(5, 35),
(5, 36),
(5, 37),
(5, 38),
(5, 39),
(5, 40),
(5, 41),
(5, 42),
(5, 43),
(5, 44),
(5, 45),
(5, 46),
(5, 47),
(5, 48),
(5, 49),
(5, 50),
(5, 51),
(5, 52),
(5, 53),
(5, 54),
(5, 55),
(5, 56),
(5, 57),
(5, 58),
(5, 59),
(5, 60),
(5, 61),
(5, 62),
(5, 63),
(5, 64),
(5, 65),
(5, 66),
(5, 67),
(5, 68),
(5, 69),
(5, 70),
(5, 71),
(5, 72),
(5, 73),
(5, 74),
(5, 75),
(5, 76),
(5, 77),
(5, 78),
(5, 79),
(5, 80),
(5, 81),
(5, 82),
(5, 83),
(5, 84),
(5, 85),
(5, 86),
(5, 87),
(5, 88),
(5, 89),
(5, 90),
(5, 91),
(5, 92),
(5, 93),
(5, 94),
(5, 95),
(5, 96),
(5, 97),
(5, 98),
(5, 99),
(5, 100),
(5, 101),
(5, 102),
(5, 103),
(5, 104),
(5, 105),
(5, 106),
(5, 107),
(5, 108),
(5, 109),
(5, 110),
(5, 111),
(5, 112),
(5, 113),
(5, 114),
(5, 115),
(5, 116),
(5, 117),
(5, 118),
(5, 119),
(5, 120),
(5, 121),
(5, 122),
(5, 123),
(5, 124),
(5, 125),
(5, 126),
(5, 127),
(5, 128),
(6, 6),
(6, 15),
(6, 33),
(6, 34),
(6, 40),
(6, 43),
(6, 45),
(6, 51),
(6, 69),
(6, 70),
(6, 71),
(6, 72),
(6, 75),
(6, 76),
(6, 77),
(6, 78),
(6, 79),
(6, 81),
(6, 82),
(6, 83),
(6, 88),
(6, 93),
(6, 97),
(6, 98),
(6, 99),
(6, 100),
(6, 101),
(6, 102),
(6, 103),
(6, 106),
(7, 33),
(7, 34),
(7, 39),
(7, 43),
(7, 45),
(7, 46),
(7, 47),
(7, 48),
(7, 49),
(7, 50),
(7, 51),
(7, 52),
(7, 53),
(7, 54),
(7, 55),
(7, 56),
(7, 61),
(7, 62),
(7, 63),
(7, 64),
(7, 66),
(7, 89),
(7, 90),
(7, 91),
(7, 92),
(7, 109),
(7, 110),
(7, 114),
(7, 115),
(7, 116),
(7, 117),
(7, 119),
(8, 1),
(8, 2),
(8, 3),
(8, 4),
(8, 5),
(8, 6),
(8, 7),
(8, 8),
(8, 9),
(8, 10),
(8, 11),
(8, 12),
(8, 13),
(8, 14),
(8, 15),
(8, 16),
(8, 17),
(8, 18),
(8, 19),
(8, 20),
(8, 21),
(8, 22),
(8, 23),
(8, 24),
(8, 25),
(8, 26),
(8, 27),
(8, 28),
(8, 29),
(8, 30),
(8, 31),
(8, 32),
(8, 33),
(8, 34),
(8, 35),
(8, 36),
(8, 37),
(8, 38),
(8, 39),
(8, 40),
(8, 41),
(8, 42),
(8, 43),
(8, 44),
(8, 45),
(8, 46),
(8, 47),
(8, 48),
(8, 49),
(8, 50),
(8, 51),
(8, 52),
(8, 53),
(8, 54),
(8, 55),
(8, 56),
(8, 57),
(8, 58),
(8, 59),
(8, 60),
(8, 61),
(8, 62),
(8, 63),
(8, 64),
(8, 65),
(8, 66),
(8, 67),
(8, 68),
(8, 69),
(8, 70),
(8, 71),
(8, 72),
(8, 73),
(8, 74),
(8, 75),
(8, 76),
(8, 77),
(8, 78),
(8, 79),
(8, 80),
(8, 81),
(8, 82),
(8, 83),
(8, 84),
(8, 85),
(8, 86),
(8, 87),
(8, 88),
(8, 89),
(8, 90),
(8, 91),
(8, 92),
(8, 93),
(8, 94),
(8, 95),
(8, 96),
(8, 97),
(8, 98),
(8, 99),
(8, 100),
(8, 101),
(8, 102),
(8, 103),
(8, 104),
(8, 105),
(8, 106),
(8, 107),
(8, 108),
(8, 109),
(8, 110),
(8, 111),
(8, 112),
(8, 113),
(8, 114),
(8, 115),
(8, 116),
(8, 117),
(8, 118),
(8, 119),
(8, 120),
(8, 121),
(8, 122),
(8, 123),
(8, 124),
(8, 125),
(8, 126),
(8, 127),
(8, 128),
(8, 129),
(8, 130),
(9, 15),
(9, 25),
(9, 29),
(9, 33),
(9, 34),
(9, 40),
(9, 43),
(9, 45),
(9, 51),
(9, 69),
(9, 70),
(9, 71),
(9, 75),
(9, 76),
(9, 77),
(9, 78),
(9, 81),
(9, 82),
(9, 83),
(9, 88),
(9, 93),
(9, 97),
(9, 98),
(9, 99),
(9, 100),
(9, 101),
(9, 102),
(9, 103),
(9, 106),
(9, 127),
(9, 128),
(10, 33),
(10, 34),
(10, 39),
(10, 43),
(10, 45),
(10, 46),
(10, 47),
(10, 48),
(10, 49),
(10, 50),
(10, 51),
(10, 52),
(10, 53),
(10, 54),
(10, 55),
(10, 56),
(10, 61),
(10, 62),
(10, 63),
(10, 64),
(10, 66),
(10, 89),
(10, 90),
(10, 91),
(10, 92),
(10, 109),
(10, 110),
(10, 114),
(10, 115),
(10, 116),
(10, 117),
(10, 119);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sucursal`
--

INSERT INTO `sucursal` (`id_sucursal`, `id_empresa`, `nombre`, `direccion`, `ciudad`, `telefono`, `correo`, `activo`, `creado_en`) VALUES
(1, 1, 'Sucursal Central', 'Av. Cañoto N° 234, entre Warnes y Ñuflo de Chávez', 'Santa Cruz de la Sierra', '33412345', 'central@agropecuaria.bo', 1, '2026-05-26 15:27:53'),
(2, 1, 'Sucursal Norte', 'Calle Montero N° 89, Zona Norte', 'Santa Cruz de la Sierra', '33498765', 'norte@agropecuaria.bo', 1, '2026-05-26 15:27:53'),
(3, 1, 'Sucursal Cochabamba', 'Av. Blanco Galindo Km 5, Quillacollo', 'Cochabamba', '44523678', 'cbba@agropecuaria.bo', 1, '2026-05-26 15:27:53'),
(4, 2, 'Shinahota', 'A', 'Cochabamba', '74819122', 'felipe@agropecuaria.bo', 1, '2026-06-15 16:22:17'),
(5, 3, 'Sucursal Chimore', 'Av. brasi', 'Cochabamba', '74819122', NULL, 1, '2026-06-15 22:32:24'),
(6, 3, 'Sucursal Central', 'Av tunel', 'Cochabamba', '74819152', NULL, 1, '2026-06-15 22:33:23'),
(7, 4, 'Sucursal Central Entre Rios', 'Entre rios', 'Cocha', '72264681', NULL, 1, '2026-06-16 12:29:14'),
(8, 4, 'Sucursal Chimore', 'Av. chimore', 'Cochabamba', '56858594', NULL, 1, '2026-06-17 11:45:04'),
(9, 4, 'Sucursal Chancadora', 'la  paz', 'Santa Cruz', '74819152', 'felipemejia7490@gmail.com', 1, '2026-06-18 07:38:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `super_admin`
--

CREATE TABLE `super_admin` (
  `id_admin` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `super_admin`
--

INSERT INTO `super_admin` (`id_admin`, `nombre`, `correo`, `contrasena`, `ultimo_acceso`, `activo`, `creado_en`) VALUES
(1, 'Administrador SIS-AGRO', 'admin@sisagro.bo', '$2b$10$d4lbs5r6ZzArqhXcfdcyAO8ZyGbZKkJWErP1QhNC1weRpYY/aUmQi', '2026-06-18 13:14:50', 1, '2026-06-15 06:59:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suscripcion`
--

CREATE TABLE `suscripcion` (
  `id_suscripcion` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_plan` int(11) NOT NULL,
  `ciclo` enum('MENSUAL','ANUAL') NOT NULL DEFAULT 'MENSUAL',
  `estado` enum('PRUEBA','ACTIVA','VENCIDA','CANCELADA') NOT NULL DEFAULT 'PRUEBA',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `suscripcion`
--

INSERT INTO `suscripcion` (`id_suscripcion`, `id_empresa`, `id_plan`, `ciclo`, `estado`, `fecha_inicio`, `fecha_fin`, `creado_en`) VALUES
(1, 1, 4, 'ANUAL', 'ACTIVA', '2026-06-15', '2027-06-15', '2026-06-15 06:59:12'),
(2, 2, 1, 'MENSUAL', 'CANCELADA', '2026-06-15', '2026-06-22', '2026-06-15 10:25:25'),
(3, 3, 1, 'MENSUAL', 'CANCELADA', '2026-06-15', '2026-06-22', '2026-06-15 22:29:50'),
(4, 3, 2, 'MENSUAL', 'CANCELADA', '2026-06-16', '2026-07-16', '2026-06-15 22:30:17'),
(5, 3, 4, 'MENSUAL', 'CANCELADA', '2026-06-16', '2026-07-16', '2026-06-15 22:52:20'),
(6, 3, 3, 'MENSUAL', 'CANCELADA', '2026-06-16', '2026-07-16', '2026-06-15 22:53:34'),
(7, 3, 2, 'MENSUAL', 'ACTIVA', '2026-06-16', '2026-07-16', '2026-06-15 22:54:15'),
(8, 4, 1, 'MENSUAL', 'CANCELADA', '2026-06-16', '2026-06-23', '2026-06-16 12:25:16'),
(9, 4, 3, 'MENSUAL', 'ACTIVA', '2026-06-16', '2026-07-16', '2026-06-16 12:30:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `traslado`
--

CREATE TABLE `traslado` (
  `id_traslado` int(11) NOT NULL,
  `id_lote_origen` int(11) NOT NULL,
  `id_sucursal_dest` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `cantidad_cajas` int(11) NOT NULL DEFAULT 0,
  `cantidad_unidades` int(11) NOT NULL DEFAULT 0,
  `fecha_traslado` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('PENDIENTE','CONFIRMADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `traslado`
--

INSERT INTO `traslado` (`id_traslado`, `id_lote_origen`, `id_sucursal_dest`, `id_usuario`, `cantidad_cajas`, `cantidad_unidades`, `fecha_traslado`, `estado`, `observaciones`) VALUES
(1, 8, 2, 6, 5, 0, '2026-05-15 14:00:00', 'CONFIRMADO', 'Traslado de herbicida 2,4-D solicitado por sucursal norte'),
(2, 10, 3, 1, 20, 20, '2026-05-26 17:29:52', 'CANCELADO', NULL),
(3, 10, 3, 1, 1, 20, '2026-05-26 17:30:33', 'CONFIRMADO', NULL),
(4, 12, 3, 1, 20, 0, '2026-05-27 08:55:01', 'CONFIRMADO', NULL),
(5, 11, 3, 1, 1, 1, '2026-05-27 18:28:40', 'CONFIRMADO', NULL),
(6, 23, 2, 1, 0, 6, '2026-06-01 04:18:57', 'CONFIRMADO', 'ninguna'),
(7, 20, 2, 1, 0, 6, '2026-06-17 09:21:06', 'CONFIRMADO', NULL),
(8, 28, 9, 11, 0, 8, '2026-06-18 09:21:29', 'CONFIRMADO', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidad_medida`
--

CREATE TABLE `unidad_medida` (
  `id_unidad` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `abreviatura` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `unidad_medida`
--

INSERT INTO `unidad_medida` (`id_unidad`, `id_empresa`, `nombre`, `abreviatura`) VALUES
(1, 1, 'Kilogramo', 'kg'),
(2, 1, 'Litro', 'lt'),
(3, 1, 'Unidad', 'und'),
(4, 1, 'Saco (50 kg)', 'saco'),
(5, 1, 'Sobre', 'sobre'),
(6, 1, 'Mililitro', 'ml'),
(7, 1, 'Gramo', 'gr'),
(8, 1, 'Caja', 'cja'),
(9, 2, 'Litros', 'Lts'),
(10, 4, 'Unidad', 'Und');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `id_sucursal` int(11) DEFAULT NULL,
  `ci` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `id_empresa`, `id_rol`, `id_sucursal`, `ci`, `nombre`, `apellido`, `celular`, `correo`, `contrasena`, `activo`, `creado_en`) VALUES
(1, 1, 1, 3, '7512301', 'Carlos', 'Mendoza Vaca', '77812301', 'admin@agropecuaria.bo', '$2b$10$0mJZMb0UdWEo.0.4bbmIauwGq6EtZ3sCiQJZkJFL19UZPI68m/xie', 1, '2026-05-26 15:27:53'),
(2, 1, 2, 1, '8023402', 'María', 'Flores Torrico', '76923402', 'mflores@agropecuaria.bo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2026-05-26 15:27:53'),
(3, 1, 2, 1, '6534503', 'Roberto', 'Quiroga Pedraza', '71534503', 'rquiroga@agropecuaria.bo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2026-05-26 15:27:53'),
(4, 1, 2, 2, '5245604', 'Lucía', 'Gutiérrez Molina', '79845604', 'lgutierrez@agropecuaria.bo', '$2b$10$QHK5RJFnv2RaqbLpJL2lUOFPMpjeX9mFsjCE8j3AMtB4l/o3AYmqC', 1, '2026-05-26 15:27:53'),
(5, 1, 2, 1, '4356705', 'Pablo', 'Rojas Saavedra', '68956705', 'projas@agropecuaria.bo', '$2b$10$c9jtizohZ3Iumyib0WT29.qGU.rokMqBuneBi8hpH5UsgQeVzTXDi', 1, '2026-05-26 15:27:53'),
(6, 1, 3, 1, '9167806', 'Juan', 'Mamani Condori', '72167806', 'jmamani@agropecuaria.bo', '$2b$10$pXrnnJ3ZnlPu0pJPRAhxae.TXjP3dqmm/MhzNYWoZEJxhw2eGmeK.', 1, '2026-05-26 15:27:53'),
(7, 1, 3, 2, '3278907', 'Ana', 'Choque Limachi', '67378907', 'achoque@agropecuaria.bo', '$2b$10$nM1exkcz9/rXW/8iSrR.G.swrlyXHg8G3TG1pQxEVDjTVrs5M0fpC', 1, '2026-05-26 15:27:53'),
(8, 1, 3, 3, '2389008', 'Diego', 'Quispe Huanca', '73489008', 'dquispe@agropecuaria.bo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2026-05-26 15:27:53'),
(9, 2, 4, 4, '9391669', 'Zepita', 'Felipe', NULL, 'zepita@gmail.com', '$2b$10$3vXjzxhekk8Y4/JSZXBkhujVTDN9cR45NacgkTB95jBxp9fdPUfKu', 1, '2026-06-15 10:25:25'),
(10, 3, 5, 5, '9391668', 'Ruben', 'Felipe', NULL, 'felipe@gmail.com', '$2b$10$j8RGofET8/Zfq4HVSykHdOpKJtMGyg/R21fN3Ove4PPtb6KXnZbsa', 1, '2026-06-15 22:29:50'),
(11, 4, 8, 7, '13578919', 'Pedro Luis', 'Yanaguaya Plata', NULL, 'pedro@gmail.com', '$2b$10$ch7gVRaecnqM3M1/wNayXuRRokzl7o9LZRS9XuiCi0q/3YkT2wih6', 1, '2026-06-16 12:25:16'),
(15, 4, 9, 9, '93916696', 'Felipe', 'Mejia', '74819122', 'felipe@agronutri.bo', '$2b$10$SzixqdB6fg.vd7fMAe92dOOejHPDLlKI.T6OXCdlmJGlTRYrGYwTK', 1, '2026-06-17 10:36:39'),
(16, 4, 9, 8, '56399688', 'Perez', 'Perez juan', 'admin@electrohogar.b', 'juan@gmail.com', '$2b$10$julsl2ksZwPILxHwOUKq..uAOqGdKTBEoM690ki4bLAybkCsWQrGK', 1, '2026-06-17 11:46:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_venta` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_apertura` int(11) DEFAULT NULL,
  `nro_factura` varchar(60) DEFAULT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo_venta` enum('MENOR','MAYOR') NOT NULL DEFAULT 'MENOR',
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `descuento_total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `monto_pagado` decimal(14,2) NOT NULL DEFAULT 0.00,
  `cambio` decimal(14,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','QR','QR_ESTATICO','CREDITO','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  `estado` enum('COMPLETADA','ANULADA','PENDIENTE') NOT NULL DEFAULT 'COMPLETADA',
  `observaciones` text DEFAULT NULL,
  `fecha_vencimiento_credito` date DEFAULT NULL,
  `estado_credito` enum('PENDIENTE','PARCIAL','PAGADO') DEFAULT NULL,
  `codepay_order_id` varchar(25) DEFAULT NULL,
  `codepay_tx_id` varchar(60) DEFAULT NULL,
  `codepay_voucher` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id_venta`, `id_sucursal`, `id_usuario`, `id_cliente`, `id_apertura`, `nro_factura`, `fecha_venta`, `tipo_venta`, `subtotal`, `descuento_total`, `total`, `monto_pagado`, `cambio`, `metodo_pago`, `estado`, `observaciones`, `fecha_vencimiento_credito`, `estado_credito`, `codepay_order_id`, `codepay_tx_id`, `codepay_voucher`) VALUES
(1, 1, 2, 2, 1, 'VTA-0001-2026', '2026-05-20 09:30:00', 'MAYOR', 4310.00, 344.80, 3965.20, 3965.20, 0.00, 'QR', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 2, 4, 1, 'VTA-0002-2026', '2026-05-20 11:00:00', 'MENOR', 405.00, 0.00, 405.00, 450.00, 45.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 3, NULL, 2, 'VTA-0003-2026', '2026-05-26 09:15:00', 'MENOR', 315.00, 0.00, 315.00, 400.00, 85.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 3, 3, 2, 'VTA-0004-2026', '2026-05-26 10:00:00', 'MAYOR', 4580.00, 366.40, 4213.60, 4213.60, 0.00, 'TRANSFERENCIA', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 1, 3, 5, 2, 'VTA-0005-2026', '2026-05-26 11:30:00', 'MENOR', 210.00, 0.00, 210.00, 210.00, 0.00, 'QR', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 2, 4, 2, 3, 'VTA-0006-2026', '2026-05-26 09:00:00', 'MAYOR', 4880.00, 292.80, 4587.20, 4587.20, 0.00, 'QR', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 3, 1, NULL, NULL, NULL, '2026-05-27 09:00:39', 'MENOR', 430.00, 0.00, 430.00, 500.00, 70.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 3, 1, NULL, NULL, NULL, '2026-05-27 09:01:37', 'MENOR', 545.00, 0.00, 545.00, 600.00, 55.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(9, 3, 1, NULL, NULL, NULL, '2026-05-27 09:03:50', 'MENOR', 495.00, 0.00, 495.00, 500.00, 5.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 3, 1, NULL, NULL, NULL, '2026-05-27 09:04:26', 'MENOR', 905.00, 0.00, 905.00, 920.00, 15.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 3, 1, NULL, NULL, NULL, '2026-05-27 10:16:32', 'MENOR', 595.00, 0.00, 595.00, 595.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 3, 1, 8, NULL, NULL, '2026-05-27 11:20:30', 'MENOR', 595.00, 0.00, 595.00, 595.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 3, 1, NULL, NULL, NULL, '2026-05-27 14:35:51', 'MENOR', 640.00, 0.00, 640.00, 640.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 1, 5, NULL, NULL, NULL, '2026-05-27 14:53:07', 'MENOR', 245.00, 0.00, 245.00, 245.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 3, 1, NULL, NULL, NULL, '2026-06-01 04:10:59', 'MENOR', 495.00, 14.85, 480.15, 480.15, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(16, 3, 1, NULL, NULL, NULL, '2026-06-04 18:32:05', 'MENOR', 725.00, 0.00, 725.00, 725.00, 0.00, 'QR', 'PENDIENTE', NULL, NULL, NULL, 'VTA_mq02lrpa_uvm', NULL, NULL),
(17, 3, 1, NULL, NULL, NULL, '2026-06-04 18:32:58', 'MENOR', 640.00, 0.00, 640.00, 640.00, 0.00, 'QR', 'PENDIENTE', NULL, NULL, NULL, 'VTA_mq02mwri_e6d', NULL, NULL),
(18, 3, 1, NULL, NULL, NULL, '2026-06-04 19:10:46', 'MENOR', 175.00, 0.00, 175.00, 175.00, 0.00, 'QR', 'PENDIENTE', NULL, NULL, NULL, 'VTA_mq03zi6b_byv', NULL, NULL),
(19, 3, 1, NULL, NULL, NULL, '2026-06-04 19:25:57', 'MENOR', 190.00, 0.00, 190.00, 190.00, 0.00, 'QR', 'PENDIENTE', NULL, NULL, NULL, 'VTA_mq04j114_vao', NULL, NULL),
(20, 3, 1, NULL, NULL, NULL, '2026-06-15 10:45:03', 'MENOR', 215.00, 10.00, 205.00, 205.00, 0.00, 'EFECTIVO', 'ANULADA', NULL, NULL, NULL, NULL, NULL, NULL),
(21, 3, 1, NULL, NULL, NULL, '2026-06-15 23:05:26', 'MENOR', 490.00, 20.00, 470.00, 470.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 3, 1, 7, NULL, NULL, '2026-06-15 23:05:55', 'MENOR', 490.00, 20.00, 470.00, 500.00, 30.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(23, 3, 1, 5, NULL, NULL, '2026-06-16 12:20:12', 'MENOR', 430.00, 30.00, 400.00, 600.00, 200.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(24, 3, 1, 8, NULL, NULL, '2026-06-17 09:59:19', 'MENOR', 1315.00, 0.00, 1315.00, 150.00, 0.00, 'CREDITO', 'COMPLETADA', NULL, '2026-11-17', 'PAGADO', NULL, NULL, NULL),
(25, 3, 1, 5, NULL, NULL, '2026-06-17 10:07:07', 'MENOR', 280.00, 0.00, 280.00, 0.00, 0.00, 'CREDITO', 'COMPLETADA', NULL, '2026-08-17', 'PAGADO', NULL, NULL, NULL),
(26, 3, 1, 7, NULL, NULL, '2026-06-17 10:25:58', 'MENOR', 430.00, 0.00, 430.00, 0.00, 0.00, 'CREDITO', 'COMPLETADA', NULL, '2026-07-17', 'PARCIAL', NULL, NULL, NULL),
(27, 3, 1, NULL, NULL, NULL, '2026-06-17 12:08:59', 'MENOR', 280.00, 0.00, 280.00, 280.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(28, 9, 15, 9, NULL, NULL, '2026-06-18 09:22:57', 'MAYOR', 200.00, 0.00, 200.00, 200.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(29, 3, 1, NULL, NULL, NULL, '2026-06-18 10:31:58', 'MENOR', 430.00, 0.00, 430.00, 430.00, 0.00, 'QR_ESTATICO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 3, 1, NULL, NULL, NULL, '2026-06-18 10:32:11', 'MENOR', 280.00, 0.00, 280.00, 280.00, 0.00, 'QR', 'PENDIENTE', NULL, NULL, NULL, 'VTA_mqjlmize_vyr', NULL, NULL),
(31, 3, 1, 10, NULL, NULL, '2026-06-18 13:20:25', 'MENOR', 235.00, 0.00, 235.00, 235.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(32, 3, 1, 11, NULL, NULL, '2026-06-18 13:21:17', 'MAYOR', 730.00, 0.00, 730.00, 730.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(33, 3, 1, NULL, NULL, NULL, '2026-06-18 14:54:56', 'MAYOR', 1.00, 0.00, 1.00, 1.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(34, 3, 1, NULL, NULL, NULL, '2026-06-18 15:13:08', 'MENOR', 60.00, 0.00, 60.00, 60.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL),
(35, 3, 1, NULL, NULL, NULL, '2026-06-18 15:14:39', 'MENOR', 40.00, 0.00, 40.00, 40.00, 0.00, 'EFECTIVO', 'COMPLETADA', NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `apertura_cierre_caja`
--
ALTER TABLE `apertura_cierre_caja`
  ADD PRIMARY KEY (`id_apertura`),
  ADD KEY `fk_acc_caja` (`id_caja`),
  ADD KEY `fk_acc_usuario` (`id_usuario`),
  ADD KEY `fk_acc_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `caja`
--
ALTER TABLE `caja`
  ADD PRIMARY KEY (`id_caja`),
  ADD KEY `fk_caja_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `categoria_movimiento`
--
ALTER TABLE `categoria_movimiento`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `uq_nombre` (`nombre`),
  ADD KEY `fk_cat_empresa` (`id_empresa`);

--
-- Indices de la tabla `clasificacion_producto`
--
ALTER TABLE `clasificacion_producto`
  ADD PRIMARY KEY (`id_clasificacion`),
  ADD UNIQUE KEY `uq_clasificacion_nombre` (`nombre`),
  ADD KEY `fk_clasprod_empresa` (`id_empresa`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `uq_cliente_cinit` (`ci_nit`),
  ADD KEY `fk_cli_empresa` (`id_empresa`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `fk_compra_proveedor` (`id_proveedor`),
  ADD KEY `fk_compra_sucursal` (`id_sucursal`),
  ADD KEY `fk_compra_usuario` (`id_usuario`);

--
-- Indices de la tabla `conversion_unidad`
--
ALTER TABLE `conversion_unidad`
  ADD PRIMARY KEY (`id_conversion`),
  ADD UNIQUE KEY `uq_conv_empresa_nombre` (`id_empresa`,`nombre`),
  ADD KEY `fk_conv_empresa` (`id_empresa`),
  ADD KEY `fk_conv_unidad` (`id_unidad_base`);

--
-- Indices de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD PRIMARY KEY (`id_detalle_compra`),
  ADD KEY `fk_dc_compra` (`id_compra`),
  ADD KEY `fk_dc_lote` (`id_lote`),
  ADD KEY `fk_dc_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id_detalle_venta`),
  ADD KEY `fk_dv_venta` (`id_venta`),
  ADD KEY `fk_dv_lote` (`id_lote`),
  ADD KEY `fk_dv_producto` (`id_producto`),
  ADD KEY `fk_dv_conversion` (`id_conversion`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`id_empresa`);

--
-- Indices de la tabla `lote`
--
ALTER TABLE `lote`
  ADD PRIMARY KEY (`id_lote`),
  ADD KEY `fk_lote_producto` (`id_producto`),
  ADD KEY `fk_lote_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`id_marca`),
  ADD KEY `fk_marca_empresa` (`id_empresa`);

--
-- Indices de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_sucursal` (`id_sucursal`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `movimiento_almacen`
--
ALTER TABLE `movimiento_almacen`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_mov_lote` (`id_lote`),
  ADD KEY `fk_mov_sucursal` (`id_sucursal`),
  ADD KEY `fk_mov_usuario` (`id_usuario`);

--
-- Indices de la tabla `pago_compra`
--
ALTER TABLE `pago_compra`
  ADD PRIMARY KEY (`id_pago_compra`),
  ADD KEY `fk_pc_compra` (`id_compra`),
  ADD KEY `fk_pc_usuario` (`id_usuario`);

--
-- Indices de la tabla `pago_suscripcion`
--
ALTER TABLE `pago_suscripcion`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `fk_pago_sus` (`id_suscripcion`);

--
-- Indices de la tabla `pago_venta`
--
ALTER TABLE `pago_venta`
  ADD PRIMARY KEY (`id_pago_venta`),
  ADD KEY `fk_pv_venta` (`id_venta`),
  ADD KEY `fk_pv_usuario` (`id_usuario`);

--
-- Indices de la tabla `permiso`
--
ALTER TABLE `permiso`
  ADD PRIMARY KEY (`id_permiso`),
  ADD UNIQUE KEY `uq_permiso_clave` (`nombre_clave`);

--
-- Indices de la tabla `plan`
--
ALTER TABLE `plan`
  ADD PRIMARY KEY (`id_plan`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_prod_clasificacion` (`id_clasificacion`),
  ADD KEY `fk_prod_marca` (`id_marca`),
  ADD KEY `fk_prod_unidad` (`id_unidad`),
  ADD KEY `fk_pro_empresa` (`id_empresa`);

--
-- Indices de la tabla `producto_fraccion`
--
ALTER TABLE `producto_fraccion`
  ADD PRIMARY KEY (`id_prod_fraccion`),
  ADD UNIQUE KEY `uq_prod_conv` (`id_producto`,`id_conversion`),
  ADD KEY `fk_pf_producto` (`id_producto`),
  ADD KEY `fk_pf_conversion` (`id_conversion`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `uq_proveedor_nit` (`nit`),
  ADD KEY `fk_prov_empresa` (`id_empresa`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD PRIMARY KEY (`id_rol`,`id_permiso`),
  ADD KEY `fk_rp_permiso` (`id_permiso`);

--
-- Indices de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`),
  ADD KEY `fk_suc_empresa` (`id_empresa`);

--
-- Indices de la tabla `super_admin`
--
ALTER TABLE `super_admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `uq_admin_correo` (`correo`);

--
-- Indices de la tabla `suscripcion`
--
ALTER TABLE `suscripcion`
  ADD PRIMARY KEY (`id_suscripcion`),
  ADD KEY `fk_sus_empresa` (`id_empresa`),
  ADD KEY `fk_sus_plan` (`id_plan`);

--
-- Indices de la tabla `traslado`
--
ALTER TABLE `traslado`
  ADD PRIMARY KEY (`id_traslado`),
  ADD KEY `fk_tras_lote` (`id_lote_origen`),
  ADD KEY `fk_tras_sucursal` (`id_sucursal_dest`),
  ADD KEY `fk_tras_usuario` (`id_usuario`);

--
-- Indices de la tabla `unidad_medida`
--
ALTER TABLE `unidad_medida`
  ADD PRIMARY KEY (`id_unidad`),
  ADD KEY `fk_unidad_empresa` (`id_empresa`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uq_usuario_ci` (`ci`),
  ADD UNIQUE KEY `uq_usuario_correo` (`correo`),
  ADD KEY `fk_usuario_rol` (`id_rol`),
  ADD KEY `fk_usuario_sucursal` (`id_sucursal`),
  ADD KEY `fk_usu_empresa` (`id_empresa`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `fk_venta_sucursal` (`id_sucursal`),
  ADD KEY `fk_venta_usuario` (`id_usuario`),
  ADD KEY `fk_venta_cliente` (`id_cliente`),
  ADD KEY `fk_venta_apertura` (`id_apertura`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `apertura_cierre_caja`
--
ALTER TABLE `apertura_cierre_caja`
  MODIFY `id_apertura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `caja`
--
ALTER TABLE `caja`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `categoria_movimiento`
--
ALTER TABLE `categoria_movimiento`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `clasificacion_producto`
--
ALTER TABLE `clasificacion_producto`
  MODIFY `id_clasificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `conversion_unidad`
--
ALTER TABLE `conversion_unidad`
  MODIFY `id_conversion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  MODIFY `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `id_empresa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `lote`
--
ALTER TABLE `lote`
  MODIFY `id_lote` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `movimiento_almacen`
--
ALTER TABLE `movimiento_almacen`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT de la tabla `pago_compra`
--
ALTER TABLE `pago_compra`
  MODIFY `id_pago_compra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pago_suscripcion`
--
ALTER TABLE `pago_suscripcion`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago_venta`
--
ALTER TABLE `pago_venta`
  MODIFY `id_pago_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `permiso`
--
ALTER TABLE `permiso`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

--
-- AUTO_INCREMENT de la tabla `plan`
--
ALTER TABLE `plan`
  MODIFY `id_plan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `producto_fraccion`
--
ALTER TABLE `producto_fraccion`
  MODIFY `id_prod_fraccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id_sucursal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `super_admin`
--
ALTER TABLE `super_admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `suscripcion`
--
ALTER TABLE `suscripcion`
  MODIFY `id_suscripcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `traslado`
--
ALTER TABLE `traslado`
  MODIFY `id_traslado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `unidad_medida`
--
ALTER TABLE `unidad_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `apertura_cierre_caja`
--
ALTER TABLE `apertura_cierre_caja`
  ADD CONSTRAINT `fk_acc_caja` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  ADD CONSTRAINT `fk_acc_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `fk_acc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `caja`
--
ALTER TABLE `caja`
  ADD CONSTRAINT `fk_caja_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Filtros para la tabla `categoria_movimiento`
--
ALTER TABLE `categoria_movimiento`
  ADD CONSTRAINT `fk_cat_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `clasificacion_producto`
--
ALTER TABLE `clasificacion_producto`
  ADD CONSTRAINT `fk_clasprod_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_cli_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `compra`
--
ALTER TABLE `compra`
  ADD CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  ADD CONSTRAINT `fk_compra_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `conversion_unidad`
--
ALTER TABLE `conversion_unidad`
  ADD CONSTRAINT `fk_conv_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_conv_unidad` FOREIGN KEY (`id_unidad_base`) REFERENCES `unidad_medida` (`id_unidad`);

--
-- Filtros para la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD CONSTRAINT `fk_dc_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  ADD CONSTRAINT `fk_dc_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  ADD CONSTRAINT `fk_dc_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `fk_dv_conversion` FOREIGN KEY (`id_conversion`) REFERENCES `conversion_unidad` (`id_conversion`),
  ADD CONSTRAINT `fk_dv_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  ADD CONSTRAINT `fk_dv_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `fk_dv_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);

--
-- Filtros para la tabla `lote`
--
ALTER TABLE `lote`
  ADD CONSTRAINT `fk_lote_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `fk_lote_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Filtros para la tabla `marca`
--
ALTER TABLE `marca`
  ADD CONSTRAINT `fk_marca_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `movimiento`
--
ALTER TABLE `movimiento`
  ADD CONSTRAINT `movimiento_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_movimiento` (`id_categoria`),
  ADD CONSTRAINT `movimiento_ibfk_2` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `movimiento_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `movimiento_almacen`
--
ALTER TABLE `movimiento_almacen`
  ADD CONSTRAINT `fk_mov_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  ADD CONSTRAINT `fk_mov_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `pago_compra`
--
ALTER TABLE `pago_compra`
  ADD CONSTRAINT `fk_pc_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `pago_suscripcion`
--
ALTER TABLE `pago_suscripcion`
  ADD CONSTRAINT `fk_pago_sus` FOREIGN KEY (`id_suscripcion`) REFERENCES `suscripcion` (`id_suscripcion`);

--
-- Filtros para la tabla `pago_venta`
--
ALTER TABLE `pago_venta`
  ADD CONSTRAINT `fk_pv_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `fk_pv_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_pro_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  ADD CONSTRAINT `fk_prod_clasificacion` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificacion_producto` (`id_clasificacion`),
  ADD CONSTRAINT `fk_prod_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  ADD CONSTRAINT `fk_prod_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_medida` (`id_unidad`);

--
-- Filtros para la tabla `producto_fraccion`
--
ALTER TABLE `producto_fraccion`
  ADD CONSTRAINT `fk_pf_conversion` FOREIGN KEY (`id_conversion`) REFERENCES `conversion_unidad` (`id_conversion`),
  ADD CONSTRAINT `fk_pf_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD CONSTRAINT `fk_prov_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD CONSTRAINT `fk_suc_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `suscripcion`
--
ALTER TABLE `suscripcion`
  ADD CONSTRAINT `fk_sus_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  ADD CONSTRAINT `fk_sus_plan` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id_plan`);

--
-- Filtros para la tabla `traslado`
--
ALTER TABLE `traslado`
  ADD CONSTRAINT `fk_tras_lote` FOREIGN KEY (`id_lote_origen`) REFERENCES `lote` (`id_lote`),
  ADD CONSTRAINT `fk_tras_sucursal` FOREIGN KEY (`id_sucursal_dest`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `fk_tras_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `unidad_medida`
--
ALTER TABLE `unidad_medida`
  ADD CONSTRAINT `fk_unidad_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usu_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  ADD CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `fk_venta_apertura` FOREIGN KEY (`id_apertura`) REFERENCES `apertura_cierre_caja` (`id_apertura`),
  ADD CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `fk_venta_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
