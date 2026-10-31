import { type Icon, IconPumpkinScary } from "@tabler/icons-react"
import type { Palette } from "./palette"

interface PaletteConfig {
  label: string
  swatchClassName: string
  icon?: Icon
  showHeroScene?: boolean
}

export const PALETTE_CONFIG: Record<Palette, PaletteConfig> = {
  classic: {
    label: "Klassisk",
    swatchClassName: "bg-[#0b5374]",
  },
  halloween: {
    label: "Halloween",
    swatchClassName: "bg-[#f7931e]",
    icon: IconPumpkinScary,
    showHeroScene: false,
  },
}
