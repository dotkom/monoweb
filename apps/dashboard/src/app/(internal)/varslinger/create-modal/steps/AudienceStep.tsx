"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { Badge, Button, Group, Menu, Paper, Stack, Text } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import { type FC, useState } from "react"
import {
  excludeRecipient,
  removeAudienceRule,
  removeExclusion,
  resolveAudience,
  type AudienceRule,
  type AudienceState,
} from "../audience-model"
import { AddAudiencePanel, type AddAudiencePanelMode } from "../components/AddAudiencePanel"
import { AudienceRuleCard } from "../components/AudienceRuleCard"
import { ReviewRecipientsPanel } from "../components/ReviewRecipientsPanel"

interface AudienceStepProps {
  audience: AudienceState
  onChange: (audience: AudienceState) => void
}

type SidePanel =
  | { kind: "add"; mode: AddAudiencePanelMode }
  | { kind: "edit"; rule: AudienceRule }
  | { kind: "review" }
  | null

export const AudienceStep: FC<AudienceStepProps> = ({ audience, onChange }) => {
  const [sidePanel, setSidePanel] = useState<SidePanel>(null)
  const resolution = resolveAudience(audience)
  const duplicateNote =
    resolution.duplicateCount > 0
      ? `${resolution.uniqueCount} unike mottakere, ${resolution.matchCount} treff, ${resolution.duplicateCount} duplikater slått sammen.`
      : null

  const peopleInMultipleAudiences = resolution.recipients.filter((recipient) => recipient.sourceLabels.length > 1).length

  return (
    <Group align="stretch" gap="lg" wrap="nowrap" style={{ minHeight: 420 }}>
      <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between">
          <Text fw={600}>Mottakere</Text>
          <Badge variant="light">{resolution.uniqueCount} unike mottakere</Badge>
        </Group>

        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Inkluderte målgrupper
          </Text>
          {audience.rules.length === 0 && (
            <Text size="sm" c="dimmed">
              Ingen målgrupper lagt til ennå.
            </Text>
          )}
          {audience.rules.map((rule) => (
            <AudienceRuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => setSidePanel({ kind: "edit", rule })}
              onRemove={() => onChange(removeAudienceRule(audience, rule.id))}
            />
          ))}
        </Stack>

        <Menu withinPortal position="bottom-start">
          <Menu.Target>
            <Button type="button" variant="light" leftSection={<IconPlus size={16} />} style={{ alignSelf: "flex-start" }}>
              Legg til mottakere
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => setSidePanel({ kind: "add", mode: "people" })}>Personer</Menu.Item>
            <Menu.Item onClick={() => setSidePanel({ kind: "add", mode: "group" })}>Gruppemedlemmer</Menu.Item>
            <Menu.Item onClick={() => setSidePanel({ kind: "add", mode: "event" })}>Påmeldte til arrangement</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {peopleInMultipleAudiences > 0 && (
          <Text size="sm" c="dimmed">
            {peopleInMultipleAudiences}{" "}
            {peopleInMultipleAudiences === 1
              ? "person finnes i mer enn én målgruppe og telles én gang."
              : "personer finnes i mer enn én målgruppe og telles én gang."}
          </Text>
        )}

        {duplicateNote !== null && (
          <Text size="sm" c="dimmed">
            {duplicateNote}
          </Text>
        )}

        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Ekskluderte personer
          </Text>
          <UserSearch
            placeholder="Søk etter en person å ekskludere"
            onSubmit={(user) =>
              onChange(
                excludeRecipient(audience, {
                  userId: user.id,
                  name: user.name,
                })
              )
            }
          />
          {audience.excludedMembers.map((member) => (
            <Group key={member.userId} justify="space-between" wrap="nowrap">
              <Text size="sm">{member.name ?? member.userId}</Text>
              <Button
                type="button"
                variant="subtle"
                size="compact-sm"
                onClick={() => onChange(removeExclusion(audience, member.userId))}
              >
                Fjern ekskludering
              </Button>
            </Group>
          ))}
        </Stack>

        <Button
          type="button"
          variant="default"
          style={{ alignSelf: "flex-start" }}
          onClick={() => setSidePanel({ kind: "review" })}
          disabled={resolution.uniqueCount === 0}
        >
          Se gjennom {resolution.uniqueCount} mottakere
        </Button>
      </Stack>

      {sidePanel !== null && (
        <Paper withBorder p="md" radius="md" w={360} style={{ flexShrink: 0 }}>
          {sidePanel.kind === "review" ? (
            <ReviewRecipientsPanel
              audience={audience}
              onChange={onChange}
              onClose={() => setSidePanel(null)}
            />
          ) : (
            <AddAudiencePanel
              mode={sidePanel.kind === "add" ? sidePanel.mode : null}
              editingRule={sidePanel.kind === "edit" ? sidePanel.rule : null}
              audience={audience}
              onChange={onChange}
              onClose={() => setSidePanel(null)}
            />
          )}
        </Paper>
      )}
    </Group>
  )
}
