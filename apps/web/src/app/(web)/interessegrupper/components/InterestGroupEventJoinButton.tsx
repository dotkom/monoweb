"use client"

import { useFullPathname } from "@/utils/use-full-pathname"
import {
  isInterestGroupEventDeregistrationOpen,
  isInterestGroupEventRegistrationOpen,
} from "@dotkomonline/rpc/interest-group-event"
import { Button, cn, Text, Tooltip, TooltipContent, TooltipTrigger, type ButtonVariant } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconCheck, IconCircleDashedCheck, IconLock } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { InterestGroupEventDeadlineLock } from "./InterestGroupEventDeadlineLock"

interface Props {
  isLoggedIn: boolean
  isUserRegistered: boolean
  isUserOnWaitlist: boolean
  waitlistPosition: number | null
  isAtCapacity: boolean
  eventHasEnded: boolean
  registerEnd: Date | null
  deregisterDeadline: Date | null
  isPending?: boolean
  onRegistrationClick: () => void
  size?: "sm"
  variant?: ButtonVariant
  className?: string
}

export const InterestGroupEventJoinButton = ({
  isLoggedIn,
  isUserRegistered,
  isUserOnWaitlist,
  waitlistPosition,
  isAtCapacity,
  eventHasEnded,
  registerEnd,
  deregisterDeadline,
  isPending = false,
  onRegistrationClick,
  size,
  variant,
  className,
}: Props) => {
  const fullPathname = useFullPathname()

  if (eventHasEnded) {
    return null
  }

  const canRegister = isInterestGroupEventRegistrationOpen({ registerEnd })
  const canDeregister = isInterestGroupEventDeregistrationOpen({ deregisterDeadline })
  const joinWithoutDeregisterLock = !canDeregister ? (
    <ButtonDeadlineLock reason={getJoinWithoutDeregistrationReason()} />
  ) : undefined
  const waitlistJoinLabel = isAtCapacity ? "Bli med i køen" : "Bli med"
  const waitlistRegisteredLabel = waitlistPosition !== null ? `${waitlistPosition}. i køen` : "Du er i kø"

  if (!isLoggedIn) {
    if (!canRegister) {
      return (
        <DisabledJoinButton size={size} className={className} reason={getRegistrationClosedReason()}>
          {waitlistJoinLabel}
        </DisabledJoinButton>
      )
    }

    return (
      <Button
        element="a"
        href={createAuthorizeUrl({ returnTo: fullPathname })}
        size={size}
        variant={variant}
        className={cn(isAtCapacity && waitlistButtonClassName, className)}
        iconRight={joinWithoutDeregisterLock}
      >
        Logg inn for å bli med
      </Button>
    )
  }

  if (isUserRegistered) {
    const registeredClassName = isUserOnWaitlist ? waitlistButtonClassName : registeredButtonClassName
    const registeredLabel = isUserOnWaitlist ? waitlistRegisteredLabel : "Du blir med"
    const registeredIcon = isUserOnWaitlist ? (
      <IconCircleDashedCheck className="size-3.5" />
    ) : (
      <IconCheck className="size-3.5" />
    )

    if (!canDeregister) {
      return (
        <DisabledJoinButton
          size={size}
          className={className}
          buttonClassName={registeredClassName}
          reason={getDeregistrationClosedReason()}
          icon={registeredIcon}
        >
          {registeredLabel}
        </DisabledJoinButton>
      )
    }

    return (
      <Button
        size={size}
        className={cn(registeredClassName, className)}
        disabled={isPending}
        icon={registeredIcon}
        onClick={onRegistrationClick}
      >
        {registeredLabel}
      </Button>
    )
  }

  if (!canRegister) {
    return (
      <DisabledJoinButton size={size} className={className} reason={getRegistrationClosedReason()}>
        {waitlistJoinLabel}
      </DisabledJoinButton>
    )
  }

  return (
    <Button
      size={size}
      variant={isAtCapacity ? undefined : variant}
      className={cn(isAtCapacity && waitlistButtonClassName, className)}
      disabled={isPending}
      iconRight={joinWithoutDeregisterLock}
      onClick={onRegistrationClick}
    >
      {waitlistJoinLabel}
    </Button>
  )
}

const registeredButtonClassName =
  "border-green-200 bg-green-100 text-green-800 hover:border-green-200 hover:bg-green-200 hover:text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-100 dark:hover:border-green-900 dark:hover:bg-green-900 dark:hover:text-green-100"

const waitlistButtonClassName =
  "border-indigo-200 bg-indigo-100 text-indigo-800 hover:border-indigo-200 hover:bg-indigo-200 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-600/25 dark:text-indigo-100 dark:hover:border-indigo-800 dark:hover:bg-indigo-600/40 dark:hover:text-indigo-100"

function DisabledJoinButton({
  children,
  reason,
  size,
  className,
  buttonClassName,
  icon,
}: {
  children: ReactNode
  reason: string
  size?: "sm"
  className?: string
  buttonClassName?: string
  icon?: ReactNode
}) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex cursor-default", className)}>
          <Button
            size={size}
            className={cn("w-full cursor-default disabled:opacity-80 dark:disabled:opacity-50", buttonClassName)}
            disabled
            icon={icon}
            iconRight={<IconLock className="size-3.5" />}
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="w-fit max-w-64 p-2">
        <Text size="sm">{reason}</Text>
      </TooltipContent>
    </Tooltip>
  )
}

function ButtonDeadlineLock({ reason }: { reason: string }) {
  return (
    <InterestGroupEventDeadlineLock
      reason={reason}
      className="bg-transparent p-0 text-current"
      iconClassName="text-current"
    />
  )
}

export function getRegistrationClosedReason() {
  return "Påmeldingsfristen har utløpt."
}

export function getDeregistrationClosedReason() {
  return "Avmeldingsfristen har utløpt."
}

export function getJoinWithoutDeregistrationReason() {
  return "Du kan fortsatt bli med, men ikke melde deg av. Avmeldingsfristen har utløpt."
}
