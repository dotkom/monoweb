"use client"

import { Alert, Button, Group, Radio, Stack, Text, TextInput } from "@mantine/core"
import { IconAlertTriangle } from "@tabler/icons-react"
import type { FC } from "react"
import { resolveAudience, summarizeAudienceRules, type AudienceState } from "../audience-model"
import { formatDestinationLabel, type DestinationOption } from "../types"

interface DeliveryStepProps {
  title: string
  destination: DestinationOption
  audience: AudienceState
  onReviewAudience: () => void
}

export const DeliveryStep: FC<DeliveryStepProps> = ({ title, destination, audience, onReviewAudience }) => {
  const resolution = resolveAudience(audience)

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Text fw={600}>Sending</Text>
        <Radio.Group value="now">
          <Stack gap="xs">
            <Radio value="now" label="Send nå" />
            <Radio value="schedule" label="Planlegg" disabled />
            <Group gap="xs" ml={28} opacity={0.5}>
              <TextInput placeholder="Dato" disabled w={140} />
              <TextInput placeholder="Tid" disabled w={100} />
              <TextInput value="Europe/Oslo" disabled w={140} />
            </Group>
          </Stack>
        </Radio.Group>
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>Mottakere</Text>
        <Text size="sm">{resolution.uniqueCount} unike mottakere</Text>
        <Text size="sm" c="dimmed">
          {summarizeAudienceRules(audience)}
        </Text>
        <Button
          type="button"
          variant="subtle"
          size="compact-sm"
          style={{ alignSelf: "flex-start" }}
          onClick={onReviewAudience}
        >
          Se gjennom mottakere
        </Button>
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>Varsling</Text>
        <Text size="sm">{title || "Uten tittel"}</Text>
      </Stack>

      <Stack gap="xs">
        <Text fw={600}>Destinasjon</Text>
        <Text size="sm">{formatDestinationLabel(destination)}</Text>
      </Stack>

      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" title="Kan ikke angres">
        Denne varslingen kan ikke tilbakekalles etter at den er sendt.
      </Alert>
    </Stack>
  )
}
