import type { RangeParam } from "@/lib/dateFilter";
import { DEFAULT_SORT, type Sort } from "@/lib/sort";

export const PAGE_SIZES = [50, 100] as const;
export const DEFAULT_PAGE_SIZE = 50;

export type PageParams = { page: number; size: number };

type SearchParams = Record<string, string | string[] | undefined>;

// Invalid or missing values fall back to page 1 and the default size.
export function parsePageParams(params: SearchParams): PageParams {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const size = Number(first(params.size));
  const page = Number(first(params.page));

  return {
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

// The filters and sort that page links carry.
export type FeedQuery = { range?: RangeParam | null; sort?: Sort; sources?: string[] };

// Links keep the chosen dates, sources and sort, if any. The default sort is left out.
export function pageHref(page: number, size: number, { range, sort, sources = [] }: FeedQuery = {}): string {
  const params = new URLSearchParams();
  if (range) {
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    params.set("tz", range.timeZone);
  }
  for (const source of sources) params.append("source", source);
  if (sort && sort !== DEFAULT_SORT) params.set("sort", sort);
  params.set("page", String(page));
  params.set("size", String(size));
  return `/?${params}`;
}

// The line above the results, e.g. "Showing 51–100 of 340 headlines". Empty when nothing is listed.
export function resultCountText(page: number, size: number, shown: number, total: number): string {
  if (shown === 0) return "";
  if (total === 1) return "Showing 1 of 1 headline";
  const first = (page - 1) * size + 1;
  return `Showing ${first}–${first + shown - 1} of ${total} headlines`;
}

// Page numbers to show: first, last, and the neighbours of the current page. null marks a gap.
export function pageNumbers(current: number, totalPages: number): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || Math.abs(n - current) <= 1) {
      pages.push(n);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null);
    }
  }
  return pages;
}
