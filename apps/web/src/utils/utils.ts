import { intervalToDuration } from "date-fns"
import { useEffect, useState } from "react"

export function zeroPad(n: number, digits = 2) {
  return n.toString().padStart(digits, "0")
}

export function formatTimeLeft(target: Date) {
  const now = new Date()
  const duration = intervalToDuration({ start: now, end: target })

  const days = duration.days ?? 0
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  const seconds = duration.seconds ?? 0

  if (!hours && !days) {
    return `${zeroPad(minutes)}:${zeroPad(seconds)}`
  }

  if (!days) {
    return `${hours}:${zeroPad(minutes)}:${zeroPad(seconds)}`
  }

  return `${days} dager`
}

export function useCountdown(deadline: Date | null) {
  const [deadlineCountdown, setDeadlineCountdown] = useState<string | null>(null)

  useEffect(() => {
    if (!deadline) {
      return
    }
    setDeadlineCountdown(formatTimeLeft(deadline))
    const interval = setInterval(() => {
      setDeadlineCountdown(formatTimeLeft(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (deadline && deadline < new Date()) {
    return "nå"
  }

  return deadlineCountdown
}
