-- Tabla Tipo Documento
insert into tipo_documento (sigla, nombre_documento, estado) values
('CC','Cedula de Ciudadania','activo'),
('TI','Tarjeta de Identidad','activo'),
('CE','Cedula de Extranjeria','activo');


-- Tabla Autorizacion
insert into autorizacion (rol) values
('administrador'),('odontologo'),('paciente');


/*
Se deja Consulta General en 0.00 puesto que no se cobrará por la validación inicial
-> duracion time(0)
*/
-- Tabla Servicio
insert into servicio (nombre, descripcion, precio_actual, duracion) values
('Consulta General', 'Valoración inicial y diagnóstico del paciente', 0.00, '00:30:00'),
('Limpieza Dental', 'Profilaxis y eliminación de placa bacteriana', 80000.00, '00:45:00'),
('Resina Dental', 'Restauración estética por caries', 120000.00, '00:45:00'),
('Extracción Simple', 'Extracción de pieza dental sin cirugía', 90000.00, '00:30:00'),
('Endodoncia', 'Tratamiento de conducto en diente afectado', 250000.00, '01:00:00'),
('Ortodoncia Control', 'Ajuste y control de brackets', 70000.00, '00:30:00'),
('Blanqueamiento Dental', 'Procedimiento estético para aclarar dientes', 180000.00, '01:00:00'),
('Sellantes', 'Aplicación de sellantes en molares', 60000.00, '00:30:00'),
('Radiografía Dental', 'Imagen diagnóstica de piezas dentales', 40000.00, '00:20:00'),
('Tratamiento de Encías', 'Manejo de gingivitis o periodontitis leve', 110000.00, '00:45:00');


-- Tabla Metodo Pago
insert into metodo_pago (nombre_metodo) values
('Efectivo'), ('Daviplata'), ('Nequi');


-- Tabla Alergia
insert into alergia (nombre_alergia) values
('Penicilina'), ('Anestesia'), ('Látex'), ('Ibuprofeno');


-- Tabla Enfermedad Sistemica
insert into enfermedad_sistemica (nombre_enfermedad, descripcion_enfermedad) values
('Diabetes', 'Enfermedad metabólica crónica'),
('Hipertensión', 'Presión arterial elevada'),
('Asma', 'Enfermedad respiratoria'),
('Hipotiroidismo', 'Trastorno hormonal');


-- Tabla Cirugia Previa
insert into cirugia_previa (tipo_cirugia, nombre_cirugia) values
('Oral', 'Extracción de cordales'), 
('Oral', 'Cirugía periodontal'),
('Maxilofacial', 'Cirugía ortognática'), 
('Oral', 'Implante dental'),
('General', 'Apendicectomía');


-- Tabla Medicamento
insert into medicamento (nombre_medicamento, tipo_medicamento) values
('Ibuprofeno', 'Analgésico'), ('Amoxicilina', 'Antibiótico'),
('Paracetamol', 'Analgésico'), ('Diclofenaco', 'Antiinflamatorio'),
('Ketorolaco', 'Analgésico'), ('Azitromicina', 'Antibiótico');


-- Tabla Cliente
insert into cliente (id_tipo_documento, numero_documento, email, password, fecha_nacimiento, 
primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre) values
(1, '1233504140', 'andrejur055@gmail.com', 'encriptaraqui01', '1999-02-09', 'Jeison', 'Andrey', 'Sosa','Espitia', '3203720455', 'O+'),
(2, '1023456789', 'laura.martinez@gmail.com', 'clave01', '2005-07-12', 'Laura', 'Sofía', 'Martínez', 'Gómez', '3114567890', 'A+'),
(1, '798456123', 'carlos.ruiz@gmail.com', 'clave02', '1988-11-23', 'Carlos', 'Andrés', 'Ruiz', 'Pérez', '3001234567', 'B+'),
(3, '456789123', 'maria.lopez@gmail.com', 'clave03', '1995-03-30', 'María', NULL, 'López', 'Ramírez', '3209876543', 'O-'),
(1, '1547896320', 'juan.castro@gmail.com', 'clave04', '1992-09-15', 'Juan', 'David', 'Castro', NULL, '3102345678', 'AB+'),
(2, '1122334455', 'sofia.torres@gmail.com', 'clave05', '2008-01-20', 'Sofía', 'Alejandra', 'Torres', 'Vargas', '3156789012', 'A-'),
(1, '987654321', 'andres.moreno@gmail.com', 'clave06', '1985-06-10', 'Andrés', NULL, 'Moreno', 'Rojas', '3008765432', 'O+'),
(3, '321654987', 'luis.garcia@gmail.com', 'clave07', '1990-12-05', 'Luis', 'Alberto', 'García', 'Jiménez', '3193456789', 'B-'),
(1, '741852963', 'paula.restrepo@gmail.com', 'clave08', '1998-04-18', 'Paula', 'Andrea', 'Restrepo', 'Cano', '3125678901', 'AB-'),
(2, '159357486', 'diego.herrera@gmail.com', 'clave09', '2006-08-27', 'Diego', NULL, 'Herrera', 'Ortiz', '3147890123', 'O+'),
(1, '753951456', 'valentina.suarez@gmail.com', 'clave10', '2000-10-09', 'Valentina', 'Lucía', 'Suárez', 'Mendoza', '3168901234', 'A+');


