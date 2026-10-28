# FS Review: SPEC-MVP0 v2.0-draft against PRD-MVP0 v0.2

> Historical review record from the planning project, imported 27 October 2026. It reviews the SPEC-MVP0 v2.0 draft, which was never built (see `docs/specs/Retired/`). Several requests were met by the build anyway, for example stable newest-first ordering with an id tie-breaker, page and size in the URL, the time display rules, links opening with `rel="noopener noreferrer"`, and server-side-only database access with row-level security. None was applied as a spec change.

**Date:** 2026-10-02
**Reviewer:** FS agent
**Scope:** discrepancies with the PRD and decision log, reliability, user flow. The spec was not edited. Every change below is a request for Ben to approve or reject (D-022). Numbering continues from review items 47 to 49.

## Verdict

The spec covers all 13 PRD functional requirements and matches the PRD on scope, field mapping and exclusions. It is not ready to approve yet. Six items would cause wrong data, wasted quota or a failed build plan. Four more would give readers a rough experience. The rest is housekeeping.

## 80/20: fix these first

| # | Item | Why it matters |
|---|---|---|
| 50 | Run the spike before building | PRD and D-018 say spike precedes build. Spec puts it at step 5 |
| 51 | Dedup key is wrong | Spec keys on publisher name plus id. D-010 says GNews id |
| 52 | Request budget breaks PRD limit | Hourly runs with a 24 hour lookback burn the Free quota |
| 53 | Paging can stop early | Stop rule fails if GNews caps `max` below what is sent |
| 54 | Failed run rule contradicts itself | "No change on failure" conflicts with paged, idempotent inserts |
| 55 | Backfill has no defined endpoint | Search has no business category, so the history could be off topic |

## Change requests

### Reliability and correctness

**50. Move the spike to step 1 (R3, section 13)**
- Issue: PRD risk R1 and D-018 say a one-day spike comes before building. Section 13 puts it fifth, after skeleton, database, model and interfaces. The spike can change the model, for example if ids are missing. R3 also cites "T04", which is not defined anywhere in the spec.
- Change: spike first, then the rest. Replace "T04" with "the spike (sequence step 1)". Add what the spike must answer: volume and publisher count, whether `id` is always present, whether Top Headlines accepts `from`, `to` and `page` on Free, whether it returns a total count, and whether `max` above the plan cap errors or is silently capped.
- Tradeoff: none. It only reorders work.

**51. Fix the duplicate key (R15, R16, section 7, section 9)**
- Issue: `source` holds the publisher name, so the unique key is (publisher name, GNews id). One outlet renamed in GNews, or reported two ways, would store the same article twice. D-010 as amended says the key is the GNews article id. R16 uses a fallback when `external_id` is missing, but Postgres treats NULLs as distinct, so a plain unique constraint does not enforce it. The spec also never says what happens on a conflict.
- Change: unique on `external_id` alone. Partial unique index on `article_url` where `external_id` is null. Insert with ignore-on-conflict so a duplicate is skipped, counted and never fails the run. Update the PRD metric wording ("No repeated external id rows") to match.
- Tradeoff: drops the multi-source flexibility the composite key hinted at. D-017 makes GNews the only source, so nothing is lost.

**52. Fit the request budget to the PRD limit (R5, R9, PRD section 9)**
- Issue: PRD says keep daily requests under 10% of plan quota. R5 refetches a full 24 hours every run. Using the PRD working guess of 30 to 60 headlines a day, hourly runs cost about 72 to 144 requests a day on Free (10 per request) against a quota of 100. On Essential they cost about 48 to 72 against a 100 request budget. Even one request per run hourly is 24 a day, which is above 10% of Free.
- Change: after the first run, request from the newest stored `published_at` minus a fixed overlap of 6 hours, never earlier than `GNEWS_LOOKBACK_HOURS`. That is about 1 request per run. State that the 10% rule applies on the paid plan, and that on Free the ceiling is the plan quota with the interval set by config. Backfill is exempt.
- Tradeoff: the overlap value is a judgement. It covers late indexed articles without a state table.
- Ben decides: apply the 10% rule on Free too, which means a run every 3 hours or so, or exempt Free.

**53. Make the paging stop rule safe (R2, R5)**
- Issue: R5 stops when a page returns fewer than `max` items. If `GNEWS_MAX_PER_REQUEST` is set above the plan cap, for example 25 on Free, and GNews caps silently at 10, every run stops after page 1 and silently drops articles.
- Change: stop on an empty page or when the total count from the response is reached. Check `GNEWS_MAX_PER_REQUEST` against the plan cap on start and log a warning on mismatch. Log a warning when a live run hits the 1,000 article cap, because that is data loss.
- Tradeoff: needs the spike to confirm the total count field.

