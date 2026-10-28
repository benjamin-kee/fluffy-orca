---
id: SPEC-MVP1
prd: PRD-MVP1
prd_version: 0.2.1 (out of date: covers keyword search only, see open question Q9)
status: Draft
version: 0.2-draft
---

# MVP1 Specification: Filtering and Keyword Search

**Status:** Draft, for Ben's approval. Nothing in this file is approved for implementation yet. Sprint MVP1.0 can start as soon as Ben approves it; each later sprint starts only after Ben approves it.
**Last updated:** 2026-10-27
**Replaces:** the v0.1 keyword-search-only draft, now in `docs/specs/Retired/`. Its approved items (D-002 keyword search, D-005 headline text only) carry forward into MVP1.6.
**Source:** MVP1 sprint breakdown, draft of 26 October 2026.

## 1. Scope control

- This spec adds filters and keyword search to the existing MVP0 feed. It does not change ingestion, the backfill, the Article model, the time display rules (D-024) or the link rules (D-025).
- Filters and search read only the headlines Watchtower has already stored. They never call GNews.
- No new dependencies, search engines, services or UI libraries. Controls use plain HTML form elements.
- New database fields or migrations are allowed only where this spec lists them and Ben has approved them (section 5).
- Anything not written here is out of scope. If something outside it looks necessary, Claude Code stops and asks (see `CLAUDE.md`).

## 2. Sprints

Each sprint ships a working increment on top of the one before it, and is merged and deployed on its own.

| Sprint | Name | What ships | Depends on | Gate to start |
| --- | --- | --- | --- | --- |
| MVP1.0 | Single-day date filter | Pick one day; feed shows that day's headlines | MVP0 feed | Ben approves MVP1.0 |
| MVP1.1 | Results controls | Result count, clear all, newest or oldest sort, URL state for all filters | MVP1.0 | Ben approves MVP1.1 |
| MVP1.2 | Date range | From and To dates | MVP1.0 | Ben approves MVP1.2 |
| MVP1.3 | Source filter | Multi-select of publishers with headline counts | MVP1.1 | Ben approves MVP1.3 and approval item A2 |
| MVP1.4 | Country filter | Malaysia active, Singapore greyed out "Coming soon" | Approval item A1 | Held until A1 is approved |
| MVP1.5 | Mobile filter sheet | Filters behind one button and a bottom sheet on phones | MVP1.1 to MVP1.4 | Ben approves MVP1.5 |
| MVP1.6 | Keyword search | Search headline titles, combined with active filters | MVP1.1 and approval item A3 | Ben approves MVP1.6 and A3 |

MVP1.2 and MVP1.3 can run in either order. MVP1.6 can start once MVP1.1 is stable.

## 3. Rules shared by all sprints

| ID | Rule |
| --- | --- |
| MVP1-S1 | Results use the MVP0 feed item layout (headline, source, publication time) and open `article_url` in a new tab. |
| MVP1-S2 | Results use the MVP0 numbered pagination and the 50 or 100 page-size selector. The page count reflects only the matching headlines. |
| MVP1-S3 | Changing any filter, the sort or the search returns to page 1 and keeps the page size. Changing the page or page size keeps every filter. |
| MVP1-S4 | **A day is Malaysia time (UTC+08:00), midnight to midnight.** A headline belongs to day D when `published_at` is at or after D 00:00 +08:00 and before D+1 00:00 +08:00. The rule does not depend on the server's or the viewer's time zone. See Q1. |
| MVP1-S5 | Dates are written `YYYY-MM-DD` in the URL. |
| MVP1-S6 | Filters and search make no GNews requests and use only parameterized queries through the existing Supabase client. |
| MVP1-S7 | An invalid filter value in the URL is ignored, and the feed behaves as if that filter were not set. No error page. |

## 4. Requirements by sprint

### MVP1.0 Single-day date filter

