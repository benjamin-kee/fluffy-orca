"use client";

import { useRouter } from "next/navigation";
import { PAGE_SIZES, pageHref } from "@/lib/pagination";

// Changing the page size always returns to page 1.
export function PageSizeSelect({ size }: { size: number }) {
  const router = useRouter();

  return (
    <label className="page-size">
      Headlines per page{" "}
      <select value={size} onChange={(e) => router.push(pageHref(1, Number(e.target.value)))}>
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
