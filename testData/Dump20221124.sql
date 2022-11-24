CREATE DATABASE  IF NOT EXISTS `db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db`;
-- MySQL dump 10.13  Distrib 8.0.30, for macos12 (x86_64)
--
-- Host: 127.0.0.1    Database: db
-- ------------------------------------------------------
-- Server version	8.0.31

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
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(50) NOT NULL,
  `image` varchar(150) NOT NULL,
  `monthlyBudget` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `familyId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_family` (`name`,`familyId`),
  KEY `familyId` (`familyId`),
  CONSTRAINT `Categories_ibfk_1` FOREIGN KEY (`familyId`) REFERENCES `Families` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES (1,'Music','Instruments and lessons','https://backend-category-dev.s3.amazonaws.com/Music-1665088337753-guitar.png',4000,1,10),(2,'Transport','Bus, taxi','https://backend-category-dev.s3.amazonaws.com/Transport-1665088439593-bus.png',500,1,10),(3,'Trip','Plane tickets and hotel expenses','https://backend-category-dev.s3.amazonaws.com/Trips-1665088572096-plane.png',40000,1,10),(4,'Sport','Lessons and resources','https://backend-category-dev.s3.amazonaws.com/Sport-1665088652222-sport.png',4000,1,10),(5,'Study','School, books','https://backend-category-dev.s3.amazonaws.com/Study-1665088784656-study.png',50000,1,10);
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Expenses`
--

DROP TABLE IF EXISTS `Expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` int NOT NULL,
  `registeredDate` datetime NOT NULL,
  `producedDate` datetime NOT NULL,
  `image` varchar(150) NOT NULL,
  `description` varchar(150) NOT NULL,
  `categoryId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `userId` (`userId`),
  CONSTRAINT `Expenses_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Expenses_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Expenses`
--

LOCK TABLES `Expenses` WRITE;
/*!40000 ALTER TABLE `Expenses` DISABLE KEYS */;
INSERT INTO `Expenses` VALUES (1,2000,'2022-11-24 03:53:08','2022-08-10 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669261988567-rn_image_picker_lib_temp_731fb5a4-dba8-4ff2-a4c0-df0f1ea71705.jpg','Concierto ',1,8),(2,3000,'2022-11-24 03:56:02','2022-08-17 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Guitarra',1,8),(3,5000,'2022-11-24 03:56:02','2022-09-19 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Amplificador',1,8),(5,1500,'2022-11-24 03:56:02','2022-07-19 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Omnibus',2,8),(6,2300,'2022-11-24 03:56:02','2022-08-19 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Omnibus',2,8),(7,1500,'2022-11-24 03:56:02','2022-09-19 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Omnibus',2,8),(8,1500,'2022-11-24 03:56:02','2022-10-19 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Omnibus',2,8),(9,10000,'2022-11-24 03:56:02','2022-10-23 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Pasajes',2,8),(10,10000,'2022-11-24 03:56:02','2022-11-23 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Libros',5,8),(11,1000,'2022-11-24 03:56:02','2022-10-23 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Impresiones',5,8),(12,300,'2022-11-24 03:56:02','2022-10-10 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Lapices',5,8),(13,2000,'2022-11-24 03:56:02','2022-09-10 00:00:00','https://backend-category-dev.s3.amazonaws.com/8-1669262162425-rn_image_picker_lib_temp_5f032f7e-7843-4c93-b7cf-fdb26701941f.jpg','Cuadernolas',5,8);
/*!40000 ALTER TABLE `Expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Families`
--

DROP TABLE IF EXISTS `Families`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Families` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Families`
--

LOCK TABLES `Families` WRITE;
/*!40000 ALTER TABLE `Families` DISABLE KEYS */;
INSERT INTO `Families` VALUES (10,'root1');
/*!40000 ALTER TABLE `Families` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `role` int NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `expoToken` varchar(100) DEFAULT NULL,
  `familyId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `familyId` (`familyId`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`familyId`) REFERENCES `Families` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (8,'Mario','root@gmail.com',1,'$2a$10$xtiBoKVQwSAHBhFS7RPuMeCUhZD4UE5mn8ifug3BdIpeSbJB5kAiy',NULL,10);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-24  1:42:30
