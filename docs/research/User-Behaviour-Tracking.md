# User Behaviour Tracking for Watchtower

Research report. Date: 2 October 2026. Prices and limits were read from vendor pages on that date unless marked Unverified. This is research, not legal advice.

Correction noted after publication: PostHog free recordings are kept 1 month, events 1 year. The table below says 1 year for both.

## 1 Question

How should Watchtower learn what users click, what they never click and where they get stuck, in the way Hotjar does, with the smallest cost and dependency footprint, and where does that work sit on the roadmap?

Context: a Next.js App Router feed on Vercel (Hobby plan today), a newest-first headline list, numbered pagination, headlines that open the publisher in a new tab, keyword search in MVP1, login before public launch, and a private demo to a few invited reviewers first.

## 2 Answer in five lines

1. Use one tool: PostHog Cloud, on its free tier, with a short list of named custom events. Free tier is 1M events and 5K session replays a month.
2. The question "what is never clicked" needs a headline impression event as well as a click event. A heatmap alone cannot show it.
3. Do not rely on any tool to catch outbound clicks automatically. Fire an explicit headline_click event from the headline link in your own code.
4. Private demo: no cookie banner, but tell reviewers in the invite what is recorded and mask the search box. Public launch: add consent for EU visitors and a privacy notice for Malaysia and Canada.
5. Cost is 0 USD for the demo and probably 0 USD at launch. Effort is about 2 days of Claude Code work for the demo and 1 more day for public launch.

## 3 Options compared

Tool categories and the question each answers:

| Category | Question it answers | Examples here |
|---|---|---|
| Session replay and heatmaps | What did people do and where did they get stuck | Hotjar, Clarity, Mouseflow, FullStory, LogRocket |
| Product analytics and event tracking | Which features are used, in what order, by whom | PostHog, FullStory, LogRocket |
| Web analytics | How many visits, from where, which pages | Google Analytics 4, Vercel Web Analytics |
| Privacy-first analytics | The same as web analytics, with no cookies and less personal data | Plausible, Umami |

Capabilities. Anything marked Unverified could not be read from the vendor page today.

| Tool | Recording | Heatmaps | Click and rage-click | Custom events | Funnels | Outbound clicks out of the box |
|---|---|---|---|---|---|---|
| Hotjar | Yes, vendor page unreadable | Yes, Unverified | Unverified | Unverified | Unverified | Unverified |
| Microsoft Clarity | Yes | Yes, click and scroll | Rage and dead click insights, per vendor FAQ | Unverified | Mentioned in FAQ, limited without consent | Click heatmap and replay only, no outbound goal found |
| PostHog | Yes, 5K free a month | Unverified | Unverified | Yes, event pricing implies it | Unverified | Unverified |
| Mouseflow | Yes | Yes | Friction detection | Unverified | Yes, 1 on free plan | Unverified |
| FullStory | Yes | Unverified | Unverified | Unverified | Basic analytics only on free | Unverified |
| LogRocket | Yes | Yes | Unverified | Yes, analytics unlimited | Yes | Unverified |
| Smartlook | Yes | Yes | Unverified | Unverified | Unverified | Not applicable, being retired |
| Plausible | No | No | No | Yes, by CSS class or function | Paid cloud only | Yes, default on, event "Outbound Link: Click" |
| Umami | Unverified | Unverified | Unverified | Unverified | Unverified | Unverified |
| Vercel Web Analytics | No | No | No | Pro plan only, via track() | No | No, manual track() call |
| Google Analytics 4 | Unverified | Unverified | Unverified | Unverified | Unverified | Unverified |

Cost, hosting and privacy:

