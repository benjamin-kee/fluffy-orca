import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// Server-side only: uses the service-role key, which must never reach the browser.
export function getDb(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    client = createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: retryRefusedRequests(fetch) },
    });
  }
  return client;
}

const RETRY_DELAYS_MS = [1000, 1000];
const REQUEST_TIMEOUT_MS = 10_000;

// Supabase now and then refuses a request with 401 "JWT issued at future": the token it issues
// for the key is stamped a moment ahead of the database server's clock. It passes a second later,
// so a refused request is tried again after a short wait, up to twice, and each retry is logged.
// Every request Watchtower makes is safe to repeat: reads, and inserts that skip duplicates.
// A wrong key still fails, just about two seconds later.
//
// Each attempt also gets a time limit (10 seconds), so a request that never answers fails with
// "Headlines could not be loaded" instead of holding the page until Vercel stops it at 5 minutes.
export function retryRefusedRequests(
  fetchImpl: typeof fetch,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): typeof fetch {
  const attempt = (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const limit = AbortSignal.timeout(timeoutMs);
    return fetchImpl(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, limit]) : limit });
  };
  return async (input, init) => {
    let res = await attempt(input, init);
    for (const delay of RETRY_DELAYS_MS) {
      if (res.status !== 401) break;
      const reason = res.headers.get("www-authenticate") ?? "no detail";
      console.warn(`[db] Supabase refused a request (401, ${reason}); retrying in ${delay} ms`);
      // Free the refused response without waiting. Next.js keeps a copy of fetch responses, and a
      // copied body only finishes cancelling once every copy is read, so awaiting this hung the
      // page until Vercel's 5-minute limit (504 FUNCTION_INVOCATION_TIMEOUT).
      res.body?.cancel().catch(() => {});
      await wait(delay);
      res = await attempt(input, init);
    }
    return res;
  };
}

// Error text for a failed database call. Count requests carry no response body, so the message can
// be empty; the HTTP status is always added so the log says what happened.
export function dbErrorText(error: { message?: string; code?: string }, status: number): string {
  const detail = [`HTTP ${status}`, error.code].filter(Boolean).join(", ");
  return `${error.message || "no message"} (${detail})`;
}
