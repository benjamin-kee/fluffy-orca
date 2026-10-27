# Review 2026-09-24 v2: Approvals applied, research first pass

Superseded by review_2026-09-24_version_3.

Note 2026-10-02: named publishers and their feeds are removed from this log under D-026. GNews is the only news input (D-017).

## Changes since last review
- Approved items 1 to 3 and 5 to 18 logged as decisions D-001 to D-016 (Product-Decisions).
- Item 4 (canonical workspace) held open: replaced by item 20 after Ben's source-of-truth question.
- Item 13 (refresh frequency) held open: recommendation in item 21.
- Written: MVP0-Spec v1.0, MVP1-Spec v1.0, Roadmap README.
- New: Backlog (B-001 content dedup, and five other deferred items).
- New: Specwright (spec agent prompt).
- Research first pass: News-Sources, Licensing.
- Updated: Current-Status.

## Key research findings
- Publisher RSS feeds hold only recent items (one feed tested: 20 items, about 2.5 days). History back to 1 Jan 2026 cannot come from RSS.
- One publisher's RSS terms allow personal, non-commercial use only. A multi-user site is likely outside that.
- Another publisher's terms bar reproducing or displaying its content and say nothing on headlines or RSS.
- One major publisher offers no RSS or API.
- GDELT (free) gives titles and URLs by domain but officially only for the last 3 months.

## Items for approval
Reply by number: 20 approve, 22 edit: ..., 24 reject.

20. **Single source of truth for specs.** Proposal: specs and decision log live in the GitHub repo under docs/specs/. Claude Code and Specwright read them there. This project keeps research, reviews, roadmap and notes. I draft spec changes here; they are committed to the repo after your approval. Tradeoff: I cannot write to the repo directly (no GitHub connector available), so commits go through Claude Code or you. Alternative: project docs stay the truth and a copy is pushed to the repo at each handoff, which risks drift.
21. **Refresh frequency.** Proposal: hourly. Cheap, polite to publishers, and safe for higher-volume feeds that may overflow a 20-item window. 3 hours works for the one feed measured but is unmeasured for the others.
22. **History to 1 Jan 2026 (D-013) is at risk.** Proposal: start collecting now so history accumulates, and backfill to 1 Jan 2026 only for sources whose archives and terms allow it. Alternatives: accept history from launch date only, or pay a provider for backfill.
23. **Licensing approach.** Proposal: email 3 to 4 target publishers asking permission for a non-commercial portfolio demo, and keep the deployed demo invite-only and not search-indexed.
24. **Login model (MVP0 Q4).** Proposal: invite-only accounts created by you. No public sign-up.
25. **Install Specwright.** Proposal: add Specwright to the repo as .claude/agents/specwright.md so Claude Code can call it. Needs the repo link.
26. **Research second pass.** Proposal: confirm working feeds for the shortlisted publishers; measure feed windows; check archive depth; price paid providers; review remaining publisher terms.

## Needed from Ben
- GitHub repo URL (public repos can be read from here).
- ChatGPT strategy export for the vision doc.
