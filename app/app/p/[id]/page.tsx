'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { PreviewFrame } from '@/components/PreviewFrame';
import { BottomSheet } from '@/components/BottomSheet';
import { useApi } from '@/lib/useApi';
import type { Project } from '@/lib/types';

export default function Canvas({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const call = useApi();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [menu, setMenu] = useState<'closed' | 'menu' | 'rename' | 'delete'>('closed');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`/api/projects/${id}`).then((r) => (r.ok ? r.json() : null)).then((d) => { setProject(d?.project ?? null); setName(d?.project?.name ?? ''); }).catch(() => setProject(null));
  }, [id]);

  async function rename() {
    const r = await call(`/api/projects/${id}`, 'PATCH', { name });
    if (!r.ok) return setErr(r.error);
    setProject((p) => (p ? { ...p, name: name.trim() } : p)); setMenu('closed'); setErr('');
  }
  async function remove() {
    const r = await call(`/api/projects/${id}`, 'DELETE');
    if (!r.ok) return setErr(r.error);
    router.push('/');
  }
  const close = () => { setMenu('closed'); setErr(''); };

  return (
    <Shell title={project?.name ?? 'Design'} back="/"
      action={project ? <button onClick={() => setMenu('menu')} aria-label="Project menu" aria-haspopup="dialog" className="flex min-h-tap min-w-tap items-center justify-center text-xl">⋯</button> : null}>
      {project === undefined && <div className="h-64 animate-pulse rounded-lg bg-surface" />}
      {project === null && <p className="rounded-md border border-border p-4">This project was not found, or you are not signed in. <Link href="/" className="font-semibold text-accent underline">Back to projects</Link></p>}
      {project && (
        <div className="grid gap-6">
          {project.screens.map((s, i) => s && (
            <section key={s.id} aria-label={`Screen ${i + 1} of ${project.screens.length}: ${s.title}`} className="grid gap-2">
              <h2 className="text-sm font-semibold text-text-muted">{i + 1} / {project.screens.length} · {s.title}</h2>
              <PreviewFrame html={s.html} title={s.title} />
              <Link href={`/p/${id}/s/${s.id}`} className="flex min-h-tap items-center justify-center rounded-md border border-border font-semibold">Open and edit</Link>
            </section>
          ))}
        </div>
      )}
      <BottomSheet open={menu === 'menu'} onClose={close} title="Project">
        <div className="grid gap-2">
          <button onClick={() => setMenu('rename')} className="min-h-tap rounded-md border border-border text-left px-3 font-semibold">Rename</button>
          <Link href={`/p/${id}/design`} className="flex min-h-tap items-center rounded-md border border-border px-3 font-semibold">Design system</Link>
          <Link href={`/p/${id}/export`} className="flex min-h-tap items-center rounded-md border border-border px-3 font-semibold">Export</Link>
          <button onClick={() => setMenu('delete')} className="min-h-tap rounded-md border border-danger px-3 text-left font-semibold text-danger">Delete project</button>
        </div>
      </BottomSheet>
      <BottomSheet open={menu === 'rename'} onClose={close} title="Rename project">
        <form onSubmit={(e) => { e.preventDefault(); rename(); }} className="grid gap-3">
          <label className="grid gap-1"><span className="font-semibold">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="min-h-tap w-full rounded-md border border-border-input bg-bg px-3 text-base" /></label>
          {err && <p role="alert" className="text-danger">{err}</p>}
          <button type="submit" disabled={!name.trim()} className="min-h-tap rounded-md bg-accent font-semibold text-on-accent disabled:opacity-50">Save</button>
        </form>
      </BottomSheet>
      <BottomSheet open={menu === 'delete'} onClose={close} title="Delete this project?">
        <p className="mb-3 text-text-muted">All screens and versions are removed. This cannot be undone.</p>
        {err && <p role="alert" className="mb-2 text-danger">{err}</p>}
        <div className="grid gap-2">
          <button onClick={close} className="min-h-tap rounded-md border border-border font-semibold">Cancel</button>
          <button onClick={remove} className="min-h-tap rounded-md bg-danger font-semibold text-bg">Delete</button>
        </div>
      </BottomSheet>
    </Shell>
  );
}
