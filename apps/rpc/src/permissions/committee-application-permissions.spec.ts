import { describe, expect, it } from "vitest"
import type { GroupId, GroupRoleType } from "../modules/group/group"
import * as permissions from "./committee-application-permissions"
import type { AffiliatedPrincipal } from "./principal"

function principalWithGroups(groupIds: readonly GroupId[]): AffiliatedPrincipal {
  const affiliations = new Map<GroupId, Set<GroupRoleType>>()

  for (const groupId of groupIds) {
    affiliations.set(groupId, new Set())
  }

  return { affiliations }
}

const administratorUseCases = [
  ["create a period", permissions.canCreateCommitteeApplicationPeriod],
  ["delete a period", permissions.canDeleteCommitteeApplicationPeriod],
  ["view periods", permissions.canViewCommitteeApplicationPeriods],
  ["update a period", permissions.canUpdateCommitteeApplicationPeriod],
  ["view applications", permissions.canViewCommitteeApplications],
  ["view interview blocks", permissions.canViewCommitteeApplicationInterviewBlocks],
  ["set interview blocks", permissions.canSetCommitteeApplicationInterviewBlocks],
  ["schedule an interview", permissions.canScheduleCommitteeApplicationInterview],
  ["cancel an interview", permissions.canCancelCommitteeApplicationInterview],
  ["view an interview", permissions.canViewCommitteeApplicationInterview],
  ["reschedule an interview", permissions.canRescheduleCommitteeApplicationInterview],
  ["generate interviews", permissions.canGenerateCommitteeApplicationInterviews],
  ["clear interviews", permissions.canClearCommitteeApplicationInterviews],
  ["view the interview schedule", permissions.canViewCommitteeApplicationInterviewSchedule],
  ["confirm interviews", permissions.canConfirmCommitteeApplicationInterviews],
  ["revert publication", permissions.canRevertCommitteeApplicationInterviewPublication],
] as const

describe.each(administratorUseCases)("permission to %s", (_description, canPerformUseCase) => {
  it.each([
    { description: "Dotkom", groupIds: ["dotkom"], isAllowed: true },
    { description: "Hovedstyret", groupIds: ["hs"], isAllowed: true },
    { description: "another committee", groupIds: ["appkom"], isAllowed: false },
    { description: "an interest group", groupIds: ["interest-group"], isAllowed: false },
    { description: "an unknown group", groupIds: ["unknown-group"], isAllowed: false },
    { description: "no affiliations", groupIds: [], isAllowed: false },
  ])("checks $description", ({ groupIds, isAllowed }) => {
    expect(canPerformUseCase(principalWithGroups(groupIds))).toBe(isAllowed)
  })
})

describe("permission to interview applicants", () => {
  it.each([
    { groupIds: ["dotkom"], isAllowed: true },
    { groupIds: ["hs"], isAllowed: true },
    { groupIds: ["appkom"], isAllowed: true },
    { groupIds: ["interest-group"], isAllowed: false },
    { groupIds: [], isAllowed: false },
  ])("checks affiliations $groupIds", ({ groupIds, isAllowed }) => {
    expect(permissions.canInterviewCommitteeApplicationApplicants(principalWithGroups(groupIds))).toBe(isAllowed)
  })
})

describe("permission to view applicant details", () => {
  it.each([
    { groupIds: ["appkom"], selectedGroupIds: ["appkom", "bedkom"], isAllowed: true },
    { groupIds: ["bedkom"], selectedGroupIds: ["appkom", "bedkom"], isAllowed: true },
    { groupIds: ["arrkom"], selectedGroupIds: ["appkom", "bedkom"], isAllowed: false },
    { groupIds: [], selectedGroupIds: ["appkom"], isAllowed: false },
    { groupIds: ["interest-group"], selectedGroupIds: ["interest-group"], isAllowed: false },
    { groupIds: ["appkom", "interest-group"], selectedGroupIds: ["interest-group"], isAllowed: true },
    { groupIds: ["dotkom"], selectedGroupIds: ["appkom"], isAllowed: true },
    { groupIds: ["hs"], selectedGroupIds: ["appkom"], isAllowed: true },
    { groupIds: ["dotkom"], selectedGroupIds: [], isAllowed: true },
    { groupIds: ["appkom"], selectedGroupIds: [], isAllowed: false },
  ])("checks affiliations $groupIds against selections $selectedGroupIds", ({
    groupIds,
    selectedGroupIds,
    isAllowed,
  }) => {
    const principal = principalWithGroups(groupIds)

    expect(permissions.canViewCommitteeApplicationApplicantDetails(principal, selectedGroupIds)).toBe(isAllowed)
  })
})

describe("permission to sign up as an interviewer", () => {
  it.each([
    { groupIds: ["appkom"], targetGroupId: "appkom", isAllowed: true },
    { groupIds: ["appkom", "bedkom"], targetGroupId: "bedkom", isAllowed: true },
    { groupIds: ["bedkom"], targetGroupId: "appkom", isAllowed: false },
    { groupIds: [], targetGroupId: "appkom", isAllowed: false },
    { groupIds: ["interest-group"], targetGroupId: "interest-group", isAllowed: false },
    { groupIds: ["appkom", "interest-group"], targetGroupId: "interest-group", isAllowed: true },
    { groupIds: ["dotkom"], targetGroupId: "appkom", isAllowed: true },
    { groupIds: ["hs"], targetGroupId: "appkom", isAllowed: true },
  ])("checks affiliations $groupIds against target $targetGroupId", ({ groupIds, targetGroupId, isAllowed }) => {
    const principal = principalWithGroups(groupIds)

    expect(permissions.canSetCommitteeApplicationInterviewAttendance(principal, targetGroupId)).toBe(isAllowed)
  })
})
