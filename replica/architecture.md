# Architecture: Stitch clone (mobile-first)

Inputs: `recon.md` (evidence LOW-MEDIUM, screens inferred), `features.csv`.

## Stack
| layer | choice | why |
| --- | --- | --- |
| web app | Next.js App Router + TypeScript | one codebase, server routes keep the AI key off the client |
| styling | Tailwind, tokens from /replica-design | mobile-first utilities, easy `min-w-0` / `max-w-full` discipline |
| db + auth + storage | Supabase (Postgres, Google OAuth, Storage) | RLS, managed, free at zero users |
| AI | `AiProvider` adapter: `GeminiApiKeyProvider` or `VertexProvider` | key-vs-Vertex decision deferred; swap by env `AI_PROVIDER` |
| jobs | none at first; generation runs in a streaming route with `maxDuration` | add Inngest only if timeouts bite |
| hosting | Vercel | |
| mobile | installable PWA (manifest + service worker shell) | user asked for mobile web; Expo only later if wanted |

Secrets (server env only, never `NEXT_PUBLIC_`): `GEMINI_API_KEY` or `GOOGLE_CLOUD_PROJECT` + service-account credentials, `SUPABASE_SERVICE_ROLE_KEY`.

## Schema
`replica/schema.sql`: 6 tables (profiles, projects, generations, screens, screen_versions, usage_counters), RLS on all, writes to generations/versions/usage only via the server (service role), plus `consume_quota()` for atomic metering. Variants are `screen_versions` with `kind='variant'`. DESIGN.md lives in `projects.design_md`.

## API (server routes)
| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| GET /api/projects | list | owner | - | projects | F01 |
| POST /api/projects | create | owner | name, device | project | F01 |
| POST /api/projects/:id/generate | prompt/image -> 1-5 screens, streamed (SSE) | owner | prompt, mode, image?, idempotency_key | screens | F01 F03 |
| POST /api/screens/:id/refine | follow-up prompt -> new version | owner | prompt | version | F02 |
| POST /api/screens/:id/variants | 3 alternatives | owner | - | versions | F04 |
| PATCH /api/screens/:id | direct edit -> new version | owner | html patch | version | F05 |
| GET /api/projects/:id/export?fmt=html\|tailwind\|designmd | download | owner | fmt | file | F06 |
| PUT /api/projects/:id/design | save DESIGN.md | owner | markdown | ok | F08 |
| POST /api/uploads | signed upload for image | owner | mime, size | url | F03 |
| GET /api/usage | counters | owner | - | used/limit | S12 |
Voice (F07): browser Web Speech API for transcript first, feeding the refine route; no server audio.
Webhooks: none until payments (Stripe later).

## The parts that bite
- **Untrusted generated HTML:** sanitise server-side (strip script, on* handlers, javascript: URLs, external form actions), render only in `<iframe sandbox="" srcdoc>` (no allow-same-origin, no allow-scripts) with a CSP.
- **API key safety:** only server routes call Gemini; rate limit per user (and per IP on sign-in); cap prompt at 4000 chars and image at 5 MB.
- **Quota races:** `consume_quota()` is atomic; refund (decrement) on failed generation. Limits mirror original: 350 standard / 50 experimental per month (configurable).
- **Idempotency:** `unique(user_id, idempotency_key)` so a retried tap does not double-charge.
- **Timeouts:** stream partial progress; mark `failed` with error text; client can retry.
- **Multi-screen consistency:** send DESIGN.md plus prior screen summaries in each generation prompt; request JSON of screens, validate with a schema before saving.
- **Model output drift:** validate JSON, retry once on invalid, then fail visibly.
- **No horizontal scroll (acceptance rule):** `html,body{overflow-x:clip}` as a backstop only; real fix is `min-w-0`, `max-w-full`, `break-words` on content, tables/code in their own `overflow-x:auto` box is NOT allowed at page level so wrap instead; iframe previews scaled with CSS `transform` inside a fixed-width wrapper. Playwright check at 320/360/390/430: `document.documentElement.scrollWidth <= innerWidth` on every screen S01-S13.
- **Privacy/GDPR:** account deletion cascades through `profiles`; image uploads auto-expire.

## Build order
1. **Vertical slice:** Google sign-in -> S02 prompt -> `/generate` -> S04 stack of screens in sandboxed previews. Tables: profiles, projects, generations, screens, screen_versions. Includes the width test harness from day one.
2. **Musts:** project list (S01), refine (S06), HTML export (S10), usage + quota (S12), device toggle, no-h-scroll audit across all screens.
3. **Shoulds:** image-to-UI, 5-screen flows, direct edit (S07), DESIGN.md (S09), Tailwind export.
4. **Coulds:** variants (S08), mode picker, voice (S11), more frameworks, MCP.
5. **Fixes** from /replica-entrepreneur.

Skipped: Figma paste (proprietary clipboard format).
