"use client"

import { addDays, addHours, addMinutes, differenceInMilliseconds, max, min } from "date-fns"
import { millisecondsInDay, millisecondsInHour, millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useEffect, useState } from "react"
import { formatCompactDistanceToNow } from "./formatCompactTimeUntil"

const minimumDelayMilliseconds = millisecondsInSecond
const maximumDelayMilliseconds = millisecondsInHour

function getMillisecondsUntilNextCompactDistanceChange(date: Date, now: Date): number {
  const earlierDate = min([date, now])
  const laterDate = max([date, now])
  const elapsedMilliseconds = differenceInMilliseconds(laterDate, earlierDate)

  if (elapsedMilliseconds < millisecondsInMinute) {
    const nextChangeAt = addMinutes(earlierDate, 1)

    return differenceInMilliseconds(nextChangeAt, laterDate)
  }

  if (elapsedMilliseconds < millisecondsInHour) {
    const elapsedMinutes = elapsedMilliseconds / millisecondsInMinute
    const nextRoundingBoundaryMinutes = Math.floor(elapsedMinutes + 0.5) + 0.5
    const nextRoundingAt = addMinutes(earlierDate, nextRoundingBoundaryMinutes)
    const nextHourAt = addHours(earlierDate, 1)
    const nextChangeAt = min([nextRoundingAt, nextHourAt])

    return differenceInMilliseconds(nextChangeAt, laterDate)
  }

  if (elapsedMilliseconds < millisecondsInDay) {
    const elapsedHours = elapsedMilliseconds / millisecondsInHour
    const nextRoundingBoundaryHours = Math.floor(elapsedHours + 0.5) + 0.5
    const nextRoundingAt = addHours(earlierDate, nextRoundingBoundaryHours)
    const nextDayAt = addDays(earlierDate, 1)
    const nextChangeAt = min([nextRoundingAt, nextDayAt])

    return differenceInMilliseconds(nextChangeAt, laterDate)
  }

  return maximumDelayMilliseconds
}

function getClampedDelayMilliseconds(date: Date, now: Date): number {
  const delayMilliseconds = Math.ceil(getMillisecondsUntilNextCompactDistanceChange(date, now))

  if (delayMilliseconds < minimumDelayMilliseconds) {
    return minimumDelayMilliseconds
  }

  if (delayMilliseconds > maximumDelayMilliseconds) {
    return maximumDelayMilliseconds
  }

  return delayMilliseconds
}

export function useCompactRelativeTime(date: Date): string {
  const dateTimestamp = date.getTime()
  const [relativeTime, setRelativeTime] = useState(() => formatCompactDistanceToNow(date))

  useEffect(() => {
    const dateValue = new Date(dateTimestamp)

    const updateRelativeTime = () => {
      setRelativeTime(formatCompactDistanceToNow(dateValue))
    }

    updateRelativeTime()

    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleNextUpdate = () => {
      const delayMilliseconds = getClampedDelayMilliseconds(dateValue, new Date())

      timeoutId = setTimeout(() => {
        updateRelativeTime()
        scheduleNextUpdate()
      }, delayMilliseconds)
    }

    scheduleNextUpdate()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [dateTimestamp])

  return relativeTime
}
