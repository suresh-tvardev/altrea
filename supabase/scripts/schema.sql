-- ============================================================================
-- Altrea Database Schema
-- ============================================================================
-- This script creates the complete database schema for the Altrea EEG
-- Emotional Wellness Platform. It includes all tables, functions, triggers,
-- and Row Level Security (RLS) policies needed for the application.
--
-- Usage:
--   1. Run this script in your Supabase SQL editor
--   2. Or use: psql -f schema.sql (if using local Supabase)
--   3. Or apply via Supabase CLI: supabase db reset
--
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Stores user profile information linked to auth.users
-- Each user has one profile that can be linked to an account

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('caregiver', 'elder')),
  onboarding_completed BOOLEAN DEFAULT false,
  account_id UUID, -- Foreign key added in accounts section
  
  CONSTRAINT role_check CHECK (role IN ('caregiver', 'elder'))
);

-- Create index on account_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON public.profiles(account_id);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 2. ACCOUNTS TABLE
-- ============================================================================
-- Represents a family/circle of care account
-- Multiple users (elder + caregivers) can be linked to one account
-- Stores device connection information

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  connection_info JSONB DEFAULT '{}'::jsonb, -- Store device_id, wifi settings, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint from profiles to accounts
ALTER TABLE public.profiles 
  ADD CONSTRAINT fk_profiles_account_id 
  FOREIGN KEY (account_id) 
  REFERENCES public.accounts(id) 
  ON DELETE SET NULL;

-- Create index on name for searching
CREATE INDEX IF NOT EXISTS idx_accounts_name ON public.accounts(name);

-- ============================================================================
-- 3. CARE TEAM MEMBERS TABLE
-- ============================================================================
-- Stores additional caregivers/family members for an account
-- These are contacts that can receive alerts and notifications
-- Note: Actual users (with auth.users entries) are in profiles table

CREATE TABLE IF NOT EXISTS public.care_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_care_team_account_id ON public.care_team_members(account_id);
CREATE INDEX IF NOT EXISTS idx_care_team_email ON public.care_team_members(email);
CREATE INDEX IF NOT EXISTS idx_care_team_is_primary ON public.care_team_members(is_primary);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4.1 PROFILES RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Allow public read access to profiles (for displaying names, avatars, etc.)
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles
  FOR SELECT 
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile." 
  ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================================================
-- 4.2 ACCOUNTS RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own account" ON public.accounts;
DROP POLICY IF EXISTS "Users can create accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own account" ON public.accounts;

