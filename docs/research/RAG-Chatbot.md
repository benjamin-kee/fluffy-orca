# Research: AI question answering over Watchtower news (RAG chatbot)

> Research snapshot dated 2026-11-08, for MVP3 planning. Nothing here is approved. It proposes; Ben decides.

## 1. Question

How do leading news and business-intelligence products build AI chatbots that answer from news coverage, and what architecture should Watchtower use for MVP3?

### User problem

> As a user, I want to type a question about current affairs and get an immediate answer, with the articles the answer came from, so I can go and read them myself.

Example: *"What is the salary of the AirAsia CEO?"*

What Watchtower can do with that question today, checked against the live database on 8 November 2026 (read-only query, 1,798 stored headlines):

| Finding | Effect |
| --- | --- |
| 33 headlines mention AirAsia | Retrieval has material to work with |
| One headline matches the question almost word for word: "AirAsia CEO Salary in 2026" (id 7611, 7 November) | Search finds the right article |
| That headline contains no figure | A headline-only chatbot cannot state the salary. The best it can honestly say is "the headlines don't give the figure; this article covers it", with the link |

That one example sums up the whole decision. **What the chatbot can answer depends on what text Watchtower stores, not on which AI model it uses.** Watchtower stores headlines only (D-005, MVP0 spec). The model can find articles and summarise what headlines say, and it can send the reader to the article for anything more.

## 2. Answer in five lines

1. Every serious competitor answers **only from its own, rights-cleared content** and cites the articles. None lets the model answer from general knowledge.
2. The common architecture is retrieval-augmented generation (RAG): search the stored articles, give the best matches to the model, make it answer only from them with citations, and say so when they are not enough.
3. For Watchtower: hybrid search (keyword plus meaning) inside the existing Supabase Postgres, Claude for answers with built-in citations, and a server check that only allows citations to articles it actually retrieved. No new database, agent framework or web search.
4. MVP3 should answer from **headlines only**, the data Watchtower already holds, and send readers to the article when the headline is not enough. The eval suite in `evals/` is already built for exactly this.
5. Richer answers (salaries, figures, reasons) need article text. That is "Stage B", gated on a paid GNews plan and a rights check, because the publishers own the text.

## 3. Options compared

### 3.1 What competitors do

| Product | What it is | How its AI answers | Content it answers from | Lesson for Watchtower |
| --- | --- | --- | --- | --- |
| ScoutAsia (Nikkei and FT) | Asia company intelligence: news linked to 800,000+ companies | "Radar" AI monitoring with instant summaries, and "Scout AI" custom AI topics. No public evidence of an open question-and-answer chatbot (Unverified: scoutasia.com could not be reached from this session) | Licensed news from 50+ publications, plus company registry data | AI is organised around **companies**, not free text. It runs on licensed content |
| Bloomberg ASKB | Conversational AI layer on the Terminal, launched February 2026, generally available by October 2026 (trade press) | Agents search Bloomberg data, news and documents in parallel. Clients can add their own documents | Bloomberg's own data and news | Answers come from the owner's own corpus, built around entities and data |
| Ask FT (Financial Times) | Chatbot for FT Professional subscribers since March 2024, built on Anthropic's Claude | Searches the FT archive, summarises, cites FT articles | FT's own archive | Same model family Watchtower would use. Closed corpus with citations |
| Factiva Smart Summary (Dow Jones) | AI summaries in the Factiva research platform, since November 2024 | Summaries traceable to the source articles. Runs on Google Gemini | Only sources licensed for AI use: about 4,000 at launch, over 8,000 by January 2026 | Dow Jones signed separate **AI-use licences**. Publishers treat AI use as distinct from display |
| Ask The Post AI (Washington Post) | Chatbot over the paper's archive since 2016 | Answers only from its own reporting. Declines when there is not enough basis. Tells readers to confirm answers against the articles | Own archive | Refusing honestly and adding a disclaimer is normal practice |
| Perplexity | General answer engine | Live web search, an answer with citation links. Publisher revenue-share programme | The open web | Citations and links are expected. Faces publisher copyright lawsuits |
| Particle | AI news reader app | Answers questions about a story, then runs an extra step to find supporting material and check the answer | News coverage | A separate verification step catches errors |
| NewsGuard AI | News chatbot | Answers from sources it rates as reliable, with prominent links | Rated sources only | Restricting the source set is a quality control |

**Why the closed corpus matters.** A study coordinated by the EBU and led by the BBC (October 2025) checked over 3,000 news answers from ChatGPT, Copilot, Gemini and Perplexity in 18 countries. 45% had at least one significant issue, 31% had serious sourcing problems and 20% had major accuracy errors. General assistants that answer news questions from the open web or from memory get it wrong often. That is the failure Watchtower must avoid.

