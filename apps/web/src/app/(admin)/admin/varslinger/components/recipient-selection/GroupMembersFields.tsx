"use client"

import { useGroupAllQuery } from "@admin/grupper/queries"
import { useAuthorization } from "@admin/auth/authorization-context"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { canTargetGroupMembers } from "@dotkomonline/rpc/notification-permissions"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import { useMemo } from "react"
import { LabeledToggle } from "./RecipientSelectionControls"
import type { RecipientRuleDraft } from "./recipient-selection-draft"

const TARGETABLE_GROUP_TYPES = new Set(["COMMITTEE", "NODE_COMMITTEE", "ASSOCIATED", "INTEREST_GROUP"])

export function GroupMembersFields({
  draft,
  onChange,
}: {
  draft: Extract<RecipientRuleDraft, { type: "GROUP_MEMBERS" }>
  onChange: (draft: RecipientRuleDraft) => void
}) {
  const authorization = useAuthorization()
  const { groups } = useGroupAllQuery()

  const targetableGroups = useMemo(() => {
    return groups.filter((group) => {
      const hasTargetableType = TARGETABLE_GROUP_TYPES.has(group.type)
      const canTargetGroup = canTargetGroupMembers(authorization, group)

      return hasTargetableType && canTargetGroup
    })
  }, [authorization, groups])

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