-- Allow users to view their own account (where they are a member)
CREATE POLICY "Users can view own account" 
  ON public.accounts
  FOR SELECT 
  USING (
    id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow users to create accounts (during setup)
CREATE POLICY "Users can create accounts" 
  ON public.accounts
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own account
CREATE POLICY "Users can update own account" 
  ON public.accounts
  FOR UPDATE 
  USING (
    id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 4.3 CARE TEAM MEMBERS RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view care team of own account" ON public.care_team_members;
DROP POLICY IF EXISTS "Users can add care team members to own account" ON public.care_team_members;
DROP POLICY IF EXISTS "Users can update care team members of own account" ON public.care_team_members;
DROP POLICY IF EXISTS "Users can delete care team members of own account" ON public.care_team_members;

-- Allow users to view members of their own account
CREATE POLICY "Users can view care team of own account" 
  ON public.care_team_members
  FOR SELECT 
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow users to insert members into their own account
CREATE POLICY "Users can add care team members to own account" 
  ON public.care_team_members
  FOR INSERT 
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow users to update members of their own account
CREATE POLICY "Users can update care team members of own account" 
  ON public.care_team_members
  FOR UPDATE 
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow users to delete members of their own account
CREATE POLICY "Users can delete care team members of own account" 
  ON public.care_team_members
  FOR DELETE 
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- ============================================================================
-- 5.1 HANDLE NEW USER TRIGGER FUNCTION
-- ============================================================================
-- Automatically creates a profile when a new user signs up
-- This is triggered by the on_auth_user_created trigger

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 5.2 CREATE ACCOUNT AND LINK USER FUNCTION
-- ============================================================================
-- Creates a new account and links the current user to it
-- Used during single-user setup (without partner)
-- Returns the new account ID

CREATE OR REPLACE FUNCTION public.create_account_and_link_user(
  account_name TEXT,
  device_id TEXT,
  user_role TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_account_id UUID;
BEGIN
  -- Validate role
  IF user_role NOT IN ('caregiver', 'elder') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be "caregiver" or "elder"', user_role;
  END IF;

  -- Create new account
  INSERT INTO public.accounts (name, connection_info)
  VALUES (account_name, jsonb_build_object('device_id', device_id))
  RETURNING id INTO new_account_id;

  -- Update current user's profile
  UPDATE public.profiles
  SET 
    account_id = new_account_id,
    role = user_role,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN new_account_id;
END;
$$;

-- ============================================================================
-- 5.3 CREATE ACCOUNT AND LINK BOTH USERS FUNCTION
-- ============================================================================
-- Creates a new account and links both the current user and a partner user
-- Used during dual-account setup (caregiver + elder)
-- Note: Partner user should already be created via Admin API before calling this
-- Returns the new account ID

CREATE OR REPLACE FUNCTION public.create_account_and_link_both_users(
  account_name TEXT,
  device_id TEXT,
  current_user_role TEXT,
  partner_user_id UUID,
  partner_role TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_account_id UUID;
BEGIN
  -- Validate roles
  IF current_user_role NOT IN ('caregiver', 'elder') THEN
    RAISE EXCEPTION 'Invalid current_user_role: %. Must be "caregiver" or "elder"', current_user_role;
  END IF;
  
  IF partner_role NOT IN ('caregiver', 'elder') THEN
    RAISE EXCEPTION 'Invalid partner_role: %. Must be "caregiver" or "elder"', partner_role;
  END IF;

  -- Create new account
  INSERT INTO public.accounts (name, connection_info)
  VALUES (account_name, jsonb_build_object('device_id', device_id))
  RETURNING id INTO new_account_id;

  -- Update current user's profile
  UPDATE public.profiles
  SET 
    account_id = new_account_id,
    role = current_user_role,
    updated_at = NOW()
  WHERE id = auth.uid();

  -- Update partner user's profile
  UPDATE public.profiles
  SET 
    account_id = new_account_id,
    role = partner_role,
    updated_at = NOW()
  WHERE id = partner_user_id;

  RETURN new_account_id;
END;
$$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- ============================================================================
-- 6.1 ON AUTH USER CREATED TRIGGER
-- ============================================================================
-- Automatically creates a profile when a new user is created in auth.users

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. HELPER FUNCTIONS (Optional - for maintenance/debugging)
-- ============================================================================

-- Function to get account members (users linked to an account)
CREATE OR REPLACE FUNCTION public.get_account_members(account_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  role TEXT,
  email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    p.full_name,
    p.role,
    au.email
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.account_id = account_uuid;
END;
$$;

-- ============================================================================
-- 8. COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users. Each user has one profile that can be linked to an account.';
COMMENT ON TABLE public.accounts IS 'Family/circle of care accounts. Multiple users (elder + caregivers) can be linked to one account.';
COMMENT ON TABLE public.care_team_members IS 'Additional caregivers/family members for an account. These are contacts that can receive alerts.';

COMMENT ON COLUMN public.profiles.account_id IS 'Links the user to an account. Users in the same account share the same device and data.';
COMMENT ON COLUMN public.profiles.role IS 'User role: "caregiver" or "elder". Determines dashboard access and permissions.';
COMMENT ON COLUMN public.accounts.connection_info IS 'JSONB object storing device connection details like device_id, wifi settings, etc.';
COMMENT ON COLUMN public.care_team_members.alert_preferences IS 'JSONB object with keys: critical, warning, info. Each boolean indicates if this member should receive that alert type.';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
