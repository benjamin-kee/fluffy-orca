# Watchtower Roadmap

This is the Watchtower roadmap (D-004, proposed amendment A-04). Unscheduled ideas and known improvements are in [Backlog.md](Backlog.md). The Google Sheet "Watchtower-Roadmap" in Drive is an older snapshot and is not kept in sync.

## Milestone order (D-003, amended by D-038 and D-052)

| # | Milestone | Scope | Status |
| --- | --- | --- | --- |
| 1 | MVP0 | Central business-news dashboard fed by GNews ([spec](../specs/MVP0.md), [PRD](../product/PRD-MVP0.md)) | Built and live at <https://watchtower01.vercel.app>. Private demo, no login. 30-day backfill runs daily until 21 November 2026 |
| 2 | MVP1 | Filtering and keyword search over stored headlines, in sub-sprints MVP1.0 to MVP1.x on the `mvp1` branch ([PRD](../product/PRD-MVP1.md), [spec](../specs/SPEC-MVP1.md), [execution plan](../execution-and-agents/Execution-Plan-MVP1.md)) | Essentially closed apart from minor tweaks (D-052, 18 November 2026). MVP1.0 to MVP1.3 and MVP1.6 built; MVP1.4 held and MVP1.5 draft |
| 3 | MVP3 | Ask Watchtower: questions answered from stored headlines, with cited sources, in sub-sprints MVP3.0 to MVP3.4 ([PRD](../product/PRD-MVP3.md), [draft spec](../specs/SPEC-MVP3.md), [research](../research/RAG-Chatbot.md)). Brings LATER-F6 forward (D-043). AI spend capped at US$10 a month (D-053) | Draft PRD and spec, waiting for Ben's approval. Then backlog B-009 (model evaluation), must do right after launch |
| 4 | MVP2 | UI/UX improvements, formerly MVP0.1, on the `mvp2` branch ([PRD](../product/PRD-MVP2.md), [draft spec](../specs/SPEC-MVP2.md)) | Draft PRD and spec, proposals only |
| 5 | Later | Candidates only, not scheduled: article metadata, topic tagging, company extraction, company profiles, alerts, AI-assisted research, wider coverage ([PRD](../product/PRD-Later.md)) | Not scheduled |

## On the roadmap, not yet placed

- **Login and access control.** Not in MVP0, which is a private demo (D-027). Required before any public release. Placement is review item 68. Proposal: its own milestone before public launch.
- **Login to use Ask Watchtower** (D-054). Required to use the chatbot beyond the demo; timing is PRD-MVP3 open question 2. Also the base for saved chat history as a paid add-on (D-055, backlog B-011).
- **Paid GNews plan.** Required before any commercial use or public launch (proposed amendment A-19).
- **User behaviour analytics** (session recordings, heatmaps, click tracking). The Research agent's report is [User-Behaviour-Tracking](../research/User-Behaviour-Tracking.md). Ben's assessment is review item 69.

## Rules

- Later capabilities are not pulled into earlier milestones without approval.
- Starting market is Malaysia (D-007). Wider Asia is a later option.
- GNews is the only news input (D-017).
