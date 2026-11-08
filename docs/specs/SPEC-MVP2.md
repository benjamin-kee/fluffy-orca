---
id: SPEC-MVP2
prd: PRD-MVP2
prd_version: 0.3.1
status: Draft
version: 0.4-draft
---

# MVP2 Specification: UI/UX Improvements

**Status:** Draft, for Ben's approval. Nothing here is approved for implementation yet. Formerly SPEC-MVP0.1, renamed on 27 October 2026 (D-038).
**Last updated:** 2026-11-08
**Implements:** PRD-MVP2 v0.3
**Platform:** web first, mobile friendly ([Product-Principles](../product/Product-Principles.md) P-1, D-041). Design options and reviews start from the desktop browser, then are checked at phone width (R1, R4); the mobile Lighthouse targets (R12) stay as the phone-friendliness check.
**Branch:** `mvp2`, created from `main`. One pull request into `main` per step in section 6.

## 1. Scope control

- MVP2 changes how Watchtower looks and feels. It does not change what is stored, how ingestion works, or how filters and search behave.
- Approved specs stay in force: `docs/specs/MVP0.md` (feed, time display, links), the approved and built parts of `docs/specs/SPEC-MVP1.md` (MVP1.0 to MVP1.3 and MVP1.6), and [Product-Principles](../product/Product-Principles.md) P-1 and P-2. MVP2 restyles what is live (section 1.1) and must keep its behaviour.
- No new npm packages, component libraries, CSS frameworks, animation libraries, fonts from new services, or data fields without Ben's approval. Plain CSS in `src/app/globals.css` (or CSS modules) is enough.
- Anything not written here is out of scope. If something outside it looks necessary, stop and ask Ben (see `CLAUDE.md`).

### 1.1 What is live on `main` (8 November 2026)

MVP2 restyles everything below. Each item keeps the behaviour its MVP1 requirement sets.

| Part of the feed page | Behaviour to keep | Source |
| --- | --- | --- |
| Search box | Searches headline titles, 1 to 200 characters, stored as `q` | MVP1.6-R1 to R5 |
| From and To date pickers | Whole days in the viewer's time zone, stored as `from`, `to` and `tz`; old `?date=` links still work | MVP1.2, MVP1-S4, S5 |
| Sort control | "Newest first" (default) or "Oldest first", stored as `sort=oldest` | MVP1.1-R3 |
| Page-size selector | 50 or 100, stored as `size` | MVP0, MVP1-S2 |
| "Sources" dropdown | Button reads "Sources: All", the chosen name or "Sources: N selected"; closed by default; scrolling list of publishers with headline counts that follow the dates and the search; order switch between most headlines first (default) and A–Z (P-2); closes on a click outside or Escape; stored as repeated `source` values | MVP1.3-R1 to R3, P-1 |
| "Clear all" button | Shown only when something is set; returns to page 1 of the full feed with the same page size | MVP1.1-R2 |
| Count line | "Showing 51–100 of 340 headlines", hidden when nothing is listed | MVP1.1-R1 |
| Feed list and pagination | Headline, source and time; numbered pages | MVP0, MVP1-S1, S2 |

Messages and drawings shown instead of the list:

| When | What shows | Source |
| --- | --- | --- |
| The chosen dates or sources have no headlines | Miner digging, "Our keyboard warriors are working hard to add more news for you." | MVP1.2-R5 |
| From is after To | Puzzled miner by a back-to-front signpost, "From date must be on or before To date." | MVP1.2-R4 |
| A search finds nothing on dates that have headlines | Puzzled miner with a magnifying glass, a message that repeats the search and the dates, and a "Clear search" link | MVP1.6-R6, R7 |
| A search is over 200 characters | "Search is limited to 200 characters." | MVP1.6-R1 |
| No headlines stored at all | "No headlines yet." | MVP0 |
| Loading fails | "Headlines could not be loaded. Please try again later." (MVP2-R3 adds "Try again") | MVP0 |

## 2. Working alongside MVP1

MVP1.0 to MVP1.3 and MVP1.6 are built and merged. MVP1.4 (country filter) is held, and MVP1.5 (mobile filter sheet) is a draft. Both MVP1.5 and MVP2 change the phone layout of the same controls, so Ben decides their order first (Q5).

