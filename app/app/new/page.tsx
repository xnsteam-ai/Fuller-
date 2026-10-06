'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { saveProject } from '@/lib/store';
import { supabaseConfigured } from '@/lib/supabase/config';
import type { Device } from '@/lib/types';

const MAX = 4000;

export default function NewProject() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [device, setDevice] = useState<Device>('mobile');
  const [busy, setBusy] = useState(false);
  const keyRef = useRef(crypto.randomUUID());
  const [error, setError] = useState('');
  const over = prompt.length > MAX;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || over || busy) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, device, mode: 'standard', idempotencyKey: keyRef.current }) });
      const data = await res.json();
      if (res.status === 401) { router.push('/sign-in'); return; }
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      if (supabaseConfigured) { router.push(`/p/${data.projectId}`); return; }
      const id = crypto.randomUUID();
      saveProject({ id, name: prompt.trim().slice(0, 50), device, prompt, screens: data.screens, updatedAt: Date.now() });
      router.push(`/p/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.'); setBusy(false); keyRef.current = crypto.randomUUID();
    }
  }

  return (
    <Shell title="New design" back="/" tab="create">
      <form onSubmit={submit} className="grid gap-4">
        <div role="group" aria-label="Device" className="grid grid-cols-2 gap-1 rounded-md bg-surface p-1">
          {(['mobile', 'web'] as const).map((d) => (
            <button type="button" key={d} aria-pressed={device === d} onClick={() => setDevice(d)}
              className={`min-h-tap rounded-sm font-semibold capitalize ${device === d ? 'bg-bg shadow-card' : 'text-text-muted'}`}>{d}</button>
          ))}
        </div>
        <label className="grid gap-1">
          <span className="font-semibold">Describe your app screen</span>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} disabled={busy}
            placeholder="A habit tracker with a streak counter and a weekly chart"
            aria-describedby="count" className="w-full rounded-md border border-border-input bg-bg p-3 text-base" />
        </label>
        <p id="count" aria-live="polite" className={`text-sm ${over ? 'text-danger' : 'text-text-muted'}`}>{prompt.length} / {MAX}{over ? ' · too long' : ''}</p>
        {error && <p role="alert" className="rounded-md border border-danger p-3 text-danger">{error}</p>}
        <button type="submit" disabled={!prompt.trim() || over || busy} aria-busy={busy}
          className="min-h-[52px] w-full rounded-md bg-accent font-semibold text-on-accent disabled:opacity-50">{busy ? 'Generating…' : 'Generate'}</button>
        {busy && <div className="grid gap-3" aria-hidden><div className="h-40 animate-pulse rounded-lg bg-surface" /><div className="h-40 animate-pulse rounded-lg bg-surface" /></div>}
      </form>
    </Shell>
  );
}
