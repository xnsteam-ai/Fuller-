import type { Device, Mode } from '../types';

export interface Image { mime: string; data: string } // base64, no prefix
export interface GenInput { prompt: string; device: Device; mode: Mode; designMd?: string; image?: Image }
export interface RawScreen { title: string; html: string }
export interface AiProvider {
  name: string;
  generate(input: GenInput, signal?: AbortSignal): Promise<RawScreen[]>;
  refine(input: { prompt: string; html: string; device: Device; mode: Mode; designMd?: string }, signal?: AbortSignal): Promise<RawScreen>;
  variants(input: { html: string; device: Device; mode: Mode; designMd?: string }, signal?: AbortSignal): Promise<RawScreen[]>;
  designMd(input: { screens: RawScreen[]; mode: Mode }, signal?: AbortSignal): Promise<string>;
}

const RULES = `Each html is a self-contained fragment using inline styles or one <style> block. No scripts, no external resources (no url(), no @import, no remote images), layout fits a 390px wide column and never overflows horizontally, touch targets at least 44px high, readable contrast. Write original copy.`;
const SYS_GEN = `You design app screens. Reply with ONLY JSON: {"screens":[{"title":string,"html":string}]} with 1 to 5 screens. ${RULES}`;
const SYS_ONE = `You edit one app screen. Reply with ONLY JSON: {"screens":[{"title":string,"html":string}]} with exactly 1 screen that applies the requested change and keeps the rest. ${RULES}`;
const SYS_VAR = `You propose 3 clearly different visual alternatives of one app screen with the same content and purpose. Reply with ONLY JSON: {"screens":[{"title":string,"html":string}]} with exactly 3 screens. ${RULES}`;
const SYS_MD = `You write a DESIGN.md for an app from its screens: sections "Colors" (roles and hex), "Typography", "Spacing", "Radius", "Components", "Tone". Plain Markdown, under 400 words, no code fences around the whole document.`;

export function modelFor(mode: Mode): string {
  if (mode === 'thinking') return process.env.GEMINI_MODEL_THINKING || 'gemini-2.5-pro';
  if (mode === 'flash' || mode === 'ideate') return process.env.GEMINI_MODEL_FLASH || 'gemini-2.5-flash';
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

// Needs GEMINI_API_KEY (server env). Not yet run against the live API.
export class GeminiApiKeyProvider implements AiProvider {
  name = 'gemini-api-key';

  private async call(system: string, parts: object[], mode: Mode, json: boolean, signal?: AbortSignal): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelFor(mode)}:generateContent`, {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts }],
        generationConfig: json ? { responseMimeType: 'application/json' } : {},
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text) throw new Error('Empty model reply');
    return text;
  }

  async generate({ prompt, device, mode, designMd, image }: GenInput, signal?: AbortSignal) {
    const parts: object[] = [{ text: `Device: ${device}\n${mode === 'ideate' ? 'Give 3 different directions.\n' : ''}${designMd ? `Design system:\n${designMd}\n` : ''}Request: ${prompt}` }];
    if (image) parts.push({ inlineData: { mimeType: image.mime, data: image.data } });
    return parseScreens(await this.call(SYS_GEN, parts, mode, true, signal));
  }
  async refine({ prompt, html, device, mode, designMd }: { prompt: string; html: string; device: Device; mode: Mode; designMd?: string }, signal?: AbortSignal) {
    const text = `Device: ${device}\n${designMd ? `Design system:\n${designMd}\n` : ''}Current screen HTML:\n${html}\n\nChange requested: ${prompt}`;
    return parseScreens(await this.call(SYS_ONE, [{ text }], mode, true, signal), 1)[0];
  }
  async variants({ html, device, mode, designMd }: { html: string; device: Device; mode: Mode; designMd?: string }, signal?: AbortSignal) {
    const text = `Device: ${device}\n${designMd ? `Design system:\n${designMd}\n` : ''}Screen HTML:\n${html}`;
    return parseScreens(await this.call(SYS_VAR, [{ text }], mode, true, signal), 3);
  }
  async designMd({ screens, mode }: { screens: RawScreen[]; mode: Mode }, signal?: AbortSignal) {
    const text = screens.map((s) => `## ${s.title}\n${s.html}`).join('\n\n');
    return (await this.call(SYS_MD, [{ text }], mode, false, signal)).slice(0, 20000);
  }
}

export class VertexProvider implements AiProvider {
  name = 'vertex';
  private no(): never { throw new Error('Vertex provider not implemented yet'); }
  async generate(): Promise<RawScreen[]> { return this.no(); }
  async refine(): Promise<RawScreen> { return this.no(); }
  async variants(): Promise<RawScreen[]> { return this.no(); }
  async designMd(): Promise<string> { return this.no(); }
}

export function parseScreens(text: string, max = 5): RawScreen[] {
  const j = JSON.parse(text);
  const list = Array.isArray(j?.screens) ? j.screens : [];
  const ok = list.filter((s: any) => s && typeof s.title === 'string' && typeof s.html === 'string').slice(0, max);
  if (!ok.length) throw new Error('Model returned no screens');
  return ok;
}

export function aiConfigured(): boolean {
  return process.env.AI_PROVIDER === 'vertex' ? false : Boolean(process.env.GEMINI_API_KEY);
}
export function getProvider(): AiProvider {
  return process.env.AI_PROVIDER === 'vertex' ? new VertexProvider() : new GeminiApiKeyProvider();
}
