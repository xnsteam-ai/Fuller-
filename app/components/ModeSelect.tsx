'use client';
import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { MODE_INFO, type Mode } from '@/lib/types';

export function ModeSelect({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="min-h-tap rounded-md border border-border px-3 text-sm font-semibold">
        Mode: {MODE_INFO[value].label}
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Choose a mode">
        <div role="radiogroup" aria-label="Mode" className="grid gap-2">
          {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={value === m} onClick={() => { onChange(m); setOpen(false); }}
              className={`min-h-[56px] rounded-md border p-3 text-left ${value === m ? 'border-accent bg-surface' : 'border-border'}`}>
              <span className="block font-semibold">{MODE_INFO[m].label}</span>
              <span className="block text-sm text-text-muted">{MODE_INFO[m].blurb} · {MODE_INFO[m].group === 'standard' ? 'standard allowance' : 'experimental allowance'}</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
