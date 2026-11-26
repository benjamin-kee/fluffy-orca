"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { AskEvent } from "@/app/api/ask/route";
import type { Headline, ReplyType } from "@/lib/ask/reply";
import { WORDING, showMoreLabel } from "@/lib/ask/wording";
import { PublishedTime } from "@/components/PublishedTime";

const MAX_QUESTION_CHARS = 500;
const MAX_COMMENT_CHARS = 1000;
const BANNER_MS = 3000;

type Turn = {
  key: number;
  question: string;
  writing: boolean;
  text: string;
  replyType: ReplyType | null;
  traceId: string | null;
  links: Headline[];
  more: Headline[];
  moreShown: boolean;
  rating: "up" | "down" | null;
  commentState: "closed" | "open" | "sent";
};

// A random id per browser tab, linking one visit's questions without identifying anyone (R14).
function tabSessionId(): string {
  try {
    const existing = sessionStorage.getItem("ask-session");
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem("ask-session", id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function post(body: Record<string, unknown>) {
  return fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

// R2 to R5, R11 to R13, R21, R22. The visit's questions and replies live only in this component's
// state, so reloading or leaving the page clears them (R5, D-055).
export function AskClient() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState<string | null>(null);
  const [switchedOff, setSwitchedOff] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const sessionId = useRef<string | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextKey = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(bannerTimer.current), []);
  useEffect(() => {
    // A block body: newer browsers return a Promise from scrollIntoView, which React would treat as a cleanup.
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns.length]);

  const update = (key: number, change: Partial<Turn> | ((t: Turn) => Partial<Turn>)) =>
    setTurns((all) => all.map((t) => (t.key === key ? { ...t, ...(typeof change === "function" ? change(t) : change) } : t)));

  const showBanner = (text: string) => {
    clearTimeout(bannerTimer.current);
    setBanner(text);
    bannerTimer.current = setTimeout(() => setBanner(null), BANNER_MS);
  };

  async function ask(event?: FormEvent) {
    event?.preventDefault();
    const q = question.trim();
    if (!q || busy) return; // R3: an empty question does nothing
    sessionId.current ??= tabSessionId();
    const key = nextKey.current++;
    setTurns((all) => [
      ...all,
      { key, question: q, writing: true, text: "", replyType: null, traceId: null, links: [], more: [], moreShown: false, rating: null, commentState: "closed" },
    ]);
    setQuestion("");
    setBusy(true);
    try {
      const res = await post({ action: "ask", question: q, sessionId: sessionId.current });
      if (res.status === 503) {
        setSwitchedOff(true);
        setTurns((all) => all.filter((t) => t.key !== key));
        return;
      }
      if (!res.ok || !res.body) {
        const tooLong = res.status === 400 && q.length > MAX_QUESTION_CHARS;
        update(key, { writing: false, replyType: "error", text: tooLong ? WORDING.tooLong : WORDING.error });
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let pending = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        pending += value;
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as AskEvent;
          if (ev.type === "start") update(key, { traceId: ev.traceId });
          else if (ev.type === "delta") update(key, (t) => ({ text: t.text + ev.text }));
          else {
            update(key, { writing: false, replyType: ev.replyType, text: ev.text, links: ev.links, more: ev.more });
            if (ev.replyType === "paused") setPaused(ev.text);
          }
        }
      }
      update(key, (t) => (t.writing ? { writing: false, replyType: "error", text: WORDING.error } : {}));
    } catch {
      update(key, { writing: false, replyType: "error", text: WORDING.error });
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // R3: Enter sends; Shift+Enter starts a new line.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void ask();
    }
  }

  function rate(turn: Turn, rating: "up" | "down") {
    if (!turn.traceId || turn.rating === rating) return;
    update(turn.key, (t) => ({ rating, commentState: t.commentState === "sent" ? "sent" : "open" }));
    showBanner(WORDING.thanksRating);
    void post({ action: "rating", traceId: turn.traceId, rating });
  }

  async function sendComment(turn: Turn, comment: string) {
    if (!turn.traceId || !comment.trim()) return;
    const res = await post({ action: "comment", traceId: turn.traceId, comment: comment.trim() }).catch(() => null);
    if (res?.ok) {
      update(turn.key, { commentState: "sent" });
      showBanner(WORDING.thanksComment);
    } else {
      showBanner(WORDING.error);
    }
  }

  function openMore(turn: Turn) {
    update(turn.key, { moreShown: true });
    if (turn.traceId) void post({ action: "show_more", traceId: turn.traceId });
  }

  function clicked(turn: Turn, position: number, articleId: number) {
    if (turn.traceId) void post({ action: "click", traceId: turn.traceId, position, articleId });
  }

  const asked = turns.length > 0;

  if (switchedOff) {
    return (
      <p className="ask-notice ask-notice-off" role="status">
        {WORDING.switchedOff} <a href="/">Browse all headlines</a>
      </p>
    );
  }

  return (
    <div className="ask-body">
      <p className="ask-intro">{WORDING.intro}</p>

      <section aria-label="Your questions and Watchtower's replies" aria-live="polite" className="ask-turns">
        {turns.map((turn) => (
          <article key={turn.key} className="ask-turn">
            <p className="ask-question">{turn.question}</p>
            <Reply turn={turn} onMore={() => openMore(turn)} onClick={(p, id) => clicked(turn, p, id)} />
            {!turn.writing && turn.traceId && turn.replyType !== "paused" && (
              <Feedback turn={turn} onRate={(r) => rate(turn, r)} onSend={(c) => sendComment(turn, c)} />
            )}
          </article>
        ))}
        <div ref={endRef} />
      </section>

      {paused ? (
        <p className="ask-notice ask-notice-paused" role="status">
          {paused}
        </p>
      ) : (
        <form className="ask-form" onSubmit={ask}>
          <label htmlFor="ask-question">{asked ? "Ask a new question" : "Your question"}</label>
          <div className="ask-row">
            <textarea
              id="ask-question"
              rows={2}
              maxLength={MAX_QUESTION_CHARS}
              value={question}
              placeholder={asked ? WORDING.followUpPlaceholder : "How much did AirAsia lose in the third quarter?"}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" disabled={busy}>
              Ask
            </button>
          </div>
          {!asked && <p className="ask-hint">{WORDING.followUpNotice}</p>}
          <AiNote />
        </form>
      )}

      {banner && (
        <div className="ask-banner" role="status">
          {banner}
        </div>
      )}
    </div>
  );
}

function AiNote() {
  return (
    <p className="ask-ai-note">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 7.5h.01" />
      </svg>
      {WORDING.aiNote}
    </p>
  );
}

// Turns "[1]" markers in the answer into links to the numbered source cards (R11).
function AnswerText({ text, turnKey }: { text: string; turnKey: number }) {
  const parts = text.split(/(\[\d+\])/);
  return (
    <p className="ask-answer">
      {parts.map((part, i) => {
        const m = /^\[(\d+)\]$/.exec(part);
        return m ? (
          <a key={i} href={`#src-${turnKey}-${m[1]}`} className="ask-marker" aria-label={`Source ${m[1]}`}>
            [{m[1]}]
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        );
      })}
    </p>
  );
}

function SourceCard({ h, n, turnKey, onClick }: { h: Headline; n: number | null; turnKey: number; onClick: () => void }) {
  return (
    <li className="ask-source" id={n ? `src-${turnKey}-${n}` : undefined}>
      {n && <span className="ask-source-n">{n}</span>}
      <div>
        <a href={h.article_url} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {h.title}
        </a>
        <div className="meta">
          {h.source} · <PublishedTime iso={h.published_at} />
        </div>
      </div>
    </li>
  );
}

function Reply({ turn, onMore, onClick }: { turn: Turn; onMore: () => void; onClick: (position: number, id: number) => void }) {
  if (turn.writing) {
    return <p className="ask-answer ask-writing">{turn.text || "Writing an answer…"}</p>;
  }
  if (turn.replyType === "error" || turn.replyType === "paused") {
    return (
      <p className={`ask-notice ${turn.replyType === "error" ? "ask-notice-error" : "ask-notice-paused"}`} role="alert">
        {turn.text}
      </p>
    );
  }
  const isAnswer = turn.replyType === "answer";
  const moreLabel = !turn.moreShown ? showMoreLabel(turn.more.length) : null;
  return (
    <div className="ask-reply">
      {isAnswer ? <AnswerText text={turn.text} turnKey={turn.key} /> : <p className="ask-answer ask-fixed">{turn.text}</p>}
      {turn.links.length > 0 && (
        <ol className="ask-sources">
          {turn.links.map((h, i) => (
            <SourceCard key={h.id} h={h} n={isAnswer ? i + 1 : null} turnKey={turn.key} onClick={() => onClick(i + 1, h.id)} />
          ))}
        </ol>
      )}
      {turn.moreShown && turn.more.length > 0 && (
        <>
          <h3 className="ask-more-label">{WORDING.moreLabel}</h3>
          <ol className="ask-sources">
            {turn.more.map((h, i) => (
              <SourceCard key={h.id} h={h} n={null} turnKey={turn.key} onClick={() => onClick(turn.links.length + i + 1, h.id)} />
            ))}
          </ol>
        </>
      )}
      {moreLabel && (
        <button type="button" className="ask-more" onClick={onMore}>
          {moreLabel}
        </button>
      )}
      {turn.replyType !== "no_coverage" && <AiNote />}
    </div>
  );
}

function Feedback({ turn, onRate, onSend }: { turn: Turn; onRate: (r: "up" | "down") => void; onSend: (comment: string) => void }) {
  const [comment, setComment] = useState("");
  return (
    <div className="ask-feedback">
      <div className="ask-thumbs">
        <span>Was this helpful?</span>
        <button type="button" aria-label="Helpful" aria-pressed={turn.rating === "up"} onClick={() => onRate("up")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 10v11H4V10h3z" />
            <path d="M7 10l4-7c1.7 0 2.5 1 2.2 2.6L12.5 9H19a2 2 0 0 1 2 2.3l-1.2 7.4A2.5 2.5 0 0 1 17.3 21H7" />
          </svg>
        </button>
        <button type="button" aria-label="Not helpful" aria-pressed={turn.rating === "down"} onClick={() => onRate("down")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 14V3h3v11h-3z" />
            <path d="M17 14l-4 7c-1.7 0-2.5-1-2.2-2.6l.7-3.4H5a2 2 0 0 1-2-2.3l1.2-7.4A2.5 2.5 0 0 1 6.7 3H17" />
          </svg>
        </button>
      </div>
      {turn.commentState === "open" && (
        <form
          className="ask-comment"
          onSubmit={(e) => {
            e.preventDefault();
            onSend(comment);
          }}
        >
          <label htmlFor={`comment-${turn.key}`}>{WORDING.commentLabel}</label>
          <textarea id={`comment-${turn.key}`} rows={2} maxLength={MAX_COMMENT_CHARS} value={comment} onChange={(e) => setComment(e.target.value)} />
          <p className="ask-hint">{WORDING.commentReminder}</p>
          <button type="submit" disabled={!comment.trim()}>
            Send feedback
          </button>
        </form>
      )}
    </div>
  );
}
