import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        night: '#0A1B54',
        'night-light': '#0D2266',
        'night-muted': '#1A2E6B',
        gold: '#C5A059',
        'gold-light': '#D4B576',
        ivory: '#F5F0E8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        xs: ['12px', { lineHeight: '1.5', letterSpacing: '0.06em' }],
        sm: ['14px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'display-sm': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(4rem, 8vw, 7rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(5rem, 11vw, 10rem)', { lineHeight: '0.88', letterSpacing: '-0.05em' }],
        'display-xl': ['clamp(6rem, 14vw, 14rem)', { lineHeight: '0.85', letterSpacing: '-0.06em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '36': '9rem',
      },
      animation: {
        'grain': 'grain 0.8s steps(1) infinite',
        'cursor-enter': 'cursorEnter 0.3s ease forwards',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -3%)' },
          '20%': { transform: 'translate(3%, 2%)' },
          '30%': { transform: 'translate(-1%, 4%)' },
          '40%': { transform: 'translate(4%, -1%)' },
          '50%': { transform: 'translate(-3%, 3%)' },
          '60%': { transform: 'translate(2%, -4%)' },
          '70%': { transform: 'translate(-4%, 1%)' },
          '80%': { transform: 'translate(1%, -2%)' },
          '90%': { transform: 'translate(3%, 4%)' },
        },
        cursorEnter: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'circ-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
      },
      gridTemplateColumns: {
        'hero': '2fr 3fr',
        'catalog': '80px 1fr 180px 120px',
      },
    },
  },
  plugins: [],
}

export default config
