# Research: AI question answering over Watchtower news (RAG chatbot)

> Research snapshot dated 2026-11-08, updated 2026-11-18 (prices, Ben's first answers, and Appendix A with follow-up questions). For MVP3 planning. It proposes; Ben decides.

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
| Embeddings | `gte-small`, which runs inside Supabase Edge Functions at no extra cost (details in Appendix A.6) | A paid embedding API | Headlines are short and few (2,199 on 18 November). Swap only if evals show weak recall |
| Question understanding | One small model call turns follow-ups into a standalone question and pulls out date and source filters ("last week", "from a named publisher") | Rule-based parsing | The eval suite already tests rewrites and filters |
| Answer | Claude, given retrieved headlines as `search_result` blocks with citations turned on. Claude then cites the exact headline it used | Free-form answer with ids in text | Built-in citations are the API's supported RAG pattern and are harder to fake |
| Answer types | Three: answered; not in the headlines (covered, but the headlines do not say), with links; no coverage | Free text only | Matches the eval suite. The UI shows a fixed template for the two fallback cases |
| Guardrail | Server code keeps only citations to retrieved articles. Headlines are passed as data and never as instructions | Trust the model | Stops invented sources and headline-borne prompt injection |
| Speed | Stream the answer as it is written | Wait for the full answer | "Immediate" in the user problem. Eval target: 6 seconds at p95 |
| Display | Answer with numbered source cards: headline, publisher, date, link opening the original in a new tab | Inline links only | Same link-out behaviour as the feed (D-025). Desktop first, phone friendly (P-1) |
| Quality | Run `evals/` before every release. Log question, retrieved ids, answer, timing and cost | Manual spot checks | The dataset, metrics and judge prompts already exist |

Deliberately not used: agent frameworks, multi-agent setups, fine-tuning, a separate vector database, web search and full-text storage. Each adds cost or risk the user problem does not need.

### 3.5 Model choice

Prices checked 2026-11-18, in US dollars per million tokens (input / output). Anthropic prices come from Anthropic's pricing page; the others from the Vercel AI Gateway model catalog, which lists providers' prices (a provider's own page can differ). Cost per question assumes about 3,000 input tokens (instructions plus about 20 headlines) and about 900 output tokens for the answer step. The question-rewriting step adds about $0.0001 on a small model.

| Provider and model | Tier | Price | Per question | 100 questions | 1,000 questions |
| --- | --- | --- | --- | --- | --- |
| Anthropic Claude Opus 5.5 | Top | $4 / $20 | $0.030 | $3.00 | $30.00 |
| Anthropic Claude Sonnet 5.5 | Mid | $2 / $10 | $0.015 | $1.50 | $15.00 |
| Anthropic Claude Haiku 5.5 | Small | $0.10 / $0.50 | $0.0008 | $0.08 | $0.75 |
| OpenAI GPT-5.5 | Top | $5 / $30 | $0.042 | $4.20 | $42.00 |
| OpenAI GPT-5.4 | Mid | $2.50 / $15 | $0.021 | $2.10 | $21.00 |
| OpenAI GPT-5.4 mini | Small | $0.75 / $4.50 | $0.006 | $0.63 | $6.30 |
| Google Gemini 3.1 Pro (preview) | Top | $2 / $12 | $0.017 | $1.68 | $16.80 |
| Google Gemini 3.8 Flash | Mid | $0.75 / $3.75 | $0.006 | $0.56 | $5.60 |
| DeepSeek V4 Flash (open model, China-based company) | Small | $0.13 / $0.26 | $0.0006 | $0.06 | $0.62 |

Points that matter more than price:

- **Quality decides.** Every option is cheap at demo scale. Run the eval suite on a shortlist (Claude Sonnet 5.5, Claude Haiku 5.5, Gemini 3.8 Flash, GPT-5.4 mini) and pick the cheapest that passes the faithfulness and leakage targets.
- **Built-in citations are Claude-specific.** With Claude, each sentence is tied to the headline it came from. With other providers, Watchtower asks the model to list article ids and checks them in code. That works, but it means more custom code.
- **Prompt caching** cuts the cost of the fixed instructions sent with every question. On Claude Sonnet 5.5, cached input costs $0.10 instead of $2 per million tokens.
- **Switching providers later.** The Vercel AI Gateway, on the hosting Watchtower already uses, can route to any of these with one setting. Whether Claude's citation feature works through it is Unverified.
- **Data location.** Each question and its headlines go to the chosen provider. Check where it processes data, especially for a provider based outside Malaysia's usual partners.

A separate model (or version) acts as judge, as `evals/README.md` requires.

## 4. Recommendation

1. **MVP3 is "Ask Watchtower": headline-only question answering (option A)**, with cited, linked sources and an honest "the headlines don't say" when they fall short. It delivers the user problem's core (an immediate answer and where it came from) without new rights risk.
2. **Build it inside the current stack**: Supabase hybrid search, an AI model chosen by the evals (Claude has built-in citations, section 3.5), a server-side citation check, a streamed answer, and source cards.
3. **Measure the gap.** Log how often answers fall back to "not in the headlines". That number is the business case for option B or C.
4. **Treat article text (B, then C) as a separate decision**, after the rights check the PRD-Later entry gate already requires.
5. **Use the existing eval suite as the release gate**: zero false answers on the trick questions, faithfulness of at least 95%, and the other targets in `evals/README.md`.

## 5. Cost and effort

| | Private demo (now) | Public launch |
| --- | --- | --- |
| AI model calls | About $1 to $42 a month at 1,000 questions, depending on model (estimate, section 3.5) | Scales with use, at about $0.001 to $0.04 a question. Needs rate limits |
| Search and embeddings | $0: pgvector and gte-small come with Supabase | Same, unless the Supabase plan changes |
| News data | $0, GNews free plan, headlines only | GNews Essential, €49.99 a month, already required before launch (A-19). Option C needs a paid plan anyway |
| Login | Not needed, private demo (D-027) | Required before launch (LATER-F9), and stops anonymous spend on AI calls |
| New dependencies needing approval | An AI provider's SDK and API key (Anthropic or an alternative), `pgvector` extension, an embedding step on ingestion | Same |

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
- **Data sent to a model provider.** Each question and its retrieved headlines go to the chosen provider's API. Check the provider's data-use terms before launch (Unverified here).

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

1. Approve MVP3 as "Ask Watchtower", pulling LATER-F6 forward ahead of company extraction and profiles? **Ben, 14 November: yes.** Not yet recorded in the decision log.
2. Corpus for MVP3: headlines only (option A, recommended), or also store the GNews description (option B)? **Ben, 14 November: headlines only.** Not yet recorded in the decision log.
3. Is "the headlines don't say; here is the article" acceptable for questions like the AirAsia salary one in MVP3? Explained in Appendix A.1. Open.
4. Approve the new dependencies: an AI provider's SDK and API key, the `pgvector` extension, and embeddings on ingestion? Explained in Appendix A.4 to A.7, alternatives in section 3.5. Open.
5. Model: let the eval results choose from a shortlist across providers (section 3.5)? Is there a monthly spend ceiling for the demo?
6. Does MVP3 stay a private demo with no login?
7. Fix the hyphen truncation in ingestion before MVP3 starts?
8. The open spec decision in `evals/README.md`: when a date or source filter matches nothing but the topic is covered elsewhere, is the answer "no coverage" or "not in the headlines"?
9. Chat history: kept only for the current visit (proposed), or saved?
10. Where MVP3 sits relative to the MVP1 sub-sprints and MVP2, which are still drafts?

## 9. Sources

Checked 2026-11-08 unless marked 2026-11-18. Several competitor details come from trade press, not the company's own pages, and are marked so above.

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
| Watchtower database, read-only queries on `public.articles` | Internal, 2026-11-08 and 2026-11-18 |
| Anthropic pricing (2026-11-18) | https://platform.claude.com/docs/en/about-claude/pricing |
| Vercel AI Gateway model catalog, language and embedding models (2026-11-18) | https://vercel.com/ai-gateway/models |
| gte-small model card (2026-11-18) | https://huggingface.co/Supabase/gte-small |
| gte-small specifications (PromptLayer, 2026-11-18) | https://www.promptlayer.com/models/gte-small |
| Supabase: increase performance of pgvector HNSW (2026-11-18) | https://supabase.com/blog/increase-performance-pgvector-hnsw |
| How to scale vector search in Postgres (ClickHouse, 2026-11-18) | https://clickhouse.com/resources/engineering/scale-vector-search-postgres |
| Semantic caching best practices (AWS ElastiCache, 2026-11-18) | https://docs.amazonaws.cn/en_us/AmazonElastiCache/latest/dg/semantic-caching-best-practices.md |
| Cache invalidation for semantic and RAG caches (2026-11-18) | https://tianpan.co/blog/2026/04/20/cache-invalidation-ai-semantic-rag |

## Appendix A. Follow-up questions from Ben (14 to 18 November)

### A.1 What "the headlines don't say" looks like (open question 3)

With headlines only, the chatbot can say only what headlines say. The AirAsia salary article is stored, but its headline has no figure, so the answer is:

> The headlines don't give the AirAsia CEO's salary. This article covers it:
> [1] AirAsia CEO Salary in 2026 · 7 Nov 2026 → opens the article

The alternative is letting the model fill in a number from memory: unsourced, possibly stale, and the failure competitors avoid. Questions headlines do cover ("What's the latest on AirAsia's funding talks?") get a real summary with sources. Watchtower counts how often answers fall back, which is the evidence for storing more text later.

### A.2 What "answers well" means

The benchmark is the target set in `evals/README.md`, section 4.1. It was written with the eval suite, and Ben approves it as the release gate.

| Target | In plain terms | Why this level |
| --- | --- | --- |
| 0 made-up answers on the trick and attack questions | When the model knows a fact from memory but no headline states it ("Who founded AirAsia?"), it must say the headlines don't say | Each failure is a fabricated fact presented as sourced |
| Faithfulness of 95% or more | Of the answers given, 95% or more have every claim backed by a cited headline | The answer is the product. General assistants had a significant issue in 45% of news answers (EBU and BBC) |
| Citation precision of 0.90 or more | 9 in 10 cited headlines are relevant | Readers click through to check |
| Search finds 85% or more of the right headlines in its top 10 | Search quality, see A.3 | The model can cite only what search hands it |
| Wrongly refused: 15% or less | Answerable questions that get "the headlines don't say" | Refusing is safe, but too much makes the feature pointless |
| Fact coverage of 0.80 or more | The answer is complete, not just correct | Incomplete is a lesser failure than wrong |
| 95% of answers in 6 seconds or less | Speed | A normal wait for a chat answer |

The test set has 67 questions, so these are pass or fail checks on specific cases, not precise statistics. Revisit them after the first run.

### A.3 Search quality: what it is and who determines it

**What it is.** Whether the search step puts the right headlines in front of the model before it writes. It is measured separately from the answer, because a perfect writer still fails if search hands it the wrong headlines.

| Measure | Question it answers | Target | Example |
| --- | --- | --- | --- |
| Recall at 10 | Of the headlines that should be found, what share are in search's top 10? | 0.85 or more, on answerable questions | "What's the status of AirAsia's talks with the government about funding?" has 9 right headlines. If 8 are in the top 10, the score for that question is 8 / 9 = 0.89 |
| Hit at 10 | Is at least one right headline in the top 10? | 0.90 or more, on "not in the headlines" questions | For "Who founded AirAsia?", the reader should at least get a link to a relevant AirAsia headline |

**Who determines it.** Three parties, each with a different job:

| Who | What they decide |
| --- | --- |
| The answer key in `evals/dataset.jsonl` | For each test question, which headlines are the right ones (`gold_article_ids`). 57 of the 67 questions have one, 1 to 9 headlines each (3 on average). It was built by reading the stored headlines in the database (`evals/README.md`, section 3.3) |
| Code, automatically | The score. It compares the headlines search returned with the answer key. No AI is involved, so the same search always gets the same score |
| Ben | Whether the targets (0.85 and 0.90) are right, and whether the answer key is right. The key is a human judgement of which headlines answer a question, so the score is only as good as the key |

**Proposal:** before the first run, Ben spot-checks about 10 questions in the answer key (shown as headline text, not ids) and confirms or corrects them. After launch, logs add a second signal: which sources readers actually click.

### A.4 Where each piece runs

```
Browser          Chat page: type a question, see the answer and source cards
   |
Vercel server    Holds the AI key (never sent to the browser). Rewrites the question,
                 runs the search, calls the AI, checks citations, streams the answer
   |                  \
Supabase              AI provider
Headlines, their      Receives the question and about 20 headlines,
embeddings, search,   returns the written answer
question logs
```

### A.5 Does it learn from questions? Would caching answers save time?

- **The model does not learn.** No model is trained on users' questions. Each question is handled from scratch.
- **The index already exists.** Each headline's embedding is stored ahead of time, so finding matching headlines takes about 0.1 seconds. The slow part is the model writing the answer, about 2 to 5 seconds.
- **Reusing earlier answers is called a semantic answer cache.** It returns in under half a second, but for news it carries risks:
  - **Stale answers.** Headlines arrive every 3 hours. An answer cached on 6 November ("no coverage") would stay wrong after the salary article arrived on 7 November.
  - **Wrong matches.** "AirAsia CEO salary" and "AirAsia X CEO salary" look almost the same but are different questions.
  - **Repeated errors.** One wrong answer is served to everyone who asks something similar.
  - **Small saving.** At most about $15 at 1,000 questions a month.

**Proposed for MVP3:**
1. **Prompt caching** (a provider feature that reuses the fixed instructions). No freshness risk.
2. **Log every question.** This is the useful learning: the most-asked questions, and those that end in "the headlines don't say".
3. **An answer cache only later, if logs show many repeats.** It would reuse identical questions only and clear whenever new headlines arrive.

### A.6 Embeddings, and the small model gte-small

**An embedding is a list of numbers that represents what a piece of text means**, like coordinates for meaning. "AirAsia CEO pay" and "AirAsia chief executive salary" get nearby coordinates; "AirAsia flight delays" sits further away. Search turns the question into coordinates and finds the closest headlines.

**An embedding model is not a chat LLM**, though both are neural networks trained on large amounts of text:

| | Embedding model | LLM, such as Claude |
| --- | --- | --- |
| Output | A fixed list of numbers (384 for gte-small) | New text |
| Can it write an answer? | No | Yes |
| Size | Small. gte-small has about 33 million parameters, about 70 MB | Far larger |
| Speed and cost | Milliseconds, nearly free | Seconds, paid per use |
| Job in Watchtower | Find the right headlines | Write the answer from them |

**gte-small** ("General Text Embeddings", small version) was released in 2023 by Alibaba's DAMO Academy and is built on BERT. It is English only and reads up to 512 tokens; Watchtower's headlines average 70 characters. Its average score on the MTEB embedding benchmark is 61.4, against 62.3 for OpenAI's text-embedding-3-small. It runs inside Supabase, so it needs no new account and costs nothing.

Paid alternatives are also almost free at this scale: OpenAI text-embedding-3-small and Voyage 4 Lite cost $0.02 per million tokens, and all 2,199 headlines come to about 40,000 tokens. Switch only if evals show weak search, or when non-English sources arrive (backlog B-005).

### A.7 pgvector: the stack, and whether it scales

| Layer | What it does |
| --- | --- |
| Postgres (Supabase) | The existing database |
| `pgvector` | A free extension: a column type for embeddings and a "find the closest" search |
| HNSW index | A shortcut map, so search does not compare the question with every row |
| Keyword index | Already exists (migration 0005). Catches exact names and numbers |
| One search function | Runs both searches and merges the results (Reciprocal Rank Fusion) |

**Scale** (read-only query, 18 November):

| Measure | Value |
| --- | --- |
| Headlines stored | 2,199 |
| Added in the last 7 days | 309, about 44 a day |
| Database size | 14 MB |
| Embedding storage per headline | About 3 KB including the index |
| Growth from embeddings | About 50 MB a year at today's rate |
| Supabase free plan database limit | 500 MB per third-party listings (Unverified) |

`pgvector` is commonly run with up to a few million rows before memory becomes the constraint. On the free GNews plan, Watchtower would take decades to get there. A paid GNews plan pulling thousands of headlines a day could reach millions within a year or two; that would need a larger Supabase plan or a dedicated search service. Nothing built for MVP3 blocks that move.