**54. Define what a failed run does, and add missing error cases (R8, R10)**
- Issue: R8 says a failed run does not change stored articles. With several pages per run, that means one 5xx on page 3 throws away pages 1 and 2 and the quota spent on them. The acceptance row "403: stored rows unchanged" encodes the same rule. PRD F11 only asks for no corruption. R8 also misses network timeout, 400, malformed JSON and a 200 with an empty or unexpected body. Nothing throttles requests, so on Free (1 per second) a paged run triggers its own 429s.
- Change: inserts are idempotent, so keep what was fetched and stored before the failure. Reword to "a failed run never deletes or alters stored articles". Add the missing cases to R8 and R25. Add a request pacing rule per plan limit (1 per second on Free, 10 on paid). Log a run outcome of success, partial or failed.
- Tradeoff: partial runs are possible. The next run overlaps and repairs them.

**55. Define the backfill (R11 to R13)**
- Issue: R11 names no endpoint. PRD section 7 says Search has no business category, so a Search based backfill would load non business headlines into a business feed. Whether Top Headlines returns old dates is unproven. The start `2026-01-01T00:00:00Z` is 08:00 on 1 January in Malaysia, so the first 8 hours are missed. The spec does not say whether one failed window stops everything, and R13 does not say how the earliest date reached is found on Free.
- Change: state the endpoint and filter the backfill uses, decided by the spike. If Search is needed, define the query and record the lower precision. Start at `2025-12-31T16:00:00Z`, or state that UTC is deliberate. A failed window is logged and skipped, the run continues, and the report lists failed windows, earliest date reached and counts per window. Pace to plan limits.
- Tradeoff: backfill history may be less precise than the live feed. The PRD already accepts a ranked subset.

### User flow

**56. Make pagination stable and fully specified (R18, R22)**
- Issue: R18 sorts by `published_at` only. Articles with the same time can swap or repeat between pages. R22 does not say how the page size is kept, what happens to the current page when the size changes, or how page numbers display with about 160 pages. Nothing says what an invalid page does. The PRD speed target also needs an index the spec does not mention.
- Change:
  - Sort by `published_at` descending, then `id` descending, with a matching index.
  - Keep page and size in the URL (`?page=2&size=100`), so Back works and links can be shared.
  - Changing size goes to page 1.
  - Invalid size falls back to 50. A page past the end shows the last page.
  - Show first, last, current plus or minus 2, and ellipses.
  - Previous is disabled on page 1, Next on the last page, and the current page is marked.
  - Put controls below the list, where a 100 item page ends.
  - Use plain links so it works without JavaScript.
- Known limit, accepted for MVP0: new rows pushed in by ingestion can shift items between clicks. Hourly runs make this rare.

**57. Pin down the time display (R20)**
- Issue: R20 gives one example. The server does not know the viewer's time zone, and a cached page would show stale elapsed times. Undefined cases: under 1 minute, exactly 24 hours, future timestamps from publisher clock errors, year for older items.
- Change:
  - Render each time from its UTC value in the browser, and use `<time datetime>` markup.
  - Under 1 minute shows "Just now". 1 to 59 shows "N mins ago", with "1 min ago" singular. 1 to 23 hours shows "N hrs ago".
  - From 24 hours up show date and time in the viewer's locale, with the year only when it is not the current year.
  - A future timestamp shows "Just now".
  - Elapsed time is computed at page load and does not tick.
  - Page cache is no longer than 60 seconds, or the page is dynamic, so the freshness metric holds.

**58. Add feed states and tie F11 to a requirement (R19, R21)**
- Issue: PRD F11 says ingestion failures never crash the feed. No spec requirement or test covers it. The spec has no empty feed state, no database failure state and no rule for a missing source name.
- Change: the feed only reads the database and never calls GNews. Empty feed shows "No headlines yet." A database error shows a short message with HTTP 503 and no stack trace. If `source.name` is missing, show the host from `article_url`.

**59. Tighten links and titles (R7, R21, section 7)**
- Issue: "tracking parameters such as `utm_*`" is open ended. Stripping other parameters can break links where the article is identified by query, for example `?p=123`. R21 omits `rel`. Titles may arrive with HTML entities and show as `&amp;`.
- Change: strip only `utm_*`, `fbclid`, `gclid`, `mc_cid`, `mc_eid` and the `#` fragment. Accept http and https only. Use `target="_blank" rel="noopener noreferrer"`. Decode HTML entities and collapse inner whitespace during normalization if the spike shows them. Skip an article whose title is empty after trim or whose `publishedAt` does not parse (add both to R7).

### Housekeeping

