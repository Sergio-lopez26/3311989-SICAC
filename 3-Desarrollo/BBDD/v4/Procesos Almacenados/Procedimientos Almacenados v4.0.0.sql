--
-- PostgreSQL database dump
--

\restrict lshqLNrQqGEplEYwDm8eQIjG6Ozz6FnFc7Fn4M0TOvZdnf5Pz9198NIdYOfGQTb

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-05-27 18:15:12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 259 (class 1255 OID 17108)
-- Name: actualizar_estado_tratamiento(integer, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.actualizar_estado_tratamiento(IN p_id_tratamiento integer, IN p_nuevo_estado character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estado_actual     VARCHAR(40);
    v_id_cita           INTEGER;
    v_estado_cita       VARCHAR(40);
    v_total_tratamientos INTEGER;
    v_finalizados        INTEGER;
BEGIN

    SELECT estado, id_cita INTO v_estado_actual, v_id_cita
    FROM tratamiento WHERE id = p_id_tratamiento;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El tratamiento con id % no existe.', p_id_tratamiento;
    END IF;
 

    IF p_nuevo_estado NOT IN ('programado', 'en_proceso', 'finalizado', 'cancelado') THEN
        RAISE EXCEPTION 'Estado inválido: %. Use: programado, en_proceso, finalizado, cancelado.', 
            p_nuevo_estado;
    END IF;
 
    IF v_estado_actual = 'finalizado' THEN
        RAISE EXCEPTION 'El tratamiento % ya está finalizado y no puede modificarse.', p_id_tratamiento;
    END IF;
 
    IF v_estado_actual = 'cancelado' THEN
        RAISE EXCEPTION 'El tratamiento % está cancelado y no puede modificarse.', p_id_tratamiento;
    END IF;
 
    IF v_estado_actual = 'en_proceso' AND p_nuevo_estado = 'programado' THEN
        RAISE EXCEPTION 'No se puede revertir un tratamiento de en_proceso a programado.';
    END IF;
 
   
    SELECT estado_cita INTO v_estado_cita
    FROM cita WHERE id = v_id_cita;
 
    IF v_estado_cita = 'cancelada' THEN
        RAISE EXCEPTION 'No se puede modificar un tratamiento de una cita cancelada.';
    END IF;
 
   
    UPDATE tratamiento
    SET estado = p_nuevo_estado
    WHERE id = p_id_tratamiento;
 
    RAISE NOTICE 'Tratamiento % actualizado de "%" a "%".', 
        p_id_tratamiento, v_estado_actual, p_nuevo_estado;
 
      IF p_nuevo_estado = 'finalizado' THEN
        SELECT COUNT(*) INTO v_total_tratamientos
        FROM tratamiento WHERE id_cita = v_id_cita;
 
        SELECT COUNT(*) INTO v_finalizados
        FROM tratamiento
        WHERE id_cita = v_id_cita AND estado = 'finalizado';
 
        IF v_total_tratamientos = v_finalizados THEN
            UPDATE cita SET estado_cita = 'completada'
            WHERE id = v_id_cita;
 
            RAISE NOTICE 'Todos los tratamientos de la cita % están finalizados. Cita marcada como completada.', 
                v_id_cita;
        ELSE
            RAISE NOTICE 'Cita %: % de % tratamientos finalizados.', 
                v_id_cita, v_finalizados, v_total_tratamientos;
        END IF;
    END IF;
END;
$$;


ALTER PROCEDURE public.actualizar_estado_tratamiento(IN p_id_tratamiento integer, IN p_nuevo_estado character varying) OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 17107)
-- Name: obtener_historial_paciente(integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.obtener_historial_paciente(IN p_id_paciente integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_nombre        VARCHAR(200);
    v_historial_id  INTEGER;
    rec             RECORD;
BEGIN

    SELECT CONCAT(c.primer_nombre, ' ', COALESCE(c.segundo_nombre || ' ', ''),
                  c.primer_apellido, ' ', COALESCE(c.segundo_apellido, ''))
    INTO v_nombre
    FROM paciente p
    JOIN cliente c ON c.id = p.id_cliente
    WHERE p.id = p_id_paciente;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El paciente con id % no existe.', p_id_paciente;
    END IF;
 

    SELECT id INTO v_historial_id
    FROM historial_medico
    WHERE id_paciente = p_id_paciente;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El paciente % no tiene historial médico registrado.', v_nombre;
    END IF;
 
    RAISE NOTICE '============================';
    RAISE NOTICE 'HISTORIAL MÉDICO: %', UPPER(v_nombre);
    RAISE NOTICE '============================';
 

RAISE NOTICE '--- ALERGIAS ---';
    FOR rec IN
        SELECT a.nombre_alergia, ha.nivel_alergia, ha.estado_alergia
        FROM historial_alergia ha
        JOIN alergia a ON a.id = ha.id_alergia
        WHERE ha.id_historial_medico = v_historial_id
    LOOP
        RAISE NOTICE '  % | Nivel: % | Estado: %', 
            rec.nombre_alergia, rec.nivel_alergia, rec.estado_alergia;
    END LOOP;
 

    RAISE NOTICE '--- ENFERMEDADES SISTÉMICAS ---';
    FOR rec IN
        SELECT es.nombre_enfermedad, he.estado_enfermedad, he.fecha_diagnostico
        FROM historial_enfermedad he
        JOIN enfermedad_sistemica es ON es.id = he.id_enfermedad_sistemica
        WHERE he.id_historial_medico = v_historial_id
    LOOP
        RAISE NOTICE '  % | Estado: % | Diagnóstico: %', 
            rec.nombre_enfermedad, rec.estado_enfermedad, rec.fecha_diagnostico;
    END LOOP;
 
 RAISE NOTICE '--- MEDICAMENTOS ---';
    FOR rec IN
        SELECT m.nombre_medicamento, m.tipo_medicamento, hm.fecha_medicacion, hm.estado_medicacion
        FROM historial_medicamento hm
        JOIN medicamento m ON m.id = hm.id_medicamento
        WHERE hm.id_historial_medico = v_historial_id
    LOOP
        RAISE NOTICE '  % (%) | Desde: % | Estado: %', 
            rec.nombre_medicamento, rec.tipo_medicamento, 
            rec.fecha_medicacion, rec.estado_medicacion;
    END LOOP;
 
 
    RAISE NOTICE '--- CIRUGÍAS PREVIAS ---';
    FOR rec IN
        SELECT cp.tipo_cirugia, cp.nombre_cirugia, hc.fecha_cirugia, 
               hc.estado_cirugia, COALESCE(hc.efectos_secundarios, 'Ninguno') AS efectos
        FROM historial_cirugia hc
        JOIN cirugia_previa cp ON cp.id = hc.id_cirugia_previa
        WHERE hc.id_historial_medico = v_historial_id
    LOOP
        RAISE NOTICE '  % - % | Fecha: % | Estado: % | Efectos: %', 
            rec.tipo_cirugia, rec.nombre_cirugia, rec.fecha_cirugia, 
            rec.estado_cirugia, rec.efectos;
    END LOOP;
 
    RAISE NOTICE '============================';
END;
$$;


ALTER PROCEDURE public.obtener_historial_paciente(IN p_id_paciente integer) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 17105)
-- Name: registrar_cita(integer, integer, date, time without time zone, time without time zone); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_cita(IN p_id_historial integer, IN p_id_odontologo integer, IN p_fecha date, IN p_hora_inicio time without time zone, IN p_hora_fin time without time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estado_odontologo VARCHAR(40);
    v_cruce             INTEGER;
BEGIN
   
    IF NOT EXISTS (SELECT 1 FROM historial_medico WHERE id = p_id_historial) THEN
        RAISE EXCEPTION 'El historial médico con id % no existe.', p_id_historial;
    END IF;
 

    SELECT estado_odontologo INTO v_estado_odontologo
    FROM odontologo WHERE id = p_id_odontologo;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El odontólogo con id % no existe.', p_id_odontologo;
    END IF;
 
    IF v_estado_odontologo <> 'activo' THEN
        RAISE EXCEPTION 'El odontólogo con id % no está activo (estado: %).', 
            p_id_odontologo, v_estado_odontologo;
    END IF;
 

    IF p_hora_inicio >= p_hora_fin THEN
        RAISE EXCEPTION 'La hora de inicio (%) debe ser menor a la hora de fin (%).', 
            p_hora_inicio, p_hora_fin;
    END IF;
 

    SELECT COUNT(*) INTO v_cruce
    FROM cita
    WHERE id_odontologo = p_id_odontologo
      AND fecha_cita    = p_fecha
      AND estado_cita  <> 'cancelada'
      AND (p_hora_inicio, p_hora_fin) OVERLAPS (hora_inicio, hora_fin);
 
    IF v_cruce > 0 THEN
        RAISE EXCEPTION 'El odontólogo ya tiene una cita programada entre % y % el %.', 
            p_hora_inicio, p_hora_fin, p_fecha;
    END IF;
 

    INSERT INTO cita (id_historial_medico, id_odontologo, fecha_cita, hora_inicio, hora_fin, estado_cita)
    VALUES (p_id_historial, p_id_odontologo, p_fecha, p_hora_inicio, p_hora_fin, 'programada');
 
    RAISE NOTICE 'Cita registrada exitosamente para el odontólogo % el % de % a %.', 
        p_id_odontologo, p_fecha, p_hora_inicio, p_hora_fin;
END;
$$;


ALTER PROCEDURE public.registrar_cita(IN p_id_historial integer, IN p_id_odontologo integer, IN p_fecha date, IN p_hora_inicio time without time zone, IN p_hora_fin time without time zone) OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 17106)
-- Name: registrar_pago(integer, integer, numeric); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_pago(IN p_id_cita integer, IN p_id_metodo integer, IN p_monto numeric)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_estado_cita   VARCHAR(40);
    v_pago_previo   VARCHAR(50);
    v_numero_pago   VARCHAR(50);
    v_ultimo_num    INTEGER;
BEGIN
	  SELECT estado_cita INTO v_estado_cita
    FROM cita WHERE id = p_id_cita;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cita con id % no existe.', p_id_cita;
    END IF;
 
    IF v_estado_cita = 'cancelada' THEN
        RAISE EXCEPTION 'No se puede registrar pago para una cita cancelada.';
    END IF;
 
    
    SELECT numero_pago INTO v_pago_previo
    FROM pago
    WHERE id_cita = p_id_cita AND estado_pago = 'pagado'
    LIMIT 1;
 
    IF FOUND THEN
        RAISE EXCEPTION 'La cita % ya tiene un pago registrado (%).', p_id_cita, v_pago_previo;
    END IF;
 
    
    IF NOT EXISTS (SELECT 1 FROM metodo_pago WHERE id = p_id_metodo) THEN
        RAISE EXCEPTION 'El método de pago con id % no existe.', p_id_metodo;
    END IF;
 
    
    IF p_monto < 0 THEN
        RAISE EXCEPTION 'El monto no puede ser negativo (%).', p_monto;
    END IF;
 
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pago FROM 3) AS INTEGER)), 0)
    INTO v_ultimo_num
    FROM pago;
 
    v_numero_pago := 'P-' || LPAD(CAST(v_ultimo_num + 1 AS TEXT), 4, '0');
 
   
    INSERT INTO pago (id_cita, numero_pago, id_metodo_pago, fecha_pago, monto_pago, estado_pago)
    VALUES (p_id_cita, v_numero_pago, p_id_metodo, CURRENT_DATE, p_monto, 'pagado');
 
  
    IF p_monto >= 0 THEN
        UPDATE cita SET estado_cita = 'completada'
        WHERE id = p_id_cita;
    END IF;
 
    RAISE NOTICE 'Pago % registrado por $ % para la cita %. Estado de cita actualizado a completada.', 
        v_numero_pago, p_monto, p_id_cita;
