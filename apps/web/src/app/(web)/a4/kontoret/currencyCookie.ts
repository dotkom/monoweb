import { secondsInDay } from "date-fns/constants"
import { Currencies, type CurrenciesType } from "./currencyConverter"

export const CURRENCY_COOKIE_NAME = "chosenCurrency"

const CURRENCY_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export const DEFAULT_CURRENCY = "NOK" satisfies CurrenciesType

export const parseCurrencyCookie = (value: string | undefined): CurrenciesType => {
  const parsed = Currencies.safeParse(value)
  return parsed.success ? parsed.data : DEFAULT_CURRENCY
}

export const setCurrencyCookie = (currency: CurrenciesType) => {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${CURRENCY_COOKIE_NAME}=${currency}; path=/; max-age=${CURRENCY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
