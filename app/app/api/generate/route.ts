import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai/provider';
import { sanitizeScreen } from '@/lib/sanitize';

export const maxDuration = 60;

// In-memory limiter: slice only. Real metering is consume_quota() in replica/schema.sql once Supabase is wired.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 10;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  if (limited(ip)) return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > 4000) return NextResponse.json({ error: 'Describe your screen in 1 to 4000 characters.' }, { status: 400 });
  const device = body?.device === 'web' ? 'web' : 'mobile';
  const mode = ['ideate', 'flash', 'standard', 'thinking'].includes(body?.mode) ? body.mode : 'standard';
  try {
    const raw = await getProvider().generate({ prompt, device, mode });
    const screens = raw.map((s, i) => ({ id: `s${i + 1}`, title: s.title.slice(0, 60), html: sanitizeScreen(s.html) }));
    return NextResponse.json({ screens });
  } catch (e) {
    console.error('generate failed', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Generation failed. Try again.' }, { status: 502 });
  }
}
