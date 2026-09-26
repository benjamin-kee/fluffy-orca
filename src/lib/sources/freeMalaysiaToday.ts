import type { NewsSource } from "./newsSource";
import { fetchFeed, normalizeRssItems } from "./rss";

const NAME = "Free Malaysia Today";
const FEED_URL = "https://cms.freemalaysiatoday.com/category/business/feed";

// FMT's <guid> is the article URL (isPermaLink="false") and is unique per item, so it is used as external_id.
// Dates are given in UTC (+0000).
export function normalizeFreeMalaysiaToday(xml: string) {
  return normalizeRssItems(xml, NAME);
}

export const freeMalaysiaToday: NewsSource = {
  name: NAME,
  feedUrl: FEED_URL,
  async fetchArticles() {
    return normalizeFreeMalaysiaToday(await fetchFeed(FEED_URL));
  },
};
