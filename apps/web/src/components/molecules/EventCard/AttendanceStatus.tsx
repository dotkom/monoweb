import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import type { Attendance } from "@dotkomonline/types"
import { Icon, Text, cn } from "@dotkomonline/ui"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

const getAttendeeCountAndCapacity = (attendance: Attendance): [number, number] => {
  return attendance.pools.reduce(
    ([attendeeCount, capacity], pool) => [attendeeCount + pool.numAttendees, capacity + pool.capacity],
    [0, 0]
  )
}

interface EventListItemAttendanceStatusProps {
  attendance: Attendance | null
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
  startInPast: boolean
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({
  attendance,
  attendeeStatus,
  startInPast,
}) => {
  if (attendance === null) {
    return null
  }

  const attendanceStatus = getAttendanceStatus(attendance)
  const isReserved = attendeeStatus === "RESERVED"
  const isUnreserved = attendeeStatus === "UNRESERVED"

  const [numberOfAttendees, capacity] = getAttendeeCountAndCapacity(attendance)

  const justAttendanceClosed = attendanceStatus === "Closed" && !isReserved && !isUnreserved && !startInPast
  const inPast = attendanceStatus === "Closed" || startInPast

  const hasCapacity = capacity > 0

  return (
    <div className="flex flex-row items-center gap-2">
      <Icon icon="tabler:users" className="text-base text-gray-800" />

      <div
        className={cn(
          "flex flex-row gap-1 items-center",
          (justAttendanceClosed || isReserved || isUnreserved) && "px-1 py-0.5 rounded-md",
          justAttendanceClosed && "bg-gray-100",
          isReserved && (inPast ? "bg-green-100" : "bg-green-300"),
          isUnreserved && (inPast ? "bg-yellow-100" : "bg-yellow-200")
        )}
      >
        <Text
          className={cn(
            "text-sm",
            attendanceStatus === "NotOpened" && "text-gray-800",
            isReserved ? "text-green-800" : isUnreserved ? "text-yellow-700" : null,
            inPast ? (isReserved ? "text-green-500" : isUnreserved ? "text-yellow-500" : "text-gray-800") : null
          )}
        >
          {numberOfAttendees}
          {hasCapacity && `/${capacity}`}
        </Text>

        {justAttendanceClosed ? (
          <Icon icon="tabler:lock" className="text-gray-700 text-sm" />
        ) : isReserved ? (
          <Icon icon="tabler:check" className={cn("text-green-800 text-sm", inPast && "text-green-400")} />
        ) : isUnreserved ? (
          <Icon icon="tabler:clock" className={cn("text-yellow-800 text-sm", inPast && "text-yellow-400")} />
        ) : null}
      </div>

      {attendanceStatus === "NotOpened" && (
        <>
          <div className="w-1 h-1 bg-gray-800 rounded-full" />
          <Text className="text-sm">
            Åpner {attendance ? formatDistanceToNow(attendance.registerStart, { locale: nb, addSuffix: true }) : ""}
          </Text>
        </>
      )}
    </div>
  )
}
