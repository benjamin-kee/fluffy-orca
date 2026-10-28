---
id: SPEC-MVP0
prd: PRD-MVP0
prd_version: 0.3
status: Retired. Never confirmed or built. Superseded by docs/specs/MVP0.md (approved changes 1 to 6)
version: 2.1-draft
---

> **Retired 27 October 2026.** This draft was written in the planning project on 2 October 2026 to replace `docs/specs/MVP0.md`. It was never confirmed (review item 66) and was not built. MVP0 follows `docs/specs/MVP0.md`, which is the approved spec. Kept here for the record only. Nothing in this file is a requirement.

# Watchtower MVP0 Specification: Central Business-News Dashboard

**Status:** v2.0 approved by Ben on 2026-10-02. v2.1 applies the edits from his review of the PRD and waits for his confirmation. Once confirmed it replaces `docs/specs/MVP0.md` in full.
**Last updated:** 2026-10-02
**Implements:** PRD-MVP0 v0.3
**Decisions:** D-001, D-005, D-009, D-012 to D-014, D-017 to D-030 in `Decisions/Product-Decisions.md`
**News input:** the GNews API is the only source of news. Nothing else feeds Watchtower.
**Carried over:** three rules approved earlier in the repo on paging, time display and links, now logged as D-023 to D-025.

## 1. Scope control
This specification is the source of truth. Build only MVP0 as written. Do not add, expand, substitute or redesign anything, and do not build MVP0.1, MVP1 or later features. Do not add infrastructure, abstractions, frameworks, services, data fields or UI elements unless an explicit requirement needs them.
If something outside this spec seems necessary, stop before building it. Say what you want to add, why, the impact of not doing it, and ask for explicit approval. Do not treat future context as permission. Where the spec is ambiguous, build the smallest thing that satisfies the words.

## 2. Objective
A lightweight central dashboard that lists Malaysian business headlines from many publishers in one newest-first feed. Headlines come from the GNews API, are stored in Postgres, and link out to the original publisher.
User story: as a user, I want one dashboard of Malaysian business headlines so I can see business developments from many publishers in one place.

## 3. Content model
Watchtower is a news index. It does not ingest or host article text. For each GNews article, Watchtower keeps: headline, publisher name, the article link as GNews returns it, a cleaned article link, publication time, the GNews article id, and the Watchtower ingestion time.
Watchtower discards and never stores: description, content, image, language, and any source details other than the publisher name.

## 4. Requirements

### Ingestion
| ID | Requirement |
|---|---|
| MVP0-R1 | Watchtower shall retrieve articles from the GNews API through one `GnewsSource` class that implements the `NewsSource` interface. No GNews logic exists outside it. |
| MVP0-R2 | Requests shall send `country=my`, `lang=en`, `nullable=description,content,image`, and `max` from the setting `GNEWS_MAX_PER_REQUEST`. |
| MVP0-R3 | The query shall be Top Headlines with `category=business`. The Search endpoint shall not be called. If the coverage test in section 13 shows Top Headlines returns too little, Ben decides whether to add a Search query (D-018). |
| MVP0-R4 | The API key shall be read from `GNEWS_API_KEY`, sent in the `X-Api-Key` header, used only on the server, and listed in `.env.example` without a value. |
| MVP0-R5 | Each scheduled run shall make one request for the first page of results, limited to articles published within the last `GNEWS_LOOKBACK_HOURS` (default 24). Watchtower shall store only articles it does not already hold (R15, R16) and discard the rest. A run that finds nothing new stores nothing and is logged as a success. |
| MVP0-R6 | The adapter shall normalize each article by the mapping in section 7 and discard every other field. |
| MVP0-R7 | Articles missing `title`, `url` or `publishedAt` shall be skipped and logged as warnings. |
| MVP0-R8 | On HTTP 429 the adapter shall retry up to 3 times with exponential backoff. On 401 or 403 it shall stop the run and log the cause. On 5xx it shall retry up to 3 times, then log and end the run. A failed run shall not change stored articles. |
| MVP0-R9 | Ingestion shall run every 15 minutes, making one GNews request per run, which is 96 requests a day and inside the Free plan limit of 100. It can also be triggered manually in development. Manual runs and the coverage test use the same daily limit. The interval is subject to review items 34 and 67. |
| MVP0-R10 | Each run shall log the request made, articles received, inserted, skipped, and the outcome. |

### Backfill
| ID | Requirement |
|---|---|
| MVP0-R11 | A one-off command shall load articles from 2026-01-01T00:00:00Z to now in date windows. A window that hits the 1,000 article cap shall be split in half and retried. |
| MVP0-R12 | The backfill shall be idempotent. Running it twice inserts nothing new. |
| MVP0-R13 | On the Free plan the backfill shall load what the plan allows and report the earliest date reached. |

