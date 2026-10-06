import { NextResponse } from 'next/server';
import { authed, fail, parseMode, UUID, withQuota } from '@/lib/api';
import { getProvider } from '@/lib/ai/provider';
import { limited } from '@/lib/rate';

export const maxDuration = 60;

// Derive DESIGN.md from the project's current screens and save it.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await authed(true); if ('res' in a) return a.res;
  const { ctx } = a;
  if (limited(`ai:${ctx.user.id}`, 20)) return fail('Too many requests. Wait a minute and try again.', 429);
  const { id } = await params;
  if (!UUID.test(id)) return fail('Not found', 404);
  let body: any = {}; try { body = await req.json(); } catch { /* optional */ }
  const mode = parseMode(body?.mode);
  const { data: project } = await ctx.sb.from('projects').select('id').eq('id', id).maybeSingle();
  if (!project) return fail('Not found', 404);
  const { data: screens } = await ctx.sb.from('screens').select('id,title,current_version').eq('project_id', id).order('position');
  const raw: { title: string; html: string }[] = [];
  for (const s of screens ?? []) {
    const { data: v } = await ctx.sb.from('screen_versions').select('html').eq('screen_id', s.id).eq('version', s.current_version).maybeSingle();
    if (v) raw.push({ title: s.title, html: v.html as string });
  }
  if (!raw.length) return fail('This project has no screens yet.', 400);
  const r = await withQuota(ctx, mode, () => getProvider().designMd({ screens: raw, mode }));
  if ('res' in r) return r.res;
  await ctx.sb.from('projects').update({ design_md: r.value, updated_at: new Date().toISOString() }).eq('id', id);
  return NextResponse.json({ design_md: r.value });
}
