"use client"

import { canManageEventFeaturedPriorities } from "@dotkomonline/rpc/event-permissions"
import { useAuthorization } from "@admin/auth/authorization-context"
import { type EventId, MAX_ACTIVE_FEATURED_PRIORITIES } from "@dotkomonline/rpc/event"
import { Button, Text, TextLink, Title } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import type { FC } from "react"
import { useUpdateEventFeaturedPriorityMutation } from "../mutations"
import { useEventFeaturedPrioritiesQuery } from "../queries"
import { EventPriorityIndicator } from "./EventPriorityIndicator"

export const PrioritizedEvents: FC = () => {
  const authorization = useAuthorization()
  const canManagePriorities = canManageEventFeaturedPriorities(authorization)
  const { priorities, isPending, isError, refetch } = useEventFeaturedPrioritiesQuery()
  const updatePriority = useUpdateEventFeaturedPriorityMutation()

  const handleRemovePriority = (eventId: EventId) => {
    updatePriority.mutate({ eventId, priority: null })
  }

  const handleRetry = () => {
    void refetch()
  }

  if (!canManagePriorities) {
    return null
  }

  if (isPending) {
    return <Text size="sm">Henter prioriteringer …</Text>
  }

  if (isError) {
    return (
      <Text size="sm" role="alert">
        Kunne ikke hente prioriteringene.{" "}
        <Button variant="ghost" onClick={handleRetry}>
          Prøv igjen
        </Button>
      </Text>
    )
  }

  if (priorities.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 w-fit my-6">
      <Title size="sm">
        Prioriterte arrangementer{" "}
        <span className="text-muted-foreground">
          ({priorities.length}/{MAX_ACTIVE_FEATURED_PRIORITIES})
        </span>
      </Title>

      {priorities.map((item) => (
        <div key={item.eventId} className="flex items-center gap-3">
          <TextLink href={`/admin/arrangementer/${item.eventId}`} className="min-w-0 flex-1 line-clamp-1 max-w-sm">
            {item.title}
          </TextLink>

          <div className="flex items-center gap-0.5">
            <EventPriorityIndicator expiresAt={item.expiresAt} />

            <Button
              type="button"
              color="red"
              size="icon-sm"
              className="border-none bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 size-6 rounded-full"
              aria-label={`Fjern prioritering for ${item.title}`}
              disabled={updatePriority.isPending}
              onClick={() => handleRemovePriority(item.eventId)}
            >
              <IconX size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
