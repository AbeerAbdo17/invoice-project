-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Sep 15, 2025 at 10:04 AM
-- Server version: 5.5.27
-- PHP Version: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `invoices_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clientName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `invoiceNumber`, `clientName`, `date`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 'INV-001', 'هبه', '2025-09-15', 1, '2025-09-14 11:50:55', '2025-09-15 07:52:33'),
(2, 'INV-002', 'ahmed', '2025-09-14', 1, '2025-09-14 12:04:12', '2025-09-14 12:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoiceId` (`invoiceId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=35 ;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `quantity`, `price`, `createdAt`, `updatedAt`, `invoiceId`) VALUES
(1, 'صنف1', 1, 12, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(2, 'صنف2', 2, 22, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(3, 'صنف3', 3, 33, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(4, 'صنف4', 4, 44, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(5, 'صنف5', 5, 55, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(6, 'لا', 4, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(7, 'فغف', 5, 5, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(8, 'لبل', 4, 5, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(9, 'قفق', 5, 5, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(10, 'لبل', 4, 43, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(11, 'يبيس', 3, 34, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(12, 'لبيصث', 3, 34, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(13, 'يبي', 4, 44, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(14, 'ببل', 4, 44, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(15, 'قثثق', 4, 44, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(16, 'تتتل', 4, 43, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(17, 'فق', 4, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(18, 'ففي', 4, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(19, 'لبا', 5, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(20, 'فقفق', 4, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(21, 'لبلف', 4, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(22, 'لغفغ', 3, 3, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(23, 'يب', 4, 4, '2025-09-14 11:50:55', '2025-09-15 07:52:33', 1),
(24, 'ا', 6, 6, '2025-09-14 11:59:29', '2025-09-15 07:52:33', 1),
(25, 'd1', 1, 12, '2025-09-14 12:04:12', '2025-09-14 12:04:12', 2),
(26, 'de2', 2, 22, '2025-09-14 12:04:12', '2025-09-14 12:04:12', 2),
(27, 'dr3', 1, 12, '2025-09-14 12:04:12', '2025-09-14 12:04:12', 2),
(28, 'sd', 1, 11, '2025-09-14 12:04:12', '2025-09-14 12:04:12', 2),
(29, 'fgdf', 1, 1, '2025-09-15 07:52:33', '2025-09-15 07:52:33', 1),
(30, 'dfv', 2, 2, '2025-09-15 07:52:33', '2025-09-15 07:52:33', 1),
(31, 'gdf', 3, 2, '2025-09-15 07:52:33', '2025-09-15 07:52:33', 1),
(32, 'eww', 1, 21, '2025-09-15 07:52:33', '2025-09-15 07:52:33', 1),
(33, 'we', 2, 2, '2025-09-15 07:52:33', '2025-09-15 07:52:33', 1),
(34, 'we', 2, 2, '2025-09-15 07:52:33', '2025-09-15 07:52:33', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `createdAt`, `updatedAt`) VALUES
(1, 'abeer', 'abeer@gmail.com', '$2b$10$Uy63n6eQIPP/V.CJAHtzSOegoUSFVAC9zFpMuHmuW8ToXHP37QDL.', '2025-09-14 11:48:19', '2025-09-14 11:48:19'),
(2, 'هبه', 'hiba@gmail.com', '$2b$10$vHaDtZIWw1KEg9SV/t3zUOQ94dmn3p9rMthD89KhyEP9CkN1Q6zoS', '2025-09-14 13:31:22', '2025-09-14 13:31:22');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