END;
$_$;


ALTER PROCEDURE public.registrar_pago(IN p_id_cita integer, IN p_id_metodo integer, IN p_monto numeric) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 16856)
-- Name: administrador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrador (
    id integer NOT NULL,
    id_cliente integer NOT NULL
);


ALTER TABLE public.administrador OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16855)
-- Name: administrador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.administrador ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.administrador_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 16769)
-- Name: alergia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alergia (
    id integer NOT NULL,
    nombre_alergia character varying(60) NOT NULL
);


ALTER TABLE public.alergia OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16768)
-- Name: alergia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.alergia ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.alergia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 16739)
-- Name: autorizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.autorizacion (
    rol character varying(20) NOT NULL
);


ALTER TABLE public.autorizacion OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16838)
-- Name: autorizacion_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.autorizacion_cliente (
    rol character varying(20) NOT NULL,
    id_cliente integer NOT NULL
);


ALTER TABLE public.autorizacion_cliente OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16790)
-- Name: cirugia_previa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cirugia_previa (
    id integer NOT NULL,
    tipo_cirugia character varying(50) NOT NULL,
    nombre_cirugia character varying(60) NOT NULL
);


ALTER TABLE public.cirugia_previa OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16789)
-- Name: cirugia_previa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cirugia_previa ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cirugia_previa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 250 (class 1259 OID 16953)
-- Name: cita; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cita (
    id integer NOT NULL,
    id_historial_medico integer NOT NULL,
    id_odontologo integer NOT NULL,
    fecha_cita date NOT NULL,
    hora_inicio time(0) without time zone NOT NULL,
    hora_fin time(0) without time zone NOT NULL,
    estado_cita character varying(40) NOT NULL
);


