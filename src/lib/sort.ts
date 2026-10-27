// Feed sort order (SPEC-MVP1, MVP1.1-R3). Newest first is the default and is left out of the URL.
export type Sort = "newest" | "oldest";
export const DEFAULT_SORT: Sort = "newest";

type SearchParams = Record<string, string | string[] | undefined>;

// `sort=oldest` means oldest first; anything else is ignored.
export function parseSort(params: SearchParams): Sort {
  const value = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  return value === "oldest" ? "oldest" : DEFAULT_SORT;
}
