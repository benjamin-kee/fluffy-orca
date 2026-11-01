"use client";

import { useRouter } from "next/navigation";
import { pageHref, type FeedQuery } from "@/lib/pagination";
import { MAX_SEARCH_LENGTH } from "@/lib/search";

// Searches headline titles. Submitting goes to page 1 and keeps the chosen dates, sort and page
// size; submitting an empty box removes the search.
export function SearchBox({ query, size }: { query: FeedQuery; size: number }) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(pageHref(1, size, { ...query, q: value || null }));
  }

  return (
    <form role="search" className="search" onSubmit={onSubmit}>
      <label>
        Search headlines{" "}
        <input key={query.q ?? ""} type="search" name="q" defaultValue={query.q ?? ""} maxLength={MAX_SEARCH_LENGTH} />
      </label>{" "}
      <button type="submit">Search</button>
    </form>
  );
}
