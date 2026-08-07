"use client"

import { Button, Group, ScrollArea, Select, Stack, Text, TextInput } from "@mantine/core"
import { type FC, useMemo, useState } from "react"
import {
  excludeRecipient,
  resolveAudience,
  type AudienceState,
} from "../audience-model"

interface ReviewRecipientsPanelProps {
  audience: AudienceState
  onChange: (audience: AudienceState) => void
  onClose: () => void
}

export const ReviewRecipientsPanel: FC<ReviewRecipientsPanelProps> = ({ audience, onChange, onClose }) => {
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string | null>("all")
  const resolution = resolveAudience(audience)

  const sourceOptions = useMemo(() => {
    const labels = new Set<string>()

    for (const recipient of resolution.recipients) {
      for (const sourceLabel of recipient.sourceLabels) {
        labels.add(sourceLabel)
      }
    }

    return [
      { value: "all", label: "Alle" },
      ...[...labels].map((label) => ({ value: label, label })),
    ]
  }, [resolution.recipients])

  const filteredRecipients = resolution.recipients.filter((recipient) => {
    const matchesSearch =
      search.trim().length === 0 ||
      (recipient.name ?? recipient.userId).toLowerCase().includes(search.trim().toLowerCase())

    if (!matchesSearch) {
      return false
    }

    if (sourceFilter === null || sourceFilter === "all") {
      return true
    }

    return recipient.sourceLabels.includes(sourceFilter)
  })

  return (
    <Stack gap="md" h="100%">
      <Group justify="space-between" wrap="nowrap">
        <Text fw={600}>Mottakere</Text>
        <Text size="sm" c="dimmed">
          {resolution.uniqueCount}
        </Text>
      </Group>

      <Group grow>
        <TextInput
          placeholder="Søk blant mottakere"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
        <Select
          placeholder="Kilde"
          data={sourceOptions}
          value={sourceFilter}
          onChange={setSourceFilter}
        />
      </Group>

      <ScrollArea.Autosize mah={420} type="auto">
        <Stack gap="xs" style={{ marginRight: "var(--mantine-spacing-lg)" }}>
          {filteredRecipients.length === 0 && (
            <Text size="sm" c="dimmed">
              Ingen mottakere å vise.
            </Text>
          )}

          {filteredRecipients.map((recipient) => (
            <Group key={recipient.userId} justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text size="sm" truncate>
                  {recipient.name ?? recipient.userId}
                </Text>
                <Text size="xs" c="dimmed">
                  Inkludert via: {recipient.sourceLabels.join(" · ")}
                </Text>
              </Stack>
              <Button
                type="button"
                variant="subtle"
                color="red"
                size="compact-sm"
                onClick={() =>
                  onChange(
                    excludeRecipient(audience, {
                      userId: recipient.userId,
                      name: recipient.name,
                    })
                  )
                }
              >
                Ekskluder
              </Button>
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>

      <Group justify="flex-end" mt="auto">
        <Button type="button" variant="default" onClick={onClose}>
          Tilbake
        </Button>
      </Group>
    </Stack>
  )
}
