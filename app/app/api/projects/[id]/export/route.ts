import { authed, fail, UUID } from '@/lib/api';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'design';

// fmt=html -> one HTML file with every screen; fmt=designmd -> DESIGN.md. Content is already sanitised at write time.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await authed(); if ('res' in a) return a.res;
  const { id } = await params;
  if (!UUID.test(id)) return fail('Not found', 404);
  const fmt = new URL(req.url).searchParams.get('fmt');
  const { sb } = a.ctx;
  const { data: project } = await sb.from('projects').select('name,design_md').eq('id', id).maybeSingle();
  if (!project) return fail('Not found', 404);

  if (fmt === 'designmd') {
    if (!project.design_md) return fail('No DESIGN.md yet. Generate it first.', 404);
    return new Response(project.design_md, { headers: { 'content-type': 'text/markdown; charset=utf-8', 'content-disposition': `attachment; filename="${slug(project.name)}-DESIGN.md"`, 'x-content-type-options': 'nosniff' } });
  }
  if (fmt !== 'html') return fail('Unknown format', 400);

  const { data: screens } = await sb.from('screens').select('id,title,current_version').eq('project_id', id).order('position');
  let body = '';
  for (const s of screens ?? []) {
    const { data: v } = await sb.from('screen_versions').select('html').eq('screen_id', s.id).eq('version', s.current_version).maybeSingle();
    body += `<section class="screen"><h2>${esc(s.title)}</h2><div class="frame">${v?.html ?? ''}</div></section>\n`;
  }
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(project.name)}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#f4f5f8}.screen{max-width:430px;margin:0 auto 24px;padding:0 0 8px}h2{font-size:14px;margin:12px 16px;color:#565f6c}.frame{background:#fff;overflow:hidden}img,svg{max-width:100%}</style></head><body>
${body}</body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-disposition': `attachment; filename="${slug(project.name)}.html"`, 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:" } });
}
