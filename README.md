# Watchtower

Watchtower is a lightweight business-news dashboard. MVP0 collects business headlines from Malaysian news sources into one feed, newest first. Each headline links to the original article on the publisher's site.

The approved scope is in [`docs/specs/MVP0.md`](docs/specs/MVP0.md). Out-of-scope ideas and known improvements are tracked in [`docs/roadmap-and-decisions/Backlog.md`](docs/roadmap-and-decisions/Backlog.md).

Live at <https://watchtower01.vercel.app>.

## What MVP0 does

- Collects headline metadata (title, publisher, links, publication time) for Malaysian business news from the [GNews API](https://gnews.io). It does not store article text, summaries or images.
- Stores each article once, with duplicates blocked by the database.
- Refreshes automatically every 3 hours, and can load up to 30 days of past headlines.
- Shows one feed of headlines with source and publication time, 50 or 100 per page, with numbered pagination. Times under 24 hours old show as "30 mins ago"; older ones show the date and time in the viewer's time zone.
- Opens the publisher's article in a new tab when a headline is clicked.
- Filters the feed to one day, picked from 1 January 2026 to today. A day runs midnight to midnight in the viewer's own time zone, which the date picker adds to the link (`?date=2026-10-21&tz=America%2FToronto`). A link without `tz` uses Malaysia time.
- Shows which headlines are listed, e.g. "Showing 51–100 of 340 headlines", above the results, sorts newest first or oldest first (`?sort=oldest`), and has a "Clear all" button that returns to page 1 of the full feed with the same page size. Page links, the page-size selector and the date picker keep the chosen day and sort. Emptying the date box shows all dates and keeps the sort.

On the GNews free plan, headlines become available 12 hours after publication, and use is limited to non-commercial purposes.

## Prerequisites

- Node.js 22.18 or later
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
| `SUPABASE_URL` | Supabase dashboard → Project Settings → Data API → Project URL, e.g. `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API Keys → the **secret** key (`sb_secret_…`), or the legacy `service_role` key. Not the publishable key. |
| `CRON_SECRET` | Any long random value, e.g. `openssl rand -hex 32`. Required to call `/api/ingest` |
| `GNEWS_API_KEY` | GNews dashboard |

The secret key gives full database access. It is used only on the server. Never commit it, and never give it a `NEXT_PUBLIC_` prefix.

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
- `npm test`: tests (see [Running tests](#running-tests))
- `npm run backfill`: load past headlines (see [Backfilling past headlines](#backfilling-past-headlines))

## Manually triggering ingestion

With the app running, call the ingest endpoint with your `CRON_SECRET`:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/ingest
```

For the deployed app, use its address instead, e.g. `https://watchtower01.vercel.app/api/ingest`, with the `CRON_SECRET` set in Vercel.

The response lists, for each source, how many articles were fetched and how many were new. Requests without the correct secret get `401 Unauthorized`. Each call uses one GNews request (the free plan allows 100 per day).

## Backfilling past headlines

The GNews free plan keeps 30 days of history. To fill the feed with that history:

```bash
npm run backfill -- 90
```

The number is the most GNews requests this run may use (default 90), leaving 10 of the 100 daily requests (about 100 headlines) for regular ingestion. It works through the last 30 days oldest first, so days about to expire are fetched first, and stops when the limit is reached. Run it again on a later day to continue. Days already stored cost one request each to check, and duplicates are skipped as usual. It runs on your own machine (not on Vercel) and needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `GNEWS_API_KEY`.

From 23 Oct to 21 Nov 2026 the backfill runs once a day after the GNews quota resets at 00:00 UTC (8am Malaysia time), as set out in approved change 6 of the spec.

## How scheduled ingestion works

Supabase calls the deployed `/api/ingest` endpoint every 3 hours, starting at 12am Malaysia time (12am, 3am, 6am, …, 9pm). The schedule uses the Supabase `pg_cron` and `pg_net` extensions, which are available on the free plan. The app URL and `CRON_SECRET` are kept in Supabase Vault, not in the repository.

Set it up once, after deploying:

1. In the Supabase **SQL Editor**, store the deployed endpoint and the same `CRON_SECRET` the app uses:

   ```sql
   select vault.create_secret('https://<your-app>.vercel.app/api/ingest', 'watchtower_ingest_url');
   select vault.create_secret('<CRON_SECRET>', 'watchtower_cron_secret');
   ```

2. Run the contents of [`supabase/migrations/0002_schedule_ingestion.sql`](supabase/migrations/0002_schedule_ingestion.sql).

To check recent runs, query `cron.job_run_details` (did the job run) and `net._http_response` (what the endpoint returned; kept for 6 hours). To stop the schedule, run `select cron.unschedule('watchtower-ingest');`.

## Running tests

```bash
npm test
```

The tests cover source normalization and article deduplication. They use Node's built-in test runner, with no extra test dependencies. They do not call GNews or the database.

## Deploying to Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repository. Vercel detects Next.js; keep the default build settings. Production deploys come from `main`. Skip the optional Supabase integration Vercel offers; the app uses the variables below.
2. Under **Environment Variables** (in the project's sidebar once it exists), add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GNEWS_API_KEY` and `CRON_SECRET` (a new long random value, e.g. `openssl rand -hex 32`). Keep a copy of `CRON_SECRET` for the next step.
3. Select **Deploy**. When it finishes, open the production address shown under **Domains** on the project's Overview page (e.g. `https://watchtower01.vercel.app`); the feed should show the stored headlines. Use this permanent address, not a deployment address containing random characters.
4. Turn on scheduled ingestion as described in [How scheduled ingestion works](#how-scheduled-ingestion-works), using the production URL and the same `CRON_SECRET`.

Every push to `main` deploys again. If you change `CRON_SECRET` in Vercel, update `watchtower_cron_secret` in Supabase Vault too (`select vault.update_secret(id, '<new value>') from vault.secrets where name = 'watchtower_cron_secret';`), then redeploy. Changes to any environment variable take effect only after a redeploy (**Deployments → ⋯ → Redeploy**).

## Syncing docs to Google Drive

Product documents live in [`docs/`](docs/README.md), which is the source of truth. A GitHub Action ([`.github/workflows/sync-docs-to-drive.yml`](.github/workflows/sync-docs-to-drive.yml)) copies them to the Watchtower folder in Google Drive whenever `docs/` changes on `main`. For each `.md` file, Drive gets the file itself plus a Google Doc copy, side by side in the matching folder. Docs are read-only mirrors: comment there, but edit in GitHub, because each sync overwrites them. A file removed from `docs/` moves to its section's `Retired` folder in Drive. Nothing is deleted.

One-time setup, signed in to Google as the owner of the Drive folder:

1. In the [Google Cloud console](https://console.cloud.google.com), create a project (e.g. "Watchtower Docs Sync").
2. **APIs & Services → Library**: enable the **Google Drive API**.
3. **Google Auth Platform** (OAuth consent screen): choose **Get started**, enter an app name and your email, and pick **External**. Then under **Audience**, select **Publish app**. Without this step, the sign-in stops working after 7 days.
4. **Clients → Create client**: choose **Web application** and add `https://developers.google.com/oauthplayground` as an authorized redirect URI. Keep the client ID and client secret.
5. Open the [OAuth Playground](https://developers.google.com/oauthplayground). Under the gear icon, tick **Use your own OAuth credentials** and enter the client ID and secret. In step 1, type `https://www.googleapis.com/auth/drive`, select **Authorize APIs** and sign in. Google warns that the app is unverified; choose **Advanced → Go to … (unsafe)**, which is expected for your own app. In step 2, select **Exchange authorization code for tokens** and copy the **refresh token**.
6. In GitHub, **Settings → Secrets and variables → Actions**:
   - under **Secrets**, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN`;
   - under **Variables**, add `DRIVE_FOLDER_ID`: the last part of the Watchtower folder's Drive address (`drive.google.com/drive/folders/<id>`).
7. **Actions → Sync docs to Google Drive → Run workflow**, with **dry run** ticked, to see what would change. Run it again without dry run to sync.

Google expires a refresh token that goes unused for 6 months. If the sync then fails to sign in, repeat step 5 and update `GOOGLE_REFRESH_TOKEN`.
