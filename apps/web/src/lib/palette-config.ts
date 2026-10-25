import { type Icon, IconPumpkinScary } from "@tabler/icons-react"
import type { Palette } from "./palette"

interface PaletteConfig {
  label: string
  /** Color swatch in the palette picker */
  swatchClassName: string
  /** Replaces the sun/moon icon on the theme dropdown button */
  icon?: Icon
  /** Full-width artwork shown in the hero instead of the 3D scene, with a transparent sky for the text to sit in */
  heroArtwork?: { src: string; width: number; height: number }
}

/**
 * Everything about a palette that isn't colors (those are in src/palettes/<palette>.css). Components read from here
 * instead of checking for specific palettes.
 */
export const PALETTE_CONFIG: Record<Palette, PaletteConfig> = {
  classic: {
    label: "Klassisk",
    swatchClassName: "bg-[#0b5374]",
  },
  halloween: {
    label: "Halloween",
    swatchClassName: "bg-[#f7931e]",
    icon: IconPumpkinScary,
    heroArtwork: { src: "/halloween-background.svg", width: 2400, height: 540 },
  },
}
