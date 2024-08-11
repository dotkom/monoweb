const DEFAULT_LOCALE = "nb-NO"

const ONE_YEAR_MS = 31_536_000_000
const ONE_MONTH_MS = 2_592_000_000
const ONE_WEEK_MS = 604_800_000
const ONE_DAY_MS = 86_400_000
const ONE_HOUR_MS = 3_600_000
const ONE_MINUTE_MS = 60_000
const ONE_SECOND_MS = 1_000

const getRelativeTimeValueAndUnit = (value: number): [number, Intl.RelativeTimeFormatUnit] => {
  const difference = Math.abs(value)

  if (difference < ONE_MINUTE_MS) {
    return [Math.floor(value / ONE_SECOND_MS), "second"]
  }
  if (difference < ONE_HOUR_MS) {
    return [Math.floor(value / ONE_MINUTE_MS), "minute"]
  }
  if (difference < ONE_DAY_MS) {
    return [Math.floor(value / ONE_HOUR_MS), "hour"]
  }
  if (difference < ONE_WEEK_MS) {
    return [Math.floor(value / ONE_DAY_MS), "day"]
  }
  if (difference < ONE_MONTH_MS) {
    return [Math.floor(value / ONE_WEEK_MS), "week"]
  }
  if (difference < ONE_YEAR_MS) {
    return [Math.floor(value / ONE_MONTH_MS), "month"]
  }

  return [Math.floor(value / ONE_YEAR_MS), "year"]
}

/**
 * Formats the remaining time from the given date.
 *
 * @param date - The date to format.
 * @param options - Optional formatting options.
 * @param options.locale - The locale to use for formatting. Defaults to `nb-NO`.
 * @returns The formatted remaining time.
 */
export const formatRemainingTime = (date: Date, options?: { locale?: Intl.LocalesArgument }) => {
  const [value, unit] = getRelativeTimeValueAndUnit(date.getTime() - Date.now())
  const locale = options?.locale ?? DEFAULT_LOCALE
  return new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "long" }).format(value, unit)
}
