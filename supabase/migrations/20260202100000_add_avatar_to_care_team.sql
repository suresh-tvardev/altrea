-- Add avatar_url column to care_team_members table
ALTER TABLE care_team_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
