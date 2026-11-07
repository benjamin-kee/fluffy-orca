-- Watchtower MVP1.3 with MVP1.6: publisher counts also follow the keyword search
-- (SPEC-MVP1 MVP1.3-R2, approval item A2). Run once in the Supabase SQL editor after 0004
-- and 0005 (see README). Read-only: it changes no data.

-- Replaces 0004's function with one that also takes the search. Calls without p_q work as before.
drop function if exists public.source_counts(timestamptz, timestamptz);

-- Every stored publisher name with the number of its headlines published in [p_start, p_end)
-- whose title matches p_q. A null bound or search is open. Publishers with none count 0.
-- The search uses the same rules as the headline list (English, websearch syntax), and the
-- same expression as the 0005 title index.
create function public.source_counts(
  p_start timestamptz default null,
  p_end timestamptz default null,
  p_q text default null
)
returns table (source text, headlines bigint)
language sql
stable
set search_path = ''
as $$
  select a.source,
         count(*) filter (where (p_start is null or a.published_at >= p_start)
                            and (p_end is null or a.published_at < p_end)
                            and (p_q is null
                                 or to_tsvector('english'::regconfig, a.title)
                                    @@ websearch_to_tsquery('english'::regconfig, p_q)))
  from public.articles a
  group by a.source
  order by lower(a.source), a.source;
$$;

-- Only the server-side secret (service_role) key may call it, as with the table.
revoke execute on function public.source_counts(timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function public.source_counts(timestamptz, timestamptz, text) to service_role;
