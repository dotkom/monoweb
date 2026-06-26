"use client"

import type { AttendanceRouter } from "@dotkomonline/rpc"
import { type Attendance, type Event, type User, getAttendee } from "@dotkomonline/types"
import { Button, Text, Tooltip, TooltipContent, TooltipTrigger, cn } from "@dotkomonline/ui"
import { IconLoader2, IconLock, IconUserMinus, IconUserPlus, IconX } from "@tabler/icons-react"
import { type FC, useEffect, useState } from "react"
import { DeregisterModal } from "../DeregisterModal"
import type { DeregisterReasonFormResult } from "../DeregisterModal"
import { deregistrationRejectionMessages } from "./deregistrationRejectionMessages"
import { registrationRejectionMessages } from "./registrationRejectionMessages"

const DEREGISTER_BUTTON_COLOR = "bg-red-300 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800" as const

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

const getButtonColor = (
  disabled: boolean,
  attendee: boolean,
  isPoolFull: boolean,
  hasPunishment: boolean,
  hasMergeDelay: boolean
) => {
  if (disabled) {
    return "bg-gray-200 dark:bg-stone-700 disabled:hover:bg-gray-200 dark:disabled:hover:bg-stone-700"
  }

  if (attendee) {
    return DEREGISTER_BUTTON_COLOR
  }

  if (isPoolFull || hasPunishment || hasMergeDelay) {
    return "bg-yellow-200 hover:bg-yellow-100 dark:bg-yellow-800 dark:hover:bg-yellow-700"
  }

  return "bg-green-300 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
}

const getDisabledText = (
  registrationAvailability: RegistrationAvailability | undefined,
  hasTurnstileToken: boolean,
  isLoggedIn: boolean
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

  if (!hasTurnstileToken) {
    return registrationRejectionMessages.MISSING_TURNSTILE_TOKEN
  }

  if (!registration.canRegister && registration.rejectionCause) {
    return registrationRejectionMessages[registration.rejectionCause]
  }

  return null
}

interface RegistrationButtonProps {
  registerForAttendance: () => void
  unregisterForAttendance: (deregisterReason: DeregisterReasonFormResult | null) => void
  attendance: Attendance
  registrationAvailability: RegistrationAvailability | undefined
  user: User | null
  event: Event
  isLoading: boolean
  turnstileHasLoaded: boolean
  hasTurnstileToken: boolean
}

export const RegistrationButton: FC<RegistrationButtonProps> = ({
  registerForAttendance,
  unregisterForAttendance,
  attendance,
  registrationAvailability,
  user,
  event,
  isLoading,
  turnstileHasLoaded,
  hasTurnstileToken,
}) => {
  const [deregisterModalOpen, setDeregisterModalOpen] = useState(false)
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
  const buttonIcon = null

  const disabledText = getDisabledText(registrationAvailability, hasTurnstileToken, Boolean(user))
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

  const buttonContent = isLoading ? (
    <IconLoader2 className="shrink-0 size-6 animate-spin" />
  ) : (
    <>
      {!turnstileHasLoaded && registrationAvailability?.deregistration === null ? (
        <IconLoader2 className="shrink-0 size-[1.25em] animate-spin" />
      ) : isButtonDisabled ? (
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
      disabled={isButtonDisabled}
      icon={buttonIcon}
      className={cn(
        "text-base rounded-lg h-fit min-h-16 w-full",
        isButtonDisabled && "text-gray-800 dark:text-stone-300",
        getButtonColor(isButtonDisabled, Boolean(attendee), isPoolFull, hasPunishment, hasMergeDelay)
      )}
    >
      {buttonContent}
    </Button>
  )

  const deregisterConfirmButton = (
    <div className="flex flex-row gap-2 items-stretch w-full">
      <Button
        onClick={handleDeregisterConfirm}
        disabled={isLoading}
        className={cn("text-base rounded-lg grow min-h-16", DEREGISTER_BUTTON_COLOR)}
      >
        {isLoading ? (
          <IconLoader2 className="shrink-0 size-6 animate-spin" />
        ) : (
          <Text element="span" className="font-medium">
            Er du sikker?
          </Text>
        )}
      </Button>
      <Button
        type="button"
        onClick={() => setConfirmDeregister(false)}
        disabled={isLoading}
        className="rounded-lg aspect-square h-full min-w-16 px-0 bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600"
      >
        <IconX className="size-[1.25em]" />
      </Button>
    </div>
  )

  const showDeregisterConfirm =
    attendee !== null && isWithinDeregisterGracePeriod && confirmGracePeriodDeregister && !isButtonDisabled

  const actionButton = showDeregisterConfirm ? deregisterConfirmButton : registrationButton

  if (disabledText) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="inline-flex w-full">{registrationButton}</span>
        </TooltipTrigger>
        <TooltipContent sideOffset={-10}>
          <Text>{disabledText}</Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <>
      {actionButton}
      {attendee && deregistration?.requiresDeregisterReason && (
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
