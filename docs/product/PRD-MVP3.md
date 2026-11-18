---
id: PRD-MVP3
milestone: MVP3, Ask Watchtower
status: Draft for Ben's review
version: 0.1, 18 November 2026
owner: Ben (product manager and approver)
spec: SPEC-MVP3 v0.1 (draft)
decisions: D-043 to D-055 in the decision log
news_input: GNews API only, through headlines already stored
principles: Product-Principles P-1 (web first, mobile friendly) and P-2 (sorting names A to Z)
---

# PRD MVP3: Ask Watchtower

**Platform:** web first, mobile friendly. Every requirement here follows [Product-Principles](Product-Principles.md) P-1 (D-041).

Approved: Ask Watchtower as MVP3 (D-043), headlines only (D-044), fallback wording and link rules (D-045), new dependencies (D-046), no answers from the AI's own knowledge (D-047), speed to market with a model evaluation after launch (D-048), traceability and reader feedback (D-049), the `/ask` page (D-050), Claude Sonnet 5.5 at launch (D-051), MVP3 before MVP2 (D-052), a US$10 monthly AI spend cap (D-053), login on the roadmap (D-054) and chat history for the current visit only (D-055). Everything else is a proposal until Ben approves it. Research behind this PRD: [RAG-Chatbot](../research/RAG-Chatbot.md).

## 1. Summary

Ask Watchtower is a page where a reader types a question about business news and gets a short answer written only from the headlines Watchtower has stored, with numbered sources that open the original articles. When the headlines cover a topic but don't answer the question, it replies "The headlines don't say, check this article" and links up to 5 relevant headlines. When nothing covers the topic, it says so. It never answers from the AI's own knowledge, never gives investment advice, never searches the web and never stores article text. It ships in small sub-sprints, MVP3.0 to MVP3.4, each live on its own.

## 2. Problem and outcome

**Problem.** As a reader, I want to type a question on current affairs and get an immediate answer, with where it came from, so I can go and read the article myself. Example: "What is the salary of the AirAsia CEO?" Today the reader has to scan the feed or guess keywords.

**Outcome.** A reader gets, within seconds, either a sourced answer or the right article to read. Every claim can be checked by clicking its source. Example: Watchtower holds the headline "AirAsia CEO Salary in 2026" (7 November 2026), which has no figure, so the reply is "The headlines don't say, check this article" with that article linked.

## 3. Users and jobs

- **Reader or analyst.** Get a quick, sourced answer about a company or event, then read the articles that matter.
- **Ben, as operator.** See what readers ask, which answers failed and why, and keep AI spend inside the cap.
- **Recruiter.** See a working, carefully guarded AI feature built on Watchtower's own data.

## 4. Success metrics

Measured by the eval suite in `evals/` (fixed test questions) and, after launch, by logs and reader ratings.

| Metric | Target | How it is checked |
| --- | --- | --- |
| Made-up answers on trick and attack questions | 0 | Eval suite, world-knowledge and injection cases |
| Faithfulness: answers where every claim is backed by a cited headline | 95% or more | Eval suite, faithfulness judge (from MVP3.4) |
| Citations that point to a headline Watchtower retrieved | 100% | Eval suite and trace records |
| Fallback replies with at least one useful link | 90% or more | `evals/useful-links.md` |
| Links shown in fallback replies that are useful | 90% or more | `evals/useful-links.md` |
| Answerable questions wrongly refused | 15% or less | Eval suite |
| Reply complete | 95% within 6 seconds | Trace records |
| Answers rated helpful by readers | Set after two weeks of use | Reader ratings |
| AI spend | US$10 a month or less, never exceeded | Trace records and the provider's limit |

## 5. Scope

### In scope

- The `/ask` page, linked from the feed (D-050).
- Answers from stored headlines only, with cited, numbered sources (D-044).
- Three reply types: answer; "The headlines don't say, check this article" with up to 5 links; no coverage (D-045).
- The conversation for the current visit (D-055).
- Search by keyword and by meaning (from MVP3.1).
- Follow-up questions, and date and publisher wording in a question (from MVP3.2).
- Guardrails, traceability and reader feedback (D-049).
- The US$10 monthly spend cap, the kill switch and the eval release gate.

### Out of scope

