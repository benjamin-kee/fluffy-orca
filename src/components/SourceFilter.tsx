"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { SourceCount } from "@/lib/articleRepository";
import { pageHref, type FeedQuery } from "@/lib/pagination";
import { sourcesLabel, toggleSource } from "@/lib/sourceFilter";

type Props = { counts: SourceCount[]; query: FeedQuery; size: number };

// A "Sources" dropdown button. Opening it shows one checkbox per publisher, alphabetical, with its
// headline count within the other active filters. Ticking or unticking one goes to page 1 and keeps
// the other filters, the sort and the page size; the dropdown stays open so several can be ticked.
// Clicking outside it, or pressing Escape, closes it.
export function SourceFilter({ counts, query, size }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDetailsElement>(null);
  const chosen = query.sources ?? [];

  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  if (counts.length === 0) return null;

  return (
    <details className="source-filter" ref={ref}>
      <summary>{sourcesLabel(chosen)}</summary>
      <div className="source-list" role="group" aria-label="Sources">
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
      </div>
    </details>
  );
}
