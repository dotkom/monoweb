const base = require("@dotkomonline/config/tailwind-preset")

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [...base.content, "./src/**/*.{svelte,astro}"],
}
