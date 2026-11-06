"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isValidDate, localDate } from "@/lib/dateFilter";
import { pageHref, type FeedQuery } from "@/lib/pagination";

type Props = { query: FeedQuery; size: number; oldest: string | null };

// From and To dates in the viewer's own time zone. The calendars offer the oldest headline's day
// to today, but some phones (iPhones) let any day be picked, so every real date picked is applied:
// a range with no headlines shows the empty message and From after To shows the wrong-order
// drawing, rather than the box showing a date the list ignores. Changing either date goes to
// page 1 and keeps the search and sort; clearing both shows all dates. On touch screens the date
// applies when the calendar closes: phones such as iPhones fill in today as soon as an empty box
// is opened, and applying that at once reloads the list and closes the calendar.
export function DateFilter({ query, size, oldest }: Props) {
  const { range } = query;
  const router = useRouter();
  const from = range?.from ?? "";
  const to = range?.to ?? "";
  // Set in the browser so both limits use the viewer's clock.
  const [limits, setLimits] = useState<{ earliest?: string; today?: string }>({});
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setLimits({ earliest: oldest ? localDate(new Date(oldest)) : undefined, today: localDate(new Date()) });
  }, [oldest]);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Returns false when the value is not a whole date yet (some browsers report partial values
  // while the year is being typed), so nothing is applied.
  function apply(end: "from" | "to", value: string): boolean {
    if (value === (end === "from" ? from : to)) return true;
    if (value !== "" && !isValidDate(value)) return false;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const next = { from: from || null, to: to || null, timeZone, [end]: value || null };
    router.push(pageHref(1, size, { ...query, range: next.from || next.to ? next : null }));
    return true;
  }

  const input = (end: "from" | "to", value: string) => (
    <input
      key={value}
      type="date"
      min={limits.earliest}
      max={limits.today}
      defaultValue={value}
      onChange={(e) => !touch && apply(end, e.target.value)}
      onBlur={(e) => {
        // A box left holding an unfinished date goes back to the date in use, so it never shows
        // a date the list is not filtered by.
        if (!apply(end, e.target.value)) e.target.value = value;
      }}
    />
  );

  return (
    <span className="date-filter">
      <label>From {input("from", from)}</label> <label>To {input("to", to)}</label>
    </span>
  );
}
