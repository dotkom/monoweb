"use client"

import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { useCountdown } from "@/utils/use-countdown"
import {
  type Attendance,
  type Attendee,
  getAttendanceCapacity,
  getReservedAttendeeCount,
  hasAttendeePaid,
} from "@dotkomonline/types"
import { Text, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import { IconCheck, IconClock, IconClockDollar, IconLock, IconUsers } from "@tabler/icons-react"
import { interval, isWithinInterval } from "date-fns"
import { formatDistanceToNowStrict, isFuture } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

interface EventListItemAttendanceStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  eventEndInPast: boolean
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({ attendance, attendee, eventEndInPast }) => {
  const attendanceStatus = getAttendanceStatus(attendance)
  const isReserved = attendee?.reserved === true
  const isUnreserved = attendee?.reserved === false
  const numberOfAttendees = getReservedAttendeeCount(attendance)
  const capacity = getAttendanceCapacity(attendance)

  const showLock =
    !eventEndInPast &&
    (isReserved || isUnreserved ? !isFuture(attendance.deregisterDeadline) : attendanceStatus === "Closed")

  const paymentCountdownText = useCountdown(attendee?.paymentDeadline ?? null)
  const paymentCountdownInterval =
    attendee?.createdAt && attendee.paymentDeadline ? interval(attendee.createdAt, attendee.paymentDeadline) : null
  const isWithinPaymentCountdown =
    paymentCountdownInterval && hasAttendeePaid(attendance, attendee) === false
      ? isWithinInterval(new Date(), paymentCountdownInterval)
      : false
  const showPaymentCountdown = isWithinPaymentCountdown && attendee?.paymentLink != null

  const hasCapacity = capacity > 0

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2",
        (eventEndInPast || attendanceStatus === "NotOpened") &&
          "text-gray-600 dark:text-stone-300 group-hover:text-gray-800 dark:group-hover:text-stone-400"
      )}
    >
      <IconUsers className={cn("size-4", !eventEndInPast && "text-gray-800 dark:text-stone-400")} />

      <div className="flex flex-row gap-1">
        <div
          className={cn(
            "flex flex-row gap-1 items-center",
            attendanceStatus === "NotOpened" && "text-gray-500 dark:text-stone-400",
            (isReserved || isUnreserved) && "px-1 py-0-5 rounded-md bg-gray-100 dark:bg-stone-700",
            isReserved && "text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-950",
            isUnreserved && "text-amber-800 bg-amber-100 dark:text-amber-200 dark:bg-amber-600/25"
          )}
        >
          <Text className="text-xs md:text-sm">
            {numberOfAttendees}
            {hasCapacity && `/${capacity}`}
          </Text>

          {isReserved ? <IconCheck className="size-4" /> : isUnreserved ? <IconClock className="size-4" /> : null}
        </div>

        {showLock && (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div className="px-1 rounded-md bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-200">
                <IconLock className="size-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Text>{isReserved || isUnreserved ? "Avmeldingsfristen er utgått" : "Påmeldingen er avsluttet"}</Text>
            </TooltipContent>
          </Tooltip>
        )}

        {showPaymentCountdown && (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div className="flex flex-row gap-1 items-center px-1 rounded-md text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-950">
                <IconClockDollar className="size-4" />
                <Text className="text-xs md:text-sm tabular-nums" suppressHydrationWarning>
                  {paymentCountdownText}
                </Text>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Du har ikke betalt for arrangementet.</Text>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {attendanceStatus === "NotOpened" && (
        <Text className="hidden md:block text-sm text-black dark:text-stone-300">
          Åpner {formatDistanceToNowStrict(attendance.registerStart, { addSuffix: true, locale: nb })}
        </Text>
      )}
    </div>
  )
}
