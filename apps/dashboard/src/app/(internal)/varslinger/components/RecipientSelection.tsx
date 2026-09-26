"use client"

import { useEventWithAttendancesGetQuery } from "@/app/(internal)/arrangementer/queries"
import { UserSearch } from "@/app/(internal)/brukere/components/UserSearch"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useAuthorization } from "@/auth/authorization-context"
import { EventSelectInput } from "@/components/forms/EventSelectInput"
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
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TagInput,
  Text,
  TextInput,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { IconUsers, IconX } from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRecipientSelectionPreview, useRecipientSelectionPreviewInfinite } from "../queries"
import { EventAttendeeRecipientFilters } from "./EventAttendeeRecipientFilters"

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
        type: "ALL_USERS" as const,
        membershipStatus: rule.membershipStatus,
        membershipTypes: rule.membershipTypes ?? null,
        studyGrades: rule.studyGrades ?? null,
        requiresActiveCommitteeMembership: rule.requiresActiveCommitteeMembership,
      }
    }

    if (rule.type === "GROUP_MEMBERS") {
      return {
        id,
        type: "GROUP_MEMBERS" as const,
        groupSlug: rule.groupSlug,
        includeFormerMembers: rule.includeFormerMembers,
      }
    }

    if (rule.type === "EVENT_ATTENDEES") {
      return {
        id,
        type: "EVENT_ATTENDEES" as const,
        eventId: null,
        attendanceId: rule.attendanceId,
        reservationStatus: rule.reservationStatus,
        paymentStatus: rule.paymentStatus,
        attendanceSelectionOptions: rule.attendanceSelectionOptions ?? null,
      }
    }

    return {
      id,
      type: "USERS" as const,
      users: rule.userIds.map((userId) => ({
        id: userId,
        name: null,
        imageUrl: null,
      })),
    }
  })
}

function PersonAvatar({ name, imageUrl }: { name: string | null; imageUrl: string | null }) {
  return (
    <Avatar size="sm">
      {imageUrl && <AvatarImage src={imageUrl} alt="" />}
      <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

function LabeledToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: yes but no
    <label className="flex items-center gap-2 text-sm">
      <Toggle checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  )
}

