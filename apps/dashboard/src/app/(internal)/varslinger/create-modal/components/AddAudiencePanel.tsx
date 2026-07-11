"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { useGroupMembersAllQuery } from "@/app/(internal)/grupper/queries"
import { useTRPC } from "@/lib/trpc-client"
import { getActiveGroupMembership } from "@dotkomonline/rpc/group"
import { Button, Checkbox, Group, Loader, Select, Stack, Text } from "@mantine/core"
import { skipToken, useQuery } from "@tanstack/react-query"
import { type FC, useState } from "react"
import {
  type AudienceMember,
  type AudienceRule,
  type EventAudienceMember,
  type GroupAudienceMember,
  updateAudienceRule,
  upsertEventRule,
  upsertGroupRule,
  upsertPeopleRule,
  type AudienceState,
} from "../audience-model"

export type AddAudiencePanelMode = "people" | "group" | "event" | null

interface AddAudiencePanelProps {
  mode: AddAudiencePanelMode
  audience: AudienceState
  editingRule: AudienceRule | null
  onChange: (audience: AudienceState) => void
  onClose: () => void
}

export const AddAudiencePanel: FC<AddAudiencePanelProps> = ({
  mode,
  audience,
  editingRule,
  onChange,
  onClose,
}) => {
  if (mode === null && editingRule === null) {
    return null
  }

  const effectiveMode = editingRule?.kind === "people" ? "people" : editingRule?.kind === "group" ? "group" : editingRule?.kind === "event" ? "event" : mode

  if (effectiveMode === "people") {
    return (
      <PeopleAudiencePanel
        audience={audience}
        editingRule={editingRule?.kind === "people" ? editingRule : null}
        onChange={onChange}
        onClose={onClose}
      />
    )
  }

  if (effectiveMode === "group") {
    return (
      <GroupAudiencePanel
        audience={audience}
        editingRule={editingRule?.kind === "group" ? editingRule : null}
        onChange={onChange}
        onClose={onClose}
      />
    )
  }

  if (effectiveMode === "event") {
    return (
      <EventAudiencePanel
        audience={audience}
        editingRule={editingRule?.kind === "event" ? editingRule : null}
        onChange={onChange}
        onClose={onClose}
      />
    )
  }

  return null
}

interface PeopleAudiencePanelProps {
  audience: AudienceState
  editingRule: Extract<AudienceRule, { kind: "people" }> | null
  onChange: (audience: AudienceState) => void
  onClose: () => void
}

const PeopleAudiencePanel: FC<PeopleAudiencePanelProps> = ({ audience, editingRule, onChange, onClose }) => {
  const [members, setMembers] = useState<AudienceMember[]>(editingRule?.members ?? [])

  const handleAddMember = (user: { id: string; name: string | null }) => {
    if (members.some((member) => member.userId === user.id)) {
      return
    }

    setMembers([...members, { userId: user.id, name: user.name }])
  }

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter((member) => member.userId !== userId))
  }

  const handleSave = () => {
    if (editingRule !== null) {
      onChange(updateAudienceRule(audience, { ...editingRule, members }))
      onClose()
      return
    }

    onChange(upsertPeopleRule(audience, members))
    onClose()
  }

  return (
    <Stack gap="md" h="100%">
      <Text fw={600}>{editingRule !== null ? "Rediger personer" : "Legg til personer"}</Text>
      <UserSearch placeholder="Søk etter navn eller e-post" onSubmit={handleAddMember} />
      <Stack gap="xs">
        {members.map((member) => (
          <Group key={member.userId} justify="space-between" wrap="nowrap">
            <Text size="sm" truncate>
              {member.name ?? member.userId}
            </Text>
            <Button type="button" variant="subtle" color="red" size="compact-sm" onClick={() => handleRemoveMember(member.userId)}>
              Fjern
            </Button>
          </Group>
        ))}
        {members.length === 0 && (
          <Text size="sm" c="dimmed">
            Ingen personer valgt ennå.
          </Text>
        )}
      </Stack>
      <Group justify="flex-end" mt="auto">
        <Button type="button" variant="default" onClick={onClose}>
          Avbryt
        </Button>
        <Button type="button" onClick={handleSave} disabled={members.length === 0}>
          Lagre
        </Button>
      </Group>
    </Stack>
  )
}

