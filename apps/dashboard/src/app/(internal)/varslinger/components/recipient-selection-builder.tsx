"use client"

import { useAuthorization } from "@/auth/authorization-context"
import type { NotificationRecipientSelection, NotificationType } from "@dotkomonline/rpc/notification"
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Collapse,
  Group,
  Menu,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core"
import { IconPlus, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { useRecipientSelectionPreview } from "../hooks/use-recipient-selection-preview"
import {
  createDraftsFromRecipientSelection,
  createRecipientSelectionRuleDraft,
  type ExcludedNotificationRecipient,
  getRecipientSelectionRuleLabel,
  type NotificationRecipientSelectionRuleDraft,
  toNotificationRecipientSelection,
} from "../recipient-selection-rule-draft"
import { RecipientSelectionRuleCard } from "./recipient-selection-rule-card"

interface RecipientSelectionBuilderProps {
  value: NotificationRecipientSelection | null
  onChange: (recipientSelection: NotificationRecipientSelection | null) => void
  type: NotificationType
  countMode?: "total" | "new"
}

function formatPreviewBreakdown(preview: {
  matchCount: number
  duplicateCount: number
  excludedCount: number
  optedOutCount: number
}): string {
  return `${preview.matchCount} treff · ${preview.duplicateCount} duplikater fjernet · ${preview.excludedCount} ekskludert · ${preview.optedOutCount} har valgt bort`
}

function formatRecipientCountTitle(count: number, countMode: "total" | "new"): string {
  if (countMode === "new") {
    return `Opptil ${count} nye mottakere`
  }

  return String(count)
}

export function RecipientSelectionBuilder({
  value,
  onChange,
  type,
  countMode = "total",
}: RecipientSelectionBuilderProps) {
  const { isAdministrator } = useAuthorization()
  const [drafts, setDrafts] = useState<NotificationRecipientSelectionRuleDraft[]>(() =>
    createDraftsFromRecipientSelection(value)
  )
  const [excludedRecipients, setExcludedRecipients] = useState<ExcludedNotificationRecipient[]>(() =>
    (value?.excludedUserIds ?? []).map((userId) => ({
      userId,
      name: null,
      imageUrl: null,
    }))
  )
  const [isExcludedOpen, setIsExcludedOpen] = useState(false)

  const recipientSelection = toNotificationRecipientSelection(drafts, excludedRecipients)
  const { preview, isPending, isForbidden } = useRecipientSelectionPreview(recipientSelection, type)
  const hasAllUsersRule = drafts.some((draft) => draft.type === "ALL_USERS")

  const commit = (
    nextDrafts: NotificationRecipientSelectionRuleDraft[],
    nextExcludedRecipients: ExcludedNotificationRecipient[]
  ) => {
    setDrafts(nextDrafts)
    setExcludedRecipients(nextExcludedRecipients)
    onChange(toNotificationRecipientSelection(nextDrafts, nextExcludedRecipients))
  }

  const addRule = (ruleType: NotificationRecipientSelectionRuleDraft["type"]) => {
    if (ruleType === "ALL_USERS" && hasAllUsersRule) {
      return
    }

    commit([...drafts, createRecipientSelectionRuleDraft(ruleType)], excludedRecipients)
  }

  const excludeUser = (user: ExcludedNotificationRecipient) => {
    const isAlreadyExcluded = excludedRecipients.some((excludedRecipient) => excludedRecipient.userId === user.userId)

    if (isAlreadyExcluded) {
      return
    }

    commit(drafts, [...excludedRecipients, user])
  }

  const restoreUser = (userId: string) => {
    commit(
      drafts,
      excludedRecipients.filter((excludedRecipient) => excludedRecipient.userId !== userId)
    )
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={500}>Mottakere</Text>
        <Menu>
          <Menu.Target>
            <Button variant="light" size="sm" leftSection={<IconPlus size={16} />}>
              Legg til mottakere
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {isAdministrator && !hasAllUsersRule && (
              <Menu.Item onClick={() => addRule("ALL_USERS")}>{getRecipientSelectionRuleLabel("ALL_USERS")}</Menu.Item>
            )}
            <Menu.Item onClick={() => addRule("GROUP_MEMBERS")}>
              {getRecipientSelectionRuleLabel("GROUP_MEMBERS")}
            </Menu.Item>
            <Menu.Item onClick={() => addRule("EVENT_ATTENDEES")}>
              {getRecipientSelectionRuleLabel("EVENT_ATTENDEES")}
            </Menu.Item>
            <Menu.Item onClick={() => addRule("USERS")}>{getRecipientSelectionRuleLabel("USERS")}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {drafts.length === 0 && (
        <Text size="sm" c="dimmed">
          Legg til minst én mottakergruppe
        </Text>
      )}

      {drafts.map((draft) => (
        <RecipientSelectionRuleCard
          key={draft.id}
          draft={draft}
          notificationType={type}
          onChange={(nextDraft) =>
            commit(
              drafts.map((currentDraft) => (currentDraft.id === nextDraft.id ? nextDraft : currentDraft)),
              excludedRecipients
            )
          }
          onRemove={() =>
            commit(
              drafts.filter((currentDraft) => currentDraft.id !== draft.id),
              excludedRecipients
            )
          }
        />
      ))}

      {recipientSelection !== null && (
        <Stack gap="sm">
          {isPending && <Skeleton height={36} width={80} />}
          {!isPending && (
            <Title order={2}>
              {formatRecipientCountTitle(isForbidden ? 0 : (preview?.recipientCount ?? 0), countMode)}
            </Title>
          )}
          {isPending && <Skeleton height={16} width={360} />}
          {!isPending && preview !== undefined && !isForbidden && (
            <Text size="sm" c="dimmed">
              {formatPreviewBreakdown(preview)}
            </Text>
          )}
          {isForbidden && (
            <Text size="sm" c="red">
              Du kan ikke sende til disse mottakerne
            </Text>
          )}

          {!isPending && preview !== undefined && (
            <Stack gap="xs">
              {preview.sample.map((recipient) => (
                <Group key={recipient.userId} justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={recipient.imageUrl ?? undefined} size="sm" radius="xl">
                      {recipient.name?.charAt(0)}
                    </Avatar>
                    <Text size="sm">{recipient.name ?? "Ukjent"}</Text>
                    <Group gap={4}>
                      {recipient.sourceLabels.map((label) => (
                        <Badge key={label} size="xs" variant="light">
                          {label}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Ekskluder"
                    onClick={() =>
                      excludeUser({
                        userId: recipient.userId,
                        name: recipient.name,
                        imageUrl: recipient.imageUrl,
                      })
                    }
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      )}

      {excludedRecipients.length > 0 && (
        <Stack gap="xs">
          <UnstyledButton onClick={() => setIsExcludedOpen((wasOpen) => !wasOpen)}>
            <Text size="sm" c="dimmed">
              Ekskludert ({excludedRecipients.length})
            </Text>
          </UnstyledButton>
          <Collapse in={isExcludedOpen}>
            <Stack gap="xs">
              {excludedRecipients.map((excludedRecipient) => (
                <Group key={excludedRecipient.userId} justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={excludedRecipient.imageUrl ?? undefined} size="sm" radius="xl">
                      {excludedRecipient.name?.charAt(0)}
                    </Avatar>
                    <Text size="sm">{excludedRecipient.name ?? "Ukjent"}</Text>
                  </Group>
                  <Button variant="subtle" size="compact-sm" onClick={() => restoreUser(excludedRecipient.userId)}>
                    Gjenopprett
                  </Button>
                </Group>
              ))}
            </Stack>
          </Collapse>
        </Stack>
      )}
    </Stack>
  )
}
