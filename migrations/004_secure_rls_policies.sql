-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing generic policies if any exist
DROP POLICY IF EXISTS "Public access" ON companies;
DROP POLICY IF EXISTS "Public access" ON admins;
DROP POLICY IF EXISTS "Public access" ON vehicles;
DROP POLICY IF EXISTS "Public access" ON admin_vehicles;
DROP POLICY IF EXISTS "Public access" ON requests;
DROP POLICY IF EXISTS "Public access" ON service_prices;
DROP POLICY IF EXISTS "Public access" ON chat_messages;

-- We assume custom JWT claims or auth.uid() holds the logged-in ID.
-- If you use custom claims, you'd extract it like: (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
-- We will use auth.uid() for UUID and a custom check for text IDs to be adaptable.
-- Create a helper function to get current user ID (adjust based on your auth method)
CREATE OR REPLACE FUNCTION get_auth_id() RETURNS text AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    auth.uid()::text
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_admin_sentra() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE id::text = get_auth_id() AND location_type = 'sentra'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_admin_padajaya() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE id::text = get_auth_id() AND location_type = 'padajaya'
  );
$$ LANGUAGE sql STABLE;

-- --------------------------------------------------------
-- 1. COMPANIES (Users)
-- Company sees its own data. Admin sees all (filtered by admin_id location logic if needed)
-- --------------------------------------------------------
CREATE POLICY "Company sees own data" ON companies
  FOR SELECT USING (id::text = get_auth_id());

CREATE POLICY "Admin sees companies" ON companies
  FOR ALL USING (
    (is_admin_sentra() AND admin_id::text = get_auth_id()) OR
    (is_admin_padajaya() AND admin_id::text = get_auth_id())
  );

CREATE POLICY "Company updates own data" ON companies
  FOR UPDATE USING (id::text = get_auth_id()) WITH CHECK (id::text = get_auth_id());

CREATE POLICY "Company inserts own data" ON companies
  FOR INSERT WITH CHECK (true); -- Allow registration, might need a trigger or edge function to secure this later.

-- --------------------------------------------------------
-- 2. VEHICLES (Company's vehicles)
-- Company sees/modifies own vehicles. Admins see vehicles belonging to companies they manage.
-- --------------------------------------------------------
CREATE POLICY "Company sees own vehicles" ON vehicles
  FOR SELECT USING (company_id::text = get_auth_id());

CREATE POLICY "Company manages own vehicles" ON vehicles
  FOR ALL USING (company_id::text = get_auth_id()) WITH CHECK (company_id::text = get_auth_id());

CREATE POLICY "Admin sees managed vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = vehicles.company_id
      AND c.admin_id::text = get_auth_id()
    )
  );

-- --------------------------------------------------------
-- 3. ADMIN_VEHICLES (Admin's specific fleet)
-- Admins only see and manage their own specific fleet.
-- --------------------------------------------------------
CREATE POLICY "Admin manages own fleet" ON admin_vehicles
  FOR ALL USING (admin_id::text = get_auth_id()) WITH CHECK (admin_id::text = get_auth_id());

-- --------------------------------------------------------
-- 4. REQUESTS
-- Company sees own requests. Admins see requests assigned to them.
-- --------------------------------------------------------
CREATE POLICY "Company manages own requests" ON requests
  FOR ALL USING (company_id::text = get_auth_id()) WITH CHECK (company_id::text = get_auth_id());

CREATE POLICY "Admin manages assigned requests" ON requests
  FOR ALL USING (admin_id::text = get_auth_id()) WITH CHECK (admin_id::text = get_auth_id());

-- --------------------------------------------------------
-- 5. CHAT MESSAGES
-- Company sees own chats. Admins see chats for their companies.
-- --------------------------------------------------------
CREATE POLICY "Company manages own chats" ON chat_messages
  FOR ALL USING (company_id::text = get_auth_id()) WITH CHECK (company_id::text = get_auth_id());

CREATE POLICY "Admin manages assigned chats" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = chat_messages.company_id
      AND c.admin_id::text = get_auth_id()
    )
  );

-- --------------------------------------------------------
-- 6. SERVICE PRICES
-- Public read, Admin write
-- --------------------------------------------------------
CREATE POLICY "Public read prices" ON service_prices
  FOR SELECT USING (true);

CREATE POLICY "Admins manage prices" ON service_prices
  FOR ALL USING (
    is_admin_sentra() OR is_admin_padajaya()
  ) WITH CHECK (
    is_admin_sentra() OR is_admin_padajaya()
  );

-- --------------------------------------------------------
-- 7. ADMINS
-- Admins see themselves. Superadmin logic can be added here if needed.
-- --------------------------------------------------------
CREATE POLICY "Admins see own data" ON admins
  FOR SELECT USING (id::text = get_auth_id());
