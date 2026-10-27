# Review 2026-09-24 v1: Items for approval

Superseded by review_2026-09-24_version_2.

## Changes since last review
- Created the Review folder and this versioned review log.
- Created Google Doc "Watchtower Product Vision" (placeholder): <https://docs.google.com/document/d/1raRptFtjO647kjtxzFEzokamhT0Ozo2R_kMxAIaE4tw/edit>
- Product-Vision now points to that Google Doc. Awaiting ChatGPT strategy export.

## How to reply
Reply by number: 1 approve, 4 edit: ..., 7 reject. Anything not mentioned stays open. Each item shows a **proposal**. Nothing is recorded as a decision until you approve it.

## A. Set up the documents
1. **Lock MVP0 scope.** Proposal: copy the MVP0 scope from the workspace instructions into MVP0-Spec as approved, and log it as Decision #1.
2. **Record MVP1 scope.** Proposal: write "keyword search across collected news" into MVP1-Spec as the only approved line, with everything else listed as open.
3. **Record milestone order.** Proposal: MVP0, MVP0.1, MVP1, later releases, written into the Roadmap README.
4. **Canonical workspace.** Proposal: these project docs are the source of truth for product docs; the GitHub repo holds code; Google Docs used only for the vision doc.
5. **Roadmap tracker.** Proposal: the Roadmap README is the roadmap; a Google Sheet checklist is optional later for task tracking.

## B. Resolve conflicts
1. **Search vs stored data.** MVP0 stores headlines only, so MVP1 search would be headline-only. Proposal: MVP1 searches headlines only; richer search deferred.
2. **Build order.** Earlier notes said search first; instructions say dashboard first. Proposal: dashboard first (MVP0), then search (MVP1).
3. **Geography.** Proposal: Malaysia is the starting market; wider Asia is a later option, not a commitment.
4. **Product breadth.** Proposal: near term is a news product; the investment due-diligence platform is the long-term direction, recorded in the vision doc only.
5. **Page size.** Proposal: user can toggle between 50 and 100 per page, default 50.
6. **"Article metadata" as a later feature.** Needs your definition. Proposal: leave as a future idea until defined.

## C. Open decisions (can wait, needed before MVP0 handoff)
1. Definition of a duplicate (same URL, same headline, or same story across outlets).
2. Ingestion frequency (how fresh the feed must be).
3. Timezone for publication times (MYT or viewer local).
4. History depth at launch and retention period.
5. Languages in scope (English only, or Malay and Chinese too).
6. Public site or login required.
7. Portfolio demo first or commercial product first (sets the licensing bar).

## D. Start research
1. **Source and licensing research.** Proposal: shortlist Malaysian business-news sources, check RSS/API access, data quality, history, publisher terms and commercial-use limits, and write findings into Research.
