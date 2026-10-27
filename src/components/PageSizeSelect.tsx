"use client";

import { useRouter } from "next/navigation";
import type { DayParam } from "@/lib/dateFilter";
import { PAGE_SIZES, pageHref } from "@/lib/pagination";

// Changing the page size always returns to page 1 and keeps the chosen day.
export function PageSizeSelect({ size, day }: { size: number; day: DayParam | null }) {
  const router = useRouter();

  return (
    <label className="page-size">
      Headlines per page{" "}
      <select value={size} onChange={(e) => router.push(pageHref(1, Number(e.target.value), day))}>
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
