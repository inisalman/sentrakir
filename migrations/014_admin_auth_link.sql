-- Migration: Link admins to Supabase Auth
--
-- 1. Add auth_user_id to admins table
-- 2. Update RLS policies to use auth.uid() directly for admins

-- 1. Add auth_user_id column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update Admin RLS Policy to allow them to see their own data via auth_user_id
DROP POLICY IF EXISTS "Admins see own data" ON admins;

CREATE POLICY "Admins see own data" ON admins
  FOR SELECT USING (
    id::text = get_auth_id() OR auth_user_id = auth.uid()
  );

-- Update Helper functions to use auth_user_id
CREATE OR REPLACE FUNCTION is_admin_sentra() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE (id::text = get_auth_id() OR auth_user_id = auth.uid()) AND tier = 'sentra'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_admin_padajaya() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE (id::text = get_auth_id() OR auth_user_id = auth.uid()) AND tier = 'padajaya'
  );
$$ LANGUAGE sql STABLE;