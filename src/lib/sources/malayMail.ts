import type { NewArticle } from "@/lib/article";
import type { NewsSource } from "./newsSource";
import { cleanArticleUrl, cleanTitle, fetchFeed, parsePublishedAt, parseRssItems } from "./rss";

const NAME = "Malay Mail";
const FEED_URL = "https://www.malaymail.com/feed/rss/money";

// Malay Mail's <guid> is the article permalink and is unique per item, so it is used as external_id.
export function normalizeMalayMail(xml: string): NewArticle[] {
  const articles: NewArticle[] = [];
  let skipped = 0;

  for (const item of parseRssItems(xml)) {
    const title = item.title ? cleanTitle(item.title) : "";
    const sourceUrl = item.link?.trim();
    const articleUrl = sourceUrl ? cleanArticleUrl(sourceUrl) : undefined;
    const publishedAt = item.pubDate ? parsePublishedAt(item.pubDate) : undefined;
    const externalId = item.guid?.trim() || articleUrl;

    if (!title || !sourceUrl || !articleUrl || !publishedAt || !externalId) {
      skipped++;
      continue;
    }
    articles.push({
      title,
      source: NAME,
      source_url: sourceUrl,
      article_url: articleUrl,
      published_at: publishedAt,
      external_id: externalId,
    });
  }

  if (skipped > 0) console.warn(`[ingest] source=${NAME} skipped_invalid=${skipped}`);
  return articles;
}

export const malayMail: NewsSource = {
  name: NAME,
  feedUrl: FEED_URL,
  async fetchArticles() {
    return normalizeMalayMail(await fetchFeed(FEED_URL));
  },
};
