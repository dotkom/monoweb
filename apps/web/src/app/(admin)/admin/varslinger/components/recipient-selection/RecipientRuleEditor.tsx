"use client"

import type { NotificationType } from "@dotkomonline/rpc/notification"
import { Button, Text } from "@dotkomonline/ui"
import { IconUsers, IconX } from "@tabler/icons-react"
import { useRecipientSelectionPreview } from "../../queries"
import { draftToRule, getRuleLabel, type RecipientRuleDraft } from "./recipient-selection-draft"
import { AllUsersFields } from "./AllUsersFields"
import { GroupMembersFields } from "./GroupMembersFields"
import { EventAttendeesFields } from "./EventAttendeesFields"
import { UsersFields } from "./UsersFields"

export function RecipientRuleEditor({
  draft,
  notificationType,
  onChange,
  onRemove,
}: {
  draft: RecipientRuleDraft
  notificationType: NotificationType
  onChange: (draft: RecipientRuleDraft) => void
  onRemove: () => void
}) {
  const rule = draftToRule(draft)
  const recipientSelection = rule === null ? null : { rules: [rule], excludedUserIds: [] }
  const { preview, isPending, isForbidden } = useRecipientSelectionPreview(recipientSelection, notificationType)

  const ruleLabel = getRuleLabel(draft.type)
  const hasCompleteRule = rule !== null
  const isLoadingPreview = hasCompleteRule && isPending
  const showRecipientCount = hasCompleteRule && !isPending
  const recipientCount = isForbidden ? 0 : (preview?.recipientCount ?? "—")
  const countColor = isForbidden ? "text-red-600" : "text-muted-foreground"

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-border bg-muted px-3 pt-2 pb-2">
        <Text className="text-base font-title font-medium">{ruleLabel}</Text>

        <div className="flex items-center gap-2">
          {isLoadingPreview && <div className="h-4 w-12 animate-pulse rounded-sm bg-muted" />}

          {showRecipientCount && (
            <div className="flex items-center gap-1">
              <IconUsers size={15} className={countColor} />
              <Text className={`text-sm ${countColor}`}>{recipientCount}</Text>
            </div>
          )}

          <Button type="button" variant="ghost" color="red" size="icon-sm" onClick={onRemove} aria-label="Fjern">
            <IconX className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-3 pb-3">
        {draft.type === "ALL_USERS" && <AllUsersFields draft={draft} onChange={onChange} />}
        {draft.type === "GROUP_MEMBERS" && <GroupMembersFields draft={draft} onChange={onChange} />}
        {draft.type === "EVENT_ATTENDEES" && <EventAttendeesFields draft={draft} onChange={onChange} />}
        {draft.type === "USERS" && <UsersFields draft={draft} onChange={onChange} />}

        {isForbidden && <Text className="text-sm text-red-600">Du kan ikke sende til disse mottakerne</Text>}
      </div>
    </div>
  )
}
