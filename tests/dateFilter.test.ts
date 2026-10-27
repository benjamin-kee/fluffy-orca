import assert from "node:assert/strict";
import { test } from "node:test";
import { malaysiaDate, parseDateRange, type DateRange } from "@/lib/dateFilter";
import { pageHref } from "@/lib/pagination";

const inRange = (iso: string, range: DateRange) => {
  const t = new Date(iso).getTime();
  return (!range.start || t >= new Date(range.start).getTime()) && (!range.end || t < new Date(range.end).getTime());
};

test("a range runs from From 00:00 to the end of To, Malaysia time", () => {
  assert.deepEqual(parseDateRange({ from: "2026-10-19", to: "2026-10-21" }), {
    from: "2026-10-19",
    to: "2026-10-21",
    start: "2026-10-18T16:00:00.000Z",
    end: "2026-10-21T16:00:00.000Z",
    reversed: false,
  });
});

test("the midnight edges belong to the right day", () => {
  const range = parseDateRange({ from: "2026-10-19", to: "2026-10-21" })!;
  assert.ok(inRange("2026-10-19T00:00:00+08:00", range));
  assert.ok(inRange("2026-10-21T23:59:00+08:00", range));
  assert.ok(!inRange("2026-10-18T23:59:59+08:00", range));
  assert.ok(!inRange("2026-10-22T00:00:00+08:00", range));
});

test("From alone runs onward and To alone runs up to the end of that day", () => {
  const from = parseDateRange({ from: "2026-10-21" })!;
  assert.equal(from.start, "2026-10-20T16:00:00.000Z");
  assert.equal(from.end, null);
  const to = parseDateRange({ to: "2026-10-21" })!;
  assert.equal(to.start, null);
  assert.equal(to.end, "2026-10-21T16:00:00.000Z");
});

test("From after To is flagged", () => {
  assert.equal(parseDateRange({ from: "2026-10-22", to: "2026-10-21" })!.reversed, true);
  assert.equal(parseDateRange({ from: "2026-10-21", to: "2026-10-21" })!.reversed, false);
});

test("an MVP1.0 date link reads as a one-day range, and its tz is ignored", () => {
  const range = parseDateRange({ date: "2026-10-21", tz: "America/Toronto" })!;
  assert.equal(range.from, "2026-10-21");
  assert.equal(range.to, "2026-10-21");
  assert.equal(range.start, "2026-10-20T16:00:00.000Z");
  assert.equal(range.end, "2026-10-21T16:00:00.000Z");
});

test("invalid dates are ignored", () => {
  for (const date of [undefined, "", "hello", "2026-1-5", "2026-02-30"]) {
    assert.equal(parseDateRange({ from: date, to: date, date }), null, String(date));
  }
  assert.deepEqual(parseDateRange({ from: "hello", to: "2026-10-21" })!.from, null);
});

test("Malaysia's date turns over at 16:00 UTC", () => {
  assert.equal(malaysiaDate(new Date("2026-10-27T15:59:59Z")), "2026-10-27");
  assert.equal(malaysiaDate(new Date("2026-10-27T16:00:00Z")), "2026-10-28");
});

test("page links keep the chosen dates", () => {
  assert.equal(pageHref(2, 50), "/?page=2&size=50");
  assert.equal(pageHref(1, 100, { from: "2026-10-19", to: "2026-10-21" }), "/?from=2026-10-19&to=2026-10-21&page=1&size=100");
  assert.equal(pageHref(1, 50, { from: null, to: "2026-10-21" }), "/?to=2026-10-21&page=1&size=50");
});
