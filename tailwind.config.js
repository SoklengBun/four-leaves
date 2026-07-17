/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '0.75rem',
        },
      },
      colors: {
        // Theme-agnostic semantic roles. Themes only swap the CSS variables.
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-soft': 'var(--color-primary-soft)',
        'primary-foreground': 'var(--color-primary-foreground)',
        secondary: 'var(--color-secondary)',
        'secondary-soft': 'var(--color-secondary-soft)',
        accent: 'var(--color-accent)',
        'accent-strong': 'var(--color-accent-strong)',
        'accent-soft': 'var(--color-accent-soft)',
        foreground: 'var(--color-foreground)',
        'foreground-muted': 'var(--color-foreground-muted)',
        'foreground-subtle': 'var(--color-foreground-subtle)',
        background: 'var(--color-background)',
        'background-elevated': 'var(--color-background-elevated)',
        card: 'var(--color-card)',
        'card-hover': 'var(--color-card-hover)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        overlay: 'var(--color-overlay)',
        'muted-foreground': 'var(--color-foreground-muted)',
        muted: {
          foreground: 'var(--color-foreground-muted)',
        },
        // Compatibility aliases for legacy component classes while they are
        // migrated to semantic roles.
        anella: {
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          secondary: 'var(--color-secondary)',
          'soft-pink': 'var(--color-primary-soft)',
          'bg-pink': 'var(--color-surface)',
          hero: 'var(--color-secondary-soft)',
          lavender: 'var(--color-secondary-soft)',
          'cloud-purple': 'var(--color-secondary)',
          'dark-lavender': 'var(--color-secondary)',
        },
      },
      spacing: {
        nav: 'var(--nav-height)',
        body: 'var(--body-height)',
        player: 'var(--player-height)',
      },
      borderRadius: {
        card: 'var(--rounded-card)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        primary: 'var(--shadow-primary)',
      },
    },
  },
  plugins: [],
};
