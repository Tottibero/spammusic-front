/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      borderRadius: {
        'primary': '0.5rem', // define el valor que necesites
      },
      colors: {
        primary: {
          200: '#bfdbfe', // Ajusta los colores según tus necesidades
          300: '#93c5fd',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