| ID | Requirement |
| --- | --- |
| MVP1.0-R1 | The feed page has a date picker for choosing one day. It is the browser's built-in date input (`<input type="date">`), so no calendar library is added. |
| MVP1.0-R2 | Dates before 1 January 2026 cannot be picked (they are greyed out by the browser). Dates after today, in Malaysia time, cannot be picked either. See Q2. |
| MVP1.0-R3 | Picking a date shows only the headlines published on that Malaysia day (MVP1-S4), newest first, with the MVP0 pagination. |
| MVP1.0-R4 | The chosen date is stored in the URL as `?date=YYYY-MM-DD`, together with `page` and `size`. Opening or reloading that URL shows the same results. |
| MVP1.0-R5 | When the chosen day has no headlines, the page shows "No news for this date." and no pagination. |
| MVP1.0-R6 | When a date is set, a "Show all dates" link returns to the unfiltered feed (page 1, same page size). Clearing the date input does the same. See Q3. |
| MVP1.0-R7 | A `date` value that is not a real date in `YYYY-MM-DD` form, or is before 1 January 2026, is ignored (MVP1-S7). A future date in the URL shows "No news for this date." |
| MVP1.0-R8 | No database change. The existing `published_at` index serves the query. |
| MVP1.0-R9 | Unit tests cover reading the `date` value from the URL and computing the Malaysia day window, including a headline at 23:59 and at 00:00 Malaysia time. |

**Acceptance criteria**

| Req | Given | When | Then |
| --- | --- | --- | --- |
| R1, R3 | Stored headlines on 20 and 21 Oct 2026 | Viewer picks 21 Oct 2026 | Only 21 Oct headlines are listed, newest first |
| R2 | The date picker is open | Viewer looks at December 2025 | Those days cannot be picked |
| R3, S4 | A headline published 21 Oct 2026 23:59 MYT and one at 22 Oct 00:00 MYT | Viewer picks 21 Oct | The first is listed, the second is not |
| R3, S2 | 120 headlines on one day, page size 50 | Viewer picks that day | 3 pages; page 3 holds 20 |
| R4 | `/?date=2026-10-21&page=2&size=50` | Page opens | Same results as navigating there |
| S3 | Viewer is on page 3 of the full feed | Viewer picks a date | Page 1 of that day, same page size |
| S3 | A date is set | Viewer changes page size or page | The date stays set |
| R5 | A day with no stored headlines, e.g. 15 Mar 2026 | Viewer picks it | "No news for this date." is shown, no pagination |
| R6 | A date is set | Viewer clicks "Show all dates" | Full feed, page 1, same page size |
| R7 | `/?date=2025-12-31` or `/?date=hello` | Page opens | Full feed, no error |

### MVP1.1 Results controls

| ID | Requirement |
| --- | --- |
| MVP1.1-R1 | A line above the results shows the range listed on the current page and the total matching the active filters, for example "Showing 51–100 of 340 headlines". A single result reads "Showing 1 of 1 headline". The line is hidden when nothing is listed. Q6, answered: option B. |
| MVP1.1-R2 | A "Clear all" button removes every filter, the sort and the search, and returns to page 1 of the full feed with the same page size. It appears only when something is set. |
| MVP1.1-R3 | A sort control offers "Newest first" (default) and "Oldest first" by `published_at`. `id` breaks ties in the same direction, so pages stay stable. |
| MVP1.1-R4 | Every filter, the sort and the search are stored in the URL: `date`, `from`, `to`, `source`, `country`, `sort`, `q`, plus `page` and `size`. Default values are left out. `sort=oldest` means oldest first. |

Acceptance: X and Y match the database for a filtered day; "Clear all" from any filtered URL lands on `/?page=1&size=<size>`; oldest first on a day lists its earliest headline first; any filtered URL reloads to the same results.

### MVP1.2 Date range

