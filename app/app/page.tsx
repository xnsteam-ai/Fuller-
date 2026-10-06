'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { SignOutButton } from '@/components/SignOutButton';
import type { Project } from '@/lib/types';

export default function Home() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [status, setStatus] = useState<'ok' | 'signin' | 'unconfigured' | 'error'>('ok');
  useEffect(() => {
    fetch('/api/projects').then(async (r) => {
      if (r.status === 401) { setStatus('signin'); setProjects([]); return; }
      if (r.status === 501 || r.status === 503) { setStatus('unconfigured'); setProjects([]); return; }
      if (!r.ok) { setStatus('error'); setProjects([]); return; }
      const d = await r.json();
      setProjects((d.projects ?? []).map((x: any) => ({ id: x.id, name: x.name, device: x.device, prompt: '', updatedAt: Date.parse(x.updated_at), screens: Array(x.screens?.[0]?.count ?? 0).fill(null) })));
    }).catch(() => { setStatus('error'); setProjects([]); });
  }, []);
  return (
    <Shell title="Projects" tab="projects">
      {projects === null && <div className="h-24 animate-pulse rounded-lg bg-surface" aria-label="Loading projects" />}
      {status === 'signin' && <p className="rounded-md border border-border bg-surface p-4">Sign in to see your projects. <Link href="/sign-in" className="font-semibold text-accent underline">Sign in</Link></p>}
      {status === 'unconfigured' && <p role="alert" className="rounded-md border border-warning p-4">The backend is not configured yet (Supabase settings missing).</p>}
      {status === 'error' && <p role="alert" className="rounded-md border border-danger p-4 text-danger">Could not load projects. Try again.</p>}
      {status === 'ok' && projects?.length === 0 && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold">Nothing here yet</h2>
          <p className="mt-1 text-text-muted">Say what you want to see. A first design lands in seconds.</p>
          <Link href="/new" className="mt-4 inline-flex min-h-tap items-center rounded-md bg-accent px-5 font-semibold text-on-accent">Start a project</Link>
        </div>
      )}
      <ul className="grid gap-3">
        {projects?.map((p) => (
          <li key={p.id}>
            <Link href={`/p/${p.id}`} className="block min-h-tap rounded-lg border border-border bg-surface p-4 shadow-card">
              <span className="line-clamp-2 break-words font-semibold">{p.name}</span>
              <span className="text-sm text-text-muted">{p.screens.length} screens · {new Date(p.updatedAt).toLocaleDateString()}</span>
            </Link>
          </li>
        ))}
      </ul>
      {status === 'ok' && <SignOutButton />}
    </Shell>
  );
}
