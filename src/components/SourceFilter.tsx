"use client";

import { useRouter } from "next/navigation";
import type { SourceCount } from "@/lib/articleRepository";
import { pageHref, type FeedQuery } from "@/lib/pagination";
import { toggleSource } from "@/lib/sourceFilter";

type Props = { counts: SourceCount[]; query: FeedQuery; size: number };

// One checkbox per publisher, alphabetical, with its headline count within the other active filters.
// Ticking or unticking one goes to page 1 and keeps the other filters, the sort and the page size.
export function SourceFilter({ counts, query, size }: Props) {
  const router = useRouter();
  const chosen = query.sources ?? [];
  if (counts.length === 0) return null;

  return (
    <fieldset className="source-filter">
      <legend>Sources</legend>
      {counts.map(({ source, headlines }) => (
        <label key={source}>
          {/* Uncontrolled so the tick shows at once, before the new list loads. */}
          <input
            key={String(chosen.includes(source))}
            type="checkbox"
            defaultChecked={chosen.includes(source)}
            onChange={() => router.push(pageHref(1, size, { ...query, sources: toggleSource(chosen, source) }))}
          />{" "}
          {source} ({headlines})
        </label>
      ))}
    </fieldset>
  );
}
