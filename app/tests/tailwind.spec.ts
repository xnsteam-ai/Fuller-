import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { test, expect } from './fixtures';
import { declToClasses, toTailwind } from '../lib/tailwind';

const SAMPLE = `
<div style="font-family:system-ui,sans-serif;background:#f4f5f8;min-height:100%;width:100%;padding:20px 16px;box-sizing:border-box">
  <h1 style="font-size:24px;margin:0 0 4px;overflow-wrap:anywhere">Welcome</h1>
  <p style="color:#565f6c;margin:0 0 16px">Subtitle text</p>
  <div style="display:flex;flex-direction:column;justify-content:space-between;align-items:center;gap:12px;padding:13px;border:1px solid #e3e6ea;border-radius:14px;background:rgba(255,255,255,.9)">
    <strong style="display:block;font-weight:600;text-align:center">Card</strong>
    <span style="color:#565f6c;font-size:14px;line-height:1.4;font-family:'Inter',sans-serif">Body</span>
  </div>
  <button style="width:100%;min-height:48px;border:0;border-radius:12px;background:#4f46e5;color:#fff;font-size:16px;font-weight:700;margin:8px 0">Go</button>
  <div style="width:calc(100% - 8px);padding:4px 8px 12px 16px;margin:auto;color:red !important">Odd values</div>
  <div style="display:none">hidden</div>
</div>`;

const PROPS = ['display', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'font-size', 'font-weight', 'font-family', 'line-height', 'color', 'background-color', 'border-top-width', 'border-top-left-radius', 'text-align',
  'width', 'min-height', 'row-gap', 'flex-direction', 'justify-content', 'align-items', 'box-sizing', 'overflow-wrap'];

test('TW-1 converted markup renders with identical computed styles', async ({ page }) => {
  const converted = toTailwind(SAMPLE);
  expect(converted).toContain('flex-col');
  expect(converted).toContain('justify-between');
  expect(converted).toContain('font-semibold');
  expect(converted).toContain('w-full');
  expect(converted).toContain('py-5');
  expect(converted).toContain('px-4');
  expect(converted).toContain('[padding:13px]');

  const css = (await postcss([tailwindcss({ content: [{ raw: converted, extension: 'html' }], corePlugins: { preflight: false } } as any)]).process('@tailwind utilities;', { from: undefined })).css;
  const read = async (markup: string, extraCss = '') => {
    await page.setContent(`<!doctype html><style>${extraCss}</style><body style="margin:0;width:390px">${markup}</body>`);
    return page.evaluate((props) => Array.from(document.body.querySelectorAll('*')).map((el) => {
      const cs = getComputedStyle(el); return props.map((p) => `${p}=${cs.getPropertyValue(p)}`).join(';');
    }), PROPS);
  };
  const before = await read(SAMPLE);
  const after = await read(converted, css);
  expect(after.length).toBe(before.length);
  // guard against a vacuous pass: without the generated CSS the converted markup must look different
  expect(await read(converted)).not.toEqual(before);
  for (let i = 0; i < before.length; i++) expect(after[i], `element ${i}`).toBe(before[i]);
});

test('TW-2 mapping rules', () => {
  expect(declToClasses('padding', '20px 16px')).toEqual(['py-5', 'px-4']);
  expect(declToClasses('padding', '13px')).toEqual(['[padding:13px]']);
  expect(declToClasses('margin', '0 0 4px')).toEqual(['[margin:0_0_4px]']);
  expect(declToClasses('display', 'none')).toEqual(['hidden']);
  expect(declToClasses('font-weight', '600')).toEqual(['font-semibold']);
  expect(declToClasses('background', 'rgba(255, 255, 255, .9)')).toEqual(['[background:rgba(255,_255,_255,_.9)]']);
  expect(declToClasses('color', 'red !important')).toBeNull(); // important stays inline
  expect(declToClasses('content', '"x"')).toBeNull();           // quotes cannot go in a class safely
  expect(declToClasses('width', 'a]b')).toBeNull();
});

test('TW-3 unconvertible declarations stay in style, others are removed', () => {
  const out = toTailwind('<div style="color:red !important;display:flex">x</div>');
  expect(out).toContain('flex');
  expect(out).toMatch(/style="color:red !important"/);
});

test('TW-4 no inline style left when everything converts; <style> blocks untouched', () => {
  const out = toTailwind('<style>.a{color:red}</style><p style="font-size:14px">x</p>');
  expect(out).toContain('<style>.a{color:red}</style>');
  expect(out).not.toMatch(/<p[^>]*style=/);
});