### Storage and deduplication
| ID | Requirement |
|---|---|
| MVP0-R14 | Articles shall be saved through `ArticleRepository` to the `articles` table with exactly the eight fields in section 7. |
| MVP0-R15 | A unique constraint on (`source`, `external_id`) shall prevent duplicates. `external_id` is the GNews article id. |
| MVP0-R16 | If `external_id` is missing, an article is a duplicate when its `article_url` already exists. |
| MVP0-R17 | The same story under different ids, links or publishers is not deduplicated in MVP0 (backlog B-001). |

### Feed
| ID | Requirement |
|---|---|
| MVP0-R18 | The feed shall list stored articles newest first by `published_at`. |
| MVP0-R19 | Each item shall show the headline, the source name and the publication time, and nothing else. |
| MVP0-R20 | An article published less than 24 hours ago shall show elapsed time, such as "30 mins ago". An older article shall show its date and time in the viewer's own time zone. GNews times are UTC. |
| MVP0-R21 | Clicking a headline shall open `article_url` in a new browser tab. There is no Watchtower article page. |
| MVP0-R22 | The feed shall use numbered pagination with Previous and Next, and a selector for 50 or 100 headlines per page. The default is 50 and the choice is kept across pages. Each page loads in full. |
| MVP0-R23 | The layout shall work at a basic level on desktop and mobile and stay lightweight. |

### Access
| ID | Requirement |
|---|---|
| MVP0-R24 | MVP0 shall have no login, user accounts or other authentication (D-027). It is a private demo, and its link is shared only with invited reviewers. |

### Engineering
| ID | Requirement |
|---|---|
| MVP0-R25 | Tests shall cover normalization from a recorded GNews response, deduplication, link cleaning, and error handling for 401, 403, 429 and 5xx using mocked responses. |
| MVP0-R26 | The README shall cover prerequisites, installation, environment variables, database setup, running locally, manual ingestion, scheduled ingestion, the backfill command, tests, Vercel deployment, and GNews plan notes. |
| MVP0-R27 | GNews shall be called with `fetch`. No new runtime dependency without approval. |

## 5. Out of scope
Do not implement: article-detail pages; images; summaries or generated summaries; previews; article body scraping or storage; keyword search; filters; sorting controls; login, authentication or user accounts; saved searches; alerts; email notifications; AI or LLM features; embeddings; vector databases; semantic search; RAG; company extraction or tagging; topic classification; entity resolution; people extraction; sentiment; company profiles; recommendations; personalization; relevance ranking; importance scoring; editorial ranking; analytics dashboards; user behaviour tracking; billing; subscriptions; sophisticated UI design; animations; custom design systems; any second news source; any request to the GNews Search endpoint unless Ben approves; calls to GNews from the browser; progressive loading, "Load more" and infinite scroll.
If you think an out-of-scope item is technically necessary, stop and ask.

## 6. Technology
Next.js, TypeScript, Supabase Postgres, Vercel-compatible deployment. Simplest reasonable implementation, minimal dependencies. No extra databases, search engines, queues, caches, vector stores or orchestration. Ask before any paid service or new infrastructure.

## 7. Article data model
| Field | Source | Rule |
|---|---|---|
| `id` | Watchtower | Generated |
| `title` | `title` | As returned |
| `source` | `source.name` | As returned |
| `source_url` | `url` | Exactly as GNews returns it |
| `article_url` | `url` | Tracking parameters such as `utm_*` and any `#` fragment removed. Watchtower opens this link |
| `published_at` | `publishedAt` | Stored as UTC |
| `ingested_at` | Watchtower | Insert time |
| `external_id` | `id` | As returned |

No other business fields. The model must not contain summary, image, body, author, topic, company, person, sentiment, keyword, embedding or AI fields. A purely technical field needs an explanation before it is added.

## 8. Ingestion architecture
GNews API -> `GnewsSource` (`NewsSource`) -> normalize to Article -> deduplicate -> `ArticleRepository` -> Postgres -> Watchtower feed.
The rest of the app holds no GNews-specific logic. Do not build a plugin framework. Admin dashboards for ingestion are out of scope. Use environment variables for all configuration: `GNEWS_API_KEY`, `GNEWS_MAX_PER_REQUEST`, `GNEWS_LOOKBACK_HOURS`, database settings. Never commit secrets.
Plan limits that shape the code: Free allows 100 requests a day, 10 articles per request, 1 request per second, a 12 hour delay and 30 days of history. Essential allows 1,000 requests a day, 25 articles, 10 requests per second, real time and history from 2020. The daily limit resets at 00:00 UTC and going over it returns HTTP 403.
Request pattern: GNews counts requests, not articles. Every request uses one of the day's requests. A request that returns no articles is expected to count as one too, which the coverage test confirms.
Known limit: if more articles arrive between two runs than one page holds, the regular run does not fetch the extra ones. The coverage test measures whether this happens.

## 9. Deduplication
Deduplication stops an article already stored from being stored again on a later run. Primary key: (`source`, `external_id`). Fallback: `article_url`. No semantic or AI-based matching. Each request returns the latest articles in the window, including ones Watchtower already holds, so most of a response is normally discarded as duplicates.

