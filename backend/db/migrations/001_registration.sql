-- Registration backend migration for an existing taman_botani database.
-- Fresh installs can use db/schema.sql instead.

USE taman_botani;

ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS activity VARCHAR(80) AFTER purpose,
  ADD COLUMN IF NOT EXISTS leader_name VARCHAR(100) AFTER race,
  ADD COLUMN IF NOT EXISTS visit_date DATE AFTER organisation,
  ADD COLUMN IF NOT EXISTS age_range VARCHAR(50) AFTER visit_date,
  ADD COLUMN IF NOT EXISTS dominant_race VARCHAR(50) AFTER age_range,
  ADD COLUMN IF NOT EXISTS no_phone_visitor BOOLEAN DEFAULT FALSE AFTER face_id,
  ADD COLUMN IF NOT EXISTS privacy_consent_at DATETIME AFTER no_phone_visitor,
  ADD COLUMN IF NOT EXISTS registration_channel ENUM('Visitor App','Kiosk','Staff') DEFAULT 'Visitor App' AFTER privacy_consent_at;

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

ALTER TABLE activity_log
  MODIFY COLUMN event_type ENUM('Registration','Check-in','Exit','Movement','Density','Alert') DEFAULT 'Check-in';

CREATE TABLE IF NOT EXISTS kiosk_registration_records (
  id          VARCHAR(20) PRIMARY KEY,
  visitor_id  VARCHAR(20) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  status      VARCHAR(160) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);
