# Phoenix — MVP0 News Dashboard

I am building Phoenix, a lightweight business-news intelligence platform.

For this task, build ONLY MVP0 according to the specification below.

## Scope control

Treat this specification as the source of truth.

Do not add, expand, substitute, redesign, or implement functionality that is not explicitly included in this specification.

Do not implement functionality intended for MVP0.1, MVP1 or later.

Do not introduce additional infrastructure, abstractions, frameworks, services, data fields, UI elements, or product capabilities unless they are required to satisfy an explicit requirement below.

If you believe something outside this specification is necessary, materially improves correctness, or is required to avoid significant rework:

1. Stop before implementing it.
2. Explain exactly what you want to add or change.
3. Explain why it is necessary.
4. Explain the impact of not doing it.
5. Ask for explicit approval.
6. Do not proceed until approval is given.

Do not interpret future context as permission to implement future functionality.

When there is ambiguity, prefer the smallest implementation that satisfies the written specification.

## Product objective

Build a lightweight central dashboard that aggregates business-news headlines from two Malaysian news sources into one feed.

Initial sandbox sources:

1. BERNAMA Business RSS
2. The Star Business RSS

The ingestion layer must allow either source to be replaced later without requiring changes to the rest of the application.

## MVP0 user story

As a user, I want a central dashboard that aggregates business news from selected Malaysian news sources, so I can view business developments from multiple sources in one place.

## MVP0 content model

Phoenix MVP0 is a news index and aggregation dashboard.

Phoenix does NOT ingest or host the full publisher article.

For each RSS article, ingest only the metadata needed for the news dashboard:

- headline/title;
- source;
- source URL;
- original publisher article URL;
- publication date/time;
- publisher-provided GUID or external identifier;
- Phoenix ingestion timestamp.

Do NOT ingest:

- full article body;
- article summary;
- generated summary;
- article image;
- author information;
- company metadata;
- topic metadata;
- keywords;
- AI-generated metadata.

## MVP0 functional requirements

The application must:

- ingest article metadata from the two specified RSS sources;
- normalize incoming RSS entries into a common Article model;
- store the normalized article records in the database;
- prevent duplicate article records;
- display stored articles in a single central news feed;
- order articles newest-first based on publication time;
- display only:
  - headline;
  - news source;
  - publication date/time;
- make each headline clickable;
- open the original publisher article in a NEW BROWSER TAB when the headline is clicked;
- use numbered pagination;
- allow users to select either 50 or 100 headlines per page;
- default to 50 headlines per page;
- progressively load headlines in batches of 10 until the selected page size is reached;
- immediately display the first batch of 10 without waiting for the remainder of the selected page;
- continue loading subsequent batches of 10 automatically in the background;
- preserve the selected page size as the user moves between pages;
- periodically ingest newly available RSS entries;
- support desktop and mobile layouts at a basic functional level;
- remain lightweight and fast.

## Progressive loading behaviour

Pagination and progressive loading are separate behaviours.

The selected page size determines how many articles belong to a page:

- 50 headlines; or
- 100 headlines.

However, the frontend should not wait for the complete selected page before displaying content.

For a page size of 50:

10 → display  
20 → display  
30 → display  
40 → display  
50 → complete

For a page size of 100:

10 → display  
20 → display  
30 → display  
...  
100 → complete

The first 10 headlines should become readable as soon as possible.

Additional batches should load automatically.

Do NOT require the user to click "Load more."

Do NOT use infinite scrolling.

If there is a significant technical reason why progressive batches would make the application slower or substantially more complex than fetching the selected page in one query, STOP and explain the tradeoff before changing this requirement.

## Article click behaviour

In MVP0:

Phoenix headline  
→ user clicks  
→ original publisher article opens in a new browser tab.

Do NOT create a Phoenix article-detail page in MVP0.

### Future context only

A later Phoenix version may introduce a dedicated Phoenix article page.

Where a publisher API, licence, or explicit content permission allows Phoenix to access and display full article content, the full article may eventually be displayed on that Phoenix article page.

This is NOT part of MVP0.

Do not scrape, copy, ingest or store full publisher article content in anticipation of this future functionality.

## Explicitly excluded from MVP0

Do NOT implement:

- article-detail pages;
- article images;
- article summaries;
- generated summaries;
- article previews;
- article body scraping;
- storage of full article text;
- keyword search;
- filters;
- sorting controls;
- authentication;
- user accounts;
- saved searches;
- alerts;
- email notifications;
- AI or LLM functionality;
- embeddings;
- vector databases;
- semantic search;
- RAG;
- company extraction;
- company tagging;
- topic classification;
- entity resolution;
- people extraction;
- sentiment analysis;
- company profiles;
- recommendation systems;
- personalization;
- relevance ranking;
- "important news" scoring;
- editorial ranking;
- analytics dashboards;
- billing;
- subscriptions;
- sophisticated UI design;
- animations;
- custom design systems.

