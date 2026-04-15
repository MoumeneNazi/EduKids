/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        edukids: {
          student: {
            bg: '#fff7ed', // warm orange/peach
            primary: '#f97316',
            secondary: '#facc15',
          },
          parent: {
            bg: '#ecfeff',
            primary: '#0d9488',
            secondary: '#38bdf8',
          },
          teacher: {
            bg: '#f0fdf4',
            primary: '#166534',
            secondary: '#22c55e',
          },
          admin: {
            bg: '#020617',
            primary: '#1d4ed8',
            secondary: '#a855f7',
          },
        },
      },
    },
  },
  plugins: [],
}

