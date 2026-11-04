"use client"

import type {
  NotificationRecipientMembershipStatus,
  NotificationRecipientMembershipType,
} from "@dotkomonline/rpc/notification"
import { getMembershipTypeName } from "@dotkomonline/rpc/user"
import { TagInput } from "@dotkomonline/ui"
import { ChoiceGroup, LabeledToggle } from "./RecipientSelectionControls"
import type { RecipientRuleDraft } from "./recipient-selection-draft"

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

export function AllUsersFields({
  draft,
  onChange,
}: {
  draft: Extract<RecipientRuleDraft, { type: "ALL_USERS" }>
  onChange: (draft: RecipientRuleDraft) => void
}) {
  const labelByValue = new Map(MEMBERSHIP_TYPE_FILTER_DATA.map((item) => [item.value, item.label]))
  const valueByLabel = new Map(MEMBERSHIP_TYPE_FILTER_DATA.map((item) => [item.label, item.value]))

  const membershipTypeLabels = MEMBERSHIP_TYPE_FILTER_DATA.map((item) => item.label)
  const selectedMembershipTypeLabels = (draft.membershipTypes ?? [])
    .map((membershipType) => labelByValue.get(membershipType))
    .filter((label) => label !== undefined)

  const studyGradeLabels = STUDY_GRADE_FILTER_DATA.map((item) => item.label)
  const selectedStudyGradeLabels = (draft.studyGrades ?? []).map((studyGrade) => String(studyGrade))

  const handleMembershipTypesChange = (labels: string[]) => {
    const membershipTypes = labels.map((label) => valueByLabel.get(label)).filter((value) => value !== undefined)
    const nextMembershipTypes = membershipTypes.length > 0 ? membershipTypes : null

    onChange({ ...draft, membershipTypes: nextMembershipTypes })
  }

  const handleStudyGradesChange = (labels: string[]) => {
    const studyGrades = labels.map((label) => Number(label))
    const nextStudyGrades = studyGrades.length > 0 ? studyGrades : null

    onChange({ ...draft, studyGrades: nextStudyGrades })
  }

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
          data={membershipTypeLabels}
          value={selectedMembershipTypeLabels}
          onChange={handleMembershipTypesChange}
          className="bg-background"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Klassetrinn</span>
        <TagInput
          creatable={false}
          placeholder="Alle trinn"
          data={studyGradeLabels}
          value={selectedStudyGradeLabels}
          onChange={handleStudyGradesChange}
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
