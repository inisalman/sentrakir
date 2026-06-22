-- ============================================================
-- Full Supabase Auth Migration
-- Enables RLS with auth.uid() for row-level isolation
-- Run via Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Add auth_user_id FK to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_companies_auth_user_id ON companies(auth_user_id);

-- 2. One company per auth user
-- Note: wrapping in DO block to handle duplicate constraint error gracefully
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_auth_user_id_unique'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_auth_user_id_unique UNIQUE (auth_user_id);
  END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
-- companies: users can only read/update their own record
DROP POLICY IF EXISTS "Users read own company" ON companies;
CREATE POLICY "Users read own company" ON companies
  FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users update own company" ON companies;
CREATE POLICY "Users update own company" ON companies
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- vehicles: users can only access vehicles belonging to their company
DROP POLICY IF EXISTS "Users read own vehicles" ON vehicles;
CREATE POLICY "Users read own vehicles" ON vehicles
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users insert own vehicles" ON vehicles;
CREATE POLICY "Users insert own vehicles" ON vehicles
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users update own vehicles" ON vehicles;
CREATE POLICY "Users update own vehicles" ON vehicles
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users delete own vehicles" ON vehicles;
CREATE POLICY "Users delete own vehicles" ON vehicles
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

-- requests: same per-company isolation
DROP POLICY IF EXISTS "Users read own requests" ON requests;
CREATE POLICY "Users read own requests" ON requests
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users insert own requests" ON requests;
CREATE POLICY "Users insert own requests" ON requests
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );
