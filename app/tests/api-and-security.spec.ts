import { test, expect } from './fixtures';
import { sanitizeScreen } from '../lib/sanitize';

const ips = new WeakMap<object, string>();
const ipFor = (page: object) => { if (!ips.has(page)) ips.set(page, `172.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`); return ips.get(page)!; };
const post = (page: any, data: unknown, raw = false) =>
  page.request.post('/api/generate', { data: raw ? (data as string) : data, headers: { 'content-type': 'application/json', 'x-forwarded-for': ipFor(page) } });

test('API-1 rejects bad input with 400 before touching any service', async ({ page }) => {
  expect((await post(page, 'not json', true)).status()).toBe(400);
  expect((await post(page, { prompt: '' })).status()).toBe(400);
  expect((await post(page, { prompt: 'x'.repeat(4001) })).status()).toBe(400);
  expect((await post(page, { prompt: 42 })).status()).toBe(400);
  expect((await post(page, null as any, true)).status()).toBe(400);
  expect((await post(page, { prompt: 'x', designMd: 'a'.repeat(20001) })).status()).toBe(400);
});

test('API-2 rate limit returns 429 after 10 requests a minute', async ({ page }) => {
  let last = 0;
  for (let i = 0; i < 12; i++) last = (await post(page, { prompt: 'x' })).status();
  expect(last).toBe(429);
});

test('API-3 valid request without credentials is a clear 503, not a fake result', async ({ page }) => {
  test.skip(!!process.env.SUPABASE_SERVICE_ROLE_KEY, 'only meaningful when unconfigured');
  const r = await post(page, { prompt: 'hello', idempotencyKey: 'k1' });
  expect(r.status()).toBe(503);
});

test('API-4 projects routes require auth or config', async ({ page }) => {
  const r = await page.request.get('/api/projects');
  expect([401, 501]).toContain(r.status());
});

const payloads = [
  '<script>window.pwn=1</script>', '<img src=x onerror=alert(1)>', '<a href="javascript:alert(1)">x</a>',
  '<iframe src="https://evil.example"></iframe>', '<svg onload=alert(1)>', '<form action="https://evil.example"><input name=pw></form>',
  '<style>@import url(https://evil.example/a.css);</style>', '<div style="background:url(https://evil.example/t.png)">x</div>',
  '<img src="https://evil.example/t.png">',
];
test('SEC-1 sanitiser strips scripts, handlers and external loads', () => {
  for (const p of payloads) expect(sanitizeScreen(p), p).not.toMatch(/<script|onerror|onload|javascript:|<iframe|evil\.example|url\(|@import|action=/i);
});

test('API-5 account deletion needs auth/config and cannot be triggered unauthenticated', async ({ page }) => {
  const r = await page.request.delete('/api/account', { data: { confirm: 'DELETE' }, headers: { 'x-forwarded-for': ipFor(page) } });
  expect([401, 503]).toContain(r.status());
});

test('OG image is served as a 1200x630 PNG', async ({ page }) => {
  const r = await page.request.get('/opengraph-image');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toContain('image/png');
  const b = await r.body();
  expect(b.readUInt32BE(16)).toBe(1200); expect(b.readUInt32BE(20)).toBe(630);
});