- **Answers from the AI's own knowledge (explicit decision, Ben, 18 November 2026, D-047).** MVP3 answers only from stored headlines. When the headlines don't answer a question, even one with a widely known answer such as "Who founded AirAsia?", Watchtower replies "The headlines don't say, check this article" and links the closest relevant headlines. It never fills the gap from the model's memory.
  - *Why:* every answer must have a source the reader can check. Memory answers can be stale or wrong, users can't tell them apart from sourced answers, and allowing them would undermine the eval suite's faithfulness and leakage checks.
  - *How it will be revisited:* Watchtower logs how often users ask background questions like this. If demand is shown, options will be assessed in a later milestone and decided by Ben. The candidates are a clearly labelled "Background" section, limited to stable facts, or answers from a trusted reference source such as company profiles (LATER-F4).
- Saved chat history across visits. Planned as a paid add-on later, after login (D-055).
- Login. On the roadmap and required to use this feature beyond the demo (D-054). Timing is open question 2.
- Article descriptions or text, web search, and any news input other than GNews (D-017, D-044).
- Investment advice.
- Questions and answers in languages other than English.
- Alerts, company profiles, saved questions, sharing an answer by link.
- Reusing earlier answers for similar questions (answer caching).
- Grouping near-repeat links from one story (backlog B-010).

### Spend rhythm

AI spend is capped at US$10 per calendar month, Malaysia time (D-053). Watchtower pauses Ask Watchtower before the cap is reached and resumes on the 1st. The provider's own monthly limit is set at US$10 as a backstop.

## 6. Release stages

Each sub-sprint is approved by Ben before it starts, ships on its own and goes live behind the kill switch.

| Sub-sprint | What readers get | Gate before release |
| --- | --- | --- |
| MVP3.0 First answers | The `/ask` page: one question at a time, cited answers, the three reply types, thumbs up or down. Keyword search. Prompt caching, citation check, spend cap, kill switch, basic traces | Eval run on single questions, code checks only (SPEC-MVP3) |
| MVP3.1 Better search | Search by meaning as well as keywords | Search quality targets |
| MVP3.2 Conversation | Follow-up questions; "last week", "from" a named publisher | Rewrite and filter targets |
| MVP3.3 Confidence | Number check, advice note, rate limit, feedback reasons and comments, full traces | Guardrail cases pass |
| MVP3.4 Full release gate | No new screens. AI judges, the useful-link suite, regression checks | Every target in `evals/` |
| Then B-009 | Model comparison across providers (must do, D-048) | |

## 7. Data and integration contract

- **Reads** `public.articles`: title, source, article link, publication time. No new article fields in MVP3.0. MVP3.1 adds an embedding per headline (D-046).
- **Writes** two new tables: a trace record per question and reader ratings. No names, emails, IP addresses or logins. A random id per browser tab links one visit's questions. Kept 90 days (proposed).
- **AI provider:** Anthropic, Claude Sonnet 5.5 at launch (D-051), through Anthropic's official SDK. Each question sends the question and up to 20 headlines (title, publisher, date). The API key stays on the server. Prompt caching is on (D-048).
- **GNews:** no calls. Ask Watchtower uses only what ingestion has already stored.

## 8. Functional requirements

| ID | Requirement | Sub-sprint |
| --- | --- | --- |
| MVP3-F1 | A page at `/ask`, opened from an "Ask Watchtower" link beside the Watchtower title on the feed | 3.0 |
| MVP3-F2 | A reader types a question and gets a reply, with the answer appearing as it is written | 3.0 |
| MVP3-F3 | Answers use only stored headlines, never the AI's own knowledge, even for widely known facts | 3.0 |
| MVP3-F4 | Every answer shows numbered sources: headline, publisher and date, each opening the original article in a new tab | 3.0 |
| MVP3-F5 | When headlines cover the topic but don't answer, the reply is "The headlines don't say, check this article" ("these articles" for more than one), with at most 5 links | 3.0 |
| MVP3-F6 | When nothing covers the topic, the reply says so, with no links | 3.0 |
| MVP3-F7 | Every answer carries a short note that it is an AI summary of headlines | 3.0 |
| MVP3-F8 | The page shows the visit's questions and replies. Reloading or leaving clears them | 3.0 |
| MVP3-F9 | Readers rate each reply with thumbs up or down | 3.0 |
| MVP3-F10 | Every question leaves a trace record, stage by stage | 3.0 basic, 3.3 full |
| MVP3-F11 | Ask Watchtower pauses with a clear message when the monthly spend cap is near | 3.0 |
| MVP3-F12 | One setting switches Ask Watchtower off without affecting the feed | 3.0 |
| MVP3-F13 | Search finds headlines by meaning as well as by keyword | 3.1 |
| MVP3-F14 | Follow-up questions are understood in the context of the conversation | 3.2 |
| MVP3-F15 | Date and publisher wording in a question narrows the headlines used | 3.2 |
| MVP3-F16 | Every number in an answer must appear in a cited headline, or the fallback reply is shown | 3.3 |
| MVP3-F17 | Requests for investment advice get the news plus a fixed note that Watchtower doesn't give advice | 3.3 |
| MVP3-F18 | Each visitor has a question limit per day | 3.3 |
| MVP3-F19 | A thumbs down offers reasons and a comment box | 3.3 |
| MVP3-F20 | A release passes the eval targets for its sub-sprint | All |

