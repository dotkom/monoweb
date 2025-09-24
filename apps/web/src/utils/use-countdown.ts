"use client"

import { addSeconds, differenceInSeconds, intervalToDuration, isPast, secondsToMilliseconds } from "date-fns"
import { useEffect, useState } from "react"

function zeroPad(n: number, digits = 2) {
  return n.toString().padStart(digits, "0")
}

const NOW_VALUE = "nå" as const

export function formatTimeLeft(target: Date, now: Date = new Date()) {
  // This ceils the target date to the nearest full second
  // If you don't do this the countdown will be up to one second less than it should be unless the target date is without milliseconds
  // This is because `intervalToDuration` ignores milliseconds
  const secondsDiff = differenceInSeconds(target, now, { roundingMethod: "ceil" })

  // A negative end will probably break the duration, so we no-op
  if (secondsDiff <= 0) {
    return NOW_VALUE
  }

  const end = addSeconds(now, secondsDiff)
  const duration = intervalToDuration({ start: now, end })

  const years = duration.years ?? 0
  const months = duration.months ?? 0
  const days = duration.days ?? 0
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  const seconds = duration.seconds ?? 0

  if (years) {
    return `${years} år`
  }

  if (months) {
    return `${months} måned${months !== 1 ? "er" : ""}`
  }

  if (days) {
    return `${days} dag${days !== 1 ? "er" : ""}`
  }

  if (hours) {
    return `${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`
  }

  return `${zeroPad(minutes)}:${zeroPad(seconds)}`
}

export function useCountdown(deadline: Date | null) {
  const initialCountdownValue = deadline && !isPast(deadline) ? formatTimeLeft(deadline) : NOW_VALUE
  const [countdown, setCountdown] = useState(initialCountdownValue)

  useEffect(() => {
    if (!deadline || isPast(deadline)) {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    const destroy = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (intervalId) {
        clearInterval(intervalId)
      }
    }

    const tickCountdown = (now?: Date) => {
      const nextCountdown = formatTimeLeft(deadline, now)
      setCountdown(nextCountdown)
      if (nextCountdown === NOW_VALUE) {
        destroy()
      }
    }

    const now = new Date()
    const millisecondOffset = (deadline.getTime() - now.getTime()) % 1000
    tickCountdown(now)

    // This timeout will align the countdown to the same millisecond as the deadline
    // Meaning that 00:10 will be exactly 10 seconds before the deadline, to the millisecond
    timeoutId = setTimeout(() => {
      tickCountdown()

      intervalId = setInterval(() => {
        tickCountdown()
      }, secondsToMilliseconds(1))
    }, millisecondOffset)

    return () => {
      destroy()
    }
  }, [deadline])

  if (deadline && isPast(deadline)) {
    return NOW_VALUE
  }

  return countdown
}
