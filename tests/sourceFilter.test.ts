import assert from "node:assert/strict";
import { test } from "node:test";
import { pageHref } from "@/lib/pagination";
import { compareSourceNames, parseSources, sortSources, sourcesLabel, toggleSource } from "@/lib/sourceFilter";

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

test("the dropdown button names what is chosen", () => {
  assert.equal(sourcesLabel([]), "Sources: All");
  assert.equal(sourcesLabel(["The Star"]), "Sources: The Star");
  assert.equal(sourcesLabel(["The Star", "Bernama"]), "Sources: 2 selected");
});

test("A–Z puts names starting with A to Z first, ignoring case, then everything else", () => {
  const names = ["9to5Linux", "the edge", "https://example.com/", "8days.sg", "AeroRoutes", "airlive", "Bernama", "10x News", "@Media", "The Star"];
  assert.deepEqual(names.sort(compareSourceNames), [
    "AeroRoutes",
    "airlive",
    "Bernama",
    "https://example.com/",
    "the edge",
    "The Star",
    "@Media",
    "8days.sg",
    "9to5Linux",
    "10x News",
  ]);
});

test("the publisher list sorts A–Z or by most headlines, ties in A–Z order", () => {
  const counts = [
    { source: "8days.sg", headlines: 2 },
    { source: "The Star", headlines: 9 },
    { source: "Bernama", headlines: 2 },
    { source: "CNA", headlines: 5 },
    { source: "Malay Mail", headlines: 2 },
  ];
  assert.deepEqual(
    sortSources(counts, "name").map((c) => c.source),
    ["Bernama", "CNA", "Malay Mail", "The Star", "8days.sg"],
  );
  assert.deepEqual(
    sortSources(counts, "count").map((c) => c.source),
    ["The Star", "CNA", "Bernama", "Malay Mail", "8days.sg"],
  );
});
