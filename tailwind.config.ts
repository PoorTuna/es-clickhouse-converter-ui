import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Driven by CSS variables (see index.css) so the dark/light toggle can
        // re-theme everything. Channels are space-separated RGB to keep the
        // Tailwind `/<alpha>` opacity utilities working.
        ch: {
          bg: 'rgb(var(--ch-bg) / <alpha-value>)',
          panel: 'rgb(var(--ch-panel) / <alpha-value>)',
          'panel-2': 'rgb(var(--ch-panel-2) / <alpha-value>)',
          border: 'rgb(var(--ch-border) / <alpha-value>)',
          yellow: 'rgb(var(--ch-yellow) / <alpha-value>)',
          'yellow-dim': 'rgb(var(--ch-yellow-dim) / <alpha-value>)',
          text: 'rgb(var(--ch-text) / <alpha-value>)',
          muted: 'rgb(var(--ch-muted) / <alpha-value>)',
          warning: 'rgb(var(--ch-warning) / <alpha-value>)',
          suggestion: 'rgb(var(--ch-suggestion) / <alpha-value>)',
          danger: 'rgb(var(--ch-danger) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(0,0,0,0.4)',
        glow: '0 0 0 3px rgba(250,255,105,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
