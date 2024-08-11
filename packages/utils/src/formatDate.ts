import { differenceInDays, format, formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"

const DEFAULT_DAYS_RELATIVE_THRESHOLD = 3
const DATE_FORMAT = "dd.MM.yyyy"
const TIME_FORMAT = "HH:mm"
const WEEKDAY_FORMAT = "EEEE"

const getFormat = (options?: { includeTime?: boolean; includeWeekday?: boolean }) => {
  const weekday = options?.includeWeekday ? WEEKDAY_FORMAT : ""
  const time = options?.includeTime ? TIME_FORMAT : ""
  return `${weekday} ${DATE_FORMAT} ${time}`.trim()
}

/**
 * Formats a date into a string representation. If the date is within the date threshold, the date will be formatted as a relative date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.forceAbsolute - If set to true, the date will always be formatted using the `formatRemainingTime` function.
 * @param options.includeSeconds - If set to true, and if the date is within the date threshold, the formatted time will include seconds near 1 minute.
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
    includeSeconds?: boolean
    includeWeekday?: boolean
    locale?: Locale
    relativeDateThresholdDays?: number
  }
): string => {
  const daysDifference = differenceInDays(new Date(), date)
  const daysThreshold = options?.relativeDateThresholdDays ?? DEFAULT_DAYS_RELATIVE_THRESHOLD

  if (options?.forceAbsolute !== true && daysThreshold > Math.abs(daysDifference)) {
    return formatRemainingTime(date, options)
  }

  return format(date, getFormat(options), { locale: options?.locale ?? nb })
}

/**
 * Formats the remaining time from the given date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.locale - The locale to use for formatting. Defaults to `nb`.
 * @returns The formatted remaining time.
 */
export const formatRemainingTime = (date: Date, options?: { locale?: Locale }) =>
  formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: options?.locale ?? nb,
  })
