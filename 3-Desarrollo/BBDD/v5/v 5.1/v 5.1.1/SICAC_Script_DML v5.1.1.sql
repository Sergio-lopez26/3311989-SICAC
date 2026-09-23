use sicac_v1;

-- Tabla Rol
insert into rol (rol) values
('administrador'),('odontologo'),('paciente');

-- Tabla Tipo Documento
insert into tipo_documento (sigla, nombre_documento) values
('CC','Cedula de Ciudadania'),
('TI','Tarjeta de Identidad'),
('CE','Cedula de Extranjeria');

-- Tabla Usuario
insert into usuario (email, password) values
('andrejur055@gmail.com', 'encriptaraqui01'),
('laura.martinez@gmail.com', 'clave001'),
('carlos.ruiz@gmail.com', 'clave002'),
('maria.lopez@gmail.com', 'clave003'),
('juan.castro@gmail.com', 'clave004'),
('sofia.torres@gmail.com', 'clave005'),
('andres.moreno@gmail.com', 'clave006'),
('luis.garcia@gmail.com', 'clave007'),
('paula.restrepo@gmail.com', 'clave008'),
('diego.herrera@gmail.com', 'clave009'),
('valentina.suarez@gmail.com', 'clave010');

-- Tabla Paciente
insert into paciente (id_usuario, id_tipo_documento, numero_documento, email, password, fecha_nacimiento, 
primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_celular, tipo_sangre, genero, 
nombre_acudiente, documento_acudiente, estado_paciente) values
(2, 1, '1023456789', 'laura.martinez@gmail.com', 'clave001', '2005-07-12', 'Laura', 'Sofía', 'Martínez', 'Gómez', '3114567890', 'A+', 'femenino', NULL, NULL, 'Activo'),
(4, 3, '456789123', 'maria.lopez@gmail.com', 'clave003', '1995-03-30', 'María', NULL, 'López', 'Ramírez', '3209876543', 'O-', 'femenino', NULL, NULL, 'Activo'),
(5, 1, '1547896320', 'juan.castro@gmail.com', 'clave004', '1992-09-15', 'Juan', 'David', 'Castro', NULL, '3102345678', 'AB+', 'masculino', NULL, NULL, 'Activo'),
(6, 1, '1122334455', 'sofia.torres@gmail.com', 'clave005', '2008-01-20', 'Sofía', 'Alejandra', 'Torres', 'Vargas', '3156789012', 'A-', 'femenino', NULL, NULL, 'Activo'),
(7, 1, '987654321', 'andres.moreno@gmail.com', 'clave006', '1985-06-10', 'Andrés', NULL, 'Moreno', 'Rojas', '3008765432', 'O+', 'masculino', NULL, NULL, 'Activo'),
(8, 3, '321654987', 'luis.garcia@gmail.com', 'clave007', '1990-12-05', 'Luis', 'Alberto', 'García', 'Jiménez', '3193456789', 'B-', 'masculino', NULL, NULL, 'Activo'),
(10, 2, '159357486', 'diego.herrera@gmail.com', 'clave009', '2010-12-27', 'Diego', NULL, 'Herrera', 'Ortiz', '3147890123', 'O+', 'masculino', 'Mario Herrera', '798789345', 'Activo'),
(11, 1, '753951456', 'valentina.suarez@gmail.com', 'clave010', '2000-10-09', 'Valentina', 'Lucía', 'Suárez', 'Mendoza', '3168901234', 'A+', 'femenino', NULL, NULL, 'Activo');

-- Tabla Medico
insert into medico (id_usuario, id_tipo_documento, numero_documento, email, password, nombres, apellidos, matricula_profesional, 
numero_celular, estado_medico) values
(1, 1, '1233504140', 'andrejur055@gmail.com', 'encriptaraqui01', 'Jeison Andrey', 'Sosa Epitia', 'OD-20543-COL', '3203720455', 'Activo'),
(3, 1, '798456123', 'carlos.ruiz@gmail.com', 'clave002', 'Carlos Andrés', 'Ruiz Pérez', 'OD-19543-COL', '3001234567', 'Activo'),
(9, 1, '741852963', 'paula.restrepo@gmail.com', 'clave008', 'Paula Andrea', 'Restrepo Cano', 'OD-31654-COL', '3125678901', 'Activo');

-- Tabla Rol_Usuario
insert into rol_usuario (id_rol, id_usuario) values
(1, 1), (3, 2), (2, 3), (3, 4), 
(3, 5), (3, 6), (3, 7), (3, 8), 
(2, 9), (3, 10), (3, 11);

