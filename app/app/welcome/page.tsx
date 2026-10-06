import Link from 'next/link';
import type { Metadata } from 'next';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

export const metadata: Metadata = { title: `${APP_NAME}: app screens that fit your phone`, description: APP_TAGLINE };

const STEPS = [
  ['Say what you want', 'Type or dictate a sentence. Add a sketch or screenshot if you have one.'],
  ['Get screens', 'You get up to five screens, sized for a phone, in one go.'],
  ['Make them yours', 'Ask for changes, edit the wording, try three variations, then export.'],
];
const FEATURES = [
  ['Made for phone widths', 'Every screen is built to fit a narrow display with no sideways scrolling.'],
  ['Talk or type', 'Dictate a change instead of typing it, when your browser supports it.'],
  ['Start from a picture', 'Attach a sketch or screenshot to guide the first result.'],
  ['Three variations', 'Not quite right? Ask for three different takes and keep the one you like.'],
  ['Keep a style', 'Save a DESIGN.md of colours and type and reuse it so screens match.'],
  ['Take it with you', 'Export every screen as one HTML file, with plain or Tailwind styling.'],
];
const FAQ = [
  ['Does it work on my phone?', 'Yes. It is designed for narrow screens first, and also works on larger ones.'],
  ['How do I get the designs out?', 'Export an HTML file, an HTML file with Tailwind classes, or your DESIGN.md.'],
  ['What does it cost?', 'It is in early access. Pricing will be announced before anyone is charged.'],
  ['What powers the designs?', 'Google’s Gemini models, called from our server.'],
];

const btn = 'inline-flex min-h-[52px] items-center justify-center rounded-md bg-accent px-6 font-semibold text-on-accent';

export default function Welcome() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16">
      <header className="flex h-14 items-center justify-between">
        <span className="text-lg font-semibold">{APP_NAME}</span>
        <Link href="/sign-in" className="flex min-h-tap items-center px-2 font-semibold text-accent">Sign in</Link>
      </header>

      <main>
        <section aria-labelledby="hero" className="py-10">
          <h1 id="hero" className="text-[28px] font-bold leading-[34px]">Describe a screen. Get a design that fits your phone.</h1>
          <p className="mt-3 text-text-muted">{APP_NAME} turns a sentence into app screens you can change, restyle and export, all from a narrow screen.</p>
          <Link href="/new" className={`${btn} mt-6 w-full sm:w-auto`}>Start designing</Link>
        </section>

        <section aria-labelledby="how" className="py-6">
          <h2 id="how" className="text-xl font-semibold">How it works</h2>
          <ol className="mt-4 grid gap-3">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-lg border border-border bg-surface p-4">
                <p className="font-semibold"><span className="text-accent">{i + 1}.</span> {t}</p>
                <p className="mt-1 text-text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features" className="py-6">
          <h2 id="features" className="text-xl font-semibold">What you can do</h2>
          <ul className="mt-4 grid gap-3">
            {FEATURES.map(([t, d]) => (
              <li key={t} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="early" className="py-6">
          <h2 id="early" className="text-xl font-semibold">Early access</h2>
          <p className="mt-2 text-text-muted">We are still building. Try it, and tell us what is missing. Pricing will be announced before any charge.</p>
        </section>

        <section aria-labelledby="faq" className="py-6">
          <h2 id="faq" className="text-xl font-semibold">Questions</h2>
          <div className="mt-4 grid gap-2">
            {FAQ.map(([q, a]) => (
              <details key={q} className="rounded-lg border border-border p-3">
                <summary className="min-h-tap cursor-pointer py-2 font-semibold">{q}</summary>
                <p className="pb-2 text-text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="cta" className="py-8 text-center">
          <h2 id="cta" className="text-xl font-semibold">Try your first screen</h2>
          <Link href="/new" className={`${btn} mt-4 w-full sm:w-auto`}>Start designing</Link>
        </section>
      </main>
    </div>
  );
}