If you believe any excluded capability is technically necessary to deliver MVP0, stop and ask for permission before implementing it.

## MVP0.1 future context

MVP0.1 will focus on improving the UI/UX of the working dashboard.

This may include applying established design practices for business-news dashboards and news discovery.

Do NOT implement MVP0.1 design work now.

For MVP0, create only a basic, clean, functional interface.

## MVP1 future context

MVP1 will introduce keyword search across stored articles.

This information is provided only so that MVP0 does not unnecessarily block MVP1.

Do NOT implement MVP1 functionality now.

Do NOT pre-build MVP1 functionality unless I explicitly approve it.

Later MVPs may introduce:

- topic metadata;
- company extraction;
- entity resolution;
- company profiles;
- alerts;
- AI-powered capabilities.

These are outside the scope of the current implementation.

## Preferred technology stack

Use:

- Next.js;
- TypeScript;
- Supabase / PostgreSQL;
- Vercel-compatible deployment.

Use the simplest reasonable implementation within this stack.

Keep dependencies minimal.

Do not introduce additional databases, search engines, queues, caches, vector stores, orchestration frameworks, or external infrastructure without asking for permission first.

## Article data model

The MVP0 Article entity should contain:

- `id`
- `title`
- `source`
- `source_url`
- `article_url`
- `published_at`
- `ingested_at`
- `external_id`

Do not add additional business-domain fields without approval.

If a purely technical database field is required, explain it before adding it if it materially changes the schema.

The MVP0 data model must NOT contain fields for:

- summary;
- image;
- article body;
- author;
- topics;
- companies;
- people;
- sentiment;
- keywords;
- embeddings;
- AI output.

## Ingestion architecture

Use a common `NewsSource` interface so that BERNAMA and The Star are isolated from the rest of the application.

`NewsSource` means a standard interface used by Phoenix to retrieve and normalize article metadata from different publishers.

For MVP0 there will be two source implementations:

- BERNAMA source adapter;
- The Star source adapter.

The intended conceptual flow is:

BERNAMA RSS / The Star RSS  
→ NewsSource adapter  
→ fetch RSS entries  
→ normalize into common Article model  
→ deduplicate  
→ save through ArticleRepository  
→ PostgreSQL  
→ Phoenix news feed

The rest of the application should not contain BERNAMA-specific or The-Star-specific business logic.

A source adapter should be responsible for converting source-specific RSS data into the common Article model.

Do not create a generalized plugin framework or complex ingestion architecture beyond what is needed for these two sources.

## Deduplication

Deduplication is the process of preventing an article already stored in Phoenix from being stored again during a later RSS refresh.

For example:

First RSS retrieval:

- Article A
- Article B
- Article C

Later RSS retrieval:

- Article A
- Article B
- Article C
- Article D

Phoenix should recognize that Articles A, B and C already exist and store only Article D.

Prefer the simplest reliable deduplication strategy using:

1. source-provided GUID/external ID where reliable; or
2. stable original article URL where necessary.

If the sources require different handling, isolate that handling inside their source adapters.

Do not implement semantic or AI-based deduplication.

## Frontend

Create one main Phoenix news-feed page.

The feed should be visually simple, clean and functional.

Do not spend MVP0 implementation effort on sophisticated visual design.

Each article item should display only:

- headline;
- source;
- publication date/time.

The headline should open the original publisher article in a new browser tab.

Include:

- numbered pagination;
- Previous / Next navigation where appropriate;
- a 50 / 100 headlines-per-page selector.

Do not display:

- images;
- summaries;
- topic chips;
- company tags;
- search controls;
- account controls;
- AI controls.

Do not create additional product pages unless they are technically required for MVP0.

## RSS ingestion

The application should support:

- manually triggering ingestion during development;
- periodically refreshing the two RSS sources in production.

Use the simplest Vercel-compatible scheduling approach.

If the scheduling implementation requires a paid service, additional infrastructure, or functionality outside this stack, stop and ask before proceeding.

An ingestion failure from one source should not prevent the other source from being processed.

Add basic logging for ingestion success and failure.

Do not build an ingestion administration dashboard.

## Engineering requirements

Use environment variables for credentials and configuration.

Never commit secrets.

Include `.env.example`.

Add basic error handling.

Add basic tests for:

- source normalization;
- article deduplication.

