module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'title': '"IBM Plex Sans", system-ui, Roboto, sans-serif',
      'sans': '"Inter", sans-serif'
    },
    extend: {
      colors: {
        'discord-blue': '#807cfc'
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
