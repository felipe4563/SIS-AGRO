-- bd/migracion_recuperacion_contrasena.sql
-- ============================================================
--  MIGRACIÓN: Recuperación de contraseña por código de correo
--  SIS-AGRO — usuario (empresa) y super_admin (panel admin)
-- ============================================================

ALTER TABLE `usuario`
  ADD COLUMN `correo_recuperacion` VARCHAR(150) NULL AFTER `correo`;

ALTER TABLE `super_admin`
  ADD COLUMN `correo_recuperacion` VARCHAR(150) NULL AFTER `correo`;

CREATE TABLE `password_reset` (
  `id_reset`         INT(11) NOT NULL AUTO_INCREMENT,
  `tipo_cuenta`      ENUM('usuario','super_admin') NOT NULL,
  `id_cuenta`        INT(11) NOT NULL,
  `codigo_hash`      VARCHAR(64) NOT NULL,
  `intentos`         TINYINT NOT NULL DEFAULT 0,
  `reset_token_hash` VARCHAR(64) DEFAULT NULL,
  `expira_en`        DATETIME NOT NULL,
  `usado`            TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reset`),
  KEY `idx_pr_cuenta_vigente` (`tipo_cuenta`, `id_cuenta`, `usado`),
  KEY `idx_pr_reset_token` (`reset_token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
