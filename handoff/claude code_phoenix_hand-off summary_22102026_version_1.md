# Phoenix MVP0 — Hand-off Summary

_As of 22 Oct 2026. Use this to continue the work in a new chat._

_Covers the original session (session_01CvoFQYaxJMtVgAddYSfv2H) and, from the branch history and live database, the work a second session (session_01KtXKscty5bAZEPF3S6TpJe) has since pushed._

## 1. What Phoenix is

A lightweight business-news dashboard. MVP0 shows Malaysian business headlines in one feed, newest first. Each headline opens the publisher's original article in a new tab. Phoenix stores only headline metadata, never article text, summaries or images.

## 2. Where everything lives

| Thing | Location |
| --- | --- |
| Code repository | GitHub `benjamin-kee/fluffy-orca` |
| Working branch | `claude/inspiring-galileo-33vjef` (latest code commit `d01b814`, plus this hand-off file) |
| Pull request | https://github.com/benjamin-kee/fluffy-orca/pull/1, open into `main`, no conflicts, no automated checks set up. **Don't merge until MVP0 is finished.** |
| Rules for Claude | `CLAUDE.md` (repository root) |
| Approved spec | `docs/specs/MVP0.md`. The original spec plus an **"Approved changes"** section; the approved changes win where they conflict. |
| Backlog / future fixes | `docs/roadmap.md` |
| Database | Supabase project **"Phoenix MVP"**, ref `khruuuifeziuljbdpwbr`, URL `https://khruuuifeziuljbdpwbr.supabase.co` |
| Cloud environment | The **"Default"** environment with **no description**. Not the other "Default" ("trusted network access"). Consider renaming it "Phoenix". |

## 3. Working rules (from `CLAUDE.md`)

- `docs/specs/` is authoritative. Build only the approved MVP0 spec.
- No features, infrastructure, dependencies, abstractions or data fields outside the spec without the owner's explicit approval. Stop and ask first.
- Don't silently reinterpret requirements. Prefer the simplest implementation.
- Don't edit spec files unless explicitly told to.
- Keep commits small and logically grouped. Don't "future-proof".
- Record out-of-scope ideas under "Future consideration" in `docs/roadmap.md`, and don't build them.

## 4. Decisions made (all recorded in the spec's Approved changes)

1. **No progressive loading.** Each page loads its full 50 or 100 headlines at once.
2. **Time display.**
   - The database stores the exact release moment. Times without a time zone are read as Malaysia time.
   - The database time zone is set to `Asia/Kuala_Lumpur`.
   - Under 24 hours old: "Just now", "30 mins ago", "5 hrs ago".
   - 24 hours or older: date and time in the **viewer's own device time zone**, e.g. "22 Sept 2026, 3:05 pm".
3. **URLs.**
   - `source_url` is the link exactly as received.
   - `article_url` is the cleaned link, with `utm_*` tags and `#fragment` removed. It's the link Phoenix opens.
4. **Sources (history).**
   - BERNAMA was replaced by Malay Mail, and The Star by FMT, because The Star's feeds return 404.
   - The Edge has no RSS feed. NST was never confirmed.
   - All of this is superseded by decision 5.
