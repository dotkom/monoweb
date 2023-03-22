const colors = require('open-color')

const toColorRecord = (color, name) => {
  const entries = color.map((v, index) => [index, v])
  return Object.fromEntries(entries)
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: toColorRecord(colors.gray, 'gray'),
    }
  },
}