const base = require("@dotkomonline/config/tailwind-preset")

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  darkMode: ["class", '[data-theme="dark"]'],
}