ALTER TABLE public.cita OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16952)
-- Name: cita_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cita ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cita_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 16812)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id integer NOT NULL,
    id_tipo_documento integer NOT NULL,
    numero_documento character varying(50) NOT NULL,
    email character varying(254) NOT NULL,
    password character varying(60) NOT NULL,
    fecha_nacimiento date NOT NULL,
    primer_nombre character varying(50) NOT NULL,
    segundo_nombre character varying(50),
    primer_apellido character varying(50) NOT NULL,
    segundo_apellido character varying(50),
    numero_celular character varying(15) NOT NULL,
    tipo_sangre character varying(10) NOT NULL,
    nombre_acudiente character varying(100),
    documento_acudiente character varying(50)
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16811)
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cliente ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 16779)
-- Name: enfermedad_sistemica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enfermedad_sistemica (
    id integer NOT NULL,
    nombre_enfermedad character varying(60) NOT NULL,
    descripcion_enfermedad character varying(200) NOT NULL
);


ALTER TABLE public.enfermedad_sistemica OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16778)
-- Name: enfermedad_sistemica_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.enfermedad_sistemica ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.enfermedad_sistemica_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 255 (class 1259 OID 17028)
-- Name: historial_alergia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_alergia (
    id_historial_medico integer NOT NULL,
    id_alergia integer NOT NULL,
    nivel_alergia character varying(20) NOT NULL,
    estado_alergia character varying(40) NOT NULL
);


ALTER TABLE public.historial_alergia OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17085)
-- Name: historial_cirugia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_cirugia (
    id_historial_medico integer NOT NULL,
    id_cirugia_previa integer NOT NULL,
    fecha_cirugia date NOT NULL,
    efectos_secundarios character varying(200),
    estado_cirugia character varying(40) NOT NULL
);


ALTER TABLE public.historial_cirugia OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 17047)
-- Name: historial_enfermedad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_enfermedad (
    id_historial_medico integer NOT NULL,
    id_enfermedad_sistemica integer NOT NULL,
    estado_enfermedad character varying(40) NOT NULL,
    fecha_diagnostico date NOT NULL
);


ALTER TABLE public.historial_enfermedad OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17066)
-- Name: historial_medicamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_medicamento (
    id_historial_medico integer NOT NULL,
    id_medicamento integer NOT NULL,
    fecha_medicacion date NOT NULL,
    estado_medicacion character varying(40) NOT NULL
);


ALTER TABLE public.historial_medicamento OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16932)
-- Name: historial_medico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_medico (
    id integer NOT NULL,
    id_paciente integer NOT NULL,
    id_mapa_dental integer NOT NULL
);


ALTER TABLE public.historial_medico OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16931)
-- Name: historial_medico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.historial_medico ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.historial_medico_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 244 (class 1259 OID 16900)
-- Name: mapa_dental; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapa_dental (
    id integer NOT NULL,
    fecha_registro date NOT NULL,
    nombre_estandar character varying(60) NOT NULL,
    estado character varying(40) NOT NULL,
    observacion character varying(1000) NOT NULL
);


ALTER TABLE public.mapa_dental OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16899)
-- Name: mapa_dental_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mapa_dental ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mapa_dental_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 16801)
-- Name: medicamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamento (
    id integer NOT NULL,
    nombre_medicamento character varying(60) NOT NULL,
    tipo_medicamento character varying(50) NOT NULL
);


ALTER TABLE public.medicamento OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16800)
-- Name: medicamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.medicamento ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.medicamento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16761)
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodo_pago (
    id integer NOT NULL,
    nombre_metodo character varying(40) NOT NULL
);


ALTER TABLE public.metodo_pago OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16760)
-- Name: metodo_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.metodo_pago ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.metodo_pago_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 16869)
-- Name: odontologo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.odontologo (
    id integer NOT NULL,
    id_cliente integer NOT NULL,
    estado_odontologo character varying(40) NOT NULL,
    fecha_registro date NOT NULL,
    especializacion character varying(40) NOT NULL
);


