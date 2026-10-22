const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const absoluteFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

// Under 24 hours: time elapsed ("30 mins ago"). Otherwise: date and time in the viewer's own time zone.
export function formatPublishedAt(publishedAt: Date, now: Date): string {
  const elapsed = now.getTime() - publishedAt.getTime();

  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) {
    const mins = Math.floor(elapsed / MINUTE);
    return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
  }
  if (elapsed < DAY) {
    const hrs = Math.floor(elapsed / HOUR);
    return `${hrs} ${hrs === 1 ? "hr" : "hrs"} ago`;
  }
  return absoluteFormat.format(publishedAt);
}
