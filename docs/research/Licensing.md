# Licensing Research: GNews

> Research snapshot dated 2026-10-02. Where it differs from `docs/specs/MVP0.md`, the spec is what is built.

**Last updated:** 2026-10-02
**Context:** GNews is the only news input (D-017). Portfolio first, not commercial (D-016). Watchtower is a private beta (D-019). MVP0 shows headline, source and date and links out. It stores no article text, summary or image.
This is research, not legal advice.

## GNews terms (checked 2026-10-02)
- **Licence.** A limited, revocable licence to use the API and retrieve data, including commercial use, according to the plan.
- **Free plan.** For non-commercial projects, development and testing only. Published and commercial projects need a paid plan.
- **Commercial use of data.** Allowed on paid plans, with duties: respect third-party copyright, do not present the data as your own, do not misrepresent the source.
- **Publisher rights.** Article text and images belong to the publishers. GNews does not grant rights in them.
- **Storage.** Reasonable caching for application performance is permitted. Building a database by systematically downloading substantial API content to create a competing service, redistribute the data or avoid limits is barred.
- **Competing service.** Using the API to build a competing news product or reselling API access is barred.
- **Attribution.** Appreciated, not required.
- **Account.** Free accounts that abuse the terms can be terminated.

## Assessment for Watchtower
- A private beta that is not published fits the Free plan.
- Storing headline metadata for a feed to Watchtower's own users is probably within reasonable caching, but the terms do not say so directly.
- Watchtower stores only headline, source, links, time and id. It discards description, content and image.
- Headlines still belong to publishers. Linking out in a new tab and a footer credit in MVP0.1 keep the use plain.

## Decision
No email to GNews while Watchtower is a private beta (D-019). Revisit before going public, and before any commercial step.

## Before going public
1. Move to Essential.
2. Reread the terms and confirm storage of headline metadata, in writing if the wording is still unclear.
3. Check Malaysian copyright position on headlines and links with legal input before any commercial step.

## Sources
- [GNews Terms of Service](https://gnews.io/legal/terms-of-service)
- [GNews FAQ](https://gnews.io/faq)
- [GNews pricing](https://gnews.io/pricing)
