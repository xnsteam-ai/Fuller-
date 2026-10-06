import { NextResponse } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/config';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseConfigured) return NextResponse.json({ error: 'Backend not configured' }, { status: 501 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const { data: project } = await sb.from('projects').select('id,name,device,updated_at').eq('id', id).maybeSingle(); // RLS: owner only
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: screens } = await sb.from('screens').select('id,title,position,current_version').eq('project_id', id).order('position');
  const out = [];
  for (const s of screens ?? []) {
    const { data: v } = await sb.from('screen_versions').select('html').eq('screen_id', s.id).eq('version', s.current_version).maybeSingle();
    out.push({ id: s.id, title: s.title, html: v?.html ?? '' });
  }
  return NextResponse.json({ project: { ...project, screens: out } });
}
