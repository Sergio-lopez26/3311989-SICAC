CREATE OR REPLACE PROCEDURE public.registrar_odontologo(
    IN p_id_tipo_doc        INTEGER,
    IN p_num_doc            VARCHAR,
    IN p_email              VARCHAR,
    IN p_password           VARCHAR,
    IN p_fecha_nacimiento   DATE,
    IN p_primer_nombre      VARCHAR,
    IN p_segundo_nombre     VARCHAR,
    IN p_primer_apellido    VARCHAR,
    IN p_segundo_apellido   VARCHAR,
    IN p_celular            VARCHAR,
    IN p_tipo_sangre        VARCHAR,
    IN p_especializacion    VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cliente    INTEGER;
    v_id_odontologo INTEGER;
BEGIN
    -- Validar tipo de documento
    IF NOT EXISTS (SELECT 1 FROM tipo_documento WHERE id = p_id_tipo_doc) THEN
        RAISE EXCEPTION 'El tipo de documento con id % no existe.', p_id_tipo_doc;
    END IF;

    -- Validar duplicado de documento
    IF EXISTS (
        SELECT 1 FROM cliente
        WHERE id_tipo_documento = p_id_tipo_doc
          AND numero_documento  = p_num_doc
    ) THEN
        RAISE EXCEPTION 'Ya existe un cliente con el documento % de tipo %.', p_num_doc, p_id_tipo_doc;
    END IF;

    -- Validar duplicado de email
    IF EXISTS (SELECT 1 FROM cliente WHERE email = p_email) THEN
        RAISE EXCEPTION 'Ya existe un cliente registrado con el email %.', p_email;
    END IF;

    -- Validar especialización no vacía
    IF TRIM(p_especializacion) = '' THEN
        RAISE EXCEPTION 'La especialización no puede estar vacía.';
    END IF;

    -- Insertar cliente
    INSERT INTO cliente (
        id_tipo_documento, numero_documento, email, password,
        fecha_nacimiento, primer_nombre, segundo_nombre,
        primer_apellido, segundo_apellido, numero_celular, tipo_sangre
    ) VALUES (
        p_id_tipo_doc, p_num_doc, p_email, p_password,
        p_fecha_nacimiento, p_primer_nombre, p_segundo_nombre,
        p_primer_apellido, p_segundo_apellido, p_celular, p_tipo_sangre
    )
    RETURNING id INTO v_id_cliente;

    -- Asignar rol odontólogo
    INSERT INTO autorizacion_cliente (rol, id_cliente)
    VALUES ('odontologo', v_id_cliente);

    -- Insertar en tabla odontólogo
    INSERT INTO odontologo (id_cliente, estado_odontologo, fecha_registro, especializacion)
    VALUES (v_id_cliente, 'activo', CURRENT_DATE, p_especializacion)
    RETURNING id INTO v_id_odontologo;

    RAISE NOTICE 'Odontólogo registrado: cliente_id=%, odontologo_id=%, especialización="%".',
        v_id_cliente, v_id_odontologo, p_especializacion;
END;
$$;

ALTER PROCEDURE public.registrar_odontologo(
    IN p_id_tipo_doc INTEGER, IN p_num_doc VARCHAR, IN p_email VARCHAR,
    IN p_password VARCHAR, IN p_fecha_nacimiento DATE, IN p_primer_nombre VARCHAR,
    IN p_segundo_nombre VARCHAR, IN p_primer_apellido VARCHAR,
    IN p_segundo_apellido VARCHAR, IN p_celular VARCHAR,
    IN p_tipo_sangre VARCHAR, IN p_especializacion VARCHAR)
OWNER TO postgres;


-- ============================================================
-- 2. ACTUALIZAR ESTADO DE PACIENTE
--    Cambia el estado de un paciente entre 'activo' e 'inactivo'.
--    Si se intenta inactivar, verifica que no tenga citas
--    programadas pendientes antes de aplicar el cambio.
--
--    Parámetros:
--      p_id_paciente  → ID del paciente (tabla paciente)
--      p_nuevo_estado → Nuevo estado: 'activo' | 'inactivo'
--
--    Uso:
--      CALL actualizar_estado_paciente(3, 'inactivo');
--      CALL actualizar_estado_paciente(3, 'activo');
-- ============================================================
CREATE OR REPLACE PROCEDURE public.actualizar_estado_paciente(
    IN p_id_paciente    INTEGER,
    IN p_nuevo_estado   VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_nombre            VARCHAR(200);
    v_estado_actual     VARCHAR(40);
    v_citas_pendientes  INTEGER;
BEGIN
    -- Verificar que el paciente existe y obtener su nombre y estado
    SELECT
        CONCAT(c.primer_nombre, ' ', COALESCE(c.segundo_nombre || ' ', ''),
               c.primer_apellido, ' ', COALESCE(c.segundo_apellido, '')),
        p.estado_paciente
    INTO v_nombre, v_estado_actual
    FROM paciente p
    JOIN cliente c ON c.id = p.id_cliente
    WHERE p.id = p_id_paciente;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El paciente con id % no existe.', p_id_paciente;
    END IF;

    -- Validar estado nuevo
    IF p_nuevo_estado NOT IN ('activo', 'inactivo') THEN
        RAISE EXCEPTION 'Estado inválido: %. Use: activo | inactivo.', p_nuevo_estado;
    END IF;

    -- Evitar cambio innecesario
    IF v_estado_actual = p_nuevo_estado THEN
        RAISE EXCEPTION 'El paciente % ya tiene el estado "%".', v_nombre, p_nuevo_estado;
    END IF;

    -- Si se va a inactivar, verificar citas programadas activas
    IF p_nuevo_estado = 'inactivo' THEN
        SELECT COUNT(*) INTO v_citas_pendientes
        FROM cita ct
        JOIN historial_medico hm ON hm.id = ct.id_historial_medico
        WHERE hm.id_paciente   = p_id_paciente
          AND ct.estado_cita   = 'programada';

        IF v_citas_pendientes > 0 THEN
            RAISE EXCEPTION
                'No se puede inactivar al paciente % porque tiene % cita(s) programada(s) pendiente(s).',
                v_nombre, v_citas_pendientes;
        END IF;
    END IF;

    -- Aplicar cambio
    UPDATE paciente
    SET estado_paciente = p_nuevo_estado
    WHERE id = p_id_paciente;

    RAISE NOTICE 'Paciente % actualizado de "%" a "%".',
        v_nombre, v_estado_actual, p_nuevo_estado;
END;
$$;

ALTER PROCEDURE public.actualizar_estado_paciente(
    IN p_id_paciente INTEGER, IN p_nuevo_estado VARCHAR)
OWNER TO postgres;


-- ============================================================
-- 3. AGREGAR TRATAMIENTO A CITA
--    Agrega un nuevo tratamiento a una cita existente.
--    Valida que la cita no esté cancelada ni completada,
--    que el servicio exista y que, si se indica pieza dental,
--    también se informe la cara afectada (y viceversa).
--
--    Parámetros:
--      p_id_cita        → ID de la cita
--      p_id_servicio    → ID del servicio a aplicar
--      p_id_pieza       → ID de la pieza dental (NULL si es general)
--      p_cara_afectada  → Cara afectada (NULL si no hay pieza)
--      p_procedimiento  → Descripción del procedimiento
--
--    Uso:
--      -- Tratamiento general (sin pieza)
--      CALL agregar_tratamiento_cita(1, 2, NULL, NULL, 'Limpieza completa');
--
--      -- Tratamiento en pieza específica (FDI 16 → id=6)
--      CALL agregar_tratamiento_cita(3, 3, 6, 'oclusal', 'Resina por caries');
-- ============================================================
CREATE OR REPLACE PROCEDURE public.agregar_tratamiento_cita(
    IN p_id_cita        INTEGER,
    IN p_id_servicio    INTEGER,
    IN p_id_pieza       INTEGER,
    IN p_cara_afectada  VARCHAR,
    IN p_procedimiento  VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_cita   VARCHAR(40);
    v_precio        DECIMAL(10,2);
    v_nombre_srv    VARCHAR(60);
    v_fdi           VARCHAR(10);
    v_id_mapa_cita  INTEGER;
    v_id_mapa_pieza INTEGER;
BEGIN
    -- Verificar cita
    SELECT estado_cita INTO v_estado_cita
    FROM cita WHERE id = p_id_cita;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cita con id % no existe.', p_id_cita;
    END IF;

    IF v_estado_cita = 'cancelada' THEN
        RAISE EXCEPTION 'No se puede agregar tratamientos a una cita cancelada.';
    END IF;

    IF v_estado_cita = 'completada' THEN
        RAISE EXCEPTION 'No se puede agregar tratamientos a una cita ya completada.';
    END IF;

    -- Verificar servicio y obtener precio vigente
    SELECT nombre, precio_actual INTO v_nombre_srv, v_precio
    FROM servicio WHERE id = p_id_servicio;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El servicio con id % no existe.', p_id_servicio;
    END IF;

    -- Validar coherencia pieza ↔ cara
    IF p_id_pieza IS NOT NULL AND (p_cara_afectada IS NULL OR TRIM(p_cara_afectada) = '') THEN
        RAISE EXCEPTION 'Si se indica una pieza dental debe especificarse también la cara afectada.';
    END IF;

    IF p_id_pieza IS NULL AND p_cara_afectada IS NOT NULL THEN
        RAISE EXCEPTION 'No se puede indicar cara afectada sin una pieza dental asociada.';
    END IF;

    -- Si hay pieza, verificar que pertenezca al mapa dental de la cita
    IF p_id_pieza IS NOT NULL THEN
        SELECT pd.id_mapa INTO v_id_mapa_pieza
        FROM pieza_dental pd WHERE pd.id = p_id_pieza;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'La pieza dental con id % no existe.', p_id_pieza;
        END IF;

        SELECT md.id INTO v_id_mapa_cita
        FROM cita ct
        JOIN historial_medico hm ON hm.id = ct.id_historial_medico
        WHERE ct.id = p_id_cita;

        IF v_id_mapa_cita <> v_id_mapa_pieza THEN
            RAISE EXCEPTION
                'La pieza dental % no pertenece al mapa dental del paciente de esta cita.',
                p_id_pieza;
        END IF;

        SELECT nomenclatura_fdi INTO v_fdi FROM pieza_dental WHERE id = p_id_pieza;
    END IF;

    -- Insertar tratamiento
    INSERT INTO tratamiento (
        id_cita, id_servicio, id_pieza_dental,
        cara_afectada, procedimiento, estado, precio_aplicado
    ) VALUES (
        p_id_cita, p_id_servicio, p_id_pieza,
        p_cara_afectada, p_procedimiento, 'programado', v_precio
    );

    IF p_id_pieza IS NOT NULL THEN
        RAISE NOTICE 'Tratamiento "%" agregado a la cita % → Pieza FDI %, cara %, precio: $%.',
            v_nombre_srv, p_id_cita, v_fdi, p_cara_afectada, v_precio;
    ELSE
        RAISE NOTICE 'Tratamiento "%" (general) agregado a la cita %. Precio: $%.',
            v_nombre_srv, p_id_cita, v_precio;
    END IF;
END;
$$;

ALTER PROCEDURE public.agregar_tratamiento_cita(
    IN p_id_cita INTEGER, IN p_id_servicio INTEGER, IN p_id_pieza INTEGER,
    IN p_cara_afectada VARCHAR, IN p_procedimiento VARCHAR)
OWNER TO postgres;


-- ============================================================
-- 4. RESUMEN DE INGRESOS POR PERIODO
--    Genera un reporte de pagos y servicios más facturados
--    dentro de un rango de fechas. Muestra:
--      - Total recaudado y número de pagos
--      - Detalle por método de pago
--      - Top 3 de servicios más facturados en el período
--
--    Parámetros:
--      p_fecha_inicio → Fecha de inicio del rango (YYYY-MM-DD)
--      p_fecha_fin    → Fecha de fin del rango (YYYY-MM-DD)
--
--    Uso:
--      CALL resumen_ingresos_periodo('2026-04-01', '2026-04-30');
-- ============================================================
CREATE OR REPLACE PROCEDURE public.resumen_ingresos_periodo(
    IN p_fecha_inicio   DATE,
    IN p_fecha_fin      DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_recaudado   DECIMAL(12,2);
    v_total_pagos       INTEGER;
    v_total_pendiente   DECIMAL(12,2);
    rec                 RECORD;
    v_rank              INTEG   -- Validar rango
    IF p_fecha_inicio > p_fecha_fin THEN
        RAISE EXCEPTION 'La fecha de inicio (%) no puede ser mayor a la fecha de fin (%).',
            p_fecha_inicio, p_fecha_fin;
    END IF;

    SELECT
        COALESCE(SUM(monto_pago) FILTER (WHERE estado_pago = 'pagado'),   0),
        COUNT(*)                FILTER (WHERE estado_pago = 'pagado'),
        COALESCE(SUM(monto_pago) FILTER (WHERE estado_pago = 'pendiente'), 0)
    INTO v_total_recaudado, v_total_pagos, v_total_pendiente
    FROM pago
    WHERE fecha_pago BETWEEN p_fecha_inicio AND p_fecha_fin;

  
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'RESUMEN DE INGRESOS: % → %', p_fecha_inicio, p_fecha_fin;
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Pagos completados  : %',          v_total_pagos;
    RAISE NOTICE 'Total recaudado    : $%',          v_total_recaudado;
    RAISE NOTICE 'Total pendiente    : $%',          v_total_pendiente;
    RAISE NOTICE '-----------------------------------------------------';

  
    RAISE NOTICE 'DESGLOSE POR MÉTODO DE PAGO:';
    FOR rec IN
        SELECT mp.nombre_metodo,
               COUNT(*)          AS num_pagos,
               SUM(p.monto_pago) AS subtotal
        FROM pago p
        JOIN metodo_pago mp ON mp.id = p.id_metodo_pago
        WHERE p.fecha_pago    BETWEEN p_fecha_inicio AND p_fecha_fin
          AND p.estado_pago = 'pagado'
        GROUP BY mp.nombre_metodo
        ORDER BY subtotal DESC
    LOOP
        RAISE NOTICE '  %-15s | % pagos | $%',
            rec.nombre_metodo, rec.num_pagos, rec.subtotal;
    END LOOP;

    RAISE NOTICE '-----------------------------------------------------';

   
    RAISE NOTICE 'TOP 3 SERVICIOS MÁS FACTURADOS:';
    FOR rec IN
        SELECT s.nombre,
               COUNT(t.id)           AS veces_aplicado,
               SUM(t.precio_aplicado) AS total_servicio
        FROM tratamiento t
        JOIN servicio  s  ON s.id  = t.id_servicio
        JOIN cita      ct ON ct.id = t.id_cita
        JOIN pago      p  ON p.id_cita = ct.id
        WHERE p.fecha_pago  BETWEEN p_fecha_inicio AND p_fecha_fin
          AND p.estado_pago = 'pagado'
        GROUP BY s.nombre
        ORDER BY total_servicio DESC
        LIMIT 3
    LOOP
        v_rank := v_rank + 1;
        RAISE NOTICE '  #% %-25s | % vez(ces) | $%',
            v_rank, rec.nombre, rec.veces_aplicado, rec.total_servicio;
    END LOOP;

    RAISE NOTICE '=====================================================';
END;
$$;

ALTER PROCEDURE public.resumen_ingresos_periodo(
    IN p_fecha_inicio DATE, IN p_fecha_fin DATE)
OWNER TO postgres;
