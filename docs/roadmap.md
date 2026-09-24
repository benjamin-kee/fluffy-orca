# Phoenix Product Roadmap: Backlog

Items recorded during MVP0 that are **not** being implemented now. Nothing here is approved for implementation without explicit sign-off.

## Backlog: further improvement

| Item | Current MVP0 behaviour | Possible improvement |
| --- | --- | --- |
| RSS items with a missing or unreadable publication date | Skipped during ingestion and logged as a warning. They do not appear in the feed. | Decide how to include them, e.g. fall back to the Phoenix ingestion time, with a clear display rule. |

## Future fix

Things in MVP0 that work but not optimally.

_None recorded yet._

## Future consideration

Useful ideas outside MVP0 scope, recorded per the MVP0 spec.

- An opt-in integration test that checks deduplication against a real test database.
- An ingestion-run log table, or a health alert when a feed returns no items for several runs.
- Automatic retries with backoff for feed fetches.
- More thorough URL cleaning, and updating stored headlines when publishers edit them.
- Caching of feed pages.
- A "new headlines available" notice.
- A data retention or archiving policy.
- Additional sources, e.g. BERNAMA Malay-language feeds.
- Accessibility and visual polish (MVP0.1).
