'use client';
import { useRouter } from 'next/navigation';

// POST/PATCH helper: 401 -> sign-in, otherwise returns { ok, data, error } with a user-safe message.
export function useApi() {
  const router = useRouter();
  return async function call(url: string, method: string, body?: unknown): Promise<{ ok: boolean; data: any; error: string }> {
    try {
      const res = await fetch(url, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
      if (res.status === 401) { router.push('/sign-in'); return { ok: false, data: null, error: 'Sign in required' }; }
      const data = await res.json().catch(() => ({}));
      return res.ok ? { ok: true, data, error: '' } : { ok: false, data, error: data?.error || 'Something went wrong. Try again.' };
    } catch { return { ok: false, data: null, error: 'Network problem. Check your connection and try again.' }; }
  };
}
