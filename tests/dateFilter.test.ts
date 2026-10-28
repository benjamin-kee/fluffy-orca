import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDateRange, type DateRange } from "@/lib/dateFilter";
import { pageHref } from "@/lib/pagination";

const inRange = (iso: string, range: DateRange) => {
  const t = new Date(iso).getTime();
  return (!range.start || t >= new Date(range.start).getTime()) && (!range.end || t < new Date(range.end).getTime());
};

test("a range runs from From 00:00 to the end of To in the viewer's time zone", () => {
  assert.deepEqual(parseDateRange({ from: "2026-10-19", to: "2026-10-21", tz: "America/Toronto" }), {
    from: "2026-10-19",
    to: "2026-10-21",
    timeZone: "America/Toronto",
    start: "2026-10-19T04:00:00.000Z",
    end: "2026-10-22T04:00:00.000Z",
    reversed: false,
  });
});

test("the midnight edges belong to the right day", () => {
  const range = parseDateRange({ from: "2026-10-19", to: "2026-10-21", tz: "Asia/Kuala_Lumpur" })!;
  assert.ok(inRange("2026-10-19T00:00:00+08:00", range));
  assert.ok(inRange("2026-10-21T23:59:00+08:00", range));
  assert.ok(!inRange("2026-10-18T23:59:59+08:00", range));
  assert.ok(!inRange("2026-10-22T00:00:00+08:00", range));
});

test("a headline falls on the day its time reads in the viewer's time zone", () => {
  // 22 Oct 6:30am Malaysia time is 21 Oct 11:30pm in London.
  const b = "2026-10-22T06:30:00+08:00";
  assert.ok(inRange(b, parseDateRange({ date: "2026-10-21", tz: "Europe/London" })!));
  assert.ok(!inRange(b, parseDateRange({ date: "2026-10-21", tz: "Asia/Kuala_Lumpur" })!));
  assert.ok(inRange(b, parseDateRange({ date: "2026-10-22", tz: "Asia/Kuala_Lumpur" })!));
});

test("a daylight-saving change day is 25 hours long", () => {
  const range = parseDateRange({ date: "2026-11-01", tz: "America/Toronto" })!;
  assert.equal(range.start, "2026-11-01T04:00:00.000Z");
  assert.equal(range.end, "2026-11-02T05:00:00.000Z");
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

test("an MVP1.0 date link reads as a one-day range in its time zone", () => {
  const range = parseDateRange({ date: "2026-10-21", tz: "America/Toronto" })!;
  assert.equal(range.from, "2026-10-21");
  assert.equal(range.to, "2026-10-21");
  assert.equal(range.start, "2026-10-21T04:00:00.000Z");
  assert.equal(range.end, "2026-10-22T04:00:00.000Z");
});

test("a missing or unknown time zone falls back to Malaysia", () => {
  for (const tz of [undefined, "Not/AZone"]) {
    const range = parseDateRange({ from: "2026-10-21", tz })!;
    assert.equal(range.timeZone, "Asia/Kuala_Lumpur");
    assert.equal(range.start, "2026-10-20T16:00:00.000Z");
  }
});

test("invalid dates are ignored", () => {
  for (const date of [undefined, "", "hello", "2026-1-5", "2026-02-30"]) {
    assert.equal(parseDateRange({ from: date, to: date, date }), null, String(date));
  }
  assert.equal(parseDateRange({ from: "hello", to: "2026-10-21" })!.from, null);
});

test("page links keep the chosen dates and time zone", () => {
  assert.equal(pageHref(2, 50), "/?page=2&size=50");
  assert.equal(
    pageHref(1, 100, { from: "2026-10-19", to: "2026-10-21", timeZone: "Europe/London" }),
    "/?from=2026-10-19&to=2026-10-21&tz=Europe%2FLondon&page=1&size=100",
  );
  assert.equal(
    pageHref(1, 50, { from: null, to: "2026-10-21", timeZone: "Asia/Kuala_Lumpur" }),
    "/?to=2026-10-21&tz=Asia%2FKuala_Lumpur&page=1&size=50",
  );
});
