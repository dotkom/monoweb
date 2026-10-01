import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { RollingNumber } from "@/components/RollingNumber"
import { useCountdown } from "@/utils/countdown/use-countdown"
import { useDeadlineTick } from "@/utils/use-deadline-tick"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import {
  type Attendance,
  type Attendee,
  buildRegistrationAvailabilityCompletionView,
  getActualDeregisterDeadlineForAttendee,
  getAttendablePool,
  getAttendee,
  getAttendeeQueuePosition,
  getQueuedAttendeeCount,
  getRegisteredAttendeeCount,
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
  IconEyeOff,
  IconEyeSearch,
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
  secondsToMilliseconds,
  subMinutes,
} from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import { useEffect, useMemo, useRef, type FC, type ReactNode } from "react"

export type CompletionHighlightTarget = "payment" | "selections" | "both" | null

// Stripe's refund processing time is maximum 10 business days, we therefore
// add 2 days to the processing time to account for weekends
// See https://support.stripe.com/questions/where-is-my-customers-refund
const MAX_REFUND_PROCESSING_DAYS = 12

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

interface MainPoolCardProps {
  attendance: Attendance
  user: User | null
  authorizeUrl: string
  chargeScheduleDate?: Date | null
  registrationAvailability?: RegistrationAvailability | null
  hasAttachedActionBelow?: boolean
  setCompletionHighlightTarget: (target: CompletionHighlightTarget) => void
  isCompletionHighlightHidden: boolean
  onToggleCompletionHighlightHidden: () => void
}

