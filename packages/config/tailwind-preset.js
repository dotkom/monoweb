const createColorScale = (name) => {
  const entries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => [step, `var(--color-${name}-${step})`])
  // Give the default the third step on the scale
  entries.push(["DEFAULT", `var(--color-${name}-3`])
  return Object.fromEntries(entries)
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Relative to the project when the preset is loaded from a tailwind.config.js
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ow-ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      slate: createColorScale("slate"),
      blue: createColorScale("blue"),
      amber: createColorScale("amber"),
      red: createColorScale("red"),
      green: createColorScale("green"),
    },
    extend: {
      fontFamily: {
        poppins: ['"Poppins"', "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
        sans: ['"Inter var"', "sans-serif"],
      },
      colors: {
        inherit: "inherit",
        current: "current",
        transparent: "transparent",
        background: "var(--color-background)",
        foreground: "var(--color-slate-12)",
        accent: "#FFEDB3",
        brand: {
          lighter: "#1277A5",
          light: "#106A93",
          DEFAULT: "#0d5474",
          dark: "#0A425C",
          darker: "#083549",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      ringColor: {
        DEFAULT: "var(--color-blue-7)",
      },
      borderRadius: {
        md: "4px",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          "--tw-prose-invert-bullets": theme("colors.amber.12"),
          "--tw-prose-bullets": theme("colors.amber.12"),
        },
      }),
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

// #FFCB47 #fab759