/*
Con Valoración Inicial -> El pago sería gratuito ... solo ocurre la primera vez para cada paciente, es decir debe ser 
la unica opcion al solicitar la primera cita y luego se desactivaria
*/
-- Tabla Tipo Cita
insert into tipo_cita (tipo_cita) values
('Valoración Inicial'),
('Consulta General'),
('Control / Tratamiento');

-- Tabla Cita
insert into cita (id_tipo_cita, id_paciente, id_medico, fecha_cita, hora_inicio, hora_fin, estado_cita) values
(1, 2, 3, '2026-08-08', '08:00', '08:45', 'programada'),
(1, 3, 2, '2026-08-08', '08:00', '08:45', 'programada'),
(1, 4, 3, '2026-08-08', '08:45', '09:30', 'programada'),
(1, 5, 2, '2026-08-08', '08:45', '09:30', 'programada'),
(1, 6, 3, '2026-08-08', '09:30', '10:15', 'programada'),
(1, 1, 2, '2026-08-08', '09:30', '10:15', 'programada'),
(1, 8, 3, '2026-08-08', '10:15', '11:00', 'programada'),
(1, 7, 2, '2026-08-08', '11:15', '12:00', 'programada'),
(1, 2, 2, '2026-08-09', '10:30', '11:15', 'programada');

/*
El historial se crea durante la cita de valoracion inicial, luego de este se crea un primer diagnostico 
*/
-- Tabla Historial Medico
insert into historial_medico (id_paciente, antecedentes_medicos) values
(1, 'Paciente joven sin antecedentes sistémicos. Presenta terceros molares en evolución.'),
(2, 'Sin antecedentes médicos de relevancia. No reporta alergias ni cirugías recientes.'),
(3, 'Paciente hipertenso controlado con Enalapril. Alérgico a la Penicilina.'),
(4, 'Paciente asmática. Utiliza inhalador de Salbutamol en caso de crisis. Sin alergias medicamentosas.'),
(5, 'Diabetes Tipo 2 controlada con Metformina. Cuidado con tiempos de cicatrización.'),
(6, 'Trastorno de ansiedad generalizada ante procedimientos dentales. Sensibilidad dental alta.'),
(7, 'Paciente sin enfermedades crónicas.'),
(8, 'Paciente con problemas de coagulación (toma Aspirina de 100mg diaria). Reportar sangrado prolongado.');

/*
¿Se agrega descripción o mejor no?
*/
-- Tabla Tipo Medicamento
insert into tipo_medicamento (categoria_medicamento) values
('Analgésico'), ('Antibiótico'), 
('Antiinflamatorio'), ('Antialérgicos'), 
('Anestésicos'), ('Antifúngicos'), 
('Antivirales'), ('Ansiolíticos');

-- Tabla Medicamento
insert into medicamento (id_tipo_medicamento, nombre_medicamento) values
(1, 'Ibuprofeno'), (2, 'Amoxicilina'),
(1, 'Paracetamol'), (3, 'Diclofenaco'),
(1, 'Ketorolaco'), (2, 'Azitromicina');

/*
Si el odontologo lo requiere puede crear nuevos tipo de diagnostico a conveniencia
*/
-- Tabla Tipo Diagnostico
insert into tipo_diagnostico (nombre_diagnostico, descripcion) values
('Salud Bucal Óptima', 'Paciente sano, sin hallazgos patológicos detectables.'),
('Caries Dental', 'Pérdida de tejido duro dental por acción bacteriana.'),
('Gingivitis / Periodontitis', 'Enfermedad inflamatoria de las encías y tejidos de soporte.'),
('Anomalía de Posición/Oclusión', 'Problemas de alineación dental o mordida (para ortodoncia).'),
('Trauma / Fractura Dental', 'Ruptura parcial o total de la estructura dental por golpe o desgaste.'),
('Urgencia Odontológica', 'Dolor agudo, absceso o infección activa que requiere atención inmediata.');

/*
Se quita relacion directa con historial_medico, ya que al conocer la cita, y esta conocer al paciente, pues por ese camino 
el diagnostico conoce al historial_medico del paciente.

Con esto ahorramos espacio
*/
-- Tabla Diagnostico
insert into diagnostico (id_cita, id_tipo_diagnostico, motivo, observaciones, tratamiento_sugerido) values
(1, 2, 'Dolor agudo al comer dulces', 'Caries profunda en el molar 36 con compromiso de esmalte y dentina.', 'Restauración con resina compuesta de alta estética.'),

