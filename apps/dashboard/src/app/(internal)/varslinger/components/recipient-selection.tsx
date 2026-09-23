"use client"

import { EventSelect } from "@/app/(internal)/arrangementer/components/event-select"
import { useEventWithAttendancesGetQuery } from "@/app/(internal)/arrangementer/queries"
import { UserSearch } from "@/app/(internal)/brukere/components/UserSearch"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useAuthorization } from "@/auth/authorization-context"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type {
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientMembershipStatus,
  NotificationRecipientMembershipType,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
  NotificationRecipientSelection,
  NotificationRecipientSelectionRule,
  NotificationType,
} from "@dotkomonline/rpc/notification"
import { getMembershipTypeName } from "@dotkomonline/rpc/user"
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Collapse,
  Group,
  Input,
  MultiSelect,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core"
import { useInViewport } from "@mantine/hooks"
import { IconUsers, IconX } from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRecipientSelectionPreview, useRecipientSelectionPreviewInfinite } from "../queries"
import { EventAttendeeRecipientFilters } from "./event-attendee-recipient-filters"

const TARGETABLE_GROUP_TYPES = new Set(["COMMITTEE", "NODE_COMMITTEE", "ASSOCIATED", "INTEREST_GROUP"])

const MEMBERSHIP_STATUS_DATA: { label: string; value: NotificationRecipientMembershipStatus }[] = [
  { label: "Aktiv medlemskap", value: "ACTIVE" },
  { label: "Alle", value: "ALL" },
]

const MEMBERSHIP_TYPE_FILTER_DATA: { label: string; value: NotificationRecipientMembershipType }[] = [
  { label: getMembershipTypeName("BACHELOR_STUDENT"), value: "BACHELOR_STUDENT" },
  { label: getMembershipTypeName("MASTER_STUDENT"), value: "MASTER_STUDENT" },
  { label: getMembershipTypeName("SOCIAL_MEMBER"), value: "SOCIAL_MEMBER" },
  { label: getMembershipTypeName("KNIGHT"), value: "KNIGHT" },
  { label: "Ingen", value: "NONE" },
]

const STUDY_GRADE_FILTER_DATA = [1, 2, 3, 4, 5].map((studyGrade) => ({
  value: String(studyGrade),
  label: String(studyGrade),
}))

type RuleDraft =
  | {
      id: string
      type: "ALL_USERS"
      membershipStatus: NotificationRecipientMembershipStatus
      membershipTypes: NotificationRecipientMembershipType[] | null
      studyGrades: number[] | null
      requiresActiveCommitteeMembership: boolean
    }
  | { id: string; type: "GROUP_MEMBERS"; groupSlug: string | null; includeFormerMembers: boolean }
  | {
      id: string
      type: "EVENT_ATTENDEES"
      eventId: string | null
      attendanceId: string | null
      reservationStatus: NotificationRecipientReservationStatus
      paymentStatus: NotificationRecipientPaymentStatus
      attendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | null
    }
  | {
      id: string
      type: "USERS"
      users: Array<{ id: string; name: string | null; imageUrl: string | null }>
    }

type ExcludedRecipient = {
  userId: string
  name: string | null
  imageUrl: string | null
}

function getRuleLabel(type: RuleDraft["type"]): string {
  if (type === "ALL_USERS") {
    return "Alle brukere"
  }

  if (type === "GROUP_MEMBERS") {
    return "Medlemmer av gruppe"
  }

  if (type === "EVENT_ATTENDEES") {
    return "Påmeldte på arrangement"
  }

  return "Enkeltpersoner"
}

function createRuleDraft(type: RuleDraft["type"]): RuleDraft {
  const id = crypto.randomUUID()

  if (type === "ALL_USERS") {
    return {
      id,
      type,
      membershipStatus: "ACTIVE",
      membershipTypes: null,
      studyGrades: null,
      requiresActiveCommitteeMembership: false,
    }
  }

  if (type === "GROUP_MEMBERS") {
    return { id, type, groupSlug: null, includeFormerMembers: false }
  }

  if (type === "EVENT_ATTENDEES") {
    return {
      id,
      type,
      eventId: null,
      attendanceId: null,
      reservationStatus: "RESERVED",
      paymentStatus: "ALL",
      attendanceSelectionOptions: null,
    }
  }

  return { id, type, users: [] }
}

