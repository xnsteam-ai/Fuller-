# Deploy preflight: NOT READY. Nothing was deployed.

Run 2026-10-06 on branch `claude/optimistic-brown-p55uke`. No host, domain, account, key or DNS was touched.

## Automated checks
| check | result |
| --- | --- |
| `npm run build` (production build) | pass |
| Playwright suite | pass, 40 of 40. These use a test double for the backend, so they do not prove the real services work |
| Parity (`parity.py`) | **fail**: 51.3 / 100, must-haves 1 of 7 done. The verdict is "not shippable" |
| Rebrand sweep | pass (clean). Guessed original colours only; real ones were never observed |
| `listing.py` | not run: web app, no store listing |
| `npm audit --omit=dev` | pass, 0 vulnerabilities in production dependencies. Dev-only tooling has known advisories (Tailwind 3 build deps) |

## Manual checks
| check | result |
| --- | --- |
| No open S1 or S2 bugs | **cannot say**: the real routes have never run. Data isolation between two users is untested. Treat as an open S1 until tested |
| Privacy policy and terms pages | **drafted** at `/privacy` and `/terms`, marked draft in the page. Placeholders remain for the host name and a contact email. Needs a lawyer's review |
| Cookie banner | not needed yet (no analytics or non-essential cookies), re-check when analytics is added |
| Account deletion | **built** (`/account`, `DELETE /api/account`, typed confirmation, FK cascades checked in the migration). **Not run against a real database** |
| Sign out | present |
| Favicon, titles, OG image | favicon and titles done; the icon is a placeholder; OG image built (`/opengraph-image`, 1200x630 PNG, tested) |
| Name cleared | **no**: trademark, domain and handle checks all "to run" (`replica/brand.md`) |
| Error tracking, uptime, analytics | **none installed** |
| Rate limiting | in-memory, one instance only; replace before running more than one server |
| Abuse and cost cap | no per-day spend cap on your Google Cloud key: set a budget alert and a quota limit in Google Cloud before launch |

## Verdict
**Do not deploy.** Blockers, in order:
1. Live test of Google sign-in, generation, refine, quota and idempotency with real services.
2. Two-user data isolation test (security gate).
3. Must-haves done (parity), which depends on 1.
4. Privacy policy, terms, account deletion.
5. Name clearance.
6. Cost cap on the Gemini key; error tracking.

## What you do, when you are ready (I never buy, sign in or paste live keys)
**Production database**: create a separate Supabase project (not the dev one), turn on backups, run `supabase/migrations/0001_init.sql`.

**Google sign-in**: create a Google Cloud OAuth client; add the Supabase callback and your production domain to authorised redirect URIs and origins; in Supabase enable the Google provider; add `https://YOURDOMAIN/auth/callback` to Supabase redirect URLs. Basic sign-in scopes need no extra verification, but the consent screen must be published or only listed test users can sign in.

**Host (Vercel)**: import the repo, set the project root to `app`, then set these environment variables for Production only (never in git):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `AI_PROVIDER=gemini`, optional `GEMINI_MODEL`, `GEMINI_MODEL_FLASH`, `GEMINI_MODEL_THINKING`, `QUOTA_STANDARD`, `QUOTA_EXPERIMENTAL`. Note: `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

**Domain**, after you buy it:
| record | name | value |
| --- | --- | --- |
| A | @ | the IP Vercel shows in Domain settings |
| CNAME | www | `cname.vercel-dns.com` |
| TXT | as asked | Vercel's verification value, if shown |
Pick one canonical host (apex or www) and redirect the other. Check HTTPS.

**Email** (only if you add email later): SPF, DKIM from the provider, and `v=DMARC1; p=none; rua=mailto:you@yourdomain`.

**Payments**: not integrated. Nothing to switch to live.

**Watch it**: error tracking, an uptime check on `/welcome` and `/api/usage`, a Google Cloud budget alert, and a daily look at the usage table in the first week. Do the core flow on the live site yourself and on your phone.

## Go decision
Not asked, because the preflight fails. When blockers 1 to 6 are done I will re-run this and ask for your explicit go before anything goes live.

## Update (later run)
Closed without credentials: privacy and terms drafts, account deletion, OG image. Playwright is now 45 of 45. Still open: live tests, two-user isolation, parity must-haves, name clearance, cost cap, error tracking, and filling the two placeholders in the legal pages.
