'use client';
import { useEffect, useRef, useState } from 'react';

type SR = { start(): void; stop(): void; lang: string; interimResults: boolean; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null };

// Browser speech-to-text (no audio leaves the page except via the browser's own speech service). Hidden when unsupported.
export function MicButton({ onText }: { onText: (t: string) => void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'denied'>('idle');
  const rec = useRef<SR | null>(null);
  const [Ctor, setCtor] = useState<any>(null); // detected after mount so server and first client render match
  useEffect(() => {
    const c = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
    setCtor(() => c); // wrapped: a bare constructor would be called as a state updater
  }, []);
  if (!Ctor) return null;

  function toggle() {
    if (state === 'listening') { rec.current?.stop(); return; }
    const r: SR = new Ctor();
    r.lang = document.documentElement.lang || 'en-US'; r.interimResults = false;
    r.onresult = (e) => onText(Array.from(e.results as ArrayLike<any>).map((x) => x[0].transcript).join(' '));
    r.onerror = (e) => setState(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : 'idle');
    r.onend = () => setState((s) => (s === 'denied' ? s : 'idle'));
    rec.current = r; setState('listening'); r.start();
  }
  return (
    <div>
      <button type="button" onClick={toggle} aria-pressed={state === 'listening'} aria-label={state === 'listening' ? 'Stop dictation' : 'Dictate'}
        className={`min-h-tap min-w-tap rounded-md border border-border font-semibold ${state === 'listening' ? 'bg-accent text-on-accent' : ''}`}>🎤</button>
      {state === 'denied' && <p role="alert" className="mt-1 text-sm text-danger">Microphone access is blocked. Allow it in your browser settings to dictate.</p>}
    </div>
  );
}
