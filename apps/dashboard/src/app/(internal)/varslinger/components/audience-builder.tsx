"use client"

import { useAuthorization } from "@/auth/authorization-context"
import type { NotificationAudience, NotificationType } from "@dotkomonline/rpc/notification"
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
import {
  createAudienceRuleDraft,
  createDraftsFromAudience,
  getAudienceRuleLabel,
  toNotificationAudience,
  type AudienceRuleDraft,
  type ExcludedAudienceUser,
} from "../audience-rule-draft"
import { useAudiencePreview } from "../hooks/use-audience-preview"
import { AudienceRuleCard } from "./audience-rule-card"

interface AudienceBuilderProps {
  value: NotificationAudience | null
  onChange: (audience: NotificationAudience | null) => void
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

export function AudienceBuilder({ value, onChange, type, countMode = "total" }: AudienceBuilderProps) {
  const { isAdministrator } = useAuthorization()
  const [drafts, setDrafts] = useState<AudienceRuleDraft[]>(() => createDraftsFromAudience(value))
  const [excludedUsers, setExcludedUsers] = useState<ExcludedAudienceUser[]>(() =>
    (value?.excludedUserIds ?? []).map((userId) => ({
      userId,
      name: null,
      imageUrl: null,
    }))
  )
  const [isExcludedOpen, setIsExcludedOpen] = useState(false)

  const audience = toNotificationAudience(drafts, excludedUsers)
  const { preview, isPending, isForbidden } = useAudiencePreview(audience, type)
  const hasAllUsersRule = drafts.some((draft) => draft.type === "ALL_USERS")

  const commit = (nextDrafts: AudienceRuleDraft[], nextExcludedUsers: ExcludedAudienceUser[]) => {
    setDrafts(nextDrafts)
    setExcludedUsers(nextExcludedUsers)
    onChange(toNotificationAudience(nextDrafts, nextExcludedUsers))
  }

  const addRule = (ruleType: AudienceRuleDraft["type"]) => {
    if (ruleType === "ALL_USERS" && hasAllUsersRule) {
      return
    }

    commit([...drafts, createAudienceRuleDraft(ruleType)], excludedUsers)
  }

  const excludeUser = (user: ExcludedAudienceUser) => {
    const isAlreadyExcluded = excludedUsers.some((excludedUser) => excludedUser.userId === user.userId)

    if (isAlreadyExcluded) {
      return
    }

    commit(drafts, [...excludedUsers, user])
  }

  const restoreUser = (userId: string) => {
    commit(
      drafts,
      excludedUsers.filter((excludedUser) => excludedUser.userId !== userId)
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
              <Menu.Item onClick={() => addRule("ALL_USERS")}>{getAudienceRuleLabel("ALL_USERS")}</Menu.Item>
            )}
            <Menu.Item onClick={() => addRule("GROUP_MEMBERS")}>{getAudienceRuleLabel("GROUP_MEMBERS")}</Menu.Item>
            <Menu.Item onClick={() => addRule("EVENT_ATTENDEES")}>{getAudienceRuleLabel("EVENT_ATTENDEES")}</Menu.Item>
            <Menu.Item onClick={() => addRule("USERS")}>{getAudienceRuleLabel("USERS")}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {drafts.length === 0 && (
        <Text size="sm" c="dimmed">
          Legg til minst én mottakergruppe
        </Text>
      )}

      {drafts.map((draft) => (
        <AudienceRuleCard
          key={draft.id}
          draft={draft}
          notificationType={type}
          onChange={(nextDraft) =>
            commit(
              drafts.map((currentDraft) => (currentDraft.id === nextDraft.id ? nextDraft : currentDraft)),
              excludedUsers
            )
          }
          onRemove={() =>
            commit(
              drafts.filter((currentDraft) => currentDraft.id !== draft.id),
              excludedUsers
            )
          }
        />
      ))}

      {audience !== null && (
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

      {excludedUsers.length > 0 && (
        <Stack gap="xs">
          <UnstyledButton onClick={() => setIsExcludedOpen((wasOpen) => !wasOpen)}>
            <Text size="sm" c="dimmed">
              Ekskludert ({excludedUsers.length})
            </Text>
          </UnstyledButton>
          <Collapse in={isExcludedOpen}>
            <Stack gap="xs">
              {excludedUsers.map((excludedUser) => (
                <Group key={excludedUser.userId} justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Avatar src={excludedUser.imageUrl ?? undefined} size="sm" radius="xl">
                      {excludedUser.name?.charAt(0)}
                    </Avatar>
                    <Text size="sm">{excludedUser.name ?? "Ukjent"}</Text>
                  </Group>
                  <Button variant="subtle" size="compact-sm" onClick={() => restoreUser(excludedUser.userId)}>
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
