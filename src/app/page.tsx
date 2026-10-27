import Link from "next/link";
import { ArticleItem } from "@/components/ArticleItem";
import { DateFilter } from "@/components/DateFilter";
import { EmptyDay } from "@/components/EmptyDay";
import { PageSizeSelect } from "@/components/PageSizeSelect";
import { Pagination } from "@/components/Pagination";
import type { Article } from "@/lib/article";
import { countArticles, countArticlesPublishedBetween, listArticles } from "@/lib/articleRepository";
import { parseDayFilter } from "@/lib/dateFilter";
import { pageHref, parsePageParams } from "@/lib/pagination";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const { page, size } = parsePageParams(params);
  const day = parseDayFilter(params);
  const dayParam = day && { date: day.date, timeZone: day.timeZone };

  let total: number;
  let articles: Article[];
  try {
    [total, articles] = await Promise.all([
      day ? countArticlesPublishedBetween(day.start, day.end) : countArticles(),
      listArticles((page - 1) * size, size, day),
    ]);
  } catch (err) {
    console.error(`[feed] failed to load headlines: ${err instanceof Error ? err.message : String(err)}`);
    return (
      <main>
        <h1>Watchtower</h1>
        <p>Headlines could not be loaded. Please try again later.</p>
      </main>
    );
  }

  const totalPages = Math.ceil(total / size);

  return (
    <main>
      <h1>Watchtower</h1>
      <div className="controls">
        <DateFilter day={dayParam} size={size} />
        <PageSizeSelect size={size} day={dayParam} />
        {day && <Link href={pageHref(1, size)}>Show all dates</Link>}
      </div>
      {articles.length > 0 ? (
        <ol className="feed">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </ol>
      ) : day && total === 0 ? (
        <EmptyDay />
      ) : (
        <p>{total === 0 ? "No headlines yet." : "No headlines on this page."}</p>
      )}
      <Pagination page={page} size={size} totalPages={totalPages} day={dayParam} />
    </main>
  );
}
