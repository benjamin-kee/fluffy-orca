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

// Ignores case and accents ("École" sorts as "Ecole"), with numbers in number order
// ("9to5Linux" before "10x").
const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

// Which block a name sorts in: 0 starts with a letter A to Z, accented or not ("É" counts as "E");
// 1 starts with a letter of another alphabet (Thai, Chinese and so on); 2 anything else (digit, symbol).
function nameGroup(name: string): number {
  const first = name.normalize("NFD").charAt(0);
  if (/[a-z]/i.test(first)) return 0;
  return /\p{L}/u.test(first) ? 1 : 2;
}

// A–Z order for publisher names (Ben, 8 November 2026): names starting with a letter A to Z come
// first, alphabetical, ignoring case and accents; then names in other alphabets; then names starting
// with a digit or symbol. Each block is sorted the same way.
export function compareSourceNames(a: string, b: string): number {
  return nameGroup(a) - nameGroup(b) || collator.compare(a, b);
}

// The publisher list in the chosen order: most headlines first (the default) with ties in A–Z order,
// or A–Z as above.
export function sortSources<T extends { source: string; headlines: number }>(counts: T[], order: SourceOrder): T[] {
  return [...counts].sort(
    (a, b) => (order === "count" ? b.headlines - a.headlines : 0) || compareSourceNames(a.source, b.source),
  );
}
