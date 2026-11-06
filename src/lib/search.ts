// Keyword search over headline titles (SPEC-MVP1, MVP1.6).

export const MAX_SEARCH_LENGTH = 200;

// q is the search as typed, trimmed. tooLong means it is over the limit, so nothing is searched.
export type Search = { q: string; tooLong: boolean };

type SearchParams = Record<string, string | string[] | undefined>;

// An empty or missing `q` means no search.
export function parseSearch(params: SearchParams): Search | null {
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = raw?.trim() ?? "";
  if (q === "") return null;
  return { q, tooLong: q.length > MAX_SEARCH_LENGTH };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-10-21" -> "21 Oct 2026", the feed's date style.
export function formatDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// The no-match message (MVP1.6-R7): repeats the search and names the chosen dates.
export function noMatchText(q: string, from: string | null, to: string | null): string {
  const base = `No headlines match “${q}”`;
  if (from && to) return from === to ? `${base} on ${formatDay(from)}.` : `${base} from ${formatDay(from)} to ${formatDay(to)}.`;
  if (from) return `${base} from ${formatDay(from)} onward.`;
  if (to) return `${base} up to ${formatDay(to)}.`;
  return `${base}.`;
}
