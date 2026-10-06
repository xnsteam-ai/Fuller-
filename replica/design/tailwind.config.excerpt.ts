// tailwind.config.ts (excerpt). Components use roles, never raw hex.
const c = (n: string) => `var(--c-${n})`;
export default {
  theme: {
    screens: { sm: '360px', md: '768px', lg: '1024px' },
    colors: Object.fromEntries(['bg','surface','border','border-input','text','text-muted','accent','on-accent','danger','success','warning'].map(n => [n, c(n)])),
    borderRadius: { sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', pill: 'var(--r-pill)' },
    boxShadow: { card: 'var(--sh-card)', pop: 'var(--sh-pop)' },
    extend: { minHeight: { tap: '44px' }, minWidth: { tap: '44px' }, fontFamily: { sans: 'var(--font-sans)' } },
  },
};
