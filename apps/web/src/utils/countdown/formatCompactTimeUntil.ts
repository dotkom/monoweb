import { type FormatDistanceFn, formatDistanceStrict, isAfter, type Locale } from "date-fns"
import { nb } from "date-fns/locale"

const formatCompactDistance: FormatDistanceFn = (token, count) => {
  switch (token) {
    case "xSeconds": {
      return ">1 min"
    }

    case "xMinutes": {
      return `${count} min`
    }

    case "xHours": {
      return `${count}t`
    }

    case "xDays": {
      return `${count}d`
    }

    case "xMonths": {
      return `${count} mnd`
    }

    case "xYears": {
      return `${count} år`
    }

    default: {
      return nb.formatDistance(token, count)
    }
  }
}

const locale: Locale = {
  ...nb,
  formatDistance: formatCompactDistance,
}

export function formatCompactTimeUntil(date: Date, now: Date = new Date()): string {
  if (!isAfter(date, now)) {
    return "Nå"
  }

  return formatDistanceStrict(date, now, {
    locale,
    roundingMethod: "round",
  })
}
