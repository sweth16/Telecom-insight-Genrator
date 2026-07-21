/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'dark-900': 'var(--dark-900)',
        'dark-800': 'var(--dark-800)',
        'dark-700': 'var(--dark-700)',
        'dark-600': 'var(--dark-600)',
        'neon-blue':   'var(--neon-blue)',
        'neon-purple': 'var(--neon-purple)',
        'neon-cyan':   'var(--neon-cyan)',
        'neon-red':    'var(--neon-red)',
        'neon-orange': 'var(--neon-orange)',
        accent: {
          blue:   'var(--accent-blue)',
          sky:    'var(--accent-sky)',
          teal:   'var(--accent-teal)',
          violet: 'var(--accent-violet)',
          red:    'var(--accent-red)',
          amber:  'var(--accent-amber)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float:    'float 6s ease-in-out infinite',
        shimmer:  'shimmer 2s infinite',
        glow:     'glow 2s ease-in-out infinite alternate',
        scan:     'scan 4s linear infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow:    { from: { boxShadow: '0 0 5px rgba(37,99,235,0.2)' }, to: { boxShadow: '0 0 20px rgba(37,99,235,0.5)' } },
        scan:    { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