ALTER TABLE public.odontologo OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16868)
-- Name: odontologo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.odontologo ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.odontologo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 242 (class 1259 OID 16885)
-- Name: paciente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paciente (
    id integer NOT NULL,
    id_cliente integer NOT NULL,
    fecha_registro date NOT NULL,
    estado_paciente character varying(40) NOT NULL
);


ALTER TABLE public.paciente OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16884)
-- Name: paciente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.paciente ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.paciente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 252 (class 1259 OID 16976)
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id integer NOT NULL,
    id_cita integer NOT NULL,
    numero_pago character varying(50) NOT NULL,
    id_metodo_pago integer NOT NULL,
    fecha_pago date NOT NULL,
    monto_pago numeric(10,2) NOT NULL,
    estado_pago character varying(40) NOT NULL
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16975)
-- Name: pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.pago ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pago_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 246 (class 1259 OID 16913)
-- Name: pieza_dental; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pieza_dental (
    id integer NOT NULL,
    id_mapa integer NOT NULL,
    cuadrante integer NOT NULL,
    posicion integer NOT NULL,
    nomenclatura_fdi character varying(10) NOT NULL,
    estado_pieza character varying(40) NOT NULL
);


ALTER TABLE public.pieza_dental OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16912)
-- Name: pieza_dental_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.pieza_dental ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pieza_dental_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 16746)
-- Name: servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio (
    id integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(1000) NOT NULL,
    precio_actual numeric(10,2) NOT NULL,
    duracion time(0) without time zone NOT NULL
);


ALTER TABLE public.servicio OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16745)
-- Name: servicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.servicio ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.servicio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16730)
-- Name: tipo_documento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_documento (
    id integer NOT NULL,
    sigla character varying(10) NOT NULL,
    nombre_documento character varying(50) NOT NULL,
    estado character varying(40) NOT NULL
);


ALTER TABLE public.tipo_documento OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16729)
-- Name: tipo_documento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tipo_documento ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tipo_documento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 254 (class 1259 OID 17001)
-- Name: tratamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tratamiento (
    id integer NOT NULL,
    id_cita integer NOT NULL,
    id_servicio integer NOT NULL,
    id_pieza_dental integer,
    cara_afectada character varying(40),
    procedimiento character varying(1000),
    estado character varying(40) NOT NULL,
    precio_aplicado numeric(10,2) NOT NULL
);


ALTER TABLE public.tratamiento OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17000)
-- Name: tratamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tratamiento ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tratamiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5220 (class 0 OID 16856)
-- Dependencies: 238
-- Data for Name: administrador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrador (id, id_cliente) FROM stdin;
1	1
\.


--
-- TOC entry 5209 (class 0 OID 16769)
-- Dependencies: 227
-- Data for Name: alergia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alergia (id, nombre_alergia) FROM stdin;
1	Penicilina
2	Anestesia
3	Látex
4	Ibuprofeno
\.


--
-- TOC entry 5203 (class 0 OID 16739)
-- Dependencies: 221
-- Data for Name: autorizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.autorizacion (rol) FROM stdin;
administrador
odontologo
paciente
\.


--
-- TOC entry 5218 (class 0 OID 16838)
-- Dependencies: 236
-- Data for Name: autorizacion_cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.autorizacion_cliente (rol, id_cliente) FROM stdin;
administrador	1
paciente	2
paciente	6
paciente	1
odontologo	9
paciente	4
paciente	7
paciente	10
odontologo	3
paciente	5
paciente	8
paciente	11
\.


--
-- TOC entry 5213 (class 0 OID 16790)
-- Dependencies: 231
-- Data for Name: cirugia_previa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cirugia_previa (id, tipo_cirugia, nombre_cirugia) FROM stdin;
1	Oral	Extracción de cordales
2	Oral	Cirugía periodontal
3	Maxilofacial	Cirugía ortognática
4	Oral	Implante dental
5	General	Apendicectomía
\.


--
-- TOC entry 5232 (class 0 OID 16953)
-- Dependencies: 250
-- Data for Name: cita; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cita (id, id_historial_medico, id_odontologo, fecha_cita, hora_inicio, hora_fin, estado_cita) FROM stdin;
1	1	1	2026-04-20	09:45:00	10:30:00	programada
2	2	2	2026-04-20	08:00:00	08:45:00	programada
3	3	1	2026-04-20	08:00:00	08:45:00	programada
4	4	2	2026-04-20	08:45:00	09:30:00	programada
5	5	1	2026-04-20	08:45:00	09:30:00	programada
6	2	1	2026-04-21	10:30:00	11:15:00	programada
7	6	2	2026-04-20	09:30:00	10:15:00	programada
8	7	1	2026-04-20	11:15:00	12:00:00	programada
9	8	2	2026-04-20	10:15:00	11:00:00	programada
10	9	1	2026-04-20	12:00:00	12:45:00	programada
\.