## 10. Frontend
One main news-feed page. Visually simple and functional. Show only headline, source and time. Include numbered pagination and the 50/100 selector. Do not show images, summaries, tags, search, account or AI controls. Do not add other pages unless technically required.

## 11. Engineering requirements
Basic error handling and logging. Tests as in R25 and nothing more elaborate. Small, logically grouped Git changes. A README per R26. `.env.example` included. Avoid premature abstraction.

## 12. Implementation behaviour
Do not silently make product decisions. Do not add "best practice" features. Record useful out-of-scope ideas under "Future consideration" and do not build them. Where a requirement can be met several ways, choose the simplest consistent with section 6.

## 13. First task and sequence
Do not write code yet. Produce a plan with these sections, then STOP and wait for approval: 1 Requirement interpretation, 2 Assumptions, 3 Technical risks (GNews coverage and availability, quota, stable ids, publication times, scheduling, duplicates), 4 Architecture, 5 Directory structure, 6 Database schema, 7 Ingestion design, 8 Deduplication, 9 Pagination, 10 Implementation sequence, 11 Out-of-scope suggestions, 12 Permission requests (or "No additional scope requested.").
Sequence, reporting which steps already exist in the repo: 1 app skeleton; 2 database; 3 Article model; 4 `NewsSource` and `ArticleRepository`; 5 one-day coverage test outside `src/`; 6 `GnewsSource`; 7 ingest and store; 8 feed UI; 9 pagination and selector; 10 deduplication validation; 11 scheduled ingestion; 12 backfill command; 13 tests; 14 deployment; 15 README. Any earlier publisher-specific code is removed in step 6, because GNews is the only news input.
The coverage test calls Top Headlines for Malaysian business news three times across one day on the Free plan, including one request with a very narrow time window that should return nothing. It reports articles per run, distinct publishers, how many were new on each run, the share of 20 sampled headlines that are clearly Malaysian business news, duplicates by id and by title, and the number of requests made so Ben can compare it with the GNews usage counter.

## 14. Acceptance criteria (DRAFT)
| Req | Given | When | Then |
|---|---|---|---|
| R5 | A response of 10 articles, 8 already stored | A run executes | 2 inserted, 8 discarded, counts logged |
| R5 | A response of 0 articles | A run executes | Nothing stored, run logged as success with 0 received |
| R6 | A recorded response with 3 complete articles | Normalized | 3 Articles with all 8 fields; description, content and image are not stored |
| R7 | An article without `publishedAt` | Normalized | Skipped, one warning logged |
| R8 | 429 twice, then 200 | Run executes | Articles stored, 2 retries logged |
| R8 | 403 | Run executes | Run stops, "quota exhausted" logged, stored rows unchanged |
| R9 | Scheduler running for 24 hours | Requests counted | 96 scheduled requests |
| R11 | A window returns 1,000 results | Backfill runs | Window split, all articles loaded |
| R12 | Backfill completed | Run again | Zero inserts |
| R15 | An article with the same `external_id` is stored | Ingested again | No second row |
| R16 | No `external_id`, existing `article_url` | Ingested | No second row |
| R20 | `published_at` 30 minutes ago | Feed renders | "30 mins ago" |
| R20 | `published_at` 3 days ago, viewer in Toronto | Feed renders | Date and time in Toronto time |
| R21 | Any item | Headline clicked | `article_url` opens in a new tab |
| R22 | Page size 100 chosen | Go to page 2 | Page size is 100 |
| R22 | Any page | Loads | All items of the page appear together |
| R24 | Any page | Opened | No login prompt and no account controls |

## 15. Open questions
- Review item 34: scheduler. A 15 minute interval rules out Vercel's free daily schedule. Recommended: a free GitHub Actions schedule.
- Review item 67: request cadence of 15 minutes (96 a day) versus hourly versus 14.4 minutes (100 a day).
- Retention period for stored articles.
- Coverage test result (D-018): whether Top Headlines alone is enough.

## Origin of carried-over rules
Three rules approved earlier in the repo are folded in and logged as D-023 to D-025: each page loads in full (R22), recent items show elapsed time and older ones show local date and time (R20), and `source_url` keeps the link as returned while `article_url` is the cleaned link Watchtower opens (section 7). A fourth repo rule, which named specific news sources, is void under D-017 and D-026.

## Change log
- Retired (2026-10-27): superseded by `docs/specs/MVP0.md`. Not built.
- 2.1-draft (2026-10-02): One request per run every 15 minutes (R5, R9). Search endpoint not called without Ben's approval (R3). `title` stored as returned (section 7). No login in MVP0 (R24). "Spike" renamed "coverage test". "Excluded" renamed "Out of scope". Acceptance rows added for R5, R9 and R24.
- 2.0-draft (2026-10-02): Full rewrite around GNews. Approved by Ben the same day.
