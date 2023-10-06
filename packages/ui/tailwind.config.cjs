const base = require("@dotkomonline/config/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: ["./**/*.{js,ts,jsx,tsx}"],
};
