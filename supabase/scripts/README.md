# Supabase Database Scripts

This directory contains SQL scripts for setting up and managing the Altrea database schema.

## Files

- **`schema.sql`** - Complete database schema including:
  - All tables (profiles, accounts, care_team_members)
  - Row Level Security (RLS) policies
  - Database functions
  - Triggers
  - Indexes and constraints

## Usage

### Option 1: Supabase Dashboard (Recommended for new setups)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `schema.sql`
5. Click **Run** to execute the script

### Option 2: Supabase CLI

```bash
# If using local Supabase
supabase db reset

# Or apply the schema directly
psql -h localhost -U postgres -d postgres -f schema.sql
```

### Option 3: Migration-based (For existing projects)

If you're using migrations, you can copy the contents of `schema.sql` into a new migration file:

```bash
# Create a new migration
supabase migration new complete_schema

# Copy schema.sql content into the new migration file
# Then apply
supabase db push
```

## Schema Overview

### Tables

1. **`profiles`** - User profiles linked to `auth.users`
   - Stores user information (name, avatar, role)
   - Links users to accounts via `account_id`
   - Roles: `caregiver` or `elder`

2. **`accounts`** - Family/circle of care accounts
   - Represents a shared account for elder + caregivers
   - Stores device connection information in `connection_info` JSONB field
   - Multiple users can be linked to one account

3. **`care_team_members`** - Additional caregivers/family members
   - Contacts that can receive alerts (not necessarily users with accounts)
   - Stores contact info, relationship, and alert preferences
   - Linked to accounts

### Functions

- `handle_new_user()` - Automatically creates profile on user signup
- `create_account_and_link_user()` - Creates account and links current user
- `create_account_and_link_both_users()` - Creates account and links both users (for dual setup)
- `get_account_members()` - Helper function to get all users in an account

### Security

All tables have Row Level Security (RLS) enabled with policies that:
- Allow users to view/update their own data
- Allow users to view/update data for their account
- Restrict access based on account membership

## Verification

After running the schema, verify it was created correctly:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'accounts', 'care_team_members');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'accounts', 'care_team_members');

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_new_user', 'create_account_and_link_user', 'create_account_and_link_both_users');
```

## Notes

- The schema is idempotent - it uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS` to allow safe re-runs
- All foreign keys have appropriate `ON DELETE` behaviors
- Indexes are created for commonly queried columns
- The schema includes comprehensive comments for documentation

## Troubleshooting

### Error: "relation already exists"
- This is normal if tables already exist. The script uses `IF NOT EXISTS` so it's safe to re-run.

### Error: "permission denied"
- Make sure you're running the script as a user with appropriate permissions (typically the `postgres` superuser or Supabase service role).

### RLS policies not working
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- Check policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
