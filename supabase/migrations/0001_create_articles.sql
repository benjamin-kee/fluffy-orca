-- Phoenix MVP0: article metadata index.
-- Run once in the Supabase SQL editor (see README).

create table public.articles (
  id            bigint generated always as identity primary key,
  title         text        not null,
  source        text        not null,
  source_url    text        not null,
  article_url   text        not null,
  published_at  timestamptz not null,
  ingested_at   timestamptz not null default now(),
  external_id   text        not null,
  constraint articles_source_external_id_key unique (source, external_id)
);

-- Newest-first feed ordering with a stable tie-breaker.
create index articles_published_at_id_idx
  on public.articles (published_at desc, id desc);

-- No policies: the public (anon) key cannot read or write this table.
-- The app accesses it server-side with the service-role key only.
alter table public.articles enable row level security;
