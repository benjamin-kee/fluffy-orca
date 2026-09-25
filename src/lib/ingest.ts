import { insertNewArticles } from "@/lib/articleRepository";
import type { NewsSource } from "@/lib/sources/newsSource";

export type SourceResult =
  | { source: string; ok: true; fetched: number; inserted: number; durationMs: number }
  | { source: string; ok: false; error: string; durationMs: number };

async function ingestSource(source: NewsSource): Promise<SourceResult> {
  const started = Date.now();
  try {
    const articles = await source.fetchArticles();
    const inserted = await insertNewArticles(articles);
    const result = { source: source.name, ok: true as const, fetched: articles.length, inserted, durationMs: Date.now() - started };
    console.log(`[ingest] source=${source.name} ok fetched=${result.fetched} inserted=${inserted} duration_ms=${result.durationMs}`);
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const durationMs = Date.now() - started;
    console.error(`[ingest] source=${source.name} failed error="${error}" duration_ms=${durationMs}`);
    return { source: source.name, ok: false, error, durationMs };
  }
}

// Each source is processed independently; one failing does not stop the others.
export async function runIngestion(sources: NewsSource[]): Promise<SourceResult[]> {
  return Promise.all(sources.map(ingestSource));
}
