import type { Device, Mode } from '../types';

export interface GenInput { prompt: string; device: Device; mode: Mode; designMd?: string }
export interface RawScreen { title: string; html: string }
export interface AiProvider { name: string; generate(input: GenInput, signal?: AbortSignal): Promise<RawScreen[]> }

const SYSTEM = `You design mobile app screens. Reply with ONLY JSON: {"screens":[{"title":string,"html":string}]} with 1 to 5 screens.
Each html is a self-contained fragment using inline styles or one <style> block, no scripts, no external resources, no horizontal overflow,
layout fits a 390px wide column, touch targets at least 44px high. Use original copy.`;

// Mock: deterministic, offline. Default so the app runs with no credentials.
export class MockProvider implements AiProvider {
  name = 'mock';
  async generate({ prompt, device }: GenInput): Promise<RawScreen[]> {
    const subject = prompt.trim().slice(0, 60) || 'Your app';
    const w = device === 'mobile' ? '100%' : '100%';
    const card = (t: string, s: string) => `<div style="background:#fff;border:1px solid #e3e6ea;border-radius:14px;padding:14px;margin:0 0 10px"><strong style="display:block">${t}</strong><span style="color:#565f6c;font-size:14px">${s}</span></div>`;
    const shell = (title: string, body: string) => `<div style="font-family:system-ui,sans-serif;background:#f4f5f8;min-height:100%;width:${w};padding:20px 16px;box-sizing:border-box"><h1 style="font-size:24px;margin:0 0 4px;overflow-wrap:anywhere">${title}</h1><p style="color:#565f6c;margin:0 0 16px;overflow-wrap:anywhere">${subject}</p>${body}</div>`;
    const btn = (t: string) => `<button style="width:100%;min-height:48px;border:0;border-radius:12px;background:#4f46e5;color:#fff;font-size:16px;font-weight:600">${t}</button>`;
    return [
      { title: 'Home', html: shell('Welcome back', card('Today', 'Three things need you') + card('Recent', 'Pick up where you left off') + btn('Get started')) },
      { title: 'Details', html: shell('Details', card('Overview', 'Everything in one place') + card('Activity', 'Nothing new yet') + btn('Save')) },
      { title: 'Settings', html: shell('Settings', card('Account', 'Profile and sign-in') + card('Notifications', 'Choose what you hear about') + btn('Done')) },
    ];
  }
}

// UNTESTED against the live API: needs GEMINI_API_KEY (server env). Model name from GEMINI_MODEL.
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

export function getProvider(): AiProvider {
  switch (process.env.AI_PROVIDER) {
    case 'gemini': return new GeminiApiKeyProvider();
    case 'vertex': return new VertexProvider();
    default: return new MockProvider();
  }
}
