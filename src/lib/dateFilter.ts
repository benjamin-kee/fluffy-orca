// Date range filter (SPEC-MVP1, MVP1.2). A day runs from midnight to midnight in the
// viewer's own time zone, which the date picker puts in the URL as `tz`.

// Used when the URL has no valid `tz`, e.g. a hand-typed link.
export const DEFAULT_TIME_ZONE = "Asia/Kuala_Lumpur";

// Both ends are optional; at least one is set. Dates are YYYY-MM-DD, inclusive.
export type RangeParam = { from: string | null; to: string | null; timeZone: string };
// start and end are ISO instants; a headline is in range when start <= published_at < end.
// A missing end is open. reversed means From is after To, so nothing is listed.
export type DateRange = RangeParam & { start: string | null; end: string | null; reversed: boolean };

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

// A real calendar date written YYYY-MM-DD.
export function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const [y, m, d] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
}

// How far the time zone's wall clock is ahead of UTC at the given instant, in ms.
function offsetMs(timeZone: string, instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wallClock = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return wallClock - Math.floor(instant / 1000) * 1000;
}

// The instant of 00:00 on the given date in the given time zone. Two passes handle
// days where daylight saving changes the offset.
export function midnightIn(date: string, timeZone: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const wallClock = Date.UTC(y, m - 1, d);
  const guess = wallClock - offsetMs(timeZone, wallClock);
  return new Date(wallClock - offsetMs(timeZone, guess));
}

function nextDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

// Reads `from`, `to` and `tz`; an invalid date is ignored and an invalid time zone falls back
// to Malaysia. A link with neither date reads the MVP1.0 `date` as a one-day range.
// Returns null when no date is set.
export function parseDateRange(params: SearchParams): DateRange | null {
  const valid = (value: string | undefined) => (value && isValidDate(value) ? value : null);
  let from = valid(first(params.from));
  let to = valid(first(params.to));
  if (!from && !to) from = to = valid(first(params.date));
  if (!from && !to) return null;

  const tz = first(params.tz);
  const timeZone = tz && isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE;

  return {
    from,
    to,
    timeZone,
    start: from && midnightIn(from, timeZone).toISOString(),
    end: to && midnightIn(nextDate(to), timeZone).toISOString(),
    reversed: !!from && !!to && from > to,
  };
}

// The date (YYYY-MM-DD) of an instant, read in the runtime's local time zone.
export function localDate(instant: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`;
}
