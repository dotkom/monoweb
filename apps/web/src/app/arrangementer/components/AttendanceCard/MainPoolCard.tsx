import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { RollingNumber } from "@/components/RollingNumber"
import { useCountdown } from "@/utils/countdown/use-countdown"
import {
  type Attendance,
  type Attendee,
  getAttendablePool,
  getAttendee,
  getAttendeeQueuePosition,
  getReservedAttendeeCount,
  getUnreservedAttendeeCount,
  attendeeHasPendingSelectionDeadline,
  hasAttendeeCompletedSelections,
  hasAttendeePaid,
} from "@dotkomonline/rpc/attendance"
import { type User, findActiveMembership } from "@dotkomonline/rpc/user"
import { Stripes, Text, Title, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import {
  IconArrowForward,
  IconArrowUpRight,
  IconCheck,
  IconCircleDashedCheck,
  IconClockCheck,
  IconCoins,
  IconHourglassEmpty,
  IconUserX,
  IconX,
} from "@tabler/icons-react"
import {
  addDays,
  addSeconds,
  formatDate,
  formatDistanceToNowStrict,
  interval,
  isAfter,
  isFuture,
  isWithinInterval,
  roundToNearestHours,
  subMinutes,
} from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import type { FC, ReactNode } from "react"

// Stripe's refund processing time is maximum 10 business days, we therefore
// add 2 days to the processing time to account for weekends
// See https://support.stripe.com/questions/where-is-my-customers-refund
const MAX_REFUND_PROCESSING_DAYS = 12

interface MainPoolCardProps {
  attendance: Attendance
  user: User | null
  authorizeUrl: string
  chargeScheduleDate?: Date | null
}

export const MainPoolCard: FC<MainPoolCardProps> = ({ attendance, user, authorizeUrl, chargeScheduleDate }) => {
  const now = new Date()
  const attendee = getAttendee(attendance, user)

  const registerCountdownDisplay = useCountdown(attendance.registerStart, formatRollingCountdown)
  const registerCountdownInterval = interval(subMinutes(attendance.registerStart, 15), attendance.registerStart)
  const isWithinRegisterCountdown = isWithinInterval(now, registerCountdownInterval)
  const showRegisterCountdown = isWithinRegisterCountdown && !attendee

  const paymentCountdownDisplay = useCountdown(attendee?.paymentDeadline ?? null, formatRollingCountdown)
  const paymentCountdownInterval =
    attendee?.createdAt && attendee.paymentDeadline ? interval(attendee.createdAt, attendee.paymentDeadline) : null
  const paymentIsUnpaid = hasAttendeePaid(attendee, attendance.attendancePrice) === false
  const isWithinPaymentCountdown =
    paymentCountdownInterval && paymentIsUnpaid ? isWithinInterval(now, paymentCountdownInterval) : false
  const paymentDeadlineHasPassed = attendee?.paymentDeadline != null && isAfter(now, attendee.paymentDeadline)
  const showPaymentCountdown =
    paymentIsUnpaid && attendee?.paymentLink != null && (isWithinPaymentCountdown || paymentDeadlineHasPassed)
  const selectionsArePending = attendeeHasPendingSelectionDeadline(attendance.selections, attendee)

  const cardClassname = cn(
    "flex flex-col w-full min-h-40 gap-2 p-3 rounded-lg",
    "items-center text-center justify-center",
    "bg-gray-100 dark:bg-stone-700"
  )

  if (!user) {
    return (
      <a href={authorizeUrl} className={cn("group", cardClassname)}>
        <div className="flex flex-col gap-2">
          <Text>Du er ikke innlogget</Text>

          <div className="flex gap-[0.5ch] text-sm align-center">
            <Text className="group-hover:underline">Logg inn</Text>
            <IconArrowUpRight className="size-[1.25em]" />
          </div>

          {attendance.attendancePrice && attendance.attendancePrice > 0 && (
            <div className="mt-4">
              <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            </div>
          )}
        </div>
      </a>
    )
  }

  const membership = findActiveMembership(user)

  if (!membership && !attendee) {
    return (
      <Link href="/innstillinger/medlemskap" className={cn("group", cardClassname)}>
        <div className="flex flex-col gap-2">
          <Text>Du har ikke registert medlemskap</Text>

          <div className="flex gap-[0.5ch] text-sm align-center">
            <Text>
              Gå til <span className="group-hover:underline">medlemskapssiden</span>
            </Text>
            <IconArrowUpRight className="size-[1.25em]" />
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

  const servingPunishment =
    attendee?.earliestReservationAt &&
    isFuture(attendee.earliestReservationAt) &&
    isAfter(attendee.earliestReservationAt, addSeconds(attendee.createdAt, 1))

  const actionIsRequired = showPaymentCountdown || selectionsArePending
  const isReserved = attendee?.reserved === true
  const isQueued = attendee?.reserved === false
  const stripeColorA = cn(isQueued ? "bg-fuchsia-100 dark:bg-fuchsia-900/66" : "bg-yellow-100 dark:bg-amber-600/50")
  const stripeColorB = cn(isQueued ? "bg-fuchsia-200/33 dark:bg-white/7" : "bg-yellow-200/40 dark:bg-white/10")

  const cardBody = (
    <div className="flex flex-col min-h-40 gap-6 p-3 items-center text-center justify-center w-full">
      {!showRegisterCountdown && (
        <div className="flex grow flex-col gap-4 items-center text-center justify-center">
          <div className="flex flex-col gap-1 items-center">
            <Text
              className={cn(
                "text-3xl px-2 py-1",
                hasWaitlist &&
                  attendee?.reserved &&
                  (actionIsRequired
                    ? "bg-yellow-200 dark:bg-amber-900 rounded-lg"
                    : "bg-green-200 dark:bg-green-800 rounded-lg")
              )}
              suppressHydrationWarning
            >
              <RollingNumber value={reservedAttendeeCount} />
              {/* Don't show capacity for merge pools (capacity = 0) */}
              {pool.capacity > 0 && (
                <>
                  /<span className="font-mono">{pool.capacity}</span>
                </>
              )}
            </Text>

            {hasWaitlist && (
              <Text
                className={cn(
                  "text-lg px-2 py-0.5",
                  attendee?.reserved === false && !actionIsRequired && "bg-indigo-200 dark:bg-indigo-800 rounded-md",
                  attendee?.reserved === false &&
                    actionIsRequired &&
                    "bg-fuchsia-200 dark:bg-fuchsia-800 dark:saturate-80 rounded-md"
                )}
                suppressHydrationWarning
              >
                +<RollingNumber value={unreservedAttendeeCount} /> i kø
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {servingPunishment ? (
              <PunishmentStatus attendee={attendee} actionIsRequired={actionIsRequired} />
            ) : (
              <AttendanceStatus attendance={attendance} attendee={attendee} actionIsRequired={actionIsRequired} />
            )}

            <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            <SelectionStatus attendance={attendance} attendee={attendee} />
          </div>
        </div>
      )}

      {showRegisterCountdown && (
        <div className="flex flex-col gap-1 items-center">
          <Text>{pool.capacity > 0 ? `${pool.capacity} plasser` : "Påmelding"} åpner om</Text>
          <Text className="text-4xl font-medium" suppressHydrationWarning>
            {registerCountdownDisplay}
          </Text>
        </div>
      )}

      {showRegisterCountdown && attendance.attendancePrice !== null && (
        <div className="flex flex-row gap-2 items-center">
          <IconCoins className="size-[1.25em]" />
          <Text>{attendance.attendancePrice} kr</Text>
        </div>
      )}

      <PaymentAction
        visible={showPaymentCountdown}
        paymentLink={attendee?.paymentLink ?? null}
        countdownDisplay={paymentCountdownDisplay}
      />
    </div>
  )

  const body = actionIsRequired ? (
    <Stripes colorA={stripeColorA} colorB={stripeColorB} stripeWidth={24} speed="2.0s" animated className="h-auto">
      {cardBody}
    </Stripes>
  ) : (
    cardBody
  )

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-lg overflow-hidden",
        !actionIsRequired && !attendee && "bg-gray-100 dark:bg-stone-700/50",
        !actionIsRequired && isReserved && "bg-green-100 dark:bg-green-900",
        !actionIsRequired && isQueued && "bg-indigo-100 dark:bg-indigo-900/75"
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-2 px-3 py-2 justify-center text-sm font-bold",
          !attendee && "bg-gray-200 dark:bg-stone-700",
          isReserved && "bg-green-200 dark:bg-green-800",
          isQueued && "bg-indigo-200 dark:bg-indigo-900",
          actionIsRequired && !attendee && "bg-gray-200 dark:bg-stone-700/50",
          actionIsRequired && isReserved && "bg-yellow-200 dark:bg-amber-700/50",
          actionIsRequired && isQueued && "bg-fuchsia-200 dark:bg-fuchsia-900/75"
        )}
      >
        <Title element="p" className="text-base">
          {pool.title}
        </Title>

        {pool.mergeDelayHours && pool.mergeDelayHours > 0 && <DelayPill mergeDelayHours={pool.mergeDelayHours} />}
      </div>

      {body}
    </div>
  )
}

interface DelayPillProps {
  mergeDelayHours: number | null
}

const DelayPill = ({ mergeDelayHours }: DelayPillProps) => {
  const content = mergeDelayHours
    ? `Denne gruppen får plasser ${mergeDelayHours} timer etter påmeldingsstart`
    : "Denne påmeldingsgruppen kan få plasser senere"

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <IconHourglassEmpty className="size-4" />
          <Text className="text-xs">{mergeDelayHours ? `${mergeDelayHours}t` : "TBD"}</Text>
        </div>
      </TooltipTrigger>
      <TooltipContent className="font-normal">
        <Text>{content}</Text>
      </TooltipContent>
    </Tooltip>
  )
}

interface AttendanceStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  actionIsRequired: boolean
}

