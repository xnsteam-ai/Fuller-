'use client';
import type { Project } from './types';

// Fake data layer (localStorage). Same signatures the Supabase layer will implement.
const KEY = 'stitch-clone:projects';
export function listProjects(): Project[] {
  try { return (JSON.parse(localStorage.getItem(KEY) || '[]') as Project[]).sort((a, b) => b.updatedAt - a.updatedAt); } catch { return []; }
}
export function getProject(id: string): Project | undefined { return listProjects().find((p) => p.id === id); }
export function saveProject(p: Project) {
  const all = listProjects().filter((x) => x.id !== p.id);
  try { localStorage.setItem(KEY, JSON.stringify([p, ...all])); } catch { /* storage unavailable */ }
}
export function deleteProject(id: string) {
  try { localStorage.setItem(KEY, JSON.stringify(listProjects().filter((x) => x.id !== id))); } catch { /* ignore */ }
}
