# Execution Plan: MVP1 Filtering and Keyword Search

**Status:** Approved for MVP1.0 on 27 October 2026. MVP1.0 built and merged ([pull request 5](https://github.com/benjamin-kee/fluffy-orca/pull/5)).
**Date:** 2026-10-27
**Spec:** [SPEC-MVP1 v0.3](../specs/SPEC-MVP1.md)

## 1. How each sprint runs

1. Ben approves the sprint in SPEC-MVP1 (and any data change it needs, spec section 5).
2. Claude Code builds the sprint on the `mvp1` branch, brought up to date with `main` first.
3. Before pushing: typecheck, unit tests and a production build pass.
4. Claude Code opens a pull request. Vercel builds a preview of the branch for Ben to try.
5. Ben approves and merges. Vercel deploys `main` to <https://watchtower01.vercel.app>.
6. Claude Code checks the live site and updates Current-Status.

All MVP1 sub-sprints share the `mvp1` branch (Ben, 27 October 2026). MVP2 is built on its own `mvp2` branch.

## 2. MVP1.0 result

Built, tested against the live data in a browser set to Toronto time, merged to `main` and deployed by Vercel on 27 October 2026. Vercel builds a preview for each pull request.

## 3. MVP1.0 plan as approved: single-day date filter in 2 hours

The target is achievable because MVP1.0 needs no database change and no new dependency, and reuses the existing feed, pagination and page-size code.

| Time | Step | Files |
| --- | --- | --- |
| 0:00–0:10 | Create the branch from `main`, install, confirm the current tests pass | — |
| 0:10–0:35 | Date helper: read and check `date` from the URL; compute the Malaysia day window (start at 00:00 +08:00, end at the next day's 00:00 +08:00); "today" in Malaysia for the picker's upper limit. Unit tests, including 23:59 and 00:00 MYT | `src/lib/dateFilter.ts`, `tests/dateFilter.test.ts` |
| 0:35–0:55 | Repository: `listArticles` and `countArticles` take an optional date window (`published_at >= start and < end`) | `src/lib/articleRepository.ts` |
| 0:55–1:25 | Feed page: read `date`; date picker component; links for pages and page size carry `date`; picking a date goes to page 1; "No news for this date."; "Show all dates" link | `src/app/page.tsx`, `src/lib/pagination.ts`, `src/components/DateFilter.tsx`, `src/components/PageSizeSelect.tsx`, `src/components/Pagination.tsx`, `src/app/globals.css` |
| 1:25–1:40 | Typecheck, tests, production build. Walk through each MVP1.0 acceptance criterion | — |
| 1:40–1:50 | Commit, push, open the pull request | — |
| 1:50–2:00 | Ben tries the Vercel preview, then merges | Ben |

**Risks to the 2 hours**

- **Off-by-one day.** Vercel servers run in UTC. The window is built from the viewer's `tz` in the URL, never the server's local time, and the tests pin the midnight edges and a daylight-saving day.
- **Testing against real data.** This build environment has no Supabase keys, so real-data checks happen on the Vercel preview. Unit tests cover the date logic before that.
- **Browser date picker looks differ.** Chrome, Safari and Firefox each draw their own calendar. All of them respect the earliest and latest dates. No styling work is planned.
- **Approval wait.** The clock starts once Ben approves MVP1.0 and the docs branch is merged.

## 4. Later sprints

Estimates are rough and unverified.

| Sprint | Main work | Data change | Estimate |
| --- | --- | --- | --- |
| MVP1.1 | Count line, "Clear all", sort control, one shared reader and writer for all filter values in the URL | None | 2–3 hours |
| MVP1.2 | From and To inputs replacing the single-day picker; From-after-To message; old `?date=` links still work | None | 2 hours |
| MVP1.3 | Source checkboxes with counts; read-only count function | A2 (migration `0004`) | 3 hours |
| MVP1.4 | `country` column, adapter writes it, Malaysia/Singapore control | A1 (migration) | 2 hours, held |
| MVP1.5 | "Filters" button and bottom sheet below 640px, plain CSS | None | 2–3 hours |
| MVP1.6 | Search box, full-text match combined with filters, `q` in the URL | A3 (migration) | 3–4 hours |

Each migration is a new numbered file in `supabase/migrations/`, run in the Supabase SQL editor as the README describes, only after Ben approves it.

## 5. Done means

For every sprint: the acceptance criteria in SPEC-MVP1 pass, typecheck, tests and build are clean, Ben has approved the pull request, it is live, and Current-Status is updated. Optionally, Specwright audits the sprint against the spec.

## 6. Answered questions

- **Q-A.** Develop MVP1.0 and deploy it as soon as possible. Done.
- **Q-B.** New branches approved: `mvp1` for every MVP1 sub-sprint, `mvp2` for MVP2.
