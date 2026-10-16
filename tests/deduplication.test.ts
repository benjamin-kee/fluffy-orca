import assert from "node:assert/strict";
import { test } from "node:test";
import type { NewArticle } from "@/lib/article";
import { dedupeArticles } from "@/lib/articleRepository";
import { normalizeGNews } from "@/lib/sources/gnews";

const article = (overrides: Partial<NewArticle>): NewArticle => ({
  title: "Headline",
  source: "The Star",
  source_url: "https://example.com/a",
  article_url: "https://example.com/a",
  published_at: "2026-10-16T08:00:00.000Z",
  external_id: "https://example.com/a",
  ...overrides,
});

test("dedupeArticles keeps the first article for each source and external_id", () => {
  const first = article({ title: "First" });
  const result = dedupeArticles([first, article({ title: "Repeat" }), article({ external_id: "https://example.com/b" })]);
  assert.deepEqual(
    result.map((a) => a.external_id),
    ["https://example.com/a", "https://example.com/b"],
  );
  assert.equal(result[0], first);
});

test("dedupeArticles treats the same external_id from different sources as different articles", () => {
  const result = dedupeArticles([article({ source: "The Star" }), article({ source: "Free Malaysia Today" })]);
  assert.equal(result.length, 2);
});

test("the same story fetched again with different tracking links gets the same dedup key", () => {
  const item = (url: string) => ({ title: "Headline", url, publishedAt: "2026-10-16T08:00:00Z", source: { name: "The Star" } });
  const [firstRun] = normalizeGNews({ articles: [item("https://example.com/a?utm_source=gnews")] });
  const [laterRun] = normalizeGNews({ articles: [item("https://example.com/a?utm_campaign=x#section")] });

  assert.equal(firstRun.external_id, laterRun.external_id);
  assert.equal(dedupeArticles([firstRun, laterRun]).length, 1);
});
