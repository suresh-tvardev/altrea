-- Create accounts table for family/circle of care
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  connection_info JSONB DEFAULT '{}'::jsonb, -- Store device ID, wifi settings, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add account_id to profiles to link users to accounts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);

-- Add RLS for accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own account
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT USING (
    id IN (
      SELECT account_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow users to insert accounts (during setup)
CREATE POLICY "Users can create accounts" ON accounts
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own account
CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE USING (
    id IN (
      SELECT account_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Function to handle linking profile to new account
CREATE OR REPLACE FUNCTION create_account_and_link_user(
  account_name TEXT,
  device_id TEXT,
  user_role TEXT
) RETURNS UUID
Security DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_account_id UUID;
BEGIN
  -- Create new account
  INSERT INTO accounts (name, connection_info)
  VALUES (account_name, jsonb_build_object('device_id', device_id))
  RETURNING id INTO new_account_id;

  -- Update profile
  UPDATE profiles
  SET 
    account_id = new_account_id,
    role = user_role,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN new_account_id;
END;
$$;
