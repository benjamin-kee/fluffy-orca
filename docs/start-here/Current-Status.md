# Current Status

**As of:** 11 November 2026
**Owner:** the Orchestrator (Ben's product-manager agent). It updates this page after each sprint, merge or decision. Ben approves each update by merging it.
**Active milestone:** MVP1 (filtering and keyword search) is complete and live at <https://watchtower01.vercel.app>. Next is MVP2 (UI/UX), whose spec waits for Ben's approval.
**Repo:** github.com/benjamin-kee/fluffy-orca. `main` is what Vercel deploys. Each sub-sprint is built on its own branch and merged by pull request.

## MVP1 sprints

| Sprint | What it does | Status |
| --- | --- | --- |
| MVP1.0 | Single-day date filter | Live, 27 Oct ([pull request 5](https://github.com/benjamin-kee/fluffy-orca/pull/5)) |
| MVP1.1 | Count line, sort, "Clear all" | Live, 28 Oct ([pull request 10](https://github.com/benjamin-kee/fluffy-orca/pull/10)) |
| MVP1.2 | From and To date range | Live, 28 Oct ([pull request 7](https://github.com/benjamin-kee/fluffy-orca/pull/7)) |
| MVP1.6 | Keyword search on headline titles | Live, 6 Nov ([pull request 12](https://github.com/benjamin-kee/fluffy-orca/pull/12)) |
| MVP1.3 | Source filter with headline counts, behind a "Sources" dropdown | Live, 7 Nov ([pull request 11](https://github.com/benjamin-kee/fluffy-orca/pull/11)), follow-ups 8 Nov ([pull request 13](https://github.com/benjamin-kee/fluffy-orca/pull/13)) |
| MVP1.4 | Country filter | Moved to the Backlog as B-009, 8 Nov ([pull request 16](https://github.com/benjamin-kee/fluffy-orca/pull/16)) |
| MVP1.5 | Mobile filter sheet | Moved into MVP2 as MVP2-R13, 8 Nov ([pull request 16](https://github.com/benjamin-kee/fluffy-orca/pull/16)) |

Fixes since, both live on 8 November: typed dates now filter the feed ([pull request 14](https://github.com/benjamin-kee/fluffy-orca/pull/14)), and a request Supabase briefly refuses ("JWT issued at future") is retried instead of showing "Headlines could not be loaded" ([pull request 15](https://github.com/benjamin-kee/fluffy-orca/pull/15)).

## Waiting for Ben

1. **Answer the 4 open SPEC-MVP2 questions** (design references, brand, new-headlines notice, Lighthouse targets). Question 5, MVP1.5 or MVP2 first, was answered on 8 November. The spec was refreshed on 8 November to match what is live (v0.4.1-draft).
2. **Sign off the decision log**: 18 proposed amendments and decisions from 27 October in [Product-Decisions](../roadmap-and-decisions/Product-Decisions.md#awaiting-sign-off).
3. **Approve SPEC-MVP2**, once the questions are answered. A UI design session on 30 October stopped to wait for these answers.
4. **Review items 68 (login placement) and 69 (behaviour tracking)**.

## Recently decided

- **MVP1 closed** (8 November, [pull request 16](https://github.com/benjamin-kee/fluffy-orca/pull/16)): the country filter (MVP1.4) moved to the Backlog as B-009, and the phone filter sheet (MVP1.5) moved into MVP2 as MVP2-R13, so the phone layout of the filters is designed once, in MVP2.
- **Supabase project renamed** to "Watchtower" (8 November).
- **Product principles** in [Product-Principles](../product/Product-Principles.md), which every PRD and spec now points to: P-1 web first, mobile friendly (D-041); P-2 sorting names A–Z (D-042).

## Data and ingestion

- 1,936 headlines stored on 11 November, from 23 September 2026 onward (138 added since 8 November). The database uses about 13 MB.
- Scheduled ingestion runs 8 times a day (every 3 hours) and every run from 9 to 11 November succeeded. Each run makes 1 GNews request and gets at most the 10 newest headlines. About 20 to 60 new headlines arrive a day.
- The daily backfill (up to 90 requests) also catches headlines the scheduled runs miss. The 30-day window was still complete on 11 November (12 October to 11 November).
- GNews free plan: 100 requests a day, 10 headlines per request, 30 days of history, headlines appear 12 hours after publication, non-commercial use only.
- Backfill rule after 21 November 2026: Ben revisits it around 15 November.

## Exploratory work

- **Headline RAG chat ("MVP3")**: on GitHub since 8 November, on branch `mvp3-rag` (not merged): the eval suite in `evals/` (67 test cases, 4 judge prompts, no runs yet) and a research report, [RAG-Chatbot](https://github.com/benjamin-kee/fluffy-orca/blob/mvp3-rag/docs/research/RAG-Chatbot.md), with competitors and a proposed architecture (hybrid search in Supabase Postgres, Claude with citations, answers from headlines only). The chat itself is not built. It is not in the roadmap and has no PRD or spec. The research report ends with 10 questions for the PRD. Two earlier decisions are also open: what to show when filters find nothing, and whether investment questions get a fixed refusal.

## Known issues

- **Titles cut at hyphens.** Found on 29 October: some titles lose the text before a hyphen ("tron sets…" from "e-tron"). 98 stored titles start with a lowercase letter, 14 of them from the last 7 days, so it likely still happens. Needs a fix decision.
- **One outlet, several source names** ("The Star" and "thestar.com.my"). Logged as FRC-SPEC-MVP1-14 for a later decision.

## Still in progress from October

- GitHub Action to mirror `docs/` to Google Drive, and one consolidated Watchtower folder in Drive. Not checked since 28 October.
- Vision doc: waiting on the ChatGPT strategy export.
- Change requests FS-50 to FS-65 in the [fs-review](../reviews/fs-review_2026-10-02_SPEC-MVP0.md) were written against the retired v2.1 draft. They are not applied.

## Workflow (proposed amendment A-22)

Ben approves the PRD, then the spec, as pull requests. Claude Code builds only from an approved spec. Ben approves before merge. Drive mirrors `docs/` and is read-only.

## Next

1. Ben answers the SPEC-MVP2 questions, then approves the spec.
2. Step 1 of MVP2: two or three design options for Ben to pick from.
3. Decide the backfill rule after 21 November (around 15 November).
4. Decide whether to fix the hyphen bug now.
5. Decide whether the RAG chat becomes MVP3 on the roadmap, then draft its PRD from the research report.
