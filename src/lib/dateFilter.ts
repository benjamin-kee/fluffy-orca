// Single-day date filter (SPEC-MVP1, MVP1.0). A day runs from midnight to midnight
// in the viewer's own time zone, which the date picker puts in the URL as `tz`.

export const EARLIEST_DATE = "2026-01-01";
// Used when the URL has no valid `tz`, e.g. a hand-typed link.
export const DEFAULT_TIME_ZONE = "Asia/Kuala_Lumpur";

export type DayParam = { date: string; timeZone: string };
// start and end are ISO instants; a headline is on the day when start <= published_at < end.
export type DayFilter = DayParam & { start: string; end: string };

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

// A real calendar date written YYYY-MM-DD, on or after the earliest date.
export function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const [y, m, d] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  const real = parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d;
  return real && date >= EARLIEST_DATE;
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

// An invalid or missing date means no filter. An invalid or missing time zone falls back to Malaysia.
export function parseDayFilter(params: SearchParams): DayFilter | null {
  const date = first(params.date);
  if (!date || !isValidDate(date)) return null;

  const tz = first(params.tz);
  const timeZone = tz && isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE;

  return {
    date,
    timeZone,
    start: midnightIn(date, timeZone).toISOString(),
    end: midnightIn(nextDate(date), timeZone).toISOString(),
  };
}

// Today's date (YYYY-MM-DD) on the given clock, read in the runtime's local time zone.
export function localDate(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
