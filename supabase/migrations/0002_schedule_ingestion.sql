-- Phoenix MVP0: scheduled ingestion every 3 hours, starting 12am Malaysia time.
-- Run once in the Supabase SQL editor after the app is deployed (see README).
--
-- Before running, store the deployed ingest URL and the app's CRON_SECRET in Vault:
--   select vault.create_secret('https://<your-app>.vercel.app/api/ingest', 'phoenix_ingest_url');
--   select vault.create_secret('<CRON_SECRET>', 'phoenix_cron_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- pg_cron runs in UTC. Malaysia (UTC+08:00) 12am, 3am, ..., 9pm = 16:00, 19:00, ..., 13:00 UTC.
-- Re-running this replaces the existing job of the same name.
select cron.schedule(
  'phoenix-ingest',
  '0 1-22/3 * * *',
  $$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'phoenix_ingest_url'),
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'phoenix_cron_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);
