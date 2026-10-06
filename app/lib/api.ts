import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { aiConfigured } from './ai/provider';
import { supabaseConfigured } from './supabase/config';
import { supabaseAdmin, supabaseServer } from './supabase/server';
import type { Mode } from './types';

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status });
export const MODES: Mode[] = ['ideate', 'flash', 'standard', 'thinking'];
export const parseMode = (m: unknown): Mode => (MODES.includes(m as Mode) ? (m as Mode) : 'standard');
export const groupOf = (mode: Mode) => (mode === 'standard' ? 'standard' : 'experimental');
export const limitOf = (group: string) => Number(group === 'standard' ? process.env.QUOTA_STANDARD ?? 350 : process.env.QUOTA_EXPERIMENTAL ?? 50);

export type Ctx = { sb: SupabaseClient; admin: SupabaseClient; user: { id: string } };

// Returns the signed-in context, or a ready error response.
export async function authed(needAi = false): Promise<{ ctx: Ctx } | { res: NextResponse }> {
  if (!supabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY || (needAi && !aiConfigured()))
    return { res: fail('The service is not configured yet.', 503) };
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { res: fail('Sign in required', 401) };
  return { ctx: { sb, admin: supabaseAdmin(), user } };
}

// Consume one unit, run fn, refund if it throws.
export async function withQuota<T>(ctx: Ctx, mode: Mode, fn: () => Promise<T>): Promise<{ value: T } | { res: NextResponse }> {
  const group = groupOf(mode);
  const { data: ok, error } = await ctx.admin.rpc('consume_quota', { p_user: ctx.user.id, p_group: group, p_limit: limitOf(group) });
  if (error) return { res: fail('Could not check your usage.', 500) };
  if (!ok) return { res: fail('You have used all generations for this month.', 402) };
  try {
    return { value: await fn() };
  } catch (e) {
    console.error('ai call failed', e instanceof Error ? e.message : e);
    await ctx.admin.rpc('refund_quota', { p_user: ctx.user.id, p_group: group });
    return { res: fail('The AI request failed. Try again.', 502) };
  }
}

// Screen + project owned by the caller (RLS filters), with current HTML and design notes.
export async function loadScreen(ctx: Ctx, id: string) {
  if (!UUID.test(id)) return null;
  const { data: screen } = await ctx.sb.from('screens').select('id,project_id,title,position,current_version').eq('id', id).maybeSingle();
  if (!screen) return null;
  const { data: project } = await ctx.sb.from('projects').select('id,device,design_md').eq('id', screen.project_id).maybeSingle();
  const { data: v } = await ctx.sb.from('screen_versions').select('html').eq('screen_id', id).eq('version', screen.current_version).maybeSingle();
  if (!project || !v) return null;
  return { screen, project, html: v.html as string };
}

export async function nextVersion(ctx: Ctx, screenId: string): Promise<number> {
  const { data } = await ctx.sb.from('screen_versions').select('version').eq('screen_id', screenId).order('version', { ascending: false }).limit(1);
  return (data?.[0]?.version ?? 0) + 1;
}
