"use client"

import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { type Attendance, getAttendanceCapacity, getReservedAttendeeCount } from "@dotkomonline/types"
import { Icon, Text, cn } from "@dotkomonline/ui"
import { formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

interface EventListItemAttendanceStatusProps {
  attendance: Attendance
  reservedStatus: boolean | null
  eventEndInPast: boolean
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({
  attendance,
  reservedStatus,
  eventEndInPast,
}) => {
  const attendanceStatus = getAttendanceStatus(attendance)
  const isReserved = reservedStatus === true
  const isUnreserved = reservedStatus === false
  const numberOfAttendees = getReservedAttendeeCount(attendance)
  const capacity = getAttendanceCapacity(attendance)

  const justAttendanceClosed = attendanceStatus === "Closed" && !isReserved && !isUnreserved && !eventEndInPast
  const inPast = attendanceStatus === "Closed" || eventEndInPast

  const hasCapacity = capacity > 0

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2",
        (inPast || attendanceStatus === "NotOpened") &&
          "text-gray-600 dark:text-stone-700 group-hover:text-gray-800 dark:group-hover:text-stone-500"
      )}
    >
      <Icon
        icon="tabler:users"
        className={cn("text-sm md:text-base", !inPast && "text-gray-800 dark:text-stone-500")}
      />

      <div
        className={cn(
          "flex flex-row gap-1 items-center",
          attendanceStatus === "NotOpened" && "text-gray-500 dark:text-stone-500",
          (justAttendanceClosed || isReserved || isUnreserved) && "px-1 py-0.5 rounded-md",
          justAttendanceClosed && ["bg-gray-100 dark:bg-stone-800", "text-gray-700 dark:text-stone-300"],
          isReserved &&
            (inPast
              ? ["bg-green-50 dark:bg-green-950/50", "text-green-500/50 dark:text-green-800"]
              : ["bg-green-100 dark:bg-green-950", "text-green-700 dark:text-green-300"]),
          isUnreserved &&
            (inPast
              ? ["bg-yellow-50 dark:bg-yellow-950/50", "text-yellow-500/50 dark:text-yellow-800"]
              : ["bg-yellow-100 dark:bg-yellow-950", "text-yellow-700 dark:text-yellow-300"])
        )}
      >
        <Text className="text-xs md:text-sm">
          {numberOfAttendees}
          {hasCapacity && `/${capacity}`}
        </Text>

        {justAttendanceClosed ? (
          <Icon icon="tabler:lock" className="text-sm" />
        ) : isReserved ? (
          <Icon icon="tabler:check" className="text-sm" />
        ) : isUnreserved ? (
          <Icon icon="tabler:clock" className="text-sm" />
        ) : null}
      </div>

      {attendanceStatus === "NotOpened" && (
        <Text className="hidden md:block text-sm text-black dark:text-stone-400">
          {/* TODO: remove this locale */}
          Åpner {formatDistanceToNowStrict(attendance.registerStart, { addSuffix: true, locale: nb })}
        </Text>
      )}
    </div>
  )
}
