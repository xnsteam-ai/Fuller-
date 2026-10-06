import { test as base, expect } from '@playwright/test';

// 501/503 are the intentional "backend not configured" answers and are allowed.
// Every test: unique client IP (own rate-limit bucket), fails on console errors and 5xx responses.
export const test = base.extend({
  page: async ({ page }, use) => {
    const ip = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip });
    const problems: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/status of (501|503)/.test(m.text())) problems.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('response', (r) => { if (r.status() === 404) problems.push(`404: ${r.url()}`); if (r.status() >= 500 && ![501, 503].includes(r.status())) problems.push(`5xx: ${r.status()} ${r.url()}`); });
    await use(page);
    expect(problems, problems.join('\n')).toEqual([]);
  },
});
export { expect };
export const PROMPT = 'Describe your app screen';
