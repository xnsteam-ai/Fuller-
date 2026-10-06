const c = (n) => `var(--c-${n})`;
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '360px', md: '768px', lg: '1024px' },
    colors: {
      transparent: 'transparent', current: 'currentColor',
      ...Object.fromEntries(['bg','surface','border','border-input','text','text-muted','accent','on-accent','danger','success','warning'].map((n) => [n, c(n)])),
    },
    borderRadius: { none: '0', sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', pill: 'var(--r-pill)', full: '9999px' },
    boxShadow: { card: 'var(--sh-card)', pop: 'var(--sh-pop)' },
    extend: { minHeight: { tap: '44px' }, minWidth: { tap: '44px' }, fontFamily: { sans: 'var(--font-sans)' } },
  },
};
