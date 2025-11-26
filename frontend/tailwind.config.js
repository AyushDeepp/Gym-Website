/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#FF5F1F',
          blue: '#00F5FF',
          dark: '#0A0A0A',
          darker: '#000000',
          gray: '#1A1A1A',
          lightGray: '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'container': '1400px',
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #FF5F1F, 0 0 10px #FF5F1F' },
          '100%': { boxShadow: '0 0 10px #FF5F1F, 0 0 20px #FF5F1F, 0 0 30px #FF5F1F' },
        },
      },
    },
  },
  plugins: [],
}

