> **Retired 27 October 2026.** This plan was written on 2 October 2026 for the SPEC-MVP0 v2.1 draft, which was never adopted. MVP0 was built to `docs/specs/MVP0.md` instead: every 3 hours on Supabase `pg_cron` rather than every 15 minutes on GitHub Actions, a 30-day backfill on the free plan rather than a paid trial, and no coverage test. Kept here for the record only. Nothing in this file is a requirement.

# Execution Plan: GNews MVP0 and the PM-gated workflow

Date: 2026-10-02. Reflects decisions D-017 to D-030.

## 1. The workflow (D-022)

Ben writes the PRD in Word, then an agent drafts the spec. Ben approves the PRD and the spec, then exports the PRD to .md. The Github agent: Watchtower or Claude Code uploads the PRD and spec to the repo. Claude Code works on the spec. Ben approves before coding and again before merge.

The repo is the single source of truth. Ben is the gatekeeper at every step that crosses into GitHub or code. Nothing is committed, and nothing is coded, without Ben's go.

Who does what: this project drafts PRDs and specs. Github agent: Watchtower commits documents. Claude Code writes code. Specwright audits code against the spec and never edits. The Research agent does all research (D-029) and saves reports to Research.

## 2. Exporting the PRD to Markdown

- Ask in this project: "export PRD-MVP0 to md". The result comes back as a file.
- Or run `pandoc PRD-MVP0.docx -t gfm -o MVP0.md` on your computer.
- Or give the docx to Github agent: Watchtower with the instruction to convert and commit.

Check the tables after export. They survive well, but long cells wrap.

## 3. Needed before building

| # | Need | Owner |
| --- | --- | --- |
| 1 | Confirm PRD-MVP0 v0.3 and SPEC-MVP0 v2.1 (review item 66) | Ben |
| 2 | Decide the request cadence (item 67) | Ben |
| 3 | Free GNews account and key at gnews.io/register. The key goes in .env.local and the scheduler's secrets, never in chat or git | Ben |
| 4 | Scheduler choice (item 34). A 15 minute interval rules out Vercel's free daily schedule. Recommended: a free GitHub Actions schedule. GitHub can delay scheduled runs under load | Ben |
| 5 | Merge the Claude Code branch to main (item 36), or tell the agent which branch to use | Ben |
| 6 | Start the 10-day paid trial only when the adapter is ready, then set a cancel reminder for day 8 | Ben |

## 4. Sequence for MVP0

| Step | Who | Output | Gate |
| --- | --- | --- | --- |
| T01 | Ben | Confirm PRD-MVP0 and SPEC-MVP0 | Reply |
| T02 | Ben | Free GNews key | Key stored |
| T03 | Ben, then Github agent | Export PRD to .md. Upload PRD to docs/prd/MVP0.md and replace docs/specs/MVP0.md with SPEC-MVP0 (Prompt A) | PR reviewed |
| T04 | Claude Code | One-day coverage test (Prompt C) | Report to Ben |
| T05 | Ben | Confirm Top Headlines is enough, or approve a Search query | Reply |
| T06 | Claude Code | Implementation plan, then stop (Prompt B) | Ben approves plan |
| T07 | Claude Code | GnewsSource, normalization, dedup, errors, tests. Removes any earlier publisher-specific code | Tests pass |
| T08 | Claude Code | Scheduled ingestion every 15 minutes | Approved scheduler running |
| T09 | Ben, Claude Code | Start trial, run backfill to 1 Jan 2026 | Report shows earliest date |
| T10 | Claude Code | README and .env.example; deploy to Vercel | Live URL |
| T11 | Specwright | Audit against spec | No Contradicted items |
| T12 | Ben | After trial: stay on Free for private beta, or move to Essential for public | Decision |

Estimate: 5.25 days of AI-assisted effort, plus review waits. Unverified; the coverage test will tighten it.

## 5. Prompts

### Prompt A: Github agent: Watchtower (after Ben confirms T01)

Task: commit Watchtower documents. Do not change any file not listed.

Base branch: claude/inspiring-galileo-33vjef (or main if merged). New branch: docs/mvp0-gnews. Open a pull request, do not merge.

- Add docs/prd/MVP0.md (the Markdown export of PRD-MVP0 v0.3 that Ben supplies).
- Replace the entire contents of docs/specs/MVP0.md with the contents of SPEC-MVP0 from the Watchtower project, including its frontmatter.
- Remove from README.md and any other docs every mention of earlier news sources and their feeds. GNews is the only news input.

Do not touch CLAUDE.md or any source code.

Report the PR link and the files changed.

### Prompt B: Claude Code (after the PR is merged)

Read CLAUDE.md, docs/specs/MVP0.md and docs/prd/MVP0.md.

GNews is the only news input. Produce the implementation plan described in section 13 of the spec, say which steps already exist in the repo, list any earlier publisher-specific code to remove, then STOP.

Do not write code, add dependencies, change the schema or edit any spec until I approve the plan.

### Prompt C: Claude Code coverage test (T04)

Read docs/specs/MVP0.md. Do not change the app.

Write a throwaway script outside src/ that calls GNews with GNEWS_API_KEY on the Free plan: top-headlines, category=business, country=my, lang=en, max=10.

Run it three times across one day, and once more with a very narrow from window so that it should return nothing.

Report: articles per run, distinct publishers, how many articles were new on each run compared with the previous one, the share of 20 sampled headlines that are clearly Malaysian business news, the duplicate rate by id and by title, and the total number of requests made so that Ben can compare it with the GNews usage counter.

Do not commit the script or the key. Report in Markdown and stop.

## 6. Cost

GNews Free is €0 for the private beta. The 10-day trial is €0 if cancelled in time. Essential is €49.99 per month or €479.99 per year, only when Watchtower is public. A scheduler on GitHub Actions is €0; Vercel Pro is paid. A 15 minute cadence uses 96 of the Free plan's 100 requests a day, which leaves 4 for the coverage test and manual runs, so pause the scheduler on days when you test. Likely spend before public launch: €0.

## 7. Risks

- GNews is the single data vendor.
- Coverage of Malaysian business news is unproven until the coverage test.
- The Free plan lags 12 hours and reaches back 30 days.
- The trial converts to paid unless cancelled.
- Repo progress was last checked on 24 September. Recheck before T06.
- Drafts of MVP0.1 and MVP1 specs stay as drafts until Ben approves them.
- Change requests FS-50 to FS-65 in the fs-review of SPEC-MVP0 (7 Reviews) are not applied and wait for Ben.