| Tool | Free tier | First paid tier | Self-host | Setup in Next.js App Router | Privacy and consent | AI summaries |
|---|---|---|---|---|---|---|
| Hotjar | Secondary source only: free plan with a session cap. Unverified at vendor | Secondary source: from 49 USD a month. Unverified | Unverified | Unverified | Unverified | Unverified |
| Clarity | Free, no traffic limit, 100K recordings per project per day, 30-day retention | None | No, Azure hosted | Unverified | Input boxes always masked. Explicit consent required for EEA, UK, Switzerland. Consent API available | Yes, summaries and chat |
| PostHog | 1M events, 5K replays, 1 year retention | Pay as you go, rate Unverified. No minimum, billing caps available | Unverified | Unverified | Unverified | Unverified |
| Mouseflow | 500 sessions a month, 1 project, 1 month retention | 25 USD a month, 5,000 sessions | No | Unverified | Unverified | Yes, Mina AI |
| FullStory | 30,000 sessions a month, 12 months, 10 users | Sales quote only | Unverified | Unverified | Unverified | StoryAI add-on, not on free |
| LogRocket | 14-day trial, no free tier on the page | 176 USD a month, about 25,000 sessions | Enterprise only | Unverified | Unverified | Galileo, Pro and Enterprise |
| Smartlook | Not sold since 31 May 2026 | None | No | Not applicable | Not applicable | Not applicable |
| Plausible | None. 30-day trial | 9 USD a month, 10K pageviews | Yes, AGPL Community Edition, no funnels | Community package next-plausible, one provider and a hook | No cookies, no personal data stored, vendor says no banner needed. Vendor claim | No |
| Umami | Unverified | Unverified | Unverified | Unverified | Unverified | Unverified |
| Vercel Web Analytics | Hobby: 50K events a month, 1-month window, collection pauses at the cap | Pro: 0.03 USD per 1K events, custom events included. Plus add-on 10 USD a month | No | One component in layout. Lowest effort of all | Unverified | No |
| GA4 | Unverified | Unverified | No | Unverified | Unverified | Unverified |

Script weight: no vendor page read today gave a measured size. Plausible claims its script is 54 times smaller than Google Analytics. Clarity claims no performance impact. Treat both as marketing. Measure the chosen script once in Lighthouse.

Hotjar note: Hotjar now sits under Contentsquare. The vendor pricing URL redirects and the page did not render plans, so every Hotjar figure above comes from a third-party summary and is Unverified.

## 4 Recommendation

Choose PostHog Cloud. Reasons, in 80/20 order:

1. One script and one vendor give recordings, events, funnels and a free tier large enough for a demo and early public use.
2. Events are first class, which Watchtower needs more than visual replay. The product question is about which headlines and controls get used, and that is an event question.
3. A product manager can query events and feed them to Claude for summaries, which supports the portfolio goal.

Runner-up: Microsoft Clarity. It is free with no cap, has heatmaps and recordings, and its AI summaries need no setup. Choose it if PostHog setup proves heavy or if Ben wants visual heatmaps first. Its weakness is that it is built for visual review, not for counting named events. Clarity also requires explicit consent for EEA, UK and Swiss visitors, so it adds banner work at launch.

Why not the others now:
- Plausible answers traffic and outbound clicks cleanly but has no replay and no heatmaps, and it has no free tier. Use it only if you decide you want counts and nothing else.
- Vercel Web Analytics is one line to install but custom events need the paid Pro plan, and Watchtower is on Hobby.
- Mouseflow, FullStory and LogRocket cost money or cap sessions and add nothing Watchtower needs now.
- Smartlook is being retired. Do not adopt it.
- Hotjar, Umami and GA4 could not be verified today.

Outbound clicks. The headline opens a publisher in a new tab, so the page stays alive when the click happens. That makes a click handler on the link reliable. Attach one handler to the headline anchor that sends headline_click before the browser opens the tab. Handle middle click and keyboard open as well. Whether any tool captures this unaided is Unverified for most, and Plausible is the only one confirmed. An explicit event costs a few lines and works the same in every tool, so it is the safe default.

Answering "never clicked". Send one headline_impression_batch event when a page of headlines renders, carrying the list of article IDs and their positions. A click event carries the same ID and position. Never-clicked headlines are the impressions with no matching click. Heatmaps show where clicks land and cannot show absence per headline.

Events worth tracking, with proposed names:

