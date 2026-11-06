-- Watchtower MVP1.6: keyword search index (SPEC-MVP1, approval item A3).
-- Run once in the Supabase SQL editor (see README). Adds an index only: no table, column or data changes.

-- Full-text index on headline titles, English rules. Search queries use the same
-- expression, to_tsvector('english', title), so Postgres can use this index.
create index if not exists articles_title_search_idx
  on public.articles using gin (to_tsvector('english', title));
