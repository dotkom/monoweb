import { daysBetweenNow } from "./daysBetween"
import { formatRelativeTime } from "./formatRelativeTime"

export const DEFAULT_DAYS_RELATIVE_THRESHOLD = 3
export const DEFAULT_LOCALE = "nb-NO"

const DEFAULT_INTL_DATE_FORMAT_OPTIONS = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
} satisfies Intl.DateTimeFormatOptions

const DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS = {
  weekday: "long",
} satisfies Intl.DateTimeFormatOptions

const DEFAULT_INTL_TIME_FORMAT_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
} satisfies Intl.DateTimeFormatOptions

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
} satisfies Record<string, Intl.DateTimeFormatOptions>

/**
 * Formats a date into a string representation. If the date is within the date threshold, the date will be formatted as a relative date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.forceAbsolute - Whether the date will always be formatted as an absolute date.
 * @param options.includeTime - Whether to include the time in the formatted date.
 * @param options.includeWeekday - Whether to include the weekday in the formatted date.
 * @param options.locale - The locale to use for formatting. Defaults to `nb-NO`.
 * @param options.relativeDateThresholdDays - The number of days to use as a threshold for relative date formatting. Defaults to `3`.
 * @returns The formatted date string.
 */
export const formatDate = (
  date: Date,
  options?: {
    forceAbsolute?: boolean
    includeTime?: boolean
    includeWeekday?: boolean
    locale?: Intl.LocalesArgument
    relativeDateThresholdDays?: number
  }
): string => {
  const daysThreshold = options?.relativeDateThresholdDays ?? DEFAULT_DAYS_RELATIVE_THRESHOLD
  const locale = options?.locale ?? DEFAULT_LOCALE

  if (options?.forceAbsolute !== true && daysThreshold > Math.abs(daysBetweenNow(date))) {
    return formatRelativeTime(date, { locale })
  }

  const format = {
    ...DEFAULT_INTL_DATE_FORMAT_OPTIONS,
    ...(options?.includeWeekday && DEFAULT_INTL_WEEKDAY_FORMAT_OPTIONS),
    ...(options?.includeTime && DEFAULT_INTL_TIME_FORMAT_OPTIONS),
  }

  return new Intl.DateTimeFormat(locale, format).format(date)
}
