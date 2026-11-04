"use client"

import type { TZDate } from "@date-fns/tz"
import { getCurrentUTC } from "@dotkomonline/utils"
import { secondsToMilliseconds } from "date-fns"
import { useEffect, useState } from "react"

export function useCurrentTime(): TZDate {
  const [currentTime, setCurrentTime] = useState(getCurrentUTC())

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(getCurrentUTC())
    }

    updateCurrentTime()

    const intervalIdentifier = setInterval(updateCurrentTime, secondsToMilliseconds(1))

    return () => {
      clearInterval(intervalIdentifier)
    }
  }, [])

  return currentTime
}
