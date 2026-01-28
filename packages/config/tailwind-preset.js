const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  // Relative to the project when the preset is loaded from a tailwind.config.js
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      ...colors,
      // Override blue to use CSS variables for theme switching
      blue: {
        50: "rgb(var(--color-blue-50) / <alpha-value>)",
        100: "rgb(var(--color-blue-100) / <alpha-value>)",
        200: "rgb(var(--color-blue-200) / <alpha-value>)",
        300: "rgb(var(--color-blue-300) / <alpha-value>)",
        400: "rgb(var(--color-blue-400) / <alpha-value>)",
        500: "rgb(var(--color-blue-500) / <alpha-value>)",
        600: "rgb(var(--color-blue-600) / <alpha-value>)",
        700: "rgb(var(--color-blue-700) / <alpha-value>)",
        800: "rgb(var(--color-blue-800) / <alpha-value>)",
        900: "rgb(var(--color-blue-900) / <alpha-value>)",
        950: "rgb(var(--color-blue-950) / <alpha-value>)",
      },
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
        foreground: "var(--black)",
        brand: "var(--color-brand)",
        accent: "var(--color-accent)",
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
        DEFAULT: "var(--blue-600)",
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
