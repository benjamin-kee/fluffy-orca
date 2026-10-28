"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isValidDate, localDate, type RangeParam } from "@/lib/dateFilter";
import { pageHref } from "@/lib/pagination";

type Props = { range: RangeParam | null; size: number; oldest: string | null };

// From and To dates in the viewer's own time zone, each from the oldest headline's day to today.
// Changing either goes to page 1; clearing both shows all dates. On touch screens the date applies
// when the calendar closes: phones such as iPhones fill in today as soon as an empty box is
// opened, and applying that at once reloads the list and closes the calendar.
export function DateFilter({ range, size, oldest }: Props) {
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

  function apply(end: "from" | "to", value: string) {
    if (value === (end === "from" ? from : to)) return;
    const { earliest, today } = limits;
    // Skips partial values some browsers report while the year is being typed, and out-of-range days.
    if (value !== "" && (!isValidDate(value) || (earliest && value < earliest) || (today && value > today))) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const next = { from: from || null, to: to || null, timeZone, [end]: value || null };
    router.push(pageHref(1, size, next.from || next.to ? next : null));
  }

  const input = (end: "from" | "to", value: string) => (
    <input
      key={value}
      type="date"
      min={limits.earliest}
      max={limits.today}
      defaultValue={value}
      onChange={(e) => !touch && apply(end, e.target.value)}
      onBlur={(e) => apply(end, e.target.value)}
    />
  );

  return (
    <span className="date-filter">
      <label>From {input("from", from)}</label> <label>To {input("to", to)}</label>
    </span>
  );
}
