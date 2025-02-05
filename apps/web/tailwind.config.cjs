const base = require("@dotkomonline/config/tailwind-preset")

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  safelist: [
    { pattern: /col-start-\d+/ },
    { pattern: /col-span-\d+/ }
  ],
}