--
-- TOC entry 5217 (class 0 OID 16812)
-- Dependencies: 235
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id, id_tipo_documento, numero_documento, email, password, fecha_nacimiento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre, nombre_acudiente, documento_acudiente) FROM stdin;
1	1	1233504140	andrejur055@gmail.com	encriptaraqui01	1999-02-09	Jeison	Andrey	Sosa	Espitia	3203720455	O+	\N	\N
2	2	1023456789	laura.martinez@gmail.com	clave01	2005-07-12	Laura	Sofía	Martínez	Gómez	3114567890	A+	\N	\N
3	1	798456123	carlos.ruiz@gmail.com	clave02	1988-11-23	Carlos	Andrés	Ruiz	Pérez	3001234567	B+	\N	\N
4	3	456789123	maria.lopez@gmail.com	clave03	1995-03-30	María	\N	López	Ramírez	3209876543	O-	\N	\N
5	1	1547896320	juan.castro@gmail.com	clave04	1992-09-15	Juan	David	Castro	\N	3102345678	AB+	\N	\N
6	2	1122334455	sofia.torres@gmail.com	clave05	2008-01-20	Sofía	Alejandra	Torres	Vargas	3156789012	A-	\N	\N
7	1	987654321	andres.moreno@gmail.com	clave06	1985-06-10	Andrés	\N	Moreno	Rojas	3008765432	O+	\N	\N
8	3	321654987	luis.garcia@gmail.com	clave07	1990-12-05	Luis	Alberto	García	Jiménez	3193456789	B-	\N	\N
9	1	741852963	paula.restrepo@gmail.com	clave08	1998-04-18	Paula	Andrea	Restrepo	Cano	3125678901	AB-	\N	\N
10	2	159357486	diego.herrera@gmail.com	clave09	2006-08-27	Diego	\N	Herrera	Ortiz	3147890123	O+	\N	\N
11	1	753951456	valentina.suarez@gmail.com	clave10	2000-10-09	Valentina	Lucía	Suárez	Mendoza	3168901234	A+	\N	\N
12	1	753951454	valentina.sandoval@gmail.com	clave11	2000-10-08	Valentina	Lucía	Sandoval	Meza	3168901235	A+	\N	\N
\.


--
-- TOC entry 5211 (class 0 OID 16779)
-- Dependencies: 229
-- Data for Name: enfermedad_sistemica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enfermedad_sistemica (id, nombre_enfermedad, descripcion_enfermedad) FROM stdin;
1	Diabetes	Enfermedad metabólica crónica
2	Hipertensión	Presión arterial elevada
3	Asma	Enfermedad respiratoria
4	Hipotiroidismo	Trastorno hormonal
\.


--
-- TOC entry 5237 (class 0 OID 17028)
-- Dependencies: 255
-- Data for Name: historial_alergia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_alergia (id_historial_medico, id_alergia, nivel_alergia, estado_alergia) FROM stdin;
1	1	Alta	Activa
2	2	Media	Activa
4	3	Baja	Activa
5	4	Media	Activa
\.


--
-- TOC entry 5240 (class 0 OID 17085)
-- Dependencies: 258
-- Data for Name: historial_cirugia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_cirugia (id_historial_medico, id_cirugia_previa, fecha_cirugia, efectos_secundarios, estado_cirugia) FROM stdin;
1	1	2020-05-10	Inflamación leve	Recuperado
2	2	2021-07-15	Sangrado moderado	Recuperado
3	3	2019-03-20	\N	Recuperado
4	4	2022-11-01	Dolor postoperatorio	En seguimiento
5	5	2018-08-25	\N	Recuperado
\.


--
-- TOC entry 5238 (class 0 OID 17047)
-- Dependencies: 256
-- Data for Name: historial_enfermedad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_enfermedad (id_historial_medico, id_enfermedad_sistemica, estado_enfermedad, fecha_diagnostico) FROM stdin;
1	1	Controlada	2018-06-10
2	2	En tratamiento	2020-09-12
4	3	Controlada	2015-03-08
5	4	En tratamiento	2019-11-20
\.


--
-- TOC entry 5239 (class 0 OID 17066)
-- Dependencies: 257
-- Data for Name: historial_medicamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_medicamento (id_historial_medico, id_medicamento, fecha_medicacion, estado_medicacion) FROM stdin;
1	1	2026-04-10	Finalizado
2	2	2026-04-11	En tratamiento
3	3	2026-04-12	Finalizado
4	4	2026-04-13	Suspendido
5	5	2026-04-14	Finalizado
6	6	2026-04-15	En tratamiento
\.


--
-- TOC entry 5230 (class 0 OID 16932)
-- Dependencies: 248
-- Data for Name: historial_medico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_medico (id, id_paciente, id_mapa_dental) FROM stdin;
1	1	1
2	2	2
3	3	3
4	4	4
5	5	5
6	6	6
7	7	7
8	8	8
9	9	9
\.


--
-- TOC entry 5226 (class 0 OID 16900)
-- Dependencies: 244
-- Data for Name: mapa_dental; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mapa_dental (id, fecha_registro, nombre_estandar, estado, observacion) FROM stdin;
1	2026-04-15	FDI	activo	Registro inicial sin hallazgos relevantes
2	2026-04-15	FDI	activo	Presencia de caries en molares inferiores
3	2026-04-15	FDI	activo	Paciente sin caries visibles
4	2026-04-15	FDI	activo	Encías inflamadas, posible gingivitis
5	2026-04-15	FDI	activo	Desgaste leve en piezas dentales posteriores
6	2026-04-15	FDI	activo	Buena salud oral general
7	2026-04-15	FDI	activo	Presencia de placa bacteriana
8	2026-04-15	FDI	activo	Sangrado leve al sondaje
9	2026-04-15	FDI	activo	Sensibilidad dental reportada en incisivos
\.


--
-- TOC entry 5215 (class 0 OID 16801)
-- Dependencies: 233
-- Data for Name: medicamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamento (id, nombre_medicamento, tipo_medicamento) FROM stdin;
1	Ibuprofeno	Analgésico
2	Amoxicilina	Antibiótico
3	Paracetamol	Analgésico
4	Diclofenaco	Antiinflamatorio
5	Ketorolaco	Analgésico
6	Azitromicina	Antibiótico
\.


--
-- TOC entry 5207 (class 0 OID 16761)
-- Dependencies: 225
-- Data for Name: metodo_pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metodo_pago (id, nombre_metodo) FROM stdin;
1	Efectivo
2	Daviplata
3	Nequi
\.


--
-- TOC entry 5222 (class 0 OID 16869)
-- Dependencies: 240
-- Data for Name: odontologo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.odontologo (id, id_cliente, estado_odontologo, fecha_registro, especializacion) FROM stdin;
1	9	activo	2026-04-13	Odontologia General
2	3	activo	2026-04-13	Ortodoncia
\.


