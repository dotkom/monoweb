"use client"

import { useFullPathname } from "@/utils/use-full-pathname"
import type { SidequestRegistrationState } from "@dotkomonline/rpc/sidequest"
import { Button, cn, Text, Tooltip, TooltipContent, TooltipTrigger, type ButtonVariant } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconCheck, IconCircleDashedCheck, IconLock } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { SidequestDeadlineLock } from "./SidequestDeadlineLock"

interface Props {
  isLoggedIn: boolean
  registrationState: SidequestRegistrationState
  eventHasEnded: boolean
  isPending?: boolean
  onRegistrationClick: () => void
  size?: "sm"
  variant?: ButtonVariant
  className?: string
}

export const SidequestJoinButton = ({
  isLoggedIn,
  registrationState,
  eventHasEnded,
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

  const canRegister = registrationState.isRegistrationOpen
  const canDeregister = registrationState.isDeregistrationOpen
  const joinWithoutDeregisterLock = !canDeregister ? (
    <ButtonDeadlineLock reason={getJoinWithoutDeregistrationReason()} />
  ) : undefined
  const queueJoinLabel = registrationState.isAtCapacity ? "Bli med i køen" : "Bli med"
  const queueRegisteredLabel =
    registrationState.queuePosition !== null ? `${registrationState.queuePosition}. i køen` : "Du er i kø"

  if (!isLoggedIn) {
    if (!canRegister) {
      return (
        <DisabledJoinButton size={size} className={className} reason={getRegistrationClosedReason()}>
          {queueJoinLabel}
        </DisabledJoinButton>
      )
    }

    return (
      <Button
        element="a"
        href={createAuthorizeUrl({ returnTo: fullPathname })}
        size={size}
        variant={variant}
        className={cn(registrationState.isAtCapacity && queueButtonClassName, className)}
        iconRight={joinWithoutDeregisterLock}
      >
        Logg inn for å bli med
      </Button>
    )
  }

  if (registrationState.isUserRegistered) {
    const registeredClassName = registrationState.isUserInQueue ? queueButtonClassName : registeredButtonClassName
    const registeredLabel = registrationState.isUserInQueue ? queueRegisteredLabel : "Du blir med"
    const registeredIcon = registrationState.isUserInQueue ? (
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
        {queueJoinLabel}
      </DisabledJoinButton>
    )
  }

  return (
    <Button
      size={size}
      variant={registrationState.isAtCapacity ? undefined : variant}
      className={cn(registrationState.isAtCapacity && queueButtonClassName, className)}
      disabled={isPending}
      iconRight={joinWithoutDeregisterLock}
      onClick={onRegistrationClick}
    >
      {queueJoinLabel}
    </Button>
  )
}

const registeredButtonClassName =
  "border-green-200 bg-green-100 text-green-800 hover:border-green-200 hover:bg-green-200 hover:text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-100 dark:hover:border-green-900 dark:hover:bg-green-900 dark:hover:text-green-100"

const queueButtonClassName =
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
    <SidequestDeadlineLock reason={reason} className="bg-transparent p-0 text-current" iconClassName="text-current" />
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