- Bring `main` into `mvp2` (merge, no rebase) before starting each step and before each pull request.
- Do not edit `src/lib/dateFilter.ts`, `src/lib/search.ts`, `src/lib/sort.ts`, `src/lib/sourceFilter.ts`, `src/lib/articleRepository.ts` or `src/lib/pagination.ts` except where a requirement below needs it, and then keep their behaviour and tests unchanged.
- Any MVP1 control that reaches `main` while MVP2 is in progress gets the MVP2 design in the next MVP2 step (MVP2-R11).

## 3. Requirements

All are proposals until Ben approves them.

| ID | Requirement | Implements |
|---|---|---|
| MVP2-R1 | Before any visual code, produce two or three design options for the feed page (desktop and phone, light and dark), as static HTML pages or screenshots. Ben picks one. Every later requirement follows the chosen option. | PRD R1 |
| MVP2-R2 | The feed renders as a semantic list. The headline is the largest text; source and time are secondary. Type and spacing follow a defined scale (CSS custom properties). | F1 |
| MVP2-R3 | The feed shows a loading skeleton while data loads (Next.js `loading.tsx`), an empty state when there are no headlines at all, and an error state with a "Try again" link when loading fails. The MVP1 messages and drawings in section 1.1 keep their wording and are restyled. | F2 |
| MVP2-R4 | Layouts are designed at desktop width (about 1280px) first and checked at 375px (P-1). They work from 320px to 1440px wide with no horizontal scroll, and on phones every interactive element, including the date pickers and the Sources dropdown, is at least 44px tall to tap. Long lists stay behind a closed dropdown on every screen size (P-1). | F3 |
| MVP2-R5 | Every interactive element is reachable by keyboard in reading order and shows a visible focus ring. The Sources dropdown opens and closes from the keyboard and closes on Escape. Text contrast is at least 4.5:1 in both themes. | F4 |
| MVP2-R6 | The theme follows `prefers-color-scheme`. No manual toggle. All three miner drawings stay readable in dark mode. | F5 |
| MVP2-R7 | The page shows "Updated N minutes ago", from the newest `ingested_at` in the database. No new field. | F6 |
| MVP2-R8 | When newer headlines exist than those shown, a notice "N new headlines" appears. The page checks every 5 minutes through one small read-only endpoint. The notice reloads the feed only when clicked and never moves the list on its own. Held until Ben answers Q3. | F7 |
| MVP2-R9 | The chosen page size is saved in the browser and used when a link has no `size`. A `size` in the link always wins. | F8 |
| MVP2-R10 | A footer says that headlines are provided via GNews and that articles belong to their publishers. | F9 |
| MVP2-R11 | Every control in section 1.1 (search box, From and To pickers, sort, page size, Sources dropdown, "Clear all", count line, pagination), and any MVP1 control added later, uses the chosen design, with unchanged behaviour. | F10 |
| MVP2-R12 | Lighthouse mobile scores at least 90 for performance and 95 for accessibility on the feed page, and CLS stays under 0.1. JavaScript for the feed page stays under 150 KB gzipped. | Metrics |

## 4. Acceptance criteria

| Req | Given | When | Then |
|---|---|---|---|
| R1 | No design chosen yet | Work starts | Two or three options are shown to Ben and no visual code is merged before he picks one |
| R3 | The database is slow | Page loads | Skeleton rows show before the headlines arrive |
| R3 | The database query fails | Page loads | Error state with "Try again" shows, no stack trace |
| R3 | Dates with no headlines, From after To, or a search with no match | Page loads | The matching miner drawing and message from section 1.1 show in the new design, with the same wording |
| R4 | A 1280px desktop browser | Page loads | The layout is the chosen desktop design, not a stretched phone layout |
| R4 | A 320px-wide phone | Viewer scrolls the feed, opens the date pickers and the Sources dropdown | No horizontal scroll; every control is easy to tap |
| R5 | A keyboard-only user | Tabs through the page | Search box, From, To, sort, page size, Sources, "Clear all", every headline and every page link get focus in reading order, with a visible ring; Escape closes the Sources dropdown |
| R6 | The device is set to dark | Page loads | The dark theme is used, text contrast is at least 4.5:1 and the miner drawings are readable |
| R7 | The last ingestion was 40 minutes ago | Page loads | "Updated 40 minutes ago" shows |
| R8 | The viewer is on page 1 and new headlines arrive | 5 minutes pass | The notice appears; the list does not move until it is clicked |
| R9 | Page size 100 was chosen | The viewer returns the next day to `/` | Page size is 100 |
| R9 | Page size 100 is saved | The viewer opens a link with `size=50` | Page size is 50 |
| R11 | A search, a date range, a sort and two sources are set | The viewer pages, changes page size, and clicks "Clear all" | Behaviour matches MVP1 exactly; the existing tests still pass |
| R12 | Production build | Lighthouse mobile runs on the feed page | Scores meet the targets |

