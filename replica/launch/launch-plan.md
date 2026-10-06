# Launch plan (web app, early access)

No store listing: this is a web app. If you later wrap it as an app-store app, create `listing.json` and run `listing.py`. Apple's copycat rule (4.1) means the listing must lead with what is different, which needs the evidence step.

## Before anyone sees it (blockers)
1. Credentials in a new session; live test of sign-in, generation, quota, refine.
2. Two-user data isolation test passes.
3. Name cleared: trademark, domain, handles (see `replica/brand.md`), ideally lawyer-checked.
4. Privacy policy and terms listing the processors: Supabase, Google Cloud (Gemini), the host. Not written yet.
5. Google sign-in consent screen configured; unverified-app limits apply until published.
6. Analytics and error tracking: none installed yet. Choose one and disclose it in the policy.
7. Real hero screenshot from the live app.

## Waitlist or beta
Start a list of 20 to 50 people who design or review screens on a phone. Ask for permission before using anything they say publicly.

## Where to find early users (unverified, I could not read these)
Communities to look at by hand: Reddit design and indie-dev communities, Hacker News "Show HN", Product Hunt. Search them for "AI UI design tool" and "mockup on phone" and read before posting. Follow each community's self-promotion rules.

## Launch post
Lead with what it does for a phone user, not with the original. Do not name the original in the title, ads or listing. A comparison page is a legal question for a lawyer in your country.

## First 10 users
Talk to ten people by hand. For each: watch them create a first design, note where they stall, ask what they would pay and for what. This is also the missing evidence for `/replica-entrepreneur`: record their words (with permission) in `replica/reviews.csv` as research, not as testimonials.

## Metrics to watch
Visitors → first generation → second generation (refine) → export. Generations per user against the quota, and cost per active user.
