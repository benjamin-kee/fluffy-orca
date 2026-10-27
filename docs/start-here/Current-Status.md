# Current Status

**As of:** 27 October 2026
**Active milestone:** MVP1 (filtering and keyword search). MVP1.0, the single-day date filter, is built and live at <https://watchtower01.vercel.app>
**Repo:** github.com/benjamin-kee/fluffy-orca. `main` is what Vercel deploys. MVP1 sub-sprints are built on `mvp1`, MVP2 on `mvp2`, and planning documents on `claude/inspiring-galileo-33vjef`.

## Completed

- MVP0 built to `docs/specs/MVP0.md` (approved changes 1 to 6): GNews ingestion, Supabase Postgres, duplicate blocking, feed with 50/100 pagination, time display, cleaned links, tests, README.
- Scheduled ingestion every 3 hours from 12am Malaysia time (Supabase `pg_cron`).
- Deployed on Vercel Hobby.
- Former product name retired everywhere it could be edited (D-033, proposed).
- Planning documents imported into the repo under `docs/`, which is now the source of truth (D-031, proposed).
- MVP1 widened to filtering and keyword search (D-039). MVP1.0 single-day date filter approved, built and live on 27 October 2026 ([pull request 5](https://github.com/benjamin-kee/fluffy-orca/pull/5)). Days follow the viewer's time zone (D-040).
- MVP0.1 renamed MVP2 and moved after MVP1 (D-038). Draft PRD and spec written for a separate session on the `mvp2` branch.

## In progress

- 30-day backfill: up to 90 GNews requests a day, once a day after 8am Malaysia time, until 21 November 2026.
- Ben signs off the proposed decision amendments and new decisions in [Product-Decisions](../roadmap-and-decisions/Product-Decisions.md#awaiting-sign-off).
- GitHub Action to mirror `docs/` to Google Drive, and one consolidated Watchtower folder in Drive.

## Open

- Review items 68 (login placement) and 69 (behaviour tracking).
- Ben approves MVP1.1 (results controls) to start the next sub-sprint, and answers SPEC-MVP1 questions Q4 to Q8.
- Ben reviews the MVP2 PRD and spec (SPEC-MVP2 questions 1 to 4), and the Later PRD (item 44).
- Change requests FS-50 to FS-65 in the [fs-review](../reviews/fs-review_2026-10-02_SPEC-MVP0.md) were written against the retired v2.1 draft. They are not applied.
- What the backfill rule becomes after 21 November 2026.
- Vision doc: waiting on the ChatGPT strategy export.

## Workflow (proposed amendment A-22)

Ben approves the PRD, then the spec, as pull requests. Claude Code builds only from an approved spec. Ben approves before merge. Drive mirrors `docs/` and is read-only.

## Next

1. Ben signs off the items awaiting sign-off in the decision log.
2. Set up the Drive mirror.
3. Approve MVP1.1, and start MVP2 in a new session on the `mvp2` branch once its spec is approved.
4. Decide where login goes before any public release.
