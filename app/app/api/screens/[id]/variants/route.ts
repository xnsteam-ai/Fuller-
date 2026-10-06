import { NextResponse } from 'next/server';
import { authed, fail, loadScreen, nextVersion, parseMode, withQuota } from '@/lib/api';
import { getProvider } from '@/lib/ai/provider';
import { limited } from '@/lib/rate';
import { sanitizeScreen } from '@/lib/sanitize';

export const maxDuration = 60;

// Adds 3 variant versions; the current version does not change until the user picks one (PATCH currentVersion).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await authed(true); if ('res' in a) return a.res;
  const { ctx } = a;
  if (limited(`ai:${ctx.user.id}`, 20)) return fail('Too many requests. Wait a minute and try again.', 429);
  const { id } = await params;
  let body: any = {}; try { body = await req.json(); } catch { /* body optional */ }
  const mode = parseMode(body?.mode);
  const cur = await loadScreen(ctx, id); if (!cur) return fail('Not found', 404);

  const r = await withQuota(ctx, mode, () => getProvider().variants({ html: cur.html, device: cur.project.device, mode, designMd: cur.project.design_md || undefined }));
  if ('res' in r) return r.res;
  let v = await nextVersion(ctx, id);
  const added: number[] = [];
  for (const s of r.value) {
    const { error } = await ctx.admin.from('screen_versions').insert({ user_id: ctx.user.id, screen_id: id, version: v, html: sanitizeScreen(s.html), kind: 'variant' });
    if (error) break;
    added.push(v++);
  }
  if (!added.length) { await ctx.admin.rpc('refund_quota', { p_user: ctx.user.id, p_group: mode === 'standard' ? 'standard' : 'experimental' }); return fail('Could not save. Try again.', 409); }
  return NextResponse.json({ versions: added });
}
