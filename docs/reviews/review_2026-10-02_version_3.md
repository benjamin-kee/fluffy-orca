# Review 2026-10-02, version 3

> Historical review record from the planning project, imported 27 October 2026. Items 66 to 69 were overtaken by the build: MVP0 follows `docs/specs/MVP0.md` (approved changes 1 to 6), runs every 3 hours, and is live. See `docs/start-here/Current-Status.md`.

Replies to your 22:25 message are applied. Reply by item number, for example "66 approve".

## What changed since version 2
- D-023 to D-030 logged (full-page loading, time display, link handling, publishers as GNews returns them, no login in MVP0, SPEC v2.0 approved, Research agent, PRD wording).
- PRD-MVP0 is v0.3. SPEC-MVP0 is v2.1 draft. All four PRDs are now in the same Word format; Markdown copies are in Product/PRDs/.
- Publisher names removed from live docs and from the old review logs. A banner note on those logs says so.
- Roadmap workbook refreshed: 15 minute cadence maths, 12-step MVP0 plan, decisions to item 69.

## Replies applied
- 46 approved and logged as D-026.
- 47 applied: "Out of scope" heading, cadence added to scope, reproducibility metric removed, title stored as returned, spike renamed coverage test, login moved to the roadmap.
- 48 SPEC-MVP0 v2.0 approved (D-028). v2.1 holds the 47 edits and awaits item 66.
- 49 done. 50 research report written (see item 69).

## Items for you
**66. Confirm PRD-MVP0 v0.3 and SPEC-MVP0 v2.1.** Needed before anything goes to the repo.

**67. Request cadence.** Options: 15 minutes (96 requests a day, 4 spare on Free, recommended), hourly (24 a day), or 14.4 minutes (exactly 100, no spare, and cron cannot run fractional minutes). Free plan also lags 12 hours, so faster runs add little new content there.

**68. Where does login go?** Proposal: MVP0.2, before public release. Not in MVP0 (D-027).

**69. Assess the tracking research** in Research/User-Behaviour-Tracking.md. Proposal: PostHog Cloud free tier, explicit headline_click and headline_impression_batch events, as a milestone MVP0.2 "Usage Signals". Nothing is added to MVP0. Spot check: PostHog free allowance of 1M events and 5K recordings confirmed against the vendor page. Correction to the report: free recording retention is 1 month, events 1 year (the report says 1 year for both). Other vendors' figures remain unverified as the report states. Privacy points are not legal advice.

## Change requests from another agent (not applied)
Research/fs-review file Review/fs-review_2026-10-02_SPEC-MVP0.md contains FS-50 to FS-65. They use an FS- prefix because the numbers 50 to 65 clash with your items. FS-52 (request budget) and FS-53 (paging) are largely overtaken by spec R5 and R9. The rest are untouched. Reply "FS-51 approve" style to take any of them.

## Needed from you
- Create the Research agent chat by hand: steps are in Agents/Research-Agent.md. I cannot create a chat inside a project.
- Never paste the GNews key into chat or git.
- Confirm Github agent: Watchtower can open pull requests on the repo.