const NotRegisteredStatus = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconUserX className="size-[1.25em]" />
      <Text>Du er ikke påmeldt</Text>
    </div>
  )
}

const ReservedStatus = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconClockCheck className="size-[1.25em]" />
      <Text>Du har reservert plass</Text>
    </div>
  )
}

const RegisteredStatus = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconCheck className="size-[1.25em] text-green-700 dark:text-green-200" />
      <Text>Du er påmeldt</Text>
    </div>
  )
}

interface QueueStatusProps {
  queuePosition: number | null
  actionIsRequired: boolean
}

const QueueStatus = ({ queuePosition, actionIsRequired }: QueueStatusProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconCircleDashedCheck className={cn("size-[1.25em]", !actionIsRequired && "dark:text-indigo-200")} />
      <Text>Du er {queuePosition !== null && `${queuePosition}. `}i køen</Text>
    </div>
  )
}

const AttendanceStatus = ({ attendance, attendee, actionIsRequired }: AttendanceStatusProps) => {
  if (!attendee) {
    return <NotRegisteredStatus />
  }

  if (attendee.reserved === true) {
    if (actionIsRequired) {
      return <ReservedStatus />
    }

    return <RegisteredStatus />
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)

  return <QueueStatus queuePosition={queuePosition} actionIsRequired={actionIsRequired} />
}

