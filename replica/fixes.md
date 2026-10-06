# Fixes and positioning: NOT PRODUCED (no review evidence collected)

## What happened
Every source this skill needs was unreachable from this environment, and I will not invent reviews.

| source | result |
| --- | --- |
| Hacker News (Algolia API) | blocked by the network proxy |
| Reddit | blocked |
| Stitch's own site / feedback board | blocked (earlier) |
| Review sites (G2, Capterra, Trustpilot, uithings, flowstep) | blocked (earlier) |
| App Store / Google Play | not applicable: Stitch is a web app |
| GitHub issue google-labs-code/stitch-skills#40 | reachable, but it is a feature request about skills, not a user review; the tool returned a summary, not verbatim text |

**Sample size: 0 reviews.** `replica/reviews.csv` has only the header row. There are no ranked themes, no "what they hate / missing / unsolved" lists, no fix plan and no positioning angle, because any of those would be made up.

## The one useful, non-review finding
The issue summary (one secondary source, unverified) says the redesigned Stitch uses a **daily credit system instead of monthly generation caps**. My clone uses monthly 350 / 50 limits taken from an older source. Check the live product's current limits before relying on that design. (Source: https://github.com/google-labs-code/stitch-skills/issues/40)

## How to get real evidence (pick one)
1. **You paste reviews.** Open the places below in your own browser and paste rows (source, url, date, rating, exact text) into `replica/reviews.csv`. Then I run `reviews.py` and write the real lists.
   - Reddit searches: "google stitch alternative", "stitch ui sucks", "stitch vs figma", "stitch vs v0"
   - Hacker News search for "Google Stitch"
   - Stitch's public feedback or Discord/forum, if it has one
   - Product Hunt and G2 pages for Stitch
2. **Open network access** for hn.algolia.com, reddit.com and the review sites in the environment's network settings, then start a new session. HN's Algolia API is an official feed and fine to read within its terms.

## Rules kept
No invented quotes, no fabricated counts, no reviews used as testimonials.
