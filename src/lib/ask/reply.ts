// Ask Watchtower reply rules (SPEC-MVP3 MVP3.0-R9, R10, R11, R12, R21). Pure functions, unit tested.
import { FIRST_LINKS, MORE_LINKS } from "./config";
import { NOT_IN_HEADLINES, NO_COVERAGE } from "./instructions";

export { WORDING, fallbackWording, showMoreLabel } from "./wording";

export type Headline = {
  id: number;
  title: string;
  source: string;
  article_url: string;
  published_at: string;
};

export type ReplyType = "answer" | "fallback" | "no_coverage" | "error" | "paused";

// One text block of the AI's reply, with the article ids its citations point to, in order.
export type ReplyBlock = { text: string; citedIds: number[] };

export type ProcessedReply = {
  replyType: "answer" | "fallback" | "no_coverage";
  answerText: string | null; // answer only, with [n] markers
  links: number[]; // article ids shown as source cards, in order, at most 5
  citedIds: number[]; // every id the AI cited, in first-cited order
  withdrawnCitations: number[]; // cited ids search did not return
  answerWithdrawn: boolean;
};

// R9: answer text is streamed only once its start rules out a marker.
export function markerCheck(textSoFar: string): "marker" | "not_marker" | "undecided" {
  const start = textSoFar.trimStart();
  for (const marker of [NOT_IN_HEADLINES, NO_COVERAGE]) {
    if (start.startsWith(marker)) return "marker";
    if (marker.startsWith(start)) return "undecided"; // includes the empty string
  }
  return "not_marker";
}

function unique(ids: number[]): number[] {
  return [...new Set(ids)];
}

// Decides the reply type in code (R9) and runs the citation check (R10).
// searchedIds: the headlines search returned for this question (plus injected test headlines in eval mode).
export function processReply(blocks: ReplyBlock[], searchedIds: ReadonlySet<number>): ProcessedReply {
  const raw = blocks.map((b) => b.text).join("");
  const citedIds = unique(blocks.flatMap((b) => b.citedIds));
  const withdrawnCitations = citedIds.filter((id) => !searchedIds.has(id));
  const validCited = citedIds.filter((id) => searchedIds.has(id));
  const start = raw.trimStart();

  const fallbackOrNone = (answerWithdrawn: boolean): ProcessedReply => {
    const links = validCited.slice(0, FIRST_LINKS);
    return {
      replyType: links.length > 0 ? "fallback" : "no_coverage",
      answerText: null,
      links,
      citedIds,
      withdrawnCitations,
      answerWithdrawn,
    };
  };

  if (start.startsWith(NO_COVERAGE)) {
    return { replyType: "no_coverage", answerText: null, links: [], citedIds, withdrawnCitations, answerWithdrawn: false };
  }
  if (start.startsWith(NOT_IN_HEADLINES)) return fallbackOrNone(false);

  // An answer is withdrawn if any citation points outside the search results (R10),
  // or if it cites nothing at all, because every answer must show its sources (F4).
  if (withdrawnCitations.length > 0 || citedIds.length === 0) return fallbackOrNone(true);

  const links = citedIds.slice(0, FIRST_LINKS);
  const number = new Map(links.map((id, i) => [id, i + 1]));
  let answerText = "";
  for (const block of blocks) {
    answerText += block.text;
    const markers = unique(block.citedIds)
      .map((id) => number.get(id))
      .filter((n): n is number => n !== undefined);
    if (markers.length > 0) {
      const trailing = /\s$/.test(answerText) ? " " : "";
      answerText = `${answerText.trimEnd()} ${markers.map((n) => `[${n}]`).join("")}${trailing}`;
    }
  }
  return { replyType: "answer", answerText: answerText.trim(), links, citedIds, withdrawnCitations, answerWithdrawn: false };
}

// R21: the extra headlines behind "Show N more headlines": the next ones in search-rank order that are
// not already shown, at most 5, never an injected test headline (negative id).
export function moreHeadlines(searchRankedIds: number[], shown: number[]): number[] {
  const shownSet = new Set(shown);
  return searchRankedIds.filter((id) => id > 0 && !shownSet.has(id)).slice(0, MORE_LINKS);
}
