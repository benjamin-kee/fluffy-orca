# Watchtower Backlog

Ideas, deferred work and known improvements. Nothing here is approved for implementation without Ben's explicit sign-off and a spec change.

Merged on 27 October 2026 from `docs/roadmap.md` (the MVP0 backlog kept by Claude Code) and the Drive Backlog document (B-001 to B-006). The milestone plan is in [Roadmap.md](Roadmap.md).

## Deferred ideas

| ID | Item | Origin | Target | Notes |
| --- | --- | --- | --- | --- |
| B-001 | Content-based deduplication: treat articles with the same headline and same story as duplicates, even across different links or publishers | D-010, 2026-09-24 | Later | MVP0 blocks duplicates on (`source`, cleaned article link) |
| B-002 | Search over article body text, not just headlines | D-005, 2026-09-24 | Later | Requires ingesting more than headline metadata |
| B-003 | Define "article metadata" as a later feature | D-011, 2026-09-24 | Later | Needs definition from Ben |
| B-004 | Expand coverage beyond Malaysia to wider Asia | D-007, 2026-09-24 | Later | GNews supports many countries |
| B-005 | Non-English sources (Malay, Chinese) | D-014, 2026-09-24 | Later | GNews supports 40+ languages |
| B-006 | Google Sheet checklist for task tracking | D-004, 2026-09-24 | Optional | The roadmap itself is [Roadmap.md](Roadmap.md) (proposed amendment A-04) |
| B-007 | History back to 1 January 2026 | D-013, proposed amendment A-13 | Later | MVP0 holds the 30 days the GNews free plan allows. Older history needs a paid plan |

## Further improvement

| Item | Current MVP0 behaviour | Possible improvement |
| --- | --- | --- |
| Articles with a missing or unreadable publication date | Skipped during ingestion and logged as a warning. They do not appear in the feed. | Decide how to include them, e.g. fall back to the Watchtower ingestion time, with a clear display rule. |

## Future fix

Things in MVP0 that work but not optimally.

| Item | Current MVP0 behaviour | Possible improvement |
| --- | --- | --- |
| GNews free plan limits | Headlines appear at least 12 hours after publication, and each 3-hourly run fetches at most 10 articles, so busy periods can be missed. Free plan is non-commercial only. | Move to a paid GNews plan (real-time, more articles per request) before any commercial use. |

## Future consideration

Useful ideas outside MVP0 scope, recorded per the MVP0 spec.

- An opt-in integration test that checks deduplication against a real test database.
- An ingestion-run log table, or a health alert when GNews returns no articles for several runs.
- Automatic retries with backoff for GNews requests.
- More thorough URL cleaning, and updating stored headlines when publishers edit them.
- Caching of feed pages.
- A "new headlines available" notice.
- A data retention or archiving policy.
- Additional sources, e.g. Malay-language headlines.
- Accessibility and visual polish (MVP2).

### From the retired SPEC-MVP0 v2.1 draft

Improvements the draft specified but MVP0 did not build (proposed decision D-037). The draft is in [`docs/specs/Retired/`](../specs/Retired/SPEC-MVP0-v2.1-draft.md).

- Send `nullable=description,content,image`, so GNews does not drop headlines that lack those fields. Watchtower would still discard them.
- Limit each scheduled request to articles published in the last 24 hours (a lookback window setting).
- Use the GNews article `id` as the duplicate key, with the cleaned link as fallback, if GNews documents the id as stable.
- Send the API key in the `X-Api-Key` header instead of the query string, so it does not appear in logged URLs.
- Tests for GNews error responses (401, 403, 429, 5xx) with mocked responses: stop on key or quota errors, retry on 429 and 5xx.
- A one-day coverage test: how many Malaysian business headlines and publishers Top Headlines returns, how many are new each run, and how precise the results are.
