-- Watchtower MVP1.3: headline count per publisher, for the source filter (SPEC-MVP1 approval item A2).
-- Run once in the Supabase SQL editor (see README). Read-only: it changes no data.

-- Every stored publisher name with the number of its headlines published in
-- [p_start, p_end). A null bound is open. Publishers with none in the window count 0.
create function public.source_counts(p_start timestamptz default null, p_end timestamptz default null)
returns table (source text, headlines bigint)
language sql
stable
set search_path = ''
as $$
  select a.source,
         count(*) filter (where (p_start is null or a.published_at >= p_start)
                            and (p_end is null or a.published_at < p_end))
  from public.articles a
  group by a.source
  order by lower(a.source), a.source;
$$;

-- Only the server-side secret (service_role) key may call it, as with the table.
revoke execute on function public.source_counts(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.source_counts(timestamptz, timestamptz) to service_role;
