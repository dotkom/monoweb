"use client"

import { canManageEventFeaturedPriorities } from "@dotkomonline/rpc/event-permissions"
import { useCompactCountdown } from "@/utils/countdown/use-compact-countdown"
import { useAuthorization } from "@admin/auth/authorization-context"
import { cn, Text } from "@dotkomonline/ui"
import { IconClock } from "@tabler/icons-react"
import { isAfter } from "date-fns"

interface EventPriorityIndicatorProps {
  expiresAt: Date
  className?: string
}

export const EventPriorityIndicator = ({ expiresAt, className }: EventPriorityIndicatorProps) => {
  const authorization = useAuthorization()
  const canManagePriorities = canManageEventFeaturedPriorities(authorization)
  const expirationCountdown = useCompactCountdown(expiresAt)
  const now = new Date()

  if (!canManagePriorities || !isAfter(expiresAt, now)) {
    return null
  }

  return (
    <div
      className={cn(
        "inline-flex items-center h-6 gap-1.5 bg-green-100 dark:bg-green-950 rounded-full px-1.5",
        className
      )}
    >
      <div className="relative size-2.5">
        <div className="absolute inset-0 rounded-full size-2.5 bg-green-400 dark:bg-green-600 animate-ping" />
        <div className="absolute inset-0 rounded-full size-2.5 bg-green-500" />
      </div>

      <Text className="text-sm">{expirationCountdown} igjen</Text>
    </div>
  )
}

export const EventPriorityIndicatorCard = ({ expiresAt, className }: EventPriorityIndicatorProps) => {
  const authorization = useAuthorization()
  const canManagePriorities = canManageEventFeaturedPriorities(authorization)
  const expirationCountdown = useCompactCountdown(expiresAt)

  const now = new Date()

  if (!canManagePriorities || !isAfter(expiresAt, now)) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "flex items-center h-6 gap-2 bg-green-100 dark:bg-green-950 rounded-full px-1.5 w-fit",
            className
          )}
        >
          <div className="relative size-2.5 col-start-1">
            <div className="absolute inset-0 rounded-full size-2.5 bg-green-400 dark:bg-green-600 animate-ping" />
            <div className="absolute inset-0 rounded-full size-2.5 bg-green-500" />
          </div>

          <Text className="text-sm">Prioriteringen er aktiv</Text>
        </div>

        <div className="flex items-center h-6 gap-1.5 bg-muted rounded-full px-1.5">
          <IconClock className="size-4" />
          <Text className="text-sm">{expirationCountdown} igjen</Text>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Text className="text-sm text-destructive font-medium">Viktig!</Text>

        <Text className="text-sm">
          Bruk prioritering <span className="font-bold">kun i helt spesielle tilfeller</span> når et arrangement med
          stor økonomisk betydning for Online (Immball, Åre, osv.) får for lite synlighet i den vanlige rekkefølgen.
        </Text>

        <Text className="text-sm">
          Du skal <span className="font-bold">ikke</span> prioritere et arrangement fordi du syns det har dårlig
          påmelding. Sorteringen skal håndtere dette automatisk!
        </Text>

        <Text className="text-sm">
          La som hovedregel den vanlige rekkefølgen styre, slik at arrangementene behandles likt. Hvis det er behov for
          prioritering oftere enn et fåtall ganger i året, bør vi vurdere å justere hvordan arrangementene rangeres.
        </Text>
      </div>
    </div>
  )
}
