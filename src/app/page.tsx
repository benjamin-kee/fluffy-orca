import { ArticleItem } from "@/components/ArticleItem";
import { DateFilter } from "@/components/DateFilter";
import { EmptyDay } from "@/components/EmptyDay";
import { PageSizeSelect } from "@/components/PageSizeSelect";
import { Pagination } from "@/components/Pagination";
import { SortSelect } from "@/components/SortSelect";
import { SourceFilter } from "@/components/SourceFilter";
import { WrongOrder } from "@/components/WrongOrder";
import type { Article } from "@/lib/article";
import { countArticles, listArticles, oldestPublishedAt, sourceCounts, type SourceCount } from "@/lib/articleRepository";
import { parseDateRange } from "@/lib/dateFilter";
import { parsePageParams, resultCountText, type FeedQuery } from "@/lib/pagination";
import { DEFAULT_SORT, parseSort } from "@/lib/sort";
import { parseSources } from "@/lib/sourceFilter";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const { page, size } = parsePageParams(params);
  const range = parseDateRange(params);
  const sort = parseSort(params);

  let total = 0;
  let articles: Article[] = [];
  let oldest: Date | null;
  let counts: SourceCount[];
  let sources: string[] = [];
  try {
    // Publisher counts follow the other active filters (the dates). They are read first, because a
    // `source` value in the URL that is not a stored publisher is ignored.
    [oldest, counts] = await Promise.all([oldestPublishedAt(), sourceCounts(range)]);
    sources = parseSources(
      params,
      counts.map((c) => c.source),
    );
    // From after To lists nothing.
    if (!range?.reversed) {
      [total, articles] = await Promise.all([
        countArticles(range, sources),
        listArticles((page - 1) * size, size, range, sort, sources),
      ]);
    }
  } catch (err) {
    console.error(`[feed] failed to load headlines: ${err instanceof Error ? err.message : String(err)}`);
    return (
      <main>
        <h1>Watchtower</h1>
        <p>Headlines could not be loaded. Please try again later.</p>
      </main>
    );
  }

  const query: FeedQuery = { range: range && { from: range.from, to: range.to, timeZone: range.timeZone }, sort, sources };
  const anythingSet = range !== null || sort !== DEFAULT_SORT || sources.length > 0;
  const totalPages = Math.ceil(total / size);

  return (
    <main>
      <h1>Watchtower</h1>
      <div className="controls">
        <DateFilter query={query} size={size} oldest={oldest && oldest.toISOString()} />
        <SortSelect query={query} size={size} />
        <PageSizeSelect size={size} query={query} />
        <SourceFilter counts={counts} query={query} size={size} />
        {anythingSet && (
          // Clear all: back to page 1 of the full feed, keeping only the page size.
          <form action="/" className="clear-all">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="size" value={size} />
            <button type="submit">Clear all</button>
          </form>
        )}
      </div>
      {articles.length > 0 && <p className="result-count">{resultCountText(page, size, articles.length, total)}</p>}
      {range?.reversed ? (
        <WrongOrder />
      ) : articles.length > 0 ? (
        <ol className="feed">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </ol>
      ) : (range || sources.length > 0) && total === 0 ? (
        <EmptyDay />
      ) : (
        <p>{total === 0 ? "No headlines yet." : "No headlines on this page."}</p>
      )}
      <Pagination page={page} size={size} totalPages={totalPages} query={query} />
    </main>
  );
}
