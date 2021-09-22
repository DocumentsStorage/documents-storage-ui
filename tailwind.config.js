const production = !process.env.ROLLUP_WATCH;
module.exports = {
  mode: 'jit',
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      backgroundColor: ['responsive', 'hover', 'focus', 'active']
    }
  },
  purge: {
    content: [
     './src/**/*.svelte'

    ],
    enabled: production // disable purge in dev
  }
};
