# Brand: Thumbframe (provisional, not cleared)

## Honest limits
- **Positioning is not evidence-based.** `/replica-entrepreneur` found 0 reviews (`replica/fixes.md`), so there is no proven angle. The one used here comes from your brief: *mobile-first, user-friendly, no horizontal scroll, your own Google Cloud AI*. Treat it as a hypothesis.
- Name checks below are **web-search screens only**, run 2026-10-06. They are not trademark searches and not legal clearance.

## Angle (hypothesis)
For people who design and review app screens on their phone, Thumbframe turns a sentence into screens that fit a phone width, with no sideways scrolling and no desktop-only tools.

## Names
Twenty candidates across styles: Thumbframe, Pocketdraft, Handsketch, Tapdraft, Framewise, Palmplan, Quillframe, Thumbplan, Screenhand, Phoneframe, Taplayout, Pocketplan, Sketchtap, Draftpocket, Fingerframe, Layoutlark, Marginless, Tallscreen, Narrowcast, Edgeless.

Cut to 5 (dropped: sewing words like Seam or Thread, which echo "Stitch"; "-ly" twins; names close to Framer, Figma, Draftbit, Draftly).

| name | web screen 2026-10-06 | US TM | EU TM | CA TM | WIPO | domain | App Store / Play | handles |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Thumbframe** (recommended) | no product with this exact name found; neighbours: Thumbmachine, Thumb3D, MockFrame | to run | to run | to run | to run | to run | to run | to run |
| Pocketdraft | none found; close to Draftbit and Draftly | to run | to run | to run | to run | to run | to run | to run |
| Handsketch | an academic project "HandSketch" exists; near Sketch | to run | to run | to run | to run | to run | to run | to run |
| Tapdraft | none found | to run | to run | to run | to run | to run | to run | to run |
| Framewise | none found; close to Framer, Frame0, MockFrame (same category) | to run | to run | to run | to run | to run | to run | to run |

"None found" means the search did not show it, not that it is free. Run every "to run" check yourself (USPTO tmsearch, EUIPO eSearch or TMview, Canada's trademarks database, WIPO Global Brand Database, a domain search, store searches, X/Instagram/TikTok/GitHub). Before spending money on the name, have a trademark lawyer search properly.

Why Thumbframe: short, spellable after hearing it once, says "phone" and "screen", and has no sewing link to the original. Weak point: "frame" is common in this category (Framer, Frame0), so confusion is the thing to check first. Pocketdraft is the second choice.

The name is one constant, `app/lib/brand.ts`, so changing it is one line.

## Palette
New primary is teal, a different family from the original's colours (guessed to be Google-style blue and multicolour; the real ones were not observed).

| role | light | dark |
| --- | --- | --- |
| accent | #0f766e | #5eead4 |
| on-accent | #ffffff | #0f1115 |
| other roles | unchanged neutrals from `replica/design/tokens.json` | `tokens.dark.json` |

Contrast check (`contrast.py`): 0 AA failures in both modes. `app/app/icon.svg` uses the new colour.

## Logo brief
- **Idea:** a phone-shaped frame with a thumb-sized notch: "a screen that fits your hand".
- **Mark:** symbol plus wordmark. Wordmark in Inter semibold, lowercase `thumbframe`.
- **Must work at** 16 px (favicon, simple rounded rectangle only) and as a 1024 px app icon.
- **Deliverables:** SVG, 1024x1024 app icon with no transparency (iOS), favicon set, 1200x630 social image.
- **Must not resemble the original:** no needle, thread, stitch or seam imagery; no shared shape or colour pair with Stitch's mark. Put the original's logo beside the drafts and compare (I have not seen it).
- The current `icon.svg` is a placeholder, not the final mark.

## Voice
Three words: **plain** (short words, not casual slang), **quick** (one idea per sentence, not rushed), **helpful** (says what to do next, not chatty).

| do | don't |
| --- | --- |
| "Say what you want to see." | "Unleash your creativity!" |
| "Generation failed. Try again." | "Oops! Something went wrong 😬" |
| "You have used all generations for this month." | "Quota exceeded" |
| "Sign in to see your projects." | "Authentication required" |
| "Nothing here yet" | "No data" |

Strings rewritten in this pass: page title and description, the empty-state subtitle. Most other strings were already original and in this voice. Not yet rewritten: sheet titles and button labels, which tests assert on; change them together with their tests.

## Sweep
`python3 .claude/skills/replica-brand/sweep.py . --config replica/brand.json` → **clean** (name, domain and colour guesses). It cannot catch what I could not observe, so check by eye once you have real screenshots: favicon, titles, OG image, app icon.

## Next
`/replica-launch` (landing page, pricing, listing). Pricing and the hero line need evidence: paste reviews first if you want them grounded.
