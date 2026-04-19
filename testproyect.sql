-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-04-2026 a las 23:45:14
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
-- Base de datos: `testproyect`
--

DELIMITER $$
--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `generar_hash_inventario` (`p_nombre` VARCHAR(200), `p_estado` VARCHAR(50), `p_categoria_id` INT, `p_responsable` VARCHAR(100)) RETURNS VARCHAR(64) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE v_concat TEXT;
    
    -- Concatenar las columnas importantes (SIN incluir el ID autoincremental)
    SET v_concat = CONCAT_WS('|',
        COALESCE(p_nombre, ''),
        COALESCE(p_estado, ''),
        COALESCE(p_categoria_id, ''),
        COALESCE(p_responsable, ''),
        NOW() -- Incluye timestamp para que sea único
    );
    
    -- Retornar SHA-256
    RETURN SHA2(v_concat, 256);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`) VALUES
(1, 'Electrónica'),
(3, 'Herramientas'),
(2, 'Mobiliario'),
(4, 'Software'),
(6, 'Test'),
(5, 'xyz');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial`
--

CREATE TABLE `historial` (
  `id` int(11) NOT NULL,
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `accion` enum('INSERT','UPDATE','DELETE','SCAN') NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `inventario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial`
--

INSERT INTO `historial` (`id`, `fecha_modificacion`, `accion`, `nombre_usuario`, `inventario_id`) VALUES
(1, '2026-04-02 04:27:35', 'INSERT', 'root@localhost', 1),
(2, '2026-04-02 04:27:35', 'INSERT', 'root@localhost', 2),
(3, '2026-04-02 04:27:35', 'INSERT', 'root@localhost', 3),
(4, '2026-04-02 04:27:35', 'INSERT', 'root@localhost', 4),
(5, '2026-04-02 04:27:35', 'INSERT', 'root@localhost', 5),
(6, '2026-04-02 04:52:45', 'INSERT', 'root@localhost', 6),
(7, '2026-04-02 04:52:45', 'INSERT', 'admin', 6),
(8, '2026-04-02 04:53:34', 'UPDATE', 'root@localhost', 1),
(9, '2026-04-02 04:53:34', 'UPDATE', 'admin', 1),
(10, '2026-04-02 04:54:19', 'DELETE', 'admin', 5),
(12, '2026-04-02 05:13:32', 'INSERT', 'root@localhost', 7),
(13, '2026-04-02 05:13:32', 'INSERT', 'system', 7),
(14, '2026-04-02 05:14:47', 'UPDATE', 'root@localhost', 1),
(15, '2026-04-02 05:14:47', 'UPDATE', 'system', 1),
(16, '2026-04-19 02:38:10', 'INSERT', 'root@localhost', 8),
(17, '2026-04-19 02:38:10', 'INSERT', 'admin', 8),
(18, '2026-04-19 02:38:46', 'INSERT', 'root@localhost', 9),
(19, '2026-04-19 02:38:46', 'INSERT', 'admin', 9),
(20, '2026-04-19 10:09:05', 'INSERT', 'root@localhost', 10),
(21, '2026-04-19 10:09:05', 'INSERT', 'admin', 10),
(22, '2026-04-19 10:11:26', 'INSERT', 'root@localhost', 11),
(23, '2026-04-19 10:11:26', 'INSERT', 'admin', 11),
(24, '2026-04-19 10:12:44', 'INSERT', 'root@localhost', 12),
(25, '2026-04-19 10:12:44', 'INSERT', 'admin', 12),
(26, '2026-04-19 21:08:01', 'SCAN', 'admin', 12),
(27, '2026-04-19 21:08:48', 'SCAN', 'admin', 10),
(28, '2026-04-19 21:10:29', 'SCAN', 'admin', 10),
(29, '2026-04-19 21:12:50', 'SCAN', 'admin', 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `estado` enum('activo','dado_baja','en_mantenimiento') DEFAULT 'activo',
  `categoria_id` int(11) NOT NULL,
  `responsable_nombre` varchar(100) NOT NULL,
  `hash_actual` varchar(64) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_ultima_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `nombre`, `estado`, `categoria_id`, `responsable_nombre`, `hash_actual`, `fecha_creacion`, `fecha_ultima_actualizacion`) VALUES
(1, 'Laptop HP Pro', 'activo', 1, 'maria', '5ca736d0c43076ede98b03d291bc42ef4efaad6b33bf8d35d65dae1f72719616', '2026-04-02 00:48:48', '2026-04-02 01:14:47'),
(2, 'Silla Ergonómica', 'activo', 2, 'Ana Martínez', '92d1c0eb21bfd7941aa336e827d132b46628cfb0f869aa4aab2964d5679094f5', '2026-04-02 00:48:48', '2026-04-02 00:48:48'),
(3, 'Taladro Percutor', 'en_mantenimiento', 3, 'Luis Fernández', '88287ccbf8affecfd79491dbbb61719e0aecad8668a6c92bbe4e61b307323e53', '2026-04-02 00:48:48', '2026-04-02 00:48:48'),
(4, 'Monitor 24 pulgadas', 'activo', 1, 'Carlos López', '7508d749b2f6ad6b7b80abc629020a9383f22875c914bc42d039d6165a0a1dcf', '2026-04-02 00:48:48', '2026-04-02 00:48:48'),
(5, 'Escritorio de oficina', 'activo', 2, 'María García', '375888c3ff59129b44597964ad91389dfa86c4c2809134e4211b22f6d1b343de', '2026-04-02 00:48:48', '2026-04-02 00:48:48'),
(6, 'Producto Test', 'activo', 1, 'Juan Pérez', 'a8e81b6aed024b740a2187579e06b425cd3600ea765c77c7d4a1c1cc5bbfda90', '2026-04-02 00:52:45', '2026-04-02 00:52:45'),
(7, 'Laptop HP', 'activo', 1, 'juan', '2a2a3c8b65163888dae054c16cae2ee8d463ee478bc50365277b7d5e3db6e647', '2026-04-02 01:13:32', '2026-04-02 01:13:32'),
(8, 'asd', 'activo', 5, 'Jose', '771a4b48fb348f48b481a90361e3d56a5d13836e6fb794494ca1fcdf889fae7e', '2026-04-18 22:38:10', '2026-04-18 22:38:10'),
(9, 'test', 'activo', 4, 'maria', 'cd2aabeae041b943c49a8c8a995ef049552d6f34186c1d28172449f8697d90f3', '2026-04-18 22:38:46', '2026-04-18 22:38:46'),
(10, 'Motorina', 'activo', 6, 'Pablito', 'a42ddd111eebf38838e3beaa3c5dd00bbfa8f12ff958831d648047ea66808dfd', '2026-04-19 06:09:05', '2026-04-19 06:09:05'),
(11, 'Switch ', 'en_mantenimiento', 1, 'Darwin ', '59443cd584c18909c267a6e526182eb2c1f31e7696bcd66500c9344e6232dba4', '2026-04-19 06:11:26', '2026-04-19 06:11:26'),
(12, 'Cubo Rubik ', 'en_mantenimiento', 6, 'juan', '94469e755eff4ee5b17b9a3c0cba9aee63328a91146a804bdee0cc6a2d51934d', '2026-04-19 06:12:44', '2026-04-19 06:12:44');

--
-- Disparadores `inventario`
--
DELIMITER $$
CREATE TRIGGER `tr_historial_delete` AFTER DELETE ON `inventario` FOR EACH ROW BEGIN
    INSERT INTO historial (accion, nombre_usuario, inventario_id)
    VALUES ('DELETE', CURRENT_USER(), OLD.id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_historial_insert` AFTER INSERT ON `inventario` FOR EACH ROW BEGIN
    INSERT INTO historial (accion, nombre_usuario, inventario_id)
    VALUES ('INSERT', CURRENT_USER(), NEW.id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_historial_update` AFTER UPDATE ON `inventario` FOR EACH ROW BEGIN
    INSERT INTO historial (accion, nombre_usuario, inventario_id)
    VALUES ('UPDATE', CURRENT_USER(), NEW.id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_inventario_hash_insert` BEFORE INSERT ON `inventario` FOR EACH ROW BEGIN
    SET NEW.hash_actual = generar_hash_inventario(
        NEW.nombre,
        NEW.estado,
        NEW.categoria_id,
        NEW.responsable_nombre
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_inventario_hash_update` BEFORE UPDATE ON `inventario` FOR EACH ROW BEGIN
    SET NEW.hash_actual = generar_hash_inventario(
        NEW.nombre,
        NEW.estado,
        NEW.categoria_id,
        NEW.responsable_nombre
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','editor','consultor') DEFAULT 'consultor',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_desactivacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `password`, `rol`, `activo`, `fecha_desactivacion`) VALUES
(1, 'admin', '$2b$10$uRkhm.HmK14DuRQsaCBt6.8D37F15ZInRkTNpQqh7H92EzpkVRkuW', 'admin', 1, NULL),
(2, 'juan', '$2b$10$uRkhm.HmK14DuRQsaCBt6.8D37F15ZInRkTNpQqh7H92EzpkVRkuW', 'editor', 1, NULL),
(3, 'maria', '$2b$10$uRkhm.HmK14DuRQsaCBt6.8D37F15ZInRkTNpQqh7H92EzpkVRkuW', 'consultor', 1, NULL),
(4, 'Jose', '$2b$10$GqBYEnhyBBR2wAgWbIWSx.XLb1kyo7766EJtJPECZilddFEOe9KNe', 'admin', 1, NULL),
(5, 'Pablito', '$2b$10$.V.yJG6n9qK.bGzHvIyv5uHkyR0vv4JJhWpDeEPGUr3QfCxBnGhIW', 'editor', 1, NULL),
(6, 'Darwin ', '$2b$10$YvC1Jk1VcHd872z4wOYwoODWI.Omy13ZaCVFYufa2tEwLgnCigpDW', 'consultor', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_dashboard_estadisticas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_dashboard_estadisticas` (
`total_productos` bigint(21)
,`total_categorias` bigint(21)
,`total_usuarios` bigint(21)
,`productos_activos` bigint(21)
,`en_mantenimiento` bigint(21)
,`cambios_hoy` bigint(21)
,`alertas_integridad` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_historial_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_historial_completo` (
`id` int(11)
,`fecha_modificacion` timestamp
,`accion` enum('INSERT','UPDATE','DELETE','SCAN')
,`nombre_usuario` varchar(100)
,`inventario_id` int(11)
,`producto_nombre` varchar(200)
,`producto_estado` enum('activo','dado_baja','en_mantenimiento')
,`categoria_nombre` varchar(100)
,`responsable_nombre` varchar(100)
,`fecha_formateada` varchar(24)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_integridad_comprometida`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_integridad_comprometida` (
`id` int(11)
,`nombre` varchar(200)
,`estado` enum('activo','dado_baja','en_mantenimiento')
,`categoria` varchar(100)
,`responsable_nombre` varchar(100)
,`hash_guardado` varchar(64)
,`hash_calculado` varchar(64)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_inventario_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_inventario_completo` (
`id` int(11)
,`producto_nombre` varchar(200)
,`estado` enum('activo','dado_baja','en_mantenimiento')
,`categoria_nombre` varchar(100)
,`categoria_id` int(11)
,`responsable_nombre` varchar(100)
,`hash_actual` varchar(64)
,`integridad_datos` varchar(8)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_resumen_categoria`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_resumen_categoria` (
`categoria_id` int(11)
,`categoria_nombre` varchar(100)
,`total_productos` bigint(21)
,`activos` decimal(22,0)
,`mantenimiento` decimal(22,0)
,`dados_baja` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_resumen_responsable`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_resumen_responsable` (
`responsable_nombre` varchar(100)
,`total_productos` bigint(21)
,`productos_activos` decimal(22,0)
,`en_mantenimiento` decimal(22,0)
,`dados_baja` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_ultimos_cambios`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_ultimos_cambios` (
`fecha_modificacion` timestamp
,`accion` enum('INSERT','UPDATE','DELETE','SCAN')
,`nombre_usuario` varchar(100)
,`producto` varchar(200)
,`responsable_nombre` varchar(100)
,`fecha_legible` varchar(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_usuarios_actividad`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_usuarios_actividad` (
`id` int(11)
,`nombre` varchar(100)
,`rol` enum('admin','editor','consultor')
,`total_cambios_realizados` bigint(21)
,`ultima_actividad` timestamp
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_dashboard_estadisticas`
--
DROP TABLE IF EXISTS `vista_dashboard_estadisticas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_dashboard_estadisticas`  AS SELECT (select count(0) from `inventario`) AS `total_productos`, (select count(0) from `categoria`) AS `total_categorias`, (select count(0) from `usuario`) AS `total_usuarios`, (select count(0) from `inventario` where `inventario`.`estado` = 'activo') AS `productos_activos`, (select count(0) from `inventario` where `inventario`.`estado` = 'en_mantenimiento') AS `en_mantenimiento`, (select count(0) from `historial` where cast(`historial`.`fecha_modificacion` as date) = curdate()) AS `cambios_hoy`, (select count(0) from `vista_integridad_comprometida`) AS `alertas_integridad` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_historial_completo`
--
DROP TABLE IF EXISTS `vista_historial_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_historial_completo`  AS SELECT `h`.`id` AS `id`, `h`.`fecha_modificacion` AS `fecha_modificacion`, `h`.`accion` AS `accion`, `h`.`nombre_usuario` AS `nombre_usuario`, `h`.`inventario_id` AS `inventario_id`, `i`.`nombre` AS `producto_nombre`, `i`.`estado` AS `producto_estado`, `c`.`nombre` AS `categoria_nombre`, `i`.`responsable_nombre` AS `responsable_nombre`, date_format(`h`.`fecha_modificacion`,'%d/%m/%Y %H:%i:%s') AS `fecha_formateada` FROM ((`historial` `h` join `inventario` `i` on(`h`.`inventario_id` = `i`.`id`)) join `categoria` `c` on(`i`.`categoria_id` = `c`.`id`)) ORDER BY `h`.`fecha_modificacion` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_integridad_comprometida`
--
DROP TABLE IF EXISTS `vista_integridad_comprometida`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_integridad_comprometida`  AS SELECT `i`.`id` AS `id`, `i`.`nombre` AS `nombre`, `i`.`estado` AS `estado`, `c`.`nombre` AS `categoria`, `i`.`responsable_nombre` AS `responsable_nombre`, `i`.`hash_actual` AS `hash_guardado`, `generar_hash_inventario`(`i`.`nombre`,`i`.`estado`,`i`.`categoria_id`,`i`.`responsable_nombre`) AS `hash_calculado` FROM (`inventario` `i` join `categoria` `c` on(`i`.`categoria_id` = `c`.`id`)) WHERE `i`.`hash_actual` <> `generar_hash_inventario`(`i`.`nombre`,`i`.`estado`,`i`.`categoria_id`,`i`.`responsable_nombre`) OR `i`.`hash_actual` is null ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_inventario_completo`
--
DROP TABLE IF EXISTS `vista_inventario_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_inventario_completo`  AS SELECT `i`.`id` AS `id`, `i`.`nombre` AS `producto_nombre`, `i`.`estado` AS `estado`, `c`.`nombre` AS `categoria_nombre`, `i`.`categoria_id` AS `categoria_id`, `i`.`responsable_nombre` AS `responsable_nombre`, `i`.`hash_actual` AS `hash_actual`, CASE WHEN `i`.`hash_actual` = `generar_hash_inventario`(`i`.`nombre`,`i`.`estado`,`i`.`categoria_id`,`i`.`responsable_nombre`) THEN 'válido' ELSE 'corrupto' END AS `integridad_datos` FROM (`inventario` `i` join `categoria` `c` on(`i`.`categoria_id` = `c`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_resumen_categoria`
--
DROP TABLE IF EXISTS `vista_resumen_categoria`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_resumen_categoria`  AS SELECT `c`.`id` AS `categoria_id`, `c`.`nombre` AS `categoria_nombre`, count(`i`.`id`) AS `total_productos`, sum(case when `i`.`estado` = 'activo' then 1 else 0 end) AS `activos`, sum(case when `i`.`estado` = 'en_mantenimiento' then 1 else 0 end) AS `mantenimiento`, sum(case when `i`.`estado` = 'dado_baja' then 1 else 0 end) AS `dados_baja` FROM (`categoria` `c` left join `inventario` `i` on(`c`.`id` = `i`.`categoria_id`)) GROUP BY `c`.`id`, `c`.`nombre` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_resumen_responsable`
--
DROP TABLE IF EXISTS `vista_resumen_responsable`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_resumen_responsable`  AS SELECT `inventario`.`responsable_nombre` AS `responsable_nombre`, count(0) AS `total_productos`, sum(case when `inventario`.`estado` = 'activo' then 1 else 0 end) AS `productos_activos`, sum(case when `inventario`.`estado` = 'en_mantenimiento' then 1 else 0 end) AS `en_mantenimiento`, sum(case when `inventario`.`estado` = 'dado_baja' then 1 else 0 end) AS `dados_baja` FROM `inventario` GROUP BY `inventario`.`responsable_nombre` ORDER BY count(0) DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_ultimos_cambios`
--
DROP TABLE IF EXISTS `vista_ultimos_cambios`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_ultimos_cambios`  AS SELECT `h`.`fecha_modificacion` AS `fecha_modificacion`, `h`.`accion` AS `accion`, `h`.`nombre_usuario` AS `nombre_usuario`, `i`.`nombre` AS `producto`, `i`.`responsable_nombre` AS `responsable_nombre`, date_format(`h`.`fecha_modificacion`,'%d/%m/%Y %H:%i') AS `fecha_legible` FROM (`historial` `h` join `inventario` `i` on(`h`.`inventario_id` = `i`.`id`)) ORDER BY `h`.`fecha_modificacion` DESC LIMIT 0, 20 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_usuarios_actividad`
--
DROP TABLE IF EXISTS `vista_usuarios_actividad`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_usuarios_actividad`  AS SELECT `u`.`id` AS `id`, `u`.`nombre` AS `nombre`, `u`.`rol` AS `rol`, count(`h`.`id`) AS `total_cambios_realizados`, max(`h`.`fecha_modificacion`) AS `ultima_actividad` FROM (`usuario` `u` left join `historial` `h` on(`u`.`nombre` = `h`.`nombre_usuario`)) GROUP BY `u`.`id`, `u`.`nombre`, `u`.`rol` ORDER BY count(`h`.`id`) DESC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `historial`
--
ALTER TABLE `historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventario_id` (`inventario_id`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `historial`
--
ALTER TABLE `historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `historial`
--
ALTER TABLE `historial`
  ADD CONSTRAINT `historial_ibfk_1` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
