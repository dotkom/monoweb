const colors = require("@radix-ui/colors")

const createColorScale = (name) => {
  const entries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => [
    step,
    `hsl(var(--color-${name}-${step}, ${colors[`${name}Dark`][`${name}${step}`]}) / <alpha-value>)`,
  ])

  // Give the default the third step on the scale
  entries.push(["DEFAULT", `hsl(var(--color-${name}-3, ${colors[`${name}Dark`][`${name}3`]}) / <alpha-value>)`])
  return Object.fromEntries(entries)
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Relative to the project when the preset is loaded from a tailwind.config.js
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      slate: createColorScale("slate"),
      blue: createColorScale("blue"),
      amber: createColorScale("amber"),
      red: createColorScale("red"),
      green: createColorScale("green"),
      indigo: createColorScale("indigo"),
    },
    extend: {
      fontFamily: {
        fraunces: ["var(--font-fraunces, 'Fraunces')"],
        poppins: ["var(--font-poppins, 'Poppins')"],
        mono: ["Roboto Mono", "monospace"],
        sans: ['"Inter var"', "sans-serif"],
      },
      colors: {
        inherit: "inherit",
        current: "current",
        transparent: "transparent",
        white: "#ffffee",
        background: "var(--color-background)", //#asjkdl
        foreground: "hsl(var(--color-slate-12) / <alpha-value>)",
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
      minHeight: {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "7": "1.75rem",
        "8": "2rem",
        "9": "2.25rem",
        "10": "2.5rem",
        "11": "2.75rem",
        "12": "3rem",
        "14": "3.5rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
        "28": "7rem",
        "32": "8rem",
        "36": "9rem",
        "40": "10rem",
        "44": "11rem",
        "48": "12rem",
        "52": "13rem",
        "56": "14rem",
        "60": "15rem",
        "64": "16rem",
        "72": "18rem",
        "80": "20rem",
        "96": "24rem",
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
