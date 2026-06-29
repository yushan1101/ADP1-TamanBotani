-- ============================================================
-- Taman Botani Johor — Monitoring Database Schema
-- Run this first, then run: node db/seed.js
-- ============================================================

CREATE DATABASE IF NOT EXISTS taman_botani;
USE taman_botani;

-- ─── Zones ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL DEFAULT 100
);

-- ─── Visitors ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id               VARCHAR(20) PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  visitor_type     ENUM('Individual','Group') DEFAULT 'Individual',
  purpose          VARCHAR(50),
  activity          VARCHAR(80),
  phone            VARCHAR(20),
  age              INT,
  gender           ENUM('Male','Female','Other'),
  nationality      VARCHAR(50) DEFAULT 'Malaysian',
  race             VARCHAR(50),
  leader_name       VARCHAR(100),
  organisation     VARCHAR(100),
  visit_date        DATE,
  age_range         VARCHAR(50),
  dominant_race     VARCHAR(50),
  participant_count INT DEFAULT 1,
  face_id          BOOLEAN DEFAULT FALSE,
  no_phone_visitor  BOOLEAN DEFAULT FALSE,
  privacy_consent_at DATETIME,
  registration_channel ENUM('Visitor App','Kiosk','Staff') DEFAULT 'Visitor App',
  registered_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── QR Passes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_passes (
  id                VARCHAR(30) PRIMARY KEY,
  visitor_id        VARCHAR(20) NOT NULL,
  owner_name        VARCHAR(120) NOT NULL,
  pass_type         ENUM('Personal','Group') DEFAULT 'Personal',
  security_hash     VARCHAR(16) NOT NULL UNIQUE,
  status            ENUM('active','used','expired','revoked') DEFAULT 'active',
  saved_to_phone    BOOLEAN DEFAULT FALSE,
  participant_count INT DEFAULT 1,
  age_range         VARCHAR(50),
  dominant_race     VARCHAR(50),
  expires_at        DATETIME,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);

-- ─── Face ID Enrollments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS face_enrollments (
  id              VARCHAR(24) PRIMARY KEY,
  visitor_id      VARCHAR(20) NOT NULL,
  source          ENUM('Visitor App','Kiosk') DEFAULT 'Visitor App',
  image_data      LONGTEXT,
  embedding_json  TEXT,
  liveness_json   TEXT,
  color_sequence  VARCHAR(255),
  confidence      DECIMAL(5,2) DEFAULT 0.96,
  status          ENUM('active','revoked') DEFAULT 'active',
  enrolled_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);

-- ─── Visits ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
  id               VARCHAR(20) PRIMARY KEY,
  visitor_id       VARCHAR(20) NOT NULL,
  check_in_time    DATETIME NOT NULL,
  check_out_time   DATETIME,
  status           ENUM('inside','exited') DEFAULT 'inside',
  entry_method     ENUM('QR','Face ID','Manual','Group QR') DEFAULT 'QR',
  current_zone_id  INT,
  tag              VARCHAR(50),
  FOREIGN KEY (visitor_id)      REFERENCES visitors(id),
  FOREIGN KEY (current_zone_id) REFERENCES zones(id)
);

-- ─── Alerts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          VARCHAR(20) PRIMARY KEY,
  message     TEXT NOT NULL,
  severity    ENUM('Info','Warning','Critical') DEFAULT 'Warning',
  status      ENUM('Active','Resolved') DEFAULT 'Active',
  zone_id     INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- ─── Activity Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  event_time   DATETIME NOT NULL,
  event_text   VARCHAR(255) NOT NULL,
  event_type   ENUM('Registration','Check-in','Exit','Movement','Density','Alert') DEFAULT 'Check-in',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Kiosk Registration Records ──────────────────────────────
CREATE TABLE IF NOT EXISTS kiosk_registration_records (
  id          VARCHAR(20) PRIMARY KEY,
  visitor_id  VARCHAR(20) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  status      VARCHAR(160) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);

-- ─── Reports ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id           VARCHAR(20) PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  report_type  ENUM('Daily','Weekly','Monthly','Custom') DEFAULT 'Daily',
  format       ENUM('PDF','Excel') DEFAULT 'PDF',
  period_label VARCHAR(100),
  file_size    VARCHAR(20),
  status       ENUM('Ready','Generating','Failed') DEFAULT 'Ready',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
