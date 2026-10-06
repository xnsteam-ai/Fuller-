# Backend status

Everything is env-driven and **unverified against live services**: no Supabase project, Google OAuth app or Gemini key exists
in this session. With no env set the app runs on the mock provider and localStorage exactly as before (Playwright 5/5 pass).

## You must do (Claude never creates accounts or handles keys)
1. Create a Supabase project. Run `supabase/migrations/0001_init.sql` in the SQL editor (or `supabase db push`).
2. Google Cloud console: create an OAuth client (web). Add the Supabase callback URL it shows. In Supabase > Auth > Providers enable Google
   with that client id/secret. Add `<your-site>/auth/callback` to Supabase redirect URLs.
3. Create `app/.env.local` from `app/.env.example`: Supabase URL, anon key, service-role key (server only), `AI_PROVIDER=gemini`, `GEMINI_API_KEY`.
4. Enable daily backups on the Supabase plan.

## Built
- Migration: tables, RLS, `consume_quota`, `refund_quota`, signup trigger creating `profiles`.
- Auth: Google OAuth via Supabase, `/auth/callback` (fixed redirect, no open redirect), cookie sessions via @supabase/ssr.
- `/api/generate` (when configured): auth required, idempotency key, atomic quota, writes project/screens/versions with service role, refunds quota and cleans up on failure, 402 at limit.
- `/api/projects`, `/api/projects/:id`: user-scoped reads under RLS.
- Not built: sign-out button, account deletion, refine/edit/variant/export routes, usage endpoint, Stripe, email, jobs (no payments or email in scope yet).

## Security checklist
- [x] secrets only in env; `.env*` ignored (except `.env.example`); service-role key referenced only in `lib/supabase/server.ts`
- [~] input validated on server: manual checks on /generate; no schema library yet
- [ ] authorisation tested with a second user: NOT tested (needs a live database)
- [~] rate limits: in-memory per-IP on /generate only; none on auth
- [n/a] webhooks, uploads (not built)
- [x] no user data in URLs (project ids only)
- [~] `npm audit`: high advisories in tailwind 3's build-time dependencies (braces/micromatch). Dev tooling only, not shipped; fix is a Tailwind 4 migration.
- [ ] privacy policy: not written (processors: Supabase, Google Cloud/Gemini, host)
- [ ] Google OAuth consent screen: basic sign-in scopes only; unverified-app limits apply until published.
