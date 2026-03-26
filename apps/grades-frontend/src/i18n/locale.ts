export const locales = ["no", "en"] as const
export type Locale = (typeof locales)[number]