--
-- TOC entry 5224 (class 0 OID 16885)
-- Dependencies: 242
-- Data for Name: paciente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paciente (id, id_cliente, fecha_registro, estado_paciente) FROM stdin;
1	2	2026-04-14	activo
2	6	2026-04-14	activo
3	1	2026-04-14	activo
4	4	2026-04-14	activo
5	7	2026-04-14	activo
6	10	2026-04-14	activo
7	5	2026-04-14	activo
8	8	2026-04-14	activo
9	11	2026-04-14	activo
\.


--
-- TOC entry 5234 (class 0 OID 16976)
-- Dependencies: 252
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id, id_cita, numero_pago, id_metodo_pago, fecha_pago, monto_pago, estado_pago) FROM stdin;
1	1	P-0001	1	2026-04-20	0.00	pagado
2	2	P-0002	2	2026-04-20	80000.00	pagado
3	3	P-0003	3	2026-04-20	50000.00	pendiente
4	4	P-0004	1	2026-04-20	90000.00	pagado
5	5	P-0005	2	2026-04-20	100000.00	pendiente
6	6	P-0006	3	2026-04-21	70000.00	pagado
7	7	P-0007	1	2026-04-20	180000.00	pendiente
8	8	P-0008	2	2026-04-20	60000.00	pagado
9	9	P-0009	3	2026-04-20	50000.00	pendiente
10	10	P-0010	1	2026-04-20	120000.00	pagado
\.


--
-- TOC entry 5228 (class 0 OID 16913)
-- Dependencies: 246
-- Data for Name: pieza_dental; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pieza_dental (id, id_mapa, cuadrante, posicion, nomenclatura_fdi, estado_pieza) FROM stdin;
1	2	1	1	11	Sana
2	2	1	2	12	Sana
3	2	1	3	13	Sana
4	2	1	4	14	Obturada
5	2	1	5	15	Caries
6	2	1	6	16	Obturada
7	2	1	7	17	Sana
8	2	1	8	18	Ausente
9	2	2	1	21	Sana
10	2	2	2	22	Sana
11	2	2	3	23	Sana
12	2	2	4	24	Obturada
13	2	2	5	25	Sana
14	2	2	6	26	Caries
15	2	2	7	27	Obturada
16	2	2	8	28	Ausente
17	2	3	1	31	Sana
18	2	3	2	32	Sana
19	2	3	3	33	Sana
20	2	3	4	34	Obturada
21	2	3	5	35	Sana
22	2	3	6	36	Endodoncia
23	2	3	7	37	Obturada
24	2	3	8	38	Ausente
25	2	4	1	41	Sana
26	2	4	2	42	Sana
27	2	4	3	43	Sana
28	2	4	4	44	Obturada
29	2	4	5	45	Sana
30	2	4	6	46	Caries
31	2	4	7	47	Obturada
32	2	4	8	48	Ausente
\.


--
-- TOC entry 5205 (class 0 OID 16746)
-- Dependencies: 223
-- Data for Name: servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicio (id, nombre, descripcion, precio_actual, duracion) FROM stdin;
1	Consulta General	Valoración inicial y diagnóstico del paciente	0.00	00:30:00
2	Limpieza Dental	Profilaxis y eliminación de placa bacteriana	80000.00	00:45:00
3	Resina Dental	Restauración estética por caries	120000.00	00:45:00
4	Extracción Simple	Extracción de pieza dental sin cirugía	90000.00	00:30:00
5	Endodoncia	Tratamiento de conducto en diente afectado	250000.00	01:00:00
6	Ortodoncia Control	Ajuste y control de brackets	70000.00	00:30:00
7	Blanqueamiento Dental	Procedimiento estético para aclarar dientes	180000.00	01:00:00
8	Sellantes	Aplicación de sellantes en molares	60000.00	00:30:00
9	Radiografía Dental	Imagen diagnóstica de piezas dentales	40000.00	00:20:00
10	Tratamiento de Encías	Manejo de gingivitis o periodontitis leve	110000.00	00:45:00
\.


--
-- TOC entry 5202 (class 0 OID 16730)
-- Dependencies: 220
-- Data for Name: tipo_documento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_documento (id, sigla, nombre_documento, estado) FROM stdin;
1	CC	Cedula de Ciudadania	activo
2	TI	Tarjeta de Identidad	activo
3	CE	Cedula de Extranjeria	activo
\.


--
-- TOC entry 5236 (class 0 OID 17001)
-- Dependencies: 254
-- Data for Name: tratamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tratamiento (id, id_cita, id_servicio, id_pieza_dental, cara_afectada, procedimiento, estado, precio_aplicado) FROM stdin;
1	1	1	\N	\N	Valoración general del paciente	finalizado	0.00
2	2	2	\N	\N	Limpieza y profilaxis completa	finalizado	80000.00
3	3	3	6	oclusal	Resina por caries en molar	en_proceso	120000.00
4	4	4	8	oclusal	Extracción de cordal superior	programado	90000.00
5	5	5	14	oclusal	Endodoncia en molar superior	en_proceso	250000.00
6	6	6	\N	\N	Control y ajuste de ortodoncia	finalizado	70000.00
7	7	7	\N	\N	Blanqueamiento dental	programado	180000.00
8	8	8	22	oclusal	Aplicación de sellante	finalizado	60000.00
9	9	10	\N	\N	Tratamiento de encías	en_proceso	110000.00
10	10	3	1	vestibular	Resina estética en incisivo	finalizado	120000.00
\.


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 237
-- Name: administrador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administrador_id_seq', 1, true);


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 226
-- Name: alergia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alergia_id_seq', 4, true);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 230
-- Name: cirugia_previa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cirugia_previa_id_seq', 5, true);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 249
-- Name: cita_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cita_id_seq', 10, true);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 234
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cliente_id_seq', 12, true);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 228
-- Name: enfermedad_sistemica_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enfermedad_sistemica_id_seq', 4, true);


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 247
-- Name: historial_medico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_medico_id_seq', 9, true);


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 243
-- Name: mapa_dental_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mapa_dental_id_seq', 9, true);


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 232
-- Name: medicamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicamento_id_seq', 6, true);


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 224
-- Name: metodo_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodo_pago_id_seq', 3, true);


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 239
-- Name: odontologo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.odontologo_id_seq', 2, true);


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 241
-- Name: paciente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paciente_id_seq', 9, true);


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 251
-- Name: pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_seq', 10, true);


