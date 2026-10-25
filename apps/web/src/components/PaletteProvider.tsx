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
  /** What the user picked, which may be "default" */
  preference: PalettePreference
  /** The palette actually applied */
  palette: Palette
  /** What "default" currently resolves to */
  defaultPalette: Palette
  /** Palettes that can be picked right now */
  availablePalettes: Palette[]
  setPreference: (preference: PalettePreference) => void
}

/** Used outside a provider, e.g. in the global error page, where there's nothing to pick */
const FALLBACK_CONTEXT: PaletteContextValue = {
  preference: DEFAULT_PALETTE_PREFERENCE,
  palette: "classic",
  defaultPalette: "classic",
  availablePalettes: ["classic"],
  setPreference: () => {},
}

const PaletteContext = createContext<PaletteContextValue>(FALLBACK_CONTEXT)

/** Everything date-dependent is resolved on the server, so the client doesn't disagree with it around midnight */
interface PaletteProviderProps {
  initialPreference: PalettePreference
  initialPalette: Palette
  defaultPalette: Palette
  availablePalettes: Palette[]
}

/**
 * Holds the selected color palette. The server renders `data-palette` on <html> from the cookie, so switching only
 * has to update the attribute and the cookie for the next request.
 */
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
