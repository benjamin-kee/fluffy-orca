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

// Case-insensitive, with numbers in number order ("9to5Linux" before "10x").
const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

// A–Z order for publisher names (Ben, 8 November 2026): names starting with a letter A to Z come
// first, alphabetical and ignoring case; names starting with anything else (a digit, a symbol)
// follow after Z, in the same order among themselves.
export function compareSourceNames(a: string, b: string): number {
  const group = (name: string) => (/^[a-z]/i.test(name) ? 0 : 1);
  return group(a) - group(b) || collator.compare(a, b);
}

// The publisher list in the chosen order: A–Z as above, or most headlines first with ties in A–Z order.
export function sortSources<T extends { source: string; headlines: number }>(counts: T[], order: SourceOrder): T[] {
  return [...counts].sort(
    (a, b) => (order === "count" ? b.headlines - a.headlines : 0) || compareSourceNames(a.source, b.source),
  );
}
