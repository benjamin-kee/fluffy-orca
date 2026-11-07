import assert from "node:assert/strict";
import { test } from "node:test";
import { pageHref } from "@/lib/pagination";
import { formatDay, noMatchText, parseSearch } from "@/lib/search";

test("the search is trimmed, and an empty one means no search", () => {
  assert.deepEqual(parseSearch({ q: "  petronas  " }), { q: "petronas", tooLong: false });
  for (const q of [undefined, "", "   "]) assert.equal(parseSearch({ q }), null, String(q));
  assert.equal(parseSearch({ q: ["maybank", "x"] })!.q, "maybank");
});

test("a search over 200 characters is flagged as too long", () => {
  assert.equal(parseSearch({ q: "a".repeat(200) })!.tooLong, false);
  assert.equal(parseSearch({ q: "a".repeat(201) })!.tooLong, true);
});

test("dates are written like the feed's dates", () => {
  assert.equal(formatDay("2026-10-21"), "21 Oct 2026");
  assert.equal(formatDay("2026-01-05"), "5 Jan 2026");
});

test("the no-match message repeats the search and names the dates", () => {
  assert.equal(noMatchText("petronas", null, null), "No headlines match “petronas”.");
  assert.equal(noMatchText("petronas", "2026-10-19", "2026-10-21"), "No headlines match “petronas” from 19 Oct 2026 to 21 Oct 2026.");
  assert.equal(noMatchText("petronas", "2026-10-21", "2026-10-21"), "No headlines match “petronas” on 21 Oct 2026.");
  assert.equal(noMatchText("petronas", "2026-10-19", null), "No headlines match “petronas” from 19 Oct 2026 onward.");
  assert.equal(noMatchText("petronas", null, "2026-10-21"), "No headlines match “petronas” up to 21 Oct 2026.");
});

test("page links keep the search", () => {
  assert.equal(pageHref(2, 50, { q: "maybank dividend" }), "/?q=maybank+dividend&page=2&size=50");
  assert.equal(
    pageHref(1, 50, { range: { from: "2026-10-21", to: null, timeZone: "Asia/Kuala_Lumpur" }, q: '"bank negara"', sort: "oldest" }),
    "/?from=2026-10-21&tz=Asia%2FKuala_Lumpur&q=%22bank+negara%22&sort=oldest&page=1&size=50",
  );
  assert.equal(pageHref(1, 50, { q: null }), "/?page=1&size=50");
});