| Event | When it fires | Properties |
|---|---|---|
| feed_viewed | Feed page loads | page_number, page_size, sort |
| headline_impression_batch | A page of headlines renders | article_ids, count, page_number |
| headline_click | Headline link clicked, any button | article_id, position, page_number, page_size, source_domain, via (feed or search) |
| page_changed | Pagination control used | from_page, to_page |
| page_size_changed | 50 or 100 chosen | from_size, to_size |
| scroll_depth | 25, 50, 75, 100 percent reached, once each per view | depth, page_number |
| tab_returned | User comes back to Watchtower after headline_click | seconds_away |
| search_submitted | MVP1 only | query_length, result_count, via. No raw query text at first |
| search_no_results | MVP1 only | query_length |

tab_returned gives a rough read on whether the click led to reading, with no extra tooling.

What not to do yet:
- No user identification or profiles before login exists.
- No funnels, A/B tests, feature flags or surveys.
- No second tool alongside the first.
- No recording of search text. Mask the search input.
- No self-hosting. It adds ops work with no benefit at this size.
- No per-row impression events. One batch event per render keeps the event count low.

## 5 Cost and effort

| Stage | Cost | Basis | Claude Code effort |
|---|---|---|---|
| Private demo, a few reviewers | 0 USD | Well inside the free tier of 1M events and 5K replays | About 2 days: provider setup, 7 events, masking, reviewer notice, check on Vercel preview |
| Public launch | 0 USD expected, then pay as you go | Rough estimate: 10,000 monthly visits at 15 to 20 events each is about 200K events, under the 1M cap. Replay cap of 5K is the likelier limit, so sample replays | About 1 more day: consent for EU visitors, privacy notice, replay sampling, cap alerts |

PostHog price beyond the free tier is Unverified. Set a billing cap on day one so cost cannot exceed zero by surprise. Clarity as a fallback costs 0 USD at any traffic level. Vercel Pro, if ever chosen for another reason, adds a base fee that is not part of this estimate.

## 6 Risks and legal points

Plain terms. Confirm with a privacy lawyer before the public launch.

**PIPEDA, Canada.** Ben operates from Toronto, so Canadian federal privacy law applies to his handling of personal information. The privacy regulator treats tracking data as personal information when people can reasonably be identified. It accepts opt-out consent for tracking only where notice is clear and given at or before collection, an opt-out is easy and immediate, the data is not sensitive, and the data is destroyed or de-identified promptly. Minimum: a short notice, a way to opt out, no sensitive data captured.

**Malaysia PDPA.** The Act covers personal data processed in commercial transactions. The 2024 amendment brought in staged changes during 2025: cross-border transfer rules from 1 April 2025, and breach notification and data protection officer duties from 1 June 2025. The officer duty depends on volume thresholds that Watchtower will not reach at demo scale. Consent and notice are central. Sending visitor data to a vendor abroad counts as a cross-border transfer, so name the vendor and its region in the privacy notice. Whether a notice must also be available in Malay is Unverified.

**GDPR and ePrivacy, EU and UK.** Primary texts were not read today, so this is the standard position and is Unverified against current guidance. Storing identifiers on a device for replay or cross-visit analytics generally needs opt-in consent. Clarity itself says explicit consent is required for the EEA, UK and Switzerland. Cookie-less counting tools such as Plausible state that no banner is needed, which is a vendor claim. Watchtower has no EU target audience, but an EU visitor can land on it.

Consent by stage:

| Stage | Banner | Minimum compliant setup |
|---|---|---|
| Private demo, invited reviewers | No | Tell reviewers in the invite what is recorded and why, with a contact to opt out. Mask search. No identification. No third-party marketing tags |
| Public launch | Yes for EU, UK and Swiss visitors. Opt-out notice elsewhere | Privacy notice naming vendor, region, purpose and retention. Consent banner that gates replay and device identifiers for EU visitors. Opt-out link for others. Honour Global Privacy Control. Set retention to the shortest useful value |

A simpler path at launch is to record sessions only after opt-in everywhere and run event counts without device identifiers. That removes the need to detect visitor region.

**Input masking.** MVP1 adds a search box. Mask it in replay from day one and never send raw query text as an event property at first. Query strings in the URL can leak the same text, so strip or mask them in captured page URLs. Clarity states input boxes are always masked. Masking defaults in other tools are Unverified, so test by typing into the box and replaying it.

