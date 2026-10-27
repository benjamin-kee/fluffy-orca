---
id: PRD-MVP2
milestone: MVP2, third of the Watchtower roadmap (formerly MVP0.1)
status: Draft, proposals only
version: 0.3, 27 October 2026
owner: Ben (product manager and approver)
spec: SPEC-MVP2 (draft)
decisions: D-038 in the decision log
news_input: GNews API only
---

# PRD MVP2: UI/UX Improvements

Formerly MVP0.1. Renamed MVP2 and moved after MVP1 on 27 October 2026 (D-038). Only the milestone is approved. Every requirement below is a proposal.

## 1. Summary
MVP2 turns the working feed, and the MVP1 filters that have shipped by then, into a product people want to read. It improves scanning speed, mobile use, accessibility and trust signals without adding new data, new filters or new search behaviour. It never changes what is stored, what is searchable or how filters work.

## 2. Problem and outcome
MVP0 and MVP1 are deliberately plain. A recruiter judges the demo in seconds and a reader scans dozens of headlines. **Outcome:** a dense, calm, fast list with tidy controls that looks deliberate on a phone and on a laptop.

## 3. Users and jobs
- **Recruiter.** See craft and product judgment in the first five seconds.
- **Reader.** Find the headline worth clicking in under ten seconds.

## 4. Success metrics
| Metric | Target | How it is checked |
|---|---|---|
| Lighthouse mobile performance | 90 or more | Lighthouse on the production build |
| Lighthouse accessibility | 95 or more | Lighthouse on the production build |
| Layout shift | CLS under 0.1 | Lighthouse |
| Five-second test | 4 of 5 testers can say what Watchtower is | Ben runs it with 5 people |
| Time to first click | Under 10 seconds to open a headline, tester median | Same test |

## 5. Scope
### In scope
- Visual hierarchy and typography for the feed and the MVP1 controls
- Loading, empty and error states (keeping MVP1's miner drawing and message for empty days)
- Responsive layout
- Accessibility baseline
- Light and dark themes that follow the system
- An "Updated N minutes ago" indicator
- A "new headlines available" notice
- Page size remembered between visits
- Attribution footer

### Out of scope
- New filters, search or sort behaviour (MVP1)
- Accounts and login
- Article images or summaries, and source logos
- AI features
- New data fields or new news sources
- An article-detail page

## 6. Data contract
No change to the Article model or to ingestion. "Updated N minutes ago" reads the newest `ingested_at`. The page size preference is stored in the browser only.

## 7. Functional requirements
| ID | Requirement |
|---|---|
| MVP2-F1 | Clear visual hierarchy: headline dominant, source and time secondary, consistent spacing, readable type scale. |
| MVP2-F2 | Loading skeleton, empty state and error state for the feed. |
| MVP2-F3 | Mobile-first layout with 44px minimum touch targets and no horizontal scroll. |
| MVP2-F4 | Accessibility baseline to WCAG 2.2 AA: semantic list, keyboard navigation, visible focus, 4.5:1 contrast. |
| MVP2-F5 | Light and dark themes follow the system setting. |
| MVP2-F6 | A freshness indicator shows when the feed was last updated. |
| MVP2-F7 | A "new headlines available" notice appears without reordering the list under the reader. |
| MVP2-F8 | The chosen page size (50 or 100) is remembered between visits. |
| MVP2-F9 | A footer states that headlines are provided via GNews and that articles belong to their publishers. |
| MVP2-F10 | The MVP1 controls that have shipped (date filter and any later ones) share the new design without changing behaviour. |

## 8. Non-functional requirements
Mobile performance budget: JavaScript under 150 KB gzipped for the feed page. No animation libraries. No component library or CSS framework unless Ben approves it.

## 9. Assumptions, risks and dependencies
| # | Item | How it is handled |
|---|---|---|
| R1 | Design taste is subjective | Produce two or three design options first. Ben picks one before code |
| R2 | Scope creep into new features | The out of scope list. Anything new goes to the backlog |
| R3 | MVP1 sub-sprints may still be in progress on the `mvp1` branch | MVP2 works on its own `mvp2` branch, brings `main` in before each pull request, and does not change filter logic |
| D1 | Login is access control, not UI | On the roadmap before public release (D-027). Placement is review item 68 |

## 10. Open questions
1. Design reference. Proposal: review three established business-news layouts for patterns, then produce design options. Needs Ben's choice of references.
2. Brand. Name, logo and colour for Watchtower, or neutral for now. Proposal: neutral.
3. "New headlines" notice. It needs the page to check for new headlines every few minutes through a small read-only endpoint. Proposal: check every 5 minutes. Keep it in MVP2, or move it to the backlog?

## 11. Agent guardrails
Same as PRD-MVP0. Plus: no visual change ships without a design Ben has picked, no change to filter or search behaviour, and no new npm package without approval.

## 12. Change log
| Version | Date | Change |
|---|---|---|
| 0.3 | 27 October 2026 | Renamed from MVP0.1 to MVP2 and moved after MVP1 (D-038). Covers the MVP1 controls (F10). Login placement removed from open questions (on the roadmap). "New headlines" notice open question added |
| 0.2 | 2 October 2026 | Word format. Out of scope heading. Login placement points to the roadmap |
| 0.1 | 2 October 2026 | First draft |
