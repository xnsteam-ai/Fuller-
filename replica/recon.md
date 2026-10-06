# Recon map: Google Stitch (mobile-first web clone)

**Evidence quality: LOW-MEDIUM.** stitch.withgoogle.com and review sites (uithings, flowstep) were blocked by the
network proxy. Everything below comes from web-search summaries (therundown.ai, nxcode.io, tech-insider.org,
bycrawl.com, sfailabs.com, neowin.net, google-labs-code/stitch-skills issue #40). No screenshots were taken
(`replica/screens/` is empty). Screens and layout are INFERRED. Verify against the user's own Stitch account.

## Scope
- App: Google Stitch (Google Labs AI UI design tool). Platform: mobile-first responsive web, no horizontal scroll at any width.
- Slice: core loop = prompt (text/image) -> generated screens -> refine by prompt -> export.
- For: user's own product. AI backend: Gemini via user's Google Cloud credentials.

## Sources
| source | URL | gives |
| --- | --- | --- |
| Neowin launch coverage | https://www.neowin.net/news/google-debuts-ai-tool-for-generating-ui-designs-from-prompts/ | text/image input, Figma + code export |
| The Rundown | https://www.therundown.ai/tools/stitch | limits (350 Standard / 50 Experimental per month) |
| stitch-skills issue #40 | https://github.com/google-labs-code/stitch-skills/issues/40 | 2026 redesign: DESIGN.md, Voice Canvas, 4 modes, direct edits |
| nxcode guide | https://www.nxcode.io/resources/news/google-stitch-complete-guide-vibe-design-2026 | vibe design, voice canvas |
| tech-insider | https://tech-insider.org/google-stitch-ai-design-tool-march-2026-update/ | 5-screen canvas |

## Screens (inferred)
| ID | screen | how you get there | purpose | key components | states |
| --- | --- | --- | --- | --- | --- |
| S01 | Home / projects | app open | list and start projects | project cards, new-project button, prompt box | empty, filled, loading |
| S02 | Prompt composer | new project | describe UI, attach image, pick mode | text area, image upload, mode picker, device picker (mobile/web) | empty, uploading, over-limit, error |
| S03 | Generating | submit | progress while AI works | skeleton screens, progress text, cancel | loading, failed, timed out |
| S04 | Canvas | after generation | view up to 5 screens side by side | screen frames, zoom/pan, selection | empty, 1-5 screens |
| S05 | Screen detail | tap a frame | full-screen view of one screen | preview, edit bar | loading, error |
| S06 | Refine prompt | from S04/S05 | follow-up prompt to change a screen | chat/prompt input, history | sending, failed |
| S07 | Direct edit | from S05 | edit text, colours, spacing by hand | property panel, undo/redo | dirty, saved |
| S08 | Variants | from S05 | generate alternatives | variant grid, pick one | loading, filled |
| S09 | Design system (DESIGN.md) | project menu | view/edit tokens, export | colour, type, spacing, markdown view | empty, generated |
| S10 | Export | project menu | HTML/CSS, Tailwind, Figma paste, DESIGN.md, MCP | format list, copy, download | copied, failed |
| S11 | Voice session | mic button | spoken critique and revisions | mic, transcript, listening state | permission denied, listening, speaking |
| S12 | Settings and usage | profile | monthly generations used, account | usage meter, sign out | near limit, at limit |
| S13 | Sign in | first visit | Google sign-in | Google button | error |

## Flows
- F01 Prompt to design: S01 -> S02 -> S03 -> S04 -> S05. Edge: over limit, empty prompt, model error, timeout. Clicks to beat: ~4 after typing.
- F02 Refine: S05 -> S06 -> S03 -> S05. Edge: change breaks consistency across screens.
- F03 Image to design: S02 (attach) -> S03 -> S04. Edge: unsupported file, too large.
- F04 Variants: S05 -> S08 -> S05.
- F05 Hand edit: S05 -> S07 -> save.
- F06 Export: S04/S05 -> S10. Edge: clipboard permission denied.
- F07 Voice critique: S05 -> S11 -> S06/S03.
- F08 Design system: S09 -> edit tokens -> regenerate screens.

## Components
Prompt box, mode picker (Ideate / 3 Flash / Standard / Thinking per issue #40), device toggle, screen frame, canvas, bottom sheet (mobile replacement for side panels), tab bar, project card, variant grid, token swatch, usage meter, toast, modal, skeleton loader, mic button.

## Inferred data model (guesses)
- User(id, google_sub, email, plan) high
- Project(id, user_id, name, device, design_md, created_at) medium
- Screen(id, project_id, order, html, css, prompt_id, version) medium
- Generation(id, project_id, mode, prompt, image_ref, status, model, tokens, created_at) medium
- Usage(user_id, month, standard_count, experimental_count) medium (limits from therundown.ai)
- Variant(id, screen_id, html) low

## Cannot be cloned
Google's model tuning and Stitch's internal design-quality pipeline; Figma clipboard format and Figma plugin partnership (export as HTML/Tailwind/DESIGN.md instead); Google brand, logos, fonts, copy.

## Mobile-first adaptations (user requirement)
- Single column, `overflow-x: hidden` on body plus `min-width: 0` on flex/grid children, `max-width: 100%` on media; canvas = vertical stack or snap carousel, never a pannable 2D plane.
- Bottom sheets and bottom tab bar instead of side panels; 44px minimum tap targets; safe-area insets.
- Generated previews render inside a sandboxed iframe scaled to fit width.
- Test at 320, 360, 390, 430 px: assert `scrollWidth <= clientWidth`.

## Size
L. Hard parts: (1) reliable Gemini-generated HTML in a sandboxed preview, (2) multi-screen consistency, (3) usage metering and API-key safety (server-side only).
