---
id: SPEC-MVP0.1
prd: PRD-MVP0.1
prd_version: 0.1
status: Draft
version: 0.1-draft
---

# MVP0.1 Specification: UI/UX Improvements

**Status:** Draft. All requirements are proposals. Not approved for implementation. Starts only after MVP0 is accepted.
**Last updated:** 2026-10-02
**Implements:** PRD-MVP0.1 v0.1

## Requirements
| ID | Requirement | Implements |
|---|---|---|
| MVP0.1-R1 | The feed shall render as a semantic list. Headline shall be the largest text, source and time secondary, using a defined type scale and spacing scale. | F1 |
| MVP0.1-R2 | The feed shall show a loading skeleton while data loads, an empty state when there are no articles, and an error state with a retry link when loading fails. | F2 |
| MVP0.1-R3 | Layouts shall work from 320px to 1440px wide with no horizontal scroll and 44px minimum touch targets. | F3 |
| MVP0.1-R4 | All interactive elements shall be keyboard reachable with a visible focus ring. Text contrast shall be at least 4.5:1. | F4 |
| MVP0.1-R5 | The theme shall follow `prefers-color-scheme`. No manual toggle. | F5 |
| MVP0.1-R6 | The feed shall show "Updated N minutes ago" based on the latest successful ingestion time. | F6 |
| MVP0.1-R7 | When newer articles exist than those shown, a notice "N new headlines" shall appear. It shall reload the feed only when clicked and shall never move the list on its own. | F7 |
| MVP0.1-R8 | The chosen page size shall persist in browser storage. | F8 |
| MVP0.1-R9 | A footer shall read that headlines are provided via GNews and that articles belong to their publishers. | F9 |
| MVP0.1-R10 | Lighthouse mobile shall score 90+ performance and 95+ accessibility on the feed page. | All |

## Acceptance criteria (DRAFT)
| Req | Given | When | Then |
|---|---|---|---|
| R2 | The API is slow | Page loads | Skeleton rows are visible before data arrives |
| R2 | The database query fails | Page loads | Error state with retry is shown, no stack trace |
| R4 | A keyboard-only user | Tabs through the page | Every headline, page link and selector gets focus in reading order |
| R5 | OS set to dark | Page loads | Dark theme is used |
| R7 | The viewer is on page 1 and new articles arrive | 30 minutes pass | Notice appears, list order is unchanged until clicked |
| R8 | Page size 100 chosen | Viewer returns next day | Page size is 100 |
| R10 | Production build | Lighthouse mobile runs | Scores meet targets |

## Out of scope
Search, filters, sort controls, accounts, images, summaries, source logos, new data, new sources, AI.

## Open questions
- Q1 Design references and design option choice by Ben.
- Q2 Login placement (item 28).
- Q3 Brand name, logo, colour. Proposal: neutral.

## Change log
- 0.1-draft (2026-10-02): First draft.
