import { secondsInDay } from "date-fns/constants"

/** Color palettes, applied as `data-palette` on <html>. Each one except "classic" has a stylesheet in src/palettes */
export const PALETTES = ["classic", "halloween"] as const

export type Palette = (typeof PALETTES)[number]

export const DEFAULT_PALETTE = "classic" satisfies Palette

export const PALETTE_COOKIE_NAME = "palette"

const PALETTE_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export function parsePaletteCookie(value: string | undefined): Palette {
  return PALETTES.find((palette) => palette === value) ?? DEFAULT_PALETTE
}

export function setPaletteCookie(palette: Palette) {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${PALETTE_COOKIE_NAME}=${palette}; path=/; max-age=${PALETTE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
