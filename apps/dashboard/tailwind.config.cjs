/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'base-blue': '#1F7BE5',
        'hover-blue': '#005CC6',
      }
    },
  },
  plugins: [],
};
