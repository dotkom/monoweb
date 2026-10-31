"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { canTargetAllUsers, canTargetSpecificUsers } from "@dotkomonline/rpc/notification-permissions"
import type { NotificationType } from "@dotkomonline/rpc/notification"
import {
  Button,
  Collapsible,
  CollapsibleContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineItem,
} from "@dotkomonline/ui"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { RecipientPreview } from "./recipient-selection/RecipientPreview"
import { RecipientRuleEditor } from "./recipient-selection/RecipientRuleEditor"
import { PersonAvatar, SavedRecipientDetails } from "./recipient-selection/RecipientIdentity"
import {
  createRecipientRuleDraft,
  draftToRule,
  getRuleLabel,
  toRecipientSelection,
  type ExcludedRecipient,
  type RecipientRuleDraft,
  type RecipientSelectionDraft,
} from "./recipient-selection/recipient-selection-draft"

export function RecipientSelectionBuilder({
  value,
  onChange,
  type,
  notificationId,
}: {
  value: RecipientSelectionDraft
  onChange: (draft: RecipientSelectionDraft) => void
  type: NotificationType
  notificationId?: string
}) {
  const authorization = useAuthorization()
  const canTargetEveryone = canTargetAllUsers(authorization)
  const canTargetIndividuals = canTargetSpecificUsers(authorization)

  const { rules: drafts, excludedRecipients } = value

  const [isExcludedOpen, setIsExcludedOpen] = useState(false)

  const recipientSelection = toRecipientSelection(drafts, excludedRecipients)
  const hasAllUsersRule = drafts.some((draft) => draft.type === "ALL_USERS")
  const hasRules = drafts.length > 0

  const previewRuleNumbers = drafts.flatMap((draft, index) => {
    const rule = draftToRule(draft)

    if (rule === null) {
      return []
    }

    return [index + 1]
  })

  const updateRecipientSelection = (nextDrafts: RecipientRuleDraft[], nextExcludedRecipients: ExcludedRecipient[]) => {
    onChange({ rules: nextDrafts, excludedRecipients: nextExcludedRecipients })
  }

  const addRule = (ruleType: RecipientRuleDraft["type"]) => {
    if (ruleType === "ALL_USERS" && !canTargetEveryone) {
      return
    }

    if (ruleType === "USERS" && !canTargetIndividuals) {
      return
    }

    if (ruleType === "ALL_USERS" && hasAllUsersRule) {
      return
    }

    const newDraft = createRecipientRuleDraft(ruleType)
    const nextDrafts = [...drafts, newDraft]

    updateRecipientSelection(nextDrafts, excludedRecipients)
  }

  const updateRule = (nextDraft: RecipientRuleDraft) => {
    const nextDrafts = drafts.map((draft) => (draft.id === nextDraft.id ? nextDraft : draft))

    updateRecipientSelection(nextDrafts, excludedRecipients)
  }

  const removeRule = (draftId: string) => {
    const nextDrafts = drafts.filter((draft) => draft.id !== draftId)

    updateRecipientSelection(nextDrafts, excludedRecipients)
  }

  const excludeRecipient = (recipient: ExcludedRecipient) => {
    const isAlreadyExcluded = excludedRecipients.some(
      (excludedRecipient) => excludedRecipient.userId === recipient.userId
    )

    if (isAlreadyExcluded) {
      return
    }

    const nextExcludedRecipients = [...excludedRecipients, recipient]

    updateRecipientSelection(drafts, nextExcludedRecipients)
  }

  const restoreRecipient = (userId: string) => {
    const nextExcludedRecipients = excludedRecipients.filter((recipient) => recipient.userId !== userId)

    updateRecipientSelection(drafts, nextExcludedRecipients)
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <Text className="font-medium">Mottakere</Text>

        {!hasRules && <Text className="text-sm text-muted-foreground">Legg til minst én mottakergruppe</Text>}

        {hasRules && (
          <Timeline orientation="vertical" color="gray" rail="segmented" role="list" aria-label="Mottakerregler">
            {drafts.map((draft, index) => {
              const ruleNumber = index + 1

              return (
                <TimelineItem key={draft.id} role="listitem" aria-label={`Mottakerregel ${ruleNumber}`}>
                  <TimelineDot
                    render={<Text className="text-sm font-medium font-mono text-muted-foreground">#{ruleNumber}</Text>}
                    size={24}
                    offset={18}
                  />
                  <TimelineContent>
                    <RecipientRuleEditor
                      draft={draft}
                      notificationType={type}
                      onChange={updateRule}
                      onRemove={() => removeRule(draft.id)}
                    />
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        )}

        <div className={hasRules ? "pl-8" : undefined}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-14 w-64 max-w-full border-2 border-dashed text-muted-foreground hover:text-foreground"
              >
                <IconPlus className="size-5" aria-hidden />
                Legg til mottakere
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" matchTriggerWidth>
              {canTargetEveryone && (
                <DropdownMenuItem disabled={hasAllUsersRule} onClick={() => addRule("ALL_USERS")}>
                  {getRuleLabel("ALL_USERS")}
                </DropdownMenuItem>
              )}
              {canTargetIndividuals && (
                <DropdownMenuItem onClick={() => addRule("USERS")}>{getRuleLabel("USERS")}</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => addRule("EVENT_ATTENDEES")}>
                {getRuleLabel("EVENT_ATTENDEES")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addRule("GROUP_MEMBERS")}>
                {getRuleLabel("GROUP_MEMBERS")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(recipientSelection !== null || excludedRecipients.length > 0) && (
        <div className="flex flex-col gap-4">
          <RecipientPreview
            recipientSelection={recipientSelection}
            ruleNumbers={previewRuleNumbers}
            notificationType={type}
            notificationId={notificationId}
            onExclude={excludeRecipient}
          />

          {excludedRecipients.length > 0 && (
            <Collapsible open={isExcludedOpen} onOpenChange={setIsExcludedOpen}>
              <Button
                className="text-sm text-muted-foreground"
                onClick={() => setIsExcludedOpen((wasOpen) => !wasOpen)}
              >
                Ekskludert ({excludedRecipients.length})
              </Button>
              <CollapsibleContent>
                <div className="mt-2 flex flex-col gap-2">
                  {excludedRecipients.map((excludedRecipient) => (
                    <div key={excludedRecipient.userId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {excludedRecipient.name === null ? (
                          <SavedRecipientDetails userId={excludedRecipient.userId} />
                        ) : (
                          <>
                            <PersonAvatar name={excludedRecipient.name} imageUrl={excludedRecipient.imageUrl} />
                            <Text className="text-sm">{excludedRecipient.name}</Text>
                          </>
                        )}
                      </div>
                      <Button size="sm" onClick={() => restoreRecipient(excludedRecipient.userId)}>
                        Gjenopprett
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  )
}
