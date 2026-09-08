"use client"

import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import type { FC } from "react"
import {
  getMembersForRule,
  getRuleSegmentSummary,
  getRuleSubtitle,
  getRuleTitle,
  type AudienceRule,
} from "../audience-model"

interface AudienceRuleCardProps {
  rule: AudienceRule
  onEdit: () => void
  onRemove: () => void
}

export const AudienceRuleCard: FC<AudienceRuleCardProps> = ({ rule, onEdit, onRemove }) => {
  const memberCount = getMembersForRule(rule).length
  const segmentSummary = getRuleSegmentSummary(rule)
  const countLabel =
    memberCount === 1 ? "1 matchende person" : `${memberCount} matchende personer`

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fw={600}>{getRuleTitle(rule)}</Text>
            <Text size="sm" truncate>
              {getRuleSubtitle(rule)}
            </Text>
            {segmentSummary !== null && (
              <Text size="sm" c="dimmed">
                {segmentSummary}
              </Text>
            )}
            <Text size="sm" c="dimmed">
              {countLabel}
            </Text>
          </Stack>
          <Group gap="xs" wrap="nowrap">
            <Button type="button" variant="subtle" size="compact-sm" onClick={onEdit}>
              Rediger
            </Button>
            <Button type="button" variant="subtle" color="red" size="compact-sm" onClick={onRemove}>
              Fjern
            </Button>
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
}
