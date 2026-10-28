import assert from "node:assert/strict";
import { test } from "node:test";
import { pageHref } from "@/lib/pagination";
import { parseSources, toggleSource } from "@/lib/sourceFilter";

const known = ["Bernama", "The Edge", "The Star"];

test("no source in the URL means all sources", () => {
  assert.deepEqual(parseSources({}, known), []);
});

test("several sources are read from repeated values", () => {
  assert.deepEqual(parseSources({ source: ["The Star", "Bernama"] }, known), ["The Star", "Bernama"]);
  assert.deepEqual(parseSources({ source: "The Edge" }, known), ["The Edge"]);
});

test("unknown and repeated source values are ignored", () => {
  assert.deepEqual(parseSources({ source: ["Nope", "The Star", "The Star"] }, known), ["The Star"]);
  assert.deepEqual(parseSources({ source: "Nope" }, known), []);
});

test("ticking adds a source and unticking removes only that one", () => {
  assert.deepEqual(toggleSource(["Bernama"], "The Star"), ["Bernama", "The Star"]);
  assert.deepEqual(toggleSource(["Bernama", "The Star"], "Bernama"), ["The Star"]);
});

test("page links keep the chosen sources with the dates and sort", () => {
  assert.equal(
    pageHref(2, 100, {
      range: { from: "2026-10-19", to: null, timeZone: "Europe/London" },
      sort: "oldest",
      sources: ["Bernama", "The Star"],
    }),
    "/?from=2026-10-19&tz=Europe%2FLondon&source=Bernama&source=The+Star&sort=oldest&page=2&size=100",
  );
});
