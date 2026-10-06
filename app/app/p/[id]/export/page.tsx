'use client';
import { use, useState } from 'react';
import { Shell } from '@/components/Shell';

const ROWS = [
  { fmt: 'html', title: 'HTML', desc: 'One file with every screen' },
  { fmt: 'designmd', title: 'DESIGN.md', desc: 'Your design system notes' },
] as const;

export default function Export({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [msg, setMsg] = useState('');

  async function copy(fmt: string) {
    setMsg('');
    try {
      const r = await fetch(`/api/projects/${id}/export?fmt=${fmt}`);
      if (!r.ok) return setMsg((await r.json().catch(() => ({}))).error || 'Could not export.');
      await navigator.clipboard.writeText(await r.text());
      setMsg('Copied.');
    } catch { setMsg('Copy is not allowed here. Use Download instead.'); }
  }

  return (
    <Shell title="Export" back={`/p/${id}`}>
      <ul className="grid gap-3">
        {ROWS.map((r) => (
          <li key={r.fmt} className="grid gap-2 rounded-lg border border-border p-3">
            <div><p className="font-semibold">{r.title}</p><p className="text-sm text-text-muted">{r.desc}</p></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => copy(r.fmt)} className="min-h-tap rounded-md border border-border font-semibold">Copy</button>
              <a href={`/api/projects/${id}/export?fmt=${r.fmt}`} download className="flex min-h-tap items-center justify-center rounded-md bg-accent font-semibold text-on-accent">Download</a>
            </div>
          </li>
        ))}
      </ul>
      <div role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">{msg && <span className={msg === 'Copied.' ? 'text-success' : 'text-danger'}>{msg}</span>}</div>
      <p className="mt-4 text-sm text-text-muted">Tailwind and framework exports are not available yet.</p>
    </Shell>
  );
}
