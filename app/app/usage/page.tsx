'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { UsageMeter } from '@/components/UsageMeter';

type U = { standard: { used: number; limit: number }; experimental: { used: number; limit: number } };

export default function Usage() {
  const [u, setU] = useState<U | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'signin' | 'error'>('loading');
  useEffect(() => {
    fetch('/api/usage').then(async (r) => {
      if (r.status === 401) return setState('signin');
      if (!r.ok) return setState('error');
      setU(await r.json()); setState('ok');
    }).catch(() => setState('error'));
  }, []);
  return (
    <Shell title="Usage" tab="usage">
      {state === 'loading' && <div className="h-24 animate-pulse rounded-lg bg-surface" aria-label="Loading usage" />}
      {state === 'signin' && <p className="rounded-md border border-border bg-surface p-4">Sign in to see your usage. <Link href="/sign-in" className="font-semibold text-accent underline">Sign in</Link></p>}
      {state === 'error' && <p role="alert" className="rounded-md border border-danger p-4 text-danger">Could not load usage. Try again.</p>}
      <p className="mt-6"><Link href="/account" className="flex min-h-tap items-center font-semibold text-accent underline">Account, privacy and terms</Link></p>
      {u && (
        <div className="grid gap-5">
          <UsageMeter label="Standard allowance" used={u.standard.used} limit={u.standard.limit} />
          <UsageMeter label="Experimental allowance" used={u.experimental.used} limit={u.experimental.limit} />
          <p className="text-sm text-text-muted">Standard mode uses the standard allowance. Fast, Thinking and Ideate use the experimental one. Failed requests are refunded.</p>
        </div>
      )}
    </Shell>
  );
}
