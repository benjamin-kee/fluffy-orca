"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EARLIEST_DATE, isValidDate, localDate, type DayParam } from "@/lib/dateFilter";
import { pageHref } from "@/lib/pagination";

// Picks one day in the viewer's own time zone. Picking a date goes to page 1; clearing it shows all dates.
export function DateFilter({ day, size }: { day: DayParam | null; size: number }) {
  const router = useRouter();
  // Today on the viewer's clock, set in the browser so it uses their time zone.
  const [today, setToday] = useState<string>();

  useEffect(() => {
    setToday(localDate(new Date()));
  }, []);

  function onChange(value: string) {
    if (value === "") {
      router.push(pageHref(1, size));
      return;
    }
    // Skips partial values some browsers report while the year is being typed.
    if (!isValidDate(value) || (today && value > today)) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    router.push(pageHref(1, size, { date: value, timeZone }));
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
