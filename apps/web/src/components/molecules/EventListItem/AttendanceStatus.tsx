"use client"

import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { useCountdown } from "@/utils/countdown/use-countdown"
import {
  type Attendance,
  type AttendanceSummary,
  type Attendee,
  getAttendanceCapacity,
  hasAttendeePaid,
  getReservedAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import { Text, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import { IconCheck, IconClock, IconClockDollar, IconLock, IconUsers } from "@tabler/icons-react"
import { formatDistanceToNowStrict, interval, isFuture, isWithinInterval } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

interface AttendanceStatusClassNames {
  root?: string
  count?: string
  lock?: string
  payment?: string
}

interface EventListItemAttendanceStatusProps {
  attendance: AttendanceSummary | Attendance
  attendee: Attendee | null
  eventEndInPast: boolean
  size?: "default" | "sm" | "lg"
  showNotOpenedLabel?: boolean
  classNames?: AttendanceStatusClassNames
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({
  attendance,
  attendee,
  eventEndInPast,
  size = "default",
  showNotOpenedLabel = true,
  classNames,
}) => {
  const attendanceStatus = getAttendanceStatus(attendance)
  const isReserved = attendee?.reserved === true
  const isUnreserved = attendee?.reserved === false
  const numberOfAttendees =
    "reservedAttendeeCount" in attendance ? attendance.reservedAttendeeCount : getReservedAttendeeCount(attendance)
  const capacity = getAttendanceCapacity(attendance)

  const showLock =
    !eventEndInPast &&
    (isReserved || isUnreserved ? !isFuture(attendance.deregisterDeadline) : attendanceStatus === "CLOSED")

  const paymentCountdownText = useCountdown(attendee?.paymentDeadline ?? null, formatRollingCountdown)
  const paymentCountdownInterval =
    attendee?.createdAt && attendee.paymentDeadline ? interval(attendee.createdAt, attendee.paymentDeadline) : null
  const isWithinPaymentCountdown =
    paymentCountdownInterval && hasAttendeePaid(attendee, attendance.attendancePrice) === false
      ? isWithinInterval(new Date(), paymentCountdownInterval)
      : false
  const showPaymentCountdown = isWithinPaymentCountdown && attendee?.paymentLink != null

  const hasCapacity = capacity > 0

  const isSm = size === "sm"
  const isLg = size === "lg"
  const iconClassName = isSm ? "size-3.5" : isLg ? "size-5" : "size-4"
  const labelClassName = isSm ? "text-xs" : isLg ? "text-sm md:text-base" : "text-xs md:text-sm"

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2",
        (eventEndInPast || attendanceStatus === "NOT_OPENED") &&
          "text-muted-foreground group-hover:text-gray-800 dark:group-hover:text-stone-400",
        classNames?.root
      )}
    >
      <IconUsers className={cn(iconClassName, !eventEndInPast && "text-gray-800 dark:text-stone-400")} />

      <div className="flex flex-row gap-1">
        <div
          className={cn(
            "flex flex-row gap-1 items-center py-0.5",
            "tracking-wider",
            attendanceStatus === "NOT_OPENED" && "text-muted-foreground",
            (isReserved || isUnreserved) && "px-1 rounded-sm bg-gray-100 dark:bg-stone-700",
            isReserved && "text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-950",
            isUnreserved && "text-amber-800 bg-amber-100 dark:text-amber-100 dark:bg-amber-600/25",
            classNames?.count
          )}
        >
          <Text className={labelClassName}>
            <span className="font-mono">{numberOfAttendees}</span>

            {hasCapacity && (
              <>
                /<span className="font-mono">{capacity}</span>
              </>
            )}
          </Text>

          {isReserved ? (
            <IconCheck className={iconClassName} />
          ) : isUnreserved ? (
            <IconClock className={iconClassName} />
          ) : null}
        </div>

        {showLock && (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex flex-row gap-1 items-center px-0.75 py-0.5",
                  "rounded-sm bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-200",
                  !isReserved && !isUnreserved && "ml-0.5",
                  classNames?.lock
                )}
              >
                <IconLock className={iconClassName} />
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
              <div
                className={cn(
                  "flex flex-row gap-1 items-center px-1 py-0.5 rounded-sm text-red-800 bg-red-100 dark:text-red-100 dark:bg-red-950",
                  classNames?.payment
                )}
              >
                <IconClockDollar className={iconClassName} />
                <span className={cn("tracking-wider", labelClassName)} suppressHydrationWarning>
                  {paymentCountdownText}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Du har ikke betalt for arrangementet.</Text>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {showNotOpenedLabel && attendanceStatus === "NOT_OPENED" && (
        <Text className="hidden md:block text-sm text-black dark:text-stone-300">
          Åpner {formatDistanceToNowStrict(attendance.registerStart, { addSuffix: true, locale: nb })}
        </Text>
      )}
    </div>
  )
}
