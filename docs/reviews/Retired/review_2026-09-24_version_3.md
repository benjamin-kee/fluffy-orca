# Review 2026-09-24 v3: Repo inspected, spec conflicts

Superseded. Items 20 to 26 from v2 remained open at the time.

Note 2026-10-02: named publishers and their feeds are removed from this log under D-026. GNews is the only news input (D-017).

## Repo state (github.com/benjamin-kee/fluffy-orca, inspected 2026-09-24)
- main has only an early README. All Claude Code work is on branch claude/inspiring-galileo-33vjef, not merged.
- Branch contains CLAUDE.md (docs/specs is authoritative), docs/specs/MVP0.md (detailed spec plus 3 approved changes), docs/roadmap.md (backlog and future considerations), and code.
- Progress: milestones 1 to 3 of 15 done (Next.js skeleton, articles table, Article model, NewsSource interface, ArticleRepository). Feed page is a placeholder. Next is milestone 4, the first publisher adapter.
- Schema matches the spec's 8 fields exactly. No excluded fields found.

## Finding
The repo already has a more detailed MVP0 spec, and Claude Code follows it. The project doc MVP0-Spec (written in v2) was built from the Cowork instructions only and conflicts with it. Two specs exist today. This must be resolved to one.

## Conflicts: project docs vs repo spec
| # | Topic | Project docs | Repo docs/specs/MVP0.md |
|---|---|---|---|
| C1 | Login | D-015: login required | Authentication and user accounts explicitly excluded |
| C2 | Duplicate rule | D-010: same URL | Publisher GUID per source; URL only as fallback. Code uses (source, external_id) |
| C3 | Sources | Open question | Two publisher RSS feeds (since replaced by GNews, D-017) |
| C4 | History | D-013: from 1 Jan 2026 | Not mentioned. RSS only holds a few days |
| C5 | Time display | D-012: viewer local time | Under 24h shows "30 mins ago"; older shows date/time in viewer's time zone; MYT assumed if feed has no zone |
| C6 | Languages | D-014: English only | Not stated. Malay-language publisher feeds listed as future consideration |
| C7 | Refresh | Proposal: hourly | "Periodically", simplest Vercel option, ask before paid services |
| C8 | Backlog | Backlog doc | docs/roadmap.md |
| C9 | README on main | n/a | Old README lists snippets, MVP1 search on summaries and body, filters, sorting. Conflicts with D-005 and the repo spec. Branch README fixes MVP0 only |

## New risks
- **Refresh:** Vercel's free (Hobby) plan only runs cron jobs once per day. Hourly needs Vercel Pro (paid) or a free outside scheduler (for example a GitHub Actions scheduled workflow). The repo spec says to stop and ask before either.
- **Publisher terms:** one chosen sandbox source's RSS terms allow personal, non-commercial use only.

## Items for approval
Reply by number.

27. **Single source of truth = repo.** docs/specs/ in the repo is the only spec. MVP0-Spec and MVP1-Spec in this project become one-line pointers to the repo. Decisions log stays here and references repo spec sections. (Replaces item 20.)
28. **C1 Login.** Choose: (a) keep repo spec, no login in MVP0, and move login to MVP0.1 or later; or (b) add login to MVP0 as a spec change. Recommendation: (a). Login adds auth work before the feed even works, and invite-only access can be handled at deploy time.
29. **C2 Duplicates.** Replace D-010 with the repo rule: publisher GUID per source, URL fallback. Code already works this way.
30. **C3 Sources.** Record two publisher RSS feeds as the MVP0 sandbox sources, with the licensing risk on one noted. (Void: GNews is the only news input, D-017.)
31. **C4 History.** Add to the repo spec: collect from launch; backfill to 1 Jan 2026 moved to backlog pending research. (Replaces item 22.)
32. **C5 Time display.** Replace D-012 with the repo rule.
33. **C6 English only.** Add "English-language feeds only" to the repo spec.
34. **C7 Refresh.** Choose: (a) once daily on free Vercel; (b) hourly via a free GitHub Actions schedule (new infrastructure, needs approval); (c) hourly on Vercel Pro (paid). Recommendation: (b). (Replaces item 21.)
35. **C8 Backlog.** Merge the Backlog doc into repo docs/roadmap.md and keep one backlog in the repo.
36. **C9 Old README.** Merge the Claude Code branch to main so the outdated README is replaced.
37. **Specwright is read-only.** Updated prompt: reads repo, reports, never edits (matches CLAUDE.md rule that specs change only on your instruction).

## How spec changes reach the repo
No GitHub connector is available for this workspace. I can read the public repo from here. For writes: I draft the exact spec text here, you paste it to Claude Code with "update docs/specs/MVP0.md with the following approved change", and Claude Code commits it.
