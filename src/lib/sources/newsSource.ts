import type { NewArticle } from "@/lib/article";

// Each publisher implements this; nothing outside src/lib/sources knows about specific publishers.
export interface NewsSource {
  name: string;
  feedUrl: string;
  fetchArticles(): Promise<NewArticle[]>;
}
