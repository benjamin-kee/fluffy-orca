"use client";

import { useRouter } from "next/navigation";
import { pageHref, type FeedQuery } from "@/lib/pagination";
import type { Sort } from "@/lib/sort";

// Changing the sort returns to page 1 and keeps the chosen day and page size.
export function SortSelect({ size, query }: { size: number; query: FeedQuery }) {
  const router = useRouter();

  return (
    <label className="sort">
      Sort{" "}
      <select
        value={query.sort ?? "newest"}
        onChange={(e) => router.push(pageHref(1, size, { ...query, sort: e.target.value as Sort }))}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </label>
  );
}
