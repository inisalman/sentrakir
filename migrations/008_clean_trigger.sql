DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.companies (
      id, 
      email, 
      company_name, 
      phone_number, 
      pic_name, 
      membership_tier, 
      registration_status, 
      subscription_status
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'phone', ''),
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      'free',
      'pending_payment',
      'inactive'
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
