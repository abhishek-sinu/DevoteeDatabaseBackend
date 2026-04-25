-- Migration: Add sixteen_round_completed_time to sadhana_template
ALTER TABLE predefined_template
ADD COLUMN sixteen_round_completed_time BOOLEAN DEFAULT FALSE;