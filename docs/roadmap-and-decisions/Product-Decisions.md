# Product Decisions Log

Chronological log of approved decisions only. Sources: D-001 to D-016 from review_2026-09-24_version_1. D-017 to D-030 from Ben's replies on 2026-10-02. D-038 to D-040 from Ben's instructions on 2026-10-27.

Imported into the repo on 27 October 2026 from the Google Doc of the same name, unchanged. Where a decision mentions SPEC-MVP0 or its requirement numbers (R20, R22 and so on), it means the v2.1 draft, which is now retired in `docs/specs/Retired/`. The built spec is `docs/specs/MVP0.md`.

Several decisions below no longer match what was built. Proposed amendments and new decisions are in **Awaiting sign-off** at the end. They are not decisions until Ben signs them off. Once signed off, each one is folded into the table and removed from that section.

## Approved decisions

| ID | Date | Decision | Rationale | Implications | Deferred alternatives |
| --- | --- | --- | --- | --- | --- |
| D-001 | 2026-09-24 | MVP0 scope as defined in the Watchtower workspace instructions is approved | Establishes an authoritative baseline | Now carried by SPEC-MVP0 (see D-021) | |
| D-002 | 2026-09-24 | MVP1 approved scope is "keyword search across collected news". Amended 2026-10-27: MVP1 is filtering and keyword search (D-039) | Only defined element so far | Other search behaviour stays open | |
| D-003 | 2026-09-24 | Milestone order: MVP0, MVP0.1, MVP1, later releases. Amended 2026-10-27: MVP0, MVP1, MVP2 (formerly MVP0.1), later releases (D-038) | Dashboard delivers value before search | Recorded in the Roadmap | Search first (earlier notes) |
| D-004 | 2026-09-24 | The Roadmap doc is the roadmap; Google Sheet optional for task tracking | One roadmap location | Backlog item B-006 | Google Sheet as roadmap |
| D-005 | 2026-09-24 | MVP1 search covers headline text only | MVP0 stores headline metadata only | Body-text search in backlog (B-002) | Ingest article text for MVP1 |
| D-006 | 2026-09-24 | Build the dashboard (MVP0) before search (MVP1) | Resolves conflict with earlier notes | Same as D-003 | Search first |
| D-007 | 2026-09-24 | Malaysia is the starting market | Matches MVP0 scope | Wider Asia in backlog (B-004) | Asia-wide from launch |
| D-008 | 2026-09-24 | Near term, Watchtower is a news product. Investment due-diligence platform is the long-term direction, recorded in the vision doc only | Keeps MVP scope tight | Due-diligence features stay out of MVP specs | |
| D-009 | 2026-09-24 | Viewer toggles 50 or 100 headlines per page; default 50 | Resolves ambiguity | MVP0 pagination requirement | Fixed page size |
| D-010 | 2026-09-24 | Duplicate = same URL. Amended 2026-10-02: with GNews the duplicate key is the GNews article id, with the cleaned URL as fallback (D-021) | Simple, reliable for MVP0 | Content-based dedup in backlog (B-001) | Headline or story matching |
| D-011 | 2026-09-24 | "Article metadata" stays a future idea until defined | Undefined term | Backlog B-003 | |
| D-012 | 2026-09-24 | Publication times shown in viewer's local time. Amended 2026-10-02: items under 24 hours old show elapsed time (D-024) | Viewer preference | Detailed display rule in SPEC-MVP0 | Malaysia time (MYT) |
| D-013 | 2026-09-24 | Historical coverage starts 1 January 2026 | Enough history to make the feed and search meaningful | Needs a paid GNews plan or the 10-day trial for the backfill | |
| D-014 | 2026-09-24 | English-language news only | Scope control | Malay/Chinese in backlog (B-005) | Multilingual |
| D-015 | 2026-09-24 | Login required. Amended 2026-10-02: not in MVP0 (D-027) | Ben's choice | Conflict with the earlier repo spec resolved by D-027 | Public site |
| D-016 | 2026-09-24 | Portfolio first; not commercial now. Commercial use possible later if viable | Project purpose is to showcase AI PM skills | Commercial use would need re-review | Commercial launch |
| D-017 | 2026-10-02 | GNews is the only news input to Watchtower. No publisher RSS feeds or other news sources, and all documentation is cleaned of them | One vendor, one adapter, no cross-source duplicates | Review items 38 and 40. Repo code and docs that mention publisher feeds are retired | RSS from individual publishers |
| D-018 | 2026-10-02 | Query strategy: run a one-day coverage test on the Free plan, start with Top Headlines category=business, country=my, lang=en, and add a Search query only if volume is low | Evidence before building | Review item 39. The coverage test precedes the adapter plan | Search-first |
| D-019 | 2026-10-02 | GNews plan path: develop and run the private beta on Free, backfill to 1 Jan 2026 on the 10-day paid trial, move to Essential when Watchtower goes public. No email to GNews now because Watchtower is a private beta. Revisit the terms before going public | Free is for development and testing; beta is not public | Review item 41, edited. Cost is zero until public | Pay from day one |
| D-020 | 2026-10-02 | PRDs are authored as .docx so Ben can read them, and all PRDs follow the same format. Markdown is exported from the approved docx later | Readability for the PM | Review items 42 and 49. Format sample: PRD-MVP0 | Markdown-first PRDs |
| D-021 | 2026-10-02 | The MVP0 spec is built around the GNews API and fully replaces docs/specs/MVP0.md. It folds in the three repo rules on paging, time display and links (D-023 to D-025). No publisher feeds appear in it | Clean base for Claude Code | Review item 43, edited. Draft: SPEC-MVP0 | Patch the old spec with a change block |
| D-022 | 2026-10-02 | Workflow: PM writes the PRD in docx, an agent drafts the spec from it, then the PM converts the PRD to .md and has Github agent: Watchtower or Claude Code upload it and work on the spec. The PM approves at both gates. The repo is the single source of truth | PM is the gatekeeper | Review item 45, edited. Closes item 27 | Auto-synced specs |
| D-023 | 2026-10-02 | Each page loads its whole selected size (50 or 100 headlines) at once. No progressive loading, no Load more, no infinite scroll | Simpler and faster to build. Approved earlier in the repo, logged now | Review item 46. SPEC-MVP0 R22 | Progressive batches of 10 |
| D-024 | 2026-10-02 | Time display: under 24 hours old shows elapsed time such as "30 mins ago". 24 hours or older shows date and time in the viewer's own time zone. GNews times are UTC | Approved earlier in the repo, logged now. Amends D-012 | Review item 46. SPEC-MVP0 R20 | Always local date and time |
| D-025 | 2026-10-02 | `source_url` keeps the link exactly as GNews returns it. `article_url` is the cleaned link, with tracking parameters such as `utm_*` and any `#` fragment removed, and it is what opens on click | Approved earlier in the repo, logged now | Review item 46. SPEC-MVP0 section 7 and R21 | Open the raw link |
| D-026 | 2026-10-02 | Publishers are whatever GNews returns. Watchtower names, selects, adds or excludes none, keeps no publisher list, and no document names a publisher | GNews is the only input (D-017) | Review item 46. The earlier repo rule that named specific sources is void. Named publishers are removed from all documentation | A curated publisher list |
| D-027 | 2026-10-02 | MVP0 has no login or user accounts. It is a private demo shared with invited reviewers. Login stays on the roadmap and ships before any public release. Amends D-015 | Private demo, so access control adds work without value | Closes review item 28. Placement is review item 68 | Login in MVP0 |
| D-028 | 2026-10-02 | SPEC-MVP0 v2.0 is approved as the replacement for docs/specs/MVP0.md. Edits from Ben's PRD review are in v2.1 and wait for confirmation | PM gate at the spec | Review items 47 and 48. Confirmation is review item 66 | |
| D-029 | 2026-10-02 | All research is done by a dedicated Research agent, in its own chat in this project. The main Watchtower chat plans, drafts and decides, and reads the reports from the Research folder | Keeps research separate from product work | Brief: Research-Agent. Review item 50 (Ben's research request) | Research in the main chat |
| D-030 | 2026-10-02 | PRD conventions: the heading is "Out of scope" (replaces "Must not contain"). Success metrics measure how the product performs for users. Delivery checks such as the README live in the spec | Plain wording; metrics stay about the product | Review item 47. PRD-Template | |
| D-038 | 2026-10-27 | MVP0.1 (UI/UX) is renamed MVP2 and comes after MVP1. Milestone order: MVP0, MVP1, MVP2, later releases. MVP2 is built on its own `mvp2` branch | Ben's instruction on 27 October | Files renamed to PRD-MVP2 and SPEC-MVP2. Amends D-003 | |
| D-039 | 2026-10-27 | MVP1 is filtering and keyword search, delivered as sub-sprints MVP1.0, MVP1.1 and onward, all on the `mvp1` branch, each approved by Ben before it starts. MVP1.0 (single-day date filter) is approved | Ben's sprint breakdown of 26 October and instruction of 27 October | SPEC-MVP1 v0.3 and PRD-MVP1 v0.3. Amends D-002 | Keyword search only |
| D-040 | 2026-10-27 | A filter day runs midnight to midnight in the viewer's own time zone. The date picker puts the time zone in the link (`tz`); a link without it uses Malaysia time | A viewer reads publication times in their own time zone (D-024), so days should match | Shared links show the sender's day | Malaysia day for everyone |

## Awaiting sign-off

Proposed on 27 October 2026, after Ben chose (option 1b) to bring the planning documents in line with the built spec. Reply by ID: "A-04 approve", "A-13 edit: …", "D-031 reject".

### Proposed amendments

Each amendment would be added to the decision's text as "Amended 2026-10-27: …".

| ID | Amends | Proposed amendment | Why |
| --- | --- | --- | --- |
| A-04 | D-004 | The roadmap is `docs/roadmap-and-decisions/Roadmap.md` in the repo. The backlog is `docs/roadmap-and-decisions/Backlog.md`, merged from the Drive Backlog and `docs/roadmap.md`. The Google Sheet "Watchtower-Roadmap" is not kept in sync | One roadmap location, in the repo (D-031) |
| A-10 | D-010 | The duplicate key is (`source`, `external_id`), where `external_id` is the cleaned article link. GNews documents no stable article id, so its `id` is not used | Matches the built code and spec approved change 3 |
| A-13 | D-013 | History covers the 30 days the GNews free plan allows, loaded by the backfill (spec approved change 6). History back to 1 January 2026 moves to the backlog and needs a paid plan | The 10-day paid trial was not used |
| A-17 | D-017, D-026 | The rule that no document names a publisher does not apply to the history kept in `docs/specs/MVP0.md` (original text and approved change 4) or in retired documents. Neither is edited | The spec may only change on Ben's instruction, and the historical text is not a requirement |
| A-18 | D-018 | The coverage test was not run. MVP0 uses Top Headlines only (`category=business`, `country=my`, `lang=en`, `max=10`), as built. The Search endpoint is not used. The coverage test moves to future considerations | Matches what was built |
| A-19 | D-019 | MVP0 runs on the GNews free plan with no paid trial. The free plan is for non-commercial use only. Move to a paid plan before any commercial use or public launch, and revisit the terms then | The trial was not used. Matches the README and roadmap |
| A-20 | D-020 | PRDs are written in Markdown in the repo under `docs/product/`, following PRD-Template. The Google Doc of each one is a read-only mirror: comments are fine, edits are made in GitHub | Ben's answers on 27 October: GitHub is the source of truth and Docs are read-only mirrors |
| A-21 | D-021 | The MVP0 spec is `docs/specs/MVP0.md`: the original spec plus approved changes 1 to 6. It was patched with change blocks, not replaced. The SPEC-MVP0 v2.1 draft is retired in `docs/specs/Retired/` | This is the spec that was built (Ben's answer on 27 October) |
| A-22 | D-022 | Workflow: Ben approves the PRD, then the spec, as pull requests in the repo. Claude Code commits them and builds only from an approved spec. Ben approves before merge. A GitHub Action mirrors `docs/` to Google Drive | Drafting in docx and converting by hand is replaced by the repo workflow |
| A-28 | D-028 | SPEC-MVP0 v2.0 and v2.1 were never adopted. Superseded by `docs/specs/MVP0.md` and retired | v2.1 was never confirmed (review item 66) and was not built |
| A-29 | D-029 | Research reports are committed to `docs/research/` through Claude Code, and mirrored to Drive | The Research folder now lives in the repo |

### Proposed new decisions

| ID | Date | Decision | Rationale | Implications |
| --- | --- | --- | --- | --- |
| D-031 | 2026-10-27 | GitHub `docs/` is the single source of truth for all product documents. Google Drive holds one Watchtower folder with the same sections, where each Markdown file sits beside its Google Doc mirror. Docs are read-only; comments are fine | Ben's answers on 27 October (items 1 and 3) | A GitHub Action updates Drive when `docs/` changes on `main` |
| D-032 | 2026-10-27 | A retired document moves to a `Retired/` folder inside its own section, in the repo and in Drive. Nothing is deleted | Keeps a trail (Ben's answer on 27 October, item 4) | Drive "Archive" folders are renamed "Retired" |
| D-033 | 2026-10-23 | The product is called Watchtower. Its former name is retired and is not used anywhere | Renamed in the repo on 23 October; Ben asked on 25 October for the old name to be retired everywhere | Rule added to `CLAUDE.md` |
| D-034 | 2026-10-16 | Ingestion runs every 3 hours from 12am Malaysia time, one GNews request per run, scheduled by Supabase `pg_cron` calling the deployed ingest endpoint | Fits the free plan's 100 requests a day with room for the backfill. Approved in the repo (spec approved change 5 and the README), logged now | Replaces the 15-minute GitHub Actions cadence in the retired draft |
| D-035 | 2026-10-22 | 30-day backfill on the free plan: at most 90 requests a day, run once a day after the 00:00 UTC reset, from 23 October to 21 November 2026, then reviewed | Spec approved change 6, logged now | Leaves 10 requests a day for regular ingestion |
| D-036 | 2026-10-22 | The demo is hosted on Vercel Hobby at <https://watchtower01.vercel.app>, deployed from `main` | Free, and matches the Next.js stack | Revisit hosting before any commercial use |
| D-037 | 2026-10-27 | Improvements from the retired draft that were not built are recorded as future considerations in the backlog: the `nullable` option, a 24-hour lookback window, GNews id as the duplicate key, the `X-Api-Key` header, tests for GNews error codes, and a one-day coverage test | Ben's answer on 27 October (item 2) | None is built without approval |
