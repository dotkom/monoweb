"use client"

import { compareAsc, differenceInMilliseconds, isAfter } from "date-fns"
import { useEffect, useState } from "react"

function getMillisecondsUntilNextDeadline(deadlineTimes: (number | undefined)[], now = Date.now()): number | null {
  const upcomingDeadlineTimes = deadlineTimes
    .filter((deadlineTime): deadlineTime is number => deadlineTime !== undefined)
    .filter((deadlineTime) => isAfter(deadlineTime, now))
    .sort(compareAsc)

  if (upcomingDeadlineTimes.length === 0) {
    return null
  }

  // Browsers clamp overflowing timeouts to a few milliseconds.
  return Math.min(differenceInMilliseconds(upcomingDeadlineTimes[0], now) + 50, 2 ** 31 - 1)
}

export const useDeadlineTick = (...deadlines: (Date | null | undefined)[]) => {
  const [tick, setTick] = useState(0)
  const deadlineTimesKey = JSON.stringify(deadlines.map((deadline) => deadline?.getTime() ?? null))

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to re-run the effect when the tick changes
  useEffect(() => {
    const deadlineTimes: (number | null)[] = JSON.parse(deadlineTimesKey)
    const delay = getMillisecondsUntilNextDeadline(deadlineTimes.map((deadlineTime) => deadlineTime ?? undefined))

    if (delay === null) {
      return
    }

    const timeout = setTimeout(() => {
      setTick((currentTick) => currentTick + 1)
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [deadlineTimesKey, tick])

  return tick
}
