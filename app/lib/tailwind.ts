import sanitizeHtml from 'sanitize-html';

// Converts inline style="" into Tailwind classes. Common properties become real utilities; every other declaration becomes an
// arbitrary property class ([prop:value]), so the result renders the same without a hand-written mapping for all of CSS.
// <style> blocks are left untouched. A declaration that cannot be written safely as a class stays in style="".

const SPACING = (px: number) => (Number.isInteger(px / 4) && px >= 0 && px <= 96 ? String(px / 4) : null);
const px = (v: string) => (/^-?\d+(\.\d+)?px$/.test(v) ? parseFloat(v) : /^0$/.test(v) ? 0 : null);
const arb = (prop: string, value: string) => `[${prop}:${value.replace(/\s+/g, '_')}]`;
const unsafe = (v: string) => /[\]"'\\\n<>]/.test(v.replace(/'([^']*)'/g, '')) || v.includes('[');

const KEYWORD: Record<string, Record<string, string>> = {
  display: { flex: 'flex', grid: 'grid', block: 'block', 'inline-block': 'inline-block', inline: 'inline', none: 'hidden', 'inline-flex': 'inline-flex' },
  'flex-direction': { column: 'flex-col', row: 'flex-row' },
  'justify-content': { center: 'justify-center', 'space-between': 'justify-between', 'flex-start': 'justify-start', 'flex-end': 'justify-end' },
  'align-items': { center: 'items-center', 'flex-start': 'items-start', 'flex-end': 'items-end', stretch: 'items-stretch' },
  'text-align': { center: 'text-center', left: 'text-left', right: 'text-right' },
  'font-weight': { '400': 'font-normal', '500': 'font-medium', '600': 'font-semibold', '700': 'font-bold', bold: 'font-bold', normal: 'font-normal' },
  'box-sizing': { 'border-box': 'box-border', 'content-box': 'box-content' },
  'overflow-wrap': { anywhere: '[overflow-wrap:anywhere]' },
};

function boxShorthand(kind: 'p' | 'm', value: string): string[] | null {
  const parts = value.trim().split(/\s+/).map(px);
  if (parts.some((x) => x === null) || parts.length > 2) return null;
  const sp = parts.map((x) => SPACING(x as number));
  if (sp.some((x) => x === null)) return null;
  if (sp.length === 1) return [`${kind}-${sp[0]}`];
  return [`${kind}y-${sp[0]}`, `${kind}x-${sp[1]}`];
}

export function declToClasses(prop: string, rawValue: string): string[] | null {
  const value = rawValue.trim().replace(/\s*!important$/i, '');
  if (!prop || !value || rawValue.includes('!important')) return null; // keep important as inline style
  const p = prop.trim().toLowerCase();
  if (!/^[a-z-]+$/.test(p) || unsafe(value)) return null;
  const kw = KEYWORD[p]?.[value.toLowerCase()]; if (kw) return [kw];
  if (p === 'padding' || p === 'margin') { const r = boxShorthand(p === 'padding' ? 'p' : 'm', value); if (r) return r; }
  if (p === 'width' && value === '100%') return ['w-full'];
  if (p === 'height' && value === '100%') return ['h-full'];
  if (p === 'min-height' && value === '100%') return ['min-h-full'];
  if (p === 'gap') { const n = px(value); const s = n === null ? null : SPACING(n); if (s) return [`gap-${s}`]; }
  return [arb(p, value)];
}

export function toTailwind(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: false, allowedAttributes: false, allowVulnerableTags: true,
    transformTags: {
      '*': (tag, attribs) => {
        const style = attribs.style; if (!style) return { tagName: tag, attribs };
        const classes: string[] = []; const keep: string[] = [];
        for (const decl of style.split(';')) {
          if (!decl.trim()) continue;
          const i = decl.indexOf(':'); if (i < 0) { keep.push(decl.trim()); continue; }
          const out = declToClasses(decl.slice(0, i), decl.slice(i + 1));
          if (out) classes.push(...out); else keep.push(decl.trim());
        }
        const next: Record<string, string> = { ...attribs };
        const cls = [attribs.class, ...classes].filter(Boolean).join(' ');
        if (cls) next.class = cls;
        if (keep.length) next.style = keep.join(';'); else delete next.style;
        return { tagName: tag, attribs: next };
      },
    },
  });
}
