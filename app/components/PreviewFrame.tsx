'use client';
import { useEffect, useRef, useState } from 'react';

const BASE = 390; // design width of generated mobile screens

export function PreviewFrame({ html, title, height = 720 }: { html: string; title: string; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / BASE)));
    ro.observe(el); setScale(Math.min(1, el.clientWidth / BASE));
    return () => ro.disconnect();
  }, []);
  const doc = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=${BASE}"><body style="margin:0;min-height:${height}px">${html}</body>`;
  return (
    <div ref={box} className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-bg" style={{ height: height * scale }}>
      <iframe title={`Preview: ${title}`} sandbox="" srcDoc={doc} loading="lazy"
        style={{ width: BASE, height, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }} />
    </div>
  );
}
