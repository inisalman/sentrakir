-- ============================================================
-- RLS + Security Hardening Migration
-- NOTE: Complex auth.uid() policies excluded — client auth uses
-- custom Edge Function login, not Supabase Auth session, so
-- auth.uid() is always null. Edge Functions bypass RLS entirely
-- via service_role key. Client-side queries are restricted by
-- explicit column selection in supabaseClientAuth.js.
-- ============================================================

-- --- companies ---
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- No policies needed for now — Edge Functions bypass RLS, client
-- queries use explicit column selects without password

-- --- vehicles ---
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- No policies needed for now

-- --- service_requests / requests ---
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- No policies needed for now

-- --- Create a safe view (no password) for future use ---
CREATE OR REPLACE VIEW companies_safe AS
SELECT
  id, name, pic_name, pic_phone, email, address,
  membership_tier, membership_price,
  subscription_status, status,
  admin_id, payment_proof_path,
  last_active, created_at
FROM companies;

GRANT SELECT ON companies_safe TO authenticated;
