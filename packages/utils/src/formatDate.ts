import { differenceInDays, formatDistanceToNowStrict } from "date-fns"
import { nb, enUS } from "date-fns/locale"

const DEFAULT_DAYS_RELATIVE_THRESHOLD = 3
const DEFAULT_LOCALE = "nb-NO"

const DateFnsLocaleMap = {
  "nb-NO": nb,
  "en-US": enUS,
} as const

type SupportedLocales = keyof typeof DateFnsLocaleMap

const DEFAULT_INTL_DATE_FORMAT_OPTIONS = { day: "2-digit", month: "2-digit", year: "numeric" } as const
const DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS = { weekday: "long" } as const
const DEFAULT_INTL_TIME_FORMAT_OPTIONS = { hour: "2-digit", minute: "2-digit" } as const

export const IntlFormats = {
  Date: DEFAULT_INTL_DATE_FORMAT_OPTIONS,
  Time: DEFAULT_INTL_TIME_FORMAT_OPTIONS,
  Weekday: DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS,
  DateTime: { ...DEFAULT_INTL_DATE_FORMAT_OPTIONS, ...DEFAULT_INTL_TIME_FORMAT_OPTIONS },
  DateWeekday: { ...DEFAULT_INTL_DATE_FORMAT_OPTIONS, ...DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS },
  DateTimeWeekday: {
    ...DEFAULT_INTL_DATE_FORMAT_OPTIONS,
    ...DEFAULT_INTL_TIME_FORMAT_OPTIONS,
    ...DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS,
  },
} as const

/**
 * Formats a date into a string representation. If the date is within the date threshold, the date will be formatted as a relative date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.forceAbsolute - Whether the date will always be formatted as an absolute date.
 * @param options.includeTime - Whether to include the time in the formatted date.
 * @param options.includeWeekday - Whether to include the weekday in the formatted date.
 * @param options.locale - The locale to use for formatting. Defaults to `nb`.
 * @param options.relativeDateThresholdDays - The number of days to use as a threshold for relative date formatting. Defaults to `3`.
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

  const format = {
    ...DEFAULT_INTL_DATE_FORMAT_OPTIONS,
    ...(options?.includeWeekday && DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS),
    ...(options?.includeTime && DEFAULT_INTL_TIME_FORMAT_OPTIONS),
  }

  return new Intl.DateTimeFormat(locale, format).format(date)
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
    locale: options?.locale && DateFnsLocaleMap[options.locale],
  })