### 3.2 Best practices drawn from the above

1. **Closed, known corpus.** Answer only from content the product holds and has the right to use.
2. **Cite every claim** and link to the original article.
3. **Say "not enough information"** when the content does not answer the question, and show the closest articles instead of guessing.
4. **Show dates.** News answers go stale, so every source shows its publication date.
5. **Check the answer in code.** Drop any citation to an article that was not retrieved, and verify claims before showing them.
6. **Measure continuously** with a fixed test set and human review.
7. **Tell users to confirm** important facts in the article.

### 3.3 What the chatbot answers from (the main decision)

| Option | What it is | Can it answer "AirAsia CEO salary"? | Rights and decisions | Fit for MVP3 |
| --- | --- | --- | --- | --- |
| **A. Headlines only** | Use the headlines already stored | Finds the article and links it. Cannot give the figure | No change. Uses data already held under D-005 | **Recommended for MVP3** |
| B. Headline plus GNews description | Also store the one or two sentence description GNews returns, which the free plan includes | Sometimes, if the description carries the figure | Changes MVP0 (description is discarded today) and needs Ben's approval. Description text belongs to the publisher | Candidate follow-up after MVP3 measures how often headlines fall short |
| C. Full article text | GNews paid plans return full content (`expand=content`) | Usually | Paid plan (Essential, €49.99 a month). GNews terms: content belongs to publishers, "no permission to use this content for commercial purposes", and systematically storing substantial content to build a database is barred | This is "Stage B". Needs a written rights check (PRD-Later entry gate) |
| D. Live web search | The model searches the web per question | Yes | Conflicts with D-017 (GNews is the only news input) | Not recommended |
| E. Model's own knowledge | Let the model answer from what it already knows | Maybe, but unverifiable and possibly stale | Breaks the product promise of sourced answers | Rejected. The eval suite treats this as the top failure ("world-knowledge leakage") |

### 3.4 How it is built

| Part | Recommended | Alternatives considered | Why |
| --- | --- | --- | --- |
| Search | **Hybrid search in Supabase Postgres**: the existing full-text title index (migration 0005) plus `pgvector` embeddings, merged with Reciprocal Rank Fusion. Supabase documents this pattern | A separate vector database (Pinecone and similar); keyword only; meaning only | No new vendor. Keyword search catches names and numbers ("RM147,400"), meaning search catches paraphrases ("pay" vs "salary") |
| Embeddings | `gte-small`, which runs inside Supabase Edge Functions at no extra cost | A paid embedding API | Headlines are short and few (about 1,800). Swap only if evals show weak recall |
| Question understanding | One small model call turns follow-ups into a standalone question and pulls out date and source filters ("last week", "from a named publisher") | Rule-based parsing | The eval suite already tests rewrites and filters |
| Answer | Claude, given retrieved headlines as `search_result` blocks with citations turned on. Claude then cites the exact headline it used | Free-form answer with ids in text | Built-in citations are the API's supported RAG pattern and are harder to fake |
| Answer types | Three: answered; not in the headlines (covered, but the headlines do not say), with links; no coverage | Free text only | Matches the eval suite. The UI shows a fixed template for the two fallback cases |
| Guardrail | Server code keeps only citations to retrieved articles. Headlines are passed as data and never as instructions | Trust the model | Stops invented sources and headline-borne prompt injection |
| Speed | Stream the answer as it is written | Wait for the full answer | "Immediate" in the user problem. Eval target: 6 seconds at p95 |
| Display | Answer with numbered source cards: headline, publisher, date, link opening the original in a new tab | Inline links only | Same link-out behaviour as the feed (D-025). Desktop first, phone friendly (P-1) |
| Quality | Run `evals/` before every release. Log question, retrieved ids, answer, timing and cost | Manual spot checks | The dataset, metrics and judge prompts already exist |

Deliberately not used: agent frameworks, multi-agent setups, fine-tuning, a separate vector database, web search and full-text storage. Each adds cost or risk the user problem does not need.

### 3.5 Model choice

Prices from Anthropic's current price list, per million tokens (input / output). Per-question cost is an estimate for about 3,000 input tokens (instructions plus 20 headlines) and about 900 output tokens.

| Model | Price | Estimated cost per question | Role |
| --- | --- | --- | --- |
| Claude Haiku 5.5 | $0.10 / $0.50 | about $0.001 | Question rewriting and filter extraction. Possibly answers too, if evals allow |
| Claude Sonnet 5.5 | $2 / $10 | about $0.015 | Answer candidate |
| Claude Opus 5.5 | $4 / $20 | about $0.03 | Answer candidate, most capable of the three |

