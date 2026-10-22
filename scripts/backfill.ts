// Backfills GNews headlines from the last 30 days (the free plan's history limit), oldest day first,
// so days about to expire are fetched before newer ones.
//
// Usage: npm run backfill -- [max_requests]   (default 90, leaving 10 of the 100 daily requests,
// about 100 headlines, for regular ingestion). Days already fully stored cost one request to check.
import { countArticlesPublishedBetween, insertNewArticles } from "@/lib/articleRepository";
import { fetchGNewsHeadlines, GNewsRequestError } from "@/lib/sources/gnews";

const DAY = 86_400_000;
const HISTORY_MS = 30 * DAY - 60 * 60_000; // one hour inside the 30-day limit
const PAUSE_MS = 1_500; // GNews rejects requests sent in quick succession (HTTP 429)
const PAGE_SIZE = 10;
// GNews sometimes lists one article twice, so a fully fetched day can store slightly fewer than it reports.
const MISSING_TOLERANCE = 2;

const maxRequests = Number(process.argv[2] ?? 90);
if (!Number.isInteger(maxRequests) || maxRequests < 1) throw new Error("max_requests must be a positive integer");

let used = 0;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class BudgetSpent extends Error {}

async function fetchPage(from: string, to: string, page: number) {
  for (let attempt = 1; ; attempt++) {
    if (used >= maxRequests) throw new BudgetSpent();
    await sleep(PAUSE_MS * attempt);
    used++;
    try {
      return await fetchGNewsHeadlines({ from, to, page });
    } catch (err) {
      if (err instanceof GNewsRequestError && err.status === 429 && attempt < 3) continue;
      throw err;
    }
  }
}

// Fetches every page for [from, to) unless the database already holds (almost) as many articles as GNews reports.
async function backfillWindow(from: string, to: string) {
  const first = await fetchPage(from, to, 1);
  let inserted = await insertNewArticles(first.articles);
  const stored = await countArticlesPublishedBetween(from, to);
  const pages = Math.ceil(first.total / PAGE_SIZE);

  if (stored < first.total - MISSING_TOLERANCE) {
    for (let page = 2; page <= pages; page++) {
      const { articles } = await fetchPage(from, to, page);
      inserted += await insertNewArticles(articles);
    }
  }
  console.log(`[backfill] ${from.slice(0, 10)} available=${first.total} inserted=${inserted} requests_used=${used}`);
}

async function main() {
  const now = Date.now();
  const oldest = now - HISTORY_MS;
  let start = oldest;
  let complete = true;

  try {
    while (start < now) {
      const nextUtcMidnight = Math.floor(start / DAY) * DAY + DAY;
      const end = Math.min(nextUtcMidnight, now);
      await backfillWindow(new Date(start).toISOString(), new Date(end).toISOString());
      start = end;
    }
  } catch (err) {
    if (!(err instanceof BudgetSpent)) throw err;
    complete = false;
    console.log(`[backfill] stopped: request budget of ${maxRequests} reached before ${new Date(start).toISOString().slice(0, 10)}`);
  }
  console.log(`[backfill] done complete=${complete} requests_used=${used}`);
}

main().catch((err) => {
  console.error(`[backfill] failed after ${used} requests: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
