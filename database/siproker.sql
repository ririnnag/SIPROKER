-- ============================================================
-- SIPROKER - Sistem Informasi Pengelolaan Program Kerja Organisasi
-- Database Schema + Seed Data
-- Import via phpMyAdmin
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in reverse FK order
DROP TABLE IF EXISTS `laporan_kegiatan`;
DROP TABLE IF EXISTS `kepanitiaan`;
DROP TABLE IF EXISTS `invite_code`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `jabatan`;
DROP TABLE IF EXISTS `program_kerja`;
DROP TABLE IF EXISTS `divisi`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Create Database
-- ============================================================
CREATE DATABASE IF NOT EXISTS `siproker` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `siproker`;

-- ============================================================
-- Table: roles
-- ============================================================
CREATE TABLE `roles` (
  `id_role` INT NOT NULL AUTO_INCREMENT,
  `nama_role` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: divisi
-- ============================================================
CREATE TABLE `divisi` (
  `id_divisi` INT NOT NULL AUTO_INCREMENT,
  `nama_divisi` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_divisi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: jabatan
-- ============================================================
CREATE TABLE `jabatan` (
  `id_jabatan` INT NOT NULL AUTO_INCREMENT,
  `nama_jabatan` VARCHAR(100) NOT NULL,
  `id_divisi` INT NULL DEFAULT NULL,
  `butuh_divisi` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_jabatan`),
  FOREIGN KEY (`id_divisi`) REFERENCES `divisi`(`id_divisi`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE `users` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `npm` VARCHAR(20) NOT NULL,
  `id_jabatan` INT NULL DEFAULT NULL,
  `id_role` INT NULL DEFAULT NULL,
  `status` ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_npm` (`npm`),
  FOREIGN KEY (`id_jabatan`) REFERENCES `jabatan`(`id_jabatan`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_role`) REFERENCES `roles`(`id_role`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: invite_code
-- ============================================================
CREATE TABLE `invite_code` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(100) NOT NULL,
  `role_default` ENUM('admin','editor','viewer') NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: program_kerja
-- ============================================================
CREATE TABLE `program_kerja` (
  `id_proker` INT NOT NULL AUTO_INCREMENT,
  `tema_proker` VARCHAR(200) NOT NULL,
  `deskripsi` TEXT NULL DEFAULT NULL,
  `tanggal_mulai` DATE NULL DEFAULT NULL,
  `tanggal_selesai` DATE NULL DEFAULT NULL,
  `status` ENUM('rencana','berjalan','selesai') NOT NULL DEFAULT 'rencana',
  PRIMARY KEY (`id_proker`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: kepanitiaan
-- ============================================================
CREATE TABLE `kepanitiaan` (
  `id_kepanitiaan` INT NOT NULL AUTO_INCREMENT,
  `id_proker` INT NOT NULL,
  `id_user` INT NOT NULL,
  `jabatan_panitia` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_kepanitiaan`),
  FOREIGN KEY (`id_proker`) REFERENCES `program_kerja`(`id_proker`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: laporan_kegiatan
-- ============================================================
CREATE TABLE `laporan_kegiatan` (
  `id_laporan` INT NOT NULL AUTO_INCREMENT,
  `id_proker` INT NOT NULL,
  `judul_laporan` VARCHAR(200) NOT NULL,
  `isi_laporan` TEXT NULL DEFAULT NULL,
  `realisasi_kegiatan` TEXT NULL DEFAULT NULL,
  `tanggal_dibuat` DATE NOT NULL,
  PRIMARY KEY (`id_laporan`),
  FOREIGN KEY (`id_proker`) REFERENCES `program_kerja`(`id_proker`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed: roles
INSERT INTO `roles` (`nama_role`) VALUES
('admin'),
('editor'),
('viewer');

-- Seed: divisi
INSERT INTO `divisi` (`nama_divisi`) VALUES
('Administrasi'),
('Keuangan'),
('Akademik'),
('Minat dan Bakat'),
('Sosial dan Kemasyarakatan'),
('Humas'),
('Teknologi Informasi');

-- Seed: jabatan
-- KAHIM & WAKAHIM → no division (butuh_divisi = 0)
-- Others may or may not require division
INSERT INTO `jabatan` (`nama_jabatan`, `id_divisi`, `butuh_divisi`) VALUES
('KAHIM', NULL, 0),
('WAKAHIM', NULL, 0),
('SEKUM', NULL, 0),
('WASEKUM', NULL, 0),
('BENDUM', NULL, 0),
('WABENDUM', NULL, 0),
('KADIV ADMINISTRASI', 1, 1),
('WAKADIV ADMINISTRASI', 1, 1),
('KADIV KEUANGAN', 2, 1),
('WAKADIV KEUANGAN', 2, 1),
('KADIV AKADEMIK', 3, 1),
('WAKADIV AKADEMIK', 3, 1),
('KADIV MINAT DAN BAKAT', 4, 1),
('WAKADIV MINAT DAN BAKAT', 4, 1),
('KADIV SOSIAL DAN KEMASYARAKATAN', 5, 1),
('WAKADIV SOSIAL DAN KEMASYARAKATAN', 5, 1),
('KADIV HUMAS', 6, 1),
('WAKADIV HUMAS', 6, 1),
('KADIV TEKNOLOGI INFORMASI', 7, 1),
('WAKADIV TEKNOLOGI INFORMASI', 7, 1),
('STAFF', NULL, 0);

-- Seed: invite codes
-- Use these codes during registration
INSERT INTO `invite_code` (`code`, `role_default`, `is_active`) VALUES
('ADMIN-POINTER-2024', 'admin', 1),
('EDITOR-POINTER-2024', 'editor', 1),
('VIEWER-POINTER-2024', 'viewer', 1);

-- Seed: default admin user
-- Username: admin1@pointer | Password: admin123
-- Status: active (can login immediately)
INSERT INTO `users` (`username`, `password`, `nama`, `npm`, `id_jabatan`, `id_role`, `status`) VALUES
('admin1@pointer', 'admin123', 'Administrator SIPROKER', '0000000001', 1, 1, 'active');

-- Seed: sample program_kerja
INSERT INTO `program_kerja` (`tema_proker`, `deskripsi`, `tanggal_mulai`, `tanggal_selesai`, `status`) VALUES
('Seminar Kepemimpinan Mahasiswa', 'Seminar untuk meningkatkan kemampuan kepemimpinan anggota organisasi.', '2024-03-01', '2024-03-15', 'selesai'),
('Pelatihan Public Speaking', 'Workshop pelatihan kemampuan berbicara di depan umum.', '2024-04-10', '2024-04-20', 'berjalan'),
('Festival Budaya Kampus', 'Festival tahunan untuk memperkenalkan budaya dan seni mahasiswa.', '2024-06-01', '2024-06-30', 'rencana');

-- ============================================================
-- END OF SCHEMA
-- ============================================================
