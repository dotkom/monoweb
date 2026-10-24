"use client"

import type { AttendanceRouter } from "@dotkomonline/rpc"
import { type AttendanceView, getAttendee } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import { Button, Text, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import {
  IconBan,
  IconLoader2,
  IconLockFilled,
  IconPennantFilled,
  IconUserMinus,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react"
import { type FC, useEffect, useState } from "react"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { getAttendanceStatus } from "../attendanceStatus"
import { deregistrationRejectionMessages } from "./deregistrationRejectionMessages"
import { registrationRejectionMessages } from "./registrationRejectionMessages"
import transitionStyles from "./AttendanceTransition.module.css"

const DEREGISTER_BUTTON_COLOR = "bg-red-300 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800" as const

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

export type TurnstileStatus = "loading" | "ready" | "verified" | "failed" | "not-required"

export const getTurnstileStatus = ({
  requiresTurnstile,
  turnstileToken,
  turnstileHasFailed,
  turnstileHasLoaded,
}: {
  requiresTurnstile: boolean
  turnstileToken: string | null
  turnstileHasFailed: boolean
  turnstileHasLoaded: boolean
}): TurnstileStatus => {
  if (!requiresTurnstile) {
    return "not-required"
  }

  if (turnstileToken) {
    return "verified"
  }

  if (turnstileHasFailed) {
    return "failed"
  }

  if (turnstileHasLoaded) {
    return "ready"
  }

  return "loading"
}

const getButtonColor = (
  disabled: boolean,
  attendee: boolean,
  isPoolFull: boolean,
  hasPunishment: boolean,
  hasMergeDelay: boolean
) => {
  if (disabled) {
    return "bg-gray-200 dark:bg-stone-700"
  }

  if (attendee) {
    return DEREGISTER_BUTTON_COLOR
  }

  if (isPoolFull || hasPunishment || hasMergeDelay) {
    return "bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-800 dark:hover:bg-indigo-700"
  }

  return "bg-green-300 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
}

const getDisabledText = (
  registrationAvailability: RegistrationAvailability | undefined,
  turnstileStatus: TurnstileStatus,
  isLoggedIn: boolean,
  attendance: AttendanceView
): string | null => {
  if (!isLoggedIn) {
    return "Du må være innlogget for å melde deg på"
  }

  if (registrationAvailability === undefined) {
    return null
  }

  if (registrationAvailability.deregistration !== null) {
    if (
      !registrationAvailability.deregistration.canDeregister &&
      registrationAvailability.deregistration.rejectionCause
    ) {
      return deregistrationRejectionMessages[registrationAvailability.deregistration.rejectionCause]
    }

    return null
  }

  const registration = registrationAvailability.registration

  if (registration === null) {
    return null
  }

  const attendanceStatus = getAttendanceStatus(attendance)

  if (attendanceStatus === "NOT_OPENED") {
    return registrationRejectionMessages.TOO_EARLY
  }

  if (turnstileStatus === "loading") {
    return registrationRejectionMessages.TURNSTILE_LOADING
  }

  if (turnstileStatus === "failed") {
    return registrationRejectionMessages.TURNSTILE_FAILED
  }

  if (turnstileStatus === "ready") {
    return registrationRejectionMessages.MISSING_TURNSTILE_TOKEN
  }

  if (attendanceStatus === "CLOSED" || registration.eventRejectionCause === "TOO_LATE") {
    return registrationRejectionMessages.TOO_LATE
  }

  if (registration.userRejectionCause !== null) {
    return registrationRejectionMessages[registration.userRejectionCause]
  }

  return null
}

interface RegistrationButtonProps {
  registerForAttendance: () => void
  unregisterForAttendance: (deregisterReason: DeregisterReasonFormResult | null) => void
  attendance: AttendanceView
  registrationAvailability: RegistrationAvailability | undefined
  user: User | null
  isLoading: boolean
  turnstileStatus: TurnstileStatus
  setDeregisterModalOpen: (open: boolean) => void
}

export const RegistrationButton: FC<RegistrationButtonProps> = ({
  registerForAttendance,
  unregisterForAttendance,
  attendance,
  registrationAvailability,
  user,
  isLoading,
  turnstileStatus,
  setDeregisterModalOpen,
}) => {
  const [confirmGracePeriodDeregister, setConfirmDeregister] = useState(false)

  const attendee = getAttendee(attendance, user)
  const deregistration = registrationAvailability?.deregistration ?? null
  const isWithinDeregisterGracePeriod = deregistration?.isWithinGracePeriod ?? false

  useEffect(() => {
    if (attendee === null || !isWithinDeregisterGracePeriod) {
      setConfirmDeregister(false)
    }
  }, [attendee, isWithinDeregisterGracePeriod])

  const isPoolFull = registrationAvailability?.pool?.isPoolFull ?? false
  const punishment = registrationAvailability?.punishment ?? null
  const hasPunishment = punishment !== null && (punishment.delay > 0 || punishment.suspended)
  const hasMergeDelay = registrationAvailability?.registration?.hasMergeDelay ?? false

  const buttonText = attendee ? "Meld meg av" : "Meld meg på"

  const disabledText = getDisabledText(registrationAvailability, turnstileStatus, Boolean(user), attendance)
  const isAvailabilityPending = Boolean(user) && registrationAvailability === undefined
  const isButtonDisabled = Boolean(disabledText) || isLoading || isAvailabilityPending

  const handleClick = () => {
    if (!attendee) {
      registerForAttendance()
      return
    }

    if (isWithinDeregisterGracePeriod) {
      setConfirmDeregister(true)
    } else {
      setDeregisterModalOpen(true)
    }
  }

  const handleDeregisterConfirm = () => {
    unregisterForAttendance(null)
    setConfirmDeregister(false)
  }

  const showDeregisterConfirm =
    attendee !== null && isWithinDeregisterGracePeriod && confirmGracePeriodDeregister && !isButtonDisabled

  let DisabledIcon = attendee ? IconUserMinus : IconUserPlus

  if (
    deregistration?.canDeregister === false &&
    (deregistration.rejectionCause === "DEREGISTER_DEADLINE_PASSED" ||
      deregistration.rejectionCause === "PAYMENT_COMPLETED")
  ) {
    DisabledIcon = IconLockFilled
  }

  if (attendee === null) {
    const attendanceStatus = getAttendanceStatus(attendance)

    if (attendanceStatus === "NOT_OPENED") {
      DisabledIcon = IconPennantFilled
    }

    if (attendanceStatus === "CLOSED") {
      DisabledIcon = IconBan
    }
  }

  const buttonContent = isLoading ? (
    <IconLoader2 className="shrink-0 size-6 animate-spin" />
  ) : (
    <>
      {!showDeregisterConfirm &&
        (isButtonDisabled ? (
          <DisabledIcon aria-hidden className="shrink-0 size-[1.25em]" />
        ) : attendee ? (
          <IconUserMinus className="shrink-0 size-[1.25em]" />
        ) : (
          <IconUserPlus className="shrink-0 size-[1.25em]" />
        ))}

      <Text element="span" className="font-medium">
        {showDeregisterConfirm ? "Er du sikker?" : buttonText}
      </Text>
    </>
  )

  const actionButton = (
    <div className="flex flex-row gap-2 items-stretch w-full">
      <Button
        onClick={showDeregisterConfirm ? handleDeregisterConfirm : handleClick}
        disabled={isButtonDisabled}
        className={cn(
          "text-base rounded-lg h-fit min-h-16 min-w-0 flex-1 transition-colors duration-260 ease-smooth motion-reduce:transition-none",
          isButtonDisabled && "text-gray-800 dark:text-stone-300",
          getButtonColor(isButtonDisabled, Boolean(attendee), isPoolFull, hasPunishment, hasMergeDelay)
        )}
      >
        <span
          key={`${buttonText}-${isLoading}-${isButtonDisabled}`}
          className={cn("inline-flex items-center justify-center gap-2", transitionStyles.state)}
        >
          {buttonContent}
        </span>
      </Button>
      {showDeregisterConfirm && (
        <Button
          type="button"
          aria-label="Avbryt avmelding"
          onClick={() => setConfirmDeregister(false)}
          disabled={isLoading}
          className="rounded-lg aspect-square h-full min-w-16 px-0 bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600"
        >
          <IconX className="size-[1.25em]" />
        </Button>
      )}
    </div>
  )

  if (disabledText) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{actionButton}</TooltipTrigger>
        <TooltipContent sideOffset={-10}>
          <Text>{disabledText}</Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return actionButton
}
