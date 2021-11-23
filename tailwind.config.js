module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    fontFamily: {
      'title': '"IBM Plex Sans", system-ui, Roboto, sans-serif',
      'sans': '"Inter", sans-serif'
    },
    extend: {
      colors: {
        blue: {
          'discord': '#807cfc',
          'discord-light': '#9b98fa'
        }
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
