'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { listProjects } from '@/lib/store';
import type { Project } from '@/lib/types';
import { supabaseConfigured } from '@/lib/supabase/config';

export default function Home() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    if (!supabaseConfigured) { setProjects(listProjects()); return; }
    fetch('/api/projects').then((r) => (r.ok ? r.json() : { projects: [] })).then((d) =>
      setProjects((d.projects ?? []).map((x: any) => ({ id: x.id, name: x.name, device: x.device, prompt: '', updatedAt: Date.parse(x.updated_at), screens: Array(x.screens?.[0]?.count ?? 0).fill(null) }))),
    ).catch(() => setProjects([]));
  }, []);
  return (
    <Shell title="Projects" tab="projects">
      {projects === null && <div className="h-24 animate-pulse rounded-lg bg-surface" aria-label="Loading projects" />}
      {projects?.length === 0 && (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold">Nothing here yet</h2>
          <p className="mt-1 text-text-muted">Describe a screen and see it appear in seconds.</p>
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
    </Shell>
  );
}
