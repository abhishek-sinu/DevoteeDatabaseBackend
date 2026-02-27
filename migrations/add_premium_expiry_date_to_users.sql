-- Add premium_expiry_date column to users table
ALTER TABLE users ADD COLUMN premium_expiry_date DATETIME DEFAULT NULL;