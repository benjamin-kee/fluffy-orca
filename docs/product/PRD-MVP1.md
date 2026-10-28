---
id: PRD-MVP1
milestone: MVP1, second of the Watchtower roadmap
status: MVP1.0 and MVP1.2 approved and built; MVP1.1 and MVP1.3 onward draft
version: 0.4, 28 October 2026
owner: Ben (product manager and approver)
spec: SPEC-MVP1 v0.4
decisions: D-002, D-005, D-038 to D-040 in the decision log
news_input: GNews API only
---

# PRD MVP1: Filtering and Keyword Search

Approved: keyword search across collected news (D-002), headline text only (D-005), MVP1 widened to filtering and keyword search in sub-sprints (D-039), days follow the viewer's time zone (D-040), sub-sprint MVP1.0, the single-day date filter, and sub-sprint MVP1.2, the From and To date range. Everything else is a proposal until Ben approves its sub-sprint.

## 1. Summary
MVP1 lets readers narrow the Watchtower feed: by day, by date range, by publisher and by country, and finally by keyword in the headline. It works only on the headlines Watchtower has already stored. It never calls GNews to filter or search, never reads article bodies and never calls an AI model. It ships in small sub-sprints, MVP1.0 to MVP1.6, each live on its own.

## 2. Problem and outcome
The MVP0 feed answers "what is new" and nothing else. Readers also ask "what happened on that day", "what did this publisher say" and "what happened with X". **Outcome:** a reader can get from the full feed to the handful of headlines they care about in a few clicks, and share that view as a link.

## 3. Users and jobs
- **Reader or analyst.** Look back at a given day or period, follow chosen publishers, find prior coverage of a company or topic.
- **Recruiter.** See the product grow from a feed into a working research tool, one shipped increment at a time.

## 4. Success metrics
| Metric | Target | How it is checked |
|---|---|---|
| Filtered feed load | 95th percentile under 500 ms | Logged server timing |
| Day accuracy | Every headline in a filtered day falls in that day in the viewer's time zone | Unit tests and a spot check from two time zones |
| Known-item search test (MVP1.6) | 10 of 10 hand-picked stored headlines found by a distinctive word | Test script |
| Empty results | Every empty result shows a message, never a blank page | Manual check |
| GNews requests used by filters and search | Zero | Request logs |

## 5. Scope
### In scope
- MVP1.0 Single-day date filter (built)
- MVP1.1 Results count, clear all, newest or oldest sort, every filter in the URL
- MVP1.2 Date range
- MVP1.3 Publisher (source) filter with headline counts
- MVP1.4 Country filter, Malaysia active and Singapore "Coming soon" (held for the country field)
- MVP1.5 Filters behind one button and a bottom sheet on phones
- MVP1.6 Keyword search on headlines, combined with the filters

### Out of scope
- Story grouping across outlets, login-dependent features, CSV export (parked)
- Quick presets such as "Today" and "Last 7 days" (pending Ben's decision)
- Body-text search, semantic or vector search, AI answers, autocomplete, saved searches, alerts, relevance sort
- Live GNews search calls
- Ingesting countries other than Malaysia
- The UI/UX redesign, which is MVP2

## 6. Release stages
One sub-sprint at a time on the `mvp1` branch, each through its own pull request into `main`, with Ben's approval before it starts. Later sub-sprints continue the numbering (MVP1.7 and so on).

## 7. Data and integration contract
- MVP1.0 to MVP1.2 and MVP1.5 change no data.
- MVP1.3 needs a read-only database function to count headlines by source (approval item A2).
- MVP1.4 needs a new `country` field on articles (approval item A1). Held until Ben approves.
- MVP1.6 needs a full-text index on `title` (approval item A3). No new column.
- Why not the GNews Search endpoint: it spends the daily request quota, only covers what GNews holds, and would make results differ from the stored feed.

## 8. Functional requirements
| ID | Requirement | Sub-sprint |
|---|---|---|
| MVP1-F1 | The reader picks one day and sees only that day's headlines, where a day is midnight to midnight in the reader's own time zone. | MVP1.0 |
| MVP1-F2 | A day with no headlines shows a miner drawing and "Our keyboard warriors are working hard to get your news." | MVP1.0 |
| MVP1-F3 | The reader sees how many headlines match, can clear every filter at once, and can sort newest or oldest first. | MVP1.1 |
| MVP1-F4 | Every filter, the sort and the search are kept in the link, so a view can be reloaded and shared. | MVP1.0, MVP1.1 |
| MVP1-F5 | The reader picks a From and To date. | MVP1.2 |
| MVP1-F6 | The reader picks one or more publishers, each shown with its headline count. | MVP1.3 |
| MVP1-F7 | The reader picks a country. Malaysia is available; Singapore shows "Coming soon". | MVP1.4 |
| MVP1-F8 | On a phone, the filters sit behind one button that opens a bottom sheet. | MVP1.5 |
| MVP1-F9 | The reader searches headline text by keyword, together with any active filters. All words must match, quoted text matches as a phrase, and English word forms match. | MVP1.6 |

## 9. Non-functional requirements
Filters and search use parameterized queries only and make no outbound calls. Search queries are capped at 200 characters. No new npm packages, search engines or services. Controls are plain HTML form elements.

## 10. Assumptions, risks and dependencies
| # | Item | How it is handled |
|---|---|---|
| R1 | Stored history reaches back only about 30 days | From MVP1.2 the date picker starts at the oldest stored headline's day, so empty earlier days cannot be picked; history before late September needs a paid GNews plan (A-13) |
| R2 | A shared link carries the sender's time zone, so the recipient sees the sender's day | Accepted: the link shows the same list for everyone |
| R3 | The country filter changes nothing while Malaysia is the only country ingested | MVP1.4 is held until a second country is ingested (spec Q7, answered 28 October 2026) |
| R4 | Headline-only search has lower recall than body search | Accepted by D-005. Body search is backlog B-002 |
| R5 | English stemming misses Malay terms and some names | English-only scope (D-014) |

## 11. Open questions
See SPEC-MVP1 section 7: Q4 to Q8 are still open.

## 12. Agent guardrails
Same as PRD-MVP0. Claude Code builds only sub-sprints Ben has approved, adds no search engine, vector store or external service, and stops and asks before any data change not approved in SPEC-MVP1 section 5.

## 13. Change log
| Version | Date | Change |
|---|---|---|
| 0.4 | 28 October 2026 | MVP1.2 approved and built: From and To dates replace the single-day picker, the earliest date is the oldest stored headline's day, and days stay the viewer's own (D-040). |
| 0.3 | 27 October 2026 | MVP1 widened from keyword search to filtering and keyword search, in sub-sprints MVP1.0 to MVP1.6. MVP1.0 approved and built. Days follow the viewer's time zone. Now second on the roadmap, before MVP2 (formerly MVP0.1) |
| 0.2.1 | 27 October 2026 | Outcome no longer promises history from 1 January 2026; MVP0 keeps 30 days of backfilled history (spec approved change 6) |
| 0.2 | 2 October 2026 | Word format. Out of scope heading. Clarified that this is not the GNews Search endpoint |
| 0.1 | 2 October 2026 | First draft |
