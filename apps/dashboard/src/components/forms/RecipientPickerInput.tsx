"use client"

import { useTRPC } from "@/lib/trpc-client"
import { ActionIcon, Button, Group, Loader, Select, Stack, Text } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconX } from "@tabler/icons-react"
import { useState } from "react"
import { skipToken, useQuery } from "@tanstack/react-query"
import { useUserSearch } from "./hooks/useUserSearch"
import type { FieldValues } from "react-hook-form"
import { useController } from "react-hook-form"
import type { InputFieldContext, InputProducerResult } from "./types"

interface RecipientPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
}

export function RecipientPickerInput({ value, onChange }: RecipientPickerProps) {
  const [userSearch, setUserSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(userSearch, 300)
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventsEnabled, setEventsEnabled] = useState(false)

  const append = (ids: string[]) => {
    onChange(Array.from(new Set([...value, ...ids])))
  }

  const trpc = useTRPC()

  const { data: groups = [] } = useQuery(trpc.group.all.queryOptions())

  const { data: events, isLoading: eventsLoading } = useQuery({
    ...trpc.event.all.queryOptions({ filter: { excludingType: [], byStatus: ["PUBLIC", "DRAFT"] } }),
    enabled: eventsEnabled,
  })
  const eventItems = events?.items ?? []
  const selectedEvent = eventItems.find((e) => e.event.id === selectedEventId)
  const attendanceId = selectedEvent?.event.attendanceId ?? null

  const { data: groupUserIds, isLoading: groupUserIdsLoading } = useQuery(
    trpc.group.getActiveMemberUserIds.queryOptions(selectedGroupSlug ?? skipToken)
  )
  const { data: attendeeUserIds, isLoading: attendeeUserIdsLoading } = useQuery(
    trpc.event.attendance.getAttendeeUserIds.queryOptions(attendanceId ?? skipToken)
  )

  const { data: searchedUsers, isLoading: usersLoading } = useUserSearch(debouncedSearch)
  const userOptions = (searchedUsers ?? []).map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))

  return (
    <Stack gap="sm">
      <Select
        label="Enkeltperson"
        data={userOptions}
        value={null}
        onChange={(id) => {
          if (id) {
            append([id])
            setUserSearch("")
          }
        }}
        searchValue={userSearch}
        onSearchChange={setUserSearch}
        searchable
        placeholder="Søk etter navn eller e-post"
        rightSection={usersLoading ? <Loader size="xs" /> : undefined}
        nothingFoundMessage={debouncedSearch.length > 0 ? "Ingen brukere funnet" : "Søk for å finne brukere"}
      />

      <Group align="flex-end" gap="xs">
        <Select
          style={{ flex: 1 }}
          label="Gruppe"
          placeholder="Søk etter gruppe"
          data={groups.map((g) => ({ value: g.slug, label: g.abbreviation }))}
          value={selectedGroupSlug}
          onChange={setSelectedGroupSlug}
          searchable
          clearable
        />
        <Button
          variant="light"
          disabled={selectedGroupSlug === null || groupUserIdsLoading}
          onClick={() => append(groupUserIds ?? [])}
        >
          {groupUserIdsLoading ? <Loader size="xs" /> : "Legg til aktive"}
        </Button>
      </Group>

      <Group align="flex-end" gap="xs">
        <Select
          style={{ flex: 1 }}
          label="Arrangement"
          placeholder="Søk etter arrangement"
          data={eventItems.map((e) => ({ value: e.event.id, label: e.event.title }))}
          value={selectedEventId}
          onChange={setSelectedEventId}
          onDropdownOpen={() => setEventsEnabled(true)}
          searchable
          clearable
          rightSection={eventsLoading ? <Loader size="xs" /> : undefined}
        />
        <Button
          variant="light"
          disabled={attendanceId === null || attendeeUserIdsLoading}
          onClick={() => append(attendeeUserIds ?? [])}
        >
          {attendeeUserIdsLoading ? <Loader size="xs" /> : "Legg til påmeldte"}
        </Button>
      </Group>

      {value.length > 0 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {value.length} mottaker(e) valgt
          </Text>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onChange([])}>
            <IconX size={14} />
          </ActionIcon>
        </Group>
      )}
    </Stack>
  )
}

// Form-field adapter — used when RecipientPickerInput is wired into a useFormBuilder field map
function RecipientPickerFormField({ name, control }: InputFieldContext<FieldValues>) {
  const { field } = useController({ name, control })
  return <RecipientPickerInput value={field.value ?? []} onChange={field.onChange} />
}

export function createRecipientPickerInput<F extends FieldValues>(): InputProducerResult<F> {
  return RecipientPickerFormField as unknown as InputProducerResult<F>
}
