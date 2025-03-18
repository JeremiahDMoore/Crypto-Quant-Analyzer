/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable dark mode support
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#BB86FC',
        secondary: '#03DAC6',
        error: '#CF6679',
        text: '#E0E0E0',
        border: '#333333',
      },
    },
  },
  plugins: [],
};
