export const locales = ["no", "en"] as const
export type Locale = (typeof locales)[number]

export const DEFAULT_LOCALE: Locale = "no"
