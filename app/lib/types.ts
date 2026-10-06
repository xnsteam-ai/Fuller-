export type Device = 'mobile' | 'web';
export type Mode = 'ideate' | 'flash' | 'standard' | 'thinking';
export interface Screen { id: string; title: string; html: string }
export interface Project { id: string; name: string; device: Device; prompt: string; screens: (Screen | null)[]; updatedAt: number }
export const MODE_INFO: Record<Mode, { label: string; blurb: string; group: 'standard' | 'experimental' }> = {
  standard: { label: 'Standard', blurb: 'Balanced speed and quality', group: 'standard' },
  flash: { label: 'Fast', blurb: 'Quickest result', group: 'experimental' },
  thinking: { label: 'Thinking', blurb: 'Slower, more careful layouts', group: 'experimental' },
  ideate: { label: 'Ideate', blurb: 'Three different directions', group: 'experimental' },
};
