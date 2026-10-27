---
id: SPEC-MVP1
prd: PRD-MVP1
prd_version: 0.1
status: Draft
version: 0.1-draft
---

# MVP1 Specification: Keyword Search

**Status:** Draft. Not approved for implementation. R1 and R2 are approved (D-002, D-005). R3 to R12 are proposals.
**Last updated:** 2026-10-02
**Implements:** PRD-MVP1 v0.1

## Requirements
| ID | Requirement | Implements | State |
|---|---|---|---|
| MVP1-R1 | The system shall provide keyword search across collected news. | F1 | Approved |
| MVP1-R2 | Search shall match headline text only. | F2 | Approved |
| MVP1-R3 | A search box on the feed page shall submit a query of 1 to 200 characters. | F1 | Proposal |
| MVP1-R4 | Matching shall use Postgres full-text search with the English configuration and `websearch_to_tsquery`. All words must match; quoted text matches as a phrase. | F3 | Proposal |
| MVP1-R5 | An expression index on `to_tsvector('english', title)` shall support search. No new column. | F2 | Proposal |
| MVP1-R6 | Results shall be ordered newest first by `published_at`. | F4 | Proposal |
| MVP1-R7 | Result items shall use the feed item layout and open `article_url` in a new tab. | F5 | Proposal |
| MVP1-R8 | Results shall use numbered pagination with the 50 or 100 selector, sharing the user's chosen page size. | F6 | Proposal |
| MVP1-R9 | Matched words shall be highlighted in the headline text. | F7 | Proposal |
| MVP1-R10 | A query with no results shall show a message, search tips and a link to the feed. | F8 | Proposal |
| MVP1-R11 | The query and page shall appear in the URL as `?q=`, `page=` and `size=`. | F9 | Proposal |
| MVP1-R12 | Search shall make no outbound network calls and shall use parameterized queries only. | F2 | Proposal |
| MVP1-R13 | Filters by source and date range. Not included until Ben approves. | F10 | Held |

## Acceptance criteria (DRAFT)
| Req | Given | When | Then |
|---|---|---|---|
| R4 | A stored headline "Maybank raises dividend" | Search `maybank dividend` | The headline is returned |
| R4 | Same headline | Search `"dividend raises"` | Not returned, phrase order differs |
| R4 | A stored headline "Banks cut rates" | Search `bank` | The headline is returned |
| R6 | 3 matches with different dates | Search | Newest first |
| R8 | 120 matches | Search with size 50 | 3 pages, page 3 holds 20 |
| R9 | Match for `dividend` | Results render | The word is wrapped in a highlight element, and the text is escaped |
| R10 | No match | Search `zzzqx` | Message and tips shown, no error |
| R11 | `/?q=petronas&page=2` | Page opens | Same results as before |
| R12 | Any search | Executed | Zero GNews requests in logs |
| R3 | Query with 201 characters | Submitted | Rejected with a short message |

## Out of scope
Body search, semantic or vector search, AI answers, autocomplete, saved searches, alerts, search analytics, relevance sort, live GNews search.

## Open questions
Q1 matching rules, Q2 sort, Q3 filters, Q4 display, Q5 pagination reuse. Each has the proposal above. Reply by number to approve.

## Change log
- 0.1-draft (2026-10-02): Proposals added to approved R1 and R2.
