import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#0f172a',
        surface:    '#1e293b',
        surface2:   '#334155',
        accent:     '#3b82f6',
        accentDim:  '#1d4ed8',
        textBase:   '#f1f5f9',
        textMuted:  '#94a3b8',
        success:    '#22c55e',
        warning:    '#f59e0b',
        danger:     '#ef4444',
        border:     '#334155',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
