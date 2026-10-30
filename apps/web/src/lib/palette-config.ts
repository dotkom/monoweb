import { type Icon, IconPumpkinScary } from "@tabler/icons-react"
import type { FC, PropsWithChildren } from "react"
import { HalloweenBackdrop } from "@/components/backdrops/HalloweenBackdrop"
import type { Palette } from "./palette"

interface PaletteConfig {
  label: string
  /** Color swatch in the palette picker */
  swatchClassName: string
  /** Replaces the sun/moon icon on the theme dropdown button */
  icon?: Icon
  /** Decorative artwork behind the public website */
  Backdrop?: FC<PropsWithChildren>
  /** Whether the homepage includes the interactive 3D logo */
  showHeroScene?: boolean
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
    Backdrop: HalloweenBackdrop,
    showHeroScene: false,
  },
}
