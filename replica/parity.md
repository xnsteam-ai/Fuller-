## Parity: 48.7 / 100

features 48.7  (18 counted, must-haves 1 of 7 done)

Not shippable yet: 6 must-have features are not done.

## By area, weakest first
- integration                    0.0  (1 features)
- export                        25.0  (3 features)
- auth                          50.0  (1 features)
- generate                      50.0  (5 features)
- edit                          50.0  (3 features)
- voice                         50.0  (1 features)
- design system                 50.0  (1 features)
- billing                       50.0  (1 features)
- projects                      50.0  (1 features)
- mobile                       100.0  (1 features)

## Missing, in build order
- [must] auth: Google sign-in, partial  (Supabase Google OAuth wired; not run live (no credentials))
- [must] edit: Follow-up prompt refinement, partial  (route + UI built; not run live)
- [must] export: Export HTML/CSS, partial  (one HTML file with all screens; not tested against real data)
- [must] generate: Mobile and web device target, partial  (toggle sent to provider; web layout not tuned)
- [must] generate: Text prompt to UI, partial  (real Gemini call written, not run live)
- [must] projects: Project list, partial  (Supabase-backed; rename and delete built; not run live)
- [should] export: Export Tailwind, no
- [should] billing: Monthly usage limits, partial  (usage page + atomic quota in DB; not run live)
- [should] design system: DESIGN.md design system, partial  (generate, edit, save, export; new generations do not yet read it)
- [should] edit: Direct manual edits, partial  (text-only editing; no colour or spacing editing)
- [should] generate: Image/sketch to UI, partial  (attach PNG/JPEG/WebP up to 3 MB, sent inline; not run live)
- [should] generate: Up to 5 connected screens, partial  (model asked for 1-5 screens; consistency not verified live)
- [could] export: Other frameworks (Vue Angular Flutter SwiftUI), no
- [could] integration: MCP server, no
- [could] edit: Variants, partial  (3 variants, pick one; not run live)
- [could] generate: Mode picker (4 modes), partial  (maps to Gemini model env vars; not run live)
- [could] voice: Voice critique, partial  (browser speech-to-text fills the prompt; no spoken replies)

## Left out on purpose (not scored)
- Figma paste: Proprietary clipboard format

## Evidence limits
- The reference is the recon map, built from search summaries only (Stitch's own site and review sites were blocked). The feature list itself is therefore not verified against the real product.
- Layout diff: **skipped**. No original screenshots exist, so `imgdiff.py` had nothing to compare.
- Every `partial` above means built and tested against a network-level test double, **never run against real Supabase or Gemini**. If any of them fails live, the true score is lower. Counting partial as half is generous for code that has not run.

## Behaviour differences (inferred, not observed)
| flow | original does | clone does | fix or keep |
| --- | --- | --- | --- |
| F01 prompt to design | unknown from sources | 3 taps after typing: Generate, then canvas | measure against the real app |
| Canvas | infinite 2D canvas | vertical stack, no horizontal scroll (user requirement) | keep |
| Figma | paste into Figma | export HTML and DESIGN.md only | keep, Tailwind to build |
| Voice | live spoken critique | dictation into the prompt | keep for now |

## Verdict: not shippable
6 of 7 must-haves are only partial and none has run live. No S1 bug is open that I know of, but the data-isolation test (second user sees nothing) has never been run, which is a security gate.

## Top five next
1. Supply credentials and run the real services: sign-in, generation, quota, refine (turns most `partial` rows into `yes` or exposes failures).
2. Test row-level security with two users.
3. Feed DESIGN.md into the first generation, not only refine and variants.
4. Tailwind export (should-have, currently `no`).
5. Get real Stitch screenshots from your own account so the layout diff and recon can be checked.