interface GroupAudiencePanelProps {
  audience: AudienceState
  editingRule: Extract<AudienceRule, { kind: "group" }> | null
  onChange: (audience: AudienceState) => void
  onClose: () => void
}

const GroupAudiencePanel: FC<GroupAudiencePanelProps> = ({ audience, editingRule, onChange, onClose }) => {
  const trpc = useTRPC()
  const { data: groups = [] } = useQuery(trpc.group.all.queryOptions())
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string | null>(editingRule?.groupSlug ?? null)
  const [includeActive, setIncludeActive] = useState(editingRule?.includeActive ?? true)
  const [includeInactive, setIncludeInactive] = useState(editingRule?.includeInactive ?? false)

  const { members: groupMembers, isLoading } = useGroupMembersAllQuery(
    selectedGroupSlug ?? "",
    selectedGroupSlug !== null
  )

  const resolvedMembers: GroupAudienceMember[] =
    selectedGroupSlug === null
      ? []
      : Array.from(groupMembers.entries()).map(([userId, member]) => ({
          userId,
          name: member.name,
          isActive: getActiveGroupMembership(member, selectedGroupSlug) !== null,
        }))

  const activeCount = resolvedMembers.filter((member) => member.isActive).length
  const inactiveCount = resolvedMembers.filter((member) => !member.isActive).length

  const handleSave = () => {
    if (selectedGroupSlug === null) {
      return
    }

    const groupLabel = groups.find((group) => group.slug === selectedGroupSlug)?.abbreviation ?? selectedGroupSlug

    if (editingRule !== null) {
      onChange(
        updateAudienceRule(audience, {
          ...editingRule,
          groupSlug: selectedGroupSlug,
          groupLabel,
          includeActive,
          includeInactive,
          members: resolvedMembers,
        })
      )
      onClose()
      return
    }

    onChange(
      upsertGroupRule(audience, {
        groupSlug: selectedGroupSlug,
        groupLabel,
        members: resolvedMembers,
        includeActive,
        includeInactive,
      })
    )
    onClose()
  }

  return (
    <Stack gap="md" h="100%">
      <Text fw={600}>{editingRule !== null ? "Rediger gruppe" : "Legg til gruppe"}</Text>
      <Select
        label="Gruppe"
        placeholder="Søk etter gruppe"
        data={groups.map((group) => ({ value: group.slug, label: group.abbreviation }))}
        value={selectedGroupSlug}
        onChange={setSelectedGroupSlug}
        searchable
        clearable
        disabled={editingRule !== null}
      />
      {isLoading && selectedGroupSlug !== null && <Loader size="sm" />}
      {selectedGroupSlug !== null && !isLoading && (
        <Stack gap="xs">
          <Text size="sm">Inkluder</Text>
          <Checkbox
            label={`Aktive medlemmer (${activeCount})`}
            checked={includeActive}
            onChange={(event) => setIncludeActive(event.currentTarget.checked)}
          />
          <Checkbox
            label={`Inaktive medlemmer (${inactiveCount})`}
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.currentTarget.checked)}
          />
        </Stack>
      )}
      <Group justify="flex-end" mt="auto">
        <Button type="button" variant="default" onClick={onClose}>
          Avbryt
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={selectedGroupSlug === null || (!includeActive && !includeInactive) || isLoading}
        >
          Lagre
        </Button>
      </Group>
    </Stack>
  )
}

interface EventAudiencePanelProps {
  audience: AudienceState
  editingRule: Extract<AudienceRule, { kind: "event" }> | null
  onChange: (audience: AudienceState) => void
  onClose: () => void
}

