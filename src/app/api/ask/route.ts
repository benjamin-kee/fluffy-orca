// Ask Watchtower's one server route (SPEC-MVP3 MVP3-S5): every AI call and every database write for
// the feature happens here. POST a JSON body with an "action":
//   ask        { question, sessionId }                 -> a stream of JSON lines (see AskEvent)
//   rating     { traceId, rating: "up" | "down" }       -> 204
//   comment    { traceId, comment }                     -> 204
//   show_more  { traceId }                              -> 204
//   click      { traceId, position, articleId }         -> 204
// Eval mode (MVP3-S9): with "Authorization: Bearer <CRON_SECRET>", an ask may add
//   eval: { onlyIds, now, timeZone, injected }
// which limits search to fixed ids, fixes "today", and adds test headlines in memory. Eval runs save no
// trace and skip the spend check: they use the separate tests key (R16), never the readers' budget.
import { randomUUID } from "node:crypto";
import { askClaude } from "@/lib/ask/claude";
import { ASK_MODEL, INSTRUCTIONS_VERSION, PRICES, MAX_COMMENT_CHARS, MAX_QUESTION_CHARS, askEnabled, estimateCostUsd, type TokenUsage } from "@/lib/ask/config";
import { WORDING, fallbackWording, markerCheck, moreHeadlines, processReply, type Headline, type ReplyType } from "@/lib/ask/reply";
import { recordClick, recordShowMore, saveComment, saveRating, saveTrace, searchHeadlines, spendSince, type Trace } from "@/lib/ask/repository";
import { isPaused, monthStartMalaysia, pausedWording, todayForAi } from "@/lib/ask/spendCap";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export type AskEvent =
  | { type: "start"; traceId: string | null }
  | { type: "delta"; text: string }
  | {
      type: "done";
      traceId: string | null;
      replyType: ReplyType;
      text: string; // the answer, or the fixed wording
      links: Headline[];
      more: Headline[];
      eval?: { rawText: string | null; citedIds: number[]; withdrawnCitations: number[]; searchIds: number[]; usage: TokenUsage; costUsd: number; firstWordMs: number | null; totalMs: number };
    };

type EvalOptions = { onlyIds?: number[]; now?: string; timeZone?: string; injected?: Headline[]; model?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ZERO: TokenUsage = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 };

function isEvalRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.action === "ask") return ask(request, body);

  const traceId = typeof body.traceId === "string" && UUID.test(body.traceId) ? body.traceId : null;
  if (!traceId) return Response.json({ error: "Invalid request" }, { status: 400 });
  try {
    if (body.action === "rating" && (body.rating === "up" || body.rating === "down")) {
      await saveRating(traceId, body.rating);
    } else if (body.action === "comment" && typeof body.comment === "string" && body.comment.trim()) {
      if (body.comment.length > MAX_COMMENT_CHARS) return Response.json({ error: "Comment too long" }, { status: 400 });
      await saveComment(traceId, body.comment.trim());
    } else if (body.action === "show_more") {
      await recordShowMore(traceId);
    } else if (body.action === "click" && Number.isInteger(body.position) && Number.isInteger(body.articleId)) {
      await recordClick(traceId, body.position as number, body.articleId as number);
    } else {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
  } catch (err) {
    console.error(`[ask] ${String(body.action)} failed: ${err instanceof Error ? err.message : String(err)}`);
    return Response.json({ error: "Could not save" }, { status: 500 });
  }
  return new Response(null, { status: 204 });
}

