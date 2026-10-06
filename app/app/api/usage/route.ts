import { NextResponse } from 'next/server';
import { authed, limitOf } from '@/lib/api';

export async function GET() {
  const a = await authed(); if ('res' in a) return a.res;
  const month = new Date().toISOString().slice(0, 7) + '-01';
  const { data } = await a.ctx.sb.from('usage_counters').select('mode_group,used').eq('month', month);
  const used = (g: string) => data?.find((r) => r.mode_group === g)?.used ?? 0;
  return NextResponse.json({ month, standard: { used: used('standard'), limit: limitOf('standard') }, experimental: { used: used('experimental'), limit: limitOf('experimental') } });
}
