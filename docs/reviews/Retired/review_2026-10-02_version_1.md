# Review 2026-10-02 v1: GNews, PRDs, specs, sync

Superseded by version 2 and 3. Supersedes review_2026-09-24_version_3 for numbering only. Items 27 to 37 from v3 remain open except where noted below.

Note 2026-10-02: named publishers and their feeds are removed from this log under D-026. GNews is the only news input (D-017).

## Changes since last review
- Researched PRD templates for agentic development. Written: PRD-Template.
- Written draft PRDs: PRD-MVP0 (GNews-based), PRD-MVP0.1, PRD-MVP1, PRD-Later.
- Written draft specs: SPEC-MVP0, SPEC-MVP0.1, SPEC-MVP1. Later has no spec by design.
- Written: Execution-Plan-GNews (steps, prompts for Github agent and Claude Code, sync system, cost).
- GNews facts verified 2026-10-02 from its docs, pricing, FAQ and Terms.

## Important findings
- **Free plan cannot back a public demo.** GNews says Free is for development and testing; published projects need a paid plan (Essential, €49.99 per month).
- **History to 1 Jan 2026 needs a paid plan.** Free gives 30 days and a 12 hour delay. Paid gives data from 2020 in real time.
- **Terms to confirm.** Reasonable caching is allowed. Building a database to compete, redistribute or avoid limits is barred. Storing headline metadata for a feed is probably fine but not stated.
- **Coverage is unproven.** No source filter, country means publisher country, Top Headlines is a ranked subset. A one-day coverage test decides.
- **The repo spec has moved.** docs/specs/MVP0.md now carries approved changes 1 to 4 (no progressive loading, new time display, cleaned article URLs, sources changed to two named publisher feeds). None of these is in the decision log. My earlier progress line (milestones 1 to 3, first publisher adapter next) is probably stale.

## Items for approval
Reply by number: 38 approve, 41 edit: ..., 44 reject.

38. **GNews replaces RSS for MVP0 ingestion.** You directed this. Approve to log it as D-017. Replaces item 30.
39. **Query strategy (GN-Q1).** Proposal: run a one-day coverage test on the Free plan, start with Top Headlines category=business&country=my&lang=en, add a Search query only if volume is low.
40. **Retire the publisher RSS adapters.** Keep the NewsSource interface. Mixing RSS and GNews would create cross-source duplicates.
41. **Plan path (GN-Q2, GN-Q3).** Proposal: develop on Free, backfill during the 10-day trial, move to Essential monthly when the demo goes public, cancel when not showing it. Email <contact@gnews.io> to confirm storing headline metadata.
42. **Adopt PRD-Template** as the standard for all Watchtower PRDs.
43. **Accept PRD-MVP0 and SPEC-MVP0 as the basis** for approved change 5 in the repo spec. Nothing is written to the repo until you say so.
44. **Keep PRD-MVP0.1, PRD-MVP1, PRD-Later and their specs as drafts.** Proposals only, no decisions logged. MVP1 R1 and R2 stay approved.
45. **Sync system.** Repo is the single source of truth. A script and GitHub Action regenerate docs/roadmap.md and docs/roadmap.csv from PRD frontmatter and check PRD to spec traceability. Google Sheet reads the CSV. Specs are flagged, never auto-edited. Also add one line to CLAUDE.md: Draft specs are not approved.
46. **Log repo approved changes 1 to 4 as decisions** (D-018 to D-021) so the decision log matches the repo spec. Item 4 (sources) is superseded by item 38 if approved.

## Still open from v3
27 single source of truth (item 45 extends it), 28 login, 31 history (now answered: paid plan backfill, see 41), 34 scheduler, 35 backlog merge, 36 merge branch to main, 37 Specwright read-only. Items 29, 30, 32, 33 mostly overtaken by the repo spec and item 38; reply if you want any logged anyway.

## Needed from Ben
- GNews account and key. Never paste the key into chat.
- Confirm Github agent: Watchtower can open pull requests on benjamin-kee/fluffy-orca.
