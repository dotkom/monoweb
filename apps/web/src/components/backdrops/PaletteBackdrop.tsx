"use client"

import { usePalette } from "@/components/PaletteProvider"
import { PALETTE_CONFIG } from "@/lib/palette-config"
import type { FC, PropsWithChildren } from "react"

export const PaletteBackdrop: FC<PropsWithChildren> = ({ children }) => {
  const Backdrop = PALETTE_CONFIG[usePalette().palette].Backdrop
  return Backdrop ? <Backdrop>{children}</Backdrop> : children
}
