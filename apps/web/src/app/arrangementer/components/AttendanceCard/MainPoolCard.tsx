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
import {
  Icon,
  Stripes,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import { formatDate, formatDistanceToNowStrict, interval, isFuture, isWithinInterval, subMinutes } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import type { FC } from "react"

interface MainPoolCardProps {
  attendance: Attendance
  user: User | null
  authorizeUrl: string
}

export const MainPoolCard: FC<MainPoolCardProps> = ({ attendance, user, authorizeUrl }) => {
  const now = new Date()
  const attendee = getAttendee(attendance, user)

  const registerCountdownText = useCountdown(attendance.registerStart)
  const registerCountdownInterval = interval(subMinutes(attendance.registerStart, 15), attendance.registerStart)
  const isWithinRegisterCountdown = isWithinInterval(now, registerCountdownInterval)

  const paymentCountdownText = useCountdown(attendee?.paymentDeadline ?? null)
  const paymentCountdownInterval =
    attendee?.createdAt && attendee.paymentDeadline ? interval(attendee.createdAt, attendee.paymentDeadline) : null
  const isWithinPaymentCountdown = paymentCountdownInterval ? isWithinInterval(now, paymentCountdownInterval) : false

  const hasPaid = Boolean(
    attendee &&
      (attendee.paymentChargedAt ||
        attendee.paymentReservedAt ||
        (attendee.paymentRefundedAt && !attendee.paymentDeadline))
  )

  const isCountdown = isWithinRegisterCountdown || (isWithinPaymentCountdown && !hasPaid)

  const cardClassname = cn(
    "flex flex-col w-full min-h-[10rem] gap-2 p-3 rounded-lg",
    "items-center text-center justify-center",
    "bg-gray-100 dark:bg-stone-800"
  )

  if (!user) {
    return (
      <Link href={authorizeUrl} prefetch={false} className={cardClassname}>
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

  const mainPoolCardContent = (
    <div className="flex flex-col min-h-[10rem] gap-2 p-3 rounded-lg items-center text-center justify-center w-full">
      <div className="flex grow flex-col gap-4 items-center text-center justify-center">
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

        {!servingPunishment && (
          <div className="flex flex-col gap-1">
            <AttendanceStatus attendance={attendance} attendee={attendee} />
            <PaymentStatus attendance={attendance} attendee={attendee} />
          </div>
        )}

        {servingPunishment && (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex flex-row gap-1 items-center mt-2 px-2 py-0.5 rounded-lg",
                    attendee.reserved === true && "bg-green-300/25 dark:bg-green-700/25",
                    attendee.reserved === false && "bg-yellow-300/25 dark:bg-yellow-600/25"
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
      </div>
    </div>
  )

  const countdownContent = (
    <div className="flex flex-col min-h-[10rem] gap-4 p-3 rounded-lg items-center w-full">
      <div className="flex flex-row gap-2 items-center justify-center w-full">
        <div className="flex flex-row gap-0.5 items-center">
          <Text
            className={cn(
              "text-base px-1",
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
                "text-base px-1",
                attendee?.reserved === false && "bg-yellow-200 dark:bg-yellow-700 rounded-lg"
              )}
            >
              +{unreservedAttendeeCount} i kø
            </Text>
          )}
        </div>

        <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />

        {!servingPunishment && (
          <>
            <div className="mx-1">
              <AttendanceStatus attendance={attendance} attendee={attendee} />
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
            <div className="mx-1">
              <PaymentStatus attendance={attendance} attendee={attendee} />
            </div>
          </>
        )}

        {servingPunishment && (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex flex-row gap-1 items-center mt-2 mx-1 px-2 py-0.5 rounded-lg",
                    attendee.reserved === true && "bg-green-300/25 dark:bg-green-700/25",
                    attendee.reserved === false && "bg-yellow-300/25 dark:bg-yellow-600/25"
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
      </div>

      {isWithinRegisterCountdown && !attendee && (
        <div className="flex flex-col gap-1 items-center">
          <Text>{pool.capacity > 0 ? `${pool.capacity} plasser` : "Påmelding"} åpner om</Text>
          <Text className="text-4xl font-medium tabular-nums">{registerCountdownText}</Text>
        </div>
      )}

      {isWithinPaymentCountdown &&
        !attendee?.paymentReservedAt &&
        !attendee?.paymentChargedAt &&
        !!attendee?.paymentLink && (
          <Link href={attendee.paymentLink} className="group relative cursor-pointer items-center w-full">
            <Stripes
              colorA="bg-amber-200"
              colorB="bg-amber-300"
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
                <Icon
                  icon="tabler:arrow-up-right"
                  height={32}
                  width={32}
                  className="[@media(min-width:350px)]:absolute [@media(min-width:350px)]:right-0"
                />
              </div>
            </Stripes>
            <span className="absolute top-0 left-0 inset-0 bg-gradient-to-t from-white/50 via-white/30 group-hover:via-white/5 group-hover:from-white/15 to-transparent pointer-events-none transition-colors duration-400" />
          </Link>
        )}
    </div>
  )

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
          "flex flex-row gap- px-3 py-2 rounded-t-lg justify-center text-sm font-bold",
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

      {isCountdown ? countdownContent : mainPoolCardContent}
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

interface AttendanceStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  small?: boolean
}

const AttendanceStatus = ({ attendance, attendee, small }: AttendanceStatusProps) => {
  const gap = small ? "gap-1" : "gap-2"
  const iconSize = small ? 12 : 16

  if (!attendee) {
    return <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:user-x" size={iconSize} />
        <Text>Du er ikke påmeldt</Text>
      </div>
  }

  if (attendee.reserved === true) {
    return <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:check" size={iconSize} className="text-green-700" />
        <Text>Du er påmeldt</Text>
      </div>
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)

  // Should never happen, but just in case
  if (!queuePosition) {
    return <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:clock-hour-2" size={iconSize} className="text-green-700" />
        <Text>Du er i køen</Text>
      </div>
  }

  return<div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:clock-hour-2" size={iconSize} className="text-green-700" />
        <Text>Du er {queuePosition}. i køen</Text>
      </div>
}

interface PaymentStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  small?: boolean
}

const PaymentStatus = ({ attendance, attendee, small }: PaymentStatusProps) => {
  if (!attendance.attendancePrice) {
    return null
  }

  const gap = small ? "gap-1" : "gap-2"
  const iconSize = small ? 12 : 16

  const hasPaid = Boolean(
    attendee &&
      (attendee?.paymentChargedAt ||
        attendee.paymentReservedAt ||
        (attendee.paymentRefundedAt && !attendee.paymentDeadline))
  )

  if (!attendee) {
    return (<div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:coins" size={iconSize} />
        <Text>{attendance.attendancePrice} kr</Text>
      </div>)
  }


  if (!hasPaid) {
    return (
      <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:x" size={iconSize} />
        <Text>{attendance.attendancePrice} kr ubetalt</Text>
      </div>
    )
  }

  if (attendee.paymentReservedAt) {
    return (
      <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:check" size={iconSize} className="text-green-700" />
        <div className="flex flex-col gap-0 items-start">
          <Text>Du har reservert {attendance.attendancePrice} kr</Text>
          <Text className="text-xs">Du blir trukket en gang</Text>
        </div>
      </div>
    )
  }

  if (attendee.paymentChargedAt) {
    return (
      <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:check" size={iconSize} />
        <Text>Du har betalt {attendance.attendancePrice} kr</Text>
      </div>
    )
  }

  if (attendee.paymentRefundedAt) {
    return (
      <div className={cn("flex flex-row items-center", gap)}>
        <Icon icon="tabler:arrow-forward" size={iconSize} />
        <Text>Du er refundert {attendance.attendancePrice} kr</Text>
      </div>
    )
  }

  return null
}