--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 245
-- Name: pieza_dental_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pieza_dental_id_seq', 32, true);


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 222
-- Name: servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicio_id_seq', 10, true);


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 219
-- Name: tipo_documento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_documento_id_seq', 3, true);


--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 253
-- Name: tratamiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tratamiento_id_seq', 10, true);


--
-- TOC entry 4999 (class 2606 OID 16862)
-- Name: administrador pk_administrador; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT pk_administrador PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 16775)
-- Name: alergia pk_alergia; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alergia
    ADD CONSTRAINT pk_alergia PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 16744)
-- Name: autorizacion pk_autorizacion_cliente; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizacion
    ADD CONSTRAINT pk_autorizacion_cliente PRIMARY KEY (rol);


--
-- TOC entry 4997 (class 2606 OID 16844)
-- Name: autorizacion_cliente pk_autorizacion_cliente_compuesta; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizacion_cliente
    ADD CONSTRAINT pk_autorizacion_cliente_compuesta PRIMARY KEY (rol, id_cliente);


--
-- TOC entry 4983 (class 2606 OID 16797)
-- Name: cirugia_previa pk_cirugia_previa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cirugia_previa
    ADD CONSTRAINT pk_cirugia_previa PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 16964)
-- Name: cita pk_cita; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT pk_cita PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 16828)
-- Name: cliente pk_cliente; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT pk_cliente PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 16786)
-- Name: enfermedad_sistemica pk_enfermedad_sistemica; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enfermedad_sistemica
    ADD CONSTRAINT pk_enfermedad_sistemica PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 17036)
-- Name: historial_alergia pk_historial_alergia; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_alergia
    ADD CONSTRAINT pk_historial_alergia PRIMARY KEY (id_historial_medico, id_alergia);


--
-- TOC entry 5029 (class 2606 OID 17093)
-- Name: historial_cirugia pk_historial_cirugia; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cirugia
    ADD CONSTRAINT pk_historial_cirugia PRIMARY KEY (id_historial_medico, id_cirugia_previa);


--
-- TOC entry 5025 (class 2606 OID 17055)
-- Name: historial_enfermedad pk_historial_enfermedad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_enfermedad
    ADD CONSTRAINT pk_historial_enfermedad PRIMARY KEY (id_historial_medico, id_enfermedad_sistemica);


--
-- TOC entry 5027 (class 2606 OID 17074)
-- Name: historial_medicamento pk_historial_medicamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medicamento
    ADD CONSTRAINT pk_historial_medicamento PRIMARY KEY (id_historial_medico, id_medicamento);


--
-- TOC entry 5011 (class 2606 OID 16939)
-- Name: historial_medico pk_historial_medico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medico
    ADD CONSTRAINT pk_historial_medico PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 16911)
-- Name: mapa_dental pk_mapa_dental; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapa_dental
    ADD CONSTRAINT pk_mapa_dental PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 16808)
-- Name: medicamento pk_medicamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamento
    ADD CONSTRAINT pk_medicamento PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 16767)
-- Name: metodo_pago pk_metodo_pago; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT pk_metodo_pago PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 16878)
-- Name: odontologo pk_odontologo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.odontologo
    ADD CONSTRAINT pk_odontologo PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 16893)
-- Name: paciente pk_paciente; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente
    ADD CONSTRAINT pk_paciente PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 16987)
-- Name: pago pk_pago; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pk_pago PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 16923)
-- Name: pieza_dental pk_pieza_dental; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pieza_dental
    ADD CONSTRAINT pk_pieza_dental PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 16757)
-- Name: servicio pk_servicio; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio
    ADD CONSTRAINT pk_servicio PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 16738)
-- Name: tipo_documento pk_tipo_documento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_documento
    ADD CONSTRAINT pk_tipo_documento PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 17012)
-- Name: tratamiento pk_tratamiento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tratamiento
    ADD CONSTRAINT pk_tratamiento PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 16777)
-- Name: alergia uc_alergia; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alergia
    ADD CONSTRAINT uc_alergia UNIQUE (nombre_alergia);


--
-- TOC entry 4985 (class 2606 OID 16799)
-- Name: cirugia_previa uc_cirugia; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cirugia_previa
    ADD CONSTRAINT uc_cirugia UNIQUE (tipo_cirugia, nombre_cirugia);


--
-- TOC entry 4993 (class 2606 OID 16830)
-- Name: cliente uc_cliente; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT uc_cliente UNIQUE (id_tipo_documento, numero_documento);


--
-- TOC entry 4995 (class 2606 OID 16832)
-- Name: cliente uc_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT uc_email UNIQUE (email);


--
-- TOC entry 4981 (class 2606 OID 16788)
-- Name: enfermedad_sistemica uc_enfermedad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enfermedad_sistemica
    ADD CONSTRAINT uc_enfermedad UNIQUE (nombre_enfermedad);


--
-- TOC entry 5013 (class 2606 OID 16941)
-- Name: historial_medico uc_historial_medico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medico
    ADD CONSTRAINT uc_historial_medico UNIQUE (id_paciente, id_mapa_dental);


--
-- TOC entry 4989 (class 2606 OID 16810)
-- Name: medicamento uc_medicamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamento
    ADD CONSTRAINT uc_medicamento UNIQUE (nombre_medicamento, tipo_medicamento);


--
-- TOC entry 5019 (class 2606 OID 16989)
-- Name: pago uc_pago; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT uc_pago UNIQUE (numero_pago);


