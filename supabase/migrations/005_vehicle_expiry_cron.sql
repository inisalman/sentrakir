-- pg_cron job: vehicle expiry reminder — runs daily at 08:00 WIB (01:00 UTC)
-- Requires pg_net extension for HTTP calls and pg_cron extension

-- Enable extensions if not yet enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily check
SELECT cron.schedule(
  'vehicle-expiry-daily-reminder',
  '0 1 * * *',  -- 01:00 UTC = 08:00 WIB
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/vehicle-expiry-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"adminId":"all"}'::jsonb
  );
  $$
);
