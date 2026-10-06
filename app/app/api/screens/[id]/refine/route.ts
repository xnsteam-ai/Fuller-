import { NextResponse } from 'next/server';
import { authed, fail, loadScreen, nextVersion, parseMode, withQuota } from '@/lib/api';
import { getProvider } from '@/lib/ai/provider';
import { limited } from '@/lib/rate';
import { sanitizeScreen } from '@/lib/sanitize';

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await authed(true); if ('res' in a) return a.res;
  const { ctx } = a;
  if (limited(`ai:${ctx.user.id}`, 20)) return fail('Too many requests. Wait a minute and try again.', 429);
  const { id } = await params;
  let body: any; try { body = await req.json(); } catch { return fail('Invalid request', 400); }
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > 2000) return fail('Describe the change in 1 to 2000 characters.', 400);
  const mode = parseMode(body?.mode);
  const cur = await loadScreen(ctx, id); if (!cur) return fail('Not found', 404);

  const r = await withQuota(ctx, mode, () => getProvider().refine({ prompt, html: cur.html, device: cur.project.device, mode, designMd: cur.project.design_md || undefined }));
  if ('res' in r) return r.res;
  const version = await nextVersion(ctx, id);
  const { error } = await ctx.admin.from('screen_versions').insert({ user_id: ctx.user.id, screen_id: id, version, html: sanitizeScreen(r.value.html), kind: 'refined' });
  if (error) { await ctx.admin.rpc('refund_quota', { p_user: ctx.user.id, p_group: mode === 'standard' ? 'standard' : 'experimental' }); return fail('Could not save. Try again.', 409); }
  await ctx.admin.from('screens').update({ current_version: version, updated_at: new Date().toISOString() }).eq('id', id);
  return NextResponse.json({ version });
}
