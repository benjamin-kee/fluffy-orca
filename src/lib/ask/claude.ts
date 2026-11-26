// The AI call (SPEC-MVP3 MVP3.0-R7). Server-side only: the API key never reaches the browser (MVP3-S2).
import Anthropic from "@anthropic-ai/sdk";
import { ASK_EFFORT, ASK_MAX_TOKENS, ASK_MODEL, type TokenUsage } from "./config";
import { INSTRUCTIONS } from "./instructions";
import type { Headline, ReplyBlock } from "./reply";

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY must be set");
  client ??= new Anthropic();
  return client;
}

export type AiResult = {
  blocks: ReplyBlock[];
  rawText: string;
  usage: TokenUsage;
  refused: boolean;
};

// Each headline is one search result block with citations on (MVP3.0-R7). Its source is the article id,
// so every citation the AI makes can be traced back to exactly one stored headline.
// Dates are written in the same time zone as "today", so "yesterday" means the same day to the AI and the reader.
function searchResult(h: Headline, timeZone: string): Anthropic.SearchResultBlockParam {
  const time = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone });
  const date = time.format(new Date(h.published_at));
  return {
    type: "search_result",
    source: String(h.id),
    title: h.title,
    content: [{ type: "text", text: `${h.title}\nPublisher: ${h.source}\nPublished: ${date}` }],
    citations: { enabled: true },
  };
}

// Calls Claude, streaming. onText receives each piece of text as it is written.
export async function askClaude(
  question: string,
  headlines: Headline[],
  today: string,
  timeZone: string,
  onText: (delta: string) => void,
  model = ASK_MODEL,
): Promise<AiResult> {
  const stream = getClient().messages.stream({
    model,
    max_tokens: ASK_MAX_TOKENS,
    output_config: { effort: ASK_EFFORT },
    // The fixed instructions are cached (D-048). Today's date and the question come after them.
    system: [{ type: "text", text: INSTRUCTIONS, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          ...headlines.map((h) => searchResult(h, timeZone)),
          { type: "text", text: `Today is ${today}.\n\n<question>\n${question}\n</question>` },
        ],
      },
    ],
  });
  stream.on("text", onText);
  const message = await stream.finalMessage();

  const blocks: ReplyBlock[] = [];
  for (const block of message.content) {
    if (block.type !== "text") continue;
    const citedIds = (block.citations ?? [])
      .filter((c) => c.type === "search_result_location")
      .map((c) => Number(c.source));
    blocks.push({ text: block.text, citedIds });
  }
  const u = message.usage;
  return {
    blocks,
    rawText: blocks.map((b) => b.text).join(""),
    usage: {
      input: u.input_tokens,
      output: u.output_tokens,
      cacheWrite: u.cache_creation_input_tokens ?? 0,
      cacheRead: u.cache_read_input_tokens ?? 0,
    },
    refused: message.stop_reason === "refusal",
  };
}
