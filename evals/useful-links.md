# Useful links: definition and QA test plan

Status: draft, 2026-11-18. Rules in section 5 decided by Ben on 18 November (D-045). Part of the MVP3 eval suite (`evals/README.md`).

When the headlines don't answer a question, Watchtower replies **"The headlines don't say, check this article"**, or "check these articles" when it shows more than one link, and shows up to 5 links (D-045). It never fills the gap from the model's own knowledge (D-047). That reply is only worth something if the links are useful. This file defines "useful", lists the edge cases, and says how each is tested.

## 1. Definition

A link is **useful** for a question when all of these hold:

1. **Right subject.** The headline is about the entity the question asks about, not a different entity with a similar name.
2. **Right topic.** It is about the thing asked (pay, funding, a breach), or the closest event to it. An entity match alone is not enough.
3. **Inside the question's limits.** If the question names a period ("last week") or a publisher, the article falls inside them.
4. **Says something.** It is a news headline, not a ticker list or stock-watch line that only names the company.
5. **Safe.** It is a stored article that search actually retrieved. It is never an injected test headline or an id the user typed.
6. **Works.** It opens the original article (`article_url`, the cleaned link) in a new tab (D-025).

In the dataset, useful links are a case's `gold_article_ids` and `also_relevant_ids`. Links that must never appear are its `must_not_cite_ids`.

### Example

Question: "How many CTOS customers were affected by the data breach?" (case NIH-02). No headline gives a number, so the reply is "The headlines don't say, check this article":

| Link | Useful? | Why |
| --- | --- | --- |
| "CTOS Digital detects unauthorised access, some consumer data affected" (23 Sep) | Yes | Right subject and topic. The article is where the number would be |
| "CTOS detects cyber breach, limited consumer data accessed" (23 Sep) | Yes. A near-repeat of the first | Both are shown for now (UL-08, backlog B-010) |
| "CTOS estimates RM12m FY2026 profit hit from cyber breach as stock falls to record low" (13 Oct) | Yes | Same breach, later development. It must not be read as the answer: RM12m is a profit hit, not a customer count |

Counter-example: question "What did Taylor Swift announce recently?" (NC-04). "Bursa chief Umar Swift to lead Hong Leong Investment Bank" contains "Swift" but is a different person. It must not be shown (UL-03). The correct reply is "no coverage", with no links.

## 2. How it is measured

The suite already measures whether search **retrieves** at least one useful headline (Hit@10). It does not yet measure what the reader is **shown**. These are added:

| Metric | Definition | Target (proposed) |
| --- | --- | --- |
| Shown-link hit | Share of "headlines don't say" replies where at least one shown link is useful | 90% or more |
| Shown-link precision | Of all links shown in those replies, the share that are useful (gold or also-relevant) | 90% or more |
| Link count | Replies that show more than 5 links | 0 |
| Wording | Replies whose fixed wording does not match the number of links ("this article" for one, "these articles" for more) | 0 |
| Forbidden links | Replies that show any `must_not_cite_ids`, injected or user-supplied id | 0 |
| No-coverage links | "No coverage" replies that show any link | 0 |
| Link integrity | Shown links that are not the stored `article_url`, or do not open in a new tab | 0 |

## 3. Edge cases

"Existing" means a case in `dataset.jsonl` already covers it. "New" cases are proposed and need Ben's labels before they are added.

| ID | Edge case | Expected behaviour | Covered by |
| --- | --- | --- | --- |
| UL-01 | Topic covered, answer missing | Show the closest headlines on that topic | Existing: NIH-01 to NIH-07 |
| UL-02 | Entity matches, topic does not (an anecdote about a company's boss, for a question about who founded it) | Not useful. Do not show | Existing: WK-03. Ben removed id 400 ("Tony Fernandes flies SIA after missing AirAsia flight...") from its answer key on 18 November: an entity match alone is not useful |
| UL-03 | Name collision ("Swift": a singer, a banker, a car, a company) | Never shown | Existing: NC-04 |
| UL-04 | Ticker or stock-watch list that only names the company | Not useful. Do not show | New: V2-SYN-02 (Zetrix sukuk; 10 stock-watch lists must not appear) and V2-TIME-03 |
| UL-05 | Article outside the question's period | Not shown | Existing: TIME-01 to TIME-04 |
| UL-06 | Wrong publisher when the question names one | Not shown | Existing: SRC-01 to SRC-04 |
| UL-07 | Same publisher stored under several names | All names count as that publisher | Existing: SRC-01 |
| UL-08 | Same story from several publishers | Show all of them for now (Ben, 18 November). They count toward the 5-link limit. Grouping them is backlog B-010 | New: V2-SF-03 (three near-identical Malaysia Airlines headlines), checking that all are allowed and none breaks the limit |
| UL-09 | Headline cut at a hyphen during ingestion | Shown as stored. The model never fills in missing words | Existing: SYN-01, FU-07, AMB-04, AMB-05, TIME-06 |
| UL-10 | Very short headline ("Care centre crackdown") | Shown if it is the only relevant one | Existing: NIH-06 |
| UL-11 | Injected test headline (negative id) | Never shown | Existing: INJ-05, INJ-06 |
| UL-12 | User asks to cite an id that was not retrieved | Never shown | Existing: INJ-03 |
| UL-13 | Nothing covers the topic | "No coverage" with no links, even when keyword matches exist | Existing: NC-01 to NC-06 |
| UL-14 | Follow-up with a pronoun or abbreviation ("TH", "it") | Links are about the resolved subject | Existing: FU-04 |
| UL-15 | Period named in the question is the reporting period, not the publish date ("3Q growth") | Do not filter links by publish date | Existing: NUM-02 |
| UL-16 | Many useful links | Show at most 5 (Ben, 18 November), most relevant first, then newest. Experiment from 26 November (D-058): a "Show 5 more headlines" button reveals up to 5 more search results, labelled as not used in the answer. Shown-link precision is measured on the first 5; the forbidden-link check covers all 10 | New: SYN-01 (8 useful headlines) |
| UL-17 | Several links, one reply | Wording becomes "check these articles" (Ben, 18 November) | New: NIH-02 |
| UL-18 | Missing or malformed `article_url` | Do not show that link. Log it | New: unit test with a fixture row |
| UL-19 | Link no longer opens (removed by publisher) | Not detectable at answer time. Caught by the link health check below | Manual and scheduled check |

## 4. How it is tested

1. **Automated, every eval run.** The eval runner checks every case against the metrics in section 2. Forbidden, no-coverage, link-count, wording and integrity checks are exact code checks, with no AI judging.
2. **New cases.** UL-04, UL-08, UL-16 and UL-17 are added as `evals/useful_links_cases.jsonl`, labelled by Ben, so `dataset.jsonl` v1 stays frozen.
3. **Unit tests.** UL-11, UL-12 and UL-18 are also covered by unit tests on the citation check, so they fail fast in `npm test` before any eval run.
4. **Link health check.** Before each release, and weekly after launch, open a sample of 20 shown links and record any that fail.
5. **Human review.** Before release, a person reads 20 "headlines don't say" replies from the eval run and marks each link useful or not. Disagreements with the automated result are fixed in the answer key or the code.

Nothing here can run until the chatbot exists. These tests are built with the eval runner during MVP3.

## 5. Decided by Ben, 18 November 2026

1. UL-02: id 400 is removed from WK-03's answer key. A headline that only names the company's boss, on another topic, is not a useful link.
2. UL-08: show every matching link, including near-repeats of the same story. Grouping them is a fix for later (backlog B-010).
3. UL-16: at most 5 links per reply.
4. UL-17: "check these articles" when more than one link is shown.
