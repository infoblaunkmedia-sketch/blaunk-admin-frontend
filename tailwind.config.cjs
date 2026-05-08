/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          // Screenshot theme: strong blue
          DEFAULT: '#0B61C9',
          dark: '#094EA3',
        },
        accent: {
          // Screenshot theme: brand yellow
          DEFAULT: '#F2B705',
          dark: '#D9A304',
        },
        surface: '#F8F9FA',
        background: '#ffffff',
        sidebar: {
          // Sidebar per screenshot: white background + black text,
          // active item uses primary blue.
          bg: '#ffffff',
          text: '#111827',
          active: '#0B61C9',
        },
      },
      width: {
        sidebar: '240px',
      },
      height: {
        topbar: '60px',
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        navbar: '0 2px 4px rgba(15, 23, 42, 0.12)',
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
