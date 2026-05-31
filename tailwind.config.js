/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-card': 'var(--bg-card)',
        'accent-indigo': 'var(--accent-indigo)',
        'accent-teal': 'var(--accent-teal)',
        'text-hero': 'var(--text-hero)',
        'text-muted': 'var(--text-muted)',
        'border-subtle': 'var(--border-subtle)',
        'bg-void': 'var(--bg-void)',
        'bg-surface': 'var(--bg-surface)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-violet': 'var(--accent-violet)',
        'text-primary': 'var(--text-primary)',
        'text-dim': 'var(--text-dim)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
