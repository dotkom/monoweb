import { type Locale, locales } from "./routing"

export const LOCALE_PREFERENCE_COOKIE = "locale"

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value)
}

export function readLocalePreference(cookies: { get: (name: string) => { value: string } | undefined }): Locale | null {
  const explicit = cookies.get(LOCALE_PREFERENCE_COOKIE)?.value
  if (isLocale(explicit)) {
    return explicit
  }

  return null
}

export function setLocalePreferenceCookie(locale: Locale) {
  // biome-ignore lint/suspicious/noDocumentCookie: preference must be visible to the next proxy request
  document.cookie = `${LOCALE_PREFERENCE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
