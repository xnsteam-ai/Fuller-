export type Device = 'mobile' | 'web';
export type Mode = 'ideate' | 'flash' | 'standard' | 'thinking';
export interface Screen { id: string; title: string; html: string }
export interface Project { id: string; name: string; device: Device; prompt: string; screens: Screen[]; updatedAt: number }