**Other risks.** Publisher links carry no Watchtower data, so no personal data reaches publishers through the click. Ad blockers will hide some visitors from any tool, so counts are a floor. Reviewers on a private demo are few, so numbers will be small and should be read as stories, not statistics.

## 7 What it would add to the roadmap

Proposal only. Nothing here changes an existing spec, PRD or the roadmap.

The roadmap order today is MVP0, MVP0.1 (UI and UX, not defined), MVP1 (search), Later. MVP0 is still pending approval, so do not add tracking to it.

Proposed milestone: MVP0.2 Usage Signals, placed after MVP0.1 and before MVP1. Reason: reviewers need a baseline of feed behaviour before search changes it, and MVP0.1 UI changes are the first thing worth measuring. If MVP0.1 stays undefined, this can run directly after MVP0.

Requirements it would add, as proposals:
- R1 Analytics tool loaded on the feed page only, off in local development.
- R2 The seven non-search events in section 4, with stable names and properties.
- R3 Headline click capture works for left click, middle click and keyboard open.
- R4 Reviewer notice in the invite, and a privacy page before public launch.
- R5 Masking verified on the search box before MVP1 ships. MVP1 adds search_submitted and search_no_results.
- R6 A saved view or dashboard that shows clicks by position, never-clicked headlines and page-size split.
- R7 A billing cap set to zero overage.

Out of scope for this milestone: user identification, login-linked profiles, funnels, A/B tests, feature flags, surveys, heatmap tooling beyond the free tool's defaults, self-hosting, second analytics vendor, and any use of data for ads.

## 8 Open questions for Ben

1. Is the main goal recruiter demos or business learning? Recruiters care that events exist and that you can show a finding. A business needs more volume.
2. Will you accept PostHog Cloud, or do you want the free no-cap Clarity as the single tool?
3. Which region for data, EU or US? EU suits EU visitors. Malaysian transfer rules apply either way.
4. Do you want recordings in the private demo, or events only until reviewers have been told?
5. Should reviewers be identified by name for interviews, or stay anonymous?
6. Is MVP0.1 going to be defined soon, or should Usage Signals follow MVP0 directly?
7. Do you want a lawyer to review the privacy notice before public launch, and who pays?
8. What retention period do you want, such as 30 or 90 days?

## 9 Sources

All checked 2 October 2026.

| Title | URL |
|---|---|
| PostHog pricing | https://posthog.com/pricing |
| Microsoft Clarity home | https://clarity.microsoft.com/ |
| Clarity FAQ | https://learn.microsoft.com/en-us/clarity/faq |
| Mouseflow pricing | https://mouseflow.com/pricing/ |
| Fullstory plans | https://www.fullstory.com/plans/ |
| LogRocket pricing | https://logrocket.com/pricing |
| Smartlook pricing and sunset notice | https://www.smartlook.com/pricing/ |
| Plausible home and pricing | https://plausible.io/ |
| Plausible outbound link tracking | https://plausible.io/docs/outbound-link-click-tracking |
| Plausible script extensions | https://plausible.io/docs/script-extensions |
| Plausible custom events | https://plausible.io/docs/custom-event-goals |
| Plausible data policy | https://plausible.io/data-policy |
| Plausible self-hosting | https://plausible.io/docs/self-hosting |
| Plausible Next.js integration | https://plausible.io/docs/nextjs-integration |
| Vercel Web Analytics pricing | https://vercel.com/docs/analytics/limits-and-pricing |
| Vercel custom events | https://vercel.com/docs/analytics/custom-events |
| Vercel analytics package | https://vercel.com/docs/analytics/package |
| Hotjar pricing, third-party summary only | https://humblytics.com/blog/hotjar-pricing |
| Malaysia data protection overview, DLA Piper | https://www.dlapiperdataprotection.com/index.html?t=law&c=MY |
| OPC policy position on online behavioural advertising | https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/bg_ba_1206/ |

Not read today, so Unverified: Hotjar vendor pricing, Umami, GA4, PostHog documentation pages, Clarity API and masking pages, GDPR and ePrivacy primary texts, Malaysian PDPA primary text.
