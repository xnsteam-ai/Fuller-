'use client';
import { use, useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { useApi } from '@/lib/useApi';

const HEX = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

export default function DesignSystem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const call = useApi();
  const [md, setMd] = useState<string | null>(null);
  const [saved, setSaved] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (!d) return setFailed(true); const v = d.project.design_md ?? ''; setMd(v); setSaved(v); }).catch(() => setFailed(true));
  }, [id]);

  async function generate() {
    setBusy(true); setMsg('');
    const r = await call(`/api/projects/${id}/design`, 'POST', {});
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    setMd(r.data.design_md); setSaved(r.data.design_md); setMsg('Generated and saved.');
  }
  async function save() {
    setBusy(true); setMsg('');
    const r = await call(`/api/projects/${id}`, 'PATCH', { design_md: md });
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    setSaved(md ?? ''); setMsg('Saved.');
  }
  const swatches = Array.from(new Set((md ?? '').match(HEX) ?? [])).slice(0, 24);

  return (
    <Shell title="Design system" back={`/p/${id}`}>
      {failed && <p role="alert" className="rounded-md border border-danger p-4 text-danger">Could not load this project. Check you are signed in and try again.</p>}
      {md === null && !failed && <div className="h-40 animate-pulse rounded-lg bg-surface" aria-label="Loading" />}
      {md !== null && (
        <div className="grid gap-4">
          {!md && <p className="rounded-md border border-border bg-surface p-4">No DESIGN.md yet. Generate one from your screens, or write your own below. New generations and refinements use it to stay consistent.</p>}
          {swatches.length > 0 && (
            <ul aria-label="Colours found" className="flex flex-wrap gap-2">
              {swatches.map((c) => (
                <li key={c} className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-sm"><span aria-hidden className="inline-block h-5 w-5 rounded-sm border border-border" style={{ background: c }} />{c}</li>
              ))}
            </ul>
          )}
          <label className="grid gap-1"><span className="font-semibold">DESIGN.md</span>
            <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={14} maxLength={20000} className="w-full rounded-md border border-border-input bg-bg p-3 font-mono text-base" /></label>
          <p className="text-sm text-text-muted">{md.length} / 20000</p>
          <div role="status" aria-live="polite" className="min-h-5 text-sm">{msg && <span className={/saved|generated/i.test(msg) ? 'text-success' : 'text-danger'}>{msg}</span>}</div>
          <button onClick={save} disabled={busy || md === saved} className="min-h-[52px] rounded-md bg-accent font-semibold text-on-accent disabled:opacity-50">Save</button>
          <button onClick={generate} disabled={busy} aria-busy={busy} className="min-h-[52px] rounded-md border border-border font-semibold disabled:opacity-50">{busy ? 'Working…' : md ? 'Regenerate from screens (replaces text)' : 'Generate from screens'}</button>
        </div>
      )}
    </Shell>
  );
}
