---
id: SPEC-MVP1
prd: PRD-MVP1
prd_version: 0.4
status: MVP1.0 built; MVP1.1 and MVP1.2 approved and built; MVP1.3 to MVP1.6 draft
version: 0.4.2
---

# MVP1 Specification: Filtering and Keyword Search

**Status:** MVP1.0 approved by Ben on 27 October 2026, built and merged ([pull request 5](https://github.com/benjamin-kee/fluffy-orca/pull/5)). MVP1.2 approved by Ben on 27–28 October 2026 and built ([pull request 7](https://github.com/benjamin-kee/fluffy-orca/pull/7)). MVP1.1 approved by Ben on 28 October 2026 and built on `claude/mvp1.1-results-controls`. MVP1.3 to MVP1.6 are drafts: each starts only after Ben approves it.
**Branch:** one branch and one pull request into `main` per sub-sprint. MVP1.0 was built on `mvp1`, MVP1.2 on `mvp1.2`.
**Last updated:** 2026-10-28
**Replaces:** the v0.1 keyword-search-only draft, now in `docs/specs/Retired/`. Its approved items (D-002 keyword search, D-005 headline text only) carry forward into MVP1.6.
**Source:** MVP1 sprint breakdown, draft of 26 October 2026.

## 1. Scope control

- This spec adds filters and keyword search to the existing MVP0 feed. It does not change ingestion, the backfill, the Article model, the time display rules (D-024) or the link rules (D-025).
- Filters and search read only the headlines Watchtower has already stored. They never call GNews.
- No new dependencies, search engines, services or UI libraries. Controls use plain HTML form elements.
- New database fields or migrations are allowed only where this spec lists them and Ben has approved them (section 5).
- Anything not written here is out of scope. If something outside it looks necessary, Claude Code stops and asks (see `CLAUDE.md`).

## 2. Sprints

Each sub-sprint ships a working increment on top of the one before it, and is merged and deployed on its own. Sub-sprints after MVP1.6 continue the numbering (MVP1.7 and so on), if Ben adds any.

| Sprint | Name | What ships | Depends on | Gate to start |
| --- | --- | --- | --- | --- |
| MVP1.0 | Single-day date filter | Pick one day; feed shows that day's headlines | MVP0 feed | Approved 2026-10-27. Built |
| MVP1.1 | Results controls | Result count, clear all, newest or oldest sort, URL state for all filters | MVP1.0 | Approved 2026-10-28. Built |
| MVP1.2 | Date range | From and To dates | MVP1.0 | Approved 2026-10-28. Built |
| MVP1.3 | Source filter | Multi-select of publishers with headline counts | MVP1.1 | Ben approves MVP1.3 and approval item A2 |
| MVP1.4 | Country filter | Malaysia active, Singapore greyed out "Coming soon" | A second ingested country and approval item A1 | Held until a second country is ingested (Q7) and A1 is approved |
| MVP1.5 | Mobile filter sheet | Filters behind one button and a bottom sheet on phones | MVP1.1 to MVP1.4 | Ben approves MVP1.5 |
| MVP1.6 | Keyword search | Search headline titles, combined with active filters | MVP1.1 and approval item A3 | Ben approves MVP1.6 and A3 |

MVP1.2 and MVP1.3 can run in either order. MVP1.6 can start once MVP1.1 is stable.

## 3. Rules shared by all sprints

| ID | Rule |
| --- | --- |
| MVP1-S1 | Results use the MVP0 feed item layout (headline, source, publication time) and open `article_url` in a new tab. |
| MVP1-S2 | Results use the MVP0 numbered pagination and the 50 or 100 page-size selector. The page count reflects only the matching headlines. |
| MVP1-S3 | Changing any filter, the sort or the search returns to page 1 and keeps the page size. Changing the page or page size keeps every filter. |
| MVP1-S4 | **A day is the viewer's own day, midnight to midnight in their time zone** (D-040, Ben, 27 October 2026; confirmed for MVP1.2 on 28 October 2026). A headline belongs to day D when `published_at` is at or after D 00:00 and before D+1 00:00 in that time zone. "Today" is today on the viewer's clock. Example: a Malaysian headline released at 6:30am Malaysia time on 22 Oct reads 11:30pm on 21 Oct in London, and a London viewer finds it under 21 Oct. Daylight-saving days are 23 or 25 hours long. This matches how publication times are shown (D-024). Only the ingestion schedule is fixed to Malaysia time. |
| MVP1-S5 | Dates are written `YYYY-MM-DD` in the URL. The date picker adds the viewer's time zone as `tz` (an IANA name such as `Europe/London`). This tells the server, which cannot see the viewer's clock, where the day starts, and lets a shared link show the sender's list. A link without a valid `tz` uses Malaysia time (`Asia/Kuala_Lumpur`). |
| MVP1-S6 | Filters and search make no GNews requests and use only parameterized queries through the existing Supabase client. |
| MVP1-S7 | An invalid filter value in the URL is ignored, and the feed behaves as if that filter were not set. No error page. |

## 4. Requirements by sprint

### MVP1.0 Single-day date filter

As built on 27 October 2026. MVP1.2 replaces the single-day picker, the earliest date and the empty message; see MVP1.2.

| ID | Requirement |
| --- | --- |
| MVP1.0-R1 | The feed page has a date picker for choosing one day. It is the browser's built-in date input (`<input type="date">`), so no calendar library is added. |
| MVP1.0-R2 | Dates before 1 January 2026 cannot be picked (they are greyed out by the browser). Dates after today, on the viewer's own clock, cannot be picked either. |
| MVP1.0-R3 | Picking a date shows only the headlines published on that day in the viewer's time zone (MVP1-S4), newest first, with the MVP0 pagination. |
| MVP1.0-R4 | The chosen date and time zone are stored in the URL as `?date=YYYY-MM-DD&tz=<time zone>`, together with `page` and `size`. Opening or reloading that URL shows the same results. |
| MVP1.0-R5 | When the chosen day has no headlines, the page shows a small drawing of a miner digging and the message "Our keyboard warriors are working hard to get your news." and no pagination. The drawing is inline SVG, not an image file or library. |
| MVP1.0-R6 | When a date is set, a "Show all dates" link returns to the unfiltered feed (page 1, same page size). Clearing the date input does the same. The link was removed in MVP1.1, replaced by "Clear all" (MVP1.1-R2). |
| MVP1.0-R7 | A `date` value that is not a real date in `YYYY-MM-DD` form, or is before 1 January 2026, is ignored (MVP1-S7). An unknown `tz` falls back to Malaysia time. A future date in the URL shows the R5 message. |
| MVP1.0-R8 | No database change. The existing `published_at` index serves the query. |
| MVP1.0-R9 | Unit tests cover reading `date` and `tz` from the URL and computing the day window, including the 23:59 and 00:00 edges and a daylight-saving day. |

**Acceptance criteria**

| Req | Given | When | Then |
| --- | --- | --- | --- |
| R1, R3 | Stored headlines on 20 and 21 Oct 2026 | Viewer picks 21 Oct 2026 | Only 21 Oct headlines are listed, newest first |
| R2 | The date picker is open | Viewer looks at December 2025 | Those days cannot be picked |
| R3, S4 | A viewer in Malaysia; headlines at 21 Oct 23:59 and 22 Oct 00:00 Malaysia time | Viewer picks 21 Oct | The first is listed, the second is not |
| R3, S4 | A viewer in Toronto; a headline at 21 Oct 9pm Malaysia time (9am Toronto) | Viewer picks 21 Oct | The headline is listed |
| R3, S2 | 120 headlines on one day, page size 50 | Viewer picks that day | 3 pages; page 3 holds 20 |
| R4 | `/?date=2026-10-21&tz=America%2FToronto&page=2&size=50` | Page opens | Same results as navigating there |
| S3 | Viewer is on page 3 of the full feed | Viewer picks a date | Page 1 of that day, same page size |
| S3 | A date is set | Viewer changes page size or page | The date stays set |
| R5 | A day with no stored headlines, e.g. 15 Mar 2026 | Viewer picks it | The miner drawing and "Our keyboard warriors are working hard to get your news." are shown, no pagination |
| R6 | A date is set | Viewer clicks "Show all dates" | Full feed, page 1, same page size |
| R7 | `/?date=2025-12-31` or `/?date=hello` | Page opens | Full feed, no error |

### MVP1.1 Results controls

| ID | Requirement |
| --- | --- |
| MVP1.1-R1 | A line above the results shows the range listed on the current page and the total matching the active filters, for example "Showing 51–100 of 340 headlines". A single result reads "Showing 1 of 1 headline". The line is hidden when nothing is listed. Q6, answered: option B. |
| MVP1.1-R2 | A "Clear all" button removes every filter, the sort and the search, and returns to page 1 of the full feed with the same page size. It appears only when something is set. It replaces the "Show all dates" link (MVP1.0-R6, MVP1.2-R6); emptying the date boxes still shows all dates and keeps the sort. |
| MVP1.1-R3 | A sort control offers "Newest first" (default) and "Oldest first" by `published_at`. `id` breaks ties in the same direction, so pages stay stable. |
| MVP1.1-R4 | Every filter, the sort and the search are stored in the URL: `date`, `from`, `to`, `source`, `country`, `sort`, `q`, plus `page` and `size`. Default values are left out. `sort=oldest` means oldest first. Each filter adds its own address value in its sprint: `date`, `from`, `to` (with `tz`) and `sort` are stored now; MVP1.3 adds `source`, MVP1.4 `country` and MVP1.6 `q`. An invalid value is ignored (MVP1-S7). |

Acceptance: the range and total match the database for a filtered day; "Clear all" from any filtered URL lands on `/?page=1&size=<size>`; oldest first on a day lists its earliest headline first; any filtered URL reloads to the same results.

### MVP1.2 Date range

| ID | Requirement |
| --- | --- |
| MVP1.2-R1 | "From" and "To" date inputs (the browser's built-in date input) select whole days in the viewer's time zone (MVP1-S4), inclusive at both ends. Stored in the URL as `from` and `to`, with `tz` (MVP1-S5). |
| MVP1.2-R2 | Either can be set alone: From alone means from that day onward; To alone means up to and including that day. Clearing both shows all dates. |
| MVP1.2-R3 | The earliest date that can be picked is the day, on the viewer's clock, of the oldest stored headline, read from the database on each page load, so it moves back as older headlines are added. Days after today on the viewer's clock are greyed out. A date in the URL outside these limits is still read, and shows the R5 message. |
| MVP1.2-R4 | If From is after To, the page shows a small drawing of the MVP1.0 miner, puzzled, beside a signpost whose "To" and "From" arrows are the wrong way round, with "From date must be on or before To date." It shows no results and no pagination until the dates are corrected. The drawing is inline SVG. |
| MVP1.2-R5 | When the range has no headlines, the page shows the MVP1.0 miner drawing and "Our keyboard warriors are working hard to add more news for you." and no pagination. |
| MVP1.2-R6 | The range replaces the single-day picker. A single day is From and To on the same date. Existing `?date=` links keep working and are read as `from=to=date`. A "Show all dates" link clears the range (page 1, same page size). The link was removed in MVP1.1, replaced by "Clear all" (MVP1.1-R2). |
| MVP1.2-R7 | A `from`, `to` or `date` value that is not a real date in `YYYY-MM-DD` form is ignored (MVP1-S7). |
| MVP1.2-R8 | No database change. Unit tests cover the range edges at midnight, a headline that falls on different days for London and Malaysia viewers, a daylight-saving day, From alone, To alone, From after To, `?date=` links, the Malaysia fallback for `tz` and invalid values. |

Acceptance: 19–21 Oct returns the three days' headlines and nothing from 18 or 22 Oct, in the viewer's time zone; a London viewer's 21 Oct includes a headline from 6:30am on 22 Oct Malaysia time; From 22 Oct and To 21 Oct shows the signpost drawing and message and no list; a range with no headlines shows the keyboard-warriors message; `/?date=2026-10-21` still works; the pickers do not allow days before the oldest headline's day or after today, both on the viewer's clock.

### MVP1.3 Source filter

| ID | Requirement |
| --- | --- |
| MVP1.3-R1 | A list of checkboxes, one per publisher name found in the stored `source` values, alphabetical. Watchtower keeps no publisher list of its own (D-026). |
| MVP1.3-R2 | Each name shows its headline count within the other active filters (for example, the chosen dates), so it shows how many headlines ticking it would add (Q5, Ben, 28 October 2026). |
| MVP1.3-R3 | Selecting several names shows headlines from any of them. Selecting none means all sources. Stored in the URL as repeated `source=` values. |
| MVP1.3-R4 | Counting by source needs one read-only database function (approval item A2). |

Acceptance: ticking two sources lists only their headlines; each count equals that source's matching headlines; an unknown `source=` value in the URL is ignored.

### MVP1.4 Country filter (held)

| ID | Requirement |
| --- | --- |
| MVP1.4-R1 | A country control shows Malaysia, selected and active, and Singapore, greyed out with "Coming soon" and not selectable. |
| MVP1.4-R2 | Needs a new `country` field on articles (approval item A1). New headlines get the country code from the GNews request (`my`). Existing headlines are set to `my`, since every request so far used `country=my`. |
| MVP1.4-R3 | Stored in the URL as `country=my`. |

Note: while Malaysia is the only country ingested, this filter changes no results, so it is held until a second country is ingested (Q7, Ben, 28 October 2026). Ingesting Singapore headlines is not part of MVP1 (D-007, backlog B-004).

### MVP1.5 Mobile filter sheet

| ID | Requirement |
| --- | --- |
| MVP1.5-R1 | On screens narrower than 640px, the filter controls are replaced by one "Filters" button. |
| MVP1.5-R2 | The button opens a bottom sheet holding the same controls, which behave as on desktop, plus a "Close" button. No animation library. |
| MVP1.5-R3 | At 640px and wider, the controls show inline as before. |

Acceptance: at 375px wide the controls are hidden behind the button and every filter works from the sheet; at 1024px the controls are inline and there is no button.

### MVP1.6 Keyword search

Approved: keyword search across collected news (D-002), headline text only (D-005). The rest are proposals carried forward from the v0.1 draft.

| ID | Requirement |
| --- | --- |
| MVP1.6-R1 | A search box on the feed page searches stored headline titles only. Query length 1 to 200 characters; a longer query is rejected with a short message. |
| MVP1.6-R2 | Matching uses Postgres full-text search, English configuration, `websearch_to_tsquery`: all words must match, quoted text matches as a phrase, and English word forms match ("bank" finds "banks"). |
| MVP1.6-R3 | Search combines with every active filter (all must match), and results follow the MVP1.1 sort. |
| MVP1.6-R4 | An expression index on `to_tsvector('english', title)` supports search. No new column (approval item A3). |
| MVP1.6-R5 | The query is stored in the URL as `q`. |
| MVP1.6-R6 | No matches shows "No headlines match your search." and a link to clear it. |

Acceptance: "Maybank raises dividend" is found by `maybank dividend`, not by `"dividend raises"`; "Banks cut rates" is found by `bank`; search plus a date returns only that day's matches; a 201-character query is rejected; logs show no GNews request from a search.

## 5. Approvals needed (data changes)

| # | Item | Needed by | Detail |
| --- | --- | --- | --- |
| A1 | `country` field on `articles` | MVP1.4 | New business-domain field, `text not null default 'my'`, and the GNews adapter writes the request's country. Held until Ben approves. |
| A2 | Source-count function | MVP1.3 | Migration adding a read-only Postgres function that returns each source and its headline count for the given filters. The Supabase client cannot group and count without it. |
| A3 | Search index | MVP1.6 | Migration adding the title full-text expression index. Raised when MVP1.6 is ready; it does not block earlier sprints. |

MVP1.0, MVP1.1, MVP1.2 and MVP1.5 need no database change.

## 6. Out of scope

- Story grouping across outlets, login-dependent features, CSV export (parked).
- Quick presets "Today" and "Last 7 days" (pending Ben's decision; low effort on top of MVP1.2).
- Highlighting matched words, search tips, autocomplete, saved searches, alerts, relevance sort, body-text search, semantic or vector search, AI answers, live GNews search.
- Ingesting any country other than Malaysia.
- Remembering filters between visits other than through the URL.
- Any change to ingestion, the backfill or the time display.

## 7. Open questions

Reply by number, for example "Q1 yes".

Answered on 27 October 2026: Q1 day boundary is the viewer's own time zone (MVP1-S4, confirmed again for MVP1.2 on 28 October); Q2 latest date is today; Q3 "Show all dates" link approved (removed in MVP1.1 on 28 October 2026, replaced by "Clear all").

Answered on 27 October 2026 for MVP1.2: Q4 the From and To pair replaces the single-day picker; Q8 the earliest date is the oldest stored headline's day, not 1 January 2026.

4. ~~Range and single day.~~ Answered: replace (MVP1.2-R6).
5. ~~Source counts.~~ Answered 28 October 2026: counts within the other active filters (MVP1.3-R2).
6. ~~Count wording.~~ Answered 28 October 2026: option B, "Showing 51–100 of 340 headlines" (MVP1.1-R1).
7. ~~Country filter value.~~ Answered 28 October 2026: hold MVP1.4 until a second country is ingested.
8. ~~Earliest date.~~ Answered: the oldest stored headline's day (MVP1.2-R3).
9. ~~PRD.~~ Answered: PRD-MVP1 updated to v0.3 to match this spec.

## 8. Change log

| Version | Date | Change |
| --- | --- | --- |
| 0.4.2 | 2026-10-28 | Ben approved MVP1.1. Q6 answered: the count line shows the range, "Showing 51–100 of 340 headlines". The web address stores only the filters that exist; later sprints add theirs. Invalid values stay ignored (MVP1-S7). "Clear all" replaces the "Show all dates" link. MVP1.1 built. |
| 0.4.1 | 2026-10-28 | Ben answered Q5 (source counts within the other active filters) and Q7 (country filter held until a second country is ingested). Q6 is handled in a separate session. |
| 0.4 | 2026-10-28 | Ben approved MVP1.2: From and To replace the single-day picker (Q4); earliest date is the oldest stored headline's day (Q8); empty message is now "Our keyboard warriors are working hard to add more news for you."; From after To shows a puzzled miner by a wrong-way signpost. Days and today stay the viewer's own, with `tz` in links (D-040 kept; a brief switch to Malaysia days for all viewers was reversed the same day). One branch per sub-sprint. MVP1.2 built ([pull request 7](https://github.com/benjamin-kee/fluffy-orca/pull/7)). |
| 0.3 | 2026-10-27 | Ben approved MVP1.0 with answers to Q1 to Q3: days follow the viewer's time zone (`tz` in the URL), latest date is today, "Show all dates" link. Empty day shows the miner drawing and the keyboard-warriors message. All sub-sprints on the `mvp1` branch. MVP1.0 built and merged. |
| 0.2-draft | 2026-10-27 | MVP1 widened to filtering and keyword search, split into sprints MVP1.0 to MVP1.6 from the 26 October sprint breakdown. Keyword search proposals from v0.1 moved into MVP1.6. |
| 0.1-draft | 2026-10-02 | Keyword search only. Retired. |
