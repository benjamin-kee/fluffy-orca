---
id: PRD-MVP1
milestone: MVP1, third of the Watchtower roadmap
status: Draft, R1 and R2 approved, rest proposals
version: 0.2, 2 October 2026
owner: Ben (product manager and approver)
spec: SPEC-MVP1 (draft)
decisions: D-017 to D-030 in the decision log
news_input: GNews API only
---

# PRD MVP1: Keyword Search

Approved so far: keyword search across collected news (D-002), headline text only (D-005). Everything else below is a proposal.

## 1. Summary
MVP1 adds a search box to Watchtower. It searches the headlines Watchtower has already stored, not GNews live, and returns matches newest first. It never searches article bodies, never calls the GNews Search endpoint and never calls an AI model.

## 2. Problem and outcome
A chronological feed answers "what is new". Readers also ask "what happened with X". **Outcome:** a user types a company, person or topic and sees every stored headline that mentions it, from the earliest stored date onward.

## 3. Users and jobs
- **Reader or analyst.** Find prior coverage of a company or topic.
- **Recruiter.** See that the product has a second, distinct capability beyond the feed.

## 4. Success metrics
| Metric | Target | How it is checked |
|---|---|---|
| Search latency | 95th percentile under 500 ms | Logged server timing |
| Known-item test | 10 of 10 hand-picked stored headlines are found by a distinctive word | Test script |
| No-result handling | Every empty search shows guidance, never a blank page | Manual check |
| GNews requests used by search | Zero | Request logs |

## 5. Scope
### In scope
- A search box on the feed page
- Headline-only full-text matching
- Results shown with the feed item layout
- Shared 50 or 100 numbered pagination
- Highlighting of matched terms
- An empty state with tips
- A shareable URL that holds the query
- Optional source and date-range filters, held until Ben approves

### Out of scope
- Body-text search and summaries
- Semantic or vector search
- AI answers
- Saved searches and alerts
- Autocomplete
- Search analytics and per-user history
- Live GNews search calls

## 6. Data contract
Search reads the existing `title` column. Proposal: a Postgres full-text expression index on `to_tsvector('english', title)`. No new column. If Ben prefers a stored column, Claude Code asks first.
Why Watchtower does not use the GNews Search endpoint: it spends daily request quota, only covers what GNews holds, and would make results differ from the stored feed.

## 7. Functional requirements
| ID | Requirement |
|---|---|
| MVP1-F1 | A search box on the feed page submits a keyword query. |
| MVP1-F2 | Search matches headline text only, across all stored articles. |
| MVP1-F3 | All words must match. Words in quotes match as a phrase. English word forms match, so "bank" finds "banks". |
| MVP1-F4 | Results are newest first by default. |
| MVP1-F5 | Each result looks like a feed item and opens the publisher article in a new tab. |
| MVP1-F6 | Results use the same 50 or 100 numbered pagination. |
| MVP1-F7 | Matched words are highlighted in the headline. |
| MVP1-F8 | An empty result shows a message with search tips and a link back to the feed. |
| MVP1-F9 | The query is in the URL so a search can be shared and reloaded. |
| MVP1-F10 | Optional, needs approval: filter by source and by date range. |

## 8. Non-functional requirements
Query length capped at 200 characters. Queries are parameterized, never concatenated into SQL. Search never makes outbound calls.

## 9. Assumptions, risks and dependencies
| # | Item | How it is handled |
|---|---|---|
| R1 | Headline-only recall is lower than body search | Accepted by D-005. Body search is backlog B-002 |
| R2 | English stemming misses Malay terms and some names | English-only scope (D-014) |
| R3 | Company names appear in many spellings | Later milestone: entity resolution |
| D1 | Needs MVP0 history loaded to be useful | Backfill complete |

## 10. Open questions
1. Matching. Proposal: AND semantics, quoted phrases, English stemming.
2. Sort. Proposal: newest first only. Relevance sort deferred.
3. Filters. Proposal: source and date range are a should-have, decided after core search ships.
4. Display. Proposal: highlight terms, empty state with tips.
5. Pagination. Proposal: reuse MVP0 pagination.

## 11. Agent guardrails
Claude Code adds no search engine, vector store or external service. An index on `title` is allowed once the spec is approved. Anything beyond headline text stops and asks.

## 12. Change log
| Version | Date | Change |
|---|---|---|
| 0.2.1 | 27 October 2026 | Outcome no longer promises history from 1 January 2026; MVP0 keeps 30 days of backfilled history (spec approved change 6) |
| 0.2 | 2 October 2026 | Word format. Out of scope heading. Clarified that this is not the GNews Search endpoint |
| 0.1 | 2 October 2026 | First draft |
