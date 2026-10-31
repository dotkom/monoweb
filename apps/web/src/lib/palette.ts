import { TZDate } from "@date-fns/tz"
import { secondsInDay } from "date-fns/constants"

export const PALETTES = ["classic", "halloween"] as const

export type Palette = (typeof PALETTES)[number]

export const PALETTE_PREFERENCES = ["default", ...PALETTES] as const

export type PalettePreference = (typeof PALETTE_PREFERENCES)[number]

export const DEFAULT_PALETTE_PREFERENCE = "default" satisfies PalettePreference

export const PALETTE_COOKIE_NAME = "palette"

const PALETTE_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export function getDefaultPalette(now = new Date()): Palette {
  const date = new TZDate(now, "Europe/Oslo")
  return (date.getMonth() === 9 && date.getDate() >= 26) || (date.getMonth() === 10 && date.getDate() <= 4)
    ? "halloween"
    : "classic"
}

export function getAvailablePalettes(now = new Date()): Palette[] {
  return getDefaultPalette(now) === "halloween" ? ["classic", "halloween"] : ["classic"]
}

export function resolvePalette(preference: PalettePreference, now = new Date()): Palette {
  if (preference !== "default" && getAvailablePalettes(now).includes(preference)) {
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
