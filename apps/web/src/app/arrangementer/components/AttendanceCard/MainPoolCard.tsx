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
  hasAttendeePaid,
} from "@dotkomonline/types"
import { Stripes, Text, Title, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@dotkomonline/ui"
import {
  IconArrowForward,
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconClockHour2,
  IconCoins,
  IconUserX,
  IconX,
} from "@tabler/icons-react"
import {
  formatDate,
  formatDistanceToNowStrict,
  interval,
  isFuture,
  isWithinInterval,
  roundToNearestHours,
  subMinutes,
} from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import type { FC } from "react"

interface MainPoolCardProps {
  attendance: Attendance
  user: User | null
  authorizeUrl: string
  chargeScheduleDate?: Date | null
}

export const MainPoolCard: FC<MainPoolCardProps> = ({ attendance, user, authorizeUrl, chargeScheduleDate }) => {
  const now = new Date()
  const attendee = getAttendee(attendance, user)

  const registerCountdownText = useCountdown(attendance.registerStart)
  const registerCountdownInterval = interval(subMinutes(attendance.registerStart, 15), attendance.registerStart)
  const isWithinRegisterCountdown = isWithinInterval(now, registerCountdownInterval)
  const showRegisterCountdown = isWithinRegisterCountdown && !attendee

  const paymentCountdownText = useCountdown(attendee?.paymentDeadline ?? null)
  const paymentCountdownInterval =
    attendee?.createdAt && attendee.paymentDeadline ? interval(attendee.createdAt, attendee.paymentDeadline) : null
  const isWithinPaymentCountdown =
    paymentCountdownInterval && hasAttendeePaid(attendance, attendee) === false
      ? isWithinInterval(now, paymentCountdownInterval)
      : false
  const showPaymentCountdown = isWithinPaymentCountdown && attendee?.paymentLink != null

  const cardClassname = cn(
    "flex flex-col w-full min-h-[10rem] gap-2 p-3 rounded-lg",
    "items-center text-center justify-center",
    "bg-gray-100 dark:bg-stone-700"
  )

  if (!user) {
    return (
      <Link href={authorizeUrl} prefetch={false} className={cardClassname}>
        <div className="flex flex-col gap-2">
          <Text>Du er ikke innlogget</Text>

          <div className="flex flex-row gap-1 items-center">
            <Text>Logg inn</Text>
            <IconArrowUpRight className="h-[1.25em] w-[1.25em]" />
          </div>

          {attendance.attendancePrice && attendance.attendancePrice > 0 && (
            <div className="mt-4">
              <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            </div>
          )}
        </div>
      </Link>
    )
  }

  const membership = findActiveMembership(user)

  if (!membership && !attendee) {
    return (
      <div className={cardClassname}>
        <div className="flex flex-col gap-2">
          <Text>Du har ikke registert medlemskap</Text>

          <div className="flex gap-[0.5ch] text-sm">
            <Text>Gå til</Text>
            <Link href="/profil" className="flex items-center text-blue-800 dark:text-blue-400 hover:underline">
              <Text>profilsiden</Text> <IconArrowUpRight className="h-[1.25em] w-[1.25em]" />
            </Link>
            <Text>for å registrere deg</Text>
          </div>

          {attendance.attendancePrice && attendance.attendancePrice > 0 && (
            <div className="mt-4">
              <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            </div>
          )}
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

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-lg",
        !attendee && "bg-gray-100 dark:bg-stone-700/50",
        attendee?.reserved === true && "bg-green-100 dark:bg-green-900",
        attendee?.reserved === false && "bg-yellow-100 dark:bg-indigo-900/75"
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-2 px-3 py-2 rounded-t-lg justify-center text-sm font-bold",
          !attendee && "bg-gray-200 dark:bg-stone-700",
          attendee?.reserved === true && "bg-green-200 dark:bg-green-800",
          attendee?.reserved === false && "bg-yellow-200 dark:bg-indigo-900"
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
              attendee?.reserved === false && "bg-yellow-300/50 dark:bg-indigo-700/50"
            )}
          />
        )}
      </div>

      <div className="flex flex-col min-h-[10rem] gap-6 p-3 rounded-lg items-center text-center justify-center w-full">
        {!showRegisterCountdown && (
          <div className="flex grow flex-col gap-4 items-center text-center justify-center">
            <div className="flex flex-col gap-1 items-center">
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
                    "text-lg px-1 py-0.5",
                    attendee?.reserved === false && "bg-yellow-200 dark:bg-indigo-800 rounded-lg"
                  )}
                >
                  +{unreservedAttendeeCount} i kø
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {servingPunishment ? (
                <PunishmentStatus attendee={attendee} />
              ) : (
                <AttendanceStatus attendance={attendance} attendee={attendee} />
              )}
              <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            </div>
          </div>
        )}

        {showRegisterCountdown && (
          <div className="flex flex-col gap-1 items-center">
            <Text>{pool.capacity > 0 ? `${pool.capacity} plasser` : "Påmelding"} åpner om</Text>
            <Text className="text-4xl font-medium tabular-nums" suppressHydrationWarning>
              {registerCountdownText}
            </Text>
          </div>
        )}

        {showPaymentCountdown && attendee?.paymentLink && (
          <Link href={attendee.paymentLink} className="group relative cursor-pointer items-center w-full">
            <Stripes
              colorA={cn("dark:bg-amber-600", attendee.reserved !== false ? "bg-amber-200" : "bg-indigo-200")}
              colorB={cn("dark:bg-amber-700", attendee.reserved !== false ? "bg-amber-300" : "bg-indigo-300")}
              stripeWidth={24}
              speed="2.0s"
              animated
              className="group flex items-center h-[10rem] px-5 py-4 rounded-md"
            >
              <div className="relative flex flex-row justify-between items-center w-full">
                <div className="flex flex-col gap-1 items-center justify-center w-full">
                  <Text className="text-lg font-medium">Du må betale innen</Text>
                  <Text suppressHydrationWarning className="text-4xl font-medium tabular-nums">
                    {paymentCountdownText}
                  </Text>
                </div>
                <IconArrowUpRight className="h-[1.25em] w-[1.25em] [@media(min-width:350px)]:absolute [@media(min-width:350px)]:right-0" />
              </div>
            </Stripes>

            {/* White/dark overlay */}
            <span
              className={cn(
                "absolute top-0 left-0 inset-0 rounded-md bg-gradient-to-t pointer-events-none transition-colors duration-400",
                "from-white/50 via-white/30 group-hover:via-white/5 group-hover:from-white/15 to-transparent",
                "dark:from-black/50 dark:via-black/30 dark:group-hover:via-black/5 dark:group-hover:from-black/15 dark:to-transparent"
              )}
            />
          </Link>
        )}
      </div>
    </div>
  )
}

