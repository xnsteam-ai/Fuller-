import { test, expect, type Page } from '@playwright/test';

const widths = [320, 360, 390, 430];
const noHScroll = async (page: Page, label: string) => {
  // Disable the overflow-x backstop so the test sees real layout overflow.
  await page.addStyleTag({ content: 'html,body{overflow-x:visible !important}' });
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }));
  expect(m.sw, `${label}: documentElement scrollWidth ${m.sw} > clientWidth ${m.cw}`).toBeLessThanOrEqual(m.cw);
  expect(m.bw, `${label}: body scrollWidth ${m.bw} > clientWidth ${m.cw}`).toBeLessThanOrEqual(m.cw);
};

for (const w of widths) {
  test(`no horizontal scroll at ${w}px across the core flow`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('/');
    await noHScroll(page, 'S01 empty');
    await page.goto('/new');
    await noHScroll(page, 'S02');
    await page.getByLabel('Describe your app screen').fill('Averyveryverylongwordwithoutanyspacesthatkeepsgoingandgoingandgoing '.repeat(3));
    await noHScroll(page, 'S02 long text');
    await page.getByRole('button', { name: /generate/i }).click();
    await page.waitForURL(/\/p\//);
    await expect(page.locator('iframe').first()).toBeVisible();
    await noHScroll(page, 'S04');
    await page.goto('/');
    await expect(page.getByRole('link', { name: /screens/ }).first()).toBeVisible();
    await noHScroll(page, 'S01 filled');
    await page.goto('/sign-in');
    await noHScroll(page, 'S13');
  });
}

test('preview iframes are sandboxed with no scripts', async ({ page }) => {
  await page.goto('/new');
  await page.getByLabel('Describe your app screen').fill('<script>alert(1)</script> test app');
  await page.getByRole('button', { name: /generate/i }).click();
  await page.waitForURL(/\/p\//);
  const attrs = await page.locator('iframe').evaluateAll((els) => els.map((e) => e.getAttribute('sandbox')));
  expect(attrs.length).toBeGreaterThan(0);
  for (const a of attrs) expect(a).toBe('');
});
