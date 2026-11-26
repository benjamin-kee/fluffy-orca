// Ask Watchtower configuration (SPEC-MVP3 MVP3-S4): the model, the instructions version and the
// price table live here, so changing model (backlog B-009) is a change to this file only.

export const ASK_MODEL = "claude-haiku-5-5";
// Shown to readers under the intro line (R2, D-070). Change together with ASK_MODEL.
export const ASK_MODEL_NAME = "Claude Haiku 5.5";
export const ASK_EFFORT = "low" as const; // MVP3.0-R7: start at low, confirmed on the eval run
export const ASK_MAX_TOKENS = 4000;
export const INSTRUCTIONS_VERSION = "mvp3.0-v1";

export const MAX_QUESTION_CHARS = 500; // R3
export const MAX_COMMENT_CHARS = 1000; // R13
export const SEARCH_LIMIT = 20; // R6, D-069
export const FIRST_LINKS = 5; // R11, R12
export const MORE_LINKS = 5; // R21
export const MONTHLY_PAUSE_USD = 5; // R16, D-053

// US dollars per million tokens. Cache writes cost 1.25x input; cache reads 0.1x input.
// Haiku 5.5 prices apply to prompts up to 100K tokens, which Ask Watchtower never exceeds.
type Prices = { input: number; output: number; cacheWrite: number; cacheRead: number };
export const PRICES: Record<string, Prices> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.1 },
};

export type TokenUsage = { input: number; output: number; cacheWrite: number; cacheRead: number };

export function estimateCostUsd(model: string, usage: TokenUsage): number {
  const p = PRICES[model];
  if (!p) throw new Error(`No price for model ${model}`);
  const cost =
    (usage.input * p.input + usage.output * p.output + usage.cacheWrite * p.cacheWrite + usage.cacheRead * p.cacheRead) /
    1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export function askEnabled(): boolean {
  return process.env.ASK_ENABLED === "true"; // R17
}
