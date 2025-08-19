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
import type { FC, ReactNode } from "react"

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

interface CardProps {
  classNames?: { outer?: string; inner?: string; title?: string }
  title?: ReactNode
  children: ReactNode
}

const Card: FC<CardProps> = ({ classNames, children, title }) => {
  const baseOuterClassName = "flex flex-col w-full bg-gray-100 dark:bg-stone-800 rounded-lg"
  const baseHeaderClassName =
    "flex flex-row gap-2 px-3 py-2 bg-gray-200 dark:bg-stone-700/50 rounded-t-lg justify-center text-sm font-bold"
  const baseInnerClassName =
    "flex flex-col min-h-[10rem] gap-2 p-3 rounded-md items-center text-center justify-center w-full"

  if (!title) {
    return <section className={cn(baseOuterClassName, baseInnerClassName, classNames?.inner)}>{children}</section>
  }

  return (
    <section className={cn(baseOuterClassName, classNames?.outer)}>
      <div className={cn(baseHeaderClassName, classNames?.title)}>{title}</div>
      <div className={cn(baseInnerClassName, "rounded-b-lg", classNames?.inner)}>{children}</div>
    </section>
  )
}

const DelayPill = ({ mergeDelayHours, className }: { mergeDelayHours: number | null; className?: string }) => {
  const content = mergeDelayHours ? (
    <Text>Denne gruppen får plasser {mergeDelayHours} timer etter påmeldingsstart</Text>
  ) : (
    <Text>Denne påmeldingsgruppen kan få plasser senere</Text>
  )

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
        <TooltipContent className="font-normal">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface MainPoolCardProps {
  attendance: Attendance
  user: User | null
}

export const MainPoolCard: FC<MainPoolCardProps> = ({ attendance, user }) => {
  if (!user) {
    return (
      <Card>
        <Text>Du er ikke innlogget</Text>
      </Card>
    )
  }

  const membership = findActiveMembership(user)
  const attendee = getAttendee(attendance, user)

  if (!membership && !attendee) {
    return (
      <Card>
        <Text>Du har ikke registert medlemskap</Text>
        <div className="flex gap-[0.5ch] text-sm">
          <Text>Gå til</Text>
          <Link href="/profil" className="flex items-center text-blue-800 dark:text-blue-400 hover:underline">
            <Text>profilsiden</Text> <Icon icon="tabler:arrow-up-right" className="text-base" />
          </Link>
          <Text>for å registrere deg</Text>
        </div>
      </Card>
    )
  }

  const pool = getAttendablePool(attendance, user)

  if (!pool) {
    return (
      <Card>
        <Text>Du kan ikke melde deg på dette arrangementet</Text>
      </Card>
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
    <Card
      classNames={{
        outer: attendee?.reserved
          ? "bg-green-100 dark:bg-green-900"
          : attendee?.reserved === false
            ? "bg-yellow-100 dark:bg-yellow-800"
            : undefined,
        title: attendee?.reserved
          ? "bg-green-200 dark:bg-green-800"
          : attendee?.reserved === false
            ? "bg-yellow-200 dark:bg-yellow-700"
            : undefined,
      }}
      title={
        <>
          <Title element="p" className="text-base">
            {pool.title}
          </Title>
          {pool.mergeDelayHours && pool.mergeDelayHours > 0 && (
            <DelayPill
              mergeDelayHours={pool.mergeDelayHours}
              className={cn(
                attendee?.reserved
                  ? "bg-green-300/50 dark:bg-green-700/50"
                  : attendee?.reserved === false
                    ? "bg-yellow-300/50 dark:bg-yellow-600/50"
                    : undefined
              )}
            />
          )}
        </>
      }
    >
      <div className="flex grow flex-col gap-2 items-center text-center justify-center">
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
    </Card>
  )
}
