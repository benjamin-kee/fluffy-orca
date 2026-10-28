"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SourceCount } from "@/lib/articleRepository";
import { toggleSourceHref } from "@/lib/sourceFilter";

type Props = { counts: SourceCount[]; selected: string[] };

// One checkbox per publisher, alphabetical, with its headline count within the other active filters.
// Ticking or unticking one goes to page 1 and keeps every other filter.
export function SourceFilter({ counts, selected }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  if (counts.length === 0) return null;

  return (
    <fieldset className="source-filter">
      <legend>Sources</legend>
      {counts.map(({ source, headlines }) => (
        <label key={source}>
          <input
            type="checkbox"
            checked={selected.includes(source)}
            onChange={() => router.push(toggleSourceHref(search.toString(), source))}
          />{" "}
          {source} ({headlines})
        </label>
      ))}
    </fieldset>
  );
}
