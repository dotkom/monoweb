const createColorScale = (name) => {
  const entries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => [step, `var(--${name}-${step})`])

  // Set the default to the ninth step
  entries.push(["DEFAULT", `var(--${name}-9)`])
  return Object.fromEntries(entries)
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  // Relative to the project when the preset is loaded from a tailwind.config.js
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      brand: createColorScale("brand"),
      accent: createColorScale("accent"),
      slate: createColorScale("slate"),
      blue: createColorScale("blue"),
      amber: createColorScale("amber"),
      red: createColorScale("red"),
      green: createColorScale("green"),
      indigo: createColorScale("indigo"),
      yellow: createColorScale("yellow"),
    },
    extend: {
      fontFamily: {
        title: ["var(--font-title, 'Figtree')"],
        body: ["var(--font-body, 'Inter')"],
        mono: ["Roboto Mono", "monospace"],
      },
      colors: {
        inherit: "inherit",
        current: "current",
        transparent: "transparent",
        white: "#fff",
        black: "#000",
        background: "var(--color-background)",
        foreground: "var(--slate-12)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "collapsible-down": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
      ringColor: {
        DEFAULT: "var(--blue-7)",
      },
    },
  },
  plugins: [
    require("tailwindcss-radix")({
      variantPrefix: "rdx",
    }),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
}
