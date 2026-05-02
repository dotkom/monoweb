"use client"

import {
  type Attendance,
  type AttendanceStatus,
  type Attendee,
  type Event,
  type Punishment,
  type User,
  findActiveMembership,
  getAttendablePool,
  getAttendee,
  getReservedAttendeeCount,
} from "@dotkomonline/types"
import { Button, Text, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import { IconLoader2, IconLock, IconUserMinus, IconUserPlus } from "@tabler/icons-react"
import { addMilliseconds, hoursToMilliseconds, isFuture, min, secondsToMilliseconds } from "date-fns"
import { type FC, useState } from "react"
import { DeregisterModal } from "../DeregisterModal"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { getAttendanceStatus } from "../attendanceStatus"

// The backend requires a deregister reason 2 hours after registration. We subtract 15 seconds here to account for
// potential clock skew between client and server, so users near the grace period boundary don't experience errors due
// to small differences in system time.
const DEREGISTER_GRACE_PERIOD_MS = hoursToMilliseconds(2) - secondsToMilliseconds(15)

const getButtonColor = (
  disabled: boolean,
  attendee: boolean,
  isPoolFull: boolean,
  hasPunishment: boolean,
  hasMergeDelay: boolean
) => {
  if (disabled) return "bg-gray-200 dark:bg-stone-700 disabled:hover:bg-gray-200 dark:disabled:hover:bg-stone-700"
  if (attendee) return "bg-red-300 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
  if (isPoolFull || hasPunishment || hasMergeDelay)
    return "bg-yellow-200 hover:bg-yellow-100 dark:bg-yellow-800 dark:hover:bg-yellow-700"

  return "bg-green-300 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
}

const getDisabledText = (
  status: AttendanceStatus,
  attendee: Attendee | null,
  pool: boolean,
  hasBeenCharged: boolean,
  isPastDeregisterDeadline: boolean,
  isLoggedIn: boolean,
  hasMembership: boolean,
  isSuspended: boolean,
  registeredToParentEvent: boolean | null,
  reservedToParentEvent: boolean | null,
  hasTurnstileToken: boolean
) => {
  if (!isLoggedIn) {
    return "Du må være innlogget for å melde deg på"
  }

  const isAttending = attendee !== null

  if (!hasTurnstileToken && !isAttending) {
    return "Du må bekrefte at du ikke er en robot"
  }

  if (isAttending) {
    if (isPastDeregisterDeadline && attendee.reserved) {
      return "Avmeldingsfristen har utløpt"
    }
    if (hasBeenCharged) {
      return "Betaling er utført. Kontakt arrangør for avmelding og refusjon"
    }

    return null
  }

  if (isSuspended) {
    return "Du er suspendert fra Online"
  }
  if (!hasMembership) {
    return "Du må ha registrert medlemskap for å melde deg på"
  }
  if (status === "NotOpened") {
    return "Påmeldinger har ikke åpnet"
  }
  if (status === "Closed") {
    return "Påmeldingen er stengt"
  }
  if (!pool) {
    return "Du har ingen påmeldingsgruppe"
  }
  if (registeredToParentEvent === false) {
    return "Du er ikke påmeldt foreldrearrangementet"
  }
  if (reservedToParentEvent === false && registeredToParentEvent === true) {
    return "Du er i kø på foreldrearrangementet"
  }

  return null
}

interface RegistrationButtonProps {
  registerForAttendance: () => void
  unregisterForAttendance: (deregisterReason: DeregisterReasonFormResult | null) => void
  attendance: Attendance
  parentAttendance: Attendance | null
  punishment: Punishment | null
  user: User | null
  event: Event
  isLoading: boolean
  chargeScheduleDate: Date | null
  hasTurnstileToken: boolean
}

export const RegistrationButton: FC<RegistrationButtonProps> = ({
  registerForAttendance,
  unregisterForAttendance,
  attendance,
  parentAttendance,
  punishment,
  user,
  event,
  isLoading,
  chargeScheduleDate,
  hasTurnstileToken,
}) => {
  const [deregisterModalOpen, setDeregisterModalOpen] = useState(false)

  const attendee = getAttendee(attendance, user)
  const pool = getAttendablePool(attendance, user)
  const attendanceStatus = getAttendanceStatus(attendance)
  const hasMembership = user !== null && Boolean(findActiveMembership(user))

  const deregisterGracePeriodEnd =
    attendee !== null ? addMilliseconds(attendee.createdAt, DEREGISTER_GRACE_PERIOD_MS) : null
  const isWithinDeregisterGracePeriod = deregisterGracePeriodEnd !== null && isFuture(deregisterGracePeriodEnd)

  // TODO: dont calculate this in frontend
  const actualDeregisterDeadline = chargeScheduleDate
    ? min([attendance.deregisterDeadline, chargeScheduleDate])
    : attendance.deregisterDeadline

  const isPastDeregisterDeadline = !isFuture(actualDeregisterDeadline)
  const hasMergeDelay = pool?.mergeDelayHours ? pool.mergeDelayHours > 0 : false
  const isSuspended = punishment?.suspended ?? false
  const hasPunishment = punishment ? punishment.delay > 0 || isSuspended : false
  const isPoolFull = pool
    ? pool.capacity !== 0 && getReservedAttendeeCount(attendance, pool?.id) >= pool.capacity
    : false

  const parentAttendanceAttendee = parentAttendance && getAttendee(parentAttendance, user)
  const registeredToParentEvent = parentAttendance ? Boolean(parentAttendanceAttendee) : null
  const reservedToParentEvent = parentAttendance && parentAttendanceAttendee ? parentAttendanceAttendee.reserved : null

  const buttonText = attendee ? "Meld meg av" : "Meld meg på"
  const buttonIcon = null

  const disabledText = getDisabledText(
    attendanceStatus,
    attendee,
    Boolean(pool),
    Boolean(attendee?.paymentChargedAt && !attendee.paymentRefundedAt),
    isPastDeregisterDeadline,
    Boolean(user),
    hasMembership,
    isSuspended,
    registeredToParentEvent,
    reservedToParentEvent,
    hasTurnstileToken
  )
  const disabled = Boolean(disabledText)

  const handleClick = () => {
    if (!attendee) {
      registerForAttendance()
      return
    }

    if (isWithinDeregisterGracePeriod) {
      unregisterForAttendance(null)
    } else {
      setDeregisterModalOpen(true)
    }
  }

  const buttonContent = isLoading ? (
    <IconLoader2 className="shrink-0 size-6 animate-spin" />
  ) : (
    <>
      {disabled ? (
        <IconLock className="shrink-0 size-[1.25em]" />
      ) : attendee ? (
        <IconUserMinus className="shrink-0 size-[1.25em]" />
      ) : (
        <IconUserPlus className="shrink-0 size-[1.25em]" />
      )}

      <Text element="span" className="font-medium">
        {buttonText}
      </Text>
    </>
  )

  const registrationButton = (
    <Button
      onClick={handleClick}
      disabled={disabled}
      icon={buttonIcon}
      className={cn(
        "rounded-lg h-fit min-h-16",
        disabled && "text-gray-800 dark:text-stone-300",
        getButtonColor(disabled, Boolean(attendee), isPoolFull, hasPunishment, hasMergeDelay)
      )}
    >
      {buttonContent}
    </Button>
  )

  if (disabled) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{registrationButton}</TooltipTrigger>
        <TooltipContent sideOffset={-10}>
          <Text>{disabledText}</Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <>
      {registrationButton}
      {attendee && !isWithinDeregisterGracePeriod && (
        <DeregisterModal
          open={deregisterModalOpen}
          setOpen={setDeregisterModalOpen}
          event={event}
          unregisterForAttendance={unregisterForAttendance}
          attendee={attendee}
        />
      )}
    </>
  )
}
