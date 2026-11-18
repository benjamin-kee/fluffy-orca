import assert from "node:assert/strict";
import { test } from "node:test";
import { dbErrorText, retryRefusedRequests } from "@/lib/db";

// A fake fetch that answers with the given statuses in turn and counts calls.
function fakeFetch(statuses: number[]) {
  const calls: unknown[] = [];
  const impl = (async (input: unknown) => {
    calls.push(input);
    const status = statuses[Math.min(calls.length, statuses.length) - 1];
    const headers = status === 401 ? { "www-authenticate": 'Bearer error="invalid_token", error_description="JWT issued at future"' } : undefined;
    return new Response(status === 204 ? null : "{}", { status, headers });
  }) as typeof fetch;
  return { impl, calls };
}

const noWait = async () => {};
const quiet = <T>(fn: () => Promise<T>) => {
  const warn = console.warn;
  console.warn = () => {};
  return fn().finally(() => (console.warn = warn));
};

test("a request refused once with 401 is tried again and succeeds", async () => {
  const { impl, calls } = fakeFetch([401, 200]);
  const res = await quiet(() => retryRefusedRequests(impl, noWait)("https://db.example/rest/v1/articles"));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
});

test("a request is tried at most three times in all", async () => {
  const { impl, calls } = fakeFetch([401, 401, 401, 200]);
  const res = await quiet(() => retryRefusedRequests(impl, noWait)("https://db.example/rest/v1/articles"));
  assert.equal(res.status, 401);
  assert.equal(calls.length, 3);
});

test("successful and other failed requests are not repeated", async () => {
  for (const status of [200, 204, 400, 500]) {
    const { impl, calls } = fakeFetch([status]);
    const res = await retryRefusedRequests(impl, noWait)("https://db.example/rest/v1/articles");
    assert.equal(res.status, status);
    assert.equal(calls.length, 1, String(status));
  }
});

test("each retry waits one second", async () => {
  const waits: number[] = [];
  const { impl } = fakeFetch([401, 401, 200]);
  await quiet(() => retryRefusedRequests(impl, async (ms) => void waits.push(ms))("https://db.example/rest/v1/articles"));
  assert.deepEqual(waits, [1000, 1000]);
});

test("error text always says the HTTP status, even with no message", () => {
  assert.equal(dbErrorText({ message: "" }, 401), "no message (HTTP 401)");
  assert.equal(dbErrorText({ message: "JWT issued at future", code: "PGRST303" }, 401), "JWT issued at future (HTTP 401, PGRST303)");
});

// A promise that settles within `ms`, or rejects so a hang fails the test instead of stalling it.
const within = <T>(ms: number, p: Promise<T>) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`still waiting after ${ms} ms`)), ms))]);

test("a refused response whose body never finishes cancelling does not hold up the retry", async () => {
  // Like a response body Next.js has copied: cancelling it waits until the copy is read, which never happens.
  const stuckBody = () => new ReadableStream({ cancel: () => new Promise<void>(() => {}) });
  let calls = 0;
  const impl = (async () => {
    calls++;
    return calls === 1
      ? new Response(stuckBody(), { status: 401, headers: { "www-authenticate": "JWT issued at future" } })
      : new Response("[]", { status: 200 });
  }) as typeof fetch;
  const res = await quiet(() => within(1000, retryRefusedRequests(impl, noWait)("https://db.example/rest/v1/articles")));
  assert.equal(res.status, 200);
  assert.equal(calls, 2);
});

// A fake fetch that never answers, and gives up only when its signal is aborted.
const neverAnswers = (async (_input: unknown, init?: RequestInit) =>
  new Promise<Response>((_, reject) => {
    const signal = init?.signal;
    if (signal?.aborted) return reject(signal.reason);
    signal?.addEventListener("abort", () => reject(signal.reason));
  })) as typeof fetch;

test("a request that never answers fails after the time limit", async () => {
  await assert.rejects(within(1000, retryRefusedRequests(neverAnswers, noWait, 50)("https://db.example/rest/v1/articles")), {
    name: "TimeoutError",
  });
});

test("the caller's own cancel signal still stops a request", async () => {
  const controller = new AbortController();
  const pending = retryRefusedRequests(neverAnswers, noWait, 10_000)("https://db.example/rest/v1/articles", { signal: controller.signal });
  controller.abort(new Error("caller cancelled"));
  await assert.rejects(within(1000, pending), /caller cancelled/);
});
