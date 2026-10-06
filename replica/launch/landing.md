# Landing page (built at `/welcome`, app/app/welcome/page.tsx)

## Status: draft, do not publish yet
- **No evidence behind the angle.** There are 0 reviews (`replica/fixes.md`). The hero is a hypothesis from your brief.
- **Nothing here has run against real Supabase or Gemini.** Every feature line describes code that exists and is tested only against a test double. Publish only after the live checks pass.
- **No screenshot.** A hero screenshot of the real product is missing because there is no live run yet. Do not use a screenshot made from test data.
- **No proof section** on purpose: no testimonials, user counts, ratings or logos. Add real ones, with permission, later.
- **No mention of the original.** The page never names Stitch or compares against it.

## Copy as built
1. **Hero:** "Describe a screen. Get a design that fits your phone." / "{name} turns a sentence into app screens you can change, restyle and export, all from a narrow screen." / button "Start designing".
2. **How it works:** Say what you want. Get screens. Make them yours.
3. **What you can do:** phone widths with no sideways scroll; talk or type; start from a picture; three variations; keep a style (DESIGN.md); export HTML or Tailwind HTML.
4. **Early access:** no price is stated. "Pricing will be announced before any charge."
5. **Questions:** works on phone; how to export; cost; what powers it (Gemini).
6. **Final call to action.**

No "problem" section: it would need the top complaints from real reviews, which do not exist yet. Add it when `replica/reviews.csv` has data.

## Claims to verify before publishing
| claim | backed by | verified live? |
| --- | --- | --- |
| no sideways scroll at 320 to 430 px | Playwright layout tests on the app and landing | yes (browser emulation; not on real devices) |
| up to five screens | model asked for 1 to 5 | no |
| dictation | browser speech API | no; only some browsers support it |
| image attach | built | no |
| three variations | built | no |
| DESIGN.md reuse | built | no |
| HTML and Tailwind export | built; Tailwind converter checked on sample markup | no, not on real model output |
| "Google's Gemini models" | code calls Gemini | no, never called |

Contrast: the page uses the design tokens, and an automated accessibility scan (axe, WCAG A and AA) passes on `/welcome`.
