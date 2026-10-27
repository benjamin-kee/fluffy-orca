---
id: PRD-LATER
milestone: Later, not scheduled
status: Draft, opportunity brief
version: 0.2, 2 October 2026
owner: Ben (product manager and approver)
spec: none by design
decisions: D-017 to D-030 in the decision log
news_input: GNews API only
---

# PRD Later: Intelligence Layer Candidates

Nothing here is scheduled or approved. This is an opportunity brief that keeps the long-term direction visible without leaking into MVP0 to MVP1.

## 1. Summary
After search, Watchtower can move from a headline list toward investment due-diligence support: knowing which companies and topics a headline is about, building profiles, alerting, and answering research questions. This PRD ranks the candidates and sets the gate each must pass before it gets its own PRD.

## 2. Problem and outcome
The long-term direction (D-008) is a platform for investment due diligence: director relations, financials, accreditation and news. News alone does not do that. **Outcome of this brief:** a defensible order of work and a clear "not yet" for everything else.

## 3. Candidates in proposed order
| ID | Candidate | What it adds | Depends on | GNews angle |
|---|---|---|---|---|
| LATER-F1 | Article metadata | Defined set of derived fields beyond headline. Ben has not yet defined the term (B-003) | MVP1 shipped | Paid plans return description and content, but images and text belong to publishers. Storing them needs explicit approval |
| LATER-F2 | Topic tagging | Each headline gets one or more topics for browsing | LATER-F1 | Works on headline text alone |
| LATER-F3 | Company extraction and entity resolution | Names in headlines resolve to one company | LATER-F2 | Headline text. Spelling variants are the hard part |
| LATER-F4 | Company profiles | A page per company with its headline timeline | LATER-F3 | Uses stored history |
| LATER-F5 | Alerts | Notify on a company or keyword | LATER-F3 | Needs accounts, see LATER-F9 |
| LATER-F6 | AI-assisted research | Ask a question, get a sourced answer from stored coverage | LATER-F3, LATER-F4 | Full content would improve answers. Rights decide |
| LATER-F7 | Watchtower article page with licensed content | Read inside Watchtower | Written publisher permission or licensed provider | Paid plans expose full content, but GNews terms leave copyright with publishers |
| LATER-F8 | Wider coverage | Wider Asia (B-004) and non-English (B-005) | MVP1 | GNews supports many countries and 40 or more languages, so cheap to test |
| LATER-F9 | Login and access control | Accounts so only permitted people see Watchtower. Required before any public release (D-027). Proposal: its own milestone, MVP0.2 | MVP0 shipped | None. Placement is review item 68 |
| LATER-F10 | User behaviour analytics | Session recordings, heatmaps and click tracking to learn what is used and what is not. Research is delivered and awaits Ben's assessment | MVP0 shipped | None. Review item 69 |

## 4. Success metrics
Set per candidate when it is promoted. Gate metric for this brief: each promoted candidate has a one-paragraph value case and a named dependency already shipped.

## 5. Scope
### In scope
- Ranking, dependencies and entry gates

### Out of scope
- Requirements for build
- Schema changes
- Data ingestion beyond MVP0
- Any commitment of dates

## 6. Entry gate for promotion
A candidate becomes its own PRD only when: the previous milestone has shipped; Ben has defined any undefined term; a rights check on the data it needs is written down; and Ben approves the promotion. LATER-F9 is the exception on timing: it must ship before any public release.

## 7. Due-diligence direction
The Google Doc "Project SA Watchtower" lists director relations, finance and accreditation. Those need non-news data such as company registry data. They sit beyond LATER-F6 and need their own discovery. They are recorded only in the vision doc.

## 8. Assumptions, risks and dependencies
- Sequencing assumes each step feeds the next. Company profiles cannot come before entity resolution.
- Cost grows at LATER-F2 and above if an AI model is used per headline. Estimate before approval.
- Rights risk grows at LATER-F1, LATER-F6 and LATER-F7.
- Analytics adds privacy duties. Research covers these before any build.

## 9. Open questions
1. Define "article metadata" (B-003).
2. Which of LATER-F2 to LATER-F5 matters most to recruiters versus a future business case.
3. When to decide between portfolio-only and commercial path (D-016).
4. Where login sits on the roadmap, review item 68.
5. Whether and where user behaviour analytics enters the roadmap, review item 69.

## 10. Agent guardrails
Claude Code does not implement anything from this PRD. Specwright treats it as non-approved context.

## 11. Change log
| Version | Date | Change |
|---|---|---|
| 0.2 | 2 October 2026 | Word format. Out of scope heading. Added LATER-F9 login and LATER-F10 user behaviour analytics |
| 0.1 | 2 October 2026 | First draft |
