

CREATE TABLE tipo_documento(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    sigla               varchar(10)     NOT NULL,
    nombre_documento    varchar(50)     NOT NULL,
    estado              varchar(40)     NOT NULL,
    CONSTRAINT pk_tipo_documento PRIMARY KEY (id)
);


CREATE TABLE autorizacion(
    rol varchar(20) NOT NULL,
    CONSTRAINT pk_autorizacion_cliente PRIMARY KEY (rol)
);


CREATE TABLE servicio(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    nombre          varchar(60)     NOT NULL,
    descripcion     varchar(1000)   NOT NULL,
    precio_actual   decimal(10,2)   NOT NULL,
    duracion        time(0)         NOT NULL,
    CONSTRAINT pk_servicio  PRIMARY KEY (id),
    CONSTRAINT uc_servicio  UNIQUE (nombre)
);


CREATE TABLE metodo_pago(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    nombre_metodo   varchar(40)     NOT NULL,
    CONSTRAINT pk_metodo_pago PRIMARY KEY (id)
);


CREATE TABLE alergia(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    nombre_alergia  varchar(60)     NOT NULL,
    CONSTRAINT pk_alergia   PRIMARY KEY (id),
    CONSTRAINT uc_alergia   UNIQUE (nombre_alergia)
);


CREATE TABLE enfermedad_sistemica(
    id                      integer         GENERATED ALWAYS AS IDENTITY,
    nombre_enfermedad       varchar(60)     NOT NULL,
    descripcion_enfermedad  varchar(200)    NOT NULL,
    CONSTRAINT pk_enfermedad_sistemica  PRIMARY KEY (id),
    CONSTRAINT uc_enfermedad            UNIQUE (nombre_enfermedad)
);


CREATE TABLE cirugia_previa(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    tipo_cirugia    varchar(50)     NOT NULL,
    nombre_cirugia  varchar(60)     NOT NULL,
    CONSTRAINT pk_cirugia_previa    PRIMARY KEY (id),
    CONSTRAINT uc_cirugia           UNIQUE (tipo_cirugia, nombre_cirugia)
);


CREATE TABLE medicamento(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    nombre_medicamento  varchar(60)     NOT NULL,
    tipo_medicamento    varchar(50)     NOT NULL,
    CONSTRAINT pk_medicamento   PRIMARY KEY (id),
    CONSTRAINT uc_medicamento   UNIQUE (nombre_medicamento, tipo_medicamento)
);


