import type { NewArticle } from "@/lib/article";
import type { NewsSource } from "./newsSource";
import { cleanArticleUrl, cleanTitle, parsePublishedAt } from "./normalize";

const NAME = "GNews";
const ENDPOINT = "https://gnews.io/api/v4/top-headlines";
// Malaysian business top headlines in English. The free plan returns at most 10 articles per request.
const QUERY = { category: "business", country: "my", lang: "en", max: "10" };
const FETCH_TIMEOUT_MS = 10_000;

type GNewsArticle = {
  title?: unknown;
  url?: unknown;
  publishedAt?: unknown;
  source?: { name?: unknown };
};

const str = (value: unknown) => (typeof value === "string" ? value : undefined);

// Each GNews article names its original publisher, which is stored as the article's source.
// The cleaned article URL is the external_id: GNews has no documented stable article ID.
export function normalizeGNews(body: unknown): NewArticle[] {
  const items = (body as { articles?: unknown })?.articles;
  if (!Array.isArray(items)) throw new Error("Unexpected GNews response: no articles array");

  const articles: NewArticle[] = [];
  let skipped = 0;

  for (const item of items as GNewsArticle[]) {
    const rawTitle = str(item.title);
    const title = rawTitle ? cleanTitle(rawTitle) : "";
    const source = str(item.source?.name)?.trim();
    const sourceUrl = str(item.url)?.trim();
    const articleUrl = sourceUrl ? cleanArticleUrl(sourceUrl) : undefined;
    const rawDate = str(item.publishedAt);
    const publishedAt = rawDate ? parsePublishedAt(rawDate) : undefined;

    if (!title || !source || !sourceUrl || !articleUrl || !publishedAt) {
      skipped++;
      continue;
    }
    articles.push({
      title,
      source,
      source_url: sourceUrl,
      article_url: articleUrl,
      published_at: publishedAt,
      external_id: articleUrl,
    });
  }

  if (skipped > 0) console.warn(`[ingest] source=${NAME} skipped_invalid=${skipped}`);
  return articles;
}

export class GNewsRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// One GNews request. `range` limits it to articles published in [from, to); `page` selects a page of 10.
export async function fetchGNewsHeadlines(range?: { from: string; to: string; page: number }) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) throw new Error("GNEWS_API_KEY must be set");

  const params = new URLSearchParams({ ...QUERY, apikey: apiKey });
  if (range) {
    params.set("from", range.from);
    params.set("to", range.to);
    params.set("page", String(range.page));
  }
  const response = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: "no-store" });
  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const errors = (body as { errors?: unknown })?.errors;
    const detail = Array.isArray(errors) ? errors.filter((e) => typeof e === "string").join("; ") : "";
    throw new GNewsRequestError(`GNews request failed: HTTP ${response.status}${detail ? ` (${detail})` : ""}`, response.status);
  }
  const total = (body as { totalArticles?: unknown })?.totalArticles;
  return { articles: normalizeGNews(body), total: typeof total === "number" ? total : 0 };
}

export const gnews: NewsSource = {
  name: NAME,
  async fetchArticles() {
    return (await fetchGNewsHeadlines()).articles;
  },
};
