CREATE TABLE tipo_documento(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    sigla               varchar(10)     NOT NULL,
    nombre_documento    varchar(50)     NOT NULL,
    estado              varchar(40)     NOT NULL,
    CONSTRAINT pk_tipo_documento PRIMARY KEY (id)
);


CREATE TABLE autorizacion(
    rol varchar(20) NOT NULL,
    CONSTRAINT pk_autorizacion_usuario PRIMARY KEY (rol)
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


CREATE TABLE usuario(
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
	nombre_acudiente	varchar(100),
	documento_acudiente	varchar(50),
    CONSTRAINT pk_usuario       PRIMARY KEY (id),
    CONSTRAINT uc_usuario       UNIQUE (id_tipo_documento, numero_documento),
    CONSTRAINT uc_email         UNIQUE (email),
    CONSTRAINT fk_tipo_documento_usuario
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipo_documento (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE autorizacion_usuario(
    rol         varchar(20)     NOT NULL,
    id_usuario  integer         NOT NULL,
    CONSTRAINT pk_autorizacion_usuario_compuesta PRIMARY KEY (rol, id_usuario),
    CONSTRAINT fk_autorizacion_usuario
        FOREIGN KEY (rol)
        REFERENCES autorizacion (rol)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_autorizacion
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE administrador(
    id          integer GENERATED ALWAYS AS IDENTITY,
    id_usuario  integer NOT NULL,
    CONSTRAINT pk_administrador PRIMARY KEY (id),
    CONSTRAINT fk_usuario_administrador
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE odontologo(
    id                  integer         GENERATED ALWAYS AS IDENTITY,
    id_usuario          integer         NOT NULL,
    estado_odontologo   varchar(40)     NOT NULL,
    fecha_registro      date            NOT NULL,
    especializacion     varchar(40)     NOT NULL,
    CONSTRAINT pk_odontologo PRIMARY KEY (id),
    CONSTRAINT fk_usuario_odontologo
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE paciente(
    id              integer         GENERATED ALWAYS AS IDENTITY,
    id_usuario      integer         NOT NULL,
    fecha_registro  date            NOT NULL,
    estado_paciente varchar(40)     NOT NULL,
    CONSTRAINT pk_paciente PRIMARY KEY (id),
    CONSTRAINT fk_usuario_paciente
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id)
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
    id              	integer         GENERATED ALWAYS AS IDENTITY,
    id_mapa         	integer         NOT NULL,
    cuadrante	    	integer         NOT NULL,
	posicion        	integer		    NOT NULL,
    nomenclatura_fdi 	varchar(10)	    NOT NULL,             
    estado_pieza    	varchar(40)		NOT NULL,
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
    id_mapa_dental  integer	NOT NULL,
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
    id_historial_medico integer			NOT NULL,
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
    nivel_alergia       varchar(20)		NOT NULL,
    estado_alergia      varchar(40)		NOT NULL,
    CONSTRAINT pk_historial_alergia PRIMARY KEY (id_historial_medico, id_alergia),
    -- UNIQUE eliminado: la PK ya garantiza unicidad
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
    fecha_diagnostico       date		NOT NULL,
    CONSTRAINT pk_historial_enfermedad PRIMARY KEY (id_historial_medico, id_enfermedad_sistemica),
    -- UNIQUE eliminado: la PK ya garantiza unicidad
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
    fecha_medicacion    date			NOT NULL,
    estado_medicacion   varchar(40)		NOT NULL,
    CONSTRAINT pk_historial_medicamento PRIMARY KEY (id_historial_medico, id_medicamento),
    -- UNIQUE eliminado: la PK ya garantiza unicidad
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
    fecha_cirugia       date			NOT NULL,
    efectos_secundarios varchar(200),
    estado_cirugia      varchar(40)		NOT NULL,
    CONSTRAINT pk_historial_cirugia PRIMARY KEY (id_historial_medico, id_cirugia_previa),
    -- UNIQUE eliminado: la PK ya garantiza unicidad
    CONSTRAINT fk_historial_medico_cirugia
        FOREIGN KEY (id_historial_medico)
        REFERENCES historial_medico (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_cirugia
        FOREIGN KEY (id_cirugia_previa)
        REFERENCES cirugia_previa (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
