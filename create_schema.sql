
-- Create the main database (change the name if needed)
CREATE DATABASE IF NOT EXISTS devotee_database;
USE devotee_database;


-- Table: devotees
-- Stores all devotee personal, spiritual, and contact information
CREATE TABLE IF NOT EXISTS devotees (
    id                           INT AUTO_INCREMENT PRIMARY KEY,
    first_name                   VARCHAR(255) NULL,
    middle_name                  VARCHAR(255) NULL,
    last_name                    VARCHAR(255) NULL,
    gender                       VARCHAR(255) NULL,
    dob                          VARCHAR(255) NULL,
    ethnicity                    VARCHAR(255) NULL,
    citizenship                  VARCHAR(255) NULL,
    marital_status               VARCHAR(255) NULL,
    education_qualification_code VARCHAR(255) NULL,
    address1                     VARCHAR(255) NULL,
    address2                     VARCHAR(255) NULL,
    pin_code                     VARCHAR(255) NULL,
    email                        VARCHAR(255) NULL,
    mobile_no                    VARCHAR(255) NULL,
    whatsapp_no                  VARCHAR(255) NULL,
    initiated_name               VARCHAR(255) NULL,
    photo                        VARCHAR(255) NULL,
    spiritual_master_id          VARCHAR(255) NULL,
    first_initiation_date        VARCHAR(255) NULL,
    iskcon_first_contact_date    VARCHAR(255) NULL,
    second_initiated             VARCHAR(255) NULL,
    second_initiation_date       VARCHAR(255) NULL,
    full_time_devotee            VARCHAR(255) NULL,
    temple_name                  VARCHAR(255) NULL,
    status                       VARCHAR(255) NULL,
    created_at                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    facilitator_id               INT NULL,
    CONSTRAINT email UNIQUE (email)
);


-- Index for quick lookup of devotees by facilitator
CREATE INDEX counceller_id ON devotees (facilitator_id);


-- Table: sadhana_cards
-- Stores uploaded sadhana card file info for each devotee
CREATE TABLE IF NOT EXISTS sadhana_cards (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    month       VARCHAR(10) NOT NULL,
    year        INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
);


-- Table: sadhana_entries
-- Stores daily sadhana activity entries for each user
CREATE TABLE IF NOT EXISTS sadhana_entries (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    entry_date      DATE NOT NULL,
    wake_up_time    TIME NULL,
    chanting_rounds INT NULL,
    reading_time    INT NULL,
    reading_topic   TEXT NULL,
    hearing_time    INT NULL,
    hearing_topic   TEXT NULL,
    service_name    TEXT NULL,
    service_time    INT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
);


-- Index for quick lookup of sadhana entries by user
CREATE INDEX user_id ON sadhana_entries (user_id);


-- Table: users
-- Stores authentication and role information for all users
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       ENUM ('admin', 'user', 'counsellor') DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT email UNIQUE (email)
);


-- Table: notifications
-- Stores notifications sent to devotees
CREATE TABLE IF NOT EXISTS notifications (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    devotee_email VARCHAR(255) NOT NULL,
    message       TEXT NOT NULL,
    sent_by       VARCHAR(255) NOT NULL,
    status        ENUM ('read', 'unread') DEFAULT 'unread' NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    INDEX idx_notifications_devotee_email (devotee_email),
    INDEX idx_notifications_created_at (created_at)
);


-- Table: password_resets
-- Stores password reset tokens for users
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(128) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    UNIQUE KEY (email),
    INDEX idx_token (token)
);

INSERT INTO users (id, email, password, role, created_at)
VALUES (1, 'aparupagourangadas.hs@gmail.com', '$2b$10$KHEUJJk1E2bJtA6DfjgQnOpuAS.g9klmE04Z.pyHwyG4Xg0ToUNcO', 'admin', '2025-09-11 11:32:30');