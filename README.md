# Phoenix

Phoenix is a lightweight business-news dashboard. MVP0 collects business headlines from Malaysian news sources into one feed, newest first. Each headline links to the original article on the publisher's site.

The approved scope is in [`docs/specs/MVP0.md`](docs/specs/MVP0.md). Out-of-scope ideas and known improvements are tracked in [`docs/roadmap.md`](docs/roadmap.md).

> **Status:** MVP0 is being built milestone by milestone. Sections marked _pending_ are completed when that part is built.

## What MVP0 does

- Collects headline metadata (title, source, links, publication time) from RSS feeds. It does not copy article text, summaries or images.
- Stores each article once, with duplicates blocked by the database.
- Shows one feed of headlines with source and publication time, 50 or 100 per page, with numbered pagination.
- Opens the publisher's article in a new tab when a headline is clicked.

## Prerequisites

- Node.js 20.9 or later
- A [Supabase](https://supabase.com) project (the free plan is enough)
- A [Vercel](https://vercel.com) account, for deployment

## Installation

```bash
npm install
```

## Environment configuration

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → `service_role` key |

The service-role key gives full database access. It is used only on the server. Never commit it, and never give it a `NEXT_PUBLIC_` prefix.

## Database setup

In the Supabase dashboard, open **SQL Editor** and run the contents of [`supabase/migrations/0001_create_articles.sql`](supabase/migrations/0001_create_articles.sql) once. This creates the `articles` table, the rule that blocks duplicates, and an index for newest-first ordering. It also enables row-level security, so the public API key cannot read or write the table.

## Running locally

```bash
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

- `npm run build`: production build
- `npm run typecheck`: TypeScript check

## Manually triggering ingestion

_Pending (milestone 5)._

## How scheduled ingestion works

_Pending (milestone 12)._

## Running tests

_Pending (milestone 13)._

## Deploying to Vercel

_Pending (milestone 14)._
