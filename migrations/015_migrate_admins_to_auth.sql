-- Migration: Move existing admins into Supabase Auth (auth.users)
-- This allows admins to login securely via standard Supabase Auth JWTs.

DO $$
DECLARE
  admin_rec RECORD;
  new_auth_id UUID;
BEGIN
  FOR admin_rec IN SELECT * FROM public.admins WHERE auth_user_id IS NULL
  LOOP
    new_auth_id := gen_random_uuid();

    -- 1. Insert into auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_auth_id, 'authenticated', 'authenticated', admin_rec.email, admin_rec.password,
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('name', admin_rec.name, 'admin_role', CASE WHEN admin_rec.is_super THEN 'super_admin' ELSE 'admin' END),
      false
    );

    -- 2. Insert into auth.identities
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_auth_id, new_auth_id, format('{"sub":"%s","email":"%s"}', new_auth_id::text, admin_rec.email)::jsonb, 'email', now(), now(), now()
    );

    -- 3. Link back to public.admins
    UPDATE public.admins SET auth_user_id = new_auth_id WHERE id = admin_rec.id;

  END LOOP;
END;
$$;
