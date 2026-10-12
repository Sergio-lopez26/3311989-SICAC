-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: sicac
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
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
  `nombre_alergia` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_alergia` (`nombre_alergia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alergia`
--

LOCK TABLES `alergia` WRITE;
/*!40000 ALTER TABLE `alergia` DISABLE KEYS */;
/*!40000 ALTER TABLE `alergia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `antecedente_medico`
--

DROP TABLE IF EXISTS `antecedente_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `antecedente_medico` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antecedente_medico`
--

LOCK TABLES `antecedente_medico` WRITE;
/*!40000 ALTER TABLE `antecedente_medico` DISABLE KEYS */;
/*!40000 ALTER TABLE `antecedente_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `autorizacion`
--

DROP TABLE IF EXISTS `autorizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorizacion` (
  `rol` varchar(20) NOT NULL,
  PRIMARY KEY (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autorizacion`
--

LOCK TABLES `autorizacion` WRITE;
/*!40000 ALTER TABLE `autorizacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `autorizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `autorizacion_cliente`
--

DROP TABLE IF EXISTS `autorizacion_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorizacion_cliente` (
  `rol` varchar(20) NOT NULL,
  `id_cliente` int(10) NOT NULL,
  PRIMARY KEY (`rol`,`id_cliente`),
  KEY `fk_cliente_autorizacion` (`id_cliente`),
  CONSTRAINT `fk_autorizacion_cliente` FOREIGN KEY (`rol`) REFERENCES `autorizacion` (`rol`),
  CONSTRAINT `fk_cliente_autorizacion` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autorizacion_cliente`
--

LOCK TABLES `autorizacion_cliente` WRITE;
/*!40000 ALTER TABLE `autorizacion_cliente` DISABLE KEYS */;
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
  `tipo_cirugia` varchar(50) NOT NULL,
  `nombre_cirugia` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_cirugia` (`tipo_cirugia`,`nombre_cirugia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cirugia_previa`
--

LOCK TABLES `cirugia_previa` WRITE;
/*!40000 ALTER TABLE `cirugia_previa` DISABLE KEYS */;
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
  `fecha_horario` date NOT NULL,
  `hora_inicio` time(6) NOT NULL,
  `hora_fin` time(6) NOT NULL,
  `estado_cita` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_historial_cita` (`id_historial_medico`),
  KEY `fk_odontologo_cita` (`id_odontologo`),
  CONSTRAINT `fk_historial_cita` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`),
  CONSTRAINT `fk_odontologo_cita` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita`
--

LOCK TABLES `cita` WRITE;
/*!40000 ALTER TABLE `cita` DISABLE KEYS */;
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
  `numero_documento` varchar(50) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(50) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `primer_nombre` varchar(50) NOT NULL,
  `segundo_nombre` varchar(50) DEFAULT NULL,
  `primer_apellido` varchar(50) NOT NULL,
  `segundo_apellido` varchar(50) DEFAULT NULL,
  `numero_celular` int(10) NOT NULL,
  `tipo_sangre` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_email` (`email`),
  UNIQUE KEY `uc_cliente` (`id_tipo_documento`,`numero_documento`),
  CONSTRAINT `fk_tipo_documento_cliente` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_horarios`
--

DROP TABLE IF EXISTS `disponibilidad_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_horarios` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `horarios` date NOT NULL,
  `id_odontologo` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdisponibil508695` (`id_odontologo`),
  CONSTRAINT `FKdisponibil508695` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_horarios`
--

LOCK TABLES `disponibilidad_horarios` WRITE;
/*!40000 ALTER TABLE `disponibilidad_horarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidad_horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enfermedad_sistemica`
--

DROP TABLE IF EXISTS `enfermedad_sistemica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enfermedad_sistemica` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nombre_enfermedad` varchar(60) NOT NULL,
  `descripción_enfermedad` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_enfermedad` (`nombre_enfermedad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enfermedad_sistemica`
--

LOCK TABLES `enfermedad_sistemica` WRITE;
/*!40000 ALTER TABLE `enfermedad_sistemica` DISABLE KEYS */;
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
  `nivel_alergia` varchar(20) NOT NULL,
  `estado_alergia` varchar(40) NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_alergia`),
  UNIQUE KEY `uc_historial_alergia` (`id_historial_medico`,`id_alergia`),
  KEY `fk_historial_alergia` (`id_alergia`),
  CONSTRAINT `fk_historial_alergia` FOREIGN KEY (`id_alergia`) REFERENCES `alergia` (`id`),
  CONSTRAINT `fk_historial_medico_alergia` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_alergia`
