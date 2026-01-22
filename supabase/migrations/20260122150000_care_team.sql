
-- Create care_team_members table
CREATE TABLE IF NOT EXISTS care_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  role TEXT CHECK (role IN ('caregiver', 'elder')),
  is_primary BOOLEAN DEFAULT false,
  alert_preferences JSONB DEFAULT '{"critical": true, "warning": true, "info": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;

-- Allow users to view members of their own account
CREATE POLICY "Users can view care team of own account" ON care_team_members
  FOR SELECT USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow users to insert members into their own account
CREATE POLICY "Users can add care team members to own account" ON care_team_members
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT account_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow users to update members of their own account
CREATE POLICY "Users can update care team members of own account" ON care_team_members
  FOR UPDATE USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow users to delete members of their own account
CREATE POLICY "Users can delete care team members of own account" ON care_team_members
  FOR DELETE USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE id = auth.uid()
    )
  );
