import type { NewArticle } from "@/lib/article";

// Each news provider implements this; nothing outside src/lib/sources knows about specific providers.
export interface NewsSource {
  name: string;
  fetchArticles(): Promise<NewArticle[]>;
}
