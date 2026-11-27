// SPEC-MVP3 MVP3.0-R20: reply types and markers, the citation check, fallback wording, the 5-link limit
// and "Show 5 more", the 500-character limit, the spend cap and its month boundary, and the kill switch.
import assert from "node:assert/strict";
import { test } from "node:test";
import { askEnabled, estimateCostUsd, MAX_QUESTION_CHARS } from "@/lib/ask/config";
import { markerCheck, moreHeadlines, processReply } from "@/lib/ask/reply";
import { isPaused, monthStartMalaysia, pausedWording } from "@/lib/ask/spendCap";
import { WORDING, fallbackWording, showMoreLabel } from "@/lib/ask/wording";

const searched = new Set([11, 12, 13, 14, 15, 16, 17, -9001]);

test("NO_COVERAGE gives the no-coverage reply with no links", () => {
  const r = processReply([{ text: "NO_COVERAGE", citedIds: [] }], searched);
  assert.equal(r.replyType, "no_coverage");
  assert.deepEqual(r.links, []);
});

test("NO_DIRECT_HEADLINES gives the no-coverage reply type with the 'No direct headlines found.' wording and no links", () => {
  const r = processReply([{ text: "NO_DIRECT_HEADLINES", citedIds: [] }], searched);
  assert.equal(r.replyType, "no_coverage");
  assert.equal(r.noDirect, true);
  assert.deepEqual(r.links, []);
  assert.equal(WORDING.noDirectHeadlines, "No direct headlines found.");
});

test("NO_COVERAGE does not use the no-direct wording", () => {
  assert.equal(processReply([{ text: "NO_COVERAGE", citedIds: [] }], searched).noDirect, undefined);
});

test("NOT_IN_HEADLINES gives the fallback with its valid cited headlines, at most 5, in citation order", () => {
  const blocks = [
    { text: "NOT_IN_HEADLINES\n", citedIds: [] },
    ...[16, 12, 13, 14, 15, 11].map((id) => ({ text: `topic ${id}\n`, citedIds: [id] })),
  ];
  const r = processReply(blocks, searched);
  assert.equal(r.replyType, "fallback");
  assert.deepEqual(r.links, [16, 12, 13, 14, 15]);
  assert.equal(r.answerText, null);
});

test("a fallback whose citations are all invalid becomes the no-coverage reply", () => {
  const r = processReply([{ text: "NOT_IN_HEADLINES", citedIds: [] }, { text: "x", citedIds: [99999] }], searched);
  assert.equal(r.replyType, "no_coverage");
  assert.deepEqual(r.withdrawnCitations, [99999]);
});

test("an answer gets numbered markers, each cited headline once", () => {
  const r = processReply(
    [
      { text: "The Star reports growth of 5.3%", citedIds: [12] },
      { text: ". In a separate article, The Edge reports it beat expectations", citedIds: [13, 12] },
      { text: ".", citedIds: [] },
    ],
    searched,
  );
  assert.equal(r.replyType, "answer");
  assert.equal(r.answerText, "The Star reports growth of 5.3% [1]. In a separate article, The Edge reports it beat expectations [2][1].");
  assert.deepEqual(r.links, [12, 13]);
});

test("the citation check withdraws an answer citing an id the reader asked for", () => {
  const r = processReply([{ text: "AirAsia is getting RM5bil", citedIds: [12, 99999] }], searched);
  assert.equal(r.replyType, "fallback");
  assert.equal(r.answerWithdrawn, true);
  assert.deepEqual(r.withdrawnCitations, [99999]);
  assert.deepEqual(r.links, [12]);
});

test("a negative (injected test) id is valid only when search returned it", () => {
  assert.equal(processReply([{ text: "x", citedIds: [-9002] }], searched).answerWithdrawn, true);
  assert.equal(processReply([{ text: "x", citedIds: [-9001] }], searched).replyType, "answer");
});

test("an answer citing nothing is withdrawn", () => {
  const r = processReply([{ text: "Tony Fernandes founded AirAsia.", citedIds: [] }], searched);
  assert.equal(r.replyType, "no_coverage");
  assert.equal(r.answerWithdrawn, true);
});

