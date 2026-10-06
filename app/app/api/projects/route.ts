import { NextResponse } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/config';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  if (!supabaseConfigured) return NextResponse.json({ error: 'Backend not configured' }, { status: 501 });
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const { data, error } = await sb.from('projects').select('id,name,device,updated_at,screens(count)').order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load projects' }, { status: 500 });
  return NextResponse.json({ projects: data });
}
