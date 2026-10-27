import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDayFilter } from "@/lib/dateFilter";
import { pageHref } from "@/lib/pagination";

const onDay = (iso: string, day: { start: string; end: string }) => {
  const t = new Date(iso).getTime();
  return t >= new Date(day.start).getTime() && t < new Date(day.end).getTime();
};

test("a day runs midnight to midnight in the viewer's time zone", () => {
  const day = parseDayFilter({ date: "2026-10-21", tz: "America/Toronto" });
  assert.deepEqual(day, {
    date: "2026-10-21",
    timeZone: "America/Toronto",
    start: "2026-10-21T04:00:00.000Z",
    end: "2026-10-22T04:00:00.000Z",
  });
});

test("a Malaysian headline at 9pm MYT falls on the Toronto day where it reads 9am", () => {
  const toronto = parseDayFilter({ date: "2026-10-21", tz: "America/Toronto" })!;
  assert.ok(onDay("2026-10-21T21:00:00+08:00", toronto));
  assert.ok(!onDay("2026-10-21T09:00:00+08:00", toronto));
});

test("the midnight edges belong to the right day", () => {
  const day = parseDayFilter({ date: "2026-10-21", tz: "Asia/Kuala_Lumpur" })!;
  assert.ok(onDay("2026-10-21T00:00:00+08:00", day));
  assert.ok(onDay("2026-10-21T23:59:00+08:00", day));
  assert.ok(!onDay("2026-10-22T00:00:00+08:00", day));
  assert.ok(!onDay("2026-10-20T23:59:59+08:00", day));
});

test("a daylight-saving change day is 25 hours long", () => {
  const day = parseDayFilter({ date: "2026-11-01", tz: "America/Toronto" })!;
  assert.equal(day.start, "2026-11-01T04:00:00.000Z");
  assert.equal(day.end, "2026-11-02T05:00:00.000Z");
});

test("a missing or unknown time zone falls back to Malaysia", () => {
  for (const tz of [undefined, "Not/AZone"]) {
    const day = parseDayFilter({ date: "2026-10-21", tz })!;
    assert.equal(day.timeZone, "Asia/Kuala_Lumpur");
    assert.equal(day.start, "2026-10-20T16:00:00.000Z");
  }
});

test("invalid dates and dates before 1 January 2026 mean no filter", () => {
  for (const date of [undefined, "", "hello", "2026-1-5", "2026-02-30", "2025-12-31"]) {
    assert.equal(parseDayFilter({ date }), null, String(date));
  }
  assert.notEqual(parseDayFilter({ date: "2026-01-01" }), null);
});

test("page links keep the chosen day", () => {
  assert.equal(pageHref(2, 50), "/?page=2&size=50");
  assert.equal(
    pageHref(1, 100, { day: { date: "2026-10-21", timeZone: "America/Toronto" } }),
    "/?date=2026-10-21&tz=America%2FToronto&page=1&size=100",
  );
});
