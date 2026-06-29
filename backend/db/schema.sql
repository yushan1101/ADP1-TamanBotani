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

-- Sample feedback records for Subsystem 3 demo dashboard.
-- INSERT IGNORE keeps this safe to re-run without duplicating the same rows.
INSERT IGNORE INTO visitor_feedback (
  feedback_id,
  visitor_name,
  rating,
  category,
  feedback_text,
  is_anonymous,
  status,
  sentiment_label,
  sentiment_score,
  keywords_extracted,
  staff_response,
  responded_by,
  responded_at,
  submitted_at
) VALUES
(
  'FB-DEMO001',
  'Nur Alya',
  5,
  'Facilities',
  'The park was very clean and beautiful. The staff were helpful when we asked for directions.',
  false,
  'New',
  'Positive',
  0.94,
  JSON_ARRAY('Facilities', 'Cleanliness', 'Staff'),
  NULL,
  NULL,
  NULL,
  '2026-06-20 10:30:00'
),
(
  'FB-DEMO002',
  'Anonymous Visitor',
  2,
  'Crowding',
  'The entrance area was crowded and the queue moved slowly.',
  true,
  'Reviewed',
  'Negative',
  0.88,
  JSON_ARRAY('Crowding', 'Queue'),
  NULL,
  NULL,
  NULL,
  '2026-06-21 14:15:00'
),
(
  'FB-DEMO003',
  'Daniel Tan',
  4,
  'Staff',
  'The staff were friendly and helped us find the lake trail.',
  false,
  'Responded',
  'Positive',
  0.91,
  JSON_ARRAY('Staff'),
  'Thank you for your kind feedback. We are glad our staff could help.',
  'Staff A',
  '2026-06-22 12:00:00',
  '2026-06-22 11:20:00'
),
(
  'FB-DEMO004',
  'Priya Nair',
  3,
  'General',
  'Overall okay, but some signs near the lake trail were not clear.',
  false,
  'New',
  'Neutral',
  0.78,
  JSON_ARRAY('General'),
  NULL,
  NULL,
  NULL,
  '2026-06-23 09:45:00'
),
(
  'FB-DEMO005',
  'Anonymous Visitor',
  1,
  'Facilities',
  'Some toilets were dirty and needed maintenance.',
  true,
  'New',
  'Negative',
  0.86,
  JSON_ARRAY('Facilities', 'Cleanliness'),
  NULL,
  NULL,
  NULL,
  '2026-06-24 16:05:00'
),
(
  'FB-DEMO006',
  'Aiman Hakim',
  5,
  'Parking',
  'Parking was easy to find and the garden was clean.',
  false,
  'Reviewed',
  'Positive',
  0.90,
  JSON_ARRAY('Parking', 'Cleanliness'),
  NULL,
  NULL,
  NULL,
  '2026-06-25 08:50:00'
),
(
  'FB-DEMO007',
  'Siti Aminah',
  4,
  'Safety',
  'The walking path felt safe, but more lighting would help in the evening.',
  false,
  'New',
  'Positive',
  0.84,
  JSON_ARRAY('Safety'),
  NULL,
  NULL,
  NULL,
  '2026-06-26 18:30:00'
),
(
  'FB-DEMO008',
  'Lim Wei',
  3,
  'General',
  'Nice place for family walking. The map direction could be clearer.',
  false,
  'Reviewed',
  'Neutral',
  0.77,
  JSON_ARRAY('General'),
  NULL,
  NULL,
  NULL,
  '2026-06-27 13:10:00'
);
