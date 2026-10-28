# Watchtower PRD Template (agentic edition)

Every Watchtower milestone gets one PRD. All PRDs share this format. The PRD lives in the repository as `docs/product/PRD-<MILESTONE>.md`, which is the source of truth; the Google Doc copy in Drive is a read-only mirror. The format sample is `PRD-MVP0.md`.

## Why this shape
Agentic practice (GitHub Spec Kit, Kiro, SpecRoute and similar) agrees on four points:
1. The PRD carries business intent. The spec carries testable behaviour. Code follows the spec.
2. Agents take text literally, so scope needs an explicit "out of scope" list and stop-and-ask rules.
3. Every requirement has an ID so PRD, spec, tests and code can be traced.
4. Start light. Grow the template only when the one-page version feels cramped.

## Layout
A header table (PRD ID, milestone, status, version, owner, spec, decisions, news input), then numbered sections:
1. Summary, written like the system prompt for the milestone: what it is, who for, what it never does.
2. Problem and outcome
3. Users and jobs
4. Success metrics, with target and check. Metrics measure how the product performs for users. Delivery checks such as the README belong in the spec (D-030).
5. Scope: in scope, and out of scope. Add a subsection for anything that sets a rhythm, such as a request cadence.
6. Release stages, where the milestone has more than one
7. Data and integration contract, where the milestone touches data or a vendor
8. Functional requirements, IDs `<MILESTONE>-F#`, one sentence each
9. Non-functional requirements
10. Assumptions, risks and dependencies
11. Open questions, numbered so Ben can reply by number
12. Agent guardrails
13. Change log

## Workflow
1. Ben writes or approves the PRD. Edits are made to the Markdown file in the repository, through Claude Code or a pull request.
2. An agent drafts the spec from it, using the same requirement IDs.
3. Ben approves PRD and spec in the pull request.
4. On merge, the GitHub Action mirrors the files to the Watchtower folder in Google Drive.
5. Ben approves before any coding.

## Rules
- Nothing is Approved until Ben says so.
- Requirement IDs are never reused.
- If PRD and spec disagree, the spec waits for Ben's approval of a change.
- No publisher is named in any PRD. Publishers are whatever GNews returns (D-026).
