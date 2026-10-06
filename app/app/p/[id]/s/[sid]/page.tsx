'use client';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { Shell } from '@/components/Shell';
import { PreviewFrame } from '@/components/PreviewFrame';
import { MicButton } from '@/components/MicButton';
import { ModeSelect } from '@/components/ModeSelect';
import { useApi } from '@/lib/useApi';
import type { Mode } from '@/lib/types';

type Version = { version: number; kind: string; html: string; created_at: string };
type Data = { screen: { id: string; title: string; projectId: string; current: number; html: string }; versions: Version[] };
const TABS = ['Refine', 'Edit text', 'Variants', 'History'] as const;

export default function ScreenPage({ params }: { params: Promise<{ id: string; sid: string }> }) {
  const { id, sid } = use(params);
  const call = useApi();
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Refine');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [mode, setMode] = useState<Mode>('standard');
  const [prompt, setPrompt] = useState('');

  const load = useCallback(async () => {
    const r = await fetch(`/api/screens/${sid}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    setData(r);
  }, [sid]);
  useEffect(() => { load(); }, [load]);

  // Run one action at a time; show its error, reload on success.
  async function run(fn: () => Promise<{ ok: boolean; error: string }>, okMsg: string) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setMsg('');
    const r = await fn();
    busyRef.current = false; setBusy(false);
    if (!r.ok) return setMsg(r.error);
    setMsg(okMsg); await load();
  }
  const refine = () => run(async () => { const r = await call(`/api/screens/${sid}/refine`, 'POST', { prompt, mode }); if (r.ok) setPrompt(''); return r; }, 'Updated.');
  const makeVariants = () => run(() => call(`/api/screens/${sid}/variants`, 'POST', { mode }), 'Three variants added below.');
  const pick = (version: number) => run(() => call(`/api/screens/${sid}`, 'PATCH', { currentVersion: version }), 'Version applied.');

  return (
    <Shell title={data?.screen.title ?? 'Screen'} back={`/p/${id}`}>
      {data === undefined && <div className="h-64 animate-pulse rounded-lg bg-surface" />}
      {data === null && <p className="rounded-md border border-border p-4">Screen not found, or you are not signed in.</p>}
      {data && (
        <div className="grid gap-4">
          <PreviewFrame html={data.screen.html} title={data.screen.title} height={760} />
          <div role="tablist" aria-label="Screen tools" className="grid grid-cols-4 gap-1 rounded-md bg-surface p-1">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setMsg(''); }}
                className={`min-h-tap rounded-sm px-1 text-sm font-semibold ${tab === t ? 'bg-bg shadow-card' : 'text-text-muted'}`}>{t}</button>
            ))}
          </div>
          <div role="status" aria-live="polite" className="min-h-5 text-sm">{msg && <span className={/updated|applied|added|saved/i.test(msg) ? 'text-success' : 'text-danger'}>{msg}</span>}</div>

          {tab === 'Refine' && (
            <form onSubmit={(e) => { e.preventDefault(); if (prompt.trim() && prompt.length <= 2000) refine(); }} className="grid gap-3">
              <label className="grid gap-1"><span className="font-semibold">What should change?</span>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} disabled={busy} placeholder="Make the buttons larger and use a warmer colour"
                  className="w-full rounded-md border border-border-input bg-bg p-3 text-base" /></label>
              <div className="flex flex-wrap items-start gap-2"><ModeSelect value={mode} onChange={setMode} /><MicButton onText={(t) => setPrompt((p) => (p ? p + ' ' : '') + t)} /></div>
              <button type="submit" disabled={busy || !prompt.trim() || prompt.length > 2000} aria-busy={busy} className="min-h-[52px] rounded-md bg-accent font-semibold text-on-accent disabled:opacity-50">{busy ? 'Working…' : 'Apply change'}</button>
            </form>
          )}
          {tab === 'Edit text' && <TextEditor key={data.screen.current} html={data.screen.html} disabled={busy} onSave={(html) => run(() => call(`/api/screens/${sid}`, 'PATCH', { html }), 'Saved.')} />}
          {tab === 'Variants' && (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-start gap-2"><ModeSelect value={mode} onChange={setMode} />
                <button onClick={makeVariants} disabled={busy} aria-busy={busy} className="min-h-tap flex-1 rounded-md bg-accent px-4 font-semibold text-on-accent disabled:opacity-50">{busy ? 'Working…' : 'Generate 3 variants'}</button></div>
              {data.versions.filter((v) => v.kind === 'variant').length === 0 && <p className="text-text-muted">No variants yet.</p>}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {data.versions.filter((v) => v.kind === 'variant').map((v) => (
                  <div key={v.version} className="grid gap-2">
                    <PreviewFrame html={v.html} title={`Variant ${v.version}`} height={620} />
                    <button onClick={() => pick(v.version)} disabled={busy || v.version === data.screen.current} className="min-h-tap rounded-md border border-border font-semibold disabled:opacity-50">{v.version === data.screen.current ? 'In use' : 'Use this one'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'History' && (
            <ul className="grid gap-2">
              {data.versions.map((v) => (
                <li key={v.version} className="flex min-h-tap items-center justify-between gap-2 rounded-md border border-border p-3">
                  <span className="min-w-0"><span className="font-semibold">Version {v.version}</span> <span className="text-sm text-text-muted">· {v.kind} · {new Date(v.created_at).toLocaleString()}</span></span>
                  <button onClick={() => pick(v.version)} disabled={busy || v.version === data.screen.current} className="min-h-tap shrink-0 rounded-md border border-border px-3 font-semibold disabled:opacity-50">{v.version === data.screen.current ? 'Current' : 'Restore'}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Shell>
  );
}

// Edit the visible text of a screen without touching its layout.
function TextEditor({ html, onSave, disabled }: { html: string; onSave: (html: string) => void; disabled: boolean }) {
  const [texts, setTexts] = useState<string[]>([]);
  useEffect(() => {
    const doc = new DOMParser().parseFromString(`<body>${html}`, 'text/html');
    const w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const out: string[] = []; let n: Node | null;
    while ((n = w.nextNode())) if (n.nodeValue?.trim() && !['STYLE', 'SCRIPT'].includes(n.parentElement?.tagName ?? '')) out.push(n.nodeValue.trim());
    setTexts(out);
  }, [html]);

  function save() {
    const doc = new DOMParser().parseFromString(`<body>${html}`, 'text/html');
    const w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    let i = 0; let n: Node | null;
    while ((n = w.nextNode())) {
      if (n.nodeValue?.trim() && !['STYLE', 'SCRIPT'].includes(n.parentElement?.tagName ?? '')) {
        const lead = n.nodeValue.match(/^\s*/)![0], trail = n.nodeValue.match(/\s*$/)![0];
        n.nodeValue = lead + (texts[i++] ?? '') + trail;
      }
    }
    onSave(doc.body.innerHTML);
  }
  if (!texts.length) return <p className="text-text-muted">This screen has no editable text.</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3">
      {texts.map((t, i) => (
        <label key={i} className="grid gap-1"><span className="text-sm text-text-muted">Text {i + 1}</span>
          <input value={t} maxLength={300} disabled={disabled} onChange={(e) => setTexts((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
            className="min-h-tap w-full rounded-md border border-border-input bg-bg px-3 text-base" /></label>
      ))}
      <button type="submit" disabled={disabled} className="min-h-[52px] rounded-md bg-accent font-semibold text-on-accent disabled:opacity-50">Save text</button>
    </form>
  );
}
