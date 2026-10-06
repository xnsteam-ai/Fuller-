import { NextResponse } from 'next/server';
import { getProvider, aiConfigured } from '@/lib/ai/provider';
import { sanitizeScreen } from '@/lib/sanitize';
import { limited } from '@/lib/rate';
import { parseMode, groupOf, limitOf } from '@/lib/api';
import { supabaseConfigured } from '@/lib/supabase/config';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  if (limited(`gen:${ip}`)) return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > 4000) return NextResponse.json({ error: 'Describe your screen in 1 to 4000 characters.' }, { status: 400 });
  const device = body?.device === 'web' ? 'web' : 'mobile';
  const mode = parseMode(body?.mode);
  const group = groupOf(mode);
  const limit = limitOf(group);
  const designMd = typeof body?.designMd === 'string' ? body.designMd : '';
  if (designMd.length > 20000) return NextResponse.json({ error: 'DESIGN.md is too long (20000 max).' }, { status: 400 });
  let image: { mime: string; data: string } | undefined;
  if (body?.image) {
    const { mime, data } = body.image;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(mime) || typeof data !== 'string' || data.length > 4_000_000 || !/^[A-Za-z0-9+/=]+$/.test(data))
      return NextResponse.json({ error: 'Use a PNG, JPEG or WebP image under 3 MB.' }, { status: 400 });
    image = { mime, data };
  }

  if (!supabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY || !aiConfigured())
    return NextResponse.json({ error: 'The service is not configured yet.' }, { status: 503 });

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const key = typeof body?.idempotencyKey === 'string' && body.idempotencyKey.length <= 80 ? body.idempotencyKey : null;
  if (!key) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const admin = supabaseAdmin();

  // Retried tap: return the earlier result instead of charging again.
  const { data: prior } = await admin.from('generations').select('id,status,project_id').eq('user_id', user.id).eq('idempotency_key', key).maybeSingle();
  if (prior?.status === 'done') return NextResponse.json({ projectId: prior.project_id });
  if (prior) return NextResponse.json({ error: 'That request is already running.' }, { status: 409 });

  const { data: ok, error: qErr } = await admin.rpc('consume_quota', { p_user: user.id, p_group: group, p_limit: limit });
  if (qErr) return NextResponse.json({ error: 'Could not check your usage.' }, { status: 500 });
  if (!ok) return NextResponse.json({ error: 'You have used all generations for this month.' }, { status: 402 });

  let projectId: string | null = null;
  try {
    const { data: project, error: pErr } = await sb.from('projects').insert({ user_id: user.id, name: prompt.slice(0, 50), device, design_md: designMd }).select('id').single();
    if (pErr || !project) throw new Error('project insert failed');
    projectId = project.id;
    const { data: gen, error: gErr } = await admin.from('generations').insert({ user_id: user.id, project_id: projectId, idempotency_key: key, mode, prompt, status: 'running' }).select('id').single();
    if (gErr || !gen) throw new Error('generation insert failed');
    const raw = await getProvider().generate({ prompt, device, mode, image, designMd: designMd || undefined });
    for (let i = 0; i < raw.length; i++) {
      const { data: screen, error: sErr } = await admin.from('screens').insert({ user_id: user.id, project_id: projectId, position: i, title: raw[i].title.slice(0, 60) }).select('id').single();
      if (sErr || !screen) throw new Error('screen insert failed');
      const { error: vErr } = await admin.from('screen_versions').insert({ user_id: user.id, screen_id: screen.id, generation_id: gen.id, version: 1, html: sanitizeScreen(raw[i].html), kind: 'generated' });
      if (vErr) throw new Error('version insert failed');
    }
    await admin.from('generations').update({ status: 'done', finished_at: new Date().toISOString() }).eq('id', gen.id);
    return NextResponse.json({ projectId });
  } catch (e) {
    console.error('generate failed', e instanceof Error ? e.message : e);
    await admin.rpc('refund_quota', { p_user: user.id, p_group: group });
    await admin.from('generations').update({ status: 'failed', error: 'generation failed', finished_at: new Date().toISOString() }).eq('user_id', user.id).eq('idempotency_key', key);
    if (projectId) await admin.from('projects').delete().eq('id', projectId);
    return NextResponse.json({ error: 'Generation failed. Try again.' }, { status: 502 });
  }
}
