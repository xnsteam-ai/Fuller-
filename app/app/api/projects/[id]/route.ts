import { NextResponse } from 'next/server';
import { authed, fail, UUID } from '@/lib/api';

type P = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: P) {
  const a = await authed(); if ('res' in a) return a.res;
  const { id } = await params;
  if (!UUID.test(id)) return fail('Not found', 404);
  const { sb } = a.ctx;
  const { data: project } = await sb.from('projects').select('id,name,device,design_md,updated_at').eq('id', id).maybeSingle(); // RLS: owner only
  if (!project) return fail('Not found', 404);
  const { data: screens } = await sb.from('screens').select('id,title,position,current_version').eq('project_id', id).order('position');
  const out = [];
  for (const s of screens ?? []) {
    const { data: v } = await sb.from('screen_versions').select('html').eq('screen_id', s.id).eq('version', s.current_version).maybeSingle();
    out.push({ id: s.id, title: s.title, html: v?.html ?? '' });
  }
  return NextResponse.json({ project: { ...project, screens: out } });
}

// Rename and/or save DESIGN.md.
export async function PATCH(req: Request, { params }: P) {
  const a = await authed(); if ('res' in a) return a.res;
  const { id } = await params;
  if (!UUID.test(id)) return fail('Not found', 404);
  let body: any; try { body = await req.json(); } catch { return fail('Invalid request', 400); }
  const patch: Record<string, unknown> = {};
  if (typeof body?.name === 'string' && body.name.trim()) patch.name = body.name.trim().slice(0, 80);
  if (typeof body?.design_md === 'string') { if (body.design_md.length > 20000) return fail('DESIGN.md is too long (20000 max).', 400); patch.design_md = body.design_md; }
  if (!Object.keys(patch).length) return fail('Nothing to update', 400);
  const { data, error } = await a.ctx.sb.from('projects').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select('id');
  if (error) return fail('Could not save.', 500);
  if (!data?.length) return fail('Not found', 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: P) {
  const a = await authed(); if ('res' in a) return a.res;
  const { id } = await params;
  if (!UUID.test(id)) return fail('Not found', 404);
  const { data, error } = await a.ctx.sb.from('projects').delete().eq('id', id).select('id'); // cascades to screens and versions
  if (error) return fail('Could not delete.', 500);
  if (!data?.length) return fail('Not found', 404);
  return NextResponse.json({ ok: true });
}
