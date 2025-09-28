/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary EV theme colors
        'ev-primary': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'ev-secondary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'ev-accent': {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        'ev-electric': {
          400: '#00d4ff',
          500: '#00bcd4',
          600: '#0097a7',
        },
        'ev-energy': {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        }
      },
      backgroundImage: {
        'ev-gradient': 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        'ev-gradient-light': 'linear-gradient(135deg, #6ee7b7 0%, #93c5fd 100%)',
        'ev-energy-gradient': 'linear-gradient(45deg, #22c55e, #00bcd4, #3b82f6)',
        'charging-pattern': 'radial-gradient(circle at 50% 50%, #10b981 0%, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'charging': 'charging 2s ease-in-out infinite',
        'energy-flow': 'energyFlow 3s ease-in-out infinite',
      },
      keyframes: {
        charging: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        energyFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      boxShadow: {
        'ev-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'ev-card': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'ev-button': '0 4px 16px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
