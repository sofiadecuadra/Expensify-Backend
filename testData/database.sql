-- MySQL dump 10.13  Distrib 8.0.29, for macos12 (x86_64)
--
-- Host: 127.0.0.1    Database: db
-- ------------------------------------------------------
-- Server version	8.0.28

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES (1,'Music','Instruments and lessons','https://backend-category-dev.s3.amazonaws.com/Music-1665088337753-guitar.png',4000,1,1),(2,'Transport','Bus, taxi','https://backend-category-dev.s3.amazonaws.com/Transport-1665088439593-bus.png',500,1,1),(3,'Trip','Plane tickets and hotel expenses','https://backend-category-dev.s3.amazonaws.com/Trips-1665088572096-plane.png',40000,1,1),(4,'Sport','Lessons and resources','https://backend-category-dev.s3.amazonaws.com/Sport-1665088652222-sport.png',4000,1,1),(5,'Study','School, books','https://backend-category-dev.s3.amazonaws.com/Study-1665088784656-study.png',50000,1,1);
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
  `categoryId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `userId` (`userId`),
  CONSTRAINT `Expenses_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Expenses_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Expenses`
--

LOCK TABLES `Expenses` WRITE;
/*!40000 ALTER TABLE `Expenses` DISABLE KEYS */;
INSERT INTO `Expenses` VALUES (1,1000,'2022-10-06 20:41:17','2022-10-01 00:00:00',4,1),(3,500,'2022-10-06 20:42:29','2022-07-01 00:00:00',5,1),(4,400,'2022-10-06 20:43:05','2022-10-06 00:00:00',2,1),(5,400,'2022-10-06 20:44:27','2022-10-03 00:00:00',1,1),(6,600,'2022-10-06 20:45:44','2022-10-02 00:00:00',5,1),(7,3000,'2022-10-06 20:47:47','2022-10-02 00:00:00',3,2),(8,2000,'2022-10-06 20:48:23','2022-10-03 00:00:00',1,2),(9,600,'2022-10-06 20:48:44','2022-10-03 00:00:00',2,2),(10,500,'2022-10-06 20:49:06','2022-10-08 00:00:00',5,2),(11,700,'2022-10-06 20:49:56','2022-10-04 00:00:00',5,2),(12,650,'2022-10-06 20:51:26','2022-10-06 00:00:00',5,2),(13,300,'2022-10-06 20:51:45','2022-10-06 00:00:00',2,2);
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
  `apiKey` varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `apiKey` (`apiKey`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Families`
--

LOCK TABLES `Families` WRITE;
/*!40000 ALTER TABLE `Families` DISABLE KEYS */;
INSERT INTO `Families` VALUES (1,'ORT','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImNyZWF0ZWRBdCI6IjIwMjItMTAtMDZUMjE6MDc6MzguMTkwWiIsIm5hbWUiOiJPUlQifSwiaWF0IjoxNjY1MDkwNDU4fQ.cQv1YVpO2iJKQLuD8km4_44fXGVUo7dqpFYwFY9YtvI');
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
  `familyId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `familyId` (`familyId`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`familyId`) REFERENCES `Families` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Admin','admin@ort.com',1,'$2a$10$JQaXvoP3C10bDZ1AlMYgjOsmGBXzofZU35Mfu/GOdAKnAt8oLArF2',1),(2,'Hijo','hijo@ort.com',0,'$2a$10$uqCVokqQbVnq3EMe8OsI/uA5qReWe6/H.09Sl7c22H9EahK/SL0Ne',1);
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

-- Dump completed on 2022-10-06 18:49:51