interface DelayPillProps {
  mergeDelayHours: number | null
  className?: string
}

const DelayPill = ({ mergeDelayHours, className }: DelayPillProps) => {
  const content = mergeDelayHours
    ? `Denne gruppen får plasser ${mergeDelayHours} timer etter påmeldingsstart`
    : "Denne påmeldingsgruppen kan få plasser senere"

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div
            className={cn("flex items-center gap-0.5 px-1 rounded-md bg-gray-300/50 dark:bg-stone-600/75", className)}
          >
            <IconClock className="h-[1.25em] w-[1.25em]" />
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

interface AttendanceStatusProps {
  attendance: Attendance
  attendee: Attendee | null
}

const AttendanceStatus = ({ attendance, attendee }: AttendanceStatusProps) => {
  if (!attendee) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconUserX className="h-[1.25em] w-[1.25em]" />
        <Text>Du er ikke påmeldt</Text>
      </div>
    )
  }

  if (attendee.reserved === true) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconCheck className="h-[1.25em] w-[1.25em] text-green-700 dark:text-green-400" />
        <Text>Du er påmeldt</Text>
      </div>
    )
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)

  return (
    <div className="flex flex-row items-center gap-2">
      <IconClockHour2 className="h-[1.25em] w-[1.25em] dark:text-indigo-400" />
      <Text>Du er {queuePosition !== null && `${queuePosition}. `}i køen</Text>
    </div>
  )
}

interface PaymentStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
}

const PaymentStatus = ({ attendance, attendee, chargeScheduleDate }: PaymentStatusProps) => {
  const hasPaid = hasAttendeePaid(attendance, attendee)

  if (!attendance.attendancePrice || hasPaid === null) {
    return null
  }

  if (!attendee) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconCoins className="h-[1.25em] w-[1.25em]" />
        <Text>{attendance.attendancePrice} kr</Text>
      </div>
    )
  }

  if (!hasPaid) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconX className="h-[1.25em] w-[1.25em] text-red-700 dark:text-red-400" />
        <Text>{attendance.attendancePrice} kr ubetalt</Text>
      </div>
    )
  }

  if (attendee.paymentChargedAt) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconCheck className="h-[1.25em] w-[1.25em] text-green-700 dark:text-green-400" />
        <Text>Du har betalt {attendance.attendancePrice} kr</Text>
      </div>
    )
  }

  if (attendee.paymentReservedAt) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconCheck className="h-[1.25em] w-[1.25em] text-green-700 dark:text-green-400" />

        <div className="flex flex-col gap-0 items-start">
          <Text>Du har reservert {attendance.attendancePrice} kr</Text>

          {chargeScheduleDate && (
            <Text className="text-xs">
              Du blir trukket rundt{" "}
              {formatDate(roundToNearestHours(chargeScheduleDate), "dd. MMM 'kl.' HH", { locale: nb })}
            </Text>
          )}
        </div>
      </div>
    )
  }

  if (attendee.paymentRefundedAt) {
    return (
      <div className="flex flex-row items-center gap-2">
        <IconArrowForward className="h-[1.25em] w-[1.25em]" />
        <Text>Du er refundert {attendance.attendancePrice} kr</Text>
      </div>
    )
  }

  return null
}

interface PunishmentStatusProps {
  attendee: Attendee
}

const PunishmentStatus = ({ attendee }: PunishmentStatusProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex flex-row gap-2 items-center">
            <IconClockHour2 className="h-[1.25em] w-[1.25em]" />
            <Text>{formatDistanceToNowStrict(attendee.earliestReservationAt, { locale: nb })} utsettelse</Text>
          </div>
        </TooltipTrigger>
        <TooltipContent className="font-normal">
          Utsettelsen varer til{" "}
          {formatDate(attendee.earliestReservationAt, "eeee dd. MMM yyyy 'kl.' HH:mm:ss", { locale: nb })}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