function ask(request: Request, body: Record<string, unknown>): Response {
  if (!askEnabled()) return Response.json({ error: WORDING.switchedOff }, { status: 503 }); // R17
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return Response.json({ error: "Empty question" }, { status: 400 });
  if (question.length > MAX_QUESTION_CHARS) return Response.json({ error: WORDING.tooLong }, { status: 400 }); // R3

  const evalMode = isEvalRequest(request) && typeof body.eval === "object" && body.eval !== null;
  const opts: EvalOptions = evalMode ? (body.eval as EvalOptions) : {};
  // The Haiku assessment's reference run uses another model; only models in the price table are allowed.
  const model = opts.model && opts.model in PRICES ? opts.model : ASK_MODEL;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "unknown";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AskEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      const started = Date.now();
      const now = opts.now ? new Date(opts.now) : new Date();
      const timeZone = opts.timeZone ?? "Asia/Kuala_Lumpur";
      const traceId = evalMode ? null : randomUUID();
      send({ type: "start", traceId });

      const trace: Trace = {
        id: traceId ?? "",
        session_id: sessionId,
        question,
        headlines: [],
        model,
        instructions_version: INSTRUCTIONS_VERSION,
        raw_text: null,
        cited_ids: [],
        withdrawn_citations: [],
        answer_withdrawn: false,
        reply_type: "error",
        links_shown: [],
        input_tokens: 0,
        output_tokens: 0,
        cache_write_tokens: 0,
        cache_read_tokens: 0,
        estimated_cost_usd: 0,
        search_ms: null,
        first_word_ms: null,
        total_ms: null,
        error: null,
      };
      let usage = ZERO;
      let searchIds: number[] = [];
      let done: Extract<AskEvent, { type: "done" }> = { type: "done", traceId, replyType: "error", text: WORDING.error, links: [], more: [] };

      try {
        // R16: pause once this month's estimated spend reaches the limit.
        if (!evalMode && isPaused(await spendSince(monthStartMalaysia(now)))) {
          done = { ...done, replyType: "paused", text: pausedWording(now) };
        } else {
          const searchStart = Date.now();
          const found = await searchHeadlines(question, opts.onlyIds ?? null);
          const headlines = [...found, ...(evalMode ? (opts.injected ?? []) : [])];
          trace.search_ms = Date.now() - searchStart;
          trace.headlines = headlines.map((h, i) => ({ id: h.id, rank: i + 1 }));
          searchIds = headlines.map((h) => h.id);
          const byId = new Map(headlines.map((h) => [h.id, h]));

          if (headlines.length === 0) {
            // R6: no searchable words, or nothing matches: no AI call.
            done = { ...done, replyType: "no_coverage", text: WORDING.noCoverage };
          } else {
            // R9: hold text back until its start rules out a marker, then stream it.
            let buffered = "";
            let streaming = false;
            const onText = (delta: string) => {
              if (streaming) return send({ type: "delta", text: delta });
              buffered += delta;
              if (markerCheck(buffered) === "not_marker") {
                streaming = true;
                trace.first_word_ms = Date.now() - started;
                send({ type: "delta", text: buffered });
              }
            };
            const ai = await askClaude(question, headlines, todayForAi(now, timeZone), timeZone, onText, model);
            usage = ai.usage;
            trace.raw_text = ai.rawText;
            if (ai.refused) {
              trace.error = "The AI declined to answer (refusal)"; // S10: shown as the error wording
            } else {
              const reply = processReply(ai.blocks, new Set(searchIds));
              trace.cited_ids = reply.citedIds;
              trace.withdrawn_citations = reply.withdrawnCitations;
              trace.answer_withdrawn = reply.answerWithdrawn;
              const links = reply.links.map((id) => byId.get(id)!);
              const more = moreHeadlines(searchIds, reply.links).map((id) => byId.get(id)!);
              const text =
                reply.replyType === "answer" ? reply.answerText! : reply.replyType === "fallback" ? fallbackWording(links.length) : WORDING.noCoverage;
              done = { ...done, replyType: reply.replyType, text, links, more: reply.replyType === "no_coverage" ? [] : more };
            }
          }
        }
      } catch (err) {
        trace.error = err instanceof Error ? err.message : String(err);
        console.error(`[ask] failed: ${trace.error}`);
        done = { ...done, replyType: "error", text: WORDING.error, links: [], more: [] };
      }

      trace.reply_type = done.replyType;
      trace.links_shown = done.links.map((h) => h.id);
      trace.input_tokens = usage.input;
      trace.output_tokens = usage.output;
      trace.cache_write_tokens = usage.cacheWrite;
      trace.cache_read_tokens = usage.cacheRead;
      trace.estimated_cost_usd = estimateCostUsd(model, usage);
      trace.total_ms = Date.now() - started;
      trace.first_word_ms ??= trace.total_ms;

      if (evalMode) {
        done.eval = {
          rawText: trace.raw_text,
          citedIds: trace.cited_ids,
          withdrawnCitations: trace.withdrawn_citations,
          searchIds,
          usage,
          costUsd: trace.estimated_cost_usd,
          firstWordMs: trace.first_word_ms,
          totalMs: trace.total_ms,
        };
      }
      // Saved before the final event, so the trace exists by the time the reader can rate the reply,
      // and so the work finishes before the response ends (the server may stop right after).
      if (!evalMode) {
        try {
          await saveTrace(trace);
        } catch (err) {
          console.error(`[ask] ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      send(done);
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
