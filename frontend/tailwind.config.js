/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, 1rem)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        'voice-bar': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '28px' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(0.75rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'voice-bar': 'voice-bar 0.6s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}