--

LOCK TABLES `historial_alergia` WRITE;
/*!40000 ALTER TABLE `historial_alergia` DISABLE KEYS */;
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
  `efectos_secundarios` varchar(200) DEFAULT NULL,
  `estado_cirugia` varchar(40) NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_cirugia_previa`),
  UNIQUE KEY `uc_historial_cirugia` (`id_historial_medico`,`id_cirugia_previa`),
  KEY `fk_historial_cirugia` (`id_cirugia_previa`),
  CONSTRAINT `fk_historial_cirugia` FOREIGN KEY (`id_cirugia_previa`) REFERENCES `cirugia_previa` (`id`),
  CONSTRAINT `fk_historial_medico_cirugia` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cirugia`
--

LOCK TABLES `historial_cirugia` WRITE;
/*!40000 ALTER TABLE `historial_cirugia` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_cirugia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_cita`
--

DROP TABLE IF EXISTS `historial_cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_cita` (
  `id` int(10) NOT NULL,
  `id_odontologo` int(10) NOT NULL,
  `diagnostico` varchar(1000) NOT NULL,
  `motivo_consulta` varchar(1000) NOT NULL,
  `tratamiento` varchar(1000) NOT NULL,
  `radiografia_url` varchar(1000) DEFAULT NULL,
  `fecha_cita` date NOT NULL,
  PRIMARY KEY (`id`,`id_odontologo`),
  KEY `FKhistorial_152993` (`id_odontologo`),
  CONSTRAINT `FKhistorial_152993` FOREIGN KEY (`id_odontologo`) REFERENCES `odontologo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cita`
--

LOCK TABLES `historial_cita` WRITE;
/*!40000 ALTER TABLE `historial_cita` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_cita` ENABLE KEYS */;
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
  `estado_enfermedad` varchar(40) NOT NULL,
  `fecha_diagnostico` date NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_enfermedad_sistemica`),
  UNIQUE KEY `uc_historial_enfermedad` (`id_historial_medico`,`id_enfermedad_sistemica`),
  KEY `fk_historial_enfermedad` (`id_enfermedad_sistemica`),
  CONSTRAINT `fk_historial_enfermedad` FOREIGN KEY (`id_enfermedad_sistemica`) REFERENCES `enfermedad_sistemica` (`id`),
  CONSTRAINT `fk_historial_medico_enfermedad` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_enfermedad`
--

LOCK TABLES `historial_enfermedad` WRITE;
/*!40000 ALTER TABLE `historial_enfermedad` DISABLE KEYS */;
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
  `estado_medicacion` varchar(40) NOT NULL,
  PRIMARY KEY (`id_historial_medico`,`id_medicamento`),
  UNIQUE KEY `uc_historial_medicamento` (`id_historial_medico`,`id_medicamento`),
  KEY `fk_historial_medicamento` (`id_medicamento`),
  CONSTRAINT `fk_historial_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id`),
  CONSTRAINT `fk_historial_medico_medicamento` FOREIGN KEY (`id_historial_medico`) REFERENCES `historial_medico` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medicamento`
--

LOCK TABLES `historial_medicamento` WRITE;
/*!40000 ALTER TABLE `historial_medicamento` DISABLE KEYS */;
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
  UNIQUE KEY `uc_historial_medico` (`id`,`id_paciente`,`id_mapa_dental`),
  KEY `fk_paciente_historial` (`id_paciente`),
  KEY `fk_mapa_dental_historial_medico` (`id_mapa_dental`),
  CONSTRAINT `fk_mapa_dental_historial_medico` FOREIGN KEY (`id_mapa_dental`) REFERENCES `mapa_dental` (`id`),
  CONSTRAINT `fk_paciente_historial` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medico`
--

