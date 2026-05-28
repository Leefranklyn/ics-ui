import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#0d0d0d',
        'bg-tertiary': '#111111',
        'bg-hover': '#161616',
        
        // Borders
        'border-subtle': '#222222',
        'border-default': '#2a2a2a',
        'border-focus': '#3a3a3a',
        
        // Text
        'text-primary': '#f0f0f0',
        'text-secondary': '#a0a0a0',
        'text-muted': '#888888',
        
        // Accents
        'accent-indigo': '#6366f1',
        'accent-indigo-dim': '#4f46e5',
        'accent-cyan': '#06b6d4',
        'accent-cyan-bright': '#22d3ee',
        
        // Status
        'status-success': '#22c55e',
        'status-warning': '#f59e0b',
        'status-error': '#ef4444',
        'status-info': '#6366f1',
        
        // Legacy aliases for compatibility
        bg: '#0a0a0a',
        surface: '#111111',
        surface2: '#161616',
        accent: '#6366f1',
        accentDim: '#4f46e5',
        textBase: '#f0f0f0',
        textMuted: '#888888',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        border: '#2a2a2a',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      letterSpacing: {
        'tight': '-0.02em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      boxShadow: {
        'glow-sm': '0 0 0 1px rgba(99, 102, 241, 0.2)',
        'glow-md': '0 0 0 2px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 0 3px rgba(99, 102, 241, 0.15)',
        'inset-subtle': 'inset 0 0 0 1px rgba(42, 42, 42, 0.5)',
      },
      backgroundImage: {
        'grid-dots': 'radial-gradient(circle, #333 0.5px, transparent 0.5px)',
        'grid-lines': 'linear-gradient(rgba(42, 42, 42, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 42, 42, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-dots': '24px 24px',
        'grid-lines': '24px 24px',
      },
    },
  },
  plugins: [],
};

export default config;
