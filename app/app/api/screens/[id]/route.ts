import { NextResponse } from 'next/server';
import { authed, fail, loadScreen, nextVersion, UUID } from '@/lib/api';
import { sanitizeScreen } from '@/lib/sanitize';

type P = { params: Promise<{ id: string }> };

// Version history for one screen.
export async function GET(_r: Request, { params }: P) {
  const a = await authed(); if ('res' in a) return a.res;
  const { id } = await params;
  const cur = await loadScreen(a.ctx, id); if (!cur) return fail('Not found', 404);
  const { data } = await a.ctx.sb.from('screen_versions').select('version,kind,html,created_at').eq('screen_id', id).order('version', { ascending: false });
  return NextResponse.json({ screen: { id, title: cur.screen.title, projectId: cur.screen.project_id, current: cur.screen.current_version, html: cur.html }, versions: data ?? [] });
}

// Direct edit ({ html }) saves a new version; { currentVersion } switches to an existing one (pick a variant, undo).
export async function PATCH(req: Request, { params }: P) {
  const a = await authed(); if ('res' in a) return a.res;
  const { id } = await params;
  const cur = await loadScreen(a.ctx, id); if (!cur) return fail('Not found', 404);
  let body: any; try { body = await req.json(); } catch { return fail('Invalid request', 400); }
  const { ctx } = a;

  if (typeof body?.html === 'string') {
    if (body.html.length > 400_000) return fail('Screen is too large.', 400);
    const version = await nextVersion(ctx, id);
    const { error } = await ctx.admin.from('screen_versions').insert({ user_id: ctx.user.id, screen_id: id, version, html: sanitizeScreen(body.html), kind: 'edited' });
    if (error) return fail('Could not save. Try again.', 409);
    await ctx.admin.from('screens').update({ current_version: version, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ version });
  }
  if (Number.isInteger(body?.currentVersion)) {
    const { data: v } = await ctx.sb.from('screen_versions').select('version').eq('screen_id', id).eq('version', body.currentVersion).maybeSingle();
    if (!v) return fail('Version not found', 404);
    await ctx.admin.from('screens').update({ current_version: v.version, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ version: v.version });
  }
  if (typeof body?.title === 'string' && body.title.trim() && UUID.test(id)) {
    await ctx.admin.from('screens').update({ title: body.title.trim().slice(0, 60) }).eq('id', id).eq('user_id', ctx.user.id);
    return NextResponse.json({ ok: true });
  }
  return fail('Invalid request', 400);
}
