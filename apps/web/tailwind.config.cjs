const base = require("@dotkomonline/config/tailwind-preset")

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  // don't remove the col-start- and col-span- safelisting, the events in the EventCalendar needs them to be placed correctly, trust me.
  safelist: [{ pattern: /col-start-\d+/ }, { pattern: /col-span-\d+/ }],
}
