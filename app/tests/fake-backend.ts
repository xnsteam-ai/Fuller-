import type { Page, Route } from '@playwright/test';

// Network-level test double for the UI wiring ONLY. It does not test the real routes, auth, RLS or Gemini.
export type Fake = ReturnType<typeof makeState>;
const html = (t: string) => `<div style="padding:16px;font-family:sans-serif"><h1 style="font-size:22px">${t}</h1><p>Welcome to the app</p><button style="min-height:48px;width:100%">Continue</button></div>`;

export function makeState() {
  return {
    project: { id: 'p1', name: 'Habit tracker', device: 'mobile', design_md: '', updated_at: new Date().toISOString() },
    screens: [{ id: 's1', title: 'Home' }, { id: 's2', title: 'Settings' }],
    versions: { s1: [{ version: 1, kind: 'generated', html: html('Home') }], s2: [{ version: 1, kind: 'generated', html: html('Settings') }] } as Record<string, { version: number; kind: string; html: string }[]>,
    current: { s1: 1, s2: 1 } as Record<string, number>,
    usage: { standard: { used: 12, limit: 350 }, experimental: { used: 50, limit: 50 } },
    calls: [] as { method: string; url: string; body: any }[],
    failNext: null as null | { status: number; error: string },
    deleted: false,
  };
}

export async function installFake(page: Page, st = makeState()) {
  await page.route('**/api/**', async (route: Route) => {
    const req = route.request(); const url = new URL(req.url()); const path = url.pathname; const m = req.method();
    let body: any = null; try { body = req.postDataJSON(); } catch { /* none */ }
    st.calls.push({ method: m, url: path + url.search, body });
    const json = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (st.failNext && m !== 'GET') { const f = st.failNext; st.failNext = null; return json({ error: f.error }, f.status); }
    const cur = (sid: string) => st.versions[sid].find((v) => v.version === st.current[sid])!;
    let r: RegExpMatchArray | null;
    if (path === '/api/generate') return json({ projectId: 'p1' });
    if (path === '/api/usage') return json({ month: '2026-10-01', ...st.usage });
    if (path === '/api/projects') return json({ projects: st.deleted ? [] : [{ id: 'p1', name: st.project.name, device: 'mobile', updated_at: st.project.updated_at, screens: [{ count: 2 }] }] });
    if ((r = path.match(/^\/api\/projects\/p1\/design$/))) { st.project.design_md = '# Design\n## Colors\n- primary #4f46e5\n- surface #f4f5f8'; return json({ design_md: st.project.design_md }); }
    if ((r = path.match(/^\/api\/projects\/p1\/export$/))) return route.fulfill({ status: 200, contentType: 'text/plain', body: 'EXPORTED ' + url.searchParams.get('fmt') });
    if ((r = path.match(/^\/api\/projects\/p1$/))) {
      if (m === 'GET') return json({ project: { ...st.project, screens: st.screens.map((s) => ({ id: s.id, title: s.title, html: cur(s.id).html })) } });
      if (m === 'PATCH') { if (body?.name) st.project.name = body.name; if (typeof body?.design_md === 'string') st.project.design_md = body.design_md; return json({ ok: true }); }
      if (m === 'DELETE') { st.deleted = true; return json({ ok: true }); }
    }
    if ((r = path.match(/^\/api\/screens\/(s\d)\/refine$/))) { const v = st.versions[r[1]]; const n = v.length + 1; v.push({ version: n, kind: 'refined', html: html('Refined ' + body.prompt) }); st.current[r[1]] = n; return json({ version: n }); }
    if ((r = path.match(/^\/api\/screens\/(s\d)\/variants$/))) { const v = st.versions[r[1]]; const out = []; for (let i = 0; i < 3; i++) { const n = v.length + 1; v.push({ version: n, kind: 'variant', html: html('Variant ' + n) }); out.push(n); } return json({ versions: out }); }
    if ((r = path.match(/^\/api\/screens\/(s\d)$/))) {
      const sid = r[1];
      if (m === 'GET') return json({ screen: { id: sid, title: st.screens.find((s) => s.id === sid)!.title, projectId: 'p1', current: st.current[sid], html: cur(sid).html }, versions: [...st.versions[sid]].reverse().map((v) => ({ ...v, created_at: new Date().toISOString() })) });
      if (m === 'PATCH') {
        if (typeof body?.html === 'string') { const n = st.versions[sid].length + 1; st.versions[sid].push({ version: n, kind: 'edited', html: body.html }); st.current[sid] = n; return json({ version: n }); }
        if (Number.isInteger(body?.currentVersion)) { st.current[sid] = body.currentVersion; return json({ version: body.currentVersion }); }
      }
    }
    return json({ error: 'unhandled in fake: ' + m + ' ' + path }, 404);
  });
  return st;
}
