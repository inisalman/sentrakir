-- Fix pg_cron job: change from vehicle-expiry-reminder to notify-expiry
-- Run this in Supabase SQL Editor

-- Step 1: Unschedule old job
SELECT cron.unschedule('vehicle-expiry-daily-reminder');

-- Step 2: Schedule new job with correct function
SELECT cron.schedule(
  'vehicle-expiry-daily-reminder',
  '0 1 * * *',  -- 01:00 UTC = 08:00 WIB
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/notify-expiry',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"adminId":"all"}'::jsonb
  );
  $$
);

-- Step 3: Verify job is scheduled
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname = 'vehicle-expiry-daily-reminder';
