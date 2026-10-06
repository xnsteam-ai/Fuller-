import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const noHScroll = async (page: Page, label: string) => {
  await page.addStyleTag({ content: 'html,body{overflow-x:visible !important}' }); // test real layout, not the backstop
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }));
  expect(m.sw, `${label}: scrollWidth ${m.sw} > ${m.cw}`).toBeLessThanOrEqual(m.cw);
  expect(m.bw, `${label}: body ${m.bw} > ${m.cw}`).toBeLessThanOrEqual(m.cw);
};

for (const w of [320, 360, 390, 430]) {
  test(`no horizontal scroll at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    for (const path of ['/', '/new', '/sign-in', '/p/x']) { await page.goto(path); await page.waitForLoadState('networkidle'); await noHScroll(page, path); }
    await page.goto('/new');
    await page.getByLabel('Describe your app screen').fill('Averyveryverylongwordwithoutanyspacesthatkeepsgoingandgoing '.repeat(3));
    await noHScroll(page, '/new long text');
  });
}
