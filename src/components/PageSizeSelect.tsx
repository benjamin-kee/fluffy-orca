"use client";

import { useRouter } from "next/navigation";
import { PAGE_SIZES, pageHref, type FeedQuery } from "@/lib/pagination";

// Changing the page size always returns to page 1 and keeps the chosen dates and sort.
export function PageSizeSelect({ size, query }: { size: number; query: FeedQuery }) {
  const router = useRouter();

  return (
    <label className="page-size">
      Headlines per page{" "}
      <select value={size} onChange={(e) => router.push(pageHref(1, Number(e.target.value), query))}>
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
