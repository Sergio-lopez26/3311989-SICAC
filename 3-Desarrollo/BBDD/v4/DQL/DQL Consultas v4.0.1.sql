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

RF #5 y RF #6
26. consultar tabla citas
SELECT * FROM cita; 
	27. Consultar por fecha y hora
SELECT * FROM cita 
WHERE fecha_cita = '2026-06-01' AND hora_inicio = '09:00:00'; 
	28. Consultar por Tipo de Tratamiento
SELECT c.* 
FROM cita c 
INNER JOIN tratamiento t ON c.id_tratamiento = t.id 
WHERE t.procedimiento LIKE '%Diseño de sonrisa%'; 
	29. Consultar por servicio
	SELECT c.* FROM cita c 
INNER JOIN servicio s ON c.id_servicio = s.id 
WHERE s.nombre= 'Blanqueamiento'; 
	30. Consultar citas por paciente
SELECT c.* FROM cita c 
INNER JOIN cliente cl ON c.id_cliente = cl.id 
WHERE cl.numero_documento = '10203040'; 
	31. Consultar citas por odontólogo
	SELECT c.* FROM cita c 
INNER JOIN odontologo o ON c.id_odontologo = o.id 
INNER JOIN cliente cl_odo ON o.id_cliente = cl_odo.id 
WHERE cl_odo.numero_documento = '80123456'; 
	32. Consultar citas por estado
	SELECT *
	FROM cita
	WHERE estado_cita=”activa”
33. Consultar por disponibilidad de agenda
SELECT COUNT(*) AS citas_existentes 
FROM cita 
WHERE id_odontologo = 1 AND fecha_cita = '2026-06-01' AND hora_inicio = '09:00:00'; 




RF #7  y RF #9
34. Consultar Tabla historial
SELECT * 
FROM historial_medico
	35. Consultar por alergias
	SELECT hc.*, a.nombre_alergia 
FROM historial_medico hm 
INNER JOIN alergia a ON hm.id_alergia = a.id 
WHERE a.nombre_alergia LIKE '%Penicilina%'; 
	36. Consultar por medicamentos
	SELECT hc.*, m.nombre_enfermedad
FROM historial_medico hm 
INNER JOIN enfermedad e ON hm.id_enfermedad = a.id 
WHERE a.nombre_alergia LIKE '%Penicilina%';
	37. Consultar por enfermedad sistémica
	SELECT hc.* FROM historial_clinico hc 
INNER JOIN enfermedad_sistemica e ON hc.id_enfermedad = e.id 
WHERE e.nombre_enfermedad LIKE '%Diabetes%'; 
	38. Consultar por cirugías previas
SELECT hc.* FROM historial_clinico hc 
INNER JOIN cirugia_previa cp ON hc.id_cirugia = cp.id 
WHERE cp.descripcion_cirugia LIKE '%Extracción de cordales%'; 
39. Consultar por documento del paciente
SELECT hc.* FROM historial_clinico hc 
INNER JOIN cliente cl ON hc.id_cliente = cl.id 
WHERE cl.numero_documento = '10203040'; 
RF #8
40. Consultar tabla mapa dental
SELECT * FROM mapa_dental; 
	41. Consultar por cara afectada
	SELECT * FROM mapa_dental 
WHERE cara_dental = 'Oclusal'; 
	42. Consultar por tratamiento
SELECT md.* FROM mapa_dental md 
INNER JOIN tratamiento t ON md.id_tratamiento = t.id 
WHERE t.nombre_tratamiento = 'Resina'; 
	43. Consultar por fecha de la cita
SELECT md.* FROM mapa_dental md 
INNER JOIN cita c ON md.id_cita = c.id 
WHERE c.fecha_cita = '2026-05-20'; 
	44. Consultar por descripción
SELECT * FROM mapa_dental 
WHERE descripcion_hallazgo LIKE '%Caries profunda%'; 
	45. Consultar por documento del paciente
SELECT md.* FROM mapa_dental md 
INNER JOIN cliente cl ON md.id_cliente = cl.id 
WHERE cl.numero_documento = '10203040'; 
RF #10 y RF #11
46. Consultar tabla de pagos
SELECT * FROM pago; 
	47. Consultar por Tipo de Pago
	SELECT p.* FROM pago p 
INNER JOIN tipo_pago tp ON p.id_tipo_pago = tp.id 
WHERE tp.nombre_tipo_pago = 'Efectivo'; 
48. Consultar por Tipo de servicio
SELECT p.* FROM pago p 
INNER JOIN cita c ON p.id_cita = c.id 
INNER JOIN servicio s ON c.id_servicio = s.id 
WHERE s.nombre_servicio = 'Profilaxis'; 
49. Consultar por Monto
SELECT * FROM pago 
WHERE monto_pago >= 200000; 
50. Consultar por nombres del cliente
SELECT p.* FROM pago p 
INNER JOIN cliente cl ON p.id_cliente = cl.id 
WHERE cl.nombres LIKE '%Carlos%'; 
51. Consultar por apellidos del cliente
SELECT p.* FROM pago p 
INNER JOIN cliente cl ON p.id_cliente = cl.id 
WHERE cl.apellidos LIKE '%Pérez%'; 
52. Consultar por documento del cliente
SELECT p.* FROM pago p 
INNER JOIN cliente cl ON p.id_cliente = cl.id 
WHERE cl.numero_documento = '10203040'; 
