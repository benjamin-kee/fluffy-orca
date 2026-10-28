// Source filter (SPEC-MVP1, MVP1.3). The chosen publishers are repeated `source=` values in the URL.

type SearchParams = Record<string, string | string[] | undefined>;

// The chosen publishers, keeping only names found among the stored sources. None means all sources.
export function parseSources(params: SearchParams, known: string[]): string[] {
  const values = params.source === undefined ? [] : [params.source].flat();
  const knownSet = new Set(known);
  return [...new Set(values)].filter((value) => knownSet.has(value));
}

// The feed link after ticking or unticking one publisher: other values stay, page goes back to 1.
export function toggleSourceHref(search: string, source: string): string {
  const params = new URLSearchParams(search);
  const chosen = params.getAll("source");
  const next = chosen.includes(source) ? chosen.filter((s) => s !== source) : [...chosen, source];
  params.delete("source");
  for (const s of next) params.append("source", s);
  params.set("page", "1");
  return `/?${params}`;
}
