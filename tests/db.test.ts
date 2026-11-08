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
