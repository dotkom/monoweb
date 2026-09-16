import { type FormatDistanceFn, formatDistanceStrict, isAfter, type Locale } from "date-fns"
import { nb } from "date-fns/locale"

const formatCompactDistance: FormatDistanceFn = (token, count, options) => {
  let result: string

  switch (token) {
    case "xSeconds": {
      result = "<1 min"
      break
    }

    case "xMinutes": {
      result = `${count} min`
      break
    }

    case "xHours": {
      result = `${count}t`
      break
    }

    case "xDays": {
      result = `${count}d`
      break
    }

    case "xMonths": {
      result = `${count} mnd`
      break
    }

    case "xYears": {
      result = `${count} år`
      break
    }

    default: {
      return nb.formatDistance(token, count, options)
    }
  }

  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return `om ${result}`
    }

    return `${result} siden`
  }

  return result
}

export const compactNbLocale: Locale = {
  ...nb,
  formatDistance: formatCompactDistance,
}

export function formatCompactDistanceToNow(date: Date, now: Date = new Date()): string {
  return formatDistanceStrict(date, now, {
    addSuffix: true,
    locale: compactNbLocale,
    roundingMethod: "round",
  })
}

export function formatCompactTimeUntil(date: Date, now: Date = new Date()): string {
  if (!isAfter(date, now)) {
    return "Nå"
  }

  return formatDistanceStrict(date, now, {
    locale: compactNbLocale,
    roundingMethod: "round",
  })
}
