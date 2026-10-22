import type { Article } from "@/lib/article";
import { PublishedTime } from "./PublishedTime";

export function ArticleItem({ article }: { article: Article }) {
  return (
    <li className="article">
      <a href={article.article_url} target="_blank" rel="noopener noreferrer">
        {article.title}
      </a>
      <div className="meta">
        {article.source} · <PublishedTime iso={article.published_at} />
      </div>
    </li>
  );
}
