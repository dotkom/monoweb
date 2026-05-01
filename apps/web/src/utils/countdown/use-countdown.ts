"use client"

import { addSeconds, differenceInSeconds, intervalToDuration, isPast, secondsToMilliseconds } from "date-fns"
import { useEffect, useRef, useState } from "react"

export type CountdownFormatterData =
  | "NOW"
  | {
      years: number
      months: number
      days: number
      hours: number
      minutes: number
      seconds: number
    }

type CountdownFormatter<T> = (countdown: CountdownFormatterData) => T

/**
 * Ticks once per second until `deadline`. The `formatter` is always the latest passed in (stored in a ref) so the
 * timer is only reset when `deadline` changes — module-level formatters like `formatTimeLeft` are optional, not required.
 */
// biome-ignore lint/suspicious/noExplicitAny: This should be any
export function useCountdown<Formatter extends CountdownFormatter<any> = CountdownFormatter<string>>(
  deadline: Date | null,
  formatter: Formatter = formatTimeLeft as Formatter
): ReturnType<Formatter> | null {
  const formatterReference = useRef(formatter)
  formatterReference.current = formatter

  const initialCountdownValue = deadline && formatter(getFormatterData(deadline))
  const [countdown, setCountdown] = useState<ReturnType<Formatter> | null>(initialCountdownValue)

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
      const data = getFormatterData(deadline, now)

      setCountdown(formatterReference.current(data))

      if (data === "NOW") {
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
    return formatterReference.current("NOW")
  }

  return countdown
}

function getFormatterData(target: Date, now: Date = new Date()): CountdownFormatterData {
  // This ceils the target date to the nearest full second
  // If you don't do this the countdown will be up to one second less than it should be unless the target date is without milliseconds
  // This is because `intervalToDuration` ignores milliseconds
  const secondsDiff = differenceInSeconds(target, now, { roundingMethod: "ceil" })

  // A negative end will probably break the duration, so we no-op
  if (secondsDiff <= 0) {
    return "NOW"
  }

  const end = addSeconds(now, secondsDiff)
  const duration = intervalToDuration({ start: now, end })

  const years = duration.years ?? 0
  const months = duration.months ?? 0
  const days = duration.days ?? 0
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  const seconds = duration.seconds ?? 0

  return { years, months, days, hours, minutes, seconds }
}

export function zeroPad(n: number, digits = 2) {
  return n.toString().padStart(digits, "0")
}

export function formatTimeLeft(countdown: CountdownFormatterData): string {
  if (countdown === "NOW") {
    return "Nå"
  }

  if (countdown.years) {
    return `${countdown.years} år`
  }

  if (countdown.months) {
    return `${countdown.months} måned${countdown.months !== 1 ? "er" : ""}`
  }

  if (countdown.days) {
    return `${countdown.days} dag${countdown.days !== 1 ? "er" : ""}`
  }

  if (countdown.hours) {
    return `${zeroPad(countdown.hours)}:${zeroPad(countdown.minutes)}:${zeroPad(countdown.seconds)}`
  }

  return `${zeroPad(countdown.minutes)}:${zeroPad(countdown.seconds)}`
}
