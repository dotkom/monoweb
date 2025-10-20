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
import { Button, Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn } from "@dotkomonline/ui"
import { isFuture } from "date-fns"
import { type FC, useState } from "react"
import { DeregisterModal } from "../DeregisterModal"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { getAttendanceStatus } from "../attendanceStatus"

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
  reservedToParentEvent: boolean | null
) => {
  if (!isLoggedIn) {
    return "Du må være innlogget for å melde deg på"
  }

  if (attendee) {
    if (isPastDeregisterDeadline && attendee.reserved) {
      return "Avmeldingsfristen har utløpt"
    }
    if (hasBeenCharged) {
      return "Betaling er utført. Kontakt arrangør for refusjon"
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
  unregisterForAttendance: (deregisterReason: DeregisterReasonFormResult) => void
  attendance: Attendance
  parentAttendance: Attendance | null
  punishment: Punishment | null
  user: User | null
  event: Event
  isLoading: boolean
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
}) => {
  const [deregisterModalOpen, setDeregisterModalOpen] = useState(false)

  const attendee = getAttendee(attendance, user)
  const pool = getAttendablePool(attendance, user)
  const attendanceStatus = getAttendanceStatus(attendance)
  const hasMembership = user !== null && Boolean(findActiveMembership(user))

  const isPastDeregisterDeadline = !isFuture(attendance.deregisterDeadline)
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
    Boolean(attendee?.paymentChargedAt),
    isPastDeregisterDeadline,
    Boolean(user),
    hasMembership,
    isSuspended,
    registeredToParentEvent,
    reservedToParentEvent
  )
  const disabled = Boolean(disabledText)

  const buttonContent = isLoading ? (
    <Icon icon="tabler:loader-2" className="animate-spin text-2xl py-2" />
  ) : (
    <div
      className={cn(
        "flex flex-row gap-2 items-center",
        disabled ? "text-gray-800 dark:text-stone-300" : "text-black dark:text-white"
      )}
    >
      <Icon className="text-lg" icon={`tabler:${disabled ? "lock" : attendee ? "user-minus" : "user-plus"}`} />
      <Text className="font-medium">{buttonText}</Text>
    </div>
  )

  const registrationButton = (
    <Button
      onClick={attendee ? () => setDeregisterModalOpen(true) : registerForAttendance}
      disabled={disabled}
      icon={buttonIcon}
      className={cn(
        "rounded-lg h-fit min-h-[4rem] flex-col gap-1",
        getButtonColor(disabled, Boolean(attendee), isPoolFull, hasPunishment, hasMergeDelay)
      )}
    >
      {buttonContent}
    </Button>
  )

  if (disabled) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{registrationButton}</TooltipTrigger>
          <TooltipContent sideOffset={-10}>
            <Text>{disabledText}</Text>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      {registrationButton}
      {attendee && (
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
