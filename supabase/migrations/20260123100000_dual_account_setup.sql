-- Migration for dual account setup (caregiver + elder or vice versa)
-- This allows creating both accounts during initial setup

-- Function to create account and link both users (current user + partner)
-- This will be called after partner account is created via Supabase Admin API
CREATE OR REPLACE FUNCTION create_account_and_link_both_users(
  account_name TEXT,
  device_id TEXT,
  current_user_role TEXT,
  partner_user_id UUID,
  partner_role TEXT
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

  -- Update current user's profile
  UPDATE profiles
  SET 
    account_id = new_account_id,
    role = current_user_role,
    updated_at = NOW()
  WHERE id = auth.uid();

  -- Update partner user's profile
  UPDATE profiles
  SET 
    account_id = new_account_id,
    role = partner_role,
    updated_at = NOW()
  WHERE id = partner_user_id;

  RETURN new_account_id;
END;
$$;
