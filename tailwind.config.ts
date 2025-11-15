import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import animatePlugin from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx,mdx}',
    './src/features/**/*.{ts,tsx,mdx}',
    './src/lib/**/*.{ts,tsx,mdx}',
    './src/styles/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        glow: {
          honey: 'var(--glow-honey)',
          umber: 'var(--glow-umber)',
          dawn: 'var(--glow-dawn)',
        },
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, hsl(var(--gradient-honey)) 0%, hsl(var(--gradient-clay)) 48%, hsl(var(--gradient-cream)) 100%)',
        'glass-dark': 'linear-gradient(135deg, rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 0.45))',
        'glass-light':
          'linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.1))',
      },
      boxShadow: {
        glow: '0 40px 120px -45px rgba(87, 62, 38, 0.45)',
        'inner-glow': 'inset 0 0 45px rgba(255, 233, 204, 0.32)',
        aurora: '0 0 90px 18px rgba(235, 180, 80, 0.35)',
      },
      keyframes: {
        'float-soft': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -6px, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'float-soft': 'float-soft 7s ease-in-out infinite',
        shimmer: 'shimmer 10s linear infinite',
        'soft-pulse': 'soft-pulse 5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        bee: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      fontFamily: {
        title: ['var(--font-love)', 'sans-serif'],
        menu: ['var(--font-cannia)', 'serif'],
        display: ['var(--font-adam)', 'sans-serif'],
        sans: ['var(--font-avenir)', 'sans-serif'],
        script: ['var(--font-saint)', 'cursive'],
      },
      borderRadius: {
        xl: '1.75rem',
        '2xl': '2.75rem',
        '3xl': '3.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [
    animatePlugin,
    plugin(({ addVariant }) => {
      addVariant('supports-backdrop', '@supports (backdrop-filter: blur(0)) &');
    }),
  ],
};

export default config;
