import type { NotificationAudience, NotificationAudienceRule } from "@dotkomonline/rpc/notification"
import { Chip, Group, Stack, Switch, Text } from "@mantine/core"
import type { NotificationLaunchContext } from "../notification-launch-context"

type ContextualLaunchContext = Extract<NotificationLaunchContext, { kind: "EVENT" } | { kind: "GROUP" }>

interface AudienceSummaryProps {
  launchContext: ContextualLaunchContext
  value: NotificationAudience
  onChange: (audience: NotificationAudience) => void
  errorMessage?: string | null
}

function getEventAttendeesRule(
  audience: NotificationAudience
): Extract<NotificationAudienceRule, { type: "EVENT_ATTENDEES" }> | null {
  const rule = audience.rules[0]

  if (rule === undefined || rule.type !== "EVENT_ATTENDEES") {
    return null
  }

  return rule
}

function getGroupMembersRule(
  audience: NotificationAudience
): Extract<NotificationAudienceRule, { type: "GROUP_MEMBERS" }> | null {
  const rule = audience.rules[0]

  if (rule === undefined || rule.type !== "GROUP_MEMBERS") {
    return null
  }

  return rule
}

function EventAudienceSummary({
  launchContext,
  value,
  onChange,
}: {
  launchContext: Extract<NotificationLaunchContext, { kind: "EVENT" }>
  value: NotificationAudience
  onChange: (audience: NotificationAudience) => void
}) {
  const rule = getEventAttendeesRule(value)
  const includeUnreservedAttendees = rule?.includeUnreservedAttendees ?? false
  const allPoolIds = launchContext.pools.map((pool) => pool.id)
  const selectedPoolIds = rule?.attendancePoolIds ?? allPoolIds
  const shouldShowPoolChips = launchContext.pools.length > 1

  const updateAudience = (includeWaitlist: boolean, poolIds: string[]) => {
    const nextRule: Extract<NotificationAudienceRule, { type: "EVENT_ATTENDEES" }> = {
      type: "EVENT_ATTENDEES",
      attendanceId: launchContext.attendanceId,
      includeUnreservedAttendees: includeWaitlist,
    }

    const hasRestrictedPools = poolIds.length > 0 && poolIds.length < allPoolIds.length

    if (hasRestrictedPools) {
      nextRule.attendancePoolIds = poolIds
    }

    onChange({
      rules: [nextRule],
      excludedUserIds: value.excludedUserIds,
    })
  }

  return (
    <Stack gap="xs">
      <Text size="sm">Påmeldte på {launchContext.eventTitle}</Text>
      <Switch
        label="Inkluder venteliste"
        checked={includeUnreservedAttendees}
        onChange={(event) => updateAudience(event.currentTarget.checked, selectedPoolIds)}
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

            updateAudience(includeUnreservedAttendees, nextPoolIds)
          }}
        >
          <Group gap="xs">
            {launchContext.pools.map((pool) => (
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

function GroupAudienceSummary({
  launchContext,
  value,
  onChange,
}: {
  launchContext: Extract<NotificationLaunchContext, { kind: "GROUP" }>
  value: NotificationAudience
  onChange: (audience: NotificationAudience) => void
}) {
  const rule = getGroupMembersRule(value)
  const includeInactiveMembers = rule?.includeInactiveMembers ?? false

  return (
    <Stack gap="xs">
      <Text size="sm">Aktive medlemmer av {launchContext.groupName}</Text>
      <Switch
        label="Inkluder tidligere medlemmer"
        checked={includeInactiveMembers}
        onChange={(event) => {
          onChange({
            rules: [
              {
                type: "GROUP_MEMBERS",
                groupSlug: launchContext.groupSlug,
                includeInactiveMembers: event.currentTarget.checked,
              },
            ],
            excludedUserIds: value.excludedUserIds,
          })
        }}
      />
    </Stack>
  )
}

export function AudienceSummary({ launchContext, value, onChange, errorMessage }: AudienceSummaryProps) {
  return (
    <Stack gap="xs">
      {launchContext.kind === "EVENT" && (
        <EventAudienceSummary launchContext={launchContext} value={value} onChange={onChange} />
      )}
      {launchContext.kind === "GROUP" && (
        <GroupAudienceSummary launchContext={launchContext} value={value} onChange={onChange} />
      )}
      {errorMessage !== null && errorMessage !== undefined && (
        <Text size="sm" c="red">
          {errorMessage}
        </Text>
      )}
    </Stack>
  )
}
