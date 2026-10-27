// Date range filter (SPEC-MVP1, MVP1.2). Every day runs from midnight to midnight
// Malaysia time, for every viewer. Malaysia has no daylight saving, so it is always UTC+08:00.

const MALAYSIA_OFFSET = "+08:00";
const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000;

// Both ends are optional; at least one is set. Dates are YYYY-MM-DD, inclusive.
export type RangeParam = { from: string | null; to: string | null };
// start and end are ISO instants; a headline is in range when start <= published_at < end.
// A missing end is open. reversed means From is after To, so nothing is listed.
export type DateRange = RangeParam & { start: string | null; end: string | null; reversed: boolean };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// A real calendar date written YYYY-MM-DD.
export function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const [y, m, d] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
}

// The Malaysia calendar date (YYYY-MM-DD) of an instant.
export function malaysiaDate(instant: Date): string {
  return new Date(instant.getTime() + MALAYSIA_OFFSET_MS).toISOString().slice(0, 10);
}

// The instant of 00:00 Malaysia time on the given date.
function malaysiaMidnight(date: string): string {
  return new Date(`${date}T00:00:00${MALAYSIA_OFFSET}`).toISOString();
}

function nextDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

// Reads `from` and `to`; an invalid value is ignored. A link with neither reads the
// MVP1.0 `date` as a one-day range. Returns null when no date is set.
export function parseDateRange(params: SearchParams): DateRange | null {
  const valid = (value: string | undefined) => (value && isValidDate(value) ? value : null);
  let from = valid(first(params.from));
  let to = valid(first(params.to));
  if (!from && !to) from = to = valid(first(params.date));
  if (!from && !to) return null;

  return {
    from,
    to,
    start: from && malaysiaMidnight(from),
    end: to && malaysiaMidnight(nextDate(to)),
    reversed: !!from && !!to && from > to,
  };
}
