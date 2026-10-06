'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { BottomSheet } from '@/components/BottomSheet';
import { useApi } from '@/lib/useApi';

export default function Account() {
  const router = useRouter();
  const call = useApi();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (text !== 'DELETE' || busy) return;
    setBusy(true); setErr('');
    const r = await call('/api/account', 'DELETE', { confirm: 'DELETE' });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    router.push('/welcome');
  }
  const close = () => { setOpen(false); setText(''); setErr(''); };

  return (
    <Shell title="Account" back="/usage">
      <div className="grid gap-4">
        <Link href="/privacy" className="flex min-h-tap items-center rounded-md border border-border px-3 font-semibold">Privacy</Link>
        <Link href="/terms" className="flex min-h-tap items-center rounded-md border border-border px-3 font-semibold">Terms</Link>
        <button onClick={() => setOpen(true)} aria-haspopup="dialog" className="min-h-tap rounded-md border border-danger px-3 text-left font-semibold text-danger">Delete my account</button>
      </div>
      <BottomSheet open={open} onClose={close} title="Delete your account?">
        <form onSubmit={(e) => { e.preventDefault(); remove(); }} className="grid gap-3">
          <p className="text-text-muted">This permanently removes your account, projects, screens and usage records. It cannot be undone.</p>
          <label className="grid gap-1"><span className="font-semibold">Type DELETE to confirm</span>
            <input value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" className="min-h-tap w-full rounded-md border border-border-input bg-bg px-3 text-base" /></label>
          {err && <p role="alert" className="text-danger">{err}</p>}
          <button type="button" onClick={close} className="min-h-tap rounded-md border border-border font-semibold">Cancel</button>
          <button type="submit" disabled={text !== 'DELETE' || busy} aria-busy={busy} className="min-h-tap rounded-md bg-danger font-semibold text-bg disabled:opacity-50">{busy ? 'Deleting…' : 'Delete account'}</button>
        </form>
      </BottomSheet>
    </Shell>
  );
}
