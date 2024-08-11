import { differenceInDays, formatDistanceToNowStrict } from "date-fns"
import { nb, enUS } from "date-fns/locale"

const DEFAULT_DAYS_RELATIVE_THRESHOLD = 3
const DEFAULT_LOCALE = "nb-NO"

const dateFNSLocaleFromIntlLocale = {
  "nb-NO": nb,
  "en-US": enUS,
} as const

type SupportedLocales = keyof typeof dateFNSLocaleFromIntlLocale

/**
 * Formats a date into a string representation. If the date is within the date threshold, the date will be formatted as a relative date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.forceAbsolute - If set to true, the date will always be formatted using the `formatRemainingTime` function.
 * @param options.includeTime - If set to true, the time will be included in the formatted date.
 * @param options.includeWeekday - If set to true, the weekday will be included in the formatted date.
 * @param options.locale - The locale to use for formatting. Defaults to `nb`.
 * @param options.relativeDateThresholdDays -
 *        The number of days to use as a threshold for relative date formatting. Defaults to `3`.
 *        If the difference between the current date and the provided date is greater than this threshold,
 *        the date will be formatted using the `formatRemainingTime` function.
 * @returns The formatted date string.
 */
export const formatDate = (
  date: Date,
  options?: {
    forceAbsolute?: boolean
    includeTime?: boolean
    includeWeekday?: boolean
    locale?: SupportedLocales
    relativeDateThresholdDays?: number
  }
): string => {
  const daysDifference = differenceInDays(new Date(), date)
  const daysThreshold = options?.relativeDateThresholdDays ?? DEFAULT_DAYS_RELATIVE_THRESHOLD
  const locale = options?.locale ?? DEFAULT_LOCALE

  if (options?.forceAbsolute !== true && daysThreshold > Math.abs(daysDifference)) {
    return formatRemainingTime(date, { locale })
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(options?.includeWeekday && { weekday: "long" }),
    ...(options?.includeTime && { hour: "2-digit", minute: "2-digit" }),
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(date)
}

/**
 * Formats the remaining time from the given date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.locale - The locale to use for formatting. Defaults to `nb`.
 * @returns The formatted remaining time.
 */
export const formatRemainingTime = (date: Date, options?: { locale?: SupportedLocales }) =>
  formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: options?.locale && dateFNSLocaleFromIntlLocale[options.locale],
  })
