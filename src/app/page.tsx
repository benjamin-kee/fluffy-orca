import { ArticleItem } from "@/components/ArticleItem";
import { PageSizeSelect } from "@/components/PageSizeSelect";
import { Pagination } from "@/components/Pagination";
import type { Article } from "@/lib/article";
import { countArticles, listArticles } from "@/lib/articleRepository";
import { parsePageParams } from "@/lib/pagination";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HomePage({ searchParams }: Props) {
  const { page, size } = parsePageParams(await searchParams);

  let total: number;
  let articles: Article[];
  try {
    [total, articles] = await Promise.all([countArticles(), listArticles((page - 1) * size, size)]);
  } catch (err) {
    console.error(`[feed] failed to load headlines: ${err instanceof Error ? err.message : String(err)}`);
    return (
      <main>
        <h1>Phoenix</h1>
        <p>Headlines could not be loaded. Please try again later.</p>
      </main>
    );
  }

  const totalPages = Math.ceil(total / size);

  return (
    <main>
      <h1>Phoenix</h1>
      <PageSizeSelect size={size} />
      {articles.length > 0 ? (
        <ol className="feed">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </ol>
      ) : (
        <p>{total === 0 ? "No headlines yet." : "No headlines on this page."}</p>
      )}
      <Pagination page={page} size={size} totalPages={totalPages} />
    </main>
  );
}
