import type { Config } from "tailwindcss"
import { radixThemePreset } from "radix-themes-tw"

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [radixThemePreset],
} satisfies Config
