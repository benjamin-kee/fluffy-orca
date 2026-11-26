// Fixed wording (SPEC-MVP3 MVP3-S6), never written by the AI. This file is safe for the browser: it
// imports nothing, so the page never bundles the AI's instructions.

export const WORDING = {
  intro: "Ask about business news in Watchtower's headlines. Answers come only from the headlines, with links to the articles.",
  followUpNotice: "Watchtower can't answer follow-up questions yet. Ask each question in full, including the company or topic.",
  followUpPlaceholder: "Follow-up questions aren't supported yet",
  noCoverage: "No Watchtower headlines cover this yet. Try asking about a company, market or event in the news.",
  aiNote: "This answer is an AI summary and may contain mistakes. Check the articles before relying on it.",
  error: "Ask Watchtower can't answer right now. Please try again later.",
  switchedOff: "Ask Watchtower is switched off for now.",
  tooLong: "Questions are limited to 500 characters.",
  moreLabel: "More headlines on this topic (not used in this answer)",
  thanksRating: "Thanks for the feedback.",
  thanksComment: "Thanks, we have your comment.",
  commentLabel: "Tell us more (optional)",
  commentReminder: "Please don't include personal details.",
};

// R2, D-070: plain text, no logo, no wording that suggests a partnership or endorsement.
export function poweredBy(modelName: string): string {
  return `Answers are written by ${modelName}, an AI model from Anthropic.`;
}

export function fallbackWording(linkCount: number): string {
  return linkCount === 1 ? "The headlines don't say, check this article:" : "The headlines don't say, check these articles:";
}

export function showMoreLabel(count: number): string | null {
  return count > 0 ? `Show ${count} more headline${count === 1 ? "" : "s"}` : null;
}
