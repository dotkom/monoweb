"use client"

import { getMillisecondsUntilNextCompactTimeUntilChange } from "@/utils/countdown/formatCompactTimeUntil"
import { differenceInMilliseconds, isAfter, min } from "date-fns"
import { useEffect, useState } from "react"

const MAX_TIMEOUT_MILLISECONDS = 2_147_483_647

interface AttendanceClockDeadlines {
  registerStart: Date
  registerEnd: Date
  deregisterDeadline: Date
}

export function useAttendanceClock(attendance: AttendanceClockDeadlines): Date {
  const [now, setNow] = useState(() => new Date())

  const registerStartTime = attendance.registerStart.getTime()
  const registerEndTime = attendance.registerEnd.getTime()
  const deregisterDeadlineTime = attendance.deregisterDeadline.getTime()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const scheduleNextUpdate = () => {
      const currentDate = new Date()
      const upcomingDeadlines = [
        new Date(registerStartTime),
        new Date(registerEndTime),
        new Date(deregisterDeadlineTime),
      ].filter((deadline) => isAfter(deadline, currentDate))

      const compactLabelDelayMilliseconds = getMillisecondsUntilNextCompactTimeUntilChange(
        new Date(registerStartTime),
        currentDate
      )

      if (compactLabelDelayMilliseconds !== null) {
        upcomingDeadlines.push(new Date(currentDate.getTime() + compactLabelDelayMilliseconds))
      }

      if (upcomingDeadlines.length === 0) {
        return
      }

      const nextUpdateAt = min(upcomingDeadlines)
      const delayMilliseconds = Math.min(
        Math.max(differenceInMilliseconds(nextUpdateAt, currentDate), 1),
        MAX_TIMEOUT_MILLISECONDS
      )

      timeoutId = setTimeout(() => {
        setNow(new Date())
        scheduleNextUpdate()
      }, delayMilliseconds)
    }

    scheduleNextUpdate()

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [registerStartTime, registerEndTime, deregisterDeadlineTime])

  return now
}
