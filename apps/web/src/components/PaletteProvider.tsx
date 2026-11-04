"use client"

import {
  DEFAULT_PALETTE_PREFERENCE,
  type Palette,
  type PalettePreference,
  resolvePalette,
  setPaletteCookie,
} from "@/lib/palette"
import { createContext, type FC, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"

interface PaletteContextValue {
  preference: PalettePreference
  palette: Palette
  defaultPalette: Palette
  availablePalettes: Palette[]
  setPreference: (preference: PalettePreference) => void
}

const FALLBACK_CONTEXT: PaletteContextValue = {
  preference: DEFAULT_PALETTE_PREFERENCE,
  palette: "classic",
  defaultPalette: "classic",
  availablePalettes: ["classic"],
  setPreference: () => {},
}

const PaletteContext = createContext<PaletteContextValue>(FALLBACK_CONTEXT)

interface PaletteProviderProps {
  initialPreference: PalettePreference
  initialPalette: Palette
  defaultPalette: Palette
  availablePalettes: Palette[]
}

export const PaletteProvider: FC<PropsWithChildren<PaletteProviderProps>> = ({
  initialPreference,
  initialPalette,
  defaultPalette,
  availablePalettes,
  children,
}) => {
  const [state, setState] = useState({ preference: initialPreference, palette: initialPalette })

  const setPreference = useCallback((preference: PalettePreference) => {
    const palette = resolvePalette(preference)
    setState({ preference, palette })
    setPaletteCookie(preference)
    document.documentElement.dataset.palette = palette
  }, [])

  const value = useMemo(
    () => ({ ...state, defaultPalette, availablePalettes, setPreference }),
    [state, defaultPalette, availablePalettes, setPreference]
  )

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
}

export function usePalette() {
  return useContext(PaletteContext)
}
