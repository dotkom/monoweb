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

const MINIMUM_COMPACT_LABEL_DELAY_MILLISECONDS = secondsToMilliseconds(1)

const formatCompactDistance: FormatDistanceFn = (token, count, options) => {
  let result: string

  switch (token) {
    case "xSeconds": {
      result = "<1m"
      break
    }

    case "xMinutes": {
      result = `${count}m`
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
