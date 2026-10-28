import assert from "node:assert/strict";
import { test } from "node:test";
import { pageHref, resultCountText } from "@/lib/pagination";
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
    pageHref(1, 100, { range: { from: "2026-10-21", to: "2026-10-21", timeZone: "Asia/Kuala_Lumpur" }, sort: "oldest" }),
    "/?from=2026-10-21&to=2026-10-21&tz=Asia%2FKuala_Lumpur&sort=oldest&page=1&size=100",
  );
});

test("the count line shows the range on this page and the total", () => {
  assert.equal(resultCountText(1, 50, 50, 340), "Showing 1–50 of 340 headlines");
  assert.equal(resultCountText(2, 50, 50, 340), "Showing 51–100 of 340 headlines");
  assert.equal(resultCountText(7, 50, 40, 340), "Showing 301–340 of 340 headlines");
  assert.equal(resultCountText(1, 100, 1, 1), "Showing 1 of 1 headline");
  assert.equal(resultCountText(9, 50, 0, 340), "");
});