function ChoiceGroup<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: TValue
  options: { label: string; value: TValue }[]
  onChange: (value: TValue) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <ToggleGroup
        multiple={false}
        value={[value]}
        onValueChange={(next) => {
          const selected = next.at(0)

          if (!selected) {
            return
          }

          onChange(selected as TValue)
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
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
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null)

  const recipientSelection = toRecipientSelection(drafts, excludedRecipients)
  const { preview, recipients, isPending, isForbidden, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useRecipientSelectionPreviewInfinite(recipientSelection, type, recipientSearch)
  const hasAllUsersRule = drafts.some((draft) => draft.type === "ALL_USERS")

  useEffect(() => {
    if (loadMoreNode === null) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        return
      }

      if (!hasNextPage) {
        return
      }

      if (isFetchingNextPage) {
        return
      }

      fetchNextPage()
    })

    observer.observe(loadMoreNode)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, loadMoreNode])

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Text className="font-medium">Mottakere</Text>
        <div className="flex flex-wrap gap-2">
          {isAdministrator && (
            <Button size="xs" variant="secondary" disabled={hasAllUsersRule} onClick={() => addRule("ALL_USERS")}>
              {getRuleLabel("ALL_USERS")}
            </Button>
          )}
          <Button size="xs" variant="secondary" onClick={() => addRule("GROUP_MEMBERS")}>
            {getRuleLabel("GROUP_MEMBERS")}
          </Button>
          <Button size="xs" variant="secondary" onClick={() => addRule("EVENT_ATTENDEES")}>
            {getRuleLabel("EVENT_ATTENDEES")}
          </Button>
          <Button size="xs" variant="secondary" onClick={() => addRule("USERS")}>
            {getRuleLabel("USERS")}
          </Button>
        </div>
      </div>

      {drafts.length === 0 && <Text className="text-sm text-muted-foreground">Legg til minst én mottakergruppe</Text>}

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
        <div className="flex flex-col gap-3">
          {isPending && preview === undefined && <div className="h-9 w-20 animate-pulse rounded-sm bg-muted" />}

          {preview !== undefined && <Text className="text-sm font-medium">{recipientCountTitle}</Text>}

          {isForbidden && <Text className="text-sm text-red-600">Du kan ikke sende til disse mottakerne</Text>}

          {!isForbidden && (
            <div className="flex flex-col gap-2">
              <TextInput
                placeholder="Søk etter navn"
                value={recipientSearch}
                onChange={(event) => setRecipientSearch(event.currentTarget.value)}
              />

              {isPending && preview === undefined && <div className="h-20 animate-pulse rounded-sm bg-muted" />}

              {!isPending && preview !== undefined && recipients.length === 0 && (
                <Text className="text-sm text-muted-foreground">Ingen treff</Text>
              )}

              {recipients.length > 0 && (
                <div className="flex max-h-50 flex-col gap-2 overflow-auto rounded-md bg-muted/60 p-2">
                  {recipients.map((recipient) => (
                    <div key={recipient.userId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PersonAvatar name={recipient.name} imageUrl={recipient.imageUrl} />
                        <Text className="text-sm">{recipient.name ?? "Ukjent"}</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        {recipient.sourceLabels.length > 1 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground">
                                {recipient.sourceLabels[0] ?? "Ukjent"} + {recipient.sourceLabels.length - 1} flere
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{recipient.sourceLabels.join(", ")}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">{recipient.sourceLabels[0] ?? "Ukjent"}</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Ekskluder"
                          onClick={() =>
                            excludeUser({
                              userId: recipient.userId,
                              name: recipient.name,
                              imageUrl: recipient.imageUrl,
                            })
                          }
                        >
                          <IconX className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {hasNextPage && <div ref={setLoadMoreNode} className="h-px" />}
                  {isFetchingNextPage && <div className="h-4 animate-pulse rounded-sm bg-muted" />}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {excludedRecipients.length > 0 && (
        <Collapsible open={isExcludedOpen} onOpenChange={setIsExcludedOpen}>
          <Button className="text-sm text-muted-foreground" onClick={() => setIsExcludedOpen((wasOpen) => !wasOpen)}>
            Ekskludert ({excludedRecipients.length})
          </Button>
          <CollapsibleContent>
            <div className="mt-2 flex flex-col gap-2">
              {excludedRecipients.map((excludedRecipient) => (
                <div key={excludedRecipient.userId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PersonAvatar name={excludedRecipient.name} imageUrl={excludedRecipient.imageUrl} />
                    <Text className="text-sm">{excludedRecipient.name ?? "Ukjent"}</Text>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
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
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
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
    <Card size="sm" className="px-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Text className="text-sm font-medium">{getRuleLabel(draft.type)}</Text>
          <div className="flex items-center gap-2">
            {isPending ? (
              <div className="h-4 w-12 animate-pulse rounded-sm bg-muted" />
            ) : (
              <div className="flex items-center gap-1">
                <IconUsers size={15} className={isForbidden ? "text-red-600" : "text-muted-foreground"} />
                <Text className={isForbidden ? "text-sm text-red-600" : "text-sm text-muted-foreground"}>
                  {isForbidden ? 0 : (preview?.recipientCount ?? "—")}
                </Text>
              </div>
            )}
            <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Fjern">
              <IconX className="size-4" />
            </Button>
          </div>
        </div>

        {draft.type === "ALL_USERS" && <AllUsersFields draft={draft} onChange={onChange} />}
        {draft.type === "GROUP_MEMBERS" && <GroupMembersFields draft={draft} onChange={onChange} />}
        {draft.type === "EVENT_ATTENDEES" && <EventAttendeesFields draft={draft} onChange={onChange} />}
        {draft.type === "USERS" && <UsersFields draft={draft} onChange={onChange} />}

        {isForbidden && <Text className="text-sm text-red-600">Du kan ikke sende til disse mottakerne</Text>}
      </div>
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
  const labelByValue = new Map(MEMBERSHIP_TYPE_FILTER_DATA.map((item) => [item.value, item.label]))
  const valueByLabel = new Map(MEMBERSHIP_TYPE_FILTER_DATA.map((item) => [item.label, item.value]))

  return (
    <div className="flex flex-col gap-3">
      <ChoiceGroup
        label="Medlemskap"
        value={draft.membershipStatus}
        options={MEMBERSHIP_STATUS_DATA}
        onChange={(value) => onChange({ ...draft, membershipStatus: value })}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Medlemstype</span>
        <TagInput
          creatable={false}
          placeholder="Alle typer"
          data={MEMBERSHIP_TYPE_FILTER_DATA.map((item) => item.label)}
          value={(draft.membershipTypes ?? []).flatMap((membershipType) => {
            const label = labelByValue.get(membershipType)

            if (label === undefined) {
              return []
            }

            return [label]
          })}
          onChange={(labels) => {
            const values = labels.flatMap((label) => {
              const membershipType = valueByLabel.get(label)

              if (membershipType === undefined) {
                return []
              }

              return [membershipType]
            })

            if (values.length === 0) {
              onChange({ ...draft, membershipTypes: null })
              return
            }

            onChange({ ...draft, membershipTypes: values })
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Klassetrinn</span>
        <TagInput
          creatable={false}
          placeholder="Alle trinn"
          data={STUDY_GRADE_FILTER_DATA.map((item) => item.label)}
          value={(draft.studyGrades ?? []).map((studyGrade) => String(studyGrade))}
          onChange={(labels) => {
            if (labels.length === 0) {
              onChange({ ...draft, studyGrades: null })
              return
            }

            onChange({ ...draft, studyGrades: labels.map((label) => Number(label)) })
          }}
        />
      </div>

      <LabeledToggle
        label="Er aktiv komitémedlem"
        checked={draft.requiresActiveCommitteeMembership}
        onCheckedChange={(checked) => onChange({ ...draft, requiresActiveCommitteeMembership: checked })}
      />
    </div>
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

  const options = targetableGroups.map((group) => ({
    value: group.slug,
    label: getGroupDisplayName(group),
  }))

  return (
    <div className="flex flex-col gap-3">
      <Select
        value={draft.groupSlug}
        onValueChange={(value) => {
          onChange({ ...draft, groupSlug: value })
        }}
        items={options}
      >
        <SelectTrigger>
          <SelectValue placeholder="Velg gruppe" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <LabeledToggle
        label="Inkluder tidligere medlemmer"
        checked={draft.includeFormerMembers}
        onCheckedChange={(checked) => onChange({ ...draft, includeFormerMembers: checked })}
      />
    </div>
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
    <div className="flex flex-col gap-3">
      <EventSelectInput
        placeholder="Velg arrangement"
        value={draft.eventId ?? ""}
        onChange={(eventId) => {
          onChange({
            ...draft,
            eventId: eventId.length === 0 ? null : eventId,
            attendanceId: null,
            attendanceSelectionOptions: null,
            reservationStatus: "RESERVED",
            paymentStatus: "ALL",
          })
        }}
      />

      {shouldShowMissingAttendanceMessage && (
        <Text className="text-sm text-muted-foreground">Arrangementet har ingen påmelding</Text>
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
    </div>
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
    <div className="flex flex-col gap-3">
      {draft.users.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {draft.users.map((user) => (
            <div key={user.id} className="flex items-center gap-1.5">
              <PersonAvatar name={user.name} imageUrl={user.imageUrl} />
              <Text className="text-sm">{user.name ?? "Ukjent"}</Text>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Fjern person"
                onClick={() =>
                  onChange({
                    ...draft,
                    users: draft.users.filter((selectedUser) => selectedUser.id !== user.id),
                  })
                }
              >
                <IconX className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
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
    </div>
  )
}
