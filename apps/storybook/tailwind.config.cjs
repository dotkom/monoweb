const base = require("@dotkomonline/config/tailwind-preset")

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: ["../../packages/ow-ui/src/**/*.{js,ts,jsx,tsx}"],
}
