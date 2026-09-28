"use client"

import { useEffect, useState } from "react"

function getMillisecondsUntilNextDeadline(deadlineTimes: (number | undefined)[], now = Date.now()): number | null {
  const upcomingDeadlineTimes = deadlineTimes
    .filter((deadlineTime): deadlineTime is number => deadlineTime !== undefined)
    .filter((deadlineTime) => deadlineTime > now)
    .sort((left, right) => left - right)

  if (upcomingDeadlineTimes.length === 0) {
    return null
  }

  return upcomingDeadlineTimes[0] - now + 50
}

export const useDeadlineTick = (
  firstDeadline: Date | null | undefined,
  secondDeadline: Date | null | undefined = null
) => {
  const [tick, setTick] = useState(0)
  const firstDeadlineTime = firstDeadline?.getTime()
  const secondDeadlineTime = secondDeadline?.getTime()

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to re-run the effect when the tick changes
  useEffect(() => {
    const delay = getMillisecondsUntilNextDeadline([firstDeadlineTime, secondDeadlineTime])

    if (delay === null) {
      return
    }

    const timeout = setTimeout(() => {
      setTick((currentTick) => currentTick + 1)
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [firstDeadlineTime, secondDeadlineTime, tick])

  return tick
}
