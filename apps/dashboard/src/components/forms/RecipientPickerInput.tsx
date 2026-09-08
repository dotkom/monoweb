"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { useGroupMembersAllQuery } from "@/app/(internal)/grupper/queries"
import { useTRPC } from "@/lib/trpc-client"
import { getActiveGroupMembership } from "@dotkomonline/rpc/group"
import { Button, Group, Input, Loader, Select, Stack, Text } from "@mantine/core"
import { skipToken, useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import type { FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"
import { openRecipientSelectionModal } from "./RecipientSelectionModal"
import {
  appendDirectMember,
  appendEventMembers,
  appendGroupMembers,
  arrayEqual,
  flattenRecipientIds,
  getRecipientPreview,
  selectionFromFlatIds,
  type RecipientMember,
  type RecipientSelection,
} from "./recipient-selection"
import type { InputFieldContext, InputProducerResult } from "./types"

interface RecipientPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

function useManagedRecipientSelection(value: string[], onChange: (ids: string[]) => void) {
  const [selection, setSelection] = useState<RecipientSelection>(() => selectionFromFlatIds(value))
  const lastEmittedValue = useRef(value)

  useEffect(() => {
    if (arrayEqual(value, lastEmittedValue.current)) {
      return
    }

    setSelection(selectionFromFlatIds(value))
    lastEmittedValue.current = value
  }, [value])

  const updateSelection = useCallback(
    (nextSelection: RecipientSelection) => {
      setSelection(nextSelection)
      const flatIds = flattenRecipientIds(nextSelection)
      lastEmittedValue.current = flatIds
      onChange(flatIds)
    },
    [onChange]
  )

  return { selection, updateSelection }
}

export function RecipientPickerInput({ value, onChange, disabled }: RecipientPickerProps) {
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventsEnabled, setEventsEnabled] = useState(false)

  const { selection, updateSelection } = useManagedRecipientSelection(value, onChange)
  const { count, previewNames, remainingCount } = getRecipientPreview(selection)

  const trpc = useTRPC()

  const { data: groups = [] } = useQuery(trpc.group.all.queryOptions())

  const { data: events, isLoading: eventsLoading } = useQuery({
    ...trpc.event.all.queryOptions({ filter: { excludingType: [], byStatus: ["PUBLIC", "DRAFT"] } }),
    enabled: eventsEnabled,
  })
  const eventItems = events?.items ?? []
  const selectedEvent = eventItems.find((eventItem) => eventItem.event.id === selectedEventId)
  const attendanceId = selectedEvent?.event.attendanceId ?? null

  const { members: groupMembers, isLoading: groupMembersLoading } = useGroupMembersAllQuery(
    selectedGroupSlug ?? "",
    selectedGroupSlug !== null
  )

  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(
      attendanceId !== null ? { id: attendanceId } : skipToken
    )
  )

  const handleAddDirectMember = (user: { id: string; name: string | null }) => {
    updateSelection(
      appendDirectMember(selection, {
        userId: user.id,
        name: user.name,
      })
    )
  }

  const handleAddGroupMembers = () => {
    if (selectedGroupSlug === null) {
      return
    }

    const groupLabel = groups.find((group) => group.slug === selectedGroupSlug)?.abbreviation ?? selectedGroupSlug
    const members: RecipientMember[] = Array.from(groupMembers.entries())
      .filter(([, member]) => getActiveGroupMembership(member, selectedGroupSlug) !== null)
      .map(([userId, member]) => ({
        userId,
        name: member.name,
      }))

    updateSelection(appendGroupMembers(selection, selectedGroupSlug, groupLabel, members))
  }

  const handleAddEventMembers = () => {
    if (selectedEvent === undefined || attendance === undefined) {
      return
    }

    const members: RecipientMember[] = attendance.attendees.map((attendee) => ({
      userId: attendee.user.id,
      name: attendee.user.name,
    }))

    updateSelection(
      appendEventMembers(selection, selectedEvent.event.id, selectedEvent.event.title, members)
    )
  }

  return (
    <Stack gap="sm">
        <Input.Wrapper label="Enkeltperson">
          <UserSearch
            placeholder="Søk etter navn eller e-post"
            disabled={disabled}
            onSubmit={handleAddDirectMember}
          />
        </Input.Wrapper>

        <Group align="flex-end" gap="xs">
          <Select
            style={{ flex: 1 }}
            label="Gruppe"
            placeholder="Søk etter gruppe"
            data={groups.map((group) => ({ value: group.slug, label: group.abbreviation }))}
            value={selectedGroupSlug}
            onChange={setSelectedGroupSlug}
            searchable
            clearable
            disabled={disabled}
          />
          <Button
            type="button"
            variant="light"
            disabled={disabled || selectedGroupSlug === null || groupMembersLoading}
            onClick={handleAddGroupMembers}
          >
            {groupMembersLoading ? <Loader size="xs" /> : "Legg til aktive"}
          </Button>
        </Group>

        <Group align="flex-end" gap="xs">
          <Select
            style={{ flex: 1 }}
            label="Arrangement"
            placeholder="Søk etter arrangement"
            data={eventItems.map((eventItem) => ({ value: eventItem.event.id, label: eventItem.event.title }))}
            value={selectedEventId}
            onChange={setSelectedEventId}
            onDropdownOpen={() => setEventsEnabled(true)}
            searchable
            clearable
            rightSection={eventsLoading ? <Loader size="xs" /> : undefined}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="light"
            disabled={disabled || attendanceId === null || attendanceLoading}
            onClick={handleAddEventMembers}
          >
            {attendanceLoading ? <Loader size="xs" /> : "Legg til påmeldte"}
          </Button>
        </Group>

        {count > 0 && (
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text size="sm">{count} mottaker(e) valgt</Text>
              <Text size="sm" c="dimmed" truncate="end">
                {previewNames.join(", ")}
                {remainingCount > 0 ? ` og ${remainingCount} til` : ""}
              </Text>
            </Stack>
            <Button
              type="button"
              variant="light"
              size="compact-sm"
              onClick={() => {
                openRecipientSelectionModal({
                  selection,
                  onChange: updateSelection,
                  disabled,
                })
              }}
              disabled={disabled}
            >
              Vis mottakere
            </Button>
          </Group>
        )}
    </Stack>
  )
}

function RecipientPickerFormField({ name, control, disabled }: InputFieldContext<FieldValues>) {
  const { field } = useController({ name, control })
  return (
    <RecipientPickerInput value={field.value ?? []} onChange={field.onChange} disabled={disabled} />
  )
}

export function createRecipientPickerInput<F extends FieldValues>(): InputProducerResult<F> {
  return RecipientPickerFormField as unknown as InputProducerResult<F>
}
