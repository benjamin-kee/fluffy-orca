"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EARLIEST_DATE, isValidDate, localDate } from "@/lib/dateFilter";
import { pageHref, type FeedQuery } from "@/lib/pagination";

// Picks one day in the viewer's own time zone. Picking a date goes to page 1; clearing it shows all dates.
// Either way the sort is kept.
export function DateFilter({ query, size }: { query: FeedQuery; size: number }) {
  const { day, sort } = query;
  const router = useRouter();
  // Today on the viewer's clock, set in the browser so it uses their time zone.
  const [today, setToday] = useState<string>();

  useEffect(() => {
    setToday(localDate(new Date()));
  }, []);

  function onChange(value: string) {
    if (value === "") {
      router.push(pageHref(1, size, { sort }));
      return;
    }
    // Skips partial values some browsers report while the year is being typed.
    if (!isValidDate(value) || (today && value > today)) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    router.push(pageHref(1, size, { day: { date: value, timeZone }, sort }));
  }

  return (
    <label className="date-filter">
      Date{" "}
      <input
        key={day?.date ?? ""}
        type="date"
        min={EARLIEST_DATE}
        max={today}
        defaultValue={day?.date ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
