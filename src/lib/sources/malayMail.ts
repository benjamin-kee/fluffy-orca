import type { NewsSource } from "./newsSource";
import { fetchFeed, normalizeRssItems } from "./rss";

const NAME = "Malay Mail";
const FEED_URL = "https://www.malaymail.com/feed/rss/money";

// Malay Mail's <guid> is the article permalink and is unique per item, so it is used as external_id.
export function normalizeMalayMail(xml: string) {
  return normalizeRssItems(xml, NAME);
}

export const malayMail: NewsSource = {
  name: NAME,
  feedUrl: FEED_URL,
  async fetchArticles() {
    return normalizeMalayMail(await fetchFeed(FEED_URL));
  },
};
