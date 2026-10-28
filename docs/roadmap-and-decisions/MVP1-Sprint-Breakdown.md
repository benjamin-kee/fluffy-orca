# Watchtower MVP1: Sprint Breakdown

> Ben's sprint breakdown of 26 October 2026, kept as the source of [SPEC-MVP1](../specs/SPEC-MVP1.md). Where the two differ, the spec wins. Since this was written: MVP1.0 was approved and built (27 October), days follow the viewer's own time zone rather than Malaysia time (D-040), an empty day shows "Our keyboard warriors are working hard to get your news." (MVP1.2 changes it to "…to add more news for you."), and each sub-sprint has its own branch. MVP1.2 was approved and built on 28 October.

_Status: draft, pending approval. Date: 26 Oct 2026._

Each sprint ships a working increment. Each builds on the one before it.

| Sprint | Name | What ships | Depends on |
| --- | --- | --- | --- |
| MVP1.0 | Single-day date filter | Calendar picks one day (Malaysia midnight to midnight, per the viewer's time zone decision). Dates before 1 Jan 2026 are greyed out. Days with no headlines show "No news for this date." Date is stored in the URL (`?date=`). | MVP0 feed |
| MVP1.1 | Results controls | "Showing X of Y" count, clear-all button, newest or oldest sort, URL state for all filters | MVP1.0 |
| MVP1.2 | Date range | From and to dates, with a check that From is not after To | MVP1.0 |
| MVP1.3 | Source filter | Multi-select of publisher names taken from the database, with headline counts beside each name | MVP1.1 |
| MVP1.4 | Country filter | Malaysia active. Singapore greyed out with "Coming soon" | Data field approval (see below) |
| MVP1.5 | Mobile filter sheet | Filters collapse into one button and a bottom sheet on phones | MVP1.1 to MVP1.4 |
| MVP1.6 | Keyword search | Search bar on headline titles, combined with the active filters | Search index migration (see below) |

MVP1.2 and MVP1.3 can run in either order. MVP1.6 can start once MVP1.1 is stable, but it needs the search index.

## Approvals needed before the sprints start

1. **Country field.** The articles table has no country column. MVP1.4 needs a new `country` field, filled from the GNews query. Per CLAUDE.md this is a new data field and needs owner approval. MVP1.4 is held until it is approved.
2. **Search index.** MVP1.6 needs a full-text index on article titles, which is a new migration. It is listed as a separate approval item and is raised when MVP1.6 is ready to start, so it does not block the earlier sprints.

## Candidate additions (pending decision)

- Quick presets: Today and Last 7 days. Low effort on top of MVP1.2.
- Search combined with filters: the search bar works with the active date and source filters. This is already part of MVP1.6, so no separate sprint.

## Parked (not in the MVP1 branch)

Story grouping across outlets, login-dependent features, and CSV export remain on the KIV list until the owner decides otherwise.