CREATE TABLE cliente(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    id_tipo_documento   integer         NOT NULL,
    numero_documento    varchar(50)     NOT NULL,
    email               varchar(254)    NOT NULL,
    password            varchar(60)     NOT NULL,
    fecha_nacimiento    date            NOT NULL,
    primer_nombre       varchar(50)     NOT NULL,
    segundo_nombre      varchar(50),
    primer_apellido     varchar(50)     NOT NULL,
    segundo_apellido    varchar(50),
    numero_celular      varchar(15)     NOT NULL,
    tipo_sangre         varchar(10)     NOT NULL,
    nombre_acudiente    varchar(100),
    documento_acudiente varchar(50),
    CONSTRAINT pk_cliente       PRIMARY KEY (id),
    CONSTRAINT uc_cliente       UNIQUE (id_tipo_documento, numero_documento),
    CONSTRAINT uc_email         UNIQUE (email),
    CONSTRAINT fk_tipo_documento_cliente
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipo_documento (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE autorizacion_cliente(
    rol         varchar(20)     NOT NULL,
    id_cliente  integer         NOT NULL,
    CONSTRAINT pk_autorizacion_cliente_compuesta PRIMARY KEY (rol, id_cliente),
    CONSTRAINT fk_autorizacion_cliente
        FOREIGN KEY (rol)
        REFERENCES autorizacion (rol)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cliente_autorizacion
        FOREIGN KEY (id_cliente)
        REFERENCES cliente (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE administrador(
    id          integer GENERATED ALWAYS AS IDENTITY,
    id_cliente  integer NOT NULL,
    CONSTRAINT pk_administrador PRIMARY KEY (id),
    CONSTRAINT fk_cliente_administrador
        FOREIGN KEY (id_cliente)
        REFERENCES cliente (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE odontologo(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    id_cliente          integer         NOT NULL,
    estado_odontologo   varchar(40)     NOT NULL,
    fecha_registro      date            NOT NULL,
    especializacion     varchar(40)     NOT NULL,
    CONSTRAINT pk_odontologo PRIMARY KEY (id),
    CONSTRAINT fk_cliente_odontologo
        FOREIGN KEY (id_cliente)
        REFERENCES cliente (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE paciente(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    id_cliente      integer         NOT NULL,
    fecha_registro  date            NOT NULL,
    estado_paciente varchar(40)     NOT NULL,
    CONSTRAINT pk_paciente PRIMARY KEY (id),
    CONSTRAINT fk_cliente_paciente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE mapa_dental(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    fecha_registro  date            NOT NULL,
    nombre_estandar varchar(60)     NOT NULL,
    estado          varchar(40)     NOT NULL,
    observacion     varchar(1000)   NOT NULL,
    CONSTRAINT pk_mapa_dental PRIMARY KEY (id)
);


CREATE TABLE pieza_dental(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    id_mapa             integer         NOT NULL,
    cuadrante           integer         NOT NULL,
    posicion            integer         NOT NULL,
    nomenclatura_fdi    varchar(10)     NOT NULL,
    estado_pieza        varchar(40)     NOT NULL,
    CONSTRAINT pk_pieza_dental  PRIMARY KEY (id),
    CONSTRAINT uc_pieza_dental  UNIQUE (id_mapa, nomenclatura_fdi),
    CONSTRAINT fk_mapa_diente
        FOREIGN KEY (id_mapa)
        REFERENCES mapa_dental (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE historial_medico(
    id              integer GENERATED ALWAYS AS IDENTITY,
    id_paciente     integer NOT NULL,
    id_mapa_dental  integer NOT NULL,
    CONSTRAINT pk_historial_medico  PRIMARY KEY (id),
    CONSTRAINT uc_historial_medico  UNIQUE (id_paciente, id_mapa_dental),
    CONSTRAINT fk_paciente_historial
        FOREIGN KEY (id_paciente)
        REFERENCES paciente (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mapa_dental_historial
        FOREIGN KEY (id_mapa_dental)
        REFERENCES mapa_dental (id)
        ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE cita(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    id_historial_medico integer         NOT NULL,
    id_odontologo       integer         NOT NULL,
    fecha_cita          date            NOT NULL,
    hora_inicio         time(0)         NOT NULL,
    hora_fin            time(0)         NOT NULL,
    estado_cita         varchar(40)     NOT NULL,
    CONSTRAINT pk_cita PRIMARY KEY (id),
    CONSTRAINT fk_odontologo_cita
        FOREIGN KEY (id_odontologo)
        REFERENCES odontologo (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_medico_cita
        FOREIGN KEY (id_historial_medico)
        REFERENCES historial_medico (id)
        ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE pago(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    id_cita         integer         NOT NULL,
    numero_pago     varchar(50)     NOT NULL,
    id_metodo_pago  integer         NOT NULL,
    fecha_pago      date            NOT NULL,
    monto_pago      decimal(10,2)   NOT NULL,
    estado_pago     varchar(40)     NOT NULL,
    CONSTRAINT pk_pago PRIMARY KEY (id),
    CONSTRAINT uc_pago  UNIQUE (numero_pago),
    CONSTRAINT fk_cita_pago
        FOREIGN KEY (id_cita)
        REFERENCES cita (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_metodo_pago
        FOREIGN KEY (id_metodo_pago)
        REFERENCES metodo_pago (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);


CREATE TABLE tratamiento(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    id_cita         integer         NOT NULL,
    id_servicio     integer         NOT NULL,
    id_pieza_dental integer,
    cara_afectada   varchar(40),
    procedimiento   varchar(1000),
    estado          varchar(40)     NOT NULL,
    precio_aplicado decimal(10,2)   NOT NULL,
    CONSTRAINT pk_tratamiento PRIMARY KEY (id),
    CONSTRAINT fk_cita_tratamiento
        FOREIGN KEY (id_cita)
        REFERENCES cita (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_servicio_tratamiento
        FOREIGN KEY (id_servicio)
        REFERENCES servicio (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pieza_dental_tratamiento
        FOREIGN KEY (id_pieza_dental)
        REFERENCES pieza_dental (id)
        ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE historial_alergia(
    id_historial_medico integer         NOT NULL,
    id_alergia          integer         NOT NULL,
    nivel_alergia       varchar(20)     NOT NULL,
    estado_alergia      varchar(40)     NOT NULL,
    CONSTRAINT pk_historial_alergia PRIMARY KEY (id_historial_medico, id_alergia),
    CONSTRAINT fk_historial_medico_alergia
        FOREIGN KEY (id_historial_medico)
        REFERENCES historial_medico (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_alergia
        FOREIGN KEY (id_alergia)
        REFERENCES alergia (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE historial_enfermedad(
    id_historial_medico     integer     NOT NULL,
    id_enfermedad_sistemica integer     NOT NULL,
    estado_enfermedad       varchar(40) NOT NULL,
    fecha_diagnostico       date        NOT NULL,
    CONSTRAINT pk_historial_enfermedad PRIMARY KEY (id_historial_medico, id_enfermedad_sistemica),
    CONSTRAINT fk_historial_medico_enfermedad
        FOREIGN KEY (id_historial_medico)
        REFERENCES historial_medico (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_enfermedad
        FOREIGN KEY (id_enfermedad_sistemica)
        REFERENCES enfermedad_sistemica (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE historial_medicamento(
    id_historial_medico integer         NOT NULL,
    id_medicamento      integer         NOT NULL,
    fecha_medicacion    date            NOT NULL,
    estado_medicacion   varchar(40)     NOT NULL,
    CONSTRAINT pk_historial_medicamento PRIMARY KEY (id_historial_medico, id_medicamento),
    CONSTRAINT fk_historial_medico_medicamento
        FOREIGN KEY (id_historial_medico)
        REFERENCES historial_medico (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_medicamento
        FOREIGN KEY (id_medicamento)
        REFERENCES medicamento (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE historial_cirugia(
    id_historial_medico integer         NOT NULL,
    id_cirugia_previa   integer         NOT NULL,
    fecha_cirugia       date            NOT NULL,
    efectos_secundarios varchar(200),
    estado_cirugia      varchar(40)     NOT NULL,
    CONSTRAINT pk_historial_cirugia PRIMARY KEY (id_historial_medico, id_cirugia_previa),
    CONSTRAINT fk_historial_medico_cirugia
        FOREIGN KEY (id_historial_medico)
        REFERENCES historial_medico (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_cirugia
        FOREIGN KEY (id_cirugia_previa)
        REFERENCES cirugia_previa (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- ============================================================
--  DML — INSERCIÓN DE DATOS
-- ============================================================

-- Tabla Tipo Documento
INSERT INTO tipo_documento (sigla, nombre_documento, estado) VALUES
('CC', 'Cedula de Ciudadania',  'activo'),
('TI', 'Tarjeta de Identidad',  'activo'),
('CE', 'Cedula de Extranjeria', 'activo');


-- Tabla Autorizacion
INSERT INTO autorizacion (rol) VALUES
('administrador'), ('odontologo'), ('paciente');


/*
Se deja Consulta General en 0.00 puesto que no se cobrará por la validación inicial.
duracion → time(0)
*/
-- Tabla Servicio
INSERT INTO servicio (nombre, descripcion, precio_actual, duracion) VALUES
('Consulta General',     'Valoración inicial y diagnóstico del paciente',        0.00,      '00:30:00'),
('Limpieza Dental',      'Profilaxis y eliminación de placa bacteriana',          80000.00,  '00:45:00'),
('Resina Dental',        'Restauración estética por caries',                     120000.00, '00:45:00'),
('Extracción Simple',    'Extracción de pieza dental sin cirugía',                90000.00,  '00:30:00'),
('Endodoncia',           'Tratamiento de conducto en diente afectado',           250000.00, '01:00:00'),
('Ortodoncia Control',   'Ajuste y control de brackets',                          70000.00,  '00:30:00'),
('Blanqueamiento Dental','Procedimiento estético para aclarar dientes',          180000.00, '01:00:00'),
('Sellantes',            'Aplicación de sellantes en molares',                    60000.00,  '00:30:00'),
('Radiografía Dental',   'Imagen diagnóstica de piezas dentales',                 40000.00,  '00:20:00'),
('Tratamiento de Encías','Manejo de gingivitis o periodontitis leve',            110000.00, '00:45:00');


-- Tabla Metodo Pago
INSERT INTO metodo_pago (nombre_metodo) VALUES
('Efectivo'), ('Daviplata'), ('Nequi');


-- Tabla Alergia
INSERT INTO alergia (nombre_alergia) VALUES
('Penicilina'), ('Anestesia'), ('Látex'), ('Ibuprofeno');


-- Tabla Enfermedad Sistemica
INSERT INTO enfermedad_sistemica (nombre_enfermedad, descripcion_enfermedad) VALUES
('Diabetes',       'Enfermedad metabólica crónica'),
('Hipertensión',   'Presión arterial elevada'),
('Asma',           'Enfermedad respiratoria'),
('Hipotiroidismo', 'Trastorno hormonal');


-- Tabla Cirugia Previa
INSERT INTO cirugia_previa (tipo_cirugia, nombre_cirugia) VALUES
('Oral',          'Extracción de cordales'),
('Oral',          'Cirugía periodontal'),
('Maxilofacial',  'Cirugía ortognática'),
('Oral',          'Implante dental'),
('General',       'Apendicectomía');


-- Tabla Medicamento
INSERT INTO medicamento (nombre_medicamento, tipo_medicamento) VALUES
('Ibuprofeno',   'Analgésico'),
('Amoxicilina',  'Antibiótico'),
('Paracetamol',  'Analgésico'),
('Diclofenaco',  'Antiinflamatorio'),
('Ketorolaco',   'Analgésico'),
('Azitromicina', 'Antibiótico');


-- Tabla Cliente
INSERT INTO cliente (id_tipo_documento, numero_documento, email, password, fecha_nacimiento,
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    numero_celular, tipo_sangre, nombre_acudiente, documento_acudiente) VALUES
(1, '1233504140', 'andrejur055@gmail.com',      'encriptaraqui01', '1999-02-09', 'Jeison',    'Andrey',    'Sosa',      'Espitia',  '3203720455', 'O+',  NULL, NULL),
(2, '1023456789', 'laura.martinez@gmail.com',   'clave01',         '2005-07-12', 'Laura',     'Sofía',     'Martínez',  'Gómez',    '3114567890', 'A+',  NULL, NULL),
(1, '798456123',  'carlos.ruiz@gmail.com',      'clave02',         '1988-11-23', 'Carlos',    'Andrés',    'Ruiz',      'Pérez',    '3001234567', 'B+',  NULL, NULL),
(3, '456789123',  'maria.lopez@gmail.com',      'clave03',         '1995-03-30', 'María',     NULL,        'López',     'Ramírez',  '3209876543', 'O-',  NULL, NULL),
(1, '1547896320', 'juan.castro@gmail.com',      'clave04',         '1992-09-15', 'Juan',      'David',     'Castro',    NULL,       '3102345678', 'AB+', NULL, NULL),
(2, '1122334455', 'sofia.torres@gmail.com',     'clave05',         '2008-01-20', 'Sofía',     'Alejandra', 'Torres',    'Vargas',   '3156789012', 'A-',  NULL, NULL),
(1, '987654321',  'andres.moreno@gmail.com',    'clave06',         '1985-06-10', 'Andrés',    NULL,        'Moreno',    'Rojas',    '3008765432', 'O+',  NULL, NULL),
(3, '321654987',  'luis.garcia@gmail.com',      'clave07',         '1990-12-05', 'Luis',      'Alberto',   'García',    'Jiménez',  '3193456789', 'B-',  NULL, NULL),
(1, '741852963',  'paula.restrepo@gmail.com',   'clave08',         '1998-04-18', 'Paula',     'Andrea',    'Restrepo',  'Cano',     '3125678901', 'AB-', NULL, NULL),
(2, '159357486',  'diego.herrera@gmail.com',    'clave09',         '2006-08-27', 'Diego',     NULL,        'Herrera',   'Ortiz',    '3147890123', 'O+',  NULL, NULL),
(1, '753951456',  'valentina.suarez@gmail.com', 'clave10',         '2000-10-09', 'Valentina', 'Lucía',     'Suárez',    'Mendoza',  '3168901234', 'A+',  NULL, NULL),
(1, '753951454',  'valentina.sandoval@gmail.com','clave11',        '2000-10-08', 'Valentina', 'Lucía',     'Sandoval',  'Meza',     '3168901235', 'A+',  NULL, NULL);


-- Tabla Autorizacion_Cliente
INSERT INTO autorizacion_cliente (rol, id_cliente) VALUES
('administrador', 1),  ('paciente',    2),
('paciente',      6),  ('paciente',    1),
('odontologo',    9),  ('paciente',    4),
('paciente',      7),  ('paciente',   10),
('odontologo',    3),  ('paciente',    5),
('paciente',      8),  ('paciente',   11);


-- Tabla Administrador
INSERT INTO administrador (id_cliente) VALUES (1);


-- Tabla Odontologo
INSERT INTO odontologo (id_cliente, estado_odontologo, fecha_registro, especializacion) VALUES
(9, 'activo', '2026-04-13', 'Odontologia General'),
(3, 'activo', '2026-04-13', 'Ortodoncia');


-- Tabla Paciente
INSERT INTO paciente (id_cliente, fecha_registro, estado_paciente) VALUES
(2,  '2026-04-14', 'activo'),
(6,  '2026-04-14', 'activo'),
(1,  '2026-04-14', 'activo'),
(4,  '2026-04-14', 'activo'),
(7,  '2026-04-14', 'activo'),
(10, '2026-04-14', 'activo'),
(5,  '2026-04-14', 'activo'),
(8,  '2026-04-14', 'activo'),
(11, '2026-04-14', 'activo');


-- Tabla Mapa Dental
INSERT INTO mapa_dental (fecha_registro, nombre_estandar, estado, observacion) VALUES
('2026-04-15', 'FDI', 'activo', 'Registro inicial sin hallazgos relevantes'),
('2026-04-15', 'FDI', 'activo', 'Presencia de caries en molares inferiores'),
('2026-04-15', 'FDI', 'activo', 'Paciente sin caries visibles'),
('2026-04-15', 'FDI', 'activo', 'Encías inflamadas, posible gingivitis'),
('2026-04-15', 'FDI', 'activo', 'Desgaste leve en piezas dentales posteriores'),
('2026-04-15', 'FDI', 'activo', 'Buena salud oral general'),
('2026-04-15', 'FDI', 'activo', 'Presencia de placa bacteriana'),
('2026-04-15', 'FDI', 'activo', 'Sangrado leve al sondaje'),
('2026-04-15', 'FDI', 'activo', 'Sensibilidad dental reportada en incisivos');


/*
Cuadrante: Indica la esquina de la boca donde está la pieza dental
  1: Superior Derecho  |  2: Superior Izquierdo
  3: Inferior Izquierdo|  4: Inferior Derecho

Posicion: Tipo de diente y su distancia desde la línea media hacia el fondo
  1: Incisivo Central | 2: Incisivo Lateral | 3: Canino (colmillo)
  4: Primer Premolar  | 5: Segundo Premolar  | 6: Primer Molar
  7: Segundo Molar    | 8: Tercer Molar (muela del juicio)

Nomenclatura FDI: unión del cuadrante y posición
  18,17,16 | 15,14 | 13 | 12,11 | 21,22 | 23 | 24,25 | 26,27,28
  48,47,46 | 45,44 | 43 | 42,41 | 31,32 | 33 | 34,35 | 36,37,38

Estados posibles de una pieza:
  Caries     → lesión presente
  Obturada   → tiene calza
  Sana       → sin problemas
  Endodoncia → en tratamiento
  Ausente    → pieza faltante
*/

-- Tabla Pieza Dental
INSERT INTO pieza_dental (id_mapa, cuadrante, posicion, nomenclatura_fdi, estado_pieza) VALUES
(2, 1, 1, '11', 'Sana'),      (2, 1, 2, '12', 'Sana'),
(2, 1, 3, '13', 'Sana'),      (2, 1, 4, '14', 'Obturada'),
(2, 1, 5, '15', 'Caries'),    (2, 1, 6, '16', 'Obturada'),
(2, 1, 7, '17', 'Sana'),      (2, 1, 8, '18', 'Ausente'),

(2, 2, 1, '21', 'Sana'),      (2, 2, 2, '22', 'Sana'),
(2, 2, 3, '23', 'Sana'),      (2, 2, 4, '24', 'Obturada'),
(2, 2, 5, '25', 'Sana'),      (2, 2, 6, '26', 'Caries'),
(2, 2, 7, '27', 'Obturada'),  (2, 2, 8, '28', 'Ausente'),

(2, 3, 1, '31', 'Sana'),      (2, 3, 2, '32', 'Sana'),
(2, 3, 3, '33', 'Sana'),      (2, 3, 4, '34', 'Obturada'),
(2, 3, 5, '35', 'Sana'),      (2, 3, 6, '36', 'Endodoncia'),
(2, 3, 7, '37', 'Obturada'),  (2, 3, 8, '38', 'Ausente'),

(2, 4, 1, '41', 'Sana'),      (2, 4, 2, '42', 'Sana'),
(2, 4, 3, '43', 'Sana'),      (2, 4, 4, '44', 'Obturada'),
(2, 4, 5, '45', 'Sana'),      (2, 4, 6, '46', 'Caries'),
(2, 4, 7, '47', 'Obturada'),  (2, 4, 8, '48', 'Ausente');


-- Tabla Historial Medico
INSERT INTO historial_medico (id_paciente, id_mapa_dental) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9);


-- Tabla Cita
INSERT INTO cita (id_historial_medico, id_odontologo, fecha_cita, hora_inicio, hora_fin, estado_cita) VALUES
(1, 1, '2026-04-20', '09:45', '10:30', 'programada'),
(2, 2, '2026-04-20', '08:00', '08:45', 'programada'),
(3, 1, '2026-04-20', '08:00', '08:45', 'programada'),
(4, 2, '2026-04-20', '08:45', '09:30', 'programada'),
(5, 1, '2026-04-20', '08:45', '09:30', 'programada'),
(2, 1, '2026-04-21', '10:30', '11:15', 'programada'),
(6, 2, '2026-04-20', '09:30', '10:15', 'programada'),
(7, 1, '2026-04-20', '11:15', '12:00', 'programada'),
(8, 2, '2026-04-20', '10:15', '11:00', 'programada'),
(9, 1, '2026-04-20', '12:00', '12:45', 'programada');


-- Tabla Pago
INSERT INTO pago (id_cita, numero_pago, id_metodo_pago, fecha_pago, monto_pago, estado_pago) VALUES
(1,  'P-0001', 1, '2026-04-20',  0.00,      'pagado'),
(2,  'P-0002', 2, '2026-04-20',  80000.00,  'pagado'),
(3,  'P-0003', 3, '2026-04-20',  50000.00,  'pendiente'),
(4,  'P-0004', 1, '2026-04-20',  90000.00,  'pagado'),
(5,  'P-0005', 2, '2026-04-20', 100000.00,  'pendiente'),
(6,  'P-0006', 3, '2026-04-21',  70000.00,  'pagado'),
(7,  'P-0007', 1, '2026-04-20', 180000.00,  'pendiente'),
(8,  'P-0008', 2, '2026-04-20',  60000.00,  'pagado'),
(9,  'P-0009', 3, '2026-04-20',  50000.00,  'pendiente'),
(10, 'P-0010', 1, '2026-04-20', 120000.00,  'pagado');


/*
cara_afectada e id_pieza_dental pueden ser NULL cuando el tratamiento aplica de
forma general (ej.: blanqueamiento, limpieza, consulta).
Regla: si no hay id_pieza_dental → no hay cara_afectada
       si hay id_pieza_dental   → obligatoriamente hay cara_afectada
*/

14 → FDI 26 (cuad 2, pos 6)   id=22 → FDI 36 (cuad 3, pos 6)    id=30 → FDI 46
*/
-- Tabla Tratamiento
INSERT INTO tratamiento (id_cita, id_servicio, id_pieza_dental, cara_afectada, procedimiento, estado, precio_aplicado) VALUES
(1,  1,  NULL, NULL,        'Valoración general del paciente',      'finalizado',  0.00),
(2,  2,  NULL, NULL,        'Limpieza y profilaxis completa',        'finalizado',  80000.00),
(3,  3,  6,    'oclusal',   'Resina por caries en molar',            'en_proceso',  120000.00),  -- FDI 16
(4,  4,  8,    'oclusal',   'Extracción de cordal superior',         'programado',  90000.00),   -- FDI 18
(5,  5,  14,   'oclusal',   'Endodoncia en molar superior',          'en_proceso',  250000.00),  -- FDI 26
(6,  6,  NULL, NULL,        'Control y ajuste de ortodoncia',        'finalizado',  70000.00),
(7,  7,  NULL, NULL,        'Blanqueamiento dental',                 'programado',  180000.00),
(8,  8,  22,   'oclusal',   'Aplicación de sellante',                'finalizado',  60000.00),   -- FDI 36
(9,  10, NULL, NULL,        'Tratamiento de encías',                 'en_proceso',  110000.00),
(10, 3,  1,    'vestibular','Resina estética en incisivo',           'finalizado',  120000.00);  -- FDI 11



INSERT INTO historial_alergia (id_historial_medico, id_alergia, nivel_alergia, estado_alergia) VALUES
(1, 1, 'Alta',  'Activa'),
(2, 2, 'Media', 'Activa'),
(4, 3, 'Baja',  'Activa'),
(5, 4, 'Media', 'Activa');


INSERT INTO historial_enfermedad (id_historial_medico, id_enfermedad_sistemica, estado_enfermedad, fecha_diagnostico) VALUES
(1, 1, 'Controlada',     '2018-06-10'),
(2, 2, 'En tratamiento', '2020-09-12'),
(4, 3, 'Controlada',     '2015-03-08'),
(5, 4, 'En tratamiento', '2019-11-20');



INSERT INTO historial_medicamento (id_historial_medico, id_medicamento, fecha_medicacion, estado_medicacion) VALUES
(1, 1, '2026-04-10', 'Finalizado'),
(2, 2, '2026-04-11', 'En tratamiento'),
(3, 3, '2026-04-12', 'Finalizado'),
(4, 4, '2026-04-13', 'Suspendido'),
(5, 5, '2026-04-14', 'Finalizado'),
(6, 6, '2026-04-15', 'En tratamiento');



INSERT INTO historial_cirugia (id_historial_medico, id_cirugia_previa, fecha_cirugia, efectos_secundarios, estado_cirugia) VALUES
(1, 1, '2020-05-10', 'Inflamación leve',       'Recuperado'),
(2, 2, '2021-07-15', 'Sangrado moderado',       'Recuperado'),
(3, 3, '2019-03-20', NULL,                      'Recuperado'),
(4, 4, '2022-11-01', 'Dolor postoperatorio',    'En seguimiento'),
(5, 5, '2018-08-25', NULL,                      'Recuperado');
