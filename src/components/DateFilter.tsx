"use client";

import { useRouter } from "next/navigation";
import { isValidDate, type RangeParam } from "@/lib/dateFilter";
import { pageHref } from "@/lib/pagination";

type Props = { range: RangeParam | null; size: number; earliest: string | null; today: string };

// From and To dates, each from the oldest headline's day to today in Malaysia. Changing either
// goes to page 1; clearing both shows all dates.
export function DateFilter({ range, size, earliest, today }: Props) {
  const router = useRouter();
  const from = range?.from ?? "";
  const to = range?.to ?? "";

  function onChange(end: "from" | "to", value: string) {
    // Skips partial values some browsers report while the year is being typed, and out-of-range days.
    if (value !== "" && (!isValidDate(value) || (earliest && value < earliest) || value > today)) return;
    const next = { from: from || null, to: to || null, [end]: value || null };
    router.push(pageHref(1, size, next.from || next.to ? next : null));
  }

  const input = (end: "from" | "to", value: string) => (
    <input
      key={value}
      type="date"
      min={earliest ?? undefined}
      max={today}
      defaultValue={value}
      onChange={(e) => onChange(end, e.target.value)}
    />
  );

  return (
    <span className="date-filter">
      <label>From {input("from", from)}</label> <label>To {input("to", to)}</label>
    </span>
  );
}