export const MainPoolCard: FC<MainPoolCardProps> = ({
  attendance,
  user,
  authorizeUrl,
  chargeScheduleDate,
  registrationAvailability = null,
  hasAttachedActionBelow = false,
  setCompletionHighlightTarget,
  isCompletionHighlightHidden,
  onToggleCompletionHighlightHidden,
}) => {
  const now = new Date()
  const attendee = getAttendee(attendance, user)

  const deregisterDeadlineForAttendee =
    attendee !== null ? getActualDeregisterDeadlineForAttendee(attendance, attendee) : null
  const deadlineTick = useDeadlineTick(attendee?.completionDeadline, deregisterDeadlineForAttendee)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `deadlineTick` forces recomputation when a completion deadline passes
  const completion = useMemo(() => {
    if (attendee !== null) {
      return buildRegistrationAvailabilityCompletionView(attendance, attendee)
    }

    return registrationAvailability?.completion ?? null
  }, [attendance, attendee, registrationAvailability?.completion, deadlineTick])
  const highlightEnabled = !isCompletionHighlightHidden

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
  const selectionsAreMissing = completion?.missingRequirements.includes("SELECTIONS") ?? false
  const selectionsMissedDeadline = completion?.missedRequirements.includes("SELECTIONS") ?? false

  const isWithinCompletionCountdown =
    completionCountdownInterval && hasMissingRequirements ? isWithinInterval(now, completionCountdownInterval) : false

  const completionDeadlineHasPassed =
    completion?.completionDeadline != null && isAfter(now, completion.completionDeadline)

  const showCompletionPanel =
    hasMissingRequirements &&
    completion?.completionDeadline !== null &&
    (isWithinCompletionCountdown || completionDeadlineHasPassed)

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

  const queuedAttendeeCount = getQueuedAttendeeCount(attendance, pool.id)
  const registeredAttendeeCount = getRegisteredAttendeeCount(attendance, pool.id)
  const hasWaitlist = queuedAttendeeCount > 0

  const servingPunishment =
    attendee?.earliestReservationAt &&
    isFuture(attendee.earliestReservationAt) &&
    isAfter(attendee.earliestReservationAt, addSeconds(attendee.createdAt, 1))

  const actionIsRequired = (completion?.missingRequirements.length ?? 0) > 0
  const attendeeState = completion?.attendeeState ?? null
  const isRegistered = attendeeState === "REGISTERED"
  const isReserved = attendeeState === "RESERVED"
  const isQueued = attendeeState === "QUEUED"
  const stripeColorA = cn(isQueued ? "bg-fuchsia-100 dark:bg-fuchsia-900/66" : "bg-yellow-100 dark:bg-amber-800/50")
  const stripeColorB = cn(isQueued ? "bg-fuchsia-200/33 dark:bg-white/7" : "bg-yellow-200/40 dark:bg-white/7")

  const cardBody = (
    <div className="flex flex-col min-h-40 gap-6 p-2 items-center text-center justify-center w-full">
      {!showRegisterCountdown && (
        <div className="flex grow flex-col gap-4 items-center text-center justify-center">
          <div className="flex flex-col gap-1 items-center">
            <Text
              className={cn(
                "text-3xl px-2 py-1",
                hasWaitlist &&
                  (isRegistered || isReserved) &&
                  (actionIsRequired
                    ? "bg-yellow-200 dark:bg-amber-800 dark:saturate-75 rounded-lg"
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

            {hasWaitlist && (
              <Text
                className={cn(
                  "text-lg px-2 py-0.5",
                  isQueued && !actionIsRequired && "bg-indigo-200 dark:bg-indigo-800 rounded-md",
                  isQueued && actionIsRequired && "bg-fuchsia-200 dark:bg-fuchsia-800 dark:saturate-80 rounded-md"
                )}
                suppressHydrationWarning
              >
                +<RollingNumber value={queuedAttendeeCount} /> i kø
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {servingPunishment ? (
              <PunishmentStatus attendee={attendee} actionIsRequired={actionIsRequired} />
            ) : (
              <AttendanceStatus attendance={attendance} attendee={attendee} actionIsRequired={actionIsRequired} />
            )}

            <PaymentStatus
              attendance={attendance}
              attendee={attendee}
              chargeScheduleDate={chargeScheduleDate}
              hideUnpaidStatus={showCompletionPanel && paymentIsMissing}
              highlightEnabled={highlightEnabled}
              onHighlightEnter={() => {
                setCompletionHighlightTarget("payment")
              }}
              onHighlightLeave={() => {
                setCompletionHighlightTarget(null)
              }}
            />
            <SelectionStatus
              attendance={attendance}
              attendee={attendee}
              hideIncompleteStatus={showCompletionPanel && selectionsAreMissing}
              selectionsMissedDeadline={selectionsMissedDeadline}
              highlightEnabled={highlightEnabled}
              onHighlightEnter={() => {
                setCompletionHighlightTarget("selections")
              }}
              onHighlightLeave={() => {
                setCompletionHighlightTarget(null)
              }}
            />
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

      <CompletionCard
        visible={showCompletionPanel}
        countdownDisplay={completionCountdownDisplay}
        paymentIsMissing={paymentIsMissing}
        selectionsAreMissing={selectionsAreMissing}
        hasAttachedActionBelow={hasAttachedActionBelow}
        isQueued={isQueued}
        highlightEnabled={highlightEnabled}
        setCompletionHighlightTarget={setCompletionHighlightTarget}
        onToggleHighlightHidden={onToggleCompletionHighlightHidden}
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
        "flex flex-col w-full overflow-hidden",
        hasAttachedActionBelow ? "rounded-t-xl rounded-b-md" : "rounded-xl",
        !actionIsRequired && !attendee && "bg-gray-100 dark:bg-stone-700/50",
        !actionIsRequired && (isRegistered || isReserved) && "bg-green-100 dark:bg-green-900",
        !actionIsRequired && isQueued && "bg-indigo-100 dark:bg-indigo-900/75"
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-2 px-3 py-2 justify-center text-sm font-bold",
          !attendee && "bg-gray-200 dark:bg-stone-700",
          (isRegistered || isReserved) && !actionIsRequired && "bg-green-200 dark:bg-green-800",
          isQueued && !actionIsRequired && "bg-indigo-200 dark:bg-indigo-900",
          actionIsRequired && !attendee && "bg-gray-200 dark:bg-stone-700/50",
          actionIsRequired && isReserved && "bg-yellow-200 dark:bg-amber-900/50",
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

  if (attendee.registered === true) {
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
  hideUnpaidStatus?: boolean
  highlightEnabled?: boolean
  onHighlightEnter?: () => void
  onHighlightLeave?: () => void
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

interface UnpaidStatusProps extends PriceStatusProps {
  highlightEnabled?: boolean
  onHighlightEnter?: () => void
  onHighlightLeave?: () => void
}

const UnpaidStatus = ({
  price,
  registered,
  highlightEnabled = false,
  onHighlightEnter,
  onHighlightLeave,
}: UnpaidStatusProps) => {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover highlights the payment action below
    <div
      className={cn(
        "flex flex-row w-fit items-center gap-2 pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm transition-colors",
        registered && "bg-orange-200 dark:bg-red-900",
        !registered && "bg-pink-200 dark:bg-pink-900",
        highlightEnabled && registered && "cursor-pointer hover:bg-orange-300 dark:hover:bg-red-800",
        highlightEnabled && !registered && "cursor-pointer hover:bg-pink-300 dark:hover:bg-pink-800"
      )}
      onMouseEnter={() => {
        if (highlightEnabled) {
          onHighlightEnter?.()
        }
      }}
      onMouseLeave={() => {
        if (highlightEnabled) {
          onHighlightLeave?.()
        }
      }}
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

const PaymentStatus = ({
  attendance,
  attendee,
  chargeScheduleDate,
  hideUnpaidStatus = false,
  highlightEnabled = false,
  onHighlightEnter,
  onHighlightLeave,
}: PaymentStatusProps) => {
  const hasPaid = hasAttendeePaid(attendee, attendance.attendancePrice)
  const price = attendance.attendancePrice

  if (hasPaid === null || price === null) {
    return null
  }

  if (!attendee) {
    return <PriceStatus price={price} registered={false} />
  }

  if (!attendee.registered) {
    return null
  }

  if (!hasPaid) {
    if (hideUnpaidStatus) {
      return null
    }

    return (
      <UnpaidStatus
        price={price}
        registered={attendee.registered === true}
        highlightEnabled={highlightEnabled}
        onHighlightEnter={onHighlightEnter}
        onHighlightLeave={onHighlightLeave}
      />
    )
  }

  if (attendee.paymentRefundedAt) {
    return <RefundedStatus price={price} refundedAt={attendee.paymentRefundedAt} />
  }

  if (attendee.paymentChargedAt) {
    return <PaidStatus price={price} registered={attendee.registered === true} />
  }

  if (attendee.paymentReservedAt) {
    return <ReservedPaymentStatus price={price} chargeScheduleDate={chargeScheduleDate} />
  }

  return null
}

interface SelectionStatusProps {
  attendance: Attendance
  attendee: Attendee | null
  hideIncompleteStatus?: boolean
  selectionsMissedDeadline?: boolean
  highlightEnabled?: boolean
  onHighlightEnter?: () => void
  onHighlightLeave?: () => void
}

const SelectionStatus = ({
  attendance,
  attendee,
  hideIncompleteStatus = false,
  selectionsMissedDeadline = false,
  highlightEnabled = false,
  onHighlightEnter,
  onHighlightLeave,
}: SelectionStatusProps) => {
  if (attendee === null || attendee.registered !== true || attendance.selections.length === 0) {
    return null
  }

  const hasSelected = hasAttendeeCompletedSelections(attendance.selections, attendee.selections)

  if (!hasSelected) {
    if (selectionsMissedDeadline) {
      return (
        <div className="flex flex-row w-fit items-center gap-2 pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm bg-red-200 dark:bg-red-950">
          <IconX className="size-[1.25em] text-red-700 dark:text-red-400" />
          <Text>Du fullførte ikke valgene i tide</Text>
        </div>
      )
    }

    if (hideIncompleteStatus) {
      return null
    }

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: hover highlights the selection form below
      <div
        className={cn(
          "flex flex-row w-fit items-center gap-2 pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm transition-colors",
          attendee.registered && "bg-orange-200 dark:bg-red-900",
          !attendee.registered && "bg-pink-200 dark:bg-pink-900",
          highlightEnabled && attendee.registered && "cursor-pointer hover:bg-orange-300 dark:hover:bg-red-800",
          highlightEnabled && !attendee.registered && "cursor-pointer hover:bg-pink-300 dark:hover:bg-pink-800"
        )}
        onMouseEnter={() => {
          if (highlightEnabled) {
            onHighlightEnter?.()
          }
        }}
        onMouseLeave={() => {
          if (highlightEnabled) {
            onHighlightLeave?.()
          }
        }}
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

interface CompletionCardProps {
  visible: boolean
  countdownDisplay: ReactNode
  paymentIsMissing: boolean
  selectionsAreMissing: boolean
  hasAttachedActionBelow: boolean
  isQueued: boolean
  highlightEnabled: boolean
  setCompletionHighlightTarget: (target: CompletionHighlightTarget) => void
  onToggleHighlightHidden: () => void
}

interface CompletionRequirementRowProps {
  label: string
  highlightEnabled: boolean
  highlightTarget: Exclude<CompletionHighlightTarget, null | "both">
  setCompletionHighlightTarget: (target: CompletionHighlightTarget) => void
  onHighlightLeave: () => void
}

const CompletionRequirementRow = ({
  label,
  highlightEnabled,
  highlightTarget,
  setCompletionHighlightTarget,
  onHighlightLeave,
}: CompletionRequirementRowProps) => {
  const touchActiveRef = useRef(false)
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current)
      }
    }
  }, [])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover highlights the related completion action below
    <div
      className={cn(
        "flex flex-row w-fit items-center gap-2 -mx-1 px-1 rounded-sm transition-colors",
        highlightEnabled && "cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
      )}
      onMouseEnter={() => {
        if (highlightEnabled) {
          setCompletionHighlightTarget(highlightTarget)
        }
      }}
      onMouseLeave={() => {
        if (highlightEnabled && !touchActiveRef.current) {
          onHighlightLeave()
        }
      }}
      onTouchStart={() => {
        if (!highlightEnabled) {
          return
        }

        touchActiveRef.current = true
        setCompletionHighlightTarget(highlightTarget)

        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current)
        }

        touchTimeoutRef.current = setTimeout(() => {
          touchActiveRef.current = false
          onHighlightLeave()
        }, secondsToMilliseconds(5))
      }}
    >
      <IconX className="size-[1.25em] text-red-700 dark:text-red-400" />
      <Text>{label}</Text>
    </div>
  )
}

const CompletionCard = ({
  visible,
  countdownDisplay,
  paymentIsMissing,
  selectionsAreMissing,
  hasAttachedActionBelow,
  isQueued,
  highlightEnabled,
  setCompletionHighlightTarget,
  onToggleHighlightHidden,
}: CompletionCardProps) => {
  const touchActiveRef = useRef(false)
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current)
      }
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: card hover highlights all incomplete completion actions
    <div
      className={cn(
        "group/completion w-full shadow-md bg-background",
        hasAttachedActionBelow ? "rounded-t-md rounded-b-xs" : "rounded-md"
      )}
      onMouseEnter={() => {
        if (highlightEnabled) {
          setCompletionHighlightTarget("both")
        }
      }}
      onMouseLeave={() => {
        if (highlightEnabled && !touchActiveRef.current) {
          setCompletionHighlightTarget(null)
        }
      }}
      onTouchStart={() => {
        if (!highlightEnabled) {
          return
        }

        touchActiveRef.current = true
        setCompletionHighlightTarget("both")

        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current)
        }

        touchTimeoutRef.current = setTimeout(() => {
          touchActiveRef.current = false
          setCompletionHighlightTarget(null)
        }, secondsToMilliseconds(5))
      }}
    >
      <div
        className={cn(
          "relative flex flex-col gap-3 w-full overflow-hidden p-3",
          !isQueued && "bg-violet-200 dark:bg-violet-900/75",
          isQueued && "bg-blue-200 dark:bg-sky-900/75",
          hasAttachedActionBelow ? "rounded-t-md rounded-b-xs" : "rounded-md"
        )}
      >
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleHighlightHidden()
              }}
              aria-label={
                highlightEnabled ? "Skjul fremheving av uferdig påmelding" : "Vis fremheving av uferdig påmelding"
              }
              className={cn(
                "absolute top-2 right-2 z-10 rounded-sm p-1 transition-opacity",
                "hover:bg-black/5 dark:hover:bg-white/10",
                "text-violet-500 saturate-50 hover:text-black dark:text-violet-400 dark:hover:text-white",
                "opacity-0 group-hover/completion:opacity-100"
              )}
            >
              {!highlightEnabled ? <IconEyeOff className="size-4" /> : <IconEyeSearch className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>{highlightEnabled ? "Skjul tips" : "Vis tips"}</TooltipContent>
        </Tooltip>
        <span
          className={cn(
            "absolute top-0 left-0 inset-0 bg-linear-to-t pointer-events-none transition-colors duration-400",
            "from-white/50 via-white/30 to-transparent",
            "dark:from-white/10 dark:via-white/3 dark:to-transparent"
          )}
        />
        <span
          className={cn(
            "absolute top-0 left-0 inset-0 bg-linear-to-t pointer-events-none transition-colors duration-400",
            "from-transparent via-red-300/6 to-red-300/15",
            "dark:from-transparent dark:via-red-500/5 dark:to-red-500/12"
          )}
        />

        <div className="relative flex flex-col gap-1 items-center justify-center w-full">
          <div className="relative flex flex-col gap-3">
            <Text className="text-base font-medium">Fullfør påmeldingen innen</Text>

            <Text suppressHydrationWarning className="text-3xl font-medium">
              {countdownDisplay}
            </Text>

            {(paymentIsMissing || selectionsAreMissing) && (
              <div className="flex flex-col gap-2 items-start w-fit">
                {paymentIsMissing && (
                  <CompletionRequirementRow
                    label="Du har ikke betalt"
                    highlightEnabled={highlightEnabled}
                    highlightTarget="payment"
                    setCompletionHighlightTarget={setCompletionHighlightTarget}
                    onHighlightLeave={() => {
                      setCompletionHighlightTarget("both")
                    }}
                  />
                )}
                {selectionsAreMissing && (
                  <CompletionRequirementRow
                    label="Du har ikke valgt"
                    highlightEnabled={highlightEnabled}
                    highlightTarget="selections"
                    setCompletionHighlightTarget={setCompletionHighlightTarget}
                    onHighlightLeave={() => {
                      setCompletionHighlightTarget("both")
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