interface PaymentStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
}

interface PriceStatusProps {
  price: number
  registered: boolean
}

const PriceStatus = ({ price }: PriceStatusProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconCoins className="size-[1.25em]" />
      <Text>{price} kr</Text>
    </div>
  )
}

const UnpaidStatus = ({ price, registered }: PriceStatusProps) => {
  return (
    <div
      className={cn(
        "flex flex-row w-fit items-center gap-2 pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm",
        registered && "bg-orange-200 dark:bg-red-900",
        !registered && "bg-pink-200 dark:bg-pink-900"
      )}
    >
      <IconX className="size-[1.25em] text-red-700 dark:text-red-200" />
      <Text>{price} kr ubetalt</Text>
    </div>
  )
}

interface RefundedStatusProps {
  price: number
  refundedAt: Date
}

const RefundedStatus = ({ price, refundedAt }: RefundedStatusProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconArrowForward className="size-[1.25em]" />

      <div className="flex flex-col gap-0 items-start">
        <Text>Du er refundert {price} kr</Text>
        <Text className="text-xs">
          Pengene ankommer senest{" "}
          {formatDate(roundToNearestHours(addDays(refundedAt, MAX_REFUND_PROCESSING_DAYS)), "dd. MMM 'kl.' HH", {
            locale: nb,
          })}
        </Text>
      </div>
    </div>
  )
}

const PaidStatus = ({ price }: PriceStatusProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconCheck className="size-[1.25em] text-green-700 dark:text-green-200" />
      <Text>Du har betalt {price} kr</Text>
    </div>
  )
}

interface ReservedPaymentStatusProps {
  price: number
  chargeScheduleDate?: Date | null
}

