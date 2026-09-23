-- Ejecutar este script una sola vez sobre la base de datos "sicac_v1"
-- Agrega las columnas necesarias para el módulo de recuperación de contraseña
USE sicac_v1;

ALTER TABLE usuario
    ADD COLUMN reset_code VARCHAR(255) NULL,
    ADD COLUMN reset_expira DATETIME NULL,
    ADD COLUMN reset_verificado TINYINT(1) NOT NULL DEFAULT 0;

-- reset_code: guarda el código de 6 dígitos ENCRIPTADO (con bcrypt), no en texto plano
-- reset_expira: fecha/hora límite en la que el código deja de ser válido (15 minutos después de generarse)
-- reset_verificado: bandera que indica si el usuario ya validó correctamente el código (0 = no, 1 = sí)
