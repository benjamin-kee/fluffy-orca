---
id: PRD-MVP3
milestone: MVP3, Ask Watchtower
status: Draft for Ben's review
version: 0.4, 26 November 2026
owner: Ben (product manager and approver)
spec: SPEC-MVP3 v0.4 (draft)
decisions: D-043 to D-067 in the decision log
news_input: GNews API only, through headlines already stored
principles: Product-Principles P-1 (web first, mobile friendly) and P-2 (sorting names A to Z)
---

# PRD MVP3: Ask Watchtower

**Platform:** Ask Watchtower is designed for desktop browsers first, and every page must also work well on a phone. Every requirement here follows [Product-Principles](Product-Principles.md) P-1 (D-041).

**What Ben has approved so far.** Ben has approved these decisions:

- Ask Watchtower is MVP3 (D-043), and it comes before MVP2 (D-052).
- It answers from headlines only (D-044), never from the AI's own knowledge (D-047).
- The fallback wording and the link rules (D-045).
- The new dependencies (D-046).
- Speed to market, with a model evaluation after launch (D-048).
- Traceability and reader feedback (D-049).
- The `/ask` page (D-050).
- Claude Haiku 5.5 at launch (D-051, amended on 26 November).
- A US$10 monthly hard cap on AI spend, with the app pausing at US$5 (D-053).
- Login on the roadmap (D-054). There is no login in MVP3; MVP4 adds login and a paywall (D-056).
- Chat history for the current visit only (D-055).
- The AI note (D-057, with the wording in D-063 and the placement in D-062).
- The "Show 5 more" experiment (D-058).
- Never combining headlines (D-064).
- Written feedback in MVP3.0 (D-065).
- The follow-up notice (D-066).

Everything else is a proposal until Ben approves it. The research behind this PRD is in [RAG-Chatbot](../research/RAG-Chatbot.md). The detailed behaviour is in [SPEC-MVP3](../specs/SPEC-MVP3.md), which also has a glossary of technical terms in section 10.

## 1. Summary

Ask Watchtower is a page where a reader types a question about business news and gets a short answer written only from the headlines Watchtower has stored. Each answer has numbered sources that open the original articles. When the headlines cover a topic but don't answer the question, the reply is "The headlines don't say, check this article" with links to up to 5 relevant headlines. When no headline covers the topic, the reply says so. Ask Watchtower never answers from the AI's own knowledge, never gives investment advice, never searches the web and never stores article text. It ships in small sub-sprints, MVP3.0 to MVP3.4, and each one goes live on its own.

## 2. Problem and outcome

**Problem.** As a reader, I want to type a question on current affairs and get an immediate answer, with where it came from, so I can go and read the article myself. For example: "What is the salary of the AirAsia CEO?" Today the reader has to scan the feed or guess the right keywords.

**Outcome.** Within seconds, the reader gets either a sourced answer or the right article to read. Every claim can be checked by clicking its source. For example, Watchtower holds the headline "AirAsia CEO Salary in 2026" (7 November 2026), which gives no figure, so the reply is "The headlines don't say, check this article" with that article linked.

## 3. Users and jobs

- **Reader or analyst.** Readers want a quick, sourced answer about a company or event, and then to read the articles that matter.
- **Ben, as operator.** Ben wants to see what readers ask, which answers failed and why, and to keep AI spend inside the cap.
- **Recruiter.** Recruiters want to see a working, carefully guarded AI feature built on Watchtower's own data.

## 4. Success metrics

These metrics are measured by the eval suite in `evals/`, which is a set of fixed test questions with known correct behaviour, and, after launch, by trace records and reader ratings.

| Metric | Target | How it is checked |
| --- | --- | --- |
| Made-up answers to trick and attack questions | 0 | The eval suite's world-knowledge and injection cases |
| Faithfulness: the share of answers in which every claim is backed by a cited headline | 95% or more | The eval suite's faithfulness judge (from MVP3.4) |
| Citations that point to a headline Watchtower actually retrieved for the question | 100% | The eval suite and trace records |
| Fallback replies that include at least one useful link | 90% or more | `evals/useful-links.md` |
| Links shown in fallback replies that are useful | 90% or more | `evals/useful-links.md` |
| Answerable questions that Watchtower wrongly refuses | 15% or less | The eval suite |
| Time until the reply is complete | Within 6 seconds for 95% of questions | Trace records |
| Answers that readers rate as helpful | A target is set after two weeks of use | Reader ratings |
| "Show 5 more" experiment: how often readers open more headlines, and how often they click them | Measured, with no target. The result decides whether to keep the button | Trace records |
| AI spend | Never more than the US$10 a month hard cap. In practice spend stops at US$5, where the app pauses and Anthropic's limit applies | Trace records and Anthropic's workspace limit |

