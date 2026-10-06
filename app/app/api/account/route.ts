import { NextResponse } from 'next/server';
import { authed, fail } from '@/lib/api';
import { limited } from '@/lib/rate';

// Permanently deletes the signed-in user. Auth user -> profiles -> projects -> screens -> versions, generations and usage all cascade (see migration).
export async function DELETE(req: Request) {
  const a = await authed(); if ('res' in a) return a.res;
  const { ctx } = a;
  if (limited(`acct:${ctx.user.id}`, 3)) return fail('Too many requests. Try again later.', 429);
  let body: any = {}; try { body = await req.json(); } catch { /* confirm check below fails */ }
  if (body?.confirm !== 'DELETE') return fail('Type DELETE to confirm.', 400);
  const { error } = await ctx.admin.auth.admin.deleteUser(ctx.user.id);
  if (error) { console.error('delete user failed', error.message); return fail('Could not delete the account. Try again.', 500); }
  await ctx.sb.auth.signOut().catch(() => {}); // clear the session cookies
  return NextResponse.json({ ok: true });
}
