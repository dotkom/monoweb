"use client"

import { useUpdateEventMutation } from "@/app/(internal)/arrangementer/mutations"
import {
  useEventChildEventsQuery,
  useEventParentQuery,
  useEventWithAttendancesGetQuery,
} from "@/app/(internal)/arrangementer/queries"
import { EventSelectInput } from "@/components/forms/EventSelectInput"
import { FieldShell } from "@/components/forms/FieldShell"
import type { Event, EventId } from "@dotkomonline/rpc/event"
import { mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import { Badge, Button, Text, Title } from "@dotkomonline/ui"
import { IconCalendarEvent, IconLinkOff, IconX } from "@tabler/icons-react"
import { formatDate, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import type { FC } from "react"
import classes from "./parent-event-card.module.css"

interface ParentEventCardProps {
  eventId?: EventId
  parentId?: EventId | null
  onParentIdChange?: (parentId: EventId | null) => void
  disabled?: boolean
}

export const ParentEventCard: FC<ParentEventCardProps> = ({
  eventId,
  parentId: controlledParentId,
  onParentIdChange,
  disabled = false,
}) => {
  const isEditing = eventId !== undefined

  const { data: eventWithAttendance, isLoading: isLoadingEvent } = useEventWithAttendancesGetQuery(
    eventId ?? "",
    isEditing
  )
  const { data: parentEventWithAttendance, isLoading: isLoadingParent } = useEventParentQuery(eventId ?? "", isEditing)
  const { data: childEvents, isLoading: isLoadingChildren } = useEventChildEventsQuery(eventId ?? "", isEditing)
  const updateEvent = useUpdateEventMutation()

  const selectedParentId = isEditing ? (parentEventWithAttendance?.event.id ?? null) : (controlledParentId ?? null)

  const { data: controlledParentEventWithAttendance, isLoading: isLoadingControlledParent } =
    useEventWithAttendancesGetQuery(selectedParentId ?? "", !isEditing && Boolean(selectedParentId))

  const parentEvent = isEditing
    ? (parentEventWithAttendance?.event ?? null)
    : (controlledParentEventWithAttendance?.event ?? null)

  const hasChildren = (childEvents?.length ?? 0) > 0
  const isLoading =
    (isEditing && (isLoadingEvent || isLoadingParent || isLoadingChildren)) || (!isEditing && isLoadingControlledParent)
  const isUpdating = updateEvent.isPending

  const handleParentChange = (nextParentId: string) => {
    const normalized = nextParentId.length > 0 ? nextParentId : null

    if (isEditing && eventWithAttendance) {
      const { event } = eventWithAttendance
      updateEvent.mutate({
        id: event.id,
        event: {
          status: event.status,
          type: event.type,
          visibility: event.visibility,
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          imageUrl: event.imageUrl,
          locationTitle: event.locationTitle,
          locationAddress: event.locationAddress,
          locationLink: event.locationLink,
          markForMissedAttendance: event.markForMissedAttendance,
          contestId: event.contestId,
        },
        groupIds: event.hostingGroups.map((group) => group.slug),
        companyIds: event.companies.map((company) => company.id),
        parentId: normalized,
      })
      return
    }

    onParentIdChange?.(normalized)
  }

  if (isLoading) {
    return (
      <div className="rounded-md bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <Text className="text-sm">Laster forelderarrangement...</Text>
        </div>
      </div>
    )
  }

  if (hasChildren) {
    const childCount = childEvents?.length ?? 0
    const childCountLabel = childCount === 1 ? "1 underordnet arrangement" : `${childCount} underordnede arrangementer`

    return (
      <div className={`${classes.card} ${classes.cardWithParent} flex flex-col gap-2`}>
        <Title element="h3" size="sm">
          Dette arrangementet har {childCountLabel}
        </Title>
        <div className="max-h-[338px] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {childEvents?.map(({ event }) => (
              <EventPreview key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${classes.card} ${parentEvent ? classes.cardWithParent : classes.cardWithoutParent} flex flex-col gap-2`}
    >
      {parentEvent && (
        <>
          <Title element="h3" size="sm">
            Dette arrangementet er en del av
          </Title>
          <EventPreview event={parentEvent} />
        </>
      )}

      <FieldShell
        id="parent-event-select"
        label={parentEvent !== null ? "Bytt overordnet arrangement" : "Overordnet arrangement"}
        description={
          parentEvent === null
            ? "Velg dersom dette arrangementet tilhører et overordnet arrangement. Eksempel er bedriftspresentasjoner under ITEX eller arrangementer tilhørende fadderukene."
            : undefined
        }
      >
        <EventSelectInput
          id="parent-event-select"
          value={selectedParentId ?? ""}
          onChange={handleParentChange}
          placeholder="Søk etter arrangement..."
          disabled={disabled || isUpdating}
          excludeChildEvents
          excludeEventIds={eventId ? [eventId] : []}
        />
      </FieldShell>

      {parentEvent && (
        <Button
          variant="secondary"
          size="sm"
          className="w-fit"
          icon={<IconLinkOff className="size-4" />}
          disabled={disabled || isUpdating}
          onClick={() => handleParentChange("")}
        >
          Fjern kobling
        </Button>
      )}
    </div>
  )
}

const EventPreview: FC<{ event: Event }> = ({ event }) => {
  const past = isPast(event.end)

  return (
    <Link href={`/arrangementer/${event.id}`} className="no-underline text-inherit">
      <div className="flex flex-nowrap items-start gap-2 rounded-md bg-background p-2">
        <EventThumbnail
          imageUrl={event.imageUrl}
          title={event.title}
          past={past}
          eventTypeLabel={mapEventTypeToLabel(event.type)}
        />
        <div className="flex flex-col gap-1">
          <Text className="line-clamp-2 text-sm font-medium">{event.title}</Text>
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent size={14} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {formatDate(event.start, "dd. MMM yyyy 'kl.' HH:mm", { locale: nb })}
            </Text>
          </div>
        </div>
      </div>
    </Link>
  )
}

const EventThumbnail: FC<{
  imageUrl: string | null
  title: string
  past: boolean
  eventTypeLabel: string
}> = ({ imageUrl, title, past, eventTypeLabel }) => (
  <div className="relative shrink-0">
    {imageUrl ? (
      // biome-ignore lint/performance/noImgElement: i dont want to
      <img
        src={imageUrl}
        alt={title}
        width={120}
        height={68}
        className="rounded-sm object-cover"
        style={{ opacity: past ? 0.6 : 1 }}
      />
    ) : (
      <div className="flex h-[68px] w-[120px] items-center justify-center rounded-sm bg-muted">
        <IconX size={20} className="text-muted-foreground" />
      </div>
    )}
    <Badge className="absolute bottom-1 right-1 text-xs" variant="secondary">
      {eventTypeLabel}
    </Badge>
  </div>
)