-- Tabla Autorizacion_Cliente
insert into autorizacion_cliente (rol, id_cliente) values
('administrador', 1), ('paciente', 2), 
('paciente', 6), ('paciente', 1),
('odontologo', 9), ('paciente', 4), 
('paciente', 7), ('paciente', 10),
('odontologo', 3), ('paciente', 5), 
('paciente', 8), ('paciente', 11);


-- Tabla Administrador
insert into administrador (id_cliente) values (1);


-- Tabla Odontologo
insert into odontologo (id_cliente, estado_odontologo, fecha_registro, especializacion) values
(9, 'activo', '2026-04-13', 'Odontologia General'), 
(3, 'activo', '2026-04-13', 'Ortodoncia');


-- Tabla Paciente
insert into paciente (id_cliente, fecha_registro, estado_paciente) values
(2, '2026-04-14', 'activo'), (6, '2026-04-14', 'activo'), 
(1, '2026-04-14', 'activo'), (4, '2026-04-14', 'activo'), 
(7, '2026-04-14', 'activo'), (10, '2026-04-14', 'activo'),
(5, '2026-04-14', 'activo'), (8, '2026-04-14', 'activo'),cC 
(11, '2026-04-14', 'activo');


-- Tabla Mapa Dental
insert into mapa_dental (fecha_registro, nombre_estandar, estado, observacion) values
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
Cuadrante: Indica la esquina de la boca en que está la pieza dental -> 1: Superior Derecho / 2: Superior Izquierdo 
																	   3: Inferior Izquierdo / 4: Inferior Derecho
Posicion: Indica el tipo de diente y su distancia desde la linea media del rostro hacia la parte de atras de la boca
       -> 1: Incisivo Central (al frente) / 2: Incisivo Lateral / 3: Canino (colmillo) / 4: Primer Premolar / 5: Segundo Premolar
	      6: Primer Molar / 7: Segundo Molar / 8: Tercer Molar (muela del juicio, al fondo)
Nomenclatura_fdi: Unión del numero del cuadrante y la posicion a la que pertenece el diente
			   -> 18,17,16 | 15,14 | 13 | 12,11 | 21,22 | 23 | 24,25 | 26,27,28
			      48,47,46 | 45,44 | 43 | 42,41 | 31,32 | 33 | 34,35 | 36,37,38
*/
/*
Posibles Estados de una pieza:
Caries -> lesion presente
Obturada -> Tiene calza
Sana -> SIn problemas
Endodoncia -> En tratamiento
*/

-- Tabla Pieza Dental
insert into pieza_dental (id_mapa, cuadrante, posicion, nomenclatura_fdi, estado_pieza) values
(2, 1, 1, '11', 'Sana'), (2, 1, 2, '12', 'Sana'), 
(2, 1, 3, '13', 'Sana'), (2, 1, 4, '14', 'Obturada'),
(2, 1, 5, '15', 'Caries'), (2, 1, 6, '16', 'Obturada'), 
(2, 1, 7, '17', 'Sana'), (2, 1, 8, '18', 'Ausente'),

(2, 2, 1, '21', 'Sana'), (2, 2, 2, '22', 'Sana'), 
(2, 2, 3, '23', 'Sana'), (2, 2, 4, '24', 'Obturada'),
(2, 2, 5, '25', 'Sana'), (2, 2, 6, '26', 'Caries'), 
(2, 2, 7, '27', 'Obturada'), (2, 2, 8, '28', 'Ausente'),

(2, 3, 1, '31', 'Sana'), (2, 3, 2, '32', 'Sana'), 
(2, 3, 3, '33', 'Sana'), (2, 3, 4, '34', 'Obturada'),
(2, 3, 5, '35', 'Sana'), (2, 3, 6, '36', 'Endodoncia'), 
(2, 3, 7, '37', 'Obturada'), (2, 3, 8, '38', 'Ausente'),

(2, 4, 1, '41', 'Sana'), (2, 4, 2, '42', 'Sana'), 
(2, 4, 3, '43', 'Sana'), (2, 4, 4, '44', 'Obturada'),
(2, 4, 5, '45', 'Sana'), (2, 4, 6, '46', 'Caries'), 
(2, 4, 7, '47', 'Obturada'), (2, 4, 8, '48', 'Ausente');


-- Tabla Historial Medico
insert into historial_medico (id_paciente, id_mapa_dental) values
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9);


