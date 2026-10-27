import Link from "next/link";
import { ArticleItem } from "@/components/ArticleItem";
import { DateFilter } from "@/components/DateFilter";
import { EmptyDay } from "@/components/EmptyDay";
import { PageSizeSelect } from "@/components/PageSizeSelect";
import { Pagination } from "@/components/Pagination";
import { SortSelect } from "@/components/SortSelect";
import type { Article } from "@/lib/article";
import { countArticles, countArticlesPublishedBetween, listArticles } from "@/lib/articleRepository";
import { parseDayFilter } from "@/lib/dateFilter";
import { pageHref, parsePageParams, type FeedQuery } from "@/lib/pagination";
import { DEFAULT_SORT, parseSort } from "@/lib/sort";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const { page, size } = parsePageParams(params);
  const day = parseDayFilter(params);
  const sort = parseSort(params);
  const query: FeedQuery = { day: day && { date: day.date, timeZone: day.timeZone }, sort };
  const anythingSet = day !== null || sort !== DEFAULT_SORT;

  let total: number;
  let articles: Article[];
  try {
    [total, articles] = await Promise.all([
      day ? countArticlesPublishedBetween(day.start, day.end) : countArticles(),
      listArticles((page - 1) * size, size, day, sort),
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
        <DateFilter query={query} size={size} />
        <SortSelect query={query} size={size} />
        <PageSizeSelect size={size} query={query} />
        {day && <Link href={pageHref(1, size, { sort })}>Show all dates</Link>}
        {anythingSet && (
          // Clear all: back to page 1 of the full feed, keeping only the page size.
          <form action="/" className="clear-all">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="size" value={size} />
            <button type="submit">Clear all</button>
          </form>
        )}
      </div>
      {total > 0 && (
        <p className="result-count">
          Showing {articles.length} of {total} headlines
        </p>
      )}
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
      <Pagination page={page} size={size} totalPages={totalPages} query={query} />
    </main>
  );
}
