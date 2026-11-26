-- Watchtower MVP3.0: Ask Watchtower (SPEC-MVP3 section 5, approvals A1 to A4, approved by Ben on 26 November 2026).
-- Run once in the Supabase SQL editor (see README). It adds one function, two tables and one scheduled job.
-- It does not change the articles table or any existing data.

-- A1. Question search function.
-- Finds up to 20 stored headlines containing ANY of the question's words (English full-text rules),
-- best match first, newer first on ties. Uses the MVP1.6 index on to_tsvector('english', title).
-- only_ids is for eval mode only: it limits the search to a fixed list of article ids.
-- plainto_tsquery joins the words with "&" (all words); replacing that with "|" means "any word".
create or replace function public.ask_search_headlines(question text, only_ids bigint[] default null)
returns table (id bigint, title text, source text, article_url text, published_at timestamptz, rank real)
language sql
stable
set search_path = public
as $$
  with q as (
    select replace(plainto_tsquery('english', question)::text, ' & ', ' | ')::tsquery as query
  )
  select a.id, a.title, a.source, a.article_url, a.published_at,
         ts_rank(to_tsvector('english', a.title), q.query) as rank
  from public.articles a, q
  where numnode(q.query) > 0
    and to_tsvector('english', a.title) @@ q.query
    and (only_ids is null or a.id = any(only_ids))
  order by rank desc, a.published_at desc, a.id desc
  limit 20
$$;

revoke execute on function public.ask_search_headlines(text, bigint[]) from public, anon, authenticated;
grant execute on function public.ask_search_headlines(text, bigint[]) to service_role;

-- A2. Trace table: one record per question (SPEC-MVP3 MVP3.0-R14 and R22).
create table public.ask_traces (
  id                   uuid        primary key,
  created_at           timestamptz not null default now(),
  session_id           text        not null,
  question             text        not null,
  headlines            jsonb       not null default '[]',   -- [{ "id": 123, "rank": 1 }, ...] as search returned them
  model                text        not null,
  instructions_version text        not null,
  raw_text             text,                                -- what the AI wrote, before processing
  cited_ids            bigint[]    not null default '{}',
  withdrawn_citations  bigint[]    not null default '{}',   -- citations the citation check rejected (R10)
  answer_withdrawn     boolean     not null default false,
  reply_type           text        not null check (reply_type in ('answer', 'fallback', 'no_coverage', 'error', 'paused')),
  links_shown          bigint[]    not null default '{}',
  input_tokens         integer     not null default 0,
  output_tokens        integer     not null default 0,
  cache_write_tokens   integer     not null default 0,
  cache_read_tokens    integer     not null default 0,
  estimated_cost_usd   numeric(12, 6) not null default 0,
  search_ms            integer,
  first_word_ms        integer,
  total_ms             integer,
  error                text,
  show_more_opened     boolean     not null default false,  -- R22
  links_clicked        jsonb       not null default '[]'    -- R22: [{ "position": 1, "id": 123 }, ...]
);

-- The spend cap adds up this month's costs, and the retention job deletes by age: both filter on created_at.
create index ask_traces_created_at_idx on public.ask_traces (created_at);

-- No policies: the public (anon) key cannot read or write this table. Only the server can.
alter table public.ask_traces enable row level security;
grant select, insert, update on public.ask_traces to service_role;

-- A3. Ratings table: one row per rated reply (R13). Deleted with its trace.
create table public.ask_feedback (
  id        uuid        primary key default gen_random_uuid(),
  trace_id  uuid        not null unique references public.ask_traces (id) on delete cascade,
  rated_at  timestamptz not null default now(),   -- when the rating was given or last changed
  rating    text        not null check (rating in ('up', 'down')),
  comment   text        check (char_length(comment) <= 1000),
  reason    text                                   -- one-tap reason; always empty until MVP3.3
);

alter table public.ask_feedback enable row level security;
grant select, insert, update on public.ask_feedback to service_role;

-- A4. Retention job: every day at 4:30am Malaysia time (20:30 UTC), delete traces older than 90 days.
-- Their ratings are deleted with them (on delete cascade). Re-running replaces the job of the same name.
create extension if not exists pg_cron;
select cron.schedule(
  'watchtower-ask-retention',
  '30 20 * * *',
  $$ delete from public.ask_traces where created_at < now() - interval '90 days' $$
);

-- To undo: select cron.unschedule('watchtower-ask-retention');
--          drop table public.ask_feedback; drop table public.ask_traces;
--          drop function public.ask_search_headlines(text, bigint[]);
