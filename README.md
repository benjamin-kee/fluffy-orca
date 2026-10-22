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

Then run [`supabase/migrations/0003_grant_service_role.sql`](supabase/migrations/0003_grant_service_role.sql). Newer Supabase projects give API keys no table access by default; this lets the server-side secret key read and add articles. (`0002` sets up the schedule and is run after deployment; see below.)

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

## Backfilling past headlines

The GNews free plan keeps 30 days of history. To fill the feed with that history:

```bash
npm run backfill -- 90
```

The number is the most GNews requests this run may use (default 90), leaving 10 of the 100 daily requests (about 100 headlines) for regular ingestion. It works through the last 30 days oldest first, so days about to expire are fetched first, and stops when the limit is reached. Run it again on a later day to continue. Days already stored cost one request each to check, and duplicates are skipped as usual. It needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `GNEWS_API_KEY`, and Node.js 22.18 or later.

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

```bash
npm test
```

The tests cover source normalization and article deduplication. They use Node's built-in test runner, with no extra test dependencies, and need Node.js 22.18 or later. They do not call GNews or the database.

## Deploying to Vercel

_Pending (milestone 14)._
