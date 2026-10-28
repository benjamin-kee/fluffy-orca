import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSources, toggleSourceHref } from "@/lib/sourceFilter";

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

test("ticking a source adds it, keeps other filters and returns to page 1", () => {
  assert.equal(
    toggleSourceHref("from=2026-10-19&tz=Europe%2FLondon&source=Bernama&page=3&size=100", "The Star"),
    "/?from=2026-10-19&tz=Europe%2FLondon&page=1&size=100&source=Bernama&source=The+Star",
  );
});

test("unticking a source removes only that one", () => {
  assert.equal(toggleSourceHref("source=Bernama&source=The+Star&page=2&size=50", "Bernama"), "/?page=1&size=50&source=The+Star");
});
