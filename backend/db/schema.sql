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
  phone            VARCHAR(20),
  age              INT,
  gender           ENUM('Male','Female','Other'),
  nationality      VARCHAR(50) DEFAULT 'Malaysian',
  race             VARCHAR(50),
  organisation     VARCHAR(100),
  participant_count INT DEFAULT 1,
  face_id          BOOLEAN DEFAULT FALSE,
  registered_at    DATETIME DEFAULT CURRENT_TIMESTAMP
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
  event_type   ENUM('Check-in','Exit','Movement','Density','Alert') DEFAULT 'Check-in',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- ─── Visitor Feedback (Subsystem 3: AI Prediction & Smart Management) ──
CREATE TABLE IF NOT EXISTS visitor_feedback (
  feedback_id        VARCHAR(20) PRIMARY KEY,
  visitor_name       VARCHAR(100) NOT NULL DEFAULT 'Anonymous Visitor',
  rating             INT NOT NULL,
  category           VARCHAR(50) NOT NULL,
  feedback_text      TEXT NOT NULL,
  is_anonymous       BOOLEAN NOT NULL DEFAULT FALSE,
  status             ENUM('New','Reviewed','Responded') NOT NULL DEFAULT 'New',
  sentiment_label    ENUM('Positive','Neutral','Negative') NOT NULL DEFAULT 'Neutral',
  sentiment_score    DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  keywords_extracted JSON,
  staff_response     TEXT,
  responded_by       VARCHAR(100),
  responded_at       DATETIME,
  submitted_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