Recommendation: run the eval suite on the answer step with Opus 5.5 and Sonnet 5.5, then choose. The faithfulness and leakage targets decide, not price. A separate model (or version) acts as judge, as `evals/README.md` requires.

## 4. Recommendation

1. **MVP3 is "Ask Watchtower": headline-only question answering (option A)**, with cited, linked sources and an honest "the headlines don't say" when they fall short. It delivers the user problem's core (an immediate answer and where it came from) without new rights risk.
2. **Build it inside the current stack**: Supabase hybrid search, Claude with built-in citations, a server-side citation check, a streamed answer, and source cards.
3. **Measure the gap.** Log how often answers fall back to "not in the headlines". That number is the business case for option B or C.
4. **Treat article text (B, then C) as a separate decision**, after the rights check the PRD-Later entry gate already requires.
5. **Use the existing eval suite as the release gate**: zero false answers on the trick questions, faithfulness of at least 95%, and the other targets in `evals/README.md`.

## 5. Cost and effort

| | Private demo (now) | Public launch |
| --- | --- | --- |
| AI model calls | About $2 to $30 a month at 1,000 questions, depending on model (estimate) | Scales with use, at about $0.001 to $0.03 a question. Needs rate limits |
| Search and embeddings | $0: pgvector and gte-small come with Supabase | Same, unless the Supabase plan changes |
| News data | $0, GNews free plan, headlines only | GNews Essential, €49.99 a month, already required before launch (A-19). Option C needs a paid plan anyway |
| Login | Not needed, private demo (D-027) | Required before launch (LATER-F9), and stops anonymous spend on AI calls |
| New dependencies needing approval | Anthropic SDK and API key, `pgvector` extension, an embedding step on ingestion | Same |

Build effort for option A, in days of Claude Code work (estimate):

| Piece | Days |
| --- | --- |
| Embeddings for stored and new headlines, hybrid search function | 1.5 to 2 |
| Question rewriting and date and source filters | 1 |
| Answer with citations, three answer types, citation check | 1.5 |
| Chat page with streamed answers and source cards, desktop and phone | 2 |
| Eval runner over `evals/`, results summary | 2 |
| Logging of questions, timing and cost | 0.5 |
| **Total** | **8.5 to 9** |

## 6. Risks and legal points

- **Publisher rights.** GNews terms (last updated 18 October 2026): content belongs to its copyright holders, "no permission to use this content for commercial purposes is granted", and creating a database by systematically storing substantial API content is barred. Option A uses only the headline metadata Watchtower already stores, so it adds no new storage. Options B and C add publisher text and need the written rights check. Dow Jones's separate AI-use licences show publishers treat AI use as its own permission. This is research, not legal advice.
- **Wrong answers that look right.** The main product risk (BBC and EBU: 45% of assistant news answers had a significant issue). Mitigated by the closed corpus, built-in citations, the citation check, the eval gate and a "check the article" note.
- **Answers from the model's memory.** The model knows things like who runs a company, and may say them even when no headline does. The eval suite targets exactly this (world-knowledge traps).
- **Prompt injection.** Headlines come from third parties. They are passed as data, never as instructions. The eval suite has injection cases.
- **Data quality.** The eval README records about 71 headlines cut at a hyphen during ingestion ("tron sets Guinness World Record", missing "e-"). The chatbot must not fill in the missing words. Fixing ingestion first is cheaper.
- **Unhelpful fallbacks.** With headlines only, many "why", "how much" and "who exactly" questions end in "the headlines don't say". That is honest but can disappoint. The fallback rate is the number to watch.
- **Cost exposure.** Every question costs money. That doesn't matter for a private demo, but rate limits and login are needed before going public.
- **Data sent to a model provider.** Each question and its retrieved headlines go to Anthropic's API. Check the provider's data-use terms before launch (Unverified here).

## 7. What it would add to the roadmap

**Candidate milestone:** MVP3, "Ask Watchtower", on the `mvp3-rag` branch. This pulls LATER-F6 (AI-assisted research) forward, ahead of LATER-F3 and LATER-F4 (company extraction and profiles). That needs Ben's approval under the roadmap rule that later capabilities are not pulled forward without it.

**Proposed requirements (proposals only):**

1. A question box that answers in plain language, streamed as it is written.
2. Every answer cites the headlines it used. Each source shows headline, publisher and date, and opens the original article in a new tab.
3. Answers use only stored headlines, never the model's general knowledge.
4. When headlines cover a topic but do not answer the question, Watchtower says so and lists the closest headlines.
5. When nothing covers the topic, Watchtower says so plainly.
6. Follow-up questions in the same chat work ("Did the PM say anything about it?").
7. Date and source wording in a question narrows the search ("last week", "from a named publisher").
8. Desktop first and works on a phone (P-1).
9. A release passes the targets in `evals/README.md`.

