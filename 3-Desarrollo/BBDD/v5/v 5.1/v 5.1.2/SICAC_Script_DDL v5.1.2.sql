CREATE DATABASE IF NOT EXISTS sicac_v1;

USE sicac_v1;

CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol VARCHAR(20) NOT NULL,
    CONSTRAINT uc_rol UNIQUE (rol)
) ENGINE=InnoDB;

CREATE TABLE tipo_documento (
    id INT AUTO_INCREMENT  PRIMARY KEY,
    sigla VARCHAR(10) NOT NULL,
    nombre_documento VARCHAR(50) NOT NULL,
    CONSTRAINT uc_sigla UNIQUE (sigla)
) ENGINE=InnoDB;

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL,
    CONSTRAINT uc_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_tipo_documento INT NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    email VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    numero_celular VARCHAR(15) NOT NULL,
    tipo_sangre VARCHAR(10) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    nombre_acudiente VARCHAR(100),
    documento_acudiente VARCHAR(50),
    estado_paciente VARCHAR(20) NOT NULL,
    CONSTRAINT uc_paciente UNIQUE (id_tipo_documento, numero_documento),
    CONSTRAINT uc_email UNIQUE (email),
    CONSTRAINT uc_usuario UNIQUE (id_usuario),
    CONSTRAINT fk_usuario_paciente FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_tipo_documento_paciente FOREIGN KEY (id_tipo_documento) REFERENCES tipo_documento(id)
	ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE medico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_tipo_documento INT NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    email VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    matricula_profesional VARCHAR(30) NOT NULL,
    numero_celular VARCHAR(15) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_medico VARCHAR(20) NOT NULL,
    CONSTRAINT uc_medico UNIQUE (id_tipo_documento, numero_documento),
    CONSTRAINT uc_email UNIQUE (email),
    CONSTRAINT uc_usuario UNIQUE (id_usuario),
    CONSTRAINT uc_licencia UNIQUE (matricula_profesional),
    CONSTRAINT fk_usuario_medico FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_tipo_documento_medico FOREIGN KEY (id_tipo_documento) REFERENCES tipo_documento(id)
	ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rol_usuario (
    id_rol INT,
    id_usuario INT,
    PRIMARY KEY (id_rol, id_usuario),
    CONSTRAINT fk_rol_usuario FOREIGN KEY (id_rol) REFERENCES rol(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_usuario) REFERENCES usuario(id)
	ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tipo_cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_cita VARCHAR(40) NOT NULL,
    CONSTRAINT uc_tipo_cita UNIQUE (tipo_cita)
) ENGINE=InnoDB;

CREATE TABLE cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_cita INT NOT NULL,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado_cita VARCHAR(20) NOT NULL,
    CONSTRAINT fk_tipo_cita FOREIGN KEY (id_tipo_cita) REFERENCES tipo_cita(id)
    ON UPDATE CASCADE,
    CONSTRAINT fk_paciente_cita FOREIGN KEY (id_paciente) REFERENCES paciente(id)
    ON UPDATE CASCADE,
    CONSTRAINT fk_medico_cita FOREIGN KEY (id_medico) REFERENCES medico(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE historial_medico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    antecedentes_medicos TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uc_paciente UNIQUE (id_paciente),
    CONSTRAINT fk_paciente_historial_medico FOREIGN KEY (id_paciente) REFERENCES paciente(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tipo_diagnostico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_diagnostico VARCHAR(40) NOT NULL,
    descripcion TEXT NOT NULL,
    CONSTRAINT uc_diagnostico UNIQUE (nombre_diagnostico)
) ENGINE=InnoDB;

CREATE TABLE tipo_medicamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_medicamento VARCHAR(40) NOT NULL,
    CONSTRAINT uc_categoria UNIQUE (categoria_medicamento)
) ENGINE=InnoDB;

CREATE TABLE medicamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_medicamento INT NOT NULL,
    nombre_medicamento VARCHAR(40) NOT NULL,
    CONSTRAINT uc_medicamento UNIQUE (nombre_medicamento),
    CONSTRAINT fk_tipo_medicamento FOREIGN KEY (id_tipo_medicamento) REFERENCES tipo_medicamento(id)
) ENGINE=InnoDB;

CREATE TABLE diagnostico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL,
    id_tipo_diagnostico INT NOT NULL,
    motivo TEXT NOT NULL,
    observaciones TEXT NOT NULL,
    tratamiento_sugerido TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uc_cita UNIQUE (id_cita),
    CONSTRAINT fk_cita_diagnostico FOREIGN KEY (id_cita) REFERENCES cita(id),
    CONSTRAINT fk_tipo_diagnostico FOREIGN KEY (id_tipo_diagnostico) REFERENCES tipo_diagnostico(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE diagnostico_medicamento (
    id_diagnostico INT,
    id_medicamento INT,
    fecha_medicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_medicacion VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_diagnostico, id_medicamento),
    CONSTRAINT fk_diagnostico_medicamento FOREIGN KEY (id_diagnostico) REFERENCES diagnostico(id)
    ON UPDATE CASCADE,
    CONSTRAINT fk_medicamento_diagnostico FOREIGN KEY (id_medicamento) REFERENCES medicamento(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tipo_servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_servicio VARCHAR(40) NOT NULL,
    descripcion TEXT NOT NULL,
    precio_actual DECIMAL(10, 2) NOT NULL,
    CONSTRAINT uc_servicio UNIQUE (tipo_servicio)
) ENGINE=InnoDB;

CREATE TABLE servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_servicio INT NOT NULL,
    id_diagnostico INT NOT NULL,
    nombre_servicio VARCHAR(40) NOT NULL,
    procedimiento TEXT NOT NULL,
    precio_aplicado DECIMAL(10, 2) NOT NULL,
    fecha_servicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tipo_servicio FOREIGN KEY (id_tipo_servicio) REFERENCES tipo_servicio(id)
    ON UPDATE CASCADE,
    CONSTRAINT fk_diagnostico_servicio FOREIGN KEY (id_diagnostico) REFERENCES diagnostico(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE mapa_dental (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial_medico INT NOT NULL,
    nombre_estandar VARCHAR(40) NOT NULL,
    observacion_inicial TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_mapa_dental VARCHAR(20) NOT NULL,
    CONSTRAINT fk_historial_mapa_dental FOREIGN KEY (id_historial_medico) REFERENCES historial_medico(id)
) ENGINE=InnoDB;

CREATE TABLE pieza_dental (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_mapa INT NOT NULL,
    nomenclatura_fdi VARCHAR(10) NOT NULL,
    cuadrante INT NOT NULL,
    posicion INT NOT NULL,
    estado_inicial VARCHAR(40),
    estado_actual VARCHAR(30),
    CONSTRAINT uc_pieza_dental UNIQUE (id_mapa, nomenclatura_fdi),
    CONSTRAINT fk_mapa_pieza_dental FOREIGN KEY (id_mapa) REFERENCES mapa_dental(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE metodo_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_metodo VARCHAR(40) NOT NULL,
    CONSTRAINT uc_metodo_pago UNIQUE (nombre_metodo)
) ENGINE=InnoDB;

CREATE TABLE pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL,
    id_metodo_pago INT NOT NULL,
    numero_pago VARCHAR(50) NOT NULL,
    fecha_pago DATE NOT NULL,
    monto_pagado DECIMAL(10, 2) NOT NULL,
    estado_pago VARCHAR(20),
    CONSTRAINT uc_pago UNIQUE (numero_pago),
    CONSTRAINT fk_metodo_pago FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cita_pago FOREIGN KEY (id_cita) REFERENCES cita(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB; 