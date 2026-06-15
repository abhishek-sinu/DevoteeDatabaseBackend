-- Add email_notifications_enabled column to users table
-- Controls whether the user receives scheduled emails (monthly sadhana card,
-- premium expiry reminder, daily sadhana entry reminder). Default 1 (enabled).
ALTER TABLE users ADD COLUMN email_notifications_enabled TINYINT(1) NOT NULL DEFAULT 1;
