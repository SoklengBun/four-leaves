/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
        },
      },
      colors: {
        // ── semantic tokens (auto dark-mode via CSS vars) ──
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        'soft-pink': 'var(--color-soft-pink)',
        foreground: 'var(--color-foreground)',
        'foreground-muted': 'var(--color-foreground-muted)',
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-strong': 'var(--color-accent-strong)',
        hero: 'var(--color-hero)',
        // ── named raw palette (for one-off use) ──
        anella: {
          primary: '#f99ab8',
          'primary-hover': '#f8a0bc',
          secondary: '#ffb6cc',
          'soft-pink': '#ffdce8',
          'bg-pink': '#fff1f7',
          hero: '#c8c2ff',
          lavender: '#ddd8ff',
          'cloud-purple': '#b9b0f5',
          'dark-lavender': '#9a8de8',
        },
      },
      spacing: {
        nav: 'var(--nav-height)',
        body: 'var(--body-height)',
      },
    },
  },
  plugins: [],
};
