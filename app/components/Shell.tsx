import Link from 'next/link';
import type { ReactNode } from 'react';

export function Shell({ title, back, children, tab }: { title: string; back?: string; children: ReactNode; tab?: 'projects' | 'create' }) {
  const t = (active: boolean) => `flex min-h-tap flex-1 items-center justify-center text-sm font-semibold ${active ? 'text-accent' : 'text-text-muted'}`;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col">
      <header className="safe-t sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-bg px-4">
        {back && <Link href={back} aria-label="Back" className="-ml-2 flex min-h-tap min-w-tap items-center justify-center text-xl">←</Link>}
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
      </header>
      <main className="min-w-0 flex-1 px-4 py-4 pb-24">{children}</main>
      <nav aria-label="Primary" className="safe-b fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[720px] border-t border-border bg-bg" style={{ height: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom))' }}>
        <Link href="/" className={t(tab === 'projects')} aria-current={tab === 'projects' ? 'page' : undefined}>Projects</Link>
        <Link href="/new" className={t(tab === 'create')} aria-current={tab === 'create' ? 'page' : undefined}>Create</Link>
      </nav>
    </div>
  );
}
