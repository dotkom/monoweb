import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { DEFAULT_LOCALE, type Locale } from "./locale"

// biome-ignore lint/style/noDefaultExport: required by next-intl
export default getRequestConfig(async () => {
  const store = await cookies()

  const storedLocale = store.get("locale")?.value
  const locale: Locale = storedLocale === "no" || storedLocale === "en" ? storedLocale : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