**60. Say where ingestion runs and how it is protected (R9, item 34)**
- Issue: PRD recommends hourly through free GitHub Actions. The spec leaves the choice open and lacks the recommendation. A daily Vercel cron cannot meet the PRD freshness target of 2 hours, so item 34 is effectively decided by the PRD unless the metric is relaxed. The spec does not say whether the Action runs a script or calls a web endpoint. A public endpoint that triggers GNews calls is a quota abuse risk. GitHub also disables scheduled workflows in public repositories after 60 days without repository activity.
- Change: the Action runs the ingestion script directly with the database URL and GNews key as Action secrets, so no public endpoint exists. If an endpoint is used instead, it requires a secret header. The manual trigger is development only. README notes the 60 day rule. State that Action run history is the evidence for the 95% reliability metric.

**61. Make R23 measurable**
- Change: no horizontal scroll at 360 px width, tap targets at least 44 px tall for headlines and pagination, long headlines wrap, viewport meta present. Pagination sits in a `nav` with a label, the current page uses `aria-current`, focus is visible, and visited headlines use a different colour so readers can see what they opened.

**62. Add traceability and fill acceptance gaps (section 14)**
- Change: add a "PRD ref" column to the requirement tables. This supports the PRD promise that PRD, spec, tests and code trace to each other. Add the draft acceptance rows listed below.

**63. Small alignments**
- Header "Decisions" line should include D-010.
- Retention: PRD recommends keep everything for now. Copy that recommendation into the spec open question.
- PRD guardrails say ask before adding a table or column. State that indexes are allowed.
- Supabase exposes tables through its own API. State that the feed connects server side only, or that row level security is on with no public policy.
- `.env.example` should list the database URL and the interval setting as well as the GNews variables.

### Questions for Ben

**64.** The feed shows no "last updated" signal. On Free, the newest item is always 12 or more hours old, so a viewer cannot tell stale from broken. Section 10 and R19 forbid extra elements. Options: accept it for MVP0, or approve one line in the page footer.

**65.** The spec defines no page heading or browser title. Approve a heading with the product name and one line saying "Malaysian business headlines", plus a matching `<title>`?

## PRD to spec trace

| PRD | Spec | Acceptance row today |
|---|---|---|
| F1 | R1, R2, R3 | none |
| F2 | R6, section 7 | R6 |
| F3 | R14, R15, R16 | R15, R16 |
| F4 | R11, R12, R13 | R11, R12 |
| F5 | R18 | none |
| F6 | R19 | none |
| F7 | R20 | R20 |
| F8 | R21 | R21 |
| F9 | R22 | R22 |
| F10 | R9 | none |
| F11 | R8 only in part | R8. Feed never crashes: none |
| F12 | R23 | none |
| F13 | R4 | none |
| NFR budget, back off, stop on key errors | R8. 10% rule absent | R8 |

PRD metrics with no spec support: freshness (needs the scheduler decision), feed speed (needs index and cache rule), reliability (needs run evidence, see 60).

## Draft acceptance criteria (DRAFT)

| Req | Given | When | Then |
|---|---|---|---|
| R1, R2 | Mocked GNews | A run starts | Request carries `country=my`, `lang=en`, `category=business`, `nullable`, `X-Api-Key` header |
| R5 (52) | Newest stored article is 3 hours old | A run starts | `from` is 9 hours before now, not 24 |
| R5 (53) | Total count 25, page size 10 | A run executes | 3 pages requested, 25 articles received |
| R8 (54) | 5xx on page 3 of 3 | A run executes | Pages 1 and 2 are stored, outcome logged as partial |
| R8 (54) | Free plan, 3 pages | A run executes | Requests are at least 1 second apart |
| R15 (51) | Same `external_id`, different publisher name | Ingested again | No second row |
| R15 (51) | Conflict on insert | A run executes | Run continues, skipped count logged |
| R18 (56) | Two articles with the same `published_at` | Pages 1 and 2 load | Each appears once, order is the same on every load |
| R19 | Any item | Feed renders | Only headline, source and time appear |
| R20 (57) | `published_at` 20 seconds ago, then 5 minutes in the future | Feed renders | "Just now" for both |
| R20 (57) | `published_at` exactly 24 hours ago | Feed renders | Date and time, not elapsed |
| R21 (59) | Any item | Link inspected | `rel="noopener noreferrer"` and `target="_blank"` |
| R22 (56) | Page 3 at size 100 | Size set to 50 | Page 1 at size 50 |
| R22 (56) | `?page=9999` or `?size=77` | Page loads | Last page, or size 50 |
| F11 (58) | Empty table | Feed loads | "No headlines yet" |
| F11 (58) | Database unreachable | Feed loads | Short message, HTTP 503, no stack trace |
| R4 | Production build | Output searched for the key | No match in client files |
| R23 (61) | Viewport 360 px wide | Feed loads | No horizontal scroll |
| R11 (55) | One window fails | Backfill runs | Other windows load, report lists the failed window |

## Reply format

Reply by number, for example "50 approve, 51 approve, 52 edit, 64 accept".
