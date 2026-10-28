// Source filter (SPEC-MVP1, MVP1.3). The chosen publishers are repeated `source=` values in the URL.

type SearchParams = Record<string, string | string[] | undefined>;

// The chosen publishers, keeping only names found among the stored sources. None means all sources.
export function parseSources(params: SearchParams, known: string[]): string[] {
  const values = params.source === undefined ? [] : [params.source].flat();
  const knownSet = new Set(known);
  return [...new Set(values)].filter((value) => knownSet.has(value));
}

// The chosen publishers after ticking or unticking one.
export function toggleSource(chosen: string[], source: string): string[] {
  return chosen.includes(source) ? chosen.filter((s) => s !== source) : [...chosen, source];
}