## 5. Out of scope

New filters, search, sort controls or any change to filter behaviour (MVP1). Accounts and login. Article images, summaries and source logos. A manual theme toggle. Animations beyond simple CSS transitions. New data, new sources, AI.

## 6. Delivery steps

Each step is one pull request into `main`, with typecheck, tests and a production build clean, checked on the Vercel preview, and merged after Ben approves.

| Step | Contents | Gate |
|---|---|---|
| 1 | Design options (R1) | Ben picks one |
| 2 | Design tokens, type and spacing scale, themes, feed list and controls (R2, R5, R6, R11) | Ben approves the pull request |
| 3 | Loading, empty and error states; responsive layout and touch targets (R3, R4) | Ben approves |
| 4 | Freshness line, page size memory, footer (R7, R9, R10) | Ben approves |
| 5 | New-headlines notice (R8), only if Ben keeps it after Q3 | Ben approves |
| 6 | Lighthouse check and fixes (R12) | Scores recorded in the pull request |

## 7. Open questions

Reply by number.

1. **Design references.** Which business-news sites or apps should the design options draw on? Proposal: three well-known business-news layouts, chosen by Ben.
2. **Brand.** Neutral for now, or a Watchtower name style, logo and colour? Proposal: neutral.
3. **New-headlines notice (R8).** It needs a small read-only endpoint and a check every 5 minutes. Keep it in MVP2, or move it to the backlog?
4. **Targets.** Keep the Lighthouse targets of 90 and 95?
5. **MVP1.5 or MVP2 first.** MVP1.5 (mobile filter sheet) and MVP2-R4 both change how the controls look on a phone. Proposal: build MVP2 first and design the filter sheet inside MVP2's chosen design, so the phone layout is designed once.

## 8. Future Roadmap Considerations

<!-- future-roadmap-considerations: SPEC-MVP2 -->

Ideas outside MVP2 that are not approved for any milestone. Nothing here is a requirement.

Convention: see [docs/README.md](../README.md#future-roadmap-considerations). IDs are never reused or renumbered; "Backlog" holds the `B-` number once the item is copied into the [Backlog](../roadmap-and-decisions/Backlog.md).

| ID | Item | Why it came up | Source | Raised | Backlog |
| --- | --- | --- | --- | --- | --- |
| FRC-SPEC-MVP2-01 | A manual light/dark theme switch | MVP2 follows the device setting only | Section 5 | 2026-10-27 | |
| FRC-SPEC-MVP2-02 | Publisher logos next to headlines | Out of scope; needs a logo source and licensing check | Section 5 | 2026-10-27 | |
| FRC-SPEC-MVP2-03 | Article images and summaries | Out of scope; Watchtower stores headline metadata only (licensing) | Section 5 | 2026-10-27 | |
| FRC-SPEC-MVP2-04 | Richer animations than simple CSS transitions | Out of scope | Section 5 | 2026-10-27 | |

Related: a date picker styled to the chosen design is listed as FRC-SPEC-MVP1-10.

## 9. Change log

- 0.4-draft (2026-11-08): Refreshed to match what is live, at Ben's request. New section 1.1 lists the live controls and messages (MVP1.0 to MVP1.3 and MVP1.6). "Show all dates" and the MVP1.0 empty-day wording removed (replaced in MVP1.1 and MVP1.2). R3 to R6, R11 and their acceptance criteria now cover the search box, From and To, sort, the Sources dropdown and "Clear all". R4 follows P-1 (desktop first, checked at 375px). Section 2 updated for the MVP1 sprints still open. Q5 added: MVP1.5 or MVP2 first. Still a draft.
- 0.3.2-draft (2026-11-08): Platform line added: web first, mobile friendly (D-041, Product-Principles P-1).
- 0.3.1-draft (2026-11-06): Added section 8, Future Roadmap Considerations, at Ben's request (convention in docs/README.md). No requirement changed.
- 0.3-draft (2026-10-27): Renamed from SPEC-MVP0.1 to SPEC-MVP2 and placed after MVP1. Added the design-option step (R1), the MVP1 controls (R11), the empty-day miner, page-size precedence, working alongside MVP1, delivery steps, and the `mvp2` branch.
- 0.1-draft (2026-10-02): First draft as SPEC-MVP0.1.
