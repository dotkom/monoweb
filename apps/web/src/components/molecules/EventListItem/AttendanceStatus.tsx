"use client"

import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import { formatCompactTimeUntil } from "@/utils/countdown/formatCompactTimeUntil"
import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { useCountdown } from "@/utils/countdown/use-countdown"
import { useCurrentTime } from "@/utils/use-current-time"
import {
  type AttendanceView,
  type AttendanceSummary,
  type Attendee,
  attendeeHasPendingCompletionDeadline,
  buildRegistrationAvailabilityCompletionView,
  getAttendanceCapacity,
  getRegisteredAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import { Text, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import {
  IconBan,
  IconCheck,
  IconCircleDashed,
  IconCircleDashedCheck,
  IconLockFilled,
  IconPennantFilled,
  IconUsers,
} from "@tabler/icons-react"
import { formatDistance, interval, isAfter, isWithinInterval } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

interface AttendanceStatusClassNames {
  root?: string
  count?: string
  lock?: string
  deadline?: string
  notOpened?: string
}

interface EventListItemAttendanceStatusProps {
  attendance: AttendanceSummary | AttendanceView
  attendee: Attendee | null
  eventEndInPast: boolean
  size?: "default" | "sm" | "lg"
  classNames?: AttendanceStatusClassNames
}

export const AttendanceStatus: FC<EventListItemAttendanceStatusProps> = ({
  attendance,
  attendee,
  eventEndInPast,
  size = "default",
  classNames,
}) => {
  const currentTime = useCurrentTime()
  const attendanceStatus = getAttendanceStatus(attendance, currentTime)
  const completion = buildRegistrationAvailabilityCompletionView(attendance, attendee)
  const isRegistered = completion?.attendeeState === "REGISTERED"
  const isReserved = completion?.attendeeState === "RESERVED"
  const isQueued = completion?.attendeeState === "QUEUED"
  const isDelayed = isQueued && attendee !== null && isAfter(attendee.earliestReservationAt, currentTime)
  const hasSeat = isRegistered || isReserved
  const showRegistrationOpensSoon = attendanceStatus === "NOT_OPENED" && isAfter(attendance.registerStart, currentTime)
  const numberOfAttendees =
    "registeredAttendeeCount" in attendance
      ? attendance.registeredAttendeeCount
      : getRegisteredAttendeeCount(attendance)
  const capacity = getAttendanceCapacity(attendance)

  const showLock =
    !eventEndInPast &&
    !isQueued &&
    (hasSeat ? !isAfter(attendance.deregisterDeadline, currentTime) : attendanceStatus === "CLOSED")

  const completionCountdownText = useCountdown(completion?.completionDeadline ?? null, formatRollingCountdown)
  const completionCountdownInterval =
    attendee?.createdAt && completion?.completionDeadline
      ? interval(attendee.createdAt, completion.completionDeadline)
      : null
  const hasPendingCompletionDeadline = attendeeHasPendingCompletionDeadline(attendance, attendee)
  const isWithinCompletionCountdown =
    completionCountdownInterval && hasPendingCompletionDeadline
      ? isWithinInterval(currentTime, completionCountdownInterval)
      : false

  const completionDeadlineHasPassed =
    completion?.completionDeadline != null && isAfter(currentTime, completion.completionDeadline)

  const showCompletionCountdown =
    completion?.paymentLink != null &&
    hasPendingCompletionDeadline &&
    (isWithinCompletionCountdown || completionDeadlineHasPassed)

  const hasCapacity = capacity > 0

  const isSm = size === "sm"
  const isLg = size === "lg"
  const iconSizeClassName = isSm ? "size-3.5" : isLg ? "size-5" : "size-4"
  const textSizeClassName = isSm ? "text-xs" : isLg ? "text-sm md:text-base" : "text-xs md:text-sm"

  if (showRegistrationOpensSoon) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={cn("flex flex-row items-center gap-2", classNames?.root, classNames?.notOpened)}>
            <IconPennantFilled aria-hidden className={cn(iconSizeClassName, "text-gray-800 dark:text-stone-400")} />
            <Text className={cn(textSizeClassName, "tracking-wider")} suppressHydrationWarning>
              Om {formatCompactTimeUntil(attendance.registerStart, currentTime)}
            </Text>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <Text suppressHydrationWarning>
            Påmeldingen åpner{" "}
            {formatDistance(attendance.registerStart, currentTime, {
              locale: nb,
              addSuffix: true,
            })}
            .
          </Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2",
        (eventEndInPast || (showLock && !hasSeat && !isQueued)) &&
          "text-muted-foreground group-hover:text-gray-800 dark:group-hover:text-stone-400",
        classNames?.root
      )}
    >
      <IconUsers
        className={cn(
          iconSizeClassName,
          !(eventEndInPast || (showLock && !hasSeat && !isQueued)) && "text-gray-800 dark:text-stone-400"
        )}
      />

      <div className="flex flex-row gap-1">
        <div
          className={cn(
            "flex flex-row gap-1 items-center py-0.5",
            "tracking-wider",
            (hasSeat || isQueued) && "px-1 rounded-sm bg-gray-100 dark:bg-stone-700",
            isRegistered && "text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-950",
            isReserved && "text-yellow-900 bg-yellow-100 dark:text-yellow-100 dark:bg-[#614020]",
            isQueued && "text-indigo-800 bg-indigo-100 dark:text-indigo-100 dark:bg-indigo-600/25",
            classNames?.count
          )}
        >
          <Text className={textSizeClassName}>
            <span className="font-mono">{numberOfAttendees}</span>

            {hasCapacity && (
              <>
                /<span className="font-mono">{capacity}</span>
              </>
            )}
          </Text>

          {showLock && hasSeat ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className={cn("flex items-center", classNames?.lock)}>
                  <IconLockFilled aria-hidden className={iconSizeClassName} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <Text>Avmeldingsfristen er utgått</Text>
              </TooltipContent>
            </Tooltip>
          ) : isReserved ? (
            <IconCircleDashed className={iconSizeClassName} />
          ) : isRegistered ? (
            <IconCheck className={iconSizeClassName} />
          ) : isDelayed ? (
            <IconCircleDashed className={iconSizeClassName} />
          ) : isQueued ? (
            <IconCircleDashedCheck className={iconSizeClassName} />
          ) : null}
        </div>

        {showLock && !hasSeat && !isQueued && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className={cn("flex flex-row gap-1 items-center text-muted-foreground", classNames?.lock)}>
                <IconBan aria-hidden className={iconSizeClassName} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Påmeldingen er avsluttet</Text>
            </TooltipContent>
          </Tooltip>
        )}

        {showCompletionCountdown && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex flex-row gap-1 items-center px-1 py-0.5 rounded-sm text-red-900 bg-red-200 dark:text-red-100 dark:bg-red-600/50",
                  classNames?.deadline
                )}
              >
                <Text element="span" className={cn("tracking-wider", textSizeClassName)} suppressHydrationWarning>
                  {completionCountdownText}
                </Text>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <Text>Fullfør påmeldingen innen fristen for å beholde plassen din.</Text>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