LOCK TABLES `historial_medico` WRITE;
/*!40000 ALTER TABLE `historial_medico` DISABLE KEYS */;
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
  `nombre_estandar` varchar(60) NOT NULL,
  `estado` varchar(40) NOT NULL,
  `observacion` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapa_dental`
--

LOCK TABLES `mapa_dental` WRITE;
/*!40000 ALTER TABLE `mapa_dental` DISABLE KEYS */;
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
  `nombre_medicamento` varchar(60) NOT NULL,
  `tipo_medicamento` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_medicamento` (`nombre_medicamento`,`tipo_medicamento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamento`
--

LOCK TABLES `medicamento` WRITE;
/*!40000 ALTER TABLE `medicamento` DISABLE KEYS */;
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
  `nombre_metodo` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_metodo_pago` (`nombre_metodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_pago`
--

LOCK TABLES `metodo_pago` WRITE;
/*!40000 ALTER TABLE `metodo_pago` DISABLE KEYS */;
/*!40000 ALTER TABLE `metodo_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_odontologo`
--

DROP TABLE IF EXISTS `notas_odontologo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_odontologo` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nota_odontologo` varchar(10000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_odontologo`
--

LOCK TABLES `notas_odontologo` WRITE;
/*!40000 ALTER TABLE `notas_odontologo` DISABLE KEYS */;
/*!40000 ALTER TABLE `notas_odontologo` ENABLE KEYS */;
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
  `estado_odontologo` varchar(40) NOT NULL,
  `fecha_registro` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cliente_odontologo` (`id_cliente`),
  CONSTRAINT `fk_cliente_odontologo` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `odontologo`
--

LOCK TABLES `odontologo` WRITE;
/*!40000 ALTER TABLE `odontologo` DISABLE KEYS */;
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
  `estado_paciente` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cliente_paciente` (`id_cliente`),
  CONSTRAINT `fk_cliente_paciente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
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
  `estado_pago` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_pago` (`numero_pago`),
  KEY `flk_cita_pago` (`id_cita`),
  KEY `fk_metodo_pago` (`id_metodo_pago`),
  CONSTRAINT `fk_metodo_pago` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id`),
  CONSTRAINT `flk_cita_pago` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pieza_dental`
--

DROP TABLE IF EXISTS `pieza_dental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pieza_dental` (
  `id` varchar(10) NOT NULL,
  `id_mapa` int(10) NOT NULL,
  `numero_pieza` int(10) NOT NULL,
  `nomeclatura_fdi` varchar(50) NOT NULL,
  `estado_pieza` varchar(40) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `posicion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_pieza_dental` (`id_mapa`,`numero_pieza`),
  CONSTRAINT `fk_mapa_diente` FOREIGN KEY (`id_mapa`) REFERENCES `mapa_dental` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pieza_dental`
--

LOCK TABLES `pieza_dental` WRITE;
/*!40000 ALTER TABLE `pieza_dental` DISABLE KEYS */;
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
  `nombre` varchar(60) NOT NULL,
  `descripcion` varchar(1000) NOT NULL,
  `precio_actual` decimal(10,2) NOT NULL,
  `duracion` time(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_servicio` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
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
  `sigla` varchar(10) NOT NULL,
  `numero_documento` varchar(50) NOT NULL,
  `estado` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_documento`
--

LOCK TABLES `tipo_documento` WRITE;
/*!40000 ALTER TABLE `tipo_documento` DISABLE KEYS */;
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
  `id_pieza_dental` varchar(10) NOT NULL,
  `cara_afectada` varchar(40) NOT NULL,
  `procedimiento` varchar(1000) NOT NULL,
  `estado` varchar(40) NOT NULL,
  `precio_aplicado` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_diente_tratamiento` (`id_pieza_dental`),
  KEY `fk_servicio_tratamiento` (`id_servicio`),
  KEY `fk_cita_tratamiento` (`id_cita`),
  CONSTRAINT `fk_cita_tratamiento` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id`),
  CONSTRAINT `fk_diente_tratamiento` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id`),
  CONSTRAINT `fk_servicio_tratamiento` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tratamiento`
--

LOCK TABLES `tratamiento` WRITE;
/*!40000 ALTER TABLE `tratamiento` DISABLE KEYS */;
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

-- Dump completed on 2026-03-16 13:01:48
