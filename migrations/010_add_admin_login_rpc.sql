-- Migration: Add RPC function for admin password verification (bypasses RLS)
-- Required because RLS on admins table blocks SELECT when not logged in

-- Check admin password without RLS (SECURITY DEFINER = runs as table owner)
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
    AND a.password = p_password;
END;
$$;

-- Also grant anon access to this function (safe because it's SECURITY DEFINER but
-- only returns rows if both email AND password match)
GRANT EXECUTE ON FUNCTION check_admin_password TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION check_admin_password IS
  'Check admin credentials bypassing RLS. Only returns data if both email and password match.';
