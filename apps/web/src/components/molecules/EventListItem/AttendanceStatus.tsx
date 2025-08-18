"use client"

import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { type Attendance, getAttendanceCapacity, getReservedAttendeeCount } from "@dotkomonline/types"
import { Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@dotkomonline/ui"
import { formatDistanceToNowStrict, isFuture } from "date-fns"
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

  const showLock =
    !eventEndInPast &&
    (isReserved || isUnreserved ? !isFuture(attendance.deregisterDeadline) : attendanceStatus === "Closed")

  const hasCapacity = capacity > 0

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2",
        (eventEndInPast || attendanceStatus === "NotOpened") &&
          "text-gray-600 dark:text-stone-700 group-hover:text-gray-800 dark:group-hover:text-stone-500"
      )}
    >
      <Icon
        icon="tabler:users"
        className={cn("text-sm md:text-base", !eventEndInPast && "text-gray-800 dark:text-stone-500")}
      />

      <div className="flex flex-row gap-1">
        <div
          className={cn(
            "flex flex-row gap-1 items-center",
            attendanceStatus === "NotOpened" && "text-gray-500 dark:text-stone-500",
            (isReserved || isUnreserved) && "px-1 py-0-5 rounded-md bg-gray-100 dark:bg-stone-800",
            isReserved && [
              "text-green-800 dark:text-green-200",
              !eventEndInPast && (showLock ? "bg-green-100 dark:bg-green-950" : "bg-green-200 dark:bg-green-900"),
            ],
            isUnreserved && [
              "text-amber-800 dark:text-amber-200",
              !eventEndInPast && (showLock ? "bg-amber-100 dark:bg-amber-600/25" : "bg-amber-200 dark:bg-amber-600/50"),
            ]
          )}
        >
          <Text className="text-xs md:text-sm">
            {numberOfAttendees}
            {hasCapacity && `/${capacity}`}
          </Text>

          {isReserved ? (
            <Icon icon="tabler:check" className="text-sm" />
          ) : isUnreserved ? (
            <Icon icon="tabler:clock" className="text-sm" />
          ) : null}
        </div>

        {showLock && (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={cn("px-1 rounded-md", "bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300")}
                >
                  <Icon icon="tabler:lock" className="text-sm" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <Text>{isReserved || isUnreserved ? "Avmeldingsfristen er utgått" : "Påmeldingen er avsluttet"}</Text>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {attendanceStatus === "NotOpened" && (
        <Text className="hidden md:block text-sm text-black dark:text-stone-400">
          Åpner {formatDistanceToNowStrict(attendance.registerStart, { addSuffix: true, locale: nb })}
        </Text>
      )}
    </div>
  )
}
