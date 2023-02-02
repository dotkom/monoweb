const brand = {
  lighter: "#1277A5",
  light: "#106A93",
  DEFAULT: "#0d5474",
  dark: "#0A425C",
  darker: "#083549",
}

const slate = {
  1: "#151718",
  2: "#1a1d1e",
  3: "#202425",
  4: "#26292b",
  5: "#2b2f31",
  6: "#313538",
  7: "#3a3f42",
  8: "#4c5155",
  9: "#697177",
  10: "#787f85",
  11: "#9ba1a6",
  12: "#ecedee",
}

const blue = {
  1: "#0f1720",
  2: "#0f1b2d",
  3: "#10243e",
  4: "#102a4c",
  5: "#0f3058",
  6: "#0d3868",
  7: "#0a4481",
  8: "#0954a5",
  9: "#0091ff",
  10: "#369eff",
  11: "#52a9ff",
  12: "#eaf6ff",
}

const amber = {
  1: "#1f1300",
  2: "#271700",
  3: "#341c00",
  4: "#3f2200",
  5: "#4a2900",
  6: "#573300",
  7: "#693f05",
  8: "#824e00",
  9: "#ffb224",
  10: "#ffcb47",
  11: "#f1a10d",
  12: "#fef3dd",
}

const green = {
  1: "#0d1912",
  2: "#0c1f17",
  3: "#0f291e",
  4: "#113123",
  5: "#133929",
  6: "#164430",
  7: "#1b543a",
  8: "#236e4a",
  9: "#30a46c",
  10: "#3cb179",
  11: "#4cc38a",
  12: "#e5fbeb",
}

const red = {
  1: "#1d1412",
  2: "#2a1410",
  3: "#3b1813",
  4: "#481a14",
  5: "#541c15",
  6: "#652016",
  7: "#7f2315",
  8: "#a42a12",
  9: "#e54d2e",
  10: "#ec5e41",
  11: "#f16a50",
  12: "#feefec",
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Relative to the project when the preset is loaded from a tailwind.config.js
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../../packages/ow-ui/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      slate: { ...slate, DEFAULT: slate[3] },
      blue: { ...blue, DEFAULT: blue[3] },
      amber: { ...amber, DEFAULT: amber[3] },
      red: { ...red, DEFAULT: red[3] },
      green: { ...green, DEFAULT: green[3] },
      brand: brand,
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
        background: "#000212",
        foreground: slate[12],
        accent: "#FFEDB3",
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
        DEFAULT: blue[7],
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
