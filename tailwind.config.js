/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      serif: 'DM Serif Display',
      body: 'Rubik',
    },
    screens: {
      ty: '1px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1120px',
    },
    extend: {
      colors: {
        page: '#404040',
        primary: '#402B2B',
        accent: {
          DEFAULT: '#EE4D47',
          hover: '#DA423D',
        },
        tint: '#FDEDE8',
        darkblue: '#0F264C',
      },
      backgroundImage: {
        bg: "url('/bg.svg')",
        bgItem: "url('/bg-item.svg')",
        banner: "url('/banner.svg')",
      },
    },
  },
  darkMode:"class",
  plugins: []
}