**Stays out of scope for MVP3:** article text (options B and C), web search, saved chat history across visits, alerts, company profiles, login, and answers in languages other than English.

## 8. Open questions for Ben

1. Approve MVP3 as "Ask Watchtower", pulling LATER-F6 forward ahead of company extraction and profiles?
2. Corpus for MVP3: headlines only (option A, recommended), or also store the GNews description (option B)?
3. Is "the headlines don't say; here is the article" acceptable for questions like the AirAsia salary one in MVP3?
4. Approve the new dependencies: Anthropic SDK and API key, the `pgvector` extension, and embeddings on ingestion?
5. Model: let the eval results choose between Opus 5.5 and Sonnet 5.5 for answers? Is there a monthly spend ceiling for the demo?
6. Does MVP3 stay a private demo with no login?
7. Fix the hyphen truncation in ingestion before MVP3 starts?
8. The open spec decision in `evals/README.md`: when a date or source filter matches nothing but the topic is covered elsewhere, is the answer "no coverage" or "not in the headlines"?
9. Chat history: kept only for the current visit (proposed), or saved?
10. Where MVP3 sits relative to the MVP1 sub-sprints and MVP2, which are still drafts?

## 9. Sources

All checked 2026-11-08. Several competitor details come from trade press, not the company's own pages, and are marked so above.

| Title | URL |
| --- | --- |
| GNews pricing (official) | https://gnews.io/pricing |
| GNews Terms of Service, last updated 18 October 2026 | https://gnews.io/legal/terms-of-service |
| Nikkei and FT Group launch corporate data service scoutAsia | https://www.nikkei.co.jp/nikkeiinfo/en/news/press/445.html |
| ScoutAsia launches company research tool for Malaysia, Singapore and Vietnam (The Edge Malaysia) | https://theedgemalaysia.com/article/scoutasia-launches-company-research-tool-malaysia-singapore-vietnam |
| Nikkei collaborates with CTOS to develop news monitoring features | https://www.nikkei.co.jp/nikkeiinfo/en/news/announcements/1045.html |
| Introducing scoutAsia, April 2023 (product deck: Radar, Scout AI) | https://8929844.fs1.hubspotusercontent-na1.net/hubfs/8929844/Resources/Introducing%20ScoutAsia%20-%20APR%202023.pdf |
| Bloomberg introduces agentic AI to the Terminal (Markets Media) | https://www.marketsmedia.com/bloomberg-introduces-agentic-ai-to-the-terminal/ |
| Bloomberg widens ASKB access (IT Brief) | https://itbrief.co.uk/story/bloomberg-widens-askb-access-with-chat-file-links |
| How the FT developed an AI chatbot (Talking Biz News) | https://talkingbiznews.com/media-news/how-the-ft-developed-an-ai-chatbot |
| The Financial Times unveils generative AI tool for business subscribers (MediaPost) | https://www.mediapost.com/publications/article/394774/the-financial-times-unveils-generative-ai-tool-f.html |
| Dow Jones creates Factiva Smart Summary (MediaPost) | https://www.mediapost.com/publications/article/401097/dow-jones-creates-factiva-smart-summary-ai-based.html |
| Dow Jones Factiva surpasses 8,000 licensed sources for GenAI use (journalism.co.uk) | https://www.journalism.co.uk/dow-jones-factiva-surpasses-8-000-licensed-sources-for-genai-applications/ |
| Washington Post launches AI product (Gizmodo) | https://gizmodo.com/jeff-bezoss-washington-post-launches-an-ai-product-after-losing-250k-subscribers-2000521864 |
| Perplexity's trust and transparency pitch (Digiday) | https://digiday.com/media/media-briefing-perplexitys-new-trust-and-transparency-pitch-does-little-to-win-over-publishers/ |
| Particle launches an AI news app (TechCrunch) | https://techcrunch.com/2024/11/12/particle-launches-an-ai-news-app-to-help-publishers-instead-of-just-stealing-their-work |
| Nearly half of AI-generated answers contain an error: EBU and BBC report (journalism.co.uk) | https://www.journalism.co.uk/nearly-half-of-ai-generated-answers-contain-an-error-ebu-bbc-report/ |
| Supabase hybrid search guide | https://supabase.com/docs/guides/ai/hybrid-search |
| Supabase AI inference in Edge Functions (gte-small) | https://supabase.com/blog/ai-inference-now-available-in-supabase-edge-functions |
| Claude API: search results with citations | https://platform.claude.com/docs/en/build-with-claude/search-results |
| Claude model prices: Anthropic API skill reference, cached 2026-10-06 (Unverified against the live pricing page) | https://platform.claude.com/docs/en/about-claude/pricing |
| Watchtower database, read-only query on `public.articles` | Internal, 2026-11-08 |