test("an answer citing more than 5 headlines shows only 5 source cards", () => {
  const r = processReply([11, 12, 13, 14, 15, 16].map((id) => ({ text: `fact ${id}. `, citedIds: [id] })), searched);
  assert.deepEqual(r.links, [11, 12, 13, 14, 15]);
  assert.ok(!r.answerText!.includes("[6]"));
});

test("markers are held back until the start of the text rules them out", () => {
  assert.equal(markerCheck(""), "undecided");
  assert.equal(markerCheck("  NOT_IN"), "undecided");
  assert.equal(markerCheck("NO_"), "undecided");
  assert.equal(markerCheck("NO_COVERAGE"), "marker");
  assert.equal(markerCheck("NO_D"), "undecided");
  assert.equal(markerCheck("NO_DIRECT_HEADLINES"), "marker");
  assert.equal(markerCheck("NOT_IN_HEADLINES\nx"), "marker");
  assert.equal(markerCheck("No"), "not_marker");
  assert.equal(markerCheck("Malaysia"), "not_marker");
});

test("fallback wording is singular for one link and plural for more", () => {
  assert.equal(fallbackWording(1), "The headlines don't say, but this article might have an answer:");
  assert.equal(fallbackWording(3), "The headlines don't say, but these articles might have an answer:");
});

test("Show more reveals the next headlines in search order, at most 5, never shown or injected ones", () => {
  const ranked = [11, -9001, 12, 13, 14, 15, 16, 17, 18, 19];
  assert.deepEqual(moreHeadlines(ranked, [13, 11, 14]), [12, 15, 16, 17, 18]);
  assert.deepEqual(moreHeadlines([11, 12, 13], [11, 12]), [13]);
  assert.deepEqual(moreHeadlines([11], [11]), []);
  assert.equal(showMoreLabel(5), "Show 5 more headlines");
  assert.equal(showMoreLabel(3), "Show 3 more headlines");
  assert.equal(showMoreLabel(1), "Show 1 more headline");
  assert.equal(showMoreLabel(0), null);
});

test("questions are limited to 500 characters", () => {
  assert.equal(MAX_QUESTION_CHARS, 500);
  assert.equal(WORDING.tooLong, "Questions are limited to 500 characters.");
});

test("the spend cap pauses at US$5.00 or more", () => {
  assert.equal(isPaused(4.99), false);
  assert.equal(isPaused(5), true);
  assert.equal(isPaused(5.02), true);
});

test("the month starts at midnight on the 1st, Malaysia time", () => {
  // 30 Nov 16:30 UTC is already 1 Dec 00:30 in Malaysia.
  assert.equal(monthStartMalaysia(new Date("2026-11-30T16:30:00Z")).toISOString(), "2026-11-30T16:00:00.000Z");
  assert.equal(monthStartMalaysia(new Date("2026-11-30T15:59:00Z")).toISOString(), "2026-10-31T16:00:00.000Z");
  assert.equal(pausedWording(new Date("2026-11-26T03:00:00Z")), "Ask Watchtower has reached its monthly limit and will be back on 1 December.");
  assert.equal(pausedWording(new Date("2026-12-31T17:00:00Z")), "Ask Watchtower has reached its monthly limit and will be back on 1 February.");
});

test("estimated cost uses the price table", () => {
  const cost = estimateCostUsd("claude-haiku-5-5", { input: 2000, output: 300, cacheWrite: 0, cacheRead: 1000 });
  assert.equal(cost, 0.00036); // 2000 x 0.10 + 300 x 0.50 + 1000 x 0.01, per million
});

test("the kill switch is off unless ASK_ENABLED is exactly true", () => {
  const before = process.env.ASK_ENABLED;
  for (const [value, on] of [[undefined, false], ["", false], ["false", false], ["TRUE", false], ["true", true]] as const) {
    if (value === undefined) delete process.env.ASK_ENABLED;
    else process.env.ASK_ENABLED = value;
    assert.equal(askEnabled(), on, String(value));
  }
  if (before === undefined) delete process.env.ASK_ENABLED;
  else process.env.ASK_ENABLED = before;
});
