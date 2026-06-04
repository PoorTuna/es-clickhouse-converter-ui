import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ch: {
          bg: '#1c1c1c',
          panel: '#242424',
          'panel-2': '#2c2c2c',
          border: '#383838',
          yellow: '#FAFF69',
          'yellow-dim': '#d6db4a',
          text: '#ECECEC',
          muted: '#9A9A9A',
          warning: '#F5A623',
          suggestion: '#5AB0FF',
          danger: '#FF6B6B',
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
