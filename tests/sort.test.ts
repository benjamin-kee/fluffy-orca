import assert from "node:assert/strict";
import { test } from "node:test";
import { pageHref } from "@/lib/pagination";
import { parseSort } from "@/lib/sort";

test("sort=oldest means oldest first; anything else is newest first", () => {
  assert.equal(parseSort({ sort: "oldest" }), "oldest");
  for (const sort of [undefined, "", "newest", "OLDEST", "asc"]) {
    assert.equal(parseSort({ sort }), "newest", String(sort));
  }
  assert.equal(parseSort({ sort: ["oldest", "newest"] }), "oldest");
});

test("page links keep the sort and leave out the default", () => {
  assert.equal(pageHref(2, 50, { sort: "newest" }), "/?page=2&size=50");
  assert.equal(pageHref(2, 50, { sort: "oldest" }), "/?sort=oldest&page=2&size=50");
  assert.equal(
    pageHref(1, 100, { day: { date: "2026-10-21", timeZone: "Asia/Kuala_Lumpur" }, sort: "oldest" }),
    "/?date=2026-10-21&tz=Asia%2FKuala_Lumpur&sort=oldest&page=1&size=100",
  );
});
