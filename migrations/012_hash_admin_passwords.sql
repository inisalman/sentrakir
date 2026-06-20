-- Migration: Hash admin passwords using pgcrypto
--
-- Changes:
-- 1. Enable pgcrypto extension for password hashing
-- 2. Update check_admin_password RPC to use crypt() instead of plaintext comparison
-- 3. Hash all existing plaintext passwords
-- 4. Add trigger to auto-hash on INSERT/UPDATE

-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Update admin login RPC to use crypt() comparison
CREATE OR REPLACE FUNCTION check_admin_password(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  location_type TEXT,
  allowed_services TEXT[],
  registration_code TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.name, a.email, a.location_type, a.allowed_services, a.registration_code
  FROM admins a
  WHERE a.email ILIKE p_email
    AND (a.password = crypt(p_password, a.password) OR a.password = p_password);
  -- Dual check: crypt() for hashed, plaintext for legacy (until all migrated)
  -- After migration confirmed, remove the OR a.password = p_password fallback
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION check_admin_password TO anon, authenticated;

-- 3. Hash existing plaintext passwords
-- Only hashes passwords that look like plaintext (not already in $2a$ bcrypt format)
UPDATE admins
SET password = crypt(password, gen_salt('bf'))
WHERE password IS NOT NULL
  AND password != ''
  AND password NOT LIKE '$2a$%'
  AND password NOT LIKE '$2b$%';

-- 4. Trigger function to auto-hash passwords on insert/update
CREATE OR REPLACE FUNCTION hash_admin_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password changed and is not already hashed
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password IS DISTINCT FROM OLD.password) THEN
    IF NEW.password IS NOT NULL AND NEW.password != ''
       AND NEW.password NOT LIKE '$2a$%'
       AND NEW.password NOT LIKE '$2b$%' THEN
      NEW.password := crypt(NEW.password, gen_salt('bf'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_hash_admin_password ON admins;

-- Apply trigger
CREATE TRIGGER trg_hash_admin_password
  BEFORE INSERT OR UPDATE OF password ON admins
  FOR EACH ROW
  EXECUTE FUNCTION hash_admin_password();

COMMENT ON FUNCTION check_admin_password IS
  'Check admin credentials using bcrypt hashing. Supports both hashed and legacy plaintext for migration.';
COMMENT ON FUNCTION hash_admin_password IS
  'Auto-hash admin passwords before insert/update using bcrypt.';