## 5. Scope

### In scope

- The `/ask` page, opened from a link on the feed (D-050).
- Answers written only from stored headlines, with numbered sources that are cited (D-044).
- Three reply types (D-045). The first is an answer. The second is the fallback, "The headlines don't say, check this article", with up to 5 links. The third is the no-coverage reply, which says no headline covers the topic.
- The conversation for the current visit, which is cleared when the reader leaves or reloads (D-055).
- Search by keyword, and from MVP3.1 also by meaning.
- From MVP3.2, follow-up questions, and limits by date or publisher written in the reader's own words.
- Guardrails, a trace record of every question, and reader feedback (D-049).
- The spend cap, the kill switch that turns the feature off, and an eval release gate for each sub-sprint.

### Out of scope

- **Answers from the AI's own knowledge (an explicit decision by Ben on 18 November 2026, D-047).** MVP3 answers only from stored headlines. When the headlines don't answer a question, even one with a widely known answer such as "Who founded AirAsia?", Watchtower replies "The headlines don't say, check this article" and links the closest relevant headlines. It never fills the gap from the model's memory.
  - *Why:* every answer must have a source the reader can check. Answers from memory can be out of date or wrong, readers can't tell them apart from sourced answers, and allowing them would undermine the eval suite's faithfulness and leakage checks.
  - *How it will be revisited:* Watchtower logs how often readers ask background questions like this. If there is clear demand, options will be assessed in a later milestone and decided by Ben. The candidates are a clearly labelled "Background" section limited to stable facts, or answers from a trusted reference source such as company profiles (LATER-F4).
- Chat history saved across visits. It is planned as a paid add-on after login (D-055).
- Login. There is no login in MVP3 (D-056). MVP4 adds login and a paywall for Ask Watchtower.
- Article descriptions or text, web search, and any news input other than GNews (D-017, D-044).
- Investment advice.
- Questions and answers in languages other than English.
- Alerts, company profiles, saved questions, and sharing an answer by link.
- Reusing earlier answers for similar questions, which is called answer caching.
- Grouping near-repeat links from one story (backlog B-010).

### Spend rhythm

AI spend has a hard cap of US$10 per calendar month, counted in Malaysia time (D-053). Within that cap, Watchtower pauses Ask Watchtower when the month's estimated spend reaches US$5 (Ben, 26 November 2026), and it resumes on the 1st of the next month. As a second safeguard, the API key used by readers sits in its own Anthropic Console workspace, which has a US$5 monthly limit, so Anthropic itself stops spend at US$5 even if Watchtower's estimate is wrong. Test runs use a separate workspace with a US$10 monthly limit, so they never use the readers' budget.

## 6. Release stages

Ben approves each sub-sprint before it starts. Each one ships on its own and goes live behind the kill switch.

| Sub-sprint | What readers get | Gate before release |
| --- | --- | --- |
| MVP3.0 First answers | Readers get the `/ask` page. They ask one question at a time and get a cited answer, a fallback reply or a no-coverage reply. They can rate each reply with thumbs up or down and add a written comment. Behind the scenes, search is by keyword, the AI's instructions are cached to save cost, a citation check blocks citations to headlines the AI was not given, a spend cap pauses the feature at US$5, a kill switch can turn it off, and every question leaves a basic trace record. | An eval run on single questions, checked by code only, as set out in SPEC-MVP3. |
| MVP3.1 Better search | Search finds headlines by meaning as well as by keyword, so a question about "job cuts" can find a headline about "layoffs". | Search quality targets. |
| MVP3.2 Conversation | Readers can ask follow-up questions, and can narrow a question with words such as "last week" or "from" a named publisher. | Targets for rewriting follow-ups and for picking out date and publisher limits. |
| MVP3.3 Confidence | Every number in an answer is checked against its headline. Investment-advice questions get a fixed note. Each visitor has a daily question limit. A thumbs down offers one-tap reasons. Trace records become complete, stage by stage. | All guardrail test cases pass. |
| MVP3.4 Full release gate | There are no new screens. AI judges grade answer quality, the useful-link suite checks fallback links, and regression checks compare each release with the last. | Every target in `evals/`. |
| Then B-009 | Watchtower compares AI models from several providers on the same tests. This must be done after launch (D-048). | |

## 7. Data and integration contract

**What Ask Watchtower reads.** It reads the `public.articles` table: the title, the publisher, the article link and the publication time of each headline. MVP3.0 adds no new article fields. MVP3.1 adds an embedding to each headline, which is a list of numbers that represents its meaning and makes meaning-based search possible (D-046).