-- Tabla Cita
insert into cita (id_historial_medico, id_odontologo, fecha_cita, hora_inicio, hora_fin, estado_cita) values
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
insert into pago (id_cita, numero_pago, id_metodo_pago, fecha_pago, monto_pago, estado_pago) values
(1, 'P-0001', 1, '2026-04-20', 0.00, 'pagado'),
(2, 'P-0002', 2, '2026-04-20', 80000.00, 'pagado'),
(3, 'P-0003', 3, '2026-04-20', 50000.00, 'pendiente'),
(4, 'P-0004', 1, '2026-04-20', 90000.00, 'pagado'),
(5, 'P-0005', 2, '2026-04-20', 100000.00, 'pendiente'),
(6, 'P-0006', 3, '2026-04-21', 70000.00, 'pagado'),
(7, 'P-0007', 1, '2026-04-20', 180000.00, 'pendiente'),
(8, 'P-0008', 2, '2026-04-20', 60000.00, 'pagado'),
(9, 'P-0009', 3, '2026-04-20', 50000.00, 'pendiente'),
(10, 'P-0010', 1, '2026-04-20', 120000.00, 'pagado');


/*
-> cara_afectada está como null, ya que tratamientos como validacion, blanqueamiento o limpieza son generales (aplican a todas las piezas)
-> id_pieza_dental está como null también, ya que como en cara afectada, algunos tratamientos pueden ser generales
Por ende:
-->Si no hay pieza_dental; no hay cara_afectada
-->Si hay pieza_dental; si o si debe haber cara_afectada
*/
-- Tabla Tratamiento
insert into tratamiento (id_cita, id_servicio, id_pieza_dental, cara_afectada, procedimiento, estado, precio_aplicado) values
(1, 1, NULL, NULL, 'Valoración general del paciente', 'finalizado', 0.00),
(2, 2, NULL, NULL, 'Limpieza y profilaxis completa', 'finalizado', 80000.00),
(3, 3, 16, 'oclusal', 'Resina por caries en molar', 'en_proceso', 120000.00),
(4, 4, 18, 'oclusal', 'Extracción de cordal superior', 'programado', 90000.00),
(5, 5, 26, 'oclusal', 'Endodoncia en molar superior', 'en_proceso', 250000.00),
(6, 6, NULL, NULL, 'Control y ajuste de ortodoncia', 'finalizado', 70000.00),
(7, 7, NULL, NULL, 'Blanqueamiento dental', 'programado', 180000.00),
(8, 8, 36, 'oclusal', 'Aplicación de sellante', 'finalizado', 60000.00),
(9, 10, NULL, NULL, 'Tratamiento de encías', 'en_proceso', 110000.00),
(10, 3, 11, 'vestibular', 'Resina estética en incisivo', 'finalizado', 120000.00);


-- Tabla Historial Alergia
insert into historial_alergia (id_historial_medico, id_alergia, nivel_alergia, estado_alergia) values
(1, 1, 'Alta', 'Activa'),
(2, 2, 'Media', 'Activa'),
(4, 3, 'Baja', 'Activa'),
(5, 4, 'Media', 'Activa');


-- Tabla Historial Enfermedad
insert into historial_enfermedad (id_historial_medico, id_enfermedad_sistemica, estado_enfermedad, fecha_diagnostico) values
(1, 1, 'Controlada', '2018-06-10'), (2, 2, 'En tratamiento', '2020-09-12'),
(4, 3, 'Controlada', '2015-03-08'), (5, 4, 'En tratamiento', '2019-11-20');


-- Tabla Historial Medicamento
insert into historial_medicamento (id_historial_medico, id_medicamento, fecha_medicacion, estado_medicacion) values
(1, 1, '2026-04-10', 'Finalizado'), (2, 2, '2026-04-11', 'En tratamiento'),
(3, 3, '2026-04-12', 'Finalizado'), (4, 4, '2026-04-13', 'Suspendido'),
(5, 5, '2026-04-14', 'Finalizado'), (6, 6, '2026-04-15', 'En tratamiento');



-- Tabla Historial Cirugia
insert into historial_cirugia (id_historial_medico, id_cirugia_previa, fecha_cirugia, efectos_secundarios, estado_cirugia) values
(1, 1, '2020-05-10', 'Inflamación leve', 'Recuperado'),
(2, 2, '2021-07-15', 'Sangrado moderado', 'Recuperado'),
(3, 3, '2019-03-20', NULL, 'Recuperado'),
(4, 4, '2022-11-01', 'Dolor postoperatorio', 'En seguimiento'),
(5, 5, '2018-08-25', NULL, 'Recuperado');

/* Comprobación y depuración de errores */
select *from historial_cirugia; -- Se comprobaron los registros de cada tabla
drop table cita cascade; -- Sirve para eliminar la tabla en concreto junto a los registros o relaciones de las tablas hijas







