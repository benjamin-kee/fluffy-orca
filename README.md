# Phoenix

Phoenix is a lightweight business-news dashboard. MVP0 collects business headlines from Malaysian news sources into one feed, newest first. Each headline links to the original article on the publisher's site.

The approved scope is in [`docs/specs/MVP0.md`](docs/specs/MVP0.md). Out-of-scope ideas and known improvements are tracked in [`docs/roadmap.md`](docs/roadmap.md).

> **Status:** MVP0 is being built milestone by milestone. Sections marked _pending_ are completed when that part is built.

## What MVP0 does

- Collects headline metadata (title, publisher, links, publication time) for Malaysian business news from the [GNews API](https://gnews.io). It does not store article text, summaries or images.
- Stores each article once, with duplicates blocked by the database.
- Shows one feed of headlines with source and publication time, 50 or 100 per page, with numbered pagination.
- Opens the publisher's article in a new tab when a headline is clicked.

## Prerequisites

- Node.js 20.9 or later
- A [Supabase](https://supabase.com) project (the free plan is enough)
- A [Vercel](https://vercel.com) account, for deployment
- A [GNews](https://gnews.io) API key (the free plan is enough)

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
| `CRON_SECRET` | Any long random value, e.g. `openssl rand -hex 32`. Required to call `/api/ingest` |
| `GNEWS_API_KEY` | GNews dashboard |

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

With the app running, call the ingest endpoint with your `CRON_SECRET`:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/ingest
```

The response lists, for each source, how many articles were fetched and how many were new. Requests without the correct secret get `401 Unauthorized`. Each call uses one GNews request (the free plan allows 100 per day).

## How scheduled ingestion works

Supabase calls the deployed `/api/ingest` endpoint every 3 hours, starting at 12am Malaysia time (12am, 3am, 6am, …, 9pm). The schedule uses the Supabase `pg_cron` and `pg_net` extensions, which are available on the free plan. The app URL and `CRON_SECRET` are kept in Supabase Vault, not in the repository.

Set it up once, after deploying:

1. In the Supabase **SQL Editor**, store the deployed endpoint and the same `CRON_SECRET` the app uses:

   ```sql
   select vault.create_secret('https://<your-app>.vercel.app/api/ingest', 'phoenix_ingest_url');
   select vault.create_secret('<CRON_SECRET>', 'phoenix_cron_secret');
   ```

2. Run the contents of [`supabase/migrations/0002_schedule_ingestion.sql`](supabase/migrations/0002_schedule_ingestion.sql).

To check recent runs, query `cron.job_run_details` (did the job run) and `net._http_response` (what the endpoint returned; kept for 6 hours). To stop the schedule, run `select cron.unschedule('phoenix-ingest');`.

## Running tests

_Pending (milestone 13)._

## Deploying to Vercel

_Pending (milestone 14)._
