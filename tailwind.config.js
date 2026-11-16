/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        divad: {
          yellow: {
            light: '#FEF08A',
            DEFAULT: '#EAB308',
            dark: '#CA8A04',
            fabric: '#FDE047',
          },
          brown: {
            light: '#D7CCC8',
            DEFAULT: '#8D6E63',
            dark: '#5D4037',
            fabric: '#A1887F',
          },
          blue: {
            light: '#BAE6FD',
            DEFAULT: '#0284C7',
            dark: '#0369A1',
            fabric: '#38BDF8',
          },
          pink: {
            light: '#FBCFE8',
            DEFAULT: '#DB2777',
            dark: '#BE185D',
            fabric: '#F472B6',
          },
          green: {
            light: '#BBF7D0',
            DEFAULT: '#16A34A',
            dark: '#15803D',
            fabric: '#4ADE80',
          },
          red: {
            light: '#FECACA',
            DEFAULT: '#DC2626',
            dark: '#B91C1C',
            fabric: '#F87171',
          },
        },
      },
      fontFamily: {
        child: ['"Comic Neue"', 'Quicksand', 'Nunito', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-glow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}

