/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          dark: '#070d18',
          card: '#0f172a',
          surface: '#162032',
          border: '#23324a',
          accent: '#06b6d4',
          highlight: '#38bdf8',
          muted: '#94a3b8'
        },
        risk: {
          none: '#10b981',
          watch: '#f59e0b',
          warning: '#f97316',
          evacuate: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        malayalam: ['Manjari', 'Gayathri', 'sans-serif']
      }
    },
  },
  plugins: [],
}
