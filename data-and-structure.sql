-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: image_sharing_app
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `photo_id` int NOT NULL,
  `content` text NOT NULL,
  `date_upload` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `photo_id` (`photo_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (3,3,4,'autumn is my fav season','2023-04-04 14:26:02'),(8,4,4,'beautiful picture','2023-04-06 11:29:07'),(9,3,5,'beautiful picture','2023-04-06 13:06:03'),(10,5,5,'wow! such a beautiful picture Guillermo. :)','2023-04-06 13:08:54'),(11,5,4,'i think i like winter more! but love this. :D','2023-04-06 13:09:15'),(12,5,3,'pls i want to live here','2023-04-06 13:09:29'),(13,5,1,'OMG. ','2023-04-06 13:09:43'),(15,3,6,'where is it?','2023-04-12 12:09:24'),(16,3,5,'thanks nikhat!','2023-04-12 12:09:38'),(17,6,5,'spring','2023-04-12 12:10:40');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `photo_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `photo_id` (`photo_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (6,4,1),(10,5,5),(11,5,4),(12,5,3),(13,5,1),(40,3,5),(77,3,1),(82,6,5),(83,7,7),(84,7,5),(85,7,4),(86,7,3),(88,3,7);
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caption` varchar(512) DEFAULT NULL,
  `alt_text` varchar(512) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `photo_path` varchar(2083) NOT NULL,
  `date_upload` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (1,'Mountains','Lake with mountains in the background',3,'/imgs/resized/pexels-photo-2662116.jpeg','2023-03-31 16:48:04'),(3,'Glendalough','',3,'/imgs/resized/photos-wicklow-glendalough.jpg','2023-04-03 15:56:03'),(4,'trees','',3,'/imgs/resized/photo-1592743263126-bb241ee76ac7.jpg','2023-04-03 15:57:59'),(5,'Trinity','The Campanile',3,'/imgs/resized/Slide-Campanile-TCDBank.jpg','2023-04-06 12:50:56'),(6,'madrid','picture of madrid from above',5,'/imgs/resized/wp5897091.jpg','2023-04-06 13:37:47'),(7,'madrid at sunset','madrid at sunset seen from above',3,'/imgs/resized/image_processing20220128-4-cr4i3l.jpg','2023-04-06 13:38:48');
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(512) NOT NULL,
  `email` varchar(512) NOT NULL,
  `pwd` varchar(256) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'guille','guille@tcd.ie','$2b$10$Huo.w7cDSsJ5T7/IY0/E9eHzRn3h/QfhuoiRCAcxNih4kUFoc992.','guille'),(4,'maria','maria@tcd.ie','$2b$10$Y3.NbGZt9RXKkZro.CYSseYJ2i/mnwInhe60tRbNe0UAYHIjozFnW','maria'),(5,'nikhat','nikhat@tcd.ie','$2b$10$vJ22N0KsoFPkiCMc7iQXm.Pi39T7edwwNR9IhzCGGrnlj8fMWnKPm','nikhat'),(6,'marcia','marcia@tcd.ie','$2b$10$6hRK/ft8R.Jz2j7fdwkDc.vjmKL8E3kmq7RA3Pg.wbtZBAbJiic1e','marcia'),(7,'smrithi','smrithi@tcd.ie','$2b$10$WqUXO1jPmY8oDjJTmZGB9elB0aORvxO6VqvA4DzHPxBOWQklaYebG','smrithi');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-12 17:04:08