(2, 3, 'Sangrado espontáneo de encías', 'Gingivitis generalizada por acumulación severa de placa bacteriana.', 'Profilaxis profunda y detartraje. Educación en higiene oral.'),

(3, 4, 'Dientes torcidos y apiñados', 'Maloclusión Clase I con apiñamiento severo en el sector anterosuperior.', 'Remisión a ortodoncia para estudio completo con radiografías.'),

(4, 1, 'Control y revisión de rutina', 'Salud bucal óptima. Sin presencia de caries ni inflamación gingival.', 'Control preventivo y limpieza de rutina en 6 meses.'),

(5, 2, 'Sensibilidad extrema al frío y calor', 'Caries activa en molares 46 y 47. Pérdida parcial de estructura cúspide.', 'Calzaduras / Obturaciones con resina ionomérica.'),

(6, 5, 'Fractura en diente delantero por golpe', 'Fractura amelodentinaria en el diente 11 (incisivo central superior derecho) sin exposición de la pulpa.', 'Reconstrucción estética con resina de fotocurado.'),

(7, 6, 'Dolor insoportable e inflamación en la cara', 'Absceso periapical agudo en el molar 26. Infección activa evidente.', 'Drenaje inmediato, prescripción urgente de antibióticos y posterior endodoncia.'),

(8, 1, 'Revisión solicitada por el acudiente', 'Higiene oral adecuada. Encías sanas y estructuras dentales firmes.', 'Aplicación preventiva de sellantes en molares y flúor.');

-- Tabla Diagnostico_Medicamento
insert into diagnostico_medicamento (id_diagnostico, id_medicamento, estado_medicacion) values
(1, 1, 'Activo'),
(6, 4, 'Activo'),
(6, 3, 'Activo'),
(7, 2, 'Activo'),
(7, 5, 'Activo');

/*
Se deja Valoración Inicial en 0.00 puesto que no se cobrará por la valoración inicial
*/
-- Tabla Tipo Servicio
insert into tipo_servicio (tipo_servicio, descripcion, precio_actual) values
('Valoración Inicial', 'Valoración inicial y diagnóstico del paciente', 0.00),
('Limpieza Dental', 'Profilaxis y eliminación de placa bacteriana', 80000.00),
('Resina Dental', 'Restauración estética por caries', 120000.00),
('Extracción Simple', 'Extracción de pieza dental sin cirugía', 90000.00),
('Endodoncia', 'Tratamiento de conducto en diente afectado', 250000.00),
('Ortodoncia Control', 'Ajuste y control de brackets', 70000.00),
('Blanqueamiento Dental', 'Procedimiento estético para aclarar dientes', 180000.00),
('Sellantes', 'Aplicación de sellantes en molares', 60000.00),
('Radiografía Dental', 'Imagen diagnóstica de piezas dentales', 40000.00),
('Tratamiento de Encías', 'Manejo de gingivitis o periodontitis leve', 110000.00);

/*
Se opta por cambiar la relación 1 historial N servicios, por 1 diagnostico N servicios, ya que en un diagnostico durante una
cita, se pueden realizar varios servicio, los que quedaran "anclados" con el diagnostico en cuestión
*/
-- Tabla Servicio
insert into servicio (id_tipo_servicio, id_diagnostico, nombre_servicio, procedimiento, precio_aplicado) values
(3, 1, 'Restauración Resina Molar 36', 'Remoción de tejido cariado y reconstrucción con resina de alta estética.', 120000.00),
(10, 2, 'Detartraje Ultrasónico Ligero', 'Eliminación de cálculos supra-gingivales en zona anterior.', 95000.00),
(9, 3, 'Radiografía Panorámica', 'Toma de imagen diagnóstica completa para estudio de ortodoncia.', 40000.00),
(1, 4, 'Valoración Odontológica Inicial', 'Examen clínico completo de cavidad bucal, tejidos blandos y odontograma inicial.', 0.00),
(3, 5, 'Resinas en Molares 46 y 47', 'Obturaciones con resina ionomérica en caras oclusales.', 240000.00),
(3, 6, 'Reconstrucción Estética Incisivo 11', 'Modelado anatómico de borde incisal con resinas compuestas de fotocurado.', 150000.00),
(5, 7, 'Endodoncia de Urgencia (Fase 1)', 'Apertura de cámara pulpar y biomecánica inicial para drenaje.', 250000.00),
(4, 7, 'Extracción Simple de Resto Radicular', 'Exodoncia de remanente dental adyacente.', 90000.00),
(1, 8, 'Valoración Odontológica Inicial', 'Examen clínico completo adaptado a paciente menor de edad.', 0.00),
(8, 8, 'Sellantes en Primeros Molares', 'Limpieza previa y aplicación de resina fluida protectora.', 60000.00);

