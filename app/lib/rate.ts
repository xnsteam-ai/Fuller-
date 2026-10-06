// In-memory sliding window. Per server instance only; fine for one instance, replace with a shared store when scaled out.
const hits = new Map<string, number[]>();
export function limited(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now); hits.set(key, list);
  return list.length > max;
}
