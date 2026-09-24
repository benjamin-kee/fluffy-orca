// The MVP0 Article: exactly the approved fields. Timestamps are ISO 8601 strings.
export type Article = {
  id: number;
  title: string;
  source: string;
  source_url: string;
  article_url: string;
  published_at: string;
  ingested_at: string;
  external_id: string;
};

// A normalized article produced by a source adapter, before it is stored.
export type NewArticle = Omit<Article, "id" | "ingested_at">;
