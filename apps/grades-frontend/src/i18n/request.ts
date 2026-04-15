import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { DEFAULT_LOCALE } from "./locale"

// biome-ignore lint/style/noDefaultExport: required by next-intl
export default getRequestConfig(async () => {
  const store = await cookies()
  const locale = store.get("locale")?.value || DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
