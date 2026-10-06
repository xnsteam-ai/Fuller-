import type { Device, Mode } from '../types';

export interface GenInput { prompt: string; device: Device; mode: Mode; designMd?: string }
export interface RawScreen { title: string; html: string }
export interface AiProvider { name: string; generate(input: GenInput, signal?: AbortSignal): Promise<RawScreen[]> }

const SYSTEM = `You design mobile app screens. Reply with ONLY JSON: {"screens":[{"title":string,"html":string}]} with 1 to 5 screens.
Each html is a self-contained fragment using inline styles or one <style> block, no scripts, no external resources, no horizontal overflow,
layout fits a 390px wide column, touch targets at least 44px high. Use original copy.`;

// Needs GEMINI_API_KEY (server env). Model name from GEMINI_MODEL.
export class GeminiApiKeyProvider implements AiProvider {
  name = 'gemini-api-key';
  async generate({ prompt, device, designMd }: GenInput, signal?: AbortSignal): Promise<RawScreen[]> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: `Device: ${device}\n${designMd ? `Design system:\n${designMd}\n` : ''}Request: ${prompt}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseScreens(text);
  }
}

export class VertexProvider implements AiProvider {
  name = 'vertex';
  async generate(): Promise<RawScreen[]> { throw new Error('Vertex provider not implemented yet'); }
}

export function parseScreens(text: unknown): RawScreen[] {
  if (typeof text !== 'string') throw new Error('Empty model reply');
  const j = JSON.parse(text);
  const list = Array.isArray(j?.screens) ? j.screens : [];
  const ok = list.filter((s: any) => s && typeof s.title === 'string' && typeof s.html === 'string').slice(0, 5);
  if (!ok.length) throw new Error('Model returned no screens');
  return ok;
}

export function aiConfigured(): boolean {
  return process.env.AI_PROVIDER === 'vertex' ? false : Boolean(process.env.GEMINI_API_KEY);
}

export function getProvider(): AiProvider {
  return process.env.AI_PROVIDER === 'vertex' ? new VertexProvider() : new GeminiApiKeyProvider();
}
