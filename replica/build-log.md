# Build log
- S01 Projects: partial (empty + filled + loading; no rename/duplicate/delete UI)
- S02 Prompt composer: partial (device toggle, counter, error, busy; no image attach, no mode picker)
- S04 Canvas: partial (vertical stack of sandboxed, scaled previews; no zoom, no skeleton per frame)
- S13 Sign in: placeholder page only (needs /replica-backend)
- Not started: S03 as separate screen (folded into S02 busy state), S05-S12
- Gemini: GeminiApiKeyProvider written, NOT verified against the live API. Default provider is mock (AI_PROVIDER unset).
- Harder than expected: the overflow-x:clip backstop can hide real overflow; the test disables it before measuring.
- Checks: tsc clean; Playwright 5/5 (4 widths + iframe sandbox). Not done: keyboard-only pass, 1440px pass, screenshots, console-error check.

## Update: remaining screens built (all against the real backend code, none run live)
- S05 screen detail (tabs: Refine, Edit text, Variants, History), S06 refine, S07 edit text, S08 variants, S09 design system, S10 export (HTML, DESIGN.md), S11 voice (browser speech-to-text into the prompt), S12 usage, mode picker, image attach, project rename/delete.
- Bugs found by tests and fixed: MicButton hydration mismatch (React #418); speech constructor passed to setState was called as an updater.
- Tests: 32 Playwright tests pass. UI tests use a network-level test double (tests/fake-backend.ts), so they check wiring only, not the real routes, RLS or Gemini.
- Known gaps: Tailwind/framework export, MCP, spoken voice replies, colour/spacing edit, DESIGN.md is not yet fed to new generations in /api/generate (refine, variants use it), keyboard-only pass on the new screens, 1440px pass, screenshots.
