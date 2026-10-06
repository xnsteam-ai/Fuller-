# Build log
- S01 Projects: partial (empty + filled + loading; no rename/duplicate/delete UI)
- S02 Prompt composer: partial (device toggle, counter, error, busy; no image attach, no mode picker)
- S04 Canvas: partial (vertical stack of sandboxed, scaled previews; no zoom, no skeleton per frame)
- S13 Sign in: placeholder page only (needs /replica-backend)
- Not started: S03 as separate screen (folded into S02 busy state), S05-S12
- Gemini: GeminiApiKeyProvider written, NOT verified against the live API. Default provider is mock (AI_PROVIDER unset).
- Harder than expected: the overflow-x:clip backstop can hide real overflow; the test disables it before measuring.
- Checks: tsc clean; Playwright 5/5 (4 widths + iframe sandbox). Not done: keyboard-only pass, 1440px pass, screenshots, console-error check.
