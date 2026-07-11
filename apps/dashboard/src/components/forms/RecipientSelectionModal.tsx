"use client"

import { ActionIcon, Button, Group, ScrollArea, Stack, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconArrowLeft, IconCalendarEvent, IconUser, IconUsersGroup, IconX } from "@tabler/icons-react"
import { type FC, type ReactNode, useState } from "react"
import {
  flattenRecipientIds,
  getOtherSourceLabels,
  removeMemberFromSource,
  removeSource,
  type RecipientMember,
  type RecipientSelection,
} from "./recipient-selection"

interface RecipientSelectionModalContentProps {
  selection: RecipientSelection
  onChange: (selection: RecipientSelection) => void
  disabled?: boolean
}

interface RecipientMemberRowProps {
  member: RecipientMember
  otherSourceLabels: string[]
  indented?: boolean
  disabled?: boolean
  onRemove: () => void
}

const RecipientMemberRow: FC<RecipientMemberRowProps> = ({
  member,
  otherSourceLabels,
  indented = false,
  disabled,
  onRemove,
}) => {
  const indent = indented ? "28px" : 0

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      ml={indent}
      px="xs"
      py="4px"
      bg="var(--mantine-color-gray-outline-hover)"
      mih="42px"
      style={{ borderRadius: "var(--mantine-radius-sm)" }}
    >
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size="sm" truncate>
          {member.name ?? member.userId}
        </Text>

        {otherSourceLabels.length > 0 && (
          <Text size="xs" c="dimmed">
            Også valgt via: {otherSourceLabels.join(", ")}
          </Text>
        )}
      </Stack>

      <ActionIcon variant="light" color="red" size="sm" onClick={onRemove} disabled={disabled}>
        <IconX size={14} />
      </ActionIcon>
    </Group>
  )
}

interface RecipientSourceSectionProps {
  icon: ReactNode
  label: string
  memberCount: number
  disabled?: boolean
  onRemoveSource: () => void
  children: ReactNode
}

const RecipientSourceSection: FC<RecipientSourceSectionProps> = ({
  icon,
  label,
  memberCount,
  disabled,
  onRemoveSource,
  children,
}) => {
  return (
    <Stack
      gap="xs"
      bg="var(--mantine-color-gray-light)"
      p="4px 4px 16px 4px"
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        bg="var(--mantine-color-body)"
        p="xs"
        style={{ borderRadius: "var(--mantine-radius-sm)" }}
      >
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          {icon}
          <Text truncate>{label}</Text>
          <Text size="sm" c="dimmed">
            ({memberCount})
          </Text>
        </Group>
        <ActionIcon variant="light" color="red" size="sm" onClick={onRemoveSource} disabled={disabled}>
          <IconX size={14} />
        </ActionIcon>
      </Group>

      {children}
    </Stack>
  )
}

export const RecipientSelectionModalContent: FC<RecipientSelectionModalContentProps> = ({
  selection,
  onChange,
  disabled,
}) => {
  const recipientCount = flattenRecipientIds(selection).length

  const handleRemoveMember = (sourceId: string, userId: string) => {
    onChange(removeMemberFromSource(selection, sourceId, userId))
  }

  const handleRemoveSource = (sourceId: string) => {
    onChange(removeSource(selection, sourceId))
  }

  const sortedSources = selection.toSorted((a, b) => {
    const aWeight = a.kind === "direct" ? 0 : a.kind === "group" ? 1 : 2
    const bWeight = b.kind === "direct" ? 0 : b.kind === "group" ? 1 : 2

    return aWeight - bWeight
  })

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {recipientCount > 0
          ? `${recipientCount} mottaker${recipientCount === 1 ? "" : "e"} valgt`
          : "Ingen mottakere valgt ennå."}
      </Text>

      <ScrollArea.Autosize mah={420} type="auto">
        <Stack gap="md" style={{ marginRight: "var(--mantine-spacing-lg)" }}>
          {selection.length === 0 && (
            <Text size="sm" c="dimmed">
              Ingen mottakere valgt ennå.
            </Text>
          )}

          {sortedSources.map((source) => {
            if (source.kind === "direct") {
              return (
                <RecipientMemberRow
                  key={source.id}
                  member={source.member}
                  otherSourceLabels={getOtherSourceLabels(selection, source.member.userId, source.id)}
                  disabled={disabled}
                  onRemove={() => handleRemoveMember(source.id, source.member.userId)}
                />
              )
            }

            if (source.kind === "group") {
              return (
                <RecipientSourceSection
                  key={source.id}
                  icon={<IconUsersGroup size={18} />}
                  label={source.groupLabel}
                  memberCount={source.members.length}
                  disabled={disabled}
                  onRemoveSource={() => handleRemoveSource(source.id)}
                >
                  {source.members.map((member) => (
                    <RecipientMemberRow
                      key={`${source.id}-${member.userId}`}
                      member={member}
                      otherSourceLabels={getOtherSourceLabels(selection, member.userId, source.id)}
                      indented
                      disabled={disabled}
                      onRemove={() => handleRemoveMember(source.id, member.userId)}
                    />
                  ))}
                </RecipientSourceSection>
              )
            }

            return (
              <RecipientSourceSection
                key={source.id}
                icon={<IconCalendarEvent size={18} />}
                label={source.eventTitle}
                memberCount={source.members.length}
                disabled={disabled}
                onRemoveSource={() => handleRemoveSource(source.id)}
              >
                {source.members.map((member) => (
                  <RecipientMemberRow
                    key={`${source.id}-${member.userId}`}
                    member={member}
                    otherSourceLabels={getOtherSourceLabels(selection, member.userId, source.id)}
                    indented
                    disabled={disabled}
                    onRemove={() => handleRemoveMember(source.id, member.userId)}
                  />
                ))}
              </RecipientSourceSection>
            )
          })}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  )
}

interface RecipientSelectionModalHostProps {
  initialSelection: RecipientSelection
  onChange: (selection: RecipientSelection) => void
  disabled?: boolean
}

const RecipientSelectionModalHost: FC<RecipientSelectionModalHostProps> = ({
  initialSelection,
  onChange,
  disabled,
}) => {
  const [selection, setSelection] = useState(initialSelection)

  const handleChange = (nextSelection: RecipientSelection) => {
    setSelection(nextSelection)
    onChange(nextSelection)
  }

  return <RecipientSelectionModalContent selection={selection} onChange={handleChange} disabled={disabled} />
}

export function openRecipientSelectionModal({ selection, onChange, disabled }: RecipientSelectionModalContentProps) {
  const modalId = modals.open({
    // Use a dedicated stack to avoid unmounting the underlying context modal (form state).
    stackId: "recipient-selection",
    withCloseButton: false,
    title: (
      <Button
        type="button"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        px={0}
        onClick={() => modals.close(modalId)}
      >
        Tilbake
      </Button>
    ),
    size: "lg",
    children: <RecipientSelectionModalHost initialSelection={selection} onChange={onChange} disabled={disabled} />,
  })
}
