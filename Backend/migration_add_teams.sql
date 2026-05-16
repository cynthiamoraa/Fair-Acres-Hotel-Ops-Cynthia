-- Migration: Add team field to workers table
-- Run this if you already have the workers table created

-- Add team column to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'Housekeeping';

-- Add check constraint for valid team values
ALTER TABLE workers DROP CONSTRAINT IF EXISTS workers_team_check;
ALTER TABLE workers ADD CONSTRAINT workers_team_check 
  CHECK (team IN ('Housekeeping', 'Kitchen', 'Security', 'Maintenance', 'Front Desk', 'Other'));

-- Create index on team for faster filtering
CREATE INDEX IF NOT EXISTS idx_workers_team ON workers(team);

-- Update existing workers to have default team if NULL
UPDATE workers SET team = 'Housekeeping' WHERE team IS NULL;