Do not create an extensive testing framework beyond what is necessary for these tests.

Create a README explaining:

- prerequisites;
- installation;
- environment configuration;
- database setup;
- how to run locally;
- how to manually trigger ingestion;
- how scheduled ingestion works;
- how to run tests;
- how to deploy to Vercel.

Keep Git changes small and logically grouped.

Avoid premature abstraction.

Prefer straightforward code over generalized infrastructure.

## Implementation behaviour

Do not silently make product decisions.

Do not add features because they are "best practice" unless they are required for the stated MVP0 requirements.

Do not turn optional improvements into implementation tasks.

If you identify an improvement that is useful but outside scope, record it under:

`Future consideration`

and do not implement it.

If a requirement can be satisfied in multiple ways, choose the simplest implementation consistent with the specified stack and architecture.

## First task

DO NOT IMPLEMENT CODE YET.

First produce an MVP0 implementation plan containing exactly these sections:

### 1. Requirement interpretation

Restate what will and will not be built.

### 2. Assumptions

List any assumptions required to implement the specification.

### 3. Technical risks

Identify risks specifically related to:

- BERNAMA RSS availability/format;
- The Star RSS availability/format;
- stable article identifiers;
- RSS publication timestamps;
- scheduled ingestion;
- duplicate prevention;
- progressive 10-item frontend loading.

### 4. Proposed MVP0 architecture

Show the smallest architecture that satisfies the specification.

### 5. Proposed directory structure

Show the intended application structure and briefly explain the responsibility of each major directory.

### 6. Database schema

Provide the exact proposed Article table schema.

Do not add additional business-domain fields.

### 7. RSS ingestion design

Explain:

- source adapters;
- normalization;
- repository interaction;
- error handling;
- manual ingestion;
- scheduled ingestion.

### 8. Deduplication strategy

Explain exactly how duplicate prevention will work.

### 9. Pagination and progressive loading

Explain exactly how:

- numbered pagination;
- the 50/100 page-size selector;
- initial 10-headline loading;
- automatic subsequent 10-headline batches

will work together.

Do not substitute infinite scrolling or a Load More button.

### 10. MVP0 implementation sequence

Break implementation into small milestones.

Suggested sequence:

1. initialize application;
2. configure database;
3. implement shared Article model;
4. implement BERNAMA source adapter;
5. ingest and store BERNAMA article metadata;
6. build basic news-feed UI;
7. implement progressive 10-headline loading;
8. implement pagination and 50/100 selector;
9. implement The Star source adapter;
10. confirm both sources appear in the same feed;
11. add deduplication validation;
12. add scheduled ingestion;
13. add basic tests;
14. prepare deployment;
15. update README.

You may change the sequence only if there is a clear technical reason.

### 11. Out-of-scope suggestions

List anything you think would be useful but is not part of MVP0.

Do not implement these items.

### 12. Permission requests

If you believe anything outside this specification is required, list it here and ask for explicit approval.

If no additional permission is required, state:

`No additional scope requested.`

After presenting the plan, STOP.

Do not create files.

Do not write application code.

Do not modify the repository.

Wait for my explicit approval before implementation.
## Approved changes

The following changes were approved by the product owner after the original specification above. Where they conflict with the text above, these changes take precedence.

1. **No progressive loading.** Each page loads its full selected page size (50 or 100 headlines) at once. The "Progressive loading behaviour" section and the progressive-loading requirements above no longer apply.
2. **Publication time display.**
   - The stored publication time is the fixed release moment, interpreted as Malaysia time (UTC+08:00) when the feed gives no time zone.
   - Headlines published less than 24 hours ago show time elapsed since release, e.g. "30 mins ago".
   - Headlines published 24 hours ago or more show the release date and time in the user's own system time zone.
3. **Article URLs.**
   - `source_url` is the link to the specific article exactly as the RSS feed provides it.
   - `article_url` is the cleaned version of that link, with tracking parameters (e.g. `utm_*`) and any `#` fragment removed. Phoenix opens this link when a headline is clicked.
4. **News sources.** The two sandbox sources named above are replaced as follows:
   - BERNAMA Business RSS is replaced by **Malay Mail Money**: `https://www.malaymail.com/feed/rss/money`.
   - The Star Business RSS is replaced by **Free Malaysia Today (FMT) Business**: `https://cms.freemalaysiatoday.com/category/business/feed`. The Star's feeds returned "Page Not Found" when tested on 25–26 Sep 2026; The Star may be re-added if its feeds work again.
   - **The Edge Malaysia** and **New Straits Times (NST) Business** are approved as additional sources, to be added once a working RSS feed is confirmed for each.