--
-- TOC entry 5009 (class 2606 OID 16925)
-- Name: pieza_dental uc_pieza_dental; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pieza_dental
    ADD CONSTRAINT uc_pieza_dental UNIQUE (id_mapa, nomenclatura_fdi);


--
-- TOC entry 4971 (class 2606 OID 16759)
-- Name: servicio uc_servicio; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio
    ADD CONSTRAINT uc_servicio UNIQUE (nombre);


--
-- TOC entry 5031 (class 2606 OID 16845)
-- Name: autorizacion_cliente fk_autorizacion_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizacion_cliente
    ADD CONSTRAINT fk_autorizacion_cliente FOREIGN KEY (rol) REFERENCES public.autorizacion(rol) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5041 (class 2606 OID 16990)
-- Name: pago fk_cita_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_cita_pago FOREIGN KEY (id_cita) REFERENCES public.cita(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5043 (class 2606 OID 17013)
-- Name: tratamiento fk_cita_tratamiento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tratamiento
    ADD CONSTRAINT fk_cita_tratamiento FOREIGN KEY (id_cita) REFERENCES public.cita(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 16863)
-- Name: administrador fk_cliente_administrador; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT fk_cliente_administrador FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 16850)
-- Name: autorizacion_cliente fk_cliente_autorizacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizacion_cliente
    ADD CONSTRAINT fk_cliente_autorizacion FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5034 (class 2606 OID 16879)
-- Name: odontologo fk_cliente_odontologo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.odontologo
    ADD CONSTRAINT fk_cliente_odontologo FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5035 (class 2606 OID 16894)
-- Name: paciente fk_cliente_paciente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente
    ADD CONSTRAINT fk_cliente_paciente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 17042)
-- Name: historial_alergia fk_historial_alergia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_alergia
    ADD CONSTRAINT fk_historial_alergia FOREIGN KEY (id_alergia) REFERENCES public.alergia(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5052 (class 2606 OID 17099)
-- Name: historial_cirugia fk_historial_cirugia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cirugia
    ADD CONSTRAINT fk_historial_cirugia FOREIGN KEY (id_cirugia_previa) REFERENCES public.cirugia_previa(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5048 (class 2606 OID 17061)
-- Name: historial_enfermedad fk_historial_enfermedad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_enfermedad
    ADD CONSTRAINT fk_historial_enfermedad FOREIGN KEY (id_enfermedad_sistemica) REFERENCES public.enfermedad_sistemica(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5050 (class 2606 OID 17080)
-- Name: historial_medicamento fk_historial_medicamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medicamento
    ADD CONSTRAINT fk_historial_medicamento FOREIGN KEY (id_medicamento) REFERENCES public.medicamento(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5047 (class 2606 OID 17037)
-- Name: historial_alergia fk_historial_medico_alergia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_alergia
    ADD CONSTRAINT fk_historial_medico_alergia FOREIGN KEY (id_historial_medico) REFERENCES public.historial_medico(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 17094)
-- Name: historial_cirugia fk_historial_medico_cirugia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cirugia
    ADD CONSTRAINT fk_historial_medico_cirugia FOREIGN KEY (id_historial_medico) REFERENCES public.historial_medico(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5039 (class 2606 OID 16970)
-- Name: cita fk_historial_medico_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_historial_medico_cita FOREIGN KEY (id_historial_medico) REFERENCES public.historial_medico(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5049 (class 2606 OID 17056)
-- Name: historial_enfermedad fk_historial_medico_enfermedad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_enfermedad
    ADD CONSTRAINT fk_historial_medico_enfermedad FOREIGN KEY (id_historial_medico) REFERENCES public.historial_medico(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 17075)
-- Name: historial_medicamento fk_historial_medico_medicamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medicamento
    ADD CONSTRAINT fk_historial_medico_medicamento FOREIGN KEY (id_historial_medico) REFERENCES public.historial_medico(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5037 (class 2606 OID 16947)
-- Name: historial_medico fk_mapa_dental_historial; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medico
    ADD CONSTRAINT fk_mapa_dental_historial FOREIGN KEY (id_mapa_dental) REFERENCES public.mapa_dental(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5036 (class 2606 OID 16926)
-- Name: pieza_dental fk_mapa_diente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pieza_dental
    ADD CONSTRAINT fk_mapa_diente FOREIGN KEY (id_mapa) REFERENCES public.mapa_dental(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5042 (class 2606 OID 16995)
-- Name: pago fk_metodo_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_metodo_pago FOREIGN KEY (id_metodo_pago) REFERENCES public.metodo_pago(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5040 (class 2606 OID 16965)
-- Name: cita fk_odontologo_cita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cita
    ADD CONSTRAINT fk_odontologo_cita FOREIGN KEY (id_odontologo) REFERENCES public.odontologo(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5038 (class 2606 OID 16942)
-- Name: historial_medico fk_paciente_historial; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_medico
    ADD CONSTRAINT fk_paciente_historial FOREIGN KEY (id_paciente) REFERENCES public.paciente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5044 (class 2606 OID 17023)
-- Name: tratamiento fk_pieza_dental_tratamiento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tratamiento
    ADD CONSTRAINT fk_pieza_dental_tratamiento FOREIGN KEY (id_pieza_dental) REFERENCES public.pieza_dental(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5045 (class 2606 OID 17018)
-- Name: tratamiento fk_servicio_tratamiento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tratamiento
    ADD CONSTRAINT fk_servicio_tratamiento FOREIGN KEY (id_servicio) REFERENCES public.servicio(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 16833)
-- Name: cliente fk_tipo_documento_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_tipo_documento_cliente FOREIGN KEY (id_tipo_documento) REFERENCES public.tipo_documento(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-05-27 18:15:12

--
-- PostgreSQL database dump complete
--

\unrestrict lshqLNrQqGEplEYwDm8eQIjG6Ozz6FnFc7Fn4M0TOvZdnf5Pz9198NIdYOfGQTb

