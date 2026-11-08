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

// Supabase now and then refuses a request with 401 "JWT issued at future": the token it issues
// for the key is stamped a moment ahead of the database server's clock. It passes a second later,
// so a refused request is tried again after a short wait, up to twice, and each retry is logged.
// Every request Watchtower makes is safe to repeat: reads, and inserts that skip duplicates.
// A wrong key still fails, just about two seconds later.
export function retryRefusedRequests(
  fetchImpl: typeof fetch,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): typeof fetch {
  return async (input, init) => {
    let res = await fetchImpl(input, init);
    for (const delay of RETRY_DELAYS_MS) {
      if (res.status !== 401) break;
      const reason = res.headers.get("www-authenticate") ?? "no detail";
      console.warn(`[db] Supabase refused a request (401, ${reason}); retrying in ${delay} ms`);
      await res.body?.cancel();
      await wait(delay);
      res = await fetchImpl(input, init);
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
