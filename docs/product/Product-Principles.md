# Watchtower Product Principles

Rules that apply to every milestone, PRD and spec. A PRD or spec may add detail but must not contradict them. Changing one needs Ben's approval and a decision in [Product-Decisions](../roadmap-and-decisions/Product-Decisions.md).

## P-1 Web first, mobile friendly (D-041)

Watchtower is a web app used mainly in a desktop browser. It must also work well on a phone.

| Rule | What it means in practice |
| --- | --- |
| Design for the desktop browser first | Layouts, controls and density are designed and reviewed at desktop widths first (about 1280px). Desktop is never a stretched phone layout. |
| Work well on a phone | Every page works from 320px wide: no horizontal scroll, text readable without zooming, controls easy to tap, and every feature available. Phone layouts may rearrange controls (for example the phone filter sheet in MVP2, formerly MVP1.5), but never remove a feature. |
| Keep long lists out of the way | Controls with many options (for example the publisher list) sit behind a dropdown or similar, closed by default, on every screen size. |
| Check both | Every UI change is checked at desktop width and at a phone width (375px) before it ships. |

The UI and UX agent follows this principle for all design work, as do PRDs and specs. It replaces "mobile-first" wording in earlier drafts.

## P-2 Sorting names A–Z (D-042)

Wherever Watchtower lists names in A–Z order (for example the publishers in the Sources dropdown), it follows standard practice (Unicode collation, as dictionaries and phone contact lists do):

1. Names starting with a letter A to Z come first, alphabetical, ignoring case and accents. An accented letter counts as its plain letter, so "Échos" and "École" are filed under E, next to "Ecole".
2. Then names starting with a letter of another alphabet, such as Thai or Chinese.
3. Then names starting with a number or symbol, such as "8days.sg".

Each block is sorted the same way, with numbers in number order ("9" before "10"). Where a list is sorted by a count, ties follow this A–Z rule.
