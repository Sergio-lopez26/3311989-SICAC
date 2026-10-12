-- Consultas DQL --

-- RF #1 y RF #2 --
-- 1. Consultar tabla servicios
SELECT * FROM servicio; 
-- 2. Consultar por nombre del servicio
SELECT * FROM servicio
WHERE nombre='Limpieza Dental';
-- 3. Consultar descripción del servicio
SELECT nombre, descripcion FROM servicio;
-- 4. Consultar por precio
SELECT nombre,precio_actual FROM servicio
ORDER BY precio_actual DESC;
-- 5. Consultar por duración
SELECT nombre, duracion FROM servicio
ORDER BY duracion DESC; 

-- RF #3 y RF #12
-- 6. Consultar tabla clientes
SELECT * FROM cliente;
-- 7. consultar por tipo de Documento
SELECT * FROM cliente 
WHERE id_tipo_documento = '1'; --> 1 es el id de CC
-- 8. consultar por número de Documento
SELECT * FROM cliente
WHERE numero_documento = '1547896320'; 
-- 9. consultar por primer nombre
SELECT * FROM cliente 
WHERE primer_nombre LIKE '%Carlos%';
-- 10. consultar por primer apellido
SELECT * FROM cliente 
WHERE primer_apellido LIKE '%Castro%';
-- 11. consultar por fecha de Nacimiento
SELECT * FROM cliente 
WHERE fecha_nacimiento = '1985-06-10'; 
-- 12. consultar por RH
SELECT * FROM cliente 
WHERE tipo_sangre = 'O+'; 
-- 13. consultar por Email
SELECT * FROM cliente 
WHERE email = 'juan.castro@gmail.com';
-- 14. consultar por Teléfono
SELECT * FROM cliente 
WHERE numero_celular = '3102345678';
-- 15. consultar por nombre del acudiente
SELECT * FROM cliente 
WHERE nombre_acudiente 
LIKE '%Martha%'; 
-- 16. consultar por documento del acudiente
SELECT * FROM cliente
WHERE documento_acudiente = '52345678'; 

-- RF #4 y RF #12
-- 17. consultar tabla odontólogos
SELECT o.id AS id_odontologo, o.especializacion, c.* FROM odontologo o INNER JOIN cliente c ON o.id_cliente = c.id; 
-- 18. Consultar por tipo de Documento
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.id_tipo_documento = '1'; 
-- 19. Consultar por Número de Documento
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.numero_documento = '798456123'; 
-- 20. Consultar por Nombres 
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.primer_nombre LIKE '%Carlos%' or c.segundo_nombre LIKE '%Carlos%'; 
-- 21. Consultar por Apellidos 
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.primer_apellido LIKE '%Pérez%' or c.segundo_apellido LIKE '%Pérez%'; 
-- 22. Consultar por Fecha de Nacimiento
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.fecha_nacimiento = '1998-04-18'; 
-- 23. Consultar por Teléfono
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.numero_celular = '3125678901'; 
-- 24. Consultar por Email
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE c.email = 'carlos.ruiz@gmail.com'; 
-- 25. Consultar por Especialización
SELECT o.id AS id_odontologo, o.especializacion, c.* 
FROM odontologo o 
INNER JOIN cliente c ON o.id_cliente = c.id 
WHERE o.especializacion = 'Ortodoncia'; 

-- RF #5 y RF #6
-- 26. consultar tabla citas

SELECT * FROM cita;
-- 27. Consultar por fecha y hora

SELECT * FROM cita 
WHERE fecha_cita = '2026-06-01' AND hora_inicio = '09:00:00'; 

-- 28. Consultar por Tipo de Tratamiento

SELECT c.* , t.*
FROM cita c 
INNER JOIN tratamiento t ON c.id = t.id_cita 
WHERE t.procedimiento LIKE '%Blanqueamiento dental%';

-- 29. Consultar por servicio

SELECT c.*, s.* FROM cita c 
INNER JOIN tratamiento t ON c.id = t.id_cita
INNER JOIN servicio s on t.id_cita=s.id
WHERE s.nombre= 'Limpieza Dental'; 

-- 30. Consultar citas por documento paciente

SELECT c.*, cl.* FROM cita c 
INNER JOIN historial_medico h ON c.id_historial_medico =h.id
INNER JOIN paciente p on p.id = h.id_paciente
INNER JOIN cliente cl on cl.id=p.id_cliente
WHERE cl.numero_documento = '456789123';

-- 31. Consultar citas por odontólogo

SELECT c.* FROM cita c 
INNER JOIN odontologo o ON c.id_odontologo = o.id 
INNER JOIN cliente cl_odo ON o.id_cliente = cl_odo.id 
WHERE cl_odo.numero_documento = '798456123';

-- 32. Consultar citas por estado

	SELECT *
	FROM cita
	WHERE estado_cita='programada'
	
-- 33. Consultar por disponibilidad de agenda

SELECT COUNT(*) AS citas_existentes 
FROM cita 
WHERE id_odontologo=1 AND fecha_cita = '2026-04-20' AND hora_inicio = '08:00:00';


-- RF #7  y RF #9
-- 34. Consultar Tabla historial

SELECT * 
FROM historial_medico;

-- 35. Consultar por alergias

