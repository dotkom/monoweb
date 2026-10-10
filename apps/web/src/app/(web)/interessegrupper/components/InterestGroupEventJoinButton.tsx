"use client"

import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconCheck } from "@tabler/icons-react"

interface Props {
  isLoggedIn: boolean
  isUserRegistered: boolean
  eventHasEnded: boolean
  isPending?: boolean
  onRegistrationClick: () => void
  size?: "sm"
  className?: string
}

export const InterestGroupEventJoinButton = ({
  isLoggedIn,
  isUserRegistered,
  eventHasEnded,
  isPending = false,
  onRegistrationClick,
  size,
  className,
}: Props) => {
  const fullPathname = useFullPathname()

  if (eventHasEnded) {
    return null
  }

  if (!isLoggedIn) {
    return (
      <Button element="a" href={createAuthorizeUrl({ returnTo: fullPathname })} size={size} className={className}>
        Logg inn for å bli med
      </Button>
    )
  }

  return (
    <Button
      size={size}
      className={cn(
        className,
        isUserRegistered &&
          "border-blue-200 bg-blue-100 text-blue-900 hover:bg-blue-200 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100 dark:hover:bg-blue-900"
      )}
      disabled={isPending}
      icon={isUserRegistered ? <IconCheck className="size-3.5" /> : undefined}
      onClick={onRegistrationClick}
    >
      {isUserRegistered ? "Du blir med" : "Bli med"}
    </Button>
  )
}
