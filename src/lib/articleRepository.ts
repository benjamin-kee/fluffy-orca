import type { Article, NewArticle } from "@/lib/article";
import { getDb } from "@/lib/db";

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

// Number of stored articles, within the window if one is given.
export async function countArticles(window: PublishedWindow | null = null): Promise<number> {
  let query = getDb().from(TABLE).select("id", { count: "exact", head: true });
  if (window?.start) query = query.gte("published_at", window.start);
  if (window?.end) query = query.lt("published_at", window.end);

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

// Newest first by publication time; id breaks ties so pages are stable.
export async function listArticles(offset: number, limit: number, window: PublishedWindow | null = null): Promise<Article[]> {
  let query = getDb()
    .from(TABLE)
    .select("id, title, source, source_url, article_url, published_at, ingested_at, external_id");
  if (window?.start) query = query.gte("published_at", window.start);
  if (window?.end) query = query.lt("published_at", window.end);

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to list articles: ${error.message}`);
  return data;
}
