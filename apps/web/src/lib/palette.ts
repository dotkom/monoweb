import { TZDate } from "@date-fns/tz"
import { secondsInDay } from "date-fns/constants"

/**
 * Color palettes, applied as `data-palette` on <html>. Each one except "classic" has a stylesheet in src/palettes.
 * src/palettes/pink.css is disabled for now, add "pink" here and import it in globals.css to bring it back.
 */
export const PALETTES = ["classic", "halloween"] as const

export type Palette = (typeof PALETTES)[number]

/** What the user picks. "default" follows whatever the site's default palette currently is */
export const PALETTE_PREFERENCES = ["default", ...PALETTES] as const

export type PalettePreference = (typeof PALETTE_PREFERENCES)[number]

export const DEFAULT_PALETTE_PREFERENCE = "default" satisfies PalettePreference

const FALLBACK_PALETTE = "classic" satisfies Palette

/** Palettes that are only available part of the year. While one is available, it is also the default */
const SEASONAL_PALETTES: Partial<Record<Palette, (date: TZDate) => boolean>> = {
  // TODO: All of October while debugging, should be October 26th through November 1st:
  // (date.getMonth() === 9 && date.getDate() >= 26) || (date.getMonth() === 10 && date.getDate() === 1)
  halloween: (date) => date.getMonth() === 9,
}

export const PALETTE_COOKIE_NAME = "palette"

const PALETTE_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

function isPaletteAvailable(palette: Palette, now: Date) {
  const isInSeason = SEASONAL_PALETTES[palette]
  return isInSeason === undefined || isInSeason(new TZDate(now, "Europe/Oslo"))
}

export function getAvailablePalettes(now = new Date()): Palette[] {
  return PALETTES.filter((palette) => isPaletteAvailable(palette, now))
}

export function getDefaultPalette(now = new Date()): Palette {
  const seasonal = Object.keys(SEASONAL_PALETTES) as Palette[]
  return seasonal.find((palette) => isPaletteAvailable(palette, now)) ?? FALLBACK_PALETTE
}

/** The palette to apply. Picking a palette that isn't available right now falls back to the default */
export function resolvePalette(preference: PalettePreference, now = new Date()): Palette {
  if (preference !== "default" && isPaletteAvailable(preference, now)) {
    return preference
  }
  return getDefaultPalette(now)
}

export function parsePaletteCookie(value: string | undefined): PalettePreference {
  return PALETTE_PREFERENCES.find((preference) => preference === value) ?? DEFAULT_PALETTE_PREFERENCE
}

export function setPaletteCookie(preference: PalettePreference) {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${PALETTE_COOKIE_NAME}=${preference}; path=/; max-age=${PALETTE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