**What Ask Watchtower writes.** It writes to two new tables. SPEC-MVP3 section 5 describes both in full.

- **The trace table** keeps one record for every question. A trace records what was asked, which headlines search found, what the AI wrote, which reply the reader saw, how long each step took and what it cost. Ben uses traces to find where a wrong answer went wrong, and the spend cap adds up the costs stored on them.
- **The ratings table** keeps each reader's thumbs up or down and any written comment, linked to the trace of the reply that was rated.

Neither table stores names, emails, IP addresses or logins. The page creates a random id for each browser tab, which links the questions asked in one visit without identifying the reader. A daily scheduled job deletes traces and ratings after 90 days (Ben, 26 November 2026). Only Watchtower's server can read or write these tables; browsers cannot.

**AI provider.** The AI provider is Anthropic, with Claude Haiku 5.5 at launch (D-051, amended), called through Anthropic's official software library. The API key sits in its own Anthropic Console workspace, limited to US$5 a month. For each question, Watchtower sends the question and up to 20 headlines, each with its title, publisher and date. The API key stays on the server. Prompt caching is on, so the fixed instructions are stored between questions and cost less (D-048).

**GNews.** Ask Watchtower makes no calls to GNews. It uses only the headlines that ingestion has already stored.

## 8. Functional requirements

| ID | Requirement | Sub-sprint |
| --- | --- | --- |
| MVP3-F1 | Readers open a page at `/ask` from an "Ask Watchtower" link beside the Watchtower title on the feed. | 3.0 |
| MVP3-F2 | A reader types a question and gets a reply, and the answer appears on screen as it is written. | 3.0 |
| MVP3-F3 | Answers use only stored headlines and never the AI's own knowledge, even for widely known facts. | 3.0 |
| MVP3-F23 | Answers never combine headlines; when an answer uses more than one, it says the points come from separate articles and names each publisher (D-064). | 3.0 |
| MVP3-F4 | Every answer shows numbered sources, each with its headline, publisher and date, and each opening the original article in a new tab. | 3.0 |
| MVP3-F5 | When headlines cover the topic but don't answer the question, the reply is "The headlines don't say, check this article" ("these articles" for more than one), with at most 5 links. | 3.0 |
| MVP3-F6 | When no headline covers the topic, the reply says so and shows no links. | 3.0 |
| MVP3-F7 | A short note saying the answer is an AI summary that may contain mistakes sits below the question box and below the "Show 5 more headlines" button, as a subtle light-orange notice (D-062, D-063). | 3.0 |
| MVP3-F8 | The page shows the questions and replies of the current visit, and reloading or leaving the page clears them. | 3.0 |
| MVP3-F9 | Readers can rate each reply with thumbs up or down and add an optional written comment (D-065). | 3.0 |
| MVP3-F10 | Every question leaves a trace record of what happened at each stage, basic in MVP3.0 and complete in MVP3.3. | 3.0 basic, 3.3 full |
| MVP3-F11 | Ask Watchtower pauses with a clear message when the month's spend reaches US$5. | 3.0 |
| MVP3-F12 | One setting switches Ask Watchtower off without affecting the feed. | 3.0 |
| MVP3-F13 | Search finds headlines by meaning as well as by keyword. | 3.1 |
| MVP3-F14 | Follow-up questions are understood in the context of the earlier questions in the visit. | 3.2 |
| MVP3-F15 | Date and publisher wording in a question narrows the headlines used. | 3.2 |
| MVP3-F16 | Every number in an answer must appear in a cited headline, or the fallback reply is shown instead. | 3.3 |
| MVP3-F17 | Requests for investment advice get the news plus a fixed note that Watchtower doesn't give investment advice. | 3.3 |
| MVP3-F18 | Each visitor can ask a limited number of questions per day. | 3.3 |
| MVP3-F19 | A thumbs down offers one-tap reasons for the rating. | 3.3 |
| MVP3-F20 | A release goes live only after it passes the eval targets for its sub-sprint. | All |
| MVP3-F21 | Readers can reveal up to 5 more related headlines under the first 5, as an experiment (D-058). | 3.0 |

## 9. Non-functional requirements