const EventAudiencePanel: FC<EventAudiencePanelProps> = ({ audience, editingRule, onChange, onClose }) => {
  const trpc = useTRPC()
  const [eventsEnabled, setEventsEnabled] = useState(editingRule !== null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(editingRule?.eventId ?? null)
  const [includeReserved, setIncludeReserved] = useState(editingRule?.includeReserved ?? true)
  const [includeUnreserved, setIncludeUnreserved] = useState(editingRule?.includeUnreserved ?? true)

  const { data: events, isLoading: eventsLoading } = useQuery({
    ...trpc.event.all.queryOptions({ filter: { excludingType: [], byStatus: ["PUBLIC", "DRAFT"] } }),
    enabled: eventsEnabled,
  })
  const eventItems = events?.items ?? []
  const selectedEvent = eventItems.find((eventItem) => eventItem.event.id === selectedEventId)
  const attendanceId = selectedEvent?.event.attendanceId ?? null

  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(attendanceId !== null ? { id: attendanceId } : skipToken)
  )

  const resolvedMembers: EventAudienceMember[] =
    attendance === undefined
      ? editingRule?.members ?? []
      : attendance.attendees.map((attendee) => ({
          userId: attendee.user.id,
          name: attendee.user.name,
          reserved: attendee.reserved,
        }))

  const reservedCount = resolvedMembers.filter((member) => member.reserved).length
  const unreservedCount = resolvedMembers.filter((member) => !member.reserved).length

  const handleSave = () => {
    const eventTitle = selectedEvent?.event.title ?? editingRule?.eventTitle
    const eventId = selectedEventId ?? editingRule?.eventId

    if (eventId === undefined || eventId === null || eventTitle === undefined) {
      return
    }

    if (editingRule !== null) {
      onChange(
        updateAudienceRule(audience, {
          ...editingRule,
          eventId,
          eventTitle,
          includeReserved,
          includeUnreserved,
          members: resolvedMembers,
        })
      )
      onClose()
      return
    }

    onChange(
      upsertEventRule(audience, {
        eventId,
        eventTitle,
        members: resolvedMembers,
        includeReserved,
        includeUnreserved,
      })
    )
    onClose()
  }

  return (
    <Stack gap="md" h="100%">
      <Text fw={600}>{editingRule !== null ? "Rediger arrangement" : "Legg til arrangement"}</Text>
      <Select
        label="Arrangement"
        placeholder="Søk etter arrangement"
        data={eventItems.map((eventItem) => ({ value: eventItem.event.id, label: eventItem.event.title }))}
        value={selectedEventId}
        onChange={setSelectedEventId}
        onDropdownOpen={() => setEventsEnabled(true)}
        searchable
        clearable
        disabled={editingRule !== null}
        rightSection={eventsLoading ? <Loader size="xs" /> : undefined}
      />
      {(attendanceLoading || (editingRule !== null && attendance === undefined && selectedEventId !== null)) && (
        <Loader size="sm" />
      )}
      {selectedEventId !== null && (
        <Stack gap="xs">
          <Text size="sm">Inkluder</Text>
          <Checkbox
            label={`Påmeldte med plass (${reservedCount})`}
            checked={includeReserved}
            onChange={(event) => setIncludeReserved(event.currentTarget.checked)}
          />
          <Checkbox
            label={`Påmeldte uten plass (${unreservedCount})`}
            checked={includeUnreserved}
            onChange={(event) => setIncludeUnreserved(event.currentTarget.checked)}
          />
        </Stack>
      )}
      <Group justify="flex-end" mt="auto">
        <Button type="button" variant="default" onClick={onClose}>
          Avbryt
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={
            selectedEventId === null ||
            (!includeReserved && !includeUnreserved) ||
            attendanceLoading
          }
        >
          Lagre
        </Button>
      </Group>
    </Stack>
  )
}
