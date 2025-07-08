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
      <Icon icon="tabler:users" className="text-base text-slate-9" />

      <div
        className={cn(
          "flex flex-row gap-1 items-center",
          (justAttendanceClosed || isReserved || isUnreserved) && "px-1 py-0.5 rounded-md",
          justAttendanceClosed && "bg-slate-2",
          isReserved && (inPast ? "bg-green-2" : "bg-green-4"),
          isUnreserved && (inPast ? "bg-yellow-2" : "bg-yellow-3")
        )}
      >
        <Text
          className={cn(
            "text-sm",
            attendanceStatus === "NotOpened" && "text-slate-9",
            isReserved ? "text-green-9" : isUnreserved ? "text-yellow-8" : null,
            inPast ? (isReserved ? "text-green-6" : isUnreserved ? "text-yellow-6" : "text-slate-9") : null
          )}
        >
          {numberOfAttendees}
          {hasCapacity && `/${capacity}`}
        </Text>

        {justAttendanceClosed ? (
          <Icon icon="tabler:lock" className="text-slate-8 text-sm" />
        ) : isReserved ? (
          <Icon icon="tabler:check" className={cn("text-green-9 text-sm", inPast && "text-green-5")} />
        ) : isUnreserved ? (
          <Icon icon="tabler:clock" className={cn("text-yellow-9 text-sm", inPast && "text-yellow-5")} />
        ) : null}
      </div>

      {attendanceStatus === "NotOpened" && (
        <>
          <div className="w-1 h-1 bg-slate-9 rounded-full" />
          <Text className="text-sm">
            Åpner {attendance ? formatDistanceToNow(attendance.registerStart, { locale: nb, addSuffix: true }) : ""}
          </Text>
        </>
      )}
    </div>
  )
}