5. **GNews API replaces all RSS**, on the free plan.
   - Query: top headlines, `category=business`, `country=my`, `lang=en`, `max=10`. (The query was Claude's choice, flagged to the owner.)
   - `source` is the publisher name GNews provides, e.g. "The Star".
   - `external_id` is the cleaned article URL.
   - Free plan: 100 requests a day, 10 articles per request, **12-hour delay**, **non-commercial only**.
6. **Page-size change resets to page 1.** A page number past the end shows "No headlines on this page" with the page links.
7. **Items without a publication date are skipped and logged.** This is on the roadmap backlog.
8. **Scheduling:**
   - Supabase `pg_cron` + `pg_net` calls `/api/ingest` **every 3 hours starting 12am Malaysia time**.
   - Cron in UTC: `0 1-22/3 * * *` (01:00, 04:00 … 22:00 UTC = 9am, 12pm … 6am Malaysia time).
   - Vercel Cron was rejected: the free plan allows once a day only.
   - The app URL and `CRON_SECRET` go in Supabase Vault.
9. **Hosting:** Vercel (from the spec). Replit was discussed; we stay on Vercel unless the owner approves a change.
10. **No web scraping.** Collecting headlines from publisher web pages was discussed and not pursued.

## 5. Architecture

```
GNews API ──► sources/gnews.ts (normalize) ──► ingest.ts ──► articleRepository.ts ──► Supabase `articles`
                                                   ▲                                         │
          /api/ingest (GET, Bearer CRON_SECRET) ───┘                                         ▼
          (called by Supabase pg_cron every 3h, or manually with curl)          page.tsx feed (server-rendered)
```

- **Database table:** `articles(id, title, source, source_url, article_url, published_at, ingested_at, external_id)`.
  - `unique(source, external_id)` blocks duplicates.
  - Index on `(published_at desc, id desc)`.
  - Row-level security is on with no policies. The server uses only the service-role key.
- **Duplicate blocking:** inserts use `ON CONFLICT DO NOTHING`, and repeats within one batch are dropped in memory.
- **Feed page:** `/?page=N&size=50|100`, newest first, numbered pagination with Previous/Next.
- **Sources:** `NewsSource` interface. Swapping a provider means changing the adapter and `sources/index.ts` only.
- **Packages:** `next` 16, `react` 19, `@supabase/supabase-js`. Development: `typescript` 7 and `@types/*`. Tests use Node's built-in test runner (no Vitest), so `npm test` and `npm run backfill` need **Node.js 22.18 or later**.

### Key files

| File | Purpose |
| --- | --- |
| `supabase/migrations/0001_create_articles.sql` | Table, constraints, index, RLS, DB time zone |
| `supabase/migrations/0002_schedule_ingestion.sql` | 3-hourly `pg_cron` job; reads the app URL and `CRON_SECRET` from Vault |
| `supabase/migrations/0003_grant_service_role.sql` | Lets the service-role key read and insert articles |
| `scripts/backfill.ts` | `npm run backfill -- [max_requests]`: loads up to 30 days of GNews history |
| `tests/*.test.ts` | Normalization and deduplication tests (`npm test`) |
| `src/lib/sources/gnews.ts` | GNews adapter (`normalizeGNews`, `fetchGNewsHeadlines`, reads `GNEWS_API_KEY`) |
| `src/lib/sources/normalize.ts` | `cleanTitle`, `cleanArticleUrl`, `parsePublishedAt` |
| `src/lib/ingest.ts` | Runs each source independently and logs per source |
| `src/app/api/ingest/route.ts` | Protected ingestion endpoint |
| `src/lib/articleRepository.ts` | `insertNewArticles`, `countArticles`, `listArticles`, `dedupeArticles` |
| `src/app/page.tsx` and `src/components/*` | Feed UI, pagination, size selector, client-side time display |
| `.env.example` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `GNEWS_API_KEY` |

## 6. Milestone status

| # | Milestone | Status |
| --- | --- | --- |
| 1–3 | App setup, DB table, Article model | ✅ Done. Migrations `0001` and `0003` applied to "Phoenix MVP" |
| 4, 9 | News source | ✅ GNews adapter |
| 5 | Ingestion and `/api/ingest` | ✅ Done |
| 6–8 | Feed page, pagination, 50/100 selector, time display | ✅ Done |
| 10 | Real headlines in the feed | ✅ Database holds **664 articles from 75 publishers**, published 23 Sep–22 Oct 2026 (checked 22 Oct). Loaded by the second session, including a 30-day backfill. |
| 11 | Check duplicates are blocked | ⚠️ The unique rule is in place; confirm with the second session whether a repeat run was checked |
| 12 | Every-3-hours `pg_cron` schedule | 🟡 Written (`0002_schedule_ingestion.sql`), **not yet applied**. It needs the deployed URL, so it runs after milestone 14. |
| 13 | Tests: normalization and deduplication | ✅ Added (`npm test`, Node's built-in runner) |
| 14 | Deploy to Vercel: import repo, add 4 env vars, deploy | 🔜 **Next.** Then store the URL and `CRON_SECRET` in Vault and apply `0002` |
| 15 | Final README | 🟡 Manual ingestion, backfill, scheduling and tests sections are written; "Deploying to Vercel" is still pending |

**Added beyond the original plan:** a 30-day backfill command (`scripts/backfill.ts`, commit `d01b814`). The original MVP0 spec doesn't include it; check that the owner approved it in the second session.

## 7. Setup already done by the owner

- Supabase project "Phoenix MVP" created; migrations `0001` and `0003` applied.
- In the cloud environment ("Default", no description):
  - **Environment variables:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GNEWS_API_KEY`.
  - **Allowed domains:** `khruuuifeziuljbdpwbr.supabase.co`, `gnews.io` (also earlier: `www.malaymail.com`, `www.thestar.com.my`, `cms.freemalaysiatoday.com`).
- Environment variables only load when a session starts. Sessions started before they were added can't see them.
- Generate a temporary `CRON_SECRET` for local testing. Never print or commit secrets, and never ask for keys in chat.

## 8. Open items and caveats

- **Commercial use:** Vercel Hobby and the GNews free plan are both **non-commercial only**. Demoing to potential customers may count as commercial; the owner should check. Paid options: Vercel Pro (about $20/month), GNews Essential (about €50/month, also removes the 12-hour delay).
- **Supabase free tier** pauses after 7 days without activity. The 3-hourly ingestion should keep it awake.
- **Supabase advisor:**
  - "RLS enabled, no policy" is expected.
  - The warning about `public.rls_auto_enable()` is harmless. It's an event-trigger function that auto-enables RLS on new tables and can't be called through the API. **Leave it.**
- **GNews query** (business, Malaysia, English) was Claude's default. The owner may want to adjust it.
- The other Supabase project, "benjamin-kee's Project", is paused and unrelated. Don't touch it.

## 9. Starter prompt for the new session

> Continue Phoenix MVP0 on branch `claude/inspiring-galileo-33vjef` (PR benjamin-kee/fluffy-orca#1). Read `CLAUDE.md`, `docs/specs/MVP0.md` (including "Approved changes"), `docs/roadmap.md`, `README.md` and this hand-off summary in `handoff/` first.
>
> `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `GNEWS_API_KEY` are set as environment variables. The database already holds real headlines.
>
> Next:
> 1. Confirm the variables are visible without printing their values, and that `npm test` and `npm run build` pass.
> 2. Confirm duplicate blocking (milestone 11) by running ingestion again; report fetched vs. inserted.
> 3. Guide me step by step through deploying to Vercel (milestone 14), including the four environment variables and a new `CRON_SECRET`.
> 4. Then store the deployed URL and `CRON_SECRET` in Supabase Vault, apply `0002_schedule_ingestion.sql`, and confirm the first scheduled run (milestone 12).
> 5. Finish the README's deployment section (milestone 15).
>
> Follow the scope rules in `CLAUDE.md`: ask before anything outside the spec.
