-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-07-2026 a las 12:06:16
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `ci_nit` varchar(30) DEFAULT NULL,
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id_compra` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nro_factura` varchar(60) DEFAULT NULL,
  `fecha_compra` date NOT NULL,
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `estado` enum('PENDIENTE','CONFIRMADA','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
  `observaciones` text DEFAULT NULL,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','CREDITO','OTRO') NOT NULL DEFAULT 'EFECTIVO',
  `monto_pagado` decimal(14,2) NOT NULL DEFAULT 0.00,
  `fecha_vencimiento_credito` date DEFAULT NULL,
  `estado_credito` enum('PENDIENTE','PARCIAL','PAGADO') DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conversion_unidad`
--

CREATE TABLE `conversion_unidad` (
  `id_conversion` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `abreviatura` varchar(10) NOT NULL,
  `id_unidad_base` int(11) NOT NULL,
  `factor` decimal(10,4) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_lote` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_mezcla` int(11) DEFAULT NULL,
  `id_aplicacion` int(11) DEFAULT NULL,
  `tipo_cantidad` enum('CAJA','UNIDAD') NOT NULL DEFAULT 'UNIDAD',
  `id_conversion` int(11) DEFAULT NULL,
  `cantidad` decimal(14,4) NOT NULL DEFAULT 1.0000,
  `precio_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `descuento_monto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `stock_unidades` int(11) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--

CREATE TABLE `marca` (
  `id_marca` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `pais_origen` varchar(60) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento`
--

CREATE TABLE `movimiento` (
  `id_movimiento` int(11) NOT NULL,
  `tipo` enum('INGRESO','EGRESO') NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `fecha` date NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_almacen`
--

CREATE TABLE `movimiento_almacen` (
  `id_movimiento` int(11) NOT NULL,
  `id_lote` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo` enum('INGRESO','SALIDA','AJUSTE','TRASLADO_SALIDA','TRASLADO_ENTRADA','BAJA') NOT NULL,
  `motivo` varchar(100) DEFAULT NULL,
  `cantidad_cajas` int(11) NOT NULL DEFAULT 0,
  `cantidad_unidades` int(11) NOT NULL DEFAULT 0,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `referencia_id` int(11) DEFAULT NULL,
  `referencia_tipo` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset`
--

CREATE TABLE `password_reset` (
  `id_reset` int(11) NOT NULL,
  `tipo_cuenta` enum('usuario','super_admin') NOT NULL,
  `id_cuenta` int(11) NOT NULL,
  `codigo_hash` varchar(64) NOT NULL,
  `intentos` tinyint(4) NOT NULL DEFAULT 0,
  `reset_token_hash` varchar(64) DEFAULT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(131, 'creditos', 'reporte', 'creditos.reporte', 'Ver reporte de créditos (cuentas por cobrar y por pagar)'),
(132, 'conversiones', 'ver', 'conversiones.ver', 'Ver listado de conversiones de unidad'),
(133, 'conversiones', 'crear', 'conversiones.crear', 'Crear nuevas conversiones de unidad'),
(134, 'conversiones', 'editar', 'conversiones.editar', 'Editar conversiones de unidad existentes'),
(135, 'conversiones', 'eliminar', 'conversiones.eliminar', 'Eliminar conversiones de unidad'),
(136, 'almacen', 'importar', 'almacen.importar', 'Importar inventario masivo desde Excel'),
(137, 'mezclas', 'ver', 'mezclas.ver', 'Ver listado de mezclas/fórmulas'),
(138, 'mezclas', 'crear', 'mezclas.crear', 'Crear nuevas mezclas con su receta'),
(139, 'mezclas', 'editar', 'mezclas.editar', 'Editar receta de una mezcla'),
(140, 'mezclas', 'eliminar', 'mezclas.eliminar', 'Eliminar mezclas del sistema'),
(141, 'mezclas', 'activar', 'mezclas.activar', 'Activar o desactivar una mezcla'),
(142, 'mezclas', 'aplicar', 'mezclas.aplicar', 'Registrar una aplicación (descuenta stock de la sucursal)'),
(143, 'mezclas', 'ver_historial', 'mezclas.ver_historial', 'Ver historial de aplicaciones de mezclas');

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
(2, 'BASICO', 150.00, 1499.00, 1, 3, 50, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"roles\",\"proveedores\",\"compras\"]', 0, 1),
(3, 'ESTANDAR', 250.00, 2500.00, 3, 8, 0, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"reportes_basicos\",\"compras\",\"proveedores\",\"traslados\",\"libro_caja\",\"reportes_avanzados\",\"roles\"]', 0, 1),
(4, 'PREMIUM', 400.00, 4000.00, 0, 0, 0, '[\"ventas\",\"caja\",\"clientes\",\"inventario\",\"qr\",\"reportes_basicos\",\"compras\",\"proveedores\",\"traslados\",\"libro_caja\",\"reportes_avanzados\",\"roles\",\"soporte_prioritario\"]', 0, 1);

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
  `permite_fraccion` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_fraccion`
--

CREATE TABLE `producto_fraccion` (
  `id_prod_fraccion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_conversion` int(11) NOT NULL,
  `precio_mayor` decimal(12,2) NOT NULL DEFAULT 0.00,
  `precio_menor` decimal(12,2) NOT NULL DEFAULT 0.00,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `id_empresa` int(11) DEFAULT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permiso`
--

CREATE TABLE `rol_permiso` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `super_admin`
--

CREATE TABLE `super_admin` (
  `id_admin` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `correo_recuperacion` varchar(150) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `super_admin`
--

INSERT INTO `super_admin` (`id_admin`, `nombre`, `correo`, `contrasena`, `ultimo_acceso`, `activo`, `creado_en`) VALUES
(1, 'Administrador SIS-AGRO', 'admin@sisagro.bo', '$2b$10$ZzAFNZsaRVzKSS1sJvYc/ON1mj/cjjcvZ4UHoejornRq4NPk9.WVi', '2026-07-22 06:04:01', 1, '2026-06-19 13:38:39');

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
  `correo_recuperacion` varchar(150) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mezcla`
--

CREATE TABLE `mezcla` (
  `id_mezcla`     int(11)        NOT NULL,
  `id_empresa`    int(11)        NOT NULL,
  `nombre`        varchar(150)   NOT NULL,
  `descripcion`   text           DEFAULT NULL,
  `precio_mayor`  decimal(12,2)  NOT NULL DEFAULT 0.00,
  `precio_menor`  decimal(12,2)  NOT NULL DEFAULT 0.00,
  `activo`        tinyint(1)     NOT NULL DEFAULT 1,
  `creado_en`     datetime       NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mezcla_ingrediente`
--

CREATE TABLE `mezcla_ingrediente` (
  `id_ingrediente` int(11)        NOT NULL,
  `id_mezcla`      int(11)        NOT NULL,
  `id_producto`    int(11)        NOT NULL,
  `cantidad`       decimal(14,4)  NOT NULL,
  `id_unidad`      int(11)        NOT NULL,
  `observaciones`  varchar(200)   DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicacion_mezcla`
--

CREATE TABLE `aplicacion_mezcla` (
  `id_aplicacion`    int(11)       NOT NULL,
  `id_mezcla`        int(11)       NOT NULL,
  `id_sucursal`      int(11)       NOT NULL,
  `id_usuario`       int(11)       NOT NULL,
  `id_venta`         int(11)       DEFAULT NULL,
  `cantidad_tandas`  decimal(10,4) NOT NULL DEFAULT 1.0000,
  `fecha_aplicacion` datetime      NOT NULL DEFAULT current_timestamp(),
  `observaciones`    text          DEFAULT NULL,
  `anulada`          tinyint(1)    NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicacion_mezcla_detalle`
--

CREATE TABLE `aplicacion_mezcla_detalle` (
  `id_detalle`            int(11)       NOT NULL,
  `id_aplicacion`         int(11)       NOT NULL,
  `id_lote`               int(11)       NOT NULL,
  `id_producto`           int(11)       NOT NULL,
  `cantidad_descontada`   decimal(14,4) NOT NULL,
  `id_unidad`             int(11)       NOT NULL,
  `id_movimiento_almacen` int(11)       DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  ADD UNIQUE KEY `uq_nombre` (`nombre`,`id_empresa`),
  ADD KEY `fk_cat_empresa` (`id_empresa`);

--
-- Indices de la tabla `clasificacion_producto`
--
ALTER TABLE `clasificacion_producto`
  ADD PRIMARY KEY (`id_clasificacion`),
  ADD UNIQUE KEY `uq_clasificacion_nombre` (`nombre`,`id_empresa`),
  ADD KEY `fk_clasprod_empresa` (`id_empresa`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `uq_cliente_cinit` (`ci_nit`,`id_empresa`),
  ADD KEY `fk_cli_empresa` (`id_empresa`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `fk_compra_proveedor` (`id_proveedor`),
  ADD KEY `fk_compra_sucursal` (`id_sucursal`),
  ADD KEY `fk_compra_usuario` (`id_usuario`),
  ADD KEY `idx_compra_sucursal_fecha` (`id_sucursal`,`fecha_compra`);

--
-- Indices de la tabla `conversion_unidad`
--
ALTER TABLE `conversion_unidad`
  ADD PRIMARY KEY (`id_conversion`),
  ADD UNIQUE KEY `uq_conv_nombre` (`nombre`,`id_empresa`),
  ADD KEY `fk_conv_empresa` (`id_empresa`),
  ADD KEY `fk_conv_unidad_base` (`id_unidad_base`);

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
  ADD KEY `fk_dv_conversion` (`id_conversion`),
  ADD KEY `fk_dv_mezcla` (`id_mezcla`),
  ADD KEY `fk_dv_aplicacion` (`id_aplicacion`);

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
  ADD KEY `fk_lote_sucursal` (`id_sucursal`),
  ADD KEY `idx_lote_sucursal_vencimiento` (`id_sucursal`,`fecha_vencimiento`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`id_marca`),
  ADD UNIQUE KEY `uq_marca_nombre` (`nombre`,`id_empresa`),
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
  ADD KEY `fk_mov_usuario` (`id_usuario`),
  ADD KEY `idx_mov_referencia` (`referencia_tipo`,`referencia_id`),
  ADD KEY `idx_mov_sucursal_fecha` (`id_sucursal`,`fecha_movimiento`);

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
-- Indices de la tabla `password_reset`
--
ALTER TABLE `password_reset`
  ADD PRIMARY KEY (`id_reset`),
  ADD KEY `idx_pr_cuenta_vigente` (`tipo_cuenta`,`id_cuenta`,`usado`),
  ADD KEY `idx_pr_reset_token` (`reset_token_hash`);

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
  ADD KEY `fk_pf_conversion` (`id_conversion`),
  ADD KEY `fk_pf_producto` (`id_producto`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `uq_proveedor_nit` (`nit`,`id_empresa`),
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
  ADD UNIQUE KEY `uq_unidad_abreviatura` (`abreviatura`,`id_empresa`),
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
  ADD KEY `fk_venta_apertura` (`id_apertura`),
  ADD KEY `idx_venta_sucursal_fecha` (`id_sucursal`,`fecha_venta`);

--
-- Indices de la tabla `mezcla`
--
ALTER TABLE `mezcla`
  ADD PRIMARY KEY (`id_mezcla`),
  ADD UNIQUE KEY `uq_mezcla_nombre` (`nombre`,`id_empresa`),
  ADD KEY `fk_mezcla_empresa` (`id_empresa`);

--
-- Indices de la tabla `mezcla_ingrediente`
--
ALTER TABLE `mezcla_ingrediente`
  ADD PRIMARY KEY (`id_ingrediente`),
  ADD UNIQUE KEY `uq_mezcla_prod` (`id_mezcla`,`id_producto`),
  ADD KEY `fk_mi_mezcla` (`id_mezcla`),
  ADD KEY `fk_mi_producto` (`id_producto`),
  ADD KEY `fk_mi_unidad` (`id_unidad`);

--
-- Indices de la tabla `aplicacion_mezcla`
--
ALTER TABLE `aplicacion_mezcla`
  ADD PRIMARY KEY (`id_aplicacion`),
  ADD KEY `fk_am_mezcla` (`id_mezcla`),
  ADD KEY `fk_am_sucursal` (`id_sucursal`),
  ADD KEY `fk_am_usuario` (`id_usuario`),
  ADD KEY `fk_am_venta` (`id_venta`);

--
-- Indices de la tabla `aplicacion_mezcla_detalle`
--
ALTER TABLE `aplicacion_mezcla_detalle`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_amd_aplicacion` (`id_aplicacion`),
  ADD KEY `fk_amd_lote` (`id_lote`),
  ADD KEY `fk_amd_producto` (`id_producto`),
  ADD KEY `fk_amd_unidad` (`id_unidad`),
  ADD KEY `fk_amd_movalmacen` (`id_movimiento_almacen`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `apertura_cierre_caja`
--
ALTER TABLE `apertura_cierre_caja`
  MODIFY `id_apertura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `caja`
--
ALTER TABLE `caja`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoria_movimiento`
--
ALTER TABLE `categoria_movimiento`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clasificacion_producto`
--
ALTER TABLE `clasificacion_producto`
  MODIFY `id_clasificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `conversion_unidad`
--
ALTER TABLE `conversion_unidad`
  MODIFY `id_conversion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  MODIFY `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `id_empresa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lote`
--
ALTER TABLE `lote`
  MODIFY `id_lote` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimiento`
--
ALTER TABLE `movimiento`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimiento_almacen`
--
ALTER TABLE `movimiento_almacen`
  MODIFY `id_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago_compra`
--
ALTER TABLE `pago_compra`
  MODIFY `id_pago_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago_suscripcion`
--
ALTER TABLE `pago_suscripcion`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago_venta`
--
ALTER TABLE `pago_venta`
  MODIFY `id_pago_venta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `password_reset`
--
ALTER TABLE `password_reset`
  MODIFY `id_reset` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permiso`
--
ALTER TABLE `permiso`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT de la tabla `plan`
--
ALTER TABLE `plan`
  MODIFY `id_plan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto_fraccion`
--
ALTER TABLE `producto_fraccion`
  MODIFY `id_prod_fraccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id_sucursal` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `super_admin`
--
ALTER TABLE `super_admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `suscripcion`
--
ALTER TABLE `suscripcion`
  MODIFY `id_suscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `traslado`
--
ALTER TABLE `traslado`
  MODIFY `id_traslado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `unidad_medida`
--
ALTER TABLE `unidad_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mezcla`
--
ALTER TABLE `mezcla`
  MODIFY `id_mezcla` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mezcla_ingrediente`
--
ALTER TABLE `mezcla_ingrediente`
  MODIFY `id_ingrediente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicacion_mezcla`
--
ALTER TABLE `aplicacion_mezcla`
  MODIFY `id_aplicacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicacion_mezcla_detalle`
--
ALTER TABLE `aplicacion_mezcla_detalle`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `fk_conv_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  ADD CONSTRAINT `fk_conv_unidad_base` FOREIGN KEY (`id_unidad_base`) REFERENCES `unidad_medida` (`id_unidad`);

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
  ADD CONSTRAINT `fk_dv_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  ADD CONSTRAINT `fk_dv_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  ADD CONSTRAINT `fk_dv_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla` (`id_aplicacion`);

--
-- Una línea de detalle_venta es O producto O mezcla, nunca ambos ni ninguno
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `chk_dv_producto_xor_mezcla` CHECK (
    (`id_producto` IS NOT NULL AND `id_mezcla` IS NULL) OR
    (`id_producto` IS NULL AND `id_mezcla` IS NOT NULL)
  );

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
  ADD CONSTRAINT `fk_pf_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

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

--
-- Filtros para la tabla `mezcla`
--
ALTER TABLE `mezcla`
  ADD CONSTRAINT `fk_mezcla_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`);

--
-- Filtros para la tabla `mezcla_ingrediente`
--
ALTER TABLE `mezcla_ingrediente`
  ADD CONSTRAINT `fk_mi_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  ADD CONSTRAINT `fk_mi_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `fk_mi_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_medida` (`id_unidad`);

--
-- Filtros para la tabla `aplicacion_mezcla`
--
ALTER TABLE `aplicacion_mezcla`
  ADD CONSTRAINT `fk_am_mezcla` FOREIGN KEY (`id_mezcla`) REFERENCES `mezcla` (`id_mezcla`),
  ADD CONSTRAINT `fk_am_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `fk_am_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `fk_am_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);

--
-- Filtros para la tabla `aplicacion_mezcla_detalle`
--
ALTER TABLE `aplicacion_mezcla_detalle`
  ADD CONSTRAINT `fk_amd_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `aplicacion_mezcla` (`id_aplicacion`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_amd_lote` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  ADD CONSTRAINT `fk_amd_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  ADD CONSTRAINT `fk_amd_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_medida` (`id_unidad`),
  ADD CONSTRAINT `fk_amd_movalmacen` FOREIGN KEY (`id_movimiento_almacen`) REFERENCES `movimiento_almacen` (`id_movimiento`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
