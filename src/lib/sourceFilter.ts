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

// The dropdown button's text: "Sources: All", the one chosen name, or how many are chosen.
export function sourcesLabel(chosen: string[]): string {
  if (chosen.length === 0) return "Sources: All";
  if (chosen.length === 1) return `Sources: ${chosen[0]}`;
  return `Sources: ${chosen.length} selected`;
}

export type SourceOrder = "name" | "count";

// The publisher list in the chosen order: as given (alphabetical), or most headlines first,
// with ties kept alphabetical.
export function sortSources<T extends { headlines: number }>(counts: T[], order: SourceOrder): T[] {
  if (order === "name") return counts;
  return counts.map((c, i) => ({ c, i })).sort((a, b) => b.c.headlines - a.c.headlines || a.i - b.i).map((x) => x.c);
}
