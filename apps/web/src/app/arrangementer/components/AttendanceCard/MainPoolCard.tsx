import { useCountdown } from "@/utils/use-countdown"
import {
  type Attendance,
  type Attendee,
  type User,
  findActiveMembership,
  getAttendablePool,
  getAttendee,
  getAttendeeQueuePosition,
  getReservedAttendeeCount,
  getUnreservedAttendeeCount,
} from "@dotkomonline/types"
import { Icon, Text, Title, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@dotkomonline/ui"
import { formatDate, formatDistanceToNowStrict, interval, isFuture, isWithinInterval, subMinutes } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import type { FC } from "react"

const DelayPill = ({ mergeDelayHours, className }: { mergeDelayHours: number | null; className?: string }) => {
  const content = mergeDelayHours
    ? `Denne gruppen får plasser ${mergeDelayHours} timer etter påmeldingsstart`
    : "Denne påmeldingsgruppen kan få plasser senere"

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div
            className={cn("flex items-center gap-0.5 px-1 rounded-md bg-gray-300/50 dark:bg-stone-700/50", className)}
          >
            <Icon icon="tabler:clock" className="text-sm" />
            <Text className="text-xs">{mergeDelayHours ? `${mergeDelayHours}t` : "TBD"}</Text>
          </div>
        </TooltipTrigger>
        <TooltipContent className="font-normal">
          <Text>{content}</Text>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface MainPoolCardProps {
  attendance: Attendance
  user: User | null
  authorizeUrl: string
}

export const MainPoolCard: FC<MainPoolCardProps> = ({ attendance, user, authorizeUrl }) => {
  const attendee = getAttendee(attendance, user)
  const paymentCountdown = useCountdown(attendee?.paymentDeadline ?? null)

  const cardClassname = cn(
    "flex flex-col w-full min-h-[10rem] gap-2 p-3 rounded-lg",
    "items-center text-center justify-center",
    "bg-gray-100 dark:bg-stone-800"
  )

  if (!user) {
    return (
      <Link href={authorizeUrl} className={cardClassname}>
        <Text>Du er ikke innlogget</Text>

        <div className="flex flex-row gap-1 items-center">
          <Text>Logg inn</Text>
          <Icon icon="tabler:arrow-up-right" className="text-base" />
        </div>
      </Link>
    )
  }

  const membership = findActiveMembership(user)

  if (!membership && !attendee) {
    return (
      <div className={cardClassname}>
        <Text>Du har ikke registert medlemskap</Text>
        <div className="flex gap-[0.5ch] text-sm">
          <Text>Gå til</Text>
          <Link href="/profil" className="flex items-center text-blue-800 dark:text-blue-400 hover:underline">
            <Text>profilsiden</Text> <Icon icon="tabler:arrow-up-right" className="text-base" />
          </Link>
          <Text>for å registrere deg</Text>
        </div>
      </div>
    )
  }

  const pool = getAttendablePool(attendance, user)

  if (!pool) {
    return (
      <div className={cardClassname}>
        <Text>Du kan ikke melde deg på dette arrangementet</Text>
      </div>
    )
  }

  const unreservedAttendeeCount = getUnreservedAttendeeCount(attendance, pool.id)
  const reservedAttendeeCount = getReservedAttendeeCount(attendance, pool.id)
  const hasWaitlist = unreservedAttendeeCount > 0

  const servingPunishment = attendee?.earliestReservationAt && isFuture(attendee.earliestReservationAt)

  const now = new Date()
  const countdownText = useCountdown(attendance.registerStart)
  const countdownInterval = interval(subMinutes(attendance.registerStart, 15), attendance.registerStart)

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-lg",
        !attendee && "bg-gray-100 dark:bg-stone-800",
        attendee?.reserved === true && "bg-green-100 dark:bg-green-900",
        attendee?.reserved === false && "bg-yellow-100 dark:bg-yellow-800"
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-2 px-3 py-2 rounded-t-lg justify-center text-sm font-bold",
          !attendee && "bg-gray-200 dark:bg-stone-700/50",
          attendee?.reserved === true && "bg-green-200 dark:bg-green-800",
          attendee?.reserved === false && "bg-yellow-200 dark:bg-yellow-700"
        )}
      >
        <Title element="p" className="text-base">
          {pool.title}
        </Title>

        {pool.mergeDelayHours && pool.mergeDelayHours > 0 && (
          <DelayPill
            mergeDelayHours={pool.mergeDelayHours}
            className={cn(
              attendee?.reserved === true && "bg-green-300/50 dark:bg-green-700/50",
              attendee?.reserved === false && "bg-yellow-300/50 dark:bg-yellow-600/50"
            )}
          />
        )}
      </div>

      <div className="flex flex-col min-h-[10rem] gap-2 p-3 rounded-md items-center text-center justify-center w-full">
        <div className="flex grow flex-col gap-2 items-center text-center justify-center">
          <Text suppressHydrationWarning>{paymentCountdown}</Text>
          {isWithinInterval(now, countdownInterval) && !attendee ? (
            <>
              <Text>{pool.capacity > 0 ? `${pool.capacity} plasser` : "Påmelding"} åpner om</Text>
              <Text className="text-4xl font-medium tabular-nums">{countdownText}</Text>
            </>
          ) : (
            <>
              <Text
                className={cn(
                  "text-3xl px-2 py-1",
                  hasWaitlist && attendee?.reserved && "bg-green-200 dark:bg-green-800 rounded-lg"
                )}
              >
                {reservedAttendeeCount}
                {/* Don't show capacity for merge pools (capacity = 0) */}
                {pool.capacity > 0 && `/${pool.capacity}`}
              </Text>

              {hasWaitlist && (
                <Text
                  className={cn(
                    "text-lg px-2 py-0.5",
                    attendee?.reserved === false && "bg-yellow-200 dark:bg-yellow-700 rounded-lg"
                  )}
                >
                  +{unreservedAttendeeCount} i kø
                </Text>
              )}

              {!servingPunishment && <Text>{getAttendanceStatusText(attendance, attendee)}</Text>}

              {servingPunishment && (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-row gap-1 items-center mt-2 px-2 py-0.5 rounded-lg",
                          attendee.reserved === true
                            ? "bg-green-300/25 dark:bg-green-700/25"
                            : attendee.reserved === false
                              ? "bg-yellow-300/25 dark:bg-yellow-600/25"
                              : "bg-gray-300/25 dark:bg-stone-700/25"
                        )}
                      >
                        <Icon icon="tabler:clock-hour-2" className="text-base" />
                        <Text className={cn("text-sm")}>
                          {formatDistanceToNowStrict(attendee.earliestReservationAt, { locale: nb })} utsettelse
                        </Text>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="font-normal">
                      Utsettelsen varer til{" "}
                      {formatDate(attendee.earliestReservationAt, "eeee dd. MMM yyyy 'kl.' HH:mm:ss", { locale: nb })}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const getAttendanceStatusText = (attendance: Attendance, attendee: Attendee | null) => {
  if (!attendee) {
    return "Du er ikke påmeldt"
  }

  if (attendee.reserved === true) {
    return "Du er påmeldt"
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)

  // Should never happen, but just in case
  if (!queuePosition) {
    return "Du er i køen"
  }

  return `Du er ${queuePosition}. i køen`
}
