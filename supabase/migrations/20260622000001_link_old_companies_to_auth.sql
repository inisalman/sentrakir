-- Migration: Link existing companies to auth.users if auth_user_id is null
-- This fixes the issue where old clients cannot login because they aren't linked to Supabase Auth.

DO $$
DECLARE
  company_rec RECORD;
  auth_user RECORD;
BEGIN
  FOR company_rec IN SELECT * FROM public.companies WHERE auth_user_id IS NULL
  LOOP
    -- Cari apakah ada user di auth.users dengan email yang sama
    SELECT * INTO auth_user FROM auth.users WHERE email = company_rec.email LIMIT 1;

    IF auth_user.id IS NOT NULL THEN
      -- Jika ada, link auth_user_id ke company
      UPDATE public.companies SET auth_user_id = auth_user.id WHERE id = company_rec.id;
    ELSE
      -- Jika tidak ada, buat user baru di auth.users (dummy password untuk force OAuth/reset)
      -- Optional: Kita bisa melewati ini atau biarkan user daftar ulang,
      -- tapi kita akan coba insert agar bisa langsung dilink.
      DECLARE
        new_auth_id UUID := gen_random_uuid();
      BEGIN
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, created_at, updated_at,
          raw_app_meta_data, raw_user_meta_data, is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', new_auth_id, 'authenticated', 'authenticated', company_rec.email, crypt(gen_random_uuid()::text, gen_salt('bf')),
          now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          json_build_object('company_name', company_rec.name),
          false
        );

        INSERT INTO auth.identities (
          id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
          new_auth_id, new_auth_id, format('{"sub":"%s","email":"%s"}', new_auth_id::text, company_rec.email)::jsonb, 'email', now(), now(), now()
        );

        UPDATE public.companies SET auth_user_id = new_auth_id WHERE id = company_rec.id;
      END;
    END IF;
  END LOOP;
END;
$$;
