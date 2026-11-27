// Database access for Ask Watchtower (SPEC-MVP3 section 5, A1 to A3). Server-side only.
import { dbErrorText, getDb } from "@/lib/db";
import type { Headline, ReplyType } from "./reply";

// A1: up to 20 headlines matching any of the question's words, best first.
export async function searchHeadlines(question: string, onlyIds: number[] | null = null): Promise<Headline[]> {
  const { data, error, status } = await getDb().rpc("ask_search_headlines", { question, only_ids: onlyIds });
  if (error) throw new Error(`Failed to search headlines: ${dbErrorText(error, status)}`);
  return (data as (Headline & { rank: number })[]).map(({ id, title, source, article_url, published_at }) => ({
    id: Number(id),
    title,
    source,
    article_url,
    published_at,
  }));
}

// R16: sum of this month's estimated costs.
export async function spendSince(start: Date): Promise<number> {
  const { data, error, status } = await getDb()
    .from("ask_traces")
    .select("estimated_cost_usd")
    .gte("created_at", start.toISOString());
  if (error) throw new Error(`Failed to read spend: ${dbErrorText(error, status)}`);
  return (data as { estimated_cost_usd: string | number }[]).reduce((sum, r) => sum + Number(r.estimated_cost_usd), 0);
}

export type Trace = {
  id: string;
  session_id: string;
  question: string;
  headlines: { id: number; rank: number }[];
  model: string;
  instructions_version: string;
  raw_text: string | null;
  cited_ids: number[];
  withdrawn_citations: number[];
  answer_withdrawn: boolean;
  reply_type: ReplyType;
  links_shown: number[];
  input_tokens: number;
  output_tokens: number;
  cache_write_tokens: number;
  cache_read_tokens: number;
  estimated_cost_usd: number;
  search_ms: number | null;
  first_word_ms: number | null;
  total_ms: number | null;
  error: string | null;
};

// A2: one trace per question (R14).
export async function saveTrace(trace: Trace): Promise<void> {
  const { error, status } = await getDb().from("ask_traces").insert(trace);
  if (error) throw new Error(`Failed to save trace: ${dbErrorText(error, status)}`);
}

// A3: one rating per reply; a changed rating updates the same row (R13).
export async function saveRating(traceId: string, rating: "up" | "down"): Promise<void> {
  const { error, status } = await getDb()
    .from("ask_feedback")
    .upsert({ trace_id: traceId, rating, rated_at: new Date().toISOString() }, { onConflict: "trace_id" });
  if (error) throw new Error(`Failed to save rating: ${dbErrorText(error, status)}`);
}

export async function saveComment(traceId: string, comment: string): Promise<void> {
  const { data, error, status } = await getDb()
    .from("ask_feedback")
    .update({ comment, rated_at: new Date().toISOString() })
    .eq("trace_id", traceId)
    .select("id");
  if (error) throw new Error(`Failed to save comment: ${dbErrorText(error, status)}`);
  if (data.length === 0) throw new Error("No rating to attach the comment to");
}

// R22: "Show 5 more" opened, and source links clicked.
export async function recordShowMore(traceId: string): Promise<void> {
  const { error, status } = await getDb().from("ask_traces").update({ show_more_opened: true }).eq("id", traceId);
  if (error) throw new Error(`Failed to record show more: ${dbErrorText(error, status)}`);
}

export async function recordClick(traceId: string, position: number, articleId: number): Promise<void> {
  const db = getDb();
  const { data, error, status } = await db.from("ask_traces").select("links_clicked").eq("id", traceId).maybeSingle();
  if (error) throw new Error(`Failed to read clicks: ${dbErrorText(error, status)}`);
  if (!data) return;
  const clicks = [...(data.links_clicked as unknown[]), { position, id: articleId }];
  const update = await db.from("ask_traces").update({ links_clicked: clicks }).eq("id", traceId);
  if (update.error) throw new Error(`Failed to record click: ${dbErrorText(update.error, update.status)}`);
}
