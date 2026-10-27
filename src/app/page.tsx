import Link from "next/link";
import { ArticleItem } from "@/components/ArticleItem";
import { DateFilter } from "@/components/DateFilter";
import { EmptyDay } from "@/components/EmptyDay";
import { PageSizeSelect } from "@/components/PageSizeSelect";
import { Pagination } from "@/components/Pagination";
import type { Article } from "@/lib/article";
import { countArticles, listArticles, oldestPublishedAt } from "@/lib/articleRepository";
import { malaysiaDate, parseDateRange } from "@/lib/dateFilter";
import { pageHref, parsePageParams } from "@/lib/pagination";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const { page, size } = parsePageParams(params);
  const range = parseDateRange(params);
  const rangeParam = range && { from: range.from, to: range.to };

  let total = 0;
  let articles: Article[] = [];
  let oldest: Date | null;
  try {
    // From after To lists nothing, so only the oldest date is read.
    [oldest, total, articles] = await Promise.all([
      oldestPublishedAt(),
      range?.reversed ? 0 : countArticles(range),
      range?.reversed ? [] : listArticles((page - 1) * size, size, range),
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
        <DateFilter
          range={rangeParam}
          size={size}
          earliest={oldest && malaysiaDate(oldest)}
          today={malaysiaDate(new Date())}
        />
        <PageSizeSelect size={size} range={rangeParam} />
        {range && <Link href={pageHref(1, size)}>Show all dates</Link>}
      </div>
      {range?.reversed ? (
        <p role="alert">From date must be on or before To date.</p>
      ) : articles.length > 0 ? (
        <ol className="feed">
          {articles.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </ol>
      ) : range && total === 0 ? (
        <EmptyDay />
      ) : (
        <p>{total === 0 ? "No headlines yet." : "No headlines on this page."}</p>
      )}
      <Pagination page={page} size={size} totalPages={totalPages} range={rangeParam} />
    </main>
  );
}
