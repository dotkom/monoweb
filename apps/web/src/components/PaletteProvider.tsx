"use client"

import { DEFAULT_PALETTE, type Palette, setPaletteCookie } from "@/lib/palette"
import { createContext, type FC, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"

interface PaletteContextValue {
  palette: Palette
  setPalette: (palette: Palette) => void
}

/** Used outside a provider, e.g. in the global error page */
const FALLBACK_CONTEXT: PaletteContextValue = {
  palette: DEFAULT_PALETTE,
  setPalette: () => {},
}

const PaletteContext = createContext<PaletteContextValue>(FALLBACK_CONTEXT)

/**
 * Holds the selected color palette. The server renders `data-palette` on <html> from the cookie, so switching only
 * has to update the attribute and the cookie for the next request.
 */
export const PaletteProvider: FC<PropsWithChildren<{ initialPalette: Palette }>> = ({ initialPalette, children }) => {
  const [palette, setPaletteState] = useState(initialPalette)

  const setPalette = useCallback((next: Palette) => {
    setPaletteState(next)
    setPaletteCookie(next)
    document.documentElement.dataset.palette = next
  }, [])

  const value = useMemo(() => ({ palette, setPalette }), [palette, setPalette])

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
}

export function usePalette() {
  return useContext(PaletteContext)
}
