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
    },
  },
  plugins: [],
}

