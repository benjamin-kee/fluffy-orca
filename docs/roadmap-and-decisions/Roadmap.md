# Watchtower Roadmap

This is the Watchtower roadmap (D-004, proposed amendment A-04). Unscheduled ideas and known improvements are in [Backlog.md](Backlog.md). The Google Sheet "Watchtower-Roadmap" in Drive is an older snapshot and is not kept in sync.

## Milestone order (D-003, amended by D-038)

| # | Milestone | Scope | Status |
| --- | --- | --- | --- |
| 1 | MVP0 | Central business-news dashboard fed by GNews ([spec](../specs/MVP0.md), [PRD](../product/PRD-MVP0.md)) | Built and live at <https://watchtower01.vercel.app>. Private demo, no login. 30-day backfill runs daily until 21 November 2026 |
| 2 | MVP1 | Filtering and keyword search over stored headlines, in sub-sprints MVP1.0 to MVP1.x on the `mvp1` branch ([PRD](../product/PRD-MVP1.md), [spec](../specs/SPEC-MVP1.md), [execution plan](../execution-and-agents/Execution-Plan-MVP1.md)) | MVP1.0 single-day date filter built and live (27 October 2026). MVP1.1 to MVP1.6 drafts, each needs Ben's approval |
| 3 | MVP2 | UI/UX improvements, formerly MVP0.1, on the `mvp2` branch ([PRD](../product/PRD-MVP2.md), [draft spec](../specs/SPEC-MVP2.md)) | Draft PRD and spec, proposals only |
| 4 | Later | Candidates only, not scheduled: article metadata, topic tagging, company extraction, company profiles, alerts, AI-assisted research, wider coverage ([PRD](../product/PRD-Later.md)) | Not scheduled |

## On the roadmap, not yet placed

- **Login and access control.** Not in MVP0, which is a private demo (D-027). Required before any public release. Placement is review item 68. Proposal: its own milestone before public launch.
- **Paid GNews plan.** Required before any commercial use or public launch (proposed amendment A-19).
- **User behaviour analytics** (session recordings, heatmaps, click tracking). The Research agent's report is [User-Behaviour-Tracking](../research/User-Behaviour-Tracking.md). Ben's assessment is review item 69.

## Rules

- Later capabilities are not pulled into earlier milestones without approval.
- Starting market is Malaysia (D-007). Wider Asia is a later option.
- GNews is the only news input (D-017).