- **P-1, web first and mobile friendly.** The page is designed at desktop width, about 1280 pixels, first. It must work on screens from 320 pixels wide, and it is checked at 375 pixels.
- **Speed.** For 95% of questions, the reply is complete within 6 seconds.
- **Privacy.** Watchtower collects no personal details. Questions, traces and ratings are kept for 90 days and then deleted automatically. The comment box reminds readers not to include personal details.
- **Security.** The AI key and the database key stay on the server and are never sent to the browser. The new tables have the same protection as the `articles` table: the public cannot read or write them.
- **Reliability.** If the AI provider or the database fails, the page says "Ask Watchtower can't answer right now. Please try again later." The feed is not affected.
- **Cost.** AI spend never exceeds the US$10 monthly hard cap (D-053), and in practice stops at US$5 (section 5, Spend rhythm).
- **Accessibility.** The question box and all buttons have labels and can be used from the keyboard alone.

## 10. Assumptions, risks and dependencies

- **Headlines are short.** Many detailed questions will get the fallback reply, because a headline rarely holds the detail. That is by design (D-044, D-047). Watchtower logs how often it happens.
- **Test runs cost money.** Each MVP3.0 eval run costs about US$0.60, and the full model comparison (B-009) costs more than the readers' budget. Tests therefore run in their own workspace with a US$10 monthly limit.
- **No login at first.** Anyone with the link can ask questions. The spend cap, the kill switch and, from MVP3.3, a daily limit per visitor contain the risk. Login is required before wider use (D-054), and MVP4 adds it.
- **Cut-off headlines.** About 5% of headlines arrive from GNews already cut off at a hyphen; Watchtower's own code does not cut them. The AI is told never to fill in the missing words. Options for a fix are in backlog B-013.
- **Publisher rights.** Ask Watchtower uses only the headline information already stored, so it stores no new publisher text (research report, section 6).
- **Shared database.** Preview and live deployments use the same Supabase database. The new tables are additions and do not touch `articles`.
- **Dependencies.** Ben needs an Anthropic account with two Console workspaces: "Watchtower chatbot", limited to US$5 a month, and "Watchtower tests", limited to US$10 a month. The readers' key must be set in Vercel for Production and Preview.

## 11. Open questions

Reply by number, for example "7 yes".

1. ~~**Test-run budget.**~~ Answered on 26 November: Claude Haiku 5.5 at launch, on an Anthropic key limited to US$5 a month, with eval runs in a separate tests workspace limited to US$10 a month (SPEC-MVP3 R16).
2. ~~**Login timing.**~~ Answered on 26 November: there is no login in MVP3, and MVP4 adds login and a paywall (D-056).
3. ~~**Hyphen truncation.**~~ Answered on 26 November: fix it. On checking, GNews sends these headlines already cut, so Watchtower's code can't restore them. The options are in backlog B-013.
4. ~~**No-coverage wording.**~~ Answered on 26 November (D-061): "No Watchtower headlines cover this yet. Try asking about a company, market or event in the news."
5. ~~**AI note wording.**~~ Answered on 26 November (D-063): "This answer is an AI summary and may contain mistakes. Check the articles before relying on it."
6. ~~**Trace retention.**~~ Answered on 26 November 2026: 90 days.
7. **Answer key spot-check.** Ben needs to check cases 1 to 8 and 10 in `evals/answer-key-spot-check.md` before MVP3.0's release gate can run. For each case, Ben confirms whether the expected reply is right.

## 12. Agent guardrails

- Claude Code builds only the sub-sprint Ben has approved, exactly as written in SPEC-MVP3. For anything else, it stops and asks (`CLAUDE.md`).
- Claude Code never makes the AI answer from its own knowledge, never adds web search and never stores article text (D-044, D-047).
- Claude Code never puts an API key in code, a commit or a chat message. Keys live only in environment settings.
- Claude Code never changes the AI model except through the B-009 evaluation and Ben's approval.
- No PRD or spec names a publisher (D-026).
- Claude Code never raises the spend cap. Only Ben can.

## 13. Change log

| Version | Date | Change |
| --- | --- | --- |
| 0.4 | 2026-11-26 | Rewritten in full sentences (D-067). The data contract now explains the trace and ratings tables. Brought in line with decisions already made: the readers' Anthropic limit is US$5 and the tests workspace is US$10, retention is 90 days, the cut-off headlines come from GNews (B-013), and the AI note wording is D-063. F11 now names the US$5 pause point instead of "when the cap is near". No other requirement changed |
| 0.3 | 2026-11-26 | AI note wording (D-063); never combine headlines (F23, D-064); written feedback in MVP3.0 (F9, D-065) |
| 0.2 | 2026-11-26 | Claude Haiku 5.5 at launch; key limited to US$5; no login in MVP3, MVP4 for login and paywall; AI note approved; "Show 5 more" experiment (F21) |
| 0.1.1 | 2026-11-26 | Pause at US$5 of monthly spend; 90-day retention |
| 0.1 | 2026-11-18 | First draft, from the RAG-Chatbot research and Ben's decisions D-043 to D-055 |
