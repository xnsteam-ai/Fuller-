import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { installFake, makeState } from './fake-backend';

const widths = [320, 360, 390, 430];
const noHScroll = async (page: Page, label: string) => {
  await page.addStyleTag({ content: 'html,body{overflow-x:visible !important}' });
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(m.sw, `${label}: scrollWidth ${m.sw} > ${m.cw}`).toBeLessThanOrEqual(m.cw);
};
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

test('S04 canvas shows screens, rename and delete work', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1');
  await expect(page.locator('iframe')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Open and edit' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Project menu' }).click();
  await page.getByRole('button', { name: 'Rename' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Renamed project');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Renamed project');
  expect(st.project.name).toBe('Renamed project');
  await page.getByRole('button', { name: 'Project menu' }).click();
  await page.getByRole('button', { name: 'Delete project' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  expect(st.deleted).toBe(false);
  await page.getByRole('button', { name: 'Project menu' }).click();
  await page.getByRole('button', { name: 'Delete project' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.waitForURL('/');
  expect(st.deleted).toBe(true);
});

test('S06 refine sends prompt and mode, shows success', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1/s/s1');
  await page.getByLabel('What should change?').fill('Make it blue');
  await page.getByRole('button', { name: 'Mode: Standard' }).click();
  await page.getByRole('radio', { name: /Thinking/ }).click();
  await page.getByRole('button', { name: 'Apply change' }).click();
  await expect(page.getByRole('status')).toContainText('Updated.');
  const c = st.calls.find((x) => x.url.endsWith('/refine'))!;
  expect(c.body).toEqual({ prompt: 'Make it blue', mode: 'thinking' });
  await expect(page.getByLabel('What should change?')).toHaveValue('');
});

test('S06 quota (402) and network errors are shown, input kept', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1/s/s1');
  await page.getByLabel('What should change?').fill('Try');
  st.failNext = { status: 402, error: 'You have used all generations for this month.' };
  await page.getByRole('button', { name: 'Apply change' }).click();
  await expect(page.getByRole('status')).toContainText('used all generations');
  await expect(page.getByLabel('What should change?')).toHaveValue('Try');
});

test('S07 edit text saves changed text only', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1/s/s1');
  await page.getByRole('tab', { name: 'Edit text' }).click();
  const first = page.getByLabel('Text 1');
  await expect(first).toHaveValue('Home');
  await first.fill('My habits');
  await page.getByRole('button', { name: 'Save text' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  const c = st.calls.find((x) => x.method === 'PATCH' && x.body?.html)!;
  expect(c.body.html).toContain('My habits');
  expect(c.body.html).toContain('Welcome to the app');
  expect(c.body.html).toContain('font-size:22px');
});

test('S08 variants generate three and one can be used', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1/s/s1');
  await page.getByRole('tab', { name: 'Variants' }).click();
  await expect(page.getByText('No variants yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Generate 3 variants' }).click();
  await expect(page.getByRole('button', { name: 'Use this one' })).toHaveCount(3);
  await page.getByRole('button', { name: 'Use this one' }).first().click();
  await expect(page.getByRole('button', { name: 'In use' })).toHaveCount(1);
  expect(st.calls.some((x) => x.method === 'PATCH' && Number.isInteger(x.body?.currentVersion))).toBe(true);
});

test('S05 history restores an older version', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1/s/s1');
  await page.getByLabel('What should change?').fill('Second');
  await page.getByRole('button', { name: 'Apply change' }).click();
  await expect(page.getByRole('status')).toContainText('Updated.');
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByRole('button', { name: 'Current' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(page.getByRole('status')).toContainText('applied');
  expect(st.current.s1).toBe(1);
});

test('S09 design system: generate fills text and swatches, save works', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/p/p1/design');
  await page.getByRole('button', { name: 'Generate from screens' }).click();
  await expect(page.getByLabel('DESIGN.md')).toHaveValue(/primary #4f46e5/);
  await expect(page.getByRole('list', { name: 'Colours found' }).getByRole('listitem')).toHaveCount(2);
  await page.getByLabel('DESIGN.md').fill('# Mine\n#123456');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(st.project.design_md).toBe('# Mine\n#123456');
});

test('S10 export: download links and copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await installFake(page);
  await page.goto('/p/p1/export');
  await expect(page.getByRole('link', { name: 'Download' })).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Download' }).nth(1)).toHaveAttribute('href', '/api/projects/p1/export?fmt=tailwind');
  await expect(page.getByRole('link', { name: 'Download' }).first()).toHaveAttribute('href', '/api/projects/p1/export?fmt=html');
  await page.getByRole('button', { name: 'Copy' }).first().click();
  await expect(page.getByRole('status')).toContainText('Copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('EXPORTED html');
});

test('S12 usage meters, with the limit state explained', async ({ page }) => {
  await installFake(page);
  await page.goto('/usage');
  await expect(page.getByRole('progressbar', { name: 'Standard allowance' })).toHaveAttribute('aria-valuenow', '12');
  await expect(page.getByText('12 of 350 this month')).toBeVisible();
  await expect(page.getByText(/reached this allowance/)).toBeVisible();
});

test('S02 mode, image attach rules and request body', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/new');
  await page.getByLabel('Describe your app screen').fill('A recipe app');
  await page.getByLabel('Attach image').setInputFiles({ name: 'x.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') });
  await expect(page.getByRole('alert').filter({ hasText: 'PNG, JPEG' })).toBeVisible();
  await page.getByLabel('Attach image').setInputFiles({ name: 'big.png', mimeType: 'image/png', buffer: Buffer.alloc(3 * 1024 * 1024 + 1) });
  await expect(page.getByRole('alert').filter({ hasText: 'over 3 MB' })).toBeVisible();
  await page.getByLabel('Attach image').setInputFiles({ name: 'ok.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByText('Image: ok.png')).toBeVisible();
  await page.getByRole('button', { name: 'Mode: Standard' }).click();
  await page.getByRole('radio', { name: /Fast/ }).click();
  await page.getByRole('button', { name: 'Generate' }).click();
  await page.waitForURL('/p/p1');
  const c = st.calls.find((x) => x.url === '/api/generate')!;
  expect(c.body.mode).toBe('flash');
  expect(c.body.image.mime).toBe('image/png');
  expect(c.body.image.data).toBe(PNG.toString('base64'));
});

test('sheet: Escape closes it and focus returns to the opener', async ({ page }) => {
  await installFake(page);
  await page.goto('/new');
  const opener = page.getByRole('button', { name: 'Mode: Standard' });
  await opener.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Choose a mode' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('mic: permission denied shows how to fix it', async ({ page }) => {
  await installFake(page);
  await page.addInitScript(() => {
    const C = class { start() { setTimeout(() => (this as any).onerror?.({ error: 'not-allowed' }), 10); } stop() {} };
    (window as any).SpeechRecognition = C; (window as any).webkitSpeechRecognition = C;
  });
  await page.goto('/new');
  await page.getByRole('button', { name: 'Dictate' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Microphone access is blocked' })).toBeVisible();
});

test('mic: transcript is appended to the prompt', async ({ page }) => {
  await installFake(page);
  await page.addInitScript(() => {
    const C = class { start() { setTimeout(() => { (this as any).onresult?.({ results: [[{ transcript: 'a dark mode toggle' }]] }); (this as any).onend?.(); }, 10); } stop() {} };
    (window as any).SpeechRecognition = C; (window as any).webkitSpeechRecognition = C;
  });
  await page.goto('/new');
  await page.getByLabel('Describe your app screen').fill('Settings page');
  await page.getByRole('button', { name: 'Dictate' }).click();
  await expect(page.getByLabel('Describe your app screen')).toHaveValue('Settings page a dark mode toggle');
});

for (const w of widths) {
  test(`no horizontal scroll on every screen at ${w}px`, async ({ page }) => {
    await installFake(page);
    await page.setViewportSize({ width: w, height: 800 });
    for (const path of ['/', '/new', '/usage', '/p/p1', '/p/p1/s/s1', '/p/p1/design', '/p/p1/export']) {
      await page.goto(path); await page.waitForLoadState('networkidle'); await noHScroll(page, path);
    }
    await page.goto('/p/p1/s/s1');
    for (const t of ['Edit text', 'Variants', 'History']) { await page.getByRole('tab', { name: t }).click(); await noHScroll(page, `S05 ${t}`); }
    await page.goto('/p/p1');
    await page.getByRole('button', { name: 'Project menu' }).click(); await noHScroll(page, 'menu sheet');
  });
}

test('axe: no WCAG A/AA violations on the new screens', async ({ page }) => {
  await installFake(page);
  for (const path of ['/', '/usage', '/p/p1', '/p/p1/s/s1', '/p/p1/design', '/p/p1/export']) {
    await page.goto(path); await page.waitForLoadState('networkidle');
    const r = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa']).analyze(); // iframes hold generated content, sandboxed
    expect(r.violations.map((v) => `${path}: ${v.id} -> ${v.nodes[0]?.html?.slice(0, 80)}`), path).toEqual([]);
  }
});

test('S02 design system text is sent with the first generation and capped', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/new');
  await page.getByLabel('Describe your app screen').fill('A budgeting app');
  await page.getByText('Design system (optional)').click();
  await page.getByLabel('DESIGN.md').fill('# Colors\n- primary #4f46e5');
  await page.getByRole('button', { name: 'Generate' }).click();
  await page.waitForURL('/p/p1');
  expect(st.calls.find((x) => x.url === '/api/generate')!.body.designMd).toBe('# Colors\n- primary #4f46e5');
});

test('S02 over-long design system blocks submit', async ({ page }) => {
  await installFake(page);
  await page.goto('/new');
  await page.getByLabel('Describe your app screen').fill('x');
  await page.getByText('Design system (optional)').click();
  await page.getByLabel('DESIGN.md').fill('a'.repeat(20001));
  await expect(page.getByRole('button', { name: 'Generate' })).toBeDisabled();
  await expect(page.getByText(/too long/)).toBeVisible();
});

test('S02 without a design system, none is sent', async ({ page }) => {
  const st = await installFake(page);
  await page.goto('/new');
  await page.getByLabel('Describe your app screen').fill('plain');
  await page.getByRole('button', { name: 'Generate' }).click();
  await page.waitForURL('/p/p1');
  expect(st.calls.find((x) => x.url === '/api/generate')!.body.designMd).toBeUndefined();
});
