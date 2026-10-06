import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

test('S02 renders, submit disabled when empty, counter blocks >4000', async ({ page }) => {
  await page.goto('/new');
  const gen = page.getByRole('button', { name: /^generat/i });
  await expect(gen).toBeDisabled();
  await page.getByLabel('Describe your app screen').fill('a'.repeat(4001));
  await expect(gen).toBeDisabled();
  await expect(page.getByText(/too long/)).toBeVisible();
});

test('S01 and S13 show an honest state with no backend', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('alert').or(page.getByText(/Sign in to see/)).or(page.getByText('Nothing here yet')).first()).toBeVisible();
  await page.goto('/sign-in');
  await expect(page.getByRole('button', { name: /google/i }).or(page.getByText(/unavailable/))).toBeVisible();
});

test('unknown project id shows not-found', async ({ page }) => {
  await page.goto('/p/does-not-exist');
  await expect(page.getByText(/not found/i)).toBeVisible();
});

test('axe: no WCAG A/AA violations on S01 S02 S13', async ({ page }) => {
  for (const [path, label] of [['/', 'S01'], ['/new', 'S02'], ['/sign-in', 'S13'], ['/welcome', 'welcome']]) {
    await page.goto(path); await page.waitForLoadState('networkidle');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations.map((v) => `${label}: ${v.id}`), label).toEqual([]);
  }
});

test('controls are at least 44px tall', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/new');
  for (const loc of [page.getByRole('button', { name: 'mobile' }), page.getByRole('button', { name: 'web' }), page.getByRole('link', { name: 'Projects' }), page.getByRole('link', { name: 'Create' })])
    expect((await loc.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('welcome: one h1, CTA leads to the create screen, no fake proof', async ({ page }) => {
  await page.goto('/welcome');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.getByRole('link', { name: 'Start designing' }).first().click();
  await expect(page).toHaveURL(/\/new$/);
  await page.goto('/welcome');
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/testimonial|trusted by|\d+ ?\+? (users|teams|designers)|\d(\.\d)?\s?(\/5|stars)/i);
  await page.getByText('What does it cost?').click();
  await expect(page.getByText(/Pricing will be announced/).first()).toBeVisible();
});
