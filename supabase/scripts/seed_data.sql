-- ============================================================================
-- Altrea Seed Data Script
-- ============================================================================
-- This script creates sample data for testing and development.
-- WARNING: This script will insert test data. Use only in development/staging.
--
-- Usage:
--   1. Run schema.sql first
--   2. Create test users via Supabase Auth (or use the test users below)
--   3. Run this script to populate with sample data
--
-- ============================================================================

-- ============================================================================
-- IMPORTANT: Before running this script
-- ============================================================================
-- You need to create test users in Supabase Auth first. This script assumes
-- you have created users with these emails (or modify the UUIDs below):
--   - elder@altrea.test
--   - caregiver@altrea.test
--
-- To create users:
--   1. Go to Supabase Dashboard > Authentication > Users
--   2. Click "Add User" and create users with the emails above
--   3. Note their UUIDs and update the variables below
--
-- ============================================================================

-- Set these variables to match your test user UUIDs
-- You can find UUIDs in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  -- Replace these with actual UUIDs from your Supabase Auth users
  elder_user_id UUID := '00000000-0000-0000-0000-000000000001';
  caregiver_user_id UUID := '00000000-0000-0000-0000-000000000002';
  
  test_account_id UUID;
BEGIN
  -- ============================================================================
  -- 1. CREATE TEST ACCOUNT
  -- ============================================================================
  
  INSERT INTO public.accounts (name, connection_info)
  VALUES (
    'Smith Family Account',
    jsonb_build_object(
      'device_id', 'ALT-2024-001',
      'wifi_ssid', 'SmithHome',
      'last_sync', NOW()
    )
  )
  RETURNING id INTO test_account_id;
  
  RAISE NOTICE 'Created test account: %', test_account_id;
  
  -- ============================================================================
  -- 2. UPDATE PROFILES WITH ROLES AND ACCOUNT
  -- ============================================================================
  -- Note: Profiles should already exist from the handle_new_user trigger
  -- We just need to update them with roles and account_id
  
  -- Update elder profile
  UPDATE public.profiles
  SET 
    account_id = test_account_id,
    role = 'elder',
    full_name = 'John Smith',
    onboarding_completed = true,
    updated_at = NOW()
  WHERE id = elder_user_id;
  
  -- Update caregiver profile
  UPDATE public.profiles
  SET 
    account_id = test_account_id,
    role = 'caregiver',
    full_name = 'Jane Smith',
    onboarding_completed = true,
    updated_at = NOW()
  WHERE id = caregiver_user_id;
  
  RAISE NOTICE 'Updated profiles with roles and account';
  
  -- ============================================================================
  -- 3. CREATE CARE TEAM MEMBERS
  -- ============================================================================
  
  INSERT INTO public.care_team_members (
    account_id,
    name,
    email,
    phone,
    relationship,
    role,
    is_primary,
    alert_preferences
  ) VALUES
  -- Primary caregiver (already a user, but also in care team for alerts)
  (
    test_account_id,
    'Jane Smith',
    'caregiver@altrea.test',
    '+1-555-0101',
    'Spouse',
    'caregiver',
    true,
    '{"critical": true, "warning": true, "info": true}'::jsonb
  ),
  -- Additional family member
  (
    test_account_id,
    'Sarah Smith',
    'sarah.smith@example.com',
    '+1-555-0102',
    'Daughter',
    'caregiver',
    false,
    '{"critical": true, "warning": true, "info": false}'::jsonb
  ),
  -- Doctor
  (
    test_account_id,
    'Dr. Michael Chen',
    'mchen@healthcare.com',
    '+1-555-0201',
    'Primary Care Physician',
    'caregiver',
    false,
    '{"critical": true, "warning": false, "info": false}'::jsonb
  );
  
  RAISE NOTICE 'Created care team members';
  
  -- ============================================================================
  -- 4. VERIFICATION
  -- ============================================================================
  
  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Account ID: %', test_account_id;
  RAISE NOTICE 'Elder User ID: %', elder_user_id;
  RAISE NOTICE 'Caregiver User ID: %', caregiver_user_id;
  
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the seed data was created correctly

-- Check accounts
SELECT 
  id,
  name,
  connection_info->>'device_id' as device_id,
  created_at
FROM public.accounts;

-- Check profiles
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.account_id,
  a.name as account_name
FROM public.profiles p
LEFT JOIN public.accounts a ON p.account_id = a.id
WHERE p.account_id IS NOT NULL;

-- Check care team members
SELECT 
  id,
  name,
  email,
  phone,
  relationship,
  role,
  is_primary,
  alert_preferences
FROM public.care_team_members
ORDER BY is_primary DESC, created_at;

-- ============================================================================
-- CLEANUP SCRIPT (Run this to remove seed data)
-- ============================================================================
-- Uncomment and run to clean up seed data:

/*
DELETE FROM public.care_team_members WHERE account_id IN (
  SELECT id FROM public.accounts WHERE name = 'Smith Family Account'
);

UPDATE public.profiles 
SET account_id = NULL, role = NULL 
WHERE account_id IN (
  SELECT id FROM public.accounts WHERE name = 'Smith Family Account'
);

DELETE FROM public.accounts WHERE name = 'Smith Family Account';
*/

-- ============================================================================
-- END OF SEED DATA SCRIPT
-- ============================================================================