-- Tabla Mapa Dental
insert into mapa_dental (id_historial_medico, nombre_estandar, observacion_inicial, estado_mapa_dental) values
(1, 'FDI', 'Odontograma inicial de valoración realizado por trauma dental.', 'Activo'),
(2, 'FDI', 'Odontograma inicial de valoración. Se observan lesiones cariosas.', 'Activo'),
(3, 'FDI', 'Odontograma inicial de valoración. Control de higiene oral.', 'Activo'),
(4, 'FDI', 'Odontograma inicial de valoración para estudio de ortodoncia.', 'Activo'),
(5, 'FDI', 'Odontograma inicial de valoración. Paciente metabólicamente comprometido.', 'Activo'),
(6, 'FDI', 'Odontograma inicial de valoración. Múltiples focos bacterianos activos.', 'Activo'),
(7, 'FDI', 'Odontograma de urgencia. Paciente ingresa con dolor agudo e inflamación.', 'Activo'),
(8, 'FDI', 'Odontograma inicial de valoración preventivo en paciente adulto.', 'Activo');

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
Sana -> Sin problemas
Endodoncia -> En tratamiento
*/
-- Tabla Pieza Dental
insert into pieza_dental (id_mapa, nomenclatura_fdi, cuadrante, posicion, estado_inicial, estado_actual) values

(2, 11, 1, 1, 'Sana', 'Sana'), (2, 12, 1, 2, 'Sana', 'Sana'),
(2, 13, 1, 3, 'Sana', 'Sana'), (2, 14, 1, 4, 'Sana', 'Sana'),
(2, 15, 1, 5, 'Sana', 'Sana'), (2, 16, 1, 6, 'Sana', 'Sana'),
(2, 17, 1, 7, 'Sana', 'Sana'), (2, 18, 1, 8, 'Sana', 'Sana'),

(2, 21, 2, 1, 'Sana', 'Sana'), (2, 22, 2, 2, 'Sana', 'Sana'),
(2, 23, 2, 3, 'Sana', 'Sana'), (2, 24, 2, 4, 'Obturada', 'Obturada'),
(2, 25, 2, 5, 'Sana', 'Sana'), (2, 26, 2, 6, 'Sana', 'Sana'),
(2, 27, 2, 7, 'Sana', 'Sana'), (2, 28, 2, 8, 'Sana', 'Sana'),

(2, 31, 3, 1, 'Sana', 'Sana'), (2, 32, 3, 2, 'Sana', 'Sana'),
(2, 33, 3, 3, 'Sana', 'Sana'), (2, 34, 3, 4, 'Sana', 'Sana'),
(2, 35, 3, 5, 'Sana', 'Sana'), (2, 36, 3, 6, 'Caries', 'Obturada'),
(2, 37, 3, 7, 'Sana', 'Sana'), (2, 38, 3, 8, 'Sana', 'Sana'),

(2, 41, 4, 1, 'Sana', 'Sana'), (2, 42, 4, 2, 'Sana', 'Sana'),
(2, 43, 4, 3, 'Sana', 'Sana'), (2, 44, 4, 4, 'Sana', 'Sana'),
(2, 45, 4, 5, 'Sana', 'Sana'), (2, 46, 4, 6, 'Sana', 'Sana'),
(2, 47, 4, 7, 'Sana', 'Sana'), (2, 48, 4, 8, 'Sana', 'Sana');

-- Tabla Metodo Pago
insert into metodo_pago (nombre_metodo) values
('Efectivo'), ('Daviplata'), ('Nequi');

-- Tabla Pago
insert into pago (id_cita, id_metodo_pago, numero_pago, fecha_pago, monto_pagado, estado_pago) values
(1, 1, 'P-0001', '2026-08-08', 120000.00, 'pagado'),
(2, 2, 'P-0002', '2026-08-08', 80000.00, 'pendiente'),
(3, 3, 'P-0003', '2026-08-08', 40000.00, 'pagado'),
(4, 1, 'P-0004', '2026-08-08', 0.00, 'pagado'),
(5, 2, 'P-0005', '2026-08-08', 140000.00, 'pendiente'),
(6, 3, 'P-0006', '2026-08-08', 150000.00, 'completado'),
(7, 1, 'P-0007', '2026-08-08', 200000.00, 'pendiente'),
(8, 2, 'P-0008', '2026-08-08', 60000.00, 'pagado');
