-- Phoenix MVP0: let the server-side secret (service_role) key read and insert articles.
-- Run once in the Supabase SQL editor after 0001 (see README).
-- Newer Supabase projects do not grant table access to API roles by default.
-- anon and authenticated keep no access.
grant select, insert on public.articles to service_role;
