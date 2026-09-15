"use client"

import { EventSelect } from "@/app/(internal)/arrangementer/components/event-select"
import { useEventWithAttendancesGetQuery } from "@/app/(internal)/arrangementer/queries"
import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { NotificationRecipientSelection, NotificationType } from "@dotkomonline/rpc/notification"
import { ActionIcon, Avatar, Card, Chip, Group, Select, Skeleton, Stack, Switch, Text } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { useEffect } from "react"
import { useRecipientSelectionPreview } from "../hooks/use-recipient-selection-preview"
import {
  draftToRecipientSelectionRule,
  getRecipientSelectionRuleLabel,
  type NotificationRecipientSelectionRuleDraft,
} from "../recipient-selection-rule-draft"
import { useTargetableGroups } from "../hooks/use-targetable-groups"

interface RecipientSelectionRuleCardProps {
  draft: NotificationRecipientSelectionRuleDraft
  notificationType: NotificationType
  onChange: (draft: NotificationRecipientSelectionRuleDraft) => void
  onRemove: () => void
}

function RuleCount({
  isPending,
  isForbidden,
  recipientCount,
}: {
  isPending: boolean
  isForbidden: boolean
  recipientCount: number | undefined
}) {
  if (isPending) {
    return <Skeleton height={16} width={48} />
  }

  if (isForbidden) {
    return (
      <Text size="sm" c="red">
        → 0
      </Text>
    )
  }

  if (recipientCount === undefined) {
    return (
      <Text size="sm" c="dimmed">
        → —
      </Text>
    )
  }

  return (
    <Text size="sm" c="dimmed">
      → {recipientCount}
    </Text>
  )
}

function GroupMembersFields({
  draft,
  onChange,
}: {
  draft: Extract<NotificationRecipientSelectionRuleDraft, { type: "GROUP_MEMBERS" }>
  onChange: (draft: NotificationRecipientSelectionRuleDraft) => void
}) {
  const groups = useTargetableGroups()

  return (
    <Stack gap="xs">
      <Select
        searchable
        placeholder="Velg gruppe"
        value={draft.groupSlug}
        data={groups.map((group) => ({
          value: group.slug,
          label: getGroupDisplayName(group),
        }))}
        onChange={(value) => onChange({ ...draft, groupSlug: value })}
      />
      <Switch
        label="Inkluder tidligere medlemmer"
        checked={draft.includeFormerMembers}
        onChange={(event) => onChange({ ...draft, includeFormerMembers: event.currentTarget.checked })}
      />
    </Stack>
  )
}

function EventAttendeesFields({
  draft,
  onChange,
}: {
  draft: Extract<NotificationRecipientSelectionRuleDraft, { type: "EVENT_ATTENDEES" }>
  onChange: (draft: NotificationRecipientSelectionRuleDraft) => void
}) {
  const hasSelectedEvent = draft.eventId !== null
  const { data: eventWithAttendance } = useEventWithAttendancesGetQuery(draft.eventId ?? "", hasSelectedEvent)
  const attendance = eventWithAttendance?.attendance ?? null
  const pools = attendance?.pools ?? []
  const shouldShowPoolChips = pools.length > 1
  const selectedPoolIds = draft.attendancePoolIds ?? pools.map((pool) => pool.id)

  useEffect(() => {
    if (draft.eventId === null) {
      return
    }

    const nextAttendanceId = attendance?.id ?? null

    if (nextAttendanceId === draft.attendanceId) {
      return
    }

    onChange({
      ...draft,
      attendanceId: nextAttendanceId,
      attendancePoolIds: null,
    })
  }, [attendance, draft, onChange])

  return (
    <Stack gap="xs">
      <EventSelect
        placeholder="Velg arrangement"
        value={draft.eventId}
        onChange={(value) => {
          onChange({
            ...draft,
            eventId: value,
            attendanceId: null,
            attendancePoolIds: null,
          })
        }}
      />
      {hasSelectedEvent && attendance === null && (
        <Text size="sm" c="dimmed">
          Arrangementet har ingen påmelding
        </Text>
      )}
      <Switch
        label="Inkluder venteliste"
        checked={draft.includeUnreservedAttendees}
        disabled={attendance === null}
        onChange={(event) => onChange({ ...draft, includeUnreservedAttendees: event.currentTarget.checked })}
      />
      {shouldShowPoolChips && (
        <Chip.Group
          multiple
          value={selectedPoolIds}
          onChange={(poolIds) => {
            const nextPoolIds = Array.isArray(poolIds) ? poolIds : [poolIds]

            if (nextPoolIds.length === 0) {
              return
            }

            const hasRestrictedPools = nextPoolIds.length < pools.length

            onChange({
              ...draft,
              attendancePoolIds: hasRestrictedPools ? nextPoolIds : null,
            })
          }}
        >
          <Group gap="xs">
            {pools.map((pool) => (
              <Chip key={pool.id} value={pool.id}>
                {pool.title}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      )}
    </Stack>
  )
}

function UsersFields({
  draft,
  onChange,
}: {
  draft: Extract<NotificationRecipientSelectionRuleDraft, { type: "USERS" }>
  onChange: (draft: NotificationRecipientSelectionRuleDraft) => void
}) {
  return (
    <Stack gap="xs">
      {draft.users.length > 0 && (
        <Group gap="xs">
          {draft.users.map((user) => (
            <Group key={user.id} gap={6} wrap="nowrap">
              <Avatar src={user.imageUrl ?? undefined} size="sm" radius="xl">
                {user.name?.charAt(0)}
              </Avatar>
              <Text size="sm">{user.name ?? "Ukjent"}</Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() =>
                  onChange({
                    ...draft,
                    users: draft.users.filter((selectedUser) => selectedUser.id !== user.id),
                  })
                }
              >
                <IconX size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Group>
      )}
      <UserSearch
        excludeUserIds={draft.users.map((user) => user.id)}
        onSubmit={(user) =>
          onChange({
            ...draft,
            users: [...draft.users, { id: user.id, name: user.name, imageUrl: user.imageUrl }],
          })
        }
      />
    </Stack>
  )
}

export function RecipientSelectionRuleCard({
  draft,
  notificationType,
  onChange,
  onRemove,
}: RecipientSelectionRuleCardProps) {
  const rule = draftToRecipientSelectionRule(draft)
  let recipientSelection: NotificationRecipientSelection | null = null

  if (rule !== null) {
    recipientSelection = { rules: [rule], excludedUserIds: [] }
  }

  const { preview, isPending, isForbidden } = useRecipientSelectionPreview(recipientSelection, notificationType)

  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} size="sm">
            {getRecipientSelectionRuleLabel(draft.type)}
          </Text>
          <Group gap="xs" wrap="nowrap">
            <RuleCount isPending={isPending} isForbidden={isForbidden} recipientCount={preview?.recipientCount} />
            <ActionIcon variant="subtle" color="gray" onClick={onRemove} aria-label="Fjern">
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {draft.type === "GROUP_MEMBERS" && <GroupMembersFields draft={draft} onChange={onChange} />}
        {draft.type === "EVENT_ATTENDEES" && <EventAttendeesFields draft={draft} onChange={onChange} />}
        {draft.type === "USERS" && <UsersFields draft={draft} onChange={onChange} />}

        {isForbidden && (
          <Text size="sm" c="red">
            Du kan ikke sende til disse mottakerne
          </Text>
        )}
      </Stack>
    </Card>
  )
}
