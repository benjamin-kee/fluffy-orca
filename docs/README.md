# Watchtower documents: folder guide

`docs/` in this repo is the source of truth for every Watchtower product document (proposed decision D-031). Google Drive has one Watchtower folder with the same sections. Each Markdown file there sits beside a Google Doc copy of it. Drive is a read-only mirror: comment there, but make edits here through a pull request.

Each section keeps only current files. A retired file moves to that section's `Retired/` folder, so there is a trail (proposed decision D-032). Nothing in a `Retired/` folder is a requirement.

| Folder | What is in it |
| --- | --- |
| [start-here](start-here/) | [Current-Status](start-here/Current-Status.md) and this guide |
| [product](product/) | PRDs (MVP0, MVP1, MVP2, Later), PRD-Template, Product-Vision |
| [specs](specs/) | [MVP0.md](specs/MVP0.md), the approved and built spec. [SPEC-MVP1](specs/SPEC-MVP1.md) (filtering and keyword search): MVP1.0 approved and built, later sub-sprints draft. [SPEC-MVP2](specs/SPEC-MVP2.md) (UI/UX, formerly MVP0.1): draft. `Retired/` holds the SPEC-MVP0 v2.1 draft and the keyword-only MVP1 v0.1 draft |
| [roadmap-and-decisions](roadmap-and-decisions/) | [Roadmap](roadmap-and-decisions/Roadmap.md), [Backlog](roadmap-and-decisions/Backlog.md), [Product-Decisions](roadmap-and-decisions/Product-Decisions.md), [MVP1-Sprint-Breakdown](roadmap-and-decisions/MVP1-Sprint-Breakdown.md) |
| [research](research/) | News-Sources (GNews), Licensing, User-Behaviour-Tracking |
| [execution-and-agents](execution-and-agents/) | [Execution-Plan-MVP1](execution-and-agents/Execution-Plan-MVP1.md) (draft), Research-Agent brief, Specwright auditor prompt. `Retired/` holds Execution-Plan-GNews |
| [reviews](reviews/) | The latest review round and the fs-review of the v2.1 draft. `Retired/` holds earlier rounds |

Reading order: Current-Status, then Product-Decisions (items awaiting sign-off), then PRD-MVP0 and `specs/MVP0.md`.

Requirements for Claude Code (see `CLAUDE.md`) are `specs/MVP0.md` and the approved sub-sprints of `specs/SPEC-MVP1.md` (MVP1.0 so far). Everything else is planning context.
