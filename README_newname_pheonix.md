# Phoenix

Phoenix is a lightweight business news intelligence platform inspired.

The initial goal is simple: build a clean news dashboard where users can browse and search business news.

## MVP Scope

### MVP0 — Browse News

Users can:

* Browse a continuously updated business news feed
* View article headlines
* View publication date and source
* View a short article snippet
* Open the original article

### MVP1 — Search News

Users can:

* Search the news archive
* Search across article titles, summaries, and article content
* Filter results by date and source
* Sort results by relevance or recency

Search will initially use PostgreSQL Full-Text Search.

Optional typo tolerance may be added using PostgreSQL `pg_trgm`.

LLM-based or vector search is not required for MVP0 or MVP1.

## Initial Architecture

```text
USER
 │
 ├─ browses NEWS — MVP0
 │
 └─ searches NEWS — MVP1
        │
        └─ PostgreSQL Full-Text Search
             └─ optional pg_trgm fuzzy matching
```

## Proposed Stack

* Frontend: Next.js
* Database: PostgreSQL / Supabase
* Backend: Supabase
* Search: PostgreSQL Full-Text Search
* Fuzzy Search: pg_trgm
* Deployment: Vercel
* Development: Claude Code + coding agents

## Core Data Flow

```text
News Sources
     │
     ▼
News Ingestion
     │
     ▼
PostgreSQL / Supabase
     │
     ├─ News Feed
     │
     └─ Full-Text Search
             │
             ▼
          Next.js
             │
             ▼
            User
```

## Out of Scope for MVP0 / MVP1

The following features may be added later but are intentionally excluded from the first release:

* Company database
* Company profiles
* Company tagging
* Topic classification
* Entity resolution
* Vector search
* Semantic search
* RAG / AI chat
* Alerts
* Saved searches
* User accounts
* Email digests

## Development Principle

Keep the first version simple.

The primary objective is to prove that Phoenix can reliably:

**ingest news → display news → search news**

Additional intelligence features will be layered on top after this foundation is working.