function draftToRule(draft: RuleDraft): NotificationRecipientSelectionRule | null {
  if (draft.type === "ALL_USERS") {
    const rule: Extract<NotificationRecipientSelectionRule, { type: "ALL_USERS" }> = {
      type: "ALL_USERS",
      membershipStatus: draft.membershipStatus,
      requiresActiveCommitteeMembership: draft.requiresActiveCommitteeMembership,
    }

    if (draft.membershipTypes !== null && draft.membershipTypes.length > 0) {
      rule.membershipTypes = draft.membershipTypes
    }

    if (draft.studyGrades !== null && draft.studyGrades.length > 0) {
      rule.studyGrades = draft.studyGrades
    }

    return rule
  }

  if (draft.type === "GROUP_MEMBERS") {
    if (draft.groupSlug === null) {
      return null
    }

    return {
      type: "GROUP_MEMBERS",
      groupSlug: draft.groupSlug,
      includeFormerMembers: draft.includeFormerMembers,
    }
  }

  if (draft.type === "EVENT_ATTENDEES") {
    if (draft.attendanceId === null) {
      return null
    }

    const rule: Extract<NotificationRecipientSelectionRule, { type: "EVENT_ATTENDEES" }> = {
      type: "EVENT_ATTENDEES",
      attendanceId: draft.attendanceId,
      reservationStatus: draft.reservationStatus,
      paymentStatus: draft.paymentStatus,
    }

    if (draft.attendanceSelectionOptions !== null && draft.attendanceSelectionOptions.length > 0) {
      rule.attendanceSelectionOptions = draft.attendanceSelectionOptions
    }

    return rule
  }

  if (draft.users.length === 0) {
    return null
  }

  return {
    type: "USERS",
    userIds: draft.users.map((user) => user.id),
  }
}

function toRecipientSelection(
  drafts: RuleDraft[],
  excludedRecipients: ExcludedRecipient[]
): NotificationRecipientSelection | null {
  const rules = drafts.map(draftToRule).filter((rule) => rule !== null)

  if (rules.length === 0) {
    return null
  }

  return {
    rules,
    excludedUserIds: excludedRecipients.map((recipient) => recipient.userId),
  }
}

function draftsFromRecipientSelection(recipientSelection: NotificationRecipientSelection | null): RuleDraft[] {
  if (recipientSelection === null) {
    return []
  }

  return recipientSelection.rules.map((rule) => {
    const id = crypto.randomUUID()

    if (rule.type === "ALL_USERS") {
      return {
        id,
        type: "ALL_USERS",
        membershipStatus: rule.membershipStatus,
        membershipTypes: rule.membershipTypes ?? null,
        studyGrades: rule.studyGrades ?? null,
        requiresActiveCommitteeMembership: rule.requiresActiveCommitteeMembership,
      }
    }

    if (rule.type === "GROUP_MEMBERS") {
      return {
        id,
        type: "GROUP_MEMBERS",
        groupSlug: rule.groupSlug,
        includeFormerMembers: rule.includeFormerMembers,
      }
    }

    if (rule.type === "EVENT_ATTENDEES") {
      return {
        id,
        type: "EVENT_ATTENDEES",
        eventId: null,
        attendanceId: rule.attendanceId,
        reservationStatus: rule.reservationStatus,
        paymentStatus: rule.paymentStatus,
        attendanceSelectionOptions: rule.attendanceSelectionOptions ?? null,
      }
    }

    return {
      id,
      type: "USERS",
      users: rule.userIds.map((userId) => ({
        id: userId,
        name: null,
        imageUrl: null,
      })),
    }
  })
}

