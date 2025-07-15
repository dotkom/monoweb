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
  eventEndInPast: boolean
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({
  attendance,
  attendeeStatus,
  eventEndInPast,
}) => {
  if (attendance === null) {
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
      <Icon icon="tabler:users" className={cn("text-base", !inPast && "text-gray-800 dark:text-stone-500")} />

      <div
        className={cn(
          "flex flex-row gap-1 items-center transition-colors",
          (justAttendanceClosed || isReserved || isUnreserved) && "px-1 py-0.5 rounded-md",
          justAttendanceClosed && [
            "bg-gray-100 group-hover:bg-gray-200 dark:bg-stone-800 dark:group-hover:bg-stone-700",
            "text-gray-700 dark:text-stone-300",
          ],
          isReserved &&
            (inPast
              ? [
                  "bg-green-50 group-hover:bg-green-100 dark:bg-green-950/50 dark:group-hover:bg-green-950",
                  "text-green-500/50 group-hover:text-green-500 dark:text-green-800 dark:group-hover:text-green-700",
                ]
              : [
                  "bg-green-100 group-hover:bg-green-200 dark:bg-green-950 dark:group-hover:bg-green-900",
                  "text-green-700 dark:text-green-300",
                ]),
          isUnreserved &&
            (inPast
              ? [
                  "bg-yellow-50 group-hover:bg-yellow-100 dark:bg-yellow-950/50 dark:group-hover:bg-yellow-950",
                  "text-yellow-500/50 group-hover:text-yellow-500 dark:text-yellow-800 dark:group-hover:text-yellow-700",
                ]
              : [
                  "bg-yellow-100 group-hover:bg-yellow-200 dark:bg-yellow-950 dark:group-hover:bg-yellow-900",
                  "text-yellow-700 dark:text-yellow-300",
                ])
        )}
      >
        <Text className="text-sm">
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