## 9. Non-functional requirements

- **P-1.** Designed at desktop width (about 1280px) first; works from 320px wide, checked at 375px.
- **Speed.** Replies complete within 6 seconds for 95% of questions.
- **Privacy.** No personal details collected. Questions are kept 90 days (proposed), then deleted.
- **Security.** The AI key and database key stay on the server. New tables follow the `articles` table: no public access.
- **Reliability.** If the AI provider or database fails, the page says Ask Watchtower can't answer right now. The feed is unaffected.
- **Cost.** US$10 a month hard cap (D-053).
- **Accessibility.** The question box and buttons have labels and work from the keyboard.

## 10. Assumptions, risks and dependencies

- **Headlines are short.** Many detail questions get the fallback reply. That is by design (D-044, D-047). How often is logged.
- **Spend cap and test runs.** The full model comparison (B-009) costs more than US$10 on its own. See open question 1.
- **No login at first.** Anyone with the link can ask. The spend cap, the kill switch and (from MVP3.3) a per-visitor limit contain the risk. Login is required before wider use (D-054).
- **Headlines cut at hyphens** during ingestion (about 71 found). The AI must not fill in missing words; fixing ingestion is open question 3.
- **Publisher rights.** Uses only stored headline metadata, so no new storage of publisher text (research report, section 6).
- **Shared database.** Preview and live deployments use the same Supabase database. New tables are additive and do not touch `articles`.
- **Dependencies:** an Anthropic account with an API key and a US$10 monthly limit; the key set in Vercel for Production and Preview.

## 11. Open questions

Reply by number, for example "2 yes".

1. **Test-run budget.** Eval runs during the build and for B-009 cost money (about US$0.60 per MVP3.0 run, US$40 to US$60 for B-009). Run them on a separate API key with its own limit (proposed: US$20 for the MVP3 build and B-009), outside the US$10 reader cap?
2. **Login timing.** MVP3.0 goes live on the demo link without login, protected by the spend cap and kill switch, with login required before Ask Watchtower is shared more widely (proposed)? Or must login ship first?
3. **Hyphen truncation.** Fix headline ingestion before MVP3.0 (proposed: a small separate fix, about half a day), or after MVP3?
4. **No-coverage wording.** "Watchtower has no headlines on this yet." (proposed)?
5. **AI note wording.** "AI summary of Watchtower headlines. Check the articles for details." (proposed)?
6. **Trace retention.** Keep questions and traces for 90 days (proposed)?
7. **Answer key spot-check.** Cases 1 to 8 and 10 in `evals/answer-key-spot-check.md`, needed before MVP3.0's release gate.

## 12. Agent guardrails

- Claude Code builds only the sub-sprint Ben has approved, as written in SPEC-MVP3. Anything else stops and asks (`CLAUDE.md`).
- Never answer from the AI's own knowledge, never add web search, never store article text (D-044, D-047).
- Never put an API key in code, a commit or a chat message. Keys live in environment settings.
- Never change the model except through the B-009 evaluation and Ben's approval.
- Never name a publisher in a PRD or spec (D-026).
- Never raise the spend cap; only Ben can.

## 13. Change log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-11-18 | First draft, from the RAG-Chatbot research and Ben's decisions D-043 to D-055 |
