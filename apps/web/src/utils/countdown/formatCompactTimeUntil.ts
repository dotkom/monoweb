import {
  differenceInMilliseconds,
  type FormatDistanceFn,
  formatDistanceStrict,
  isAfter,
  type Locale,
  secondsToMilliseconds,
} from "date-fns"
import {
  millisecondsInDay,
  millisecondsInHour,
  millisecondsInMinute,
  minutesInDay,
  minutesInHour,
  minutesInMonth,
} from "date-fns/constants"
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

const MINIMUM_COMPACT_LABEL_DELAY_MILLISECONDS = secondsToMilliseconds(1)

export function formatCompactTimeUntil(date: Date, now: Date = new Date()): string {
  if (!isAfter(date, now)) {
    return "Nå"
  }

  return formatDistanceStrict(date, now, {
    locale,
    roundingMethod: "round",
  })
}

export function getMillisecondsUntilNextCompactTimeUntilChange(target: Date, now: Date): number | null {
  if (!isAfter(target, now)) {
    return null
  }

  const remainingMilliseconds = differenceInMilliseconds(target, now)
  const remainingMinutes = remainingMilliseconds / millisecondsInMinute

  if (remainingMinutes < 1) {
    return remainingMilliseconds
  }

  if (remainingMinutes < minutesInHour) {
    return getDelayUntilNextRoundedThreshold(remainingMinutes, 1, millisecondsInMinute)
  }

  if (remainingMinutes < minutesInDay) {
    return getDelayUntilNextRoundedThreshold(remainingMinutes / minutesInHour, 1, millisecondsInHour)
  }

  if (remainingMinutes < minutesInMonth) {
    return getDelayUntilNextRoundedThreshold(remainingMinutes / minutesInDay, 1, millisecondsInDay)
  }

  return millisecondsInHour
}

function getDelayUntilNextRoundedThreshold(
  remainingUnits: number,
  unitMinimum: number,
  millisecondsPerUnit: number
): number {
  const roundedUnits = Math.round(remainingUnits)
  const nextRoundingBoundary = roundedUnits - 0.5
  const nextThreshold = Math.max(nextRoundingBoundary, unitMinimum)
  const delayMilliseconds = (remainingUnits - nextThreshold) * millisecondsPerUnit

  if (delayMilliseconds < MINIMUM_COMPACT_LABEL_DELAY_MILLISECONDS) {
    return MINIMUM_COMPACT_LABEL_DELAY_MILLISECONDS
  }

  return delayMilliseconds
}
