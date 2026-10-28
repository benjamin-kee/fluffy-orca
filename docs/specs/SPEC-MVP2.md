---
id: SPEC-MVP2
prd: PRD-MVP2
prd_version: 0.3
status: Draft
version: 0.3-draft
---

# MVP2 Specification: UI/UX Improvements

**Status:** Draft, for Ben's approval. Nothing here is approved for implementation yet. Formerly SPEC-MVP0.1, renamed on 27 October 2026 (D-038).
**Last updated:** 2026-10-27
**Implements:** PRD-MVP2 v0.3
**Branch:** `mvp2`, created from `main`. One pull request into `main` per step in section 6.

## 1. Scope control

- MVP2 changes how Watchtower looks and feels. It does not change what is stored, how ingestion works, or how filters and search behave.
- Approved specs stay in force: `docs/specs/MVP0.md` (feed, time display, links) and the approved parts of `docs/specs/SPEC-MVP1.md` (MVP1.0 date filter: viewer's time zone, `date` and `tz` in the URL, "Show all dates", the miner drawing and "Our keyboard warriors are working hard to get your news." for an empty day). MVP2 restyles these and must keep their behaviour.
- No new npm packages, component libraries, CSS frameworks, animation libraries, fonts from new services, or data fields without Ben's approval. Plain CSS in `src/app/globals.css` (or CSS modules) is enough.
- Anything not written here is out of scope. If something outside it looks necessary, stop and ask Ben (see `CLAUDE.md`).

## 2. Working alongside MVP1

MVP1 sub-sprints (MVP1.1 onward) may be built at the same time on the `mvp1` branch. Both touch `src/app/page.tsx`, `src/components/` and `src/app/globals.css`.

- Bring `main` into `mvp2` (merge, no rebase) before starting each step and before each pull request.
- Do not edit `src/lib/dateFilter.ts`, `src/lib/articleRepository.ts` or `src/lib/pagination.ts` except where a requirement below needs it, and then keep their behaviour and tests unchanged.
- Any MVP1 control that reaches `main` while MVP2 is in progress gets the MVP2 design in the next MVP2 step (MVP2-R11).

## 3. Requirements

All are proposals until Ben approves them.

| ID | Requirement | Implements |
|---|---|---|
| MVP2-R1 | Before any visual code, produce two or three design options for the feed page (desktop and phone, light and dark), as static HTML pages or screenshots. Ben picks one. Every later requirement follows the chosen option. | PRD R1 |
| MVP2-R2 | The feed renders as a semantic list. The headline is the largest text; source and time are secondary. Type and spacing follow a defined scale (CSS custom properties). | F1 |
| MVP2-R3 | The feed shows a loading skeleton while data loads (Next.js `loading.tsx`), an empty state when there are no headlines at all, and an error state with a "Try again" link when loading fails. An empty day keeps the MVP1.0 miner drawing and message, restyled. | F2 |
| MVP2-R4 | Layouts work from 320px to 1440px wide with no horizontal scroll, and every interactive element, including the date picker, is at least 44px tall to tap. | F3 |
| MVP2-R5 | Every interactive element is reachable by keyboard in reading order and shows a visible focus ring. Text contrast is at least 4.5:1 in both themes. | F4 |
| MVP2-R6 | The theme follows `prefers-color-scheme`. No manual toggle. The miner drawing stays readable in dark mode. | F5 |
| MVP2-R7 | The page shows "Updated N minutes ago", from the newest `ingested_at` in the database. No new field. | F6 |
| MVP2-R8 | When newer headlines exist than those shown, a notice "N new headlines" appears. The page checks every 5 minutes through one small read-only endpoint. The notice reloads the feed only when clicked and never moves the list on its own. Held until Ben answers Q3. | F7 |
| MVP2-R9 | The chosen page size is saved in the browser and used when a link has no `size`. A `size` in the link always wins. | F8 |
| MVP2-R10 | A footer says that headlines are provided via GNews and that articles belong to their publishers. | F9 |
| MVP2-R11 | Every MVP1 control on `main` (the date picker, "Show all dates", the page-size selector, pagination, and any later MVP1 controls) uses the chosen design, with unchanged behaviour. | F10 |
| MVP2-R12 | Lighthouse mobile scores at least 90 for performance and 95 for accessibility on the feed page, and CLS stays under 0.1. JavaScript for the feed page stays under 150 KB gzipped. | Metrics |

## 4. Acceptance criteria

| Req | Given | When | Then |
|---|---|---|---|
| R1 | No design chosen yet | Work starts | Two or three options are shown to Ben and no visual code is merged before he picks one |
| R3 | The database is slow | Page loads | Skeleton rows show before the headlines arrive |
| R3 | The database query fails | Page loads | Error state with "Try again" shows, no stack trace |
| R3 | A day with no headlines is picked | Page loads | The miner drawing and the keyboard-warriors message show in the new design |
| R4 | A 320px-wide phone | Viewer scrolls the feed and opens the date picker | No horizontal scroll; every control is easy to tap |
| R5 | A keyboard-only user | Tabs through the page | Date picker, page-size selector, every headline and every page link get focus in reading order, with a visible ring |
| R6 | The device is set to dark | Page loads | The dark theme is used and text contrast is at least 4.5:1 |
| R7 | The last ingestion was 40 minutes ago | Page loads | "Updated 40 minutes ago" shows |
| R8 | The viewer is on page 1 and new headlines arrive | 5 minutes pass | The notice appears; the list does not move until it is clicked |
| R9 | Page size 100 was chosen | The viewer returns the next day to `/` | Page size is 100 |
| R9 | Page size 100 is saved | The viewer opens a link with `size=50` | Page size is 50 |
| R11 | A date is picked | The viewer pages, changes page size, and clicks "Show all dates" | Behaviour matches MVP1.0 exactly; the existing tests still pass |
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

## 8. Change log

- 0.3-draft (2026-10-27): Renamed from SPEC-MVP0.1 to SPEC-MVP2 and placed after MVP1. Added the design-option step (R1), the MVP1 controls (R11), the empty-day miner, page-size precedence, working alongside MVP1, delivery steps, and the `mvp2` branch.
- 0.1-draft (2026-10-02): First draft as SPEC-MVP0.1.
