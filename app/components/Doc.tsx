import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/lib/brand';

export function Doc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16">
      <header className="flex h-14 items-center justify-between">
        <Link href="/welcome" className="flex min-h-tap items-center text-lg font-semibold">{APP_NAME}</Link>
        <Link href="/sign-in" className="flex min-h-tap items-center px-2 font-semibold text-accent">Sign in</Link>
      </header>
      <main className="grid gap-4 py-6 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:grid [&_ul]:gap-1 [&_ul]:pl-5 [&_ul]:list-disc">
        <h1 className="text-[28px] font-bold leading-[34px]">{title}</h1>
        <p role="note" className="rounded-md border border-warning p-3 text-sm">Draft written from how the app works today. Have a lawyer review it, and fill in the contact details, before launch.</p>
        {children}
      </main>
    </div>
  );
}
