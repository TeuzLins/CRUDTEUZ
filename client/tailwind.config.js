/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          base: '#0f172a',
          alt: '#111827'
        },
        purple: '#1d4ed8',
        magenta: '#0f766e',
        violet: '#475569',
        neon: {
          green: '#dbeafe'
        }
      },
      boxShadow: {
        soft: '0 18px 40px rgba(15,23,42,0.22)',
        glowMagenta: '0 12px 30px rgba(29,78,216,0.18)',
        glowGreen: '0 10px 24px rgba(15,23,42,0.12)'
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
