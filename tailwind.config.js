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
    container: {
      padding: {
        DEFAULT: '1rem',
        lg: '0',
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1120px',
    },
    extend: {
      colors: {
        page: 'red',
        primary: '#402B2B',
        accent: {
          DEFAULT: '#EE4D47',
          hover: '#DA423D',
        },
        tint: '#FDEDE8',
        darkblue: '#0F264C',
      },
    },
  },
  darkMode:"class",
  plugins: []
}

