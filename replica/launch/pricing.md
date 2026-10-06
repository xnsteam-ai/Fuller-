# Pricing: DRAFT HYPOTHESES, no numbers set

## What I could and could not find
| item | what is known | source | date read | status |
| --- | --- | --- | --- | --- |
| Google Stitch price | described as free, an experimental Google Labs tool | search summaries (neowin.net, therundown.ai) | 2026-10-06 | secondary, from 2025 launch coverage; unverified today |
| Stitch usage limits | 350 standard and 50 experimental generations a month (therundown.ai) vs. daily credits (GitHub issue summary: https://github.com/google-labs-code/stitch-skills/issues/40) | conflicting | 2026-10-06 | unresolved: check the live product |
| Figma, v0, Framer and other alternatives | not read | blocked / not fetched | n/a | no data, do not guess |
| Reviewer comments on price | none | `replica/feedback.md` empty | n/a | no data |

Competitor pricing pages were not reachable, so there is no market comparison. Do not publish a comparison table until someone reads the live pages.

## The cost you must price against (unmeasured)
Each generation calls Gemini with **your** Google Cloud key, so you pay per use. I did not look up current Gemini rates and the app has never made a real call, so cost per generation is unknown. Measure before pricing:
1. Run 20 representative prompts live; record tokens in and out per generation (the app stores them per generation row once wired).
2. Cost per generation = tokens × current Gemini price for the model used (check Google's pricing page the day you decide).
3. A refine, a variants call (3 outputs) and a DESIGN.md call cost different amounts: price from the real mix.

## Proposed structure (shape only)
- **Free:** small monthly allowance so people can try it. Size it so the free tier's worst-case cost is a number you accept.
- **Pro:** larger allowance, thinking mode, image input. Flat monthly price = (typical generations × cost) × margin you choose, with annual at about two months free.
- Name tiers by who they are for, at most three. The app already has two allowances (standard and experimental) and a usage page, so the limits are visible to users.
- Env knobs exist: `QUOTA_STANDARD`, `QUOTA_EXPERIMENTAL` (defaults 350 and 50 are copied from the original's reported caps, not derived from your cost).

## Billing rules to keep when payments exist
One-click cancel, a renewal reminder email, no surprise price jumps, failed generations refunded (already true for the usage counter).

## Not built
Stripe is **not integrated**. When you want it: you create the Stripe products and prices (test mode first), then run `/replica-backend` for Checkout, the Customer Portal and signature-verified webhooks. Until then the landing page states no price.
