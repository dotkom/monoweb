import { defineRouting } from "next-intl/routing"

export const locales = ["no", "en"] as const
export type Locale = (typeof locales)[number]

export const DEFAULT_LOCALE: Locale = "no"

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Don't add a prefix for "no" which is the default locale
  localePrefix: "as-needed",

  // Preference is owned by the locale switcher, not by whichever URL was last served
  localeCookie: false,
  localeDetection: false,
})
