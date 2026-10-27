# News Source Research: GNews

> Research snapshot dated 2026-10-02. Where it differs from `docs/specs/MVP0.md`, the spec is what is built: for example, MVP0 backfills 30 days of history on the Free plan and does not send the `nullable` option.

**Last updated:** 2026-10-02
**Decision:** GNews is the only news input to Watchtower (D-017). Scope: English-language Malaysian business news (D-014), history from 1 January 2026 (D-013). Publishers are whatever GNews returns (D-026).
Everything below was checked on 2026-10-02 against docs.gnews.io, gnews.io/pricing and gnews.io/faq unless marked **Unverified**.

## What GNews is
A REST API over more than 80,000 sources in 41 languages and 71 countries. Two endpoints: Top Headlines, ranked as Google News ranks stories, and Search, a full-text query with date range. Article fields: id, title, description, content, url, image, publishedAt (always UTC), lang, and a source object.

## Plans
| Plan | Price | Requests/day | Articles/request | Delay | History |
|---|---|---|---|---|---|
| Free | €0 | 100 | 10 | 12 hours | 30 days |
| Essential | €49.99/month, €479.99/year | 1,000 | 25 | Real time | From 2020 |
| Business | €99.99/month | 5,000 | 50 | Real time | From 2020 |
| Enterprise | €249.99/month | 25,000 | 100 | Real time | From 2020 |

Rate limit: 1 request per second on Free, 10 on paid. A 10-day free trial of each paid plan exists, once per account, card required.

## What this means for Watchtower
- **Private beta on Free works** for development, testing and a feed that lags by 12 hours and reaches back 30 days.
- **History to 1 Jan 2026 needs paid data.** Run the backfill inside the 10-day trial.
- **A public demo needs Essential.** Free is for development and testing only.
- **Quota is counted in requests, not articles.** There is no article quota. Free allows 100 requests a day, each returning at most 10 articles. A request that returns nothing is expected to count as one request. The GNews pages do not say this outright, so the coverage test checks it.
- Default responses drop articles lacking a description, image or content. Watchtower sets `nullable=description,content,image`.
- GNews will not return more than 1,000 articles for one query, however many pages are requested. Regular runs never come near this. A backfill over months asks for one short date window at a time.
- `country=my` filters by publisher country, not article subject.
- No source filter. Watchtower groups by `source.name` itself.
- Top Headlines is a ranked subset. Search is broader but has no business category, so it is held in reserve and not called without Ben's approval.

## Unverified until the coverage test
- How many Malaysian business articles per day Top Headlines returns.
- How many distinct publishers appear.
- Whether a request that returns no articles still counts against the daily limit.
- Whether the same story appears under several GNews ids.

## Coverage test
A short, throwaway test that answers the open questions above before anything is built. Run Top Headlines `category=business&country=my&lang=en` three times across one day on the Free plan, plus one request with a very narrow time window that should return nothing. Report articles per run, distinct publishers, how many were new on each run, precision on 20 sampled headlines, duplicate rate, and the number of requests made so Ben can compare it with the GNews usage counter. Decision rule: use Top Headlines alone if it returns enough volume. Otherwise Ben decides whether a Search query is added.

## Sources
- [GNews documentation](https://docs.gnews.io/)
- [Search endpoint](https://docs.gnews.io/endpoints/search-endpoint)
- [Top Headlines endpoint](https://docs.gnews.io/endpoints/top-headlines-endpoint)
- [JSON response](https://docs.gnews.io/json-response)
- [Pricing](https://gnews.io/pricing)
- [FAQ](https://gnews.io/faq)