| ID | Requirement |
| --- | --- |
| MVP1.2-R1 | "From" and "To" date inputs, each with the MVP1.0 limits, select whole Malaysia days, inclusive at both ends. Stored in the URL as `from` and `to`. |
| MVP1.2-R2 | Either can be set alone: From alone means from that day onward; To alone means up to and including that day. |
| MVP1.2-R3 | If From is after To, the page shows "From date must be on or before To date." and no results, until it is corrected. |
| MVP1.2-R4 | The range replaces the single-day picker. A single day is From and To on the same date. Existing `?date=` links keep working and are read as `from=to=date`. See Q4. |

Acceptance: 19–21 Oct returns the three days' headlines and nothing from 18 or 22 Oct; From 22 Oct and To 21 Oct shows the message and no list; `/?date=2026-10-21` still works.

### MVP1.3 Source filter

| ID | Requirement |
| --- | --- |
| MVP1.3-R1 | A list of checkboxes, one per publisher name found in the stored `source` values, alphabetical. Watchtower keeps no publisher list of its own (D-026). |
| MVP1.3-R2 | Each name shows its headline count within the other active filters (for example, the chosen dates). See Q5. |
| MVP1.3-R3 | Selecting several names shows headlines from any of them. Selecting none means all sources. Stored in the URL as repeated `source=` values. |
| MVP1.3-R4 | Counting by source needs one read-only database function (approval item A2). |

Acceptance: ticking two sources lists only their headlines; each count equals that source's matching headlines; an unknown `source=` value in the URL is ignored.

### MVP1.4 Country filter (held)

| ID | Requirement |
| --- | --- |
| MVP1.4-R1 | A country control shows Malaysia, selected and active, and Singapore, greyed out with "Coming soon" and not selectable. |
| MVP1.4-R2 | Needs a new `country` field on articles (approval item A1). New headlines get the country code from the GNews request (`my`). Existing headlines are set to `my`, since every request so far used `country=my`. |
| MVP1.4-R3 | Stored in the URL as `country=my`. |

Note: while Malaysia is the only country ingested, this filter changes no results. Ingesting Singapore headlines is not part of MVP1 (D-007, backlog B-004). See Q7.

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

1. **Day boundary.** The breakdown says "Malaysia midnight to midnight, per the viewer's time zone decision". These conflict: D-024 shows times in the viewer's time zone. Proposal: days are always Malaysia days (MVP1-S4). Side effect: a viewer outside Malaysia may see a headline under 21 Oct showing a local time on 20 or 22 Oct. Approve, or choose the viewer's own time zone?
2. **Latest pickable date.** Proposal: today in Malaysia time. The breakdown only names the earliest date.
3. **Getting back to all dates in MVP1.0.** Proposal: a "Show all dates" link, because "Clear all" only arrives in MVP1.1. Approve, or leave it out until MVP1.1?
4. **Range and single day.** Proposal: in MVP1.2 the From and To pair replaces the single-day picker. Or keep both?
5. **Source counts.** Proposal: counts within the other active filters. Or counts over all stored headlines?
6. **Count wording.** Answered 2026-10-28: option B, "Showing 51–100 of 340 headlines" (MVP1.1-R1).
7. **Country filter value.** With Malaysia only, MVP1.4 has no effect on results. Build it now as a placeholder, or hold it until a second country is ingested?
8. **Earliest date.** The picker allows 1 January 2026 (D-013), but stored history only reaches back about 30 days (late September 2026). Earlier days will show "No news for this date." Keep 1 January 2026?
9. **PRD.** PRD-MVP1 still describes keyword search only. Update it to match this spec (workflow A-22 has the PRD approved first)?

## 8. Change log

| Version | Date | Change |
| --- | --- | --- |
| 0.2-draft | 2026-10-27 | MVP1 widened to filtering and keyword search, split into sprints MVP1.0 to MVP1.6 from the 26 October sprint breakdown. Keyword search proposals from v0.1 moved into MVP1.6. |
| 0.1-draft | 2026-10-02 | Keyword search only. Retired. |
