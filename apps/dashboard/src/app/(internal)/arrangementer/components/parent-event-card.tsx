"use client"

import { useUpdateEventMutation } from "@/app/(internal)/arrangementer/mutations"
import {
  useEventChildEventsQuery,
  useEventParentQuery,
  useEventWithAttendancesGetQuery,
} from "@/app/(internal)/arrangementer/queries"
import type { Event, EventId } from "@dotkomonline/rpc/event"
import { mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import { Button, Group, Image, Loader, Pill, Stack, Text, Title } from "@mantine/core"
import { IconCalendarEvent, IconLinkOff, IconX } from "@tabler/icons-react"
import { formatDate, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import type { FC } from "react"
import { EventSelect } from "./event-select"

interface ParentEventCardProps {
  /** When editing an existing event, parent updates are persisted immediately. */
  eventId?: EventId
  /** Controlled parent id used when creating a new event. */
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
    (isEditing && (isLoadingEvent || isLoadingParent || isLoadingChildren)) ||
    (!isEditing && isLoadingControlledParent)
  const isUpdating = updateEvent.isPending

  const handleParentChange = (nextParentId: string | null) => {
    if (isEditing && eventWithAttendance) {
      const { event } = eventWithAttendance
      updateEvent.mutate({
        id: event.id,
        event: {
          status: event.status,
          type: event.type,
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
        parentId: nextParentId,
      })
      return
    }

    onParentIdChange?.(nextParentId)
  }

  if (isLoading) {
    return (
      <Stack p="md" bg="var(--mantine-color-gray-light)" style={{ borderRadius: "var(--mantine-radius-md)" }}>
        <Group gap="xs">
          <Loader size="sm" />
          <Text size="sm">Laster forelderarrangement...</Text>
        </Group>
      </Stack>
    )
  }

  if (hasChildren) {
    const childCount = childEvents?.length ?? 0
    const childCountLabel = childCount === 1 ? "ett underarrangement" : `${childCount} underarrangementer`

    return (
      <Stack p="md" bg="var(--mantine-color-gray-light)" style={{ borderRadius: "var(--mantine-radius-md)" }} gap="sm">
        <Title order={4}>Overordnet arrangement</Title>
        <Text size="sm">
          Dette arrangementet har {childCountLabel}, og kan derfor ikke være en del av et annet arrangement. Relasjoner
          er kun én avstand dype.
        </Text>
        <Stack gap="xs">
          {childEvents?.map(({ event }) => (
            <ChildEventRow key={event.id} event={event} />
          ))}
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack p="md" bg="var(--mantine-color-gray-light)" style={{ borderRadius: "var(--mantine-radius-md)" }} gap="sm">
      <Title order={4}>Dette arrangementet er en del av</Title>

      {parentEvent ? (
        <ParentEventPreview event={parentEvent} />
      ) : (
        <Text size="sm" c="dimmed">
          Ikke knyttet til et overordnet arrangement.
        </Text>
      )}

      <EventSelect
        label={parentEvent ? "Bytt forelderarrangement" : "Velg forelderarrangement"}
        placeholder="Søk etter arrangement..."
        description="Kun arrangementer uten egen forelder kan velges. Relasjoner er kun én avstand dype."
        value={selectedParentId}
        onChange={handleParentChange}
        clearable
        disabled={disabled || isUpdating}
        excludeChildEvents
        excludeEventIds={eventId ? [eventId] : []}
      />

      {parentEvent && (
        <Button
          variant="light"
          color="gray"
          w="fit-content"
          leftSection={<IconLinkOff size={16} />}
          disabled={disabled || isUpdating}
          onClick={() => handleParentChange(null)}
        >
          Fjern kobling
        </Button>
      )}
    </Stack>
  )
}

const ParentEventPreview: FC<{ event: Event }> = ({ event }) => {
  const past = isPast(event.end)

  return (
    <Link href={`/arrangementer/${event.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <Group
        gap="md"
        p="sm"
        bg="var(--mantine-color-body)"
        style={{ borderRadius: "var(--mantine-radius-sm)" }}
        wrap="nowrap"
      >
        <EventThumbnail
          imageUrl={event.imageUrl}
          title={event.title}
          past={past}
          eventTypeLabel={mapEventTypeToLabel(event.type)}
        />
        <Stack gap={4}>
          <Text fw={500} lineClamp={2}>
            {event.title}
          </Text>
          <Group gap={6}>
            <IconCalendarEvent size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              {formatDate(event.start, "dd. MMM yyyy 'kl.' HH:mm", { locale: nb })}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Link>
  )
}

const ChildEventRow: FC<{ event: Event }> = ({ event }) => (
  <Link href={`/arrangementer/${event.id}`} style={{ textDecoration: "none", color: "inherit" }}>
    <Group gap="xs" p="xs" bg="var(--mantine-color-body)" style={{ borderRadius: "var(--mantine-radius-sm)" }}>
      <Text size="sm" lineClamp={1}>
        {event.title}
      </Text>
    </Group>
  </Link>
)

const EventThumbnail: FC<{
  imageUrl: string | null
  title: string
  past: boolean
  eventTypeLabel: string
}> = ({ imageUrl, title, past, eventTypeLabel }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    {imageUrl ? (
      <Image
        src={imageUrl}
        alt={title}
        w={120}
        h={68}
        radius="sm"
        style={{ objectFit: "cover", opacity: past ? 0.6 : 1 }}
      />
    ) : (
      <Group
        w={120}
        h={68}
        bg="var(--mantine-color-gray-2)"
        style={{ borderRadius: "var(--mantine-radius-sm)" }}
        justify="center"
      >
        <IconX size={20} color="var(--mantine-color-dimmed)" />
      </Group>
    )}
    <Pill size="xs" style={{ position: "absolute", bottom: 4, right: 4 }} bg="var(--mantine-color-body)">
      {eventTypeLabel}
    </Pill>
  </div>
)
