"use client"

import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { useTRPC } from "@/utils/trpc/client"
import type { Attendance, AttendanceId } from "@dotkomonline/types"
import { Icon, Text, cn } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNowStrict } from "date-fns"
import type { FC } from "react"

const getAttendeeCountAndCapacity = (attendance: Attendance): [number, number] => {
  return attendance.pools.reduce(
    ([attendeeCount, capacity], pool) => [attendeeCount + pool.numAttendees, capacity + pool.capacity],
    [0, 0]
  )
}

interface EventListItemAttendanceStatusProps {
  attendanceId: AttendanceId | null
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
  eventEndInPast: boolean
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({
  attendanceId,
  attendeeStatus,
  eventEndInPast,
}) => {
  // TODO: This load should be handled by the parent, and preferably in batch on the server.
  const trpc = useTRPC()
  const { data: attendance } = useQuery({
    ...trpc.event.attendance.getAttendance.queryOptions({ id: attendanceId as string }),
    enabled: attendanceId !== null,
  })
  if (!attendance) {
    return null
  }
  const attendanceStatus = getAttendanceStatus(attendance)
  const isReserved = attendeeStatus === "RESERVED"
  const isUnreserved = attendeeStatus === "UNRESERVED"

  const [numberOfAttendees, capacity] = getAttendeeCountAndCapacity(attendance)

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
          Åpner {formatDistanceToNowStrict(attendance.registerStart, { addSuffix: true })}
        </Text>
      )}
    </div>
  )
}
