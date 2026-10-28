import type { Article, NewArticle } from "@/lib/article";
import { getDb } from "@/lib/db";
import type { Sort } from "@/lib/sort";

const TABLE = "articles";

// Keeps the first occurrence of each (source, external_id) within one batch.
export function dedupeArticles(articles: NewArticle[]): NewArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = `${article.source}\u0000${article.external_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Inserts articles not already stored; existing (source, external_id) rows are left untouched.
// Returns the number of newly inserted rows.
export async function insertNewArticles(articles: NewArticle[]): Promise<number> {
  const rows = dedupeArticles(articles);
  if (rows.length === 0) return 0;

  const { data, error } = await getDb()
    .from(TABLE)
    .upsert(rows, { onConflict: "source,external_id", ignoreDuplicates: true })
    .select("id");

  if (error) throw new Error(`Failed to insert articles: ${error.message}`);
  return data.length;
}

// Optional publication window: start <= published_at < end (ISO instants). A null bound is open.
export type PublishedWindow = { start: string | null; end: string | null };

// Number of stored articles, within the window and from the given sources if any are given.
export async function countArticles(window: PublishedWindow | null = null, sources: string[] = []): Promise<number> {
  let query = getDb().from(TABLE).select("id", { count: "exact", head: true });
  if (window?.start) query = query.gte("published_at", window.start);
  if (window?.end) query = query.lt("published_at", window.end);
  if (sources.length > 0) query = query.in("source", sources);

  const { count, error } = await query;
  if (error) throw new Error(`Failed to count articles: ${error.message}`);
  return count ?? 0;
}

// Publication time of the oldest stored article, or null when there are none.
export async function oldestPublishedAt(): Promise<Date | null> {
  const { data, error } = await getDb()
    .from(TABLE)
    .select("published_at")
    .order("published_at", { ascending: true })
    .limit(1);

  if (error) throw new Error(`Failed to read oldest article: ${error.message}`);
  return data.length > 0 ? new Date(data[0].published_at) : null;
}

// Ordered by publication time, newest first unless sort is "oldest"; id breaks ties in the
// same direction so pages are stable. No sources means all sources.
export async function listArticles(
  offset: number,
  limit: number,
  window: PublishedWindow | null = null,
  sort: Sort = "newest",
  sources: string[] = [],
): Promise<Article[]> {
  let query = getDb()
    .from(TABLE)
    .select("id, title, source, source_url, article_url, published_at, ingested_at, external_id");
  if (window?.start) query = query.gte("published_at", window.start);
  if (window?.end) query = query.lt("published_at", window.end);
  if (sources.length > 0) query = query.in("source", sources);

  const { data, error } = await query
    .order("published_at", { ascending: sort === "oldest" })
    .order("id", { ascending: sort === "oldest" })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to list articles: ${error.message}`);
  return data;
}

export type SourceCount = { source: string; headlines: number };

// Every stored publisher, alphabetical, with its headline count within the window (MVP1.3).
// Uses the read-only source_counts database function (migration 0004).
export async function sourceCounts(window: PublishedWindow | null = null): Promise<SourceCount[]> {
  const { data, error } = await getDb().rpc("source_counts", {
    p_start: window?.start ?? null,
    p_end: window?.end ?? null,
  });

  if (error) throw new Error(`Failed to count sources: ${error.message}`);
  return (data as { source: string; headlines: number | string }[]).map((row) => ({
    source: row.source,
    headlines: Number(row.headlines),
  }));
}