export function RecipientSelectionBuilder({
  value,
  onChange,
  type,
  countMode = "total",
}: {
  value: NotificationRecipientSelection | null
  onChange: (recipientSelection: NotificationRecipientSelection | null) => void
  type: NotificationType
  countMode?: "total" | "new"
}) {
  const { isAdministrator } = useAuthorization()
  const [drafts, setDrafts] = useState<RuleDraft[]>(() => draftsFromRecipientSelection(value))
  const [excludedRecipients, setExcludedRecipients] = useState<ExcludedRecipient[]>(() =>
    (value?.excludedUserIds ?? []).map((userId) => ({
      userId,
      name: null,
      imageUrl: null,
    }))
  )
  const [isExcludedOpen, setIsExcludedOpen] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState("")

  const recipientSelection = toRecipientSelection(drafts, excludedRecipients)
  const { preview, recipients, isPending, isForbidden, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useRecipientSelectionPreviewInfinite(recipientSelection, type, recipientSearch)
  const { ref: loadMoreRef, inViewport: isLoadMoreVisible } = useInViewport()
  const hasAllUsersRule = drafts.some((draft) => draft.type === "ALL_USERS")

  useEffect(() => {
    if (!isLoadMoreVisible) {
      return
    }

    if (!hasNextPage) {
      return
    }

    if (isFetchingNextPage) {
      return
    }

    fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoadMoreVisible])

  const commit = (nextDrafts: RuleDraft[], nextExcludedRecipients: ExcludedRecipient[]) => {
    setDrafts(nextDrafts)
    setExcludedRecipients(nextExcludedRecipients)
    onChange(toRecipientSelection(nextDrafts, nextExcludedRecipients))
  }

  const addRule = (ruleType: RuleDraft["type"]) => {
    if (ruleType === "ALL_USERS" && hasAllUsersRule) {
      return
    }

    commit([...drafts, createRuleDraft(ruleType)], excludedRecipients)
  }

  const excludeUser = (user: ExcludedRecipient) => {
    const isAlreadyExcluded = excludedRecipients.some((excludedRecipient) => excludedRecipient.userId === user.userId)

    if (isAlreadyExcluded) {
      return
    }

    commit(drafts, [...excludedRecipients, user])
  }

  const recipientCount = isForbidden ? 0 : (preview?.recipientCount ?? 0)
  let recipientCountTitle = `${recipientCount} personer blir mottakere`

  if (countMode === "new") {
    recipientCountTitle = `Opptil ${recipientCount} nye mottakere`
  }

  return (
    <Stack>
      <Stack gap="xs">
        <Text fw={500}>Mottakere</Text>

        <Group gap="xs" wrap="wrap">
          {isAdministrator && (
            <Button size="xs" variant="light" disabled={hasAllUsersRule} onClick={() => addRule("ALL_USERS")}>
              {getRuleLabel("ALL_USERS")}
            </Button>
          )}

          <Button size="xs" variant="light" onClick={() => addRule("GROUP_MEMBERS")}>
            {getRuleLabel("GROUP_MEMBERS")}
          </Button>

          <Button size="xs" variant="light" onClick={() => addRule("EVENT_ATTENDEES")}>
            {getRuleLabel("EVENT_ATTENDEES")}
          </Button>

          <Button size="xs" variant="light" onClick={() => addRule("USERS")}>
            {getRuleLabel("USERS")}
          </Button>
        </Group>
      </Stack>

      {drafts.length === 0 && (
        <Text size="sm" c="dimmed">
          Legg til minst én mottakergruppe
        </Text>
      )}

      {drafts.map((draft) => (
        <RuleEditor
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
          {isPending && preview === undefined && <Skeleton height={36} width={80} />}

          {preview !== undefined && (
            <Text size="sm" fw={500}>
              {recipientCountTitle}
            </Text>
          )}

          {isForbidden && (
            <Text size="sm" c="red">
              Du kan ikke sende til disse mottakerne
            </Text>
          )}

          {!isForbidden && (
            <Stack gap="xs">
              <TextInput
                placeholder="Søk etter navn"
                value={recipientSearch}
                onChange={(event) => setRecipientSearch(event.currentTarget.value)}
              />

              {isPending && preview === undefined && <Skeleton height={80} />}

              {!isPending && preview !== undefined && recipients.length === 0 && (
                <Text size="sm" c="dimmed">
                  Ingen treff
                </Text>
              )}

              {recipients.length > 0 && (
                <Stack
                  gap="xs"
                  mah={200}
                  p="xs"
                  bg="var(--mantine-color-default-hover)"
                  style={{ overflow: "auto", borderRadius: "var(--mantine-radius-md)" }}
                >
                  {recipients.map((recipient) => (
                    <Group key={recipient.userId} justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <Avatar src={recipient.imageUrl ?? undefined} size="sm" radius="xl">
                          {recipient.name?.charAt(0)}
                        </Avatar>
                        <Text size="sm">{recipient.name ?? "Ukjent"}</Text>
                      </Group>

                      <Group gap="sm" wrap="nowrap">
                        {recipient.sourceLabels.length > 1 ? (
                          <Tooltip label={recipient.sourceLabels.join(", ")}>
                            <Text size="xs" c="dimmed">
                              {recipient.sourceLabels[0] ?? "Ukjent"} + {recipient.sourceLabels.length - 1} flere
                            </Text>
                          </Tooltip>
                        ) : (
                          <Text size="xs" c="dimmed">
                            {recipient.sourceLabels[0] ?? "Ukjent"}
                          </Text>
                        )}

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
                    </Group>
                  ))}

                  {hasNextPage && <div ref={loadMoreRef} style={{ height: 1 }} />}
                  {isFetchingNextPage && <Skeleton height={16} />}
                </Stack>
              )}
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

                  <Button
                    variant="subtle"
                    size="compact-sm"
                    onClick={() =>
                      commit(
                        drafts,
                        excludedRecipients.filter(
                          (currentExcludedRecipient) => currentExcludedRecipient.userId !== excludedRecipient.userId
                        )
                      )
                    }
                  >
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

function RuleEditor({
  draft,
  notificationType,
  onChange,
  onRemove,
}: {
  draft: RuleDraft
  notificationType: NotificationType
  onChange: (draft: RuleDraft) => void
  onRemove: () => void
}) {
  const rule = draftToRule(draft)
  const recipientSelection = rule === null ? null : { rules: [rule], excludedUserIds: [] }
  const { preview, isPending, isForbidden } = useRecipientSelectionPreview(recipientSelection, notificationType)

  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} size="sm">
            {getRuleLabel(draft.type)}
          </Text>

          <Group gap="xs" wrap="nowrap">
            {isPending ? (
              <Skeleton height={15} width={48} />
            ) : (
              <Group gap={5} wrap="nowrap">
                <IconUsers size={15} color={isForbidden ? "var(--mantine-color-red)" : "var(--mantine-color-dimmed)"} />
                <Text size="sm" c={isForbidden ? "red" : "dimmed"}>
                  {isForbidden ? 0 : (preview?.recipientCount ?? "—")}
                </Text>
              </Group>
            )}

            <ActionIcon variant="subtle" color="gray" onClick={onRemove} aria-label="Fjern">
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {draft.type === "ALL_USERS" && <AllUsersFields draft={draft} onChange={onChange} />}
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

function AllUsersFields({
  draft,
  onChange,
}: {
  draft: Extract<RuleDraft, { type: "ALL_USERS" }>
  onChange: (draft: RuleDraft) => void
}) {
  return (
    <Stack gap="xs">
      <Input.Wrapper label="Medlemskap">
        <Stack>
          <SegmentedControl
            size="xs"
            w="18rem"
            value={draft.membershipStatus}
            data={MEMBERSHIP_STATUS_DATA}
            onChange={(value) =>
              onChange({ ...draft, membershipStatus: value as NotificationRecipientMembershipStatus })
            }
          />
        </Stack>
      </Input.Wrapper>

      <MultiSelect
        searchable
        clearable
        label="Medlemstype"
        placeholder="Alle typer"
        data={MEMBERSHIP_TYPE_FILTER_DATA}
        value={draft.membershipTypes ?? []}
        onChange={(values) => {
          if (values.length === 0) {
            onChange({ ...draft, membershipTypes: null })
            return
          }

          onChange({ ...draft, membershipTypes: values as NotificationRecipientMembershipType[] })
        }}
      />

      <MultiSelect
        searchable
        clearable
        label="Klassetrinn"
        placeholder="Alle trinn"
        data={STUDY_GRADE_FILTER_DATA}
        value={(draft.studyGrades ?? []).map((studyGrade) => String(studyGrade))}
        onChange={(values) => {
          if (values.length === 0) {
            onChange({ ...draft, studyGrades: null })
            return
          }

          onChange({ ...draft, studyGrades: values.map((value) => Number(value)) })
        }}
      />

      <Switch
        label="Er aktiv komitémedlem"
        checked={draft.requiresActiveCommitteeMembership}
        onChange={(event) => onChange({ ...draft, requiresActiveCommitteeMembership: event.currentTarget.checked })}
      />
    </Stack>
  )
}

function GroupMembersFields({
  draft,
  onChange,
}: {
  draft: Extract<RuleDraft, { type: "GROUP_MEMBERS" }>
  onChange: (draft: RuleDraft) => void
}) {
  const { isAdministrator, affiliations } = useAuthorization()
  const { groups } = useGroupAllQuery()

  const targetableGroups = useMemo(() => {
    const memberGroups = groups.filter((group) => TARGETABLE_GROUP_TYPES.has(group.type))

    if (isAdministrator) {
      return memberGroups
    }

    return memberGroups.filter((group) => affiliations.has(group.slug))
  }, [affiliations, groups, isAdministrator])

  return (
    <Stack gap="xs">
      <Select
        searchable
        placeholder="Velg gruppe"
        value={draft.groupSlug}
        data={targetableGroups.map((group) => ({
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
  draft: Extract<RuleDraft, { type: "EVENT_ATTENDEES" }>
  onChange: (draft: RuleDraft) => void
}) {
  const hasSelectedEvent = draft.eventId !== null
  const { data: eventWithAttendance } = useEventWithAttendancesGetQuery(draft.eventId ?? "", hasSelectedEvent)
  const attendance = eventWithAttendance?.attendance ?? null
  const shouldShowMissingAttendanceMessage = hasSelectedEvent && attendance === null
  const draftRef = useRef(draft)
  draftRef.current = draft

  useEffect(() => {
    if (draft.eventId === null) {
      return
    }

    const nextAttendanceId = attendance?.id ?? null

    if (nextAttendanceId === draft.attendanceId) {
      return
    }

    onChange({
      ...draftRef.current,
      attendanceId: nextAttendanceId,
      attendanceSelectionOptions: null,
    })
  }, [attendance, draft.eventId, draft.attendanceId, onChange])

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
            attendanceSelectionOptions: null,
            reservationStatus: "RESERVED",
            paymentStatus: "ALL",
          })
        }}
      />

      {shouldShowMissingAttendanceMessage && (
        <Text size="sm" c="dimmed">
          Arrangementet har ingen påmelding
        </Text>
      )}

      <EventAttendeeRecipientFilters
        reservationStatus={draft.reservationStatus}
        paymentStatus={draft.paymentStatus}
        attendanceSelectionOptions={draft.attendanceSelectionOptions}
        hasPayment={attendance?.attendancePrice != null}
        selections={attendance?.selections ?? []}
        disabled={attendance === null}
        onChange={(next) => onChange({ ...draft, ...next })}
      />
    </Stack>
  )
}

function UsersFields({
  draft,
  onChange,
}: {
  draft: Extract<RuleDraft, { type: "USERS" }>
  onChange: (draft: RuleDraft) => void
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