const ReservedPaymentStatus = ({ price, chargeScheduleDate }: ReservedPaymentStatusProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <IconCheck className="size-[1.25em] text-green-700 dark:text-green-200" />

      <div className="flex flex-col gap-0 items-start">
        <Text>Du har reservert {price} kr</Text>

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

const PaymentStatus = ({ attendance, attendee, chargeScheduleDate }: PaymentStatusProps) => {
  const hasPaid = hasAttendeePaid(attendee, attendance.attendancePrice)
  const price = attendance.attendancePrice

  if (hasPaid === null || price === null) {
    return null
  }

  if (!attendee) {
    return <PriceStatus price={price} registered={false} />
  }

  if (!hasPaid) {
    return <UnpaidStatus price={price} registered={attendee.reserved === true} />
  }

  if (attendee.paymentRefundedAt) {
    return <RefundedStatus price={price} refundedAt={attendee.paymentRefundedAt} />
  }

  if (attendee.paymentChargedAt) {
    return <PaidStatus price={price} registered={attendee.reserved === true} />
  }

  if (attendee.paymentReservedAt) {
    return <ReservedPaymentStatus price={price} chargeScheduleDate={chargeScheduleDate} />
  }

  return null
}

interface SelectionStatusProps {
  attendance: Attendance
  attendee: Attendee | null
}

const SelectionStatus = ({ attendance, attendee }: SelectionStatusProps) => {
  if (attendee === null || attendee.reserved !== true || attendance.selections.length === 0) {
    return null
  }

  const hasSelected = hasAttendeeCompletedSelections(attendance.selections, attendee.selections)

  if (!hasSelected) {
    return (
      <div
        className={cn(
          "flex flex-row w-fit items-center gap-2 pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm",
          "bg-orange-200 dark:bg-red-900"
        )}
      >
        <IconX className="size-[1.25em] text-red-700 dark:text-red-200" />
        <Text>Du har ikke valgt</Text>
      </div>
    )
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <IconCheck className="size-[1.25em] text-green-700 dark:text-green-200" />
      <Text>Du har valgt</Text>
    </div>
  )
}

interface PaymentActionProps {
  visible: boolean
  paymentLink: string | null
  countdownDisplay: ReactNode
}

const PaymentAction = ({ visible, paymentLink, countdownDisplay }: PaymentActionProps) => {
  if (!visible || paymentLink === null) {
    return null
  }

  return (
    <Link
      href={paymentLink}
      className="group relative bg-indigo-200 dark:bg-indigo-600 dark:saturate-40 rounded-xs cursor-pointer w-full p-3 shadow-md"
    >
      <span
        className={cn(
          "absolute top-0 left-0 inset-0 rounded-xs bg-linear-to-t pointer-events-none transition-colors duration-400",
          "from-indigo-300 via-indigo-300/75 group-hover:via-indigo-300/40 group-hover:from-indigo-300/50 to-transparent",
          "dark:from-black/50 dark:via-black/30 dark:group-hover:via-black/5 dark:group-hover:from-black/15 dark:to-transparent"
        )}
      />

      <div className="relative flex flex-col gap-1 items-center justify-center w-full">
        <Text className="text-base font-medium">Du må betale innen</Text>
        <Text suppressHydrationWarning className="text-3xl font-medium">
          {countdownDisplay}
        </Text>
      </div>

      <IconArrowUpRight className="absolute right-3 top-1/2 size-[1.25em] -translate-y-1/2" />
    </Link>
  )
}

interface PunishmentStatusProps {
  attendee: Attendee
  actionIsRequired: boolean
}

const PunishmentStatus = ({ attendee, actionIsRequired }: PunishmentStatusProps) => {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="flex flex-row gap-2 items-center">
          <IconHourglassEmpty className={cn("size-[1.25em]", !actionIsRequired && "dark:text-indigo-200")} />
          <Text>
            {formatDistanceToNowStrict(attendee.earliestReservationAt, {
              locale: nb,
            })}{" "}
            utsettelse
          </Text>
        </div>
      </TooltipTrigger>
      <TooltipContent className="font-normal">
        Utsettelsen varer til{" "}
        {formatDate(attendee.earliestReservationAt, "eeee dd. MMM yyyy 'kl.' HH:mm:ss", { locale: nb })}
      </TooltipContent>
    </Tooltip>
  )
}
