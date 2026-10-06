'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { ModeSelect } from '@/components/ModeSelect';
import { MicButton } from '@/components/MicButton';
import type { Device, Mode } from '@/lib/types';

const MAX = 4000;
const MAX_IMG = 3 * 1024 * 1024;
const MAX_MD = 20000;

export default function NewProject() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [device, setDevice] = useState<Device>('mobile');
  const [mode, setMode] = useState<Mode>('standard');
  const [designMd, setDesignMd] = useState('');
  const [image, setImage] = useState<{ name: string; mime: string; data: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const keyRef = useRef(crypto.randomUUID());
  const busyRef = useRef(false);
  const overPrompt = prompt.length > MAX;
  const over = overPrompt || designMd.length > MAX_MD;

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) return setError('Use a PNG, JPEG or WebP image.');
    if (f.size > MAX_IMG) return setError('That image is over 3 MB. Choose a smaller one.');
    const r = new FileReader();
    r.onload = () => { setError(''); setImage({ name: f.name, mime: f.type, data: String(r.result).split(',')[1] }); };
    r.onerror = () => setError('Could not read that image.');
    r.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || over || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, device, mode, idempotencyKey: keyRef.current, designMd: designMd.trim() || undefined, image: image ? { mime: image.mime, data: image.data } : undefined }) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { router.push('/sign-in'); return; }
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      router.push(`/p/${data.projectId}`); return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.'); keyRef.current = crypto.randomUUID();
    }
    busyRef.current = false; setBusy(false);
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
        <p id="count" aria-live="polite" className={`text-sm ${overPrompt ? 'text-danger' : 'text-text-muted'}`}>{prompt.length} / {MAX}{overPrompt ? ' · too long' : ''}</p>
        <div className="flex flex-wrap items-start gap-2">
          <ModeSelect value={mode} onChange={setMode} />
          <label className="flex min-h-tap cursor-pointer items-center rounded-md border border-border px-3 text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-accent">
            Attach image
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} disabled={busy} className="sr-only" />
          </label>
          <MicButton onText={(t) => setPrompt((p) => (p ? p + ' ' : '') + t)} />
        </div>
        <details className="rounded-md border border-border p-3">
          <summary className="min-h-tap cursor-pointer py-2 font-semibold">Design system (optional)</summary>
          <label className="mt-2 grid gap-1"><span className="text-sm text-text-muted">Paste a DESIGN.md, for example one exported from another project, so these screens match it.</span>
            <textarea value={designMd} onChange={(e) => setDesignMd(e.target.value)} rows={6} disabled={busy} aria-label="DESIGN.md"
              className="w-full rounded-md border border-border-input bg-bg p-3 font-mono text-base" /></label>
          <p className={`mt-1 text-sm ${designMd.length > MAX_MD ? 'text-danger' : 'text-text-muted'}`}>{designMd.length} / {MAX_MD}{designMd.length > MAX_MD ? ' · too long' : ''}</p>
        </details>
        {image && (
          <p className="flex min-w-0 items-center gap-2 text-sm"><span className="min-w-0 flex-1 truncate">Image: {image.name}</span>
            <button type="button" onClick={() => setImage(null)} className="min-h-tap font-semibold text-accent">Remove</button></p>
        )}
        {error && <p role="alert" className="rounded-md border border-danger p-3 text-danger">{error}</p>}
        <button type="submit" disabled={!prompt.trim() || over || busy} aria-busy={busy}
          className="min-h-[52px] w-full rounded-md bg-accent font-semibold text-on-accent disabled:opacity-50">{busy ? 'Generating…' : 'Generate'}</button>
        {busy && <div className="grid gap-3" aria-hidden><div className="h-40 animate-pulse rounded-lg bg-surface" /><div className="h-40 animate-pulse rounded-lg bg-surface" /></div>}
      </form>
    </Shell>
  );
}
