"use client"

import { ActionIcon, Group, Paper, Stack, Text } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import type { FC } from "react"
import type { DestinationOption } from "../types"
import { formatDestinationLabel } from "../types"

interface DestinationCardProps {
  destination: DestinationOption
  locked?: boolean
  onClear?: () => void
}

export const DestinationCard: FC<DestinationCardProps> = ({ destination, locked, onClear }) => {
  const label = formatDestinationLabel(destination)
  const isEmpty = destination.payloadType === "NONE" || destination.payload === null

  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed">
            Når varslingen åpnes
          </Text>
          <Text size="sm" fw={500} truncate>
            {isEmpty ? "Ingen destinasjon" : label}
          </Text>
        </Stack>
        {!locked && !isEmpty && onClear !== undefined && (
          <ActionIcon variant="subtle" color="gray" onClick={onClear} aria-label="Fjern destinasjon">
            <IconX size={16} />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  )
}
