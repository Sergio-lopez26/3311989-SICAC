-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: sicac 2.0
-- ------------------------------------------------------
-- Server version	8.0.3-rc-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cliente_administrador` (`id_cliente`),
  CONSTRAINT `fk_cliente_administrador` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
INSERT INTO `administrador` VALUES (1,1);
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alergia`
--

DROP TABLE IF EXISTS `alergia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alergia` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nombre_alergia` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_alergia` (`nombre_alergia`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alergia`
--

LOCK TABLES `alergia` WRITE;
/*!40000 ALTER TABLE `alergia` DISABLE KEYS */;
INSERT INTO `alergia` VALUES (3,'Alergia a los frutos secos'),(2,'Alergia a los mariscos'),(1,'Alergia al mani');
/*!40000 ALTER TABLE `alergia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `autorizacion`
--

DROP TABLE IF EXISTS `autorizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorizacion` (
  `rol` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autorizacion`
--

LOCK TABLES `autorizacion` WRITE;
/*!40000 ALTER TABLE `autorizacion` DISABLE KEYS */;
INSERT INTO `autorizacion` VALUES ('admin'),('odontologo'),('paciente');
/*!40000 ALTER TABLE `autorizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `autorizacion_cliente`
--

DROP TABLE IF EXISTS `autorizacion_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorizacion_cliente` (
  `rol` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `id_cliente` int(10) NOT NULL,
  PRIMARY KEY (`rol`,`id_cliente`),
  KEY `fk_cliente_autorizacion` (`id_cliente`),
  CONSTRAINT `fk_autorizacion_cliente` FOREIGN KEY (`rol`) REFERENCES `autorizacion` (`rol`),
  CONSTRAINT `fk_cliente_autorizacion` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autorizacion_cliente`
--

LOCK TABLES `autorizacion_cliente` WRITE;
/*!40000 ALTER TABLE `autorizacion_cliente` DISABLE KEYS */;
INSERT INTO `autorizacion_cliente` VALUES ('admin',1),('odontologo',1),('paciente',2);
/*!40000 ALTER TABLE `autorizacion_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cirugia_previa`
--

DROP TABLE IF EXISTS `cirugia_previa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cirugia_previa` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `tipo_cirugia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre_cirugia` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_cirugia` (`tipo_cirugia`,`nombre_cirugia`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cirugia_previa`
--

LOCK TABLES `cirugia_previa` WRITE;
/*!40000 ALTER TABLE `cirugia_previa` DISABLE KEYS */;
INSERT INTO `cirugia_previa` VALUES (3,'General','Amigdalectomía'),(2,'General','Apendicectomía'),(1,'Ninguna','Ninguna'),(4,'Odontológica','Extracción dental');
/*!40000 ALTER TABLE `cirugia_previa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cita`
--

DROP TABLE IF EXISTS `cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cita` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_historial_medico` int(10) NOT NULL,
  `id_odontologo` int(10) NOT NULL,
  `fecha_cita` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `estado_cita` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_historial_cita` (`id_historial_medico`),
  KEY `fk_odontologo_cita` (`id_odontologo`),
  CONSTRAINT `fk_historial_cita` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`),
  CONSTRAINT `fk_odontologo_cita` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita`
--

LOCK TABLES `cita` WRITE;
/*!40000 ALTER TABLE `cita` DISABLE KEYS */;
INSERT INTO `cita` VALUES (1,1,1,'2026-03-17','09:00:00','09:45:00','Programada'),(2,1,1,'2026-03-12','09:00:00','09:45:00','Atendida'),(3,1,1,'2026-03-13','09:00:00','09:45:00','Cancelada');
/*!40000 ALTER TABLE `cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_tipo_documento` int(10) NOT NULL,
  `numero_documento` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `primer_nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `segundo_nombre` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `primer_apellido` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `segundo_apellido` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `numero_celular` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_sangre` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_email` (`email`),
  UNIQUE KEY `uc_cliente` (`id_tipo_documento`,`numero_documento`),
  CONSTRAINT `fk_tipo_documento_cliente` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,1,'1233504140','andrejur055@gmail.com','pass','1999-02-09','Jeison','Andrey','Sosa','Espitia','3203720455','O+'),(2,1,'809070','cubimoji@gmail.com','password','2007-03-16','Jhojan',NULL,'Mojica',NULL,'3139070901','AB-');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enfermedad_sistemica`
--

DROP TABLE IF EXISTS `enfermedad_sistemica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enfermedad_sistemica` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nombre_enfermedad` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `descripción_enfermedad` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_enfermedad` (`nombre_enfermedad`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enfermedad_sistemica`
--

LOCK TABLES `enfermedad_sistemica` WRITE;
/*!40000 ALTER TABLE `enfermedad_sistemica` DISABLE KEYS */;
INSERT INTO `enfermedad_sistemica` VALUES (1,'Diabetes','Enfermedad crónica en la que el cuerpo no produce suficiente insulina o no la usa correctamente'),(2,'Hipertension','Condición en la que la presión de la sangre contra las paredes de las arterias es demasiado alta de forma constante'),(3,'Asma','Enfermedad respiratoria crónica en la que las vías respiratorias se inflaman y se estrechan');
/*!40000 ALTER TABLE `enfermedad_sistemica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_alergia`
--

DROP TABLE IF EXISTS `historial_alergia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_alergia` (
  `id_historial_medico` int(10) NOT NULL,
  `id_alergia` int(10) NOT NULL,
  `nivel_alergia` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `estado_alergia` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_alergia`),
  UNIQUE KEY `uc_historial_alergia` (`id_historial_medico`,`id_alergia`),
  KEY `fk_historial_alergia` (`id_alergia`),
  CONSTRAINT `fk_historial_alergia` FOREIGN KEY (`id_alergia`) REFERENCES `alergia` (`id`),
  CONSTRAINT `fk_historial_medico_alergia` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_alergia`
--

LOCK TABLES `historial_alergia` WRITE;
/*!40000 ALTER TABLE `historial_alergia` DISABLE KEYS */;
INSERT INTO `historial_alergia` VALUES (1,1,'Leve','Activo'),(1,2,'Moderada','Activo');
/*!40000 ALTER TABLE `historial_alergia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_cirugia`
--

DROP TABLE IF EXISTS `historial_cirugia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_cirugia` (
  `id_historial_medico` int(10) NOT NULL,
  `id_cirugia_previa` int(10) NOT NULL,
  `fecha_cirugia` date NOT NULL,
  `efectos_secundarios` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado_cirugia` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_cirugia_previa`),
  UNIQUE KEY `uc_historial_cirugia` (`id_historial_medico`,`id_cirugia_previa`),
  KEY `fk_historial_cirugia` (`id_cirugia_previa`),
  CONSTRAINT `fk_historial_cirugia` FOREIGN KEY (`id_cirugia_previa`) REFERENCES `cirugia_previa` (`id`),
  CONSTRAINT `fk_historial_medico_cirugia` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cirugia`
--

LOCK TABLES `historial_cirugia` WRITE;
/*!40000 ALTER TABLE `historial_cirugia` DISABLE KEYS */;
INSERT INTO `historial_cirugia` VALUES (1,4,'2025-12-28','Ninguno','Finalizada');
/*!40000 ALTER TABLE `historial_cirugia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_enfermedad`
--

DROP TABLE IF EXISTS `historial_enfermedad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_enfermedad` (
  `id_historial_medico` int(10) NOT NULL,
  `id_enfermedad_sistemica` int(10) NOT NULL,
  `estado_enfermedad` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_diagnostico` date NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_enfermedad_sistemica`),
  UNIQUE KEY `uc_historial_enfermedad` (`id_historial_medico`,`id_enfermedad_sistemica`),
  KEY `fk_historial_enfermedad` (`id_enfermedad_sistemica`),
  CONSTRAINT `fk_historial_enfermedad` FOREIGN KEY (`id_enfermedad_sistemica`) REFERENCES `enfermedad_sistemica` (`id`),
  CONSTRAINT `fk_historial_medico_enfermedad` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_enfermedad`
--

LOCK TABLES `historial_enfermedad` WRITE;
/*!40000 ALTER TABLE `historial_enfermedad` DISABLE KEYS */;
INSERT INTO `historial_enfermedad` VALUES (1,2,'Activa','2017-01-02'),(1,3,'Activa','2026-02-08');
/*!40000 ALTER TABLE `historial_enfermedad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_medicamento`
--

DROP TABLE IF EXISTS `historial_medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_medicamento` (
  `id_historial_medico` int(10) NOT NULL,
  `id_medicamento` int(10) NOT NULL,
  `fecha_medicacion` date NOT NULL,
  `estado_medicacion` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_medicamento`),
  UNIQUE KEY `uc_historial_medicamento` (`id_historial_medico`,`id_medicamento`),
  KEY `fk_historial_medicamento` (`id_medicamento`),
  CONSTRAINT `fk_historial_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id`),
  CONSTRAINT `fk_historial_medico_medicamento` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medicamento`
--

LOCK TABLES `historial_medicamento` WRITE;
/*!40000 ALTER TABLE `historial_medicamento` DISABLE KEYS */;
INSERT INTO `historial_medicamento` VALUES (1,1,'2025-12-05','Activa'),(1,2,'2024-11-23','Inactiva'),(1,3,'2026-02-19','Activa');
/*!40000 ALTER TABLE `historial_medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_medico`
--

DROP TABLE IF EXISTS `historial_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_medico` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_paciente` int(10) NOT NULL,
  `id_mapa_dental` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_historial_medico` (`id_paciente`,`id_mapa_dental`),
  KEY `fk_mapa_dental_historial_medico` (`id_mapa_dental`),
  CONSTRAINT `fk_mapa_dental_historial_medico` FOREIGN KEY (`id_mapa_dental`) REFERENCES `mapa_dental` (`id`),
  CONSTRAINT `fk_paciente_historial` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medico`
--

LOCK TABLES `historial_medico` WRITE;
/*!40000 ALTER TABLE `historial_medico` DISABLE KEYS */;
INSERT INTO `historial_medico` VALUES (1,1,1);
/*!40000 ALTER TABLE `historial_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mapa_dental`
--

DROP TABLE IF EXISTS `mapa_dental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mapa_dental` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `fecha_registro` date NOT NULL,
  `nombre_estandar` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `observacion` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapa_dental`
--

LOCK TABLES `mapa_dental` WRITE;
/*!40000 ALTER TABLE `mapa_dental` DISABLE KEYS */;
INSERT INTO `mapa_dental` VALUES (1,'2026-03-16','Sistema Universal','Activo','Mapa creado');
/*!40000 ALTER TABLE `mapa_dental` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamento`
--

DROP TABLE IF EXISTS `medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamento` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nombre_medicamento` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_medicamento` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_medicamento` (`nombre_medicamento`,`tipo_medicamento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamento`
--

LOCK TABLES `medicamento` WRITE;
/*!40000 ALTER TABLE `medicamento` DISABLE KEYS */;
INSERT INTO `medicamento` VALUES (2,'Amoxicilina','Antibiótico'),(3,'Ibuproofeno','Antiinflamatorio'),(1,'Paracetamol','Analgésico');
/*!40000 ALTER TABLE `medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_pago`
--

DROP TABLE IF EXISTS `metodo_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_pago` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nombre_metodo` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_metodo_pago` (`nombre_metodo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_pago`
--

LOCK TABLES `metodo_pago` WRITE;
/*!40000 ALTER TABLE `metodo_pago` DISABLE KEYS */;
INSERT INTO `metodo_pago` VALUES (2,'Daviplata'),(1,'Efectivo'),(3,'Nequi');
/*!40000 ALTER TABLE `metodo_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `odontologo`
--

DROP TABLE IF EXISTS `odontologo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `odontologo` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(10) NOT NULL,
  `estado_odontologo` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_registro` date NOT NULL,
  `especializacion` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cliente_odontologo` (`id_cliente`),
  CONSTRAINT `fk_cliente_odontologo` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `odontologo`
--

LOCK TABLES `odontologo` WRITE;
/*!40000 ALTER TABLE `odontologo` DISABLE KEYS */;
INSERT INTO `odontologo` VALUES (1,1,'Activo','2026-03-16','Ortodoncia');
/*!40000 ALTER TABLE `odontologo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(10) NOT NULL,
  `fecha_registro` date NOT NULL,
  `estado_paciente` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cliente_paciente` (`id_cliente`),
  CONSTRAINT `fk_cliente_paciente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (1,2,'2026-03-16','Activo');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) NOT NULL,
  `numero_pago` int(10) NOT NULL,
  `id_metodo_pago` int(10) NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `estado_pago` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_pago` (`numero_pago`),
  KEY `flk_cita_pago` (`id_cita`),
  KEY `fk_metodo_pago` (`id_metodo_pago`),
  CONSTRAINT `fk_metodo_pago` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id`),
  CONSTRAINT `flk_cita_pago` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (4,1,2026001,3,'2026-03-17',95000.00,'Pendiente'),(5,2,2026002,2,'2026-03-12',155000.00,'Procesado'),(6,3,2026003,1,'2026-03-13',75000.00,'Cancelado');
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pieza_dental`
--

DROP TABLE IF EXISTS `pieza_dental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pieza_dental` (
  `id` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `id_mapa` int(10) NOT NULL,
  `numero_pieza` int(10) NOT NULL,
  `nomeclatura_fdi` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `estado_pieza` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `posicion` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_pieza_dental` (`id_mapa`,`numero_pieza`),
  CONSTRAINT `fk_mapa_diente` FOREIGN KEY (`id_mapa`) REFERENCES `mapa_dental` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pieza_dental`
--

LOCK TABLES `pieza_dental` WRITE;
/*!40000 ALTER TABLE `pieza_dental` DISABLE KEYS */;
INSERT INTO `pieza_dental` VALUES ('1',1,1,'11','Sana','Incisivo','superior derecha'),('2',1,2,'26','Caries','Molar','superior izquierda'),('3',1,3,'43','Restaurada','Canino','inferior derecha');
/*!40000 ALTER TABLE `pieza_dental` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  `precio_actual` decimal(10,2) NOT NULL,
  `duracion` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_servicio` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
INSERT INTO `servicio` VALUES (1,'Limpieza Dental','Eliminación de placa y sarro para mantener la salud bucal',50000.00,'30 minutos'),(2,'Tratamiento de Caries','Remoción de tejido dañado y restauración con resina',80000.00,'45 minutos'),(3,'Evaluación Odontológica','Revisión general del estado de las piezas dentales y diagnóstico completo',40000.00,'20 minutos');
/*!40000 ALTER TABLE `servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_documento`
--

DROP TABLE IF EXISTS `tipo_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_documento` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `sigla` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre_documento` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_documento`
--

LOCK TABLES `tipo_documento` WRITE;
/*!40000 ALTER TABLE `tipo_documento` DISABLE KEYS */;
INSERT INTO `tipo_documento` VALUES (1,'CC','Cedula de Ciudadania','Activo'),(2,'TI','Tarjeta de Identidad','Activo');
/*!40000 ALTER TABLE `tipo_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tratamiento`
--

DROP TABLE IF EXISTS `tratamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tratamiento` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `id_cita` int(10) NOT NULL,
  `id_servicio` int(10) NOT NULL,
  `id_pieza_dental` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `cara_afectada` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `procedimiento` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `precio_aplicado` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_diente_tratamiento` (`id_pieza_dental`),
  KEY `fk_servicio_tratamiento` (`id_servicio`),
  KEY `fk_cita_tratamiento` (`id_cita`),
  CONSTRAINT `fk_cita_tratamiento` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id`),
  CONSTRAINT `fk_diente_tratamiento` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id`),
  CONSTRAINT `fk_servicio_tratamiento` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tratamiento`
--

LOCK TABLES `tratamiento` WRITE;
/*!40000 ALTER TABLE `tratamiento` DISABLE KEYS */;
INSERT INTO `tratamiento` VALUES (1,1,1,'1','Vestibular','Profilaxis con ultrasonido y pulido','Completado',50000.00),(2,1,1,'2','Lingual','Eliminación de sarro subgingival','Completado',45000.00),(3,2,2,'1','Oclusal','Remoción de caries y restauración con resina','Completado',80000.00),(4,2,2,'3','Proximal','Obturación con resina compuesta','Completado',75000.00),(5,3,3,'2','General','Examen clínico y registro en mapa dental','Completado',40000.00),(6,3,3,'3','Interproximal','Evaluación con sonda y radiografía','Completado',35000.00);
/*!40000 ALTER TABLE `tratamiento` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07 17:10:04
