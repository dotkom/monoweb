"use client"

import { canManageEventFeaturedPriorities } from "@dotkomonline/rpc/event-permissions"
import { useAuthorization } from "@admin/auth/authorization-context"
import { SegmentedControlField } from "@admin/components/forms/SegmentedControlField"
import type { EventId } from "@dotkomonline/rpc/event"
import { FEATURED_PRIORITY_DURATION_HOURS, MAX_ACTIVE_FEATURED_PRIORITIES } from "@dotkomonline/rpc/event"
import { Button, FieldDescription, Text } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { differenceInHours } from "date-fns"
import type { FC } from "react"
import { useForm } from "react-hook-form"
import { useUpdateEventFeaturedPriorityMutation } from "../mutations"
import { useEventFeaturedPrioritiesQuery } from "../queries"
import { EventPriorityIndicatorCard } from "./EventPriorityIndicator"

const DURATION_OPTIONS = [
  { value: "SIX_HOURS", label: "6 timer" },
  { value: "ONE_DAY", label: "1 dag" },
  { value: "THREE_DAYS", label: "3 dager" },
  { value: "ONE_WEEK", label: "1 uke" },
] as const

const getSelectedDuration = (expiresAt: Date | undefined) => {
  if (!expiresAt) {
    return null
  }

  const remainingHours = differenceInHours(expiresAt, new Date(), { roundingMethod: "ceil" })
  const matchingDuration = DURATION_OPTIONS.find(
    (option) => FEATURED_PRIORITY_DURATION_HOURS[option.value] >= remainingHours
  )

  return matchingDuration ?? DURATION_OPTIONS.at(-1)
}

interface EventFeaturedPriorityProps {
  eventId: EventId
}

export const EventFeaturedPriority: FC<EventFeaturedPriorityProps> = ({ eventId }) => {
  const authorization = useAuthorization()
  const canManagePriorities = canManageEventFeaturedPriorities(authorization)

  const { priorities, isPending, isError, refetch } = useEventFeaturedPrioritiesQuery()
  const updatePriority = useUpdateEventFeaturedPriorityMutation()

  const priority = priorities.find((priority) => priority.eventId === eventId) ?? null
  const isAtCapacity = priorities.length >= MAX_ACTIVE_FEATURED_PRIORITIES && priority === null
  const selectedDuration = getSelectedDuration(priority?.expiresAt)
  const form = useForm({
    values: {
      duration: selectedDuration?.value ?? null,
    },
  })

  const isDisabled = updatePriority.isPending || isAtCapacity

  const handleRemovePriority = () => {
    updatePriority.mutate(
      {
        eventId,
        priority: null,
      },
      {
        onError: () => {
          form.reset()
        },
      }
    )
  }

  const handleDurationChange = (selectedValue: string | null) => {
    if (selectedValue === null) {
      handleRemovePriority()

      return
    }

    const duration = DURATION_OPTIONS.find((option) => option.value === selectedValue)

    if (duration === undefined) {
      return
    }

    updatePriority.mutate(
      {
        eventId,
        priority: {
          duration: duration.value,
        },
      },
      {
        onError: () => {
          form.reset()
        },
      }
    )
  }

  const handleRetry = () => {
    void refetch()
  }

  if (!canManagePriorities) {
    return null
  }

  if (isPending) {
    return <Text className="text-sm">Henter prioritering …</Text>
  }

  if (isError) {
    return (
      <div className="flex flex-row gap-2">
        <Text className="text-sm" role="alert">
          Kunne ikke hente prioriteringen.{" "}
        </Text>

        <Button onClick={handleRetry}>Prøv igjen</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControlField
          control={form.control}
          name="duration"
          label="Økt prioritering i arrangementlisten"
          description='Gi arrangementet en veldig høy plassering i "relevans"-sorteringen i arrangementlisten.'
          options={[...DURATION_OPTIONS]}
          disabled={isDisabled}
          onValueChange={handleDurationChange}
        />

        {priority !== null && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Fjern prioritering"
            disabled={updatePriority.isPending}
            onClick={handleRemovePriority}
          >
            <IconX className="size-4.5" />
          </Button>
        )}

        {isAtCapacity && (
          <FieldDescription className="text-destructive">Begge prioriteringsplassene er opptatt.</FieldDescription>
        )}
      </div>

      {priority !== null && <EventPriorityIndicatorCard expiresAt={priority.expiresAt} />}
    </div>
  )
}
