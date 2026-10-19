import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { RollingNumber } from "@/components/RollingNumber"
import { useCountdown } from "@/utils/countdown/use-countdown"
import { useDeadlineTick } from "@/utils/use-deadline-tick"
import {
  type AttendanceView,
  type Attendee,
  attendeeHasPendingCompletionDeadline,
  buildRegistrationAvailabilityCompletionView,
  getAttendablePool,
  getAttendee,
  getAttendeeQueuePosition,
  getAttendeePaymentStatus,
  getQueuedAttendeeCount,
  getRegisteredAttendeeCount,
  hasAttendeePaid,
} from "@dotkomonline/rpc/attendance"
import { type User, findActiveMembership } from "@dotkomonline/rpc/user"
import { Stripes, Text, Title, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import {
  IconArrowForward,
  IconArrowUpRight,
  IconCheck,
  IconCircleDashed,
  IconCircleDashedCheck,
  IconClockCheck,
  IconCoins,
  IconHourglassEmpty,
  IconPennant,
  IconUserX,
  IconX,
} from "@tabler/icons-react"
import { addDays, formatDate, interval, isAfter, isWithinInterval, roundToNearestHours, subMinutes } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import type { FC, ReactNode } from "react"
import { hasRegistrationDelay } from "./hasRegistrationDelay"
import { QueueCount } from "./QueueCount"
import { AttendanceSection } from "./AttendanceSection"
import { AttendanceStatusGroup } from "./AttendanceStatusGroup"
import { AttendanceStatusRow } from "./AttendanceStatusRow"
import transitionStyles from "./AttendanceTransition.module.css"

// Stripe's refund processing time is maximum 10 business days, we therefore
// add 2 days to the processing time to account for weekends
// See https://support.stripe.com/questions/where-is-my-customers-refund
const MAX_REFUND_PROCESSING_DAYS = 12

interface MainPoolCardProps {
  attendance: AttendanceView
  user: User | null
  authorizeUrl: string
  chargeScheduleDate?: Date | null
  hasAttachedActionBelow?: boolean
}

export const MainPoolCard: FC<MainPoolCardProps> = ({
  attendance,
  user,
  authorizeUrl,
  chargeScheduleDate,
  hasAttachedActionBelow = false,
}) => {
  const now = new Date()
  const attendee = getAttendee(attendance, user)

  useDeadlineTick(attendee?.completionDeadline, attendee?.earliestReservationAt)

  const completion = buildRegistrationAvailabilityCompletionView(attendance, attendee)

  const registerCountdownDisplay = useCountdown(attendance.registerStart, formatRollingCountdown)
  const registerCountdownInterval = interval(subMinutes(attendance.registerStart, 15), attendance.registerStart)
  const isWithinRegisterCountdown = isWithinInterval(now, registerCountdownInterval)
  const showRegisterCountdown = isWithinRegisterCountdown && !attendee

  const completionCountdownDisplay = useCountdown(completion?.completionDeadline ?? null, formatRollingCountdown)
  const completionCountdownInterval =
    attendee?.createdAt && completion?.completionDeadline
      ? interval(attendee.createdAt, completion.completionDeadline)
      : null

  const hasMissingRequirements = (completion?.missingRequirements.length ?? 0) > 0
  const paymentIsMissing = completion?.missingRequirements.includes("PAYMENT") ?? false
  const canCompletePayment = paymentIsMissing && completion?.paymentLink != null

  const isWithinCompletionCountdown =
    completionCountdownInterval && hasMissingRequirements ? isWithinInterval(now, completionCountdownInterval) : false

  const completionDeadlineHasPassed =
    completion?.completionDeadline != null && isAfter(now, completion.completionDeadline)

  const showCompletionPanel =
    canCompletePayment &&
    attendeeHasPendingCompletionDeadline(attendance, attendee) &&
    (isWithinCompletionCountdown || completionDeadlineHasPassed)

  const cardClassname = cn(
    "flex flex-col w-full min-h-40 gap-2 p-3 rounded-lg",
    "items-center text-center text-base justify-center",
    "bg-gray-100 dark:bg-stone-700"
  )

  if (!user) {
    return (
      <a href={authorizeUrl} className={cn("group", cardClassname)}>
        <div className="flex flex-col gap-2">
          <Text>Du er ikke innlogget</Text>

          <div className="flex gap-[0.5ch] text-sm align-center">
            <Text className="group-hover:underline">Logg inn</Text>
            <IconArrowUpRight className="size-4.5" />
          </div>

          {attendance.attendancePrice && attendance.attendancePrice > 0 && (
            <AttendanceStatusGroup className="mt-4">
              <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            </AttendanceStatusGroup>
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
            <IconArrowUpRight className="size-4.5" />
          </div>

          {attendance.attendancePrice && attendance.attendancePrice > 0 && (
            <AttendanceStatusGroup className="mt-4">
              <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
            </AttendanceStatusGroup>
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
        <AttendanceStatusGroup>
          <PaymentStatus attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
        </AttendanceStatusGroup>
      </div>
    )
  }

  const queuedAttendeeCount = getQueuedAttendeeCount(attendance, pool.id)
  const registeredAttendeeCount = getRegisteredAttendeeCount(attendance, pool.id)
  const availableSeatCount = Math.max(0, pool.capacity - registeredAttendeeCount)
  const hasQueue = queuedAttendeeCount > 0

  const isRegistrationDelayed = hasRegistrationDelay(attendee, now)

  const isActionRequired = hasMissingRequirements && canCompletePayment
  const attendeeState = completion?.attendeeState ?? null
  const isRegistered = attendeeState === "REGISTERED"
  const isReserved = attendeeState === "RESERVED"
  const isQueued = attendeeState === "QUEUED"
  const paymentState = attendee ? getAttendeePaymentStatus(attendee) : null
  const showPaymentStatus = attendance.attendancePrice !== null && !(showCompletionPanel && paymentIsMissing)
  const stripeColorA = cn(isQueued ? "bg-fuchsia-100 dark:bg-fuchsia-900/66" : "bg-yellow-100 dark:bg-[#614020]")
  const stripeColorB = cn(isQueued ? "bg-fuchsia-200/33 dark:bg-white/7" : "bg-yellow-200/40 dark:bg-amber-100/8")

  const cardBody = (
    <div
      className={cn(
        "relative flex flex-col min-h-40 px-2 pt-6 pb-2 items-center text-center justify-center w-full",
        "transition-[padding] duration-260 ease-smooth motion-reduce:transition-none",
        !showCompletionPanel && "pb-6"
      )}
    >
      <div className="flex grow flex-col gap-6 items-center text-center justify-center w-full">
        {showRegisterCountdown ? (
          <AttendanceStatusRow icon={<IconPennant className="text-muted-foreground" />} contentClassName="gap-1">
            <Text>{availableSeatCount > 0 ? `${availableSeatCount} plasser` : "Påmelding"} åpner om</Text>
            <Text className="text-4xl font-medium" suppressHydrationWarning>
              {registerCountdownDisplay}
            </Text>
          </AttendanceStatusRow>
        ) : (
          <div className="flex flex-col items-center">
            <Text
              className={cn(
                "text-3xl px-2 py-1 transition-colors duration-260 ease-smooth motion-reduce:transition-none",
                hasQueue &&
                  (isRegistered || isActionRequired) &&
                  (isActionRequired
                    ? "bg-yellow-200 dark:bg-[#885221] rounded-lg"
                    : "bg-green-200 dark:bg-green-800 rounded-lg")
              )}
              suppressHydrationWarning
            >
              <RollingNumber value={registeredAttendeeCount} />
              {/* Don't show capacity for merge pools (capacity = 0) */}
              {pool.capacity > 0 && (
                <>
                  /<span className="font-mono">{pool.capacity}</span>
                </>
              )}
            </Text>

            <QueueCount
              value={queuedAttendeeCount}
              className={cn(
                isQueued &&
                  !isRegistrationDelayed &&
                  !isActionRequired &&
                  "bg-indigo-200 dark:bg-indigo-800 rounded-md",
                isQueued &&
                  !isRegistrationDelayed &&
                  isActionRequired &&
                  "bg-fuchsia-200 dark:bg-fuchsia-800 dark:saturate-80 rounded-md"
              )}
            />
          </div>
        )}

        <AttendanceStatusGroup>
          <div
            key={`${attendeeState}-${isRegistrationDelayed}-${hasMissingRequirements}`}
            className={transitionStyles.state}
          >
            {isRegistrationDelayed ? (
              <PendingRegistrationStatus isActionRequired={isActionRequired} />
            ) : (
              <AttendanceStatus attendance={attendance} attendee={attendee} isActionRequired={hasMissingRequirements} />
            )}
          </div>

          <AttendanceSection contentClassName="pt-2">
            {showPaymentStatus && (
              <div key={`${paymentState}-${Boolean(attendee?.registered)}`} className={transitionStyles.state}>
                <PaymentStatus
                  attendance={attendance}
                  attendee={attendee}
                  chargeScheduleDate={chargeScheduleDate}
                  hideUnpaidStatus={showCompletionPanel && paymentIsMissing}
                />
              </div>
            )}
          </AttendanceSection>
        </AttendanceStatusGroup>
      </div>

      {/** This weird margin padding stuff is to allow the CompletionCard to have a shadow */}
      <AttendanceSection className="-mx-2 -mb-2 self-stretch" contentClassName="pt-8 px-2 pb-2">
        {showCompletionPanel && (
          <CompletionCard
            countdownDisplay={completionCountdownDisplay}
            paymentIsMissing={paymentIsMissing}
            hasAttachedActionBelow={hasAttachedActionBelow}
            isQueued={isQueued}
            price={attendance.attendancePrice}
          />
        )}
      </AttendanceSection>
    </div>
  )

  const body = (
    <div className="relative">
      {isActionRequired && (
        <Stripes
          colorA={stripeColorA}
          colorB={stripeColorB}
          stripeWidth={24}
          speed="2.0s"
          animated
          className={cn("absolute inset-0 pointer-events-none", transitionStyles.state)}
        />
      )}
      {cardBody}
    </div>
  )

  return (
    <div
      className={cn(
        "flex flex-col w-full overflow-hidden text-base transition-[background-color,border-radius] duration-260 ease-smooth motion-reduce:transition-none",
        hasAttachedActionBelow ? "rounded-t-xl rounded-b-md" : "rounded-xl",
        !isActionRequired && !attendee && "bg-gray-100 dark:bg-stone-700/50",
        isRegistered && "bg-green-100 dark:bg-green-900",
        isReserved && !isActionRequired && "bg-gray-100 dark:bg-stone-700",
        !isActionRequired && isQueued && "bg-indigo-100 dark:bg-indigo-900/75"
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-2 px-3 py-2 justify-center text-sm font-bold transition-colors duration-260 ease-smooth motion-reduce:transition-none",
          !attendee && "bg-gray-200 dark:bg-stone-700",
          isRegistered && "bg-green-200 dark:bg-green-800",
          isReserved && !isActionRequired && "bg-gray-200 dark:bg-stone-700",
          isQueued && !isActionRequired && "bg-indigo-200 dark:bg-indigo-900",
          isActionRequired && !attendee && "bg-gray-200 dark:bg-stone-700/50",
          isActionRequired && isReserved && "bg-yellow-200 dark:bg-[#6a4422]",
          isActionRequired && isQueued && "bg-fuchsia-200 dark:bg-fuchsia-900/75"
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
    ? `Påmeldingen din behandles ${mergeDelayHours} timer etter at du melder deg på. Du får plass dersom det er ledig. Ellers blir du satt bakerst i køen.`
    : "Denne påmeldingsgruppen kan få plasser senere"

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <IconHourglassEmpty className="size-4" />
          <Text className="text-xs">{mergeDelayHours ? `${mergeDelayHours}t` : "TBD"}</Text>
        </div>
      </TooltipTrigger>
      <TooltipContent className="font-normal">{content}</TooltipContent>
    </Tooltip>
  )
}

interface AttendanceStatusProps {
  attendance: AttendanceView
  attendee: Attendee | null
  isActionRequired: boolean
}

const NotRegisteredStatus = () => {
  return (
    <AttendanceStatusRow icon={<IconUserX />}>
      <Text>Du er ikke påmeldt</Text>
    </AttendanceStatusRow>
  )
}

const ReservedStatus = () => {
  return (
    <AttendanceStatusRow icon={<IconClockCheck />}>
      <Text>Du har reservert plass</Text>
    </AttendanceStatusRow>
  )
}

interface PendingRegistrationStatusProps {
  isActionRequired: boolean
}

const PendingRegistrationStatus = ({ isActionRequired }: PendingRegistrationStatusProps) => {
  return (
    <AttendanceStatusRow
      icon={<IconCircleDashed className={cn(!isActionRequired && "text-indigo-700 dark:text-indigo-200")} />}
    >
      <Text>Påmeldingen din er utsatt</Text>
      <Text className="text-xs">Du vil få plass eller køplass senere</Text>
    </AttendanceStatusRow>
  )
}

const RegisteredStatus = () => {
  return (
    <AttendanceStatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>
      <Text>Du er påmeldt</Text>
    </AttendanceStatusRow>
  )
}

interface QueueStatusProps {
  queuePosition: number | null
  isActionRequired: boolean
}

const QueueStatus = ({ queuePosition, isActionRequired }: QueueStatusProps) => {
  return (
    <AttendanceStatusRow
      icon={<IconCircleDashedCheck className={cn(!isActionRequired && "text-indigo-700 dark:text-indigo-200")} />}
    >
      {queuePosition !== null ? <Text>Du er nummer {queuePosition} i køen</Text> : <Text>Du står i kø</Text>}
    </AttendanceStatusRow>
  )
}

const AttendanceStatus = ({ attendance, attendee, isActionRequired }: AttendanceStatusProps) => {
  if (!attendee) {
    return <NotRegisteredStatus />
  }

  if (attendee.registered === true) {
    if (isActionRequired) {
      return <ReservedStatus />
    }

    return <RegisteredStatus />
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)

  return <QueueStatus queuePosition={queuePosition} isActionRequired={isActionRequired} />
}

interface PaymentStatusProps {
  attendance: AttendanceView
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
  hideUnpaidStatus?: boolean
}

interface PriceStatusProps {
  price: number
  registered: boolean
}

const PriceStatus = ({ price, showPaymentTiming = false }: { price: number; showPaymentTiming?: boolean }) => {
  return (
    <AttendanceStatusRow icon={<IconCoins />}>
      <Text>{price} kr</Text>
      {showPaymentTiming && <Text className="text-xs">Du betaler når du får plass</Text>}
    </AttendanceStatusRow>
  )
}

const UnpaidStatus = ({ price, registered }: PriceStatusProps) => {
  return (
    <AttendanceStatusRow
      icon={<IconX className="text-red-700 dark:text-red-200" />}
      className={cn(
        "w-fit pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm",
        registered && "bg-orange-200 dark:bg-red-900",
        !registered && "bg-pink-200 dark:bg-pink-900"
      )}
    >
      <Text>{price} kr ubetalt</Text>
    </AttendanceStatusRow>
  )
}

interface RefundedStatusProps {
  price: number
  refundedAt: Date
}

const RefundedStatus = ({ price, refundedAt }: RefundedStatusProps) => {
  return (
    <AttendanceStatusRow icon={<IconArrowForward />}>
      <Text>Du er refundert {price} kr</Text>
      <Text className="text-xs">
        Pengene ankommer senest{" "}
        {formatDate(roundToNearestHours(addDays(refundedAt, MAX_REFUND_PROCESSING_DAYS)), "dd. MMM 'kl.' HH", {
          locale: nb,
        })}
      </Text>
    </AttendanceStatusRow>
  )
}

const PaidStatus = ({ price }: PriceStatusProps) => {
  return (
    <AttendanceStatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>
      <Text>Du har betalt {price} kr</Text>
    </AttendanceStatusRow>
  )
}

interface ReservedPaymentStatusProps {
  price: number
  chargeScheduleDate?: Date | null
}

const ReservedPaymentStatus = ({ price, chargeScheduleDate }: ReservedPaymentStatusProps) => {
  return (
    <AttendanceStatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>
      <Text>Du har reservert {price} kr</Text>

      {chargeScheduleDate && (
        <Text className="text-xs">
          Du blir trukket rundt{" "}
          {formatDate(roundToNearestHours(chargeScheduleDate), "dd. MMM 'kl.' HH", { locale: nb })}
        </Text>
      )}
    </AttendanceStatusRow>
  )
}

const PaymentStatus = ({ attendance, attendee, chargeScheduleDate, hideUnpaidStatus = false }: PaymentStatusProps) => {
  const hasPaid = hasAttendeePaid(attendee, attendance.attendancePrice)
  const price = attendance.attendancePrice

  if (hasPaid === null || price === null) {
    return null
  }

  if (!attendee) {
    return <PriceStatus price={price} />
  }

  if ((!attendee.registered && !hasPaid) || price === 0) {
    return <PriceStatus price={price} showPaymentTiming={!attendee.registered && price > 0} />
  }

  if (!hasPaid) {
    if (hideUnpaidStatus) {
      return null
    }

    if (attendee.paymentLink === null) {
      return (
        <AttendanceStatusRow icon={<IconCoins />}>
          <Text>{price} kr ubetalt</Text>
          <Text className="text-sm text-red-600 dark:text-red-400">Betalingslenken er ikke tilgjengelig.</Text>
          <Text className="text-sm">Kontakt arrangøren for hjelp!</Text>
        </AttendanceStatusRow>
      )
    }

    return <UnpaidStatus price={price} registered={attendee.registered === true} />
  }

  const paymentStatus = getAttendeePaymentStatus(attendee)

  if (paymentStatus === "refunded" && attendee.paymentRefundedAt !== null) {
    return <RefundedStatus price={price} refundedAt={attendee.paymentRefundedAt} />
  }

  if (paymentStatus === "charged") {
    return <PaidStatus price={price} registered={attendee.registered === true} />
  }

  if (paymentStatus === "reserved") {
    return <ReservedPaymentStatus price={price} chargeScheduleDate={chargeScheduleDate} />
  }

  return null
}

interface CompletionCardProps {
  countdownDisplay: ReactNode
  paymentIsMissing: boolean
  hasAttachedActionBelow: boolean
  isQueued: boolean
  price: number | null
}

const CompletionCard = ({
  countdownDisplay,
  paymentIsMissing,
  hasAttachedActionBelow,
  isQueued,
  price,
}: CompletionCardProps) => {
  const roundingClassName = hasAttachedActionBelow ? "rounded-t-md rounded-b-xs" : "rounded-md"

  return (
    <div className={cn("w-full shadow-md bg-background", roundingClassName)}>
      <div
        className={cn(
          "relative flex flex-col gap-3 w-full overflow-hidden p-3",
          !isQueued && "bg-violet-200 dark:bg-[#413545]",
          isQueued && "bg-blue-200 dark:bg-sky-900/75",
          roundingClassName
        )}
      >
        <span
          className={cn(
            "absolute top-0 left-0 inset-0 bg-linear-to-t pointer-events-none transition-colors duration-400",
            roundingClassName,
            "from-white/50 via-white/30 to-transparent",
            "dark:from-white/10 dark:via-white/3 dark:to-transparent"
          )}
        />
        <span
          className={cn(
            "absolute top-0 left-0 inset-0 bg-linear-to-t pointer-events-none transition-colors duration-400",
            roundingClassName,
            "from-transparent via-red-300/6 to-red-300/15",
            "dark:from-transparent dark:via-red-300/3 dark:to-red-300/8"
          )}
        />

        <div className="relative flex flex-col gap-1 items-center justify-center w-full text-base">
          <div className="relative flex flex-col gap-3 w-full">
            <Text className="font-medium">Fullfør påmeldingen innen</Text>

            <Text suppressHydrationWarning className="text-3xl font-medium">
              {countdownDisplay}
            </Text>

            {paymentIsMissing && (
              <AttendanceStatusGroup className="gap-2">
                <AttendanceStatusRow icon={<IconX className="text-red-700 dark:text-red-400" />}>
                  <Text>{price ? `${price} kr ubetalt` : "Du har ikke betalt"}</Text>
                </AttendanceStatusRow>
              </AttendanceStatusGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
