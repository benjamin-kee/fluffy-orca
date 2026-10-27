---
id: PRD-MVP0.1
milestone: MVP0.1, second of the Watchtower roadmap
status: Draft, proposals only
version: 0.2, 2 October 2026
owner: Ben (product manager and approver)
spec: SPEC-MVP0.1 (draft)
decisions: D-017 to D-030 in the decision log
news_input: GNews API only
---

# PRD MVP0.1: UI/UX Improvements

Only the milestone name was previously approved. Every requirement below is a proposal.

## 1. Summary
MVP0.1 turns the working feed into a feed people want to read. It improves scanning speed, mobile use, accessibility and trust signals without adding any new data or features. It never changes what is stored or what is searchable.

## 2. Problem and outcome
MVP0 is deliberately plain. A recruiter judges the demo in seconds and a reader scans dozens of headlines. **Outcome:** a dense, calm, fast list that looks deliberate on a phone and on a laptop.

## 3. Users and jobs
- **Recruiter.** See craft and product judgment in the first five seconds.
- **Reader.** Find the headline worth clicking in under ten seconds.

## 4. Success metrics
| Metric | Target | How it is checked |
|---|---|---|
| Lighthouse mobile performance | 90 or more | Lighthouse CI |
| Lighthouse accessibility | 95 or more | Lighthouse CI |
| Layout shift | CLS under 0.1 | Lighthouse |
| Five-second test | 4 of 5 testers can say what Watchtower is | Ben runs it with 5 people |
| Time to first click | Under 10 seconds to open a headline, tester median | Same test |

## 5. Scope
### In scope
- Visual hierarchy and typography
- Loading, empty and error states
- Responsive layout
- Accessibility baseline
- Light and dark themes that follow the system
- An "updated N minutes ago" indicator
- A "new headlines available" notice
- Page size remembered between visits
- Attribution footer

### Out of scope
- Search, filters or sort controls
- Accounts and login
- Article images or summaries, and source logos
- AI features
- New data fields or new news sources
- An article-detail page

## 6. Data contract
No change to the Article model or to ingestion. The page size preference is stored in the browser only.

## 7. Functional requirements
| ID | Requirement |
|---|---|
| MVP0.1-F1 | Clear visual hierarchy: headline dominant, source and time secondary, consistent spacing, readable type scale. |
| MVP0.1-F2 | Loading skeleton, empty state and error state for the feed. |
| MVP0.1-F3 | Mobile-first layout with 44px minimum touch targets and no horizontal scroll. |
| MVP0.1-F4 | Accessibility baseline to WCAG 2.2 AA: semantic list, keyboard navigation, visible focus, 4.5:1 contrast. |
| MVP0.1-F5 | Light and dark themes follow the system setting. |
| MVP0.1-F6 | A freshness indicator shows when the feed was last updated. |
| MVP0.1-F7 | A "new headlines available" notice appears without reordering the list under the reader. |
| MVP0.1-F8 | The chosen page size (50 or 100) is remembered between visits. |
| MVP0.1-F9 | A footer states that headlines are provided via GNews and that articles belong to their publishers. |

## 8. Non-functional requirements
Mobile performance budget: JavaScript under 150 KB gzipped for the feed page. No animation libraries. No component library unless Ben approves it.

## 9. Assumptions, risks and dependencies
| # | Item | How it is handled |
|---|---|---|
| R1 | Design taste is subjective | Produce two or three design options first. Ben picks one before code |
| R2 | Scope creep into new features | The out of scope list. Anything new goes to the backlog |
| R3 | Depends on MVP0 shipped and stable | Do not start before MVP0 acceptance |
| D1 | Login is access control, not UI | On the roadmap before public release (D-027). Placement is review item 68 |

## 10. Open questions
1. Design reference. Proposal: review three established business-news layouts for patterns, then produce design options. Needs Ben's choice of references.
2. Login placement. Review item 68. Proposal: its own milestone before public launch, not part of MVP0.1.
3. Brand. Name, logo and colour for Watchtower, or neutral for now. Proposal: neutral.

## 11. Agent guardrails
Same as PRD-MVP0 section 12. Plus: no visual change ships without a design Ben has picked, and no new npm package without approval.

## 12. Change log
| Version | Date | Change |
|---|---|---|
| 0.2 | 2 October 2026 | Word format. Out of scope heading. Login placement points to the roadmap |
| 0.1 | 2 October 2026 | First draft |