SELECT hm.*, a.nombre_alergia 
FROM historial_medico hm 
INNER JOIN historial_alergia ha on hm.id=ha.id_historial_medico
INNER JOIN alergia a ON ha.id_alergia = a.id 
WHERE a.nombre_alergia LIKE '%Penicilina%';

-- 36. Consultar por medicamentos

SELECT h.*, m.nombre_medicamento
FROM historial_medico h
INNER JOIN historial_medicamento hm on h.id=hm.id_historial_medico
INNER JOIN medicamento m ON hm.id_medicamento = m.id 
WHERE m.nombre_medicamento='Amoxicilina';

-- 37. Consultar por enfermedad sistémica

SELECT hm.*, e.nombre_enfermedad
FROM historial_medico hm 
INNER JOIN historial_enfermedad he on hm.id=he.id_historial_medico
INNER JOIN enfermedad_sistemica e ON he.id_enfermedad_sistemica = e.id 
WHERE e.nombre_enfermedad='Diabetes';

-- 38. Consultar por cirugías previas

SELECT hm.*, c.nombre_cirugia
FROM historial_medico hm 
INNER JOIN historial_cirugia hc on hm.id=hc.id_historial_medico
INNER JOIN cirugia_previa c ON hc.id_cirugia_previa = c.id 
WHERE c.nombre_cirugia='Extracción de cordales';

-- 39. Consultar por documento del paciente

SELECT h.*,c.* FROM historial_medico h
INNER JOIN paciente p ON p.id=h.id_paciente
INNER JOIN cliente c ON p.id_cliente = c.id 
WHERE c.numero_documento = '987654321';

-- RF #8
-- 40. Consultar tabla mapa dental

SELECT * FROM mapa_dental; 

-- 41. Consultar por cara afectada

SELECT m.*,t.* FROM mapa_dental m
INNER JOIN pieza_dental p on m.id=p.id_mapa
INNER JOIN tratamiento t on p.id=t.id_pieza_dental
WHERE t.cara_afectada = 'oclusal';

-- 42. Consultar por tratamiento

SELECT m.*,t.* FROM mapa_dental m
INNER JOIN pieza_dental p on m.id=p.id_mapa
INNER JOIN tratamiento t on p.id=t.id_pieza_dental;

-- 43. Consultar por fecha de la cita

SELECT m.*,t.*,c.fecha_cita FROM mapa_dental m
INNER JOIN pieza_dental p on m.id=p.id_mapa
INNER JOIN tratamiento t on p.id=t.id_pieza_dental
INNER JOIN cita c on c.id=t.id_cita
WHERE fecha_cita='2026-04-20';

-- 44. Consultar por descripción

SELECT * FROM mapa_dental 
WHERE observacion LIKE '%aries%'; 

-- 45. Consultar por documento del paciente

SELECT md.*, c.* FROM mapa_dental md
INNER JOIN historial_medico hm on hm.id_mapa_dental=md.id
INNER JOIN paciente p on hm.id_paciente=p.id
INNER JOIN cliente c on p.id_cliente=c.id
WHERE c.numero_documento='159357486';


-- RF #10 y RF #11
-- 46. Consultar tabla de pagos

SELECT * FROM pago;

-- 47. Consultar por Tipo de Pago

SELECT p.*, mp.* FROM pago p 
INNER JOIN metodo_pago mp ON p.id_metodo_pago = mp.id 
WHERE mp.nombre_metodo = 'Efectivo'; 

-- 48. Consultar por Tipo de servicio

SELECT p.*,s.nombre FROM pago p
INNER JOIN cita c on c.id=p.id_cita
INNER JOIN tratamiento t on c.id=t.id_cita
INNER JOIN servicio s on t.id_servicio=s.id
WHERE s.nombre='Consulta General';

-- 49. Consultar por Monto

SELECT * FROM pago 
WHERE monto_pago >= 20000; 

-- 50. Consultar por nombres del cliente

SELECT p.*,cl.* FROM pago p 
INNER JOIN cita c on c.id=p.id_cita
INNER JOIN historial_medico h on c.id_historial_medico=h.id
INNER JOIN paciente pc on pc.id=h.id_paciente
INNER JOIN cliente cl on cl.id=pc.id_cliente
WHERE cl.primer_nombre LIKE '%Luis%' or cl.segundo_nombre LIKE '%Luis%'; 

-- 51. Consultar por apellidos del cliente

SELECT p.*,cl.* FROM pago p 
INNER JOIN cita c on c.id=p.id_cita
INNER JOIN historial_medico h on c.id_historial_medico=h.id
INNER JOIN paciente pc on pc.id=h.id_paciente
INNER JOIN cliente cl on cl.id=pc.id_cliente
WHERE cl.primer_apellido LIKE '%Suárez%' or cl.segundo_apellido LIKE '%Suárez%'; 

-- 52. Consultar por documento del cliente

SELECT p.*,cl.* FROM pago p 
INNER JOIN cita c on c.id=p.id_cita
INNER JOIN historial_medico h on c.id_historial_medico=h.id
INNER JOIN paciente pc on pc.id=h.id_paciente
INNER JOIN cliente cl on cl.id=pc.id_cliente
WHERE cl.numero_documento='753951456';