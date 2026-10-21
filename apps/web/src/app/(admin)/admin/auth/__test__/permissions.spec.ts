import { canAccessAuditLog } from "@dotkomonline/rpc/audit-log-permissions"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import {
  canCreateContest,
  canCreateContests,
  canManageContest,
  canSetContestOrganizers,
} from "@dotkomonline/rpc/contest-permissions"
import {
  canCreateEvent,
  canCreateEvents,
  canEditEvent,
  canSetEventOrganizers,
} from "@dotkomonline/rpc/event-permissions"
import { canManageFadderuker } from "@dotkomonline/rpc/fadderuke-permissions"
import {
  canManageFeedbackForm,
  canSubmitFeedbackAnswer,
  canViewOwnFeedbackAnswer,
} from "@dotkomonline/rpc/feedback-form-permissions"
import type { GroupRoleType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum, GroupTypeSchema } from "@dotkomonline/rpc/group"
import {
  canCreateGroup,
  canCreateGroups,
  canManageGroupMembership,
  canSetGroupType,
  canUpdateGroup,
} from "@dotkomonline/rpc/group-permissions"
import { canManageJobListings } from "@dotkomonline/rpc/job-listing-permissions"
import { canCreateMark, canCreateMarks, canManageMark, canSetMarkGroups } from "@dotkomonline/rpc/mark-permissions"
import { canManageNotification } from "@dotkomonline/rpc/notification-permissions"
import { canManageOfflines } from "@dotkomonline/rpc/offline-permissions"
import {
  canEditUserNameAndEmail,
  canEditUserProfile,
  canManageUserMemberships,
} from "@dotkomonline/rpc/user-permissions"
import {
  canCreateWorkspaceUser,
  canFindWorkspaceUser,
  canSynchronizeWorkspaceGroup,
} from "@dotkomonline/rpc/workspace-permissions"
import { describe, expect, it } from "vitest"
import { createAuthorizationState, hasAnyGroupAffiliation } from "../permissions"

function createState(affiliations: Record<string, GroupRoleType[]>, options: { isAdministrator?: boolean } = {}) {
  return createAuthorizationState({
    isAdministrator: options.isAdministrator ?? false,
    isCommitteeMember: true,
    affiliations,
  })
}

describe("hasAnyGroupAffiliation", () => {
  it("returns true when user shares a hosting group", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(hasAnyGroupAffiliation(state, ["arrkom"])).toBe(true)
  })

  it("returns false when user has no overlapping groups", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(hasAnyGroupAffiliation(state, ["dotkom"])).toBe(false)
  })

  it("returns true for administrators regardless of affiliations", () => {
    const state = createState({}, { isAdministrator: true })

    expect(hasAnyGroupAffiliation(state, ["dotkom"])).toBe(true)
  })

  it("returns true for dotkom members acting on any group", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(hasAnyGroupAffiliation(state, ["arrkom"])).toBe(true)
  })
})

describe("canEditEvent", () => {
  it("allows editing when user hosts the event", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"])).toBe(false)
  })

  it("allows editing when the user hosts via a committee even if interest groups are also organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["backlog", "some-interest-group"])).toBe(true)
  })

  it("ignores interest-group-only organizers for edit permission", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["some-interest-group"])).toBe(false)
  })
})

describe("canSetEventOrganizers", () => {
  it("allows creating with committees the user belongs to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["backlog", "some-interest-group"])).toBe(true)
  })

  it("denies creating with a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["backlog", "arrkom"])).toBe(false)
  })

  it("allows a co-host to keep existing organizers unchanged", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetEventOrganizers(state, ["backlog", "arrkom"], ["backlog", "arrkom"])).toBe(true)
  })

  it("allows a co-host to add an interest group without belonging to every committee host", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetEventOrganizers(state, ["backlog", "arrkom", "some-interest-group"], ["backlog", "arrkom"])).toBe(true)
  })

  it("denies adding a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetEventOrganizers(state, ["backlog", "arrkom", "bedkom"], ["backlog", "arrkom"])).toBe(false)
  })
})

describe("canManageFeedbackForm", () => {
  it("allows managing when user hosts the event", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageFeedbackForm(state, ["arrkom"])).toBe(true)
  })

  it("denies managing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageFeedbackForm(state, ["arrkom"])).toBe(false)
  })
})

describe("canSubmitFeedbackAnswer", () => {
  it("allows submitting for the same subject", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canSubmitFeedbackAnswer({ ...state, subject: "user-1" }, "user-1")).toBe(true)
  })

  it("denies submitting for a different subject", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canSubmitFeedbackAnswer({ ...state, subject: "user-2" }, "user-1")).toBe(false)
  })
})

describe("canViewOwnFeedbackAnswer", () => {
  it("allows viewing own answer for the same subject", () => {
    const state = createState({})

    expect(canViewOwnFeedbackAnswer({ ...state, subject: "user-1" }, "user-1")).toBe(true)
  })

  it("denies viewing another attendee's answer", () => {
    const state = createState({})

    expect(canViewOwnFeedbackAnswer({ ...state, subject: "user-2" }, "user-1")).toBe(false)
  })
})

describe("canManageNotification", () => {
  it("allows members of the sending group to manage the notification", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, "arrkom")).toBe(true)
  })

  it("denies management for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, "arrkom")).toBe(false)
  })

  it("allows administrators to manage notifications from any group", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, "arrkom")).toBe(true)
  })

  it("allows administrators to manage system notifications", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, null)).toBe(true)
  })

  it("denies system notifications for non-administrators", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, null)).toBe(false)
  })
})

describe("canAccessAuditLog", () => {
  it("is limited to administrators", () => {
    expect(canAccessAuditLog(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canAccessAuditLog(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
  })
})

describe("canCreateWorkspaceUser", () => {
  it("allows the subject when they belong to the contact committee", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canCreateWorkspaceUser({ ...state, subject: "user-1" }, "user-1", "arrkom")).toBe(true)
  })

  it("denies the subject when they do not belong to the contact committee", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canCreateWorkspaceUser({ ...state, subject: "user-1" }, "user-1", "arrkom")).toBe(false)
  })

  it("allows administrators for any user", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateWorkspaceUser({ ...state, subject: "admin-1" }, "user-1", "arrkom")).toBe(true)
  })
})

describe("canFindWorkspaceUser", () => {
  it("requires administrator when a custom key is provided", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canFindWorkspaceUser({ ...state, subject: "user-1" }, "user-1", true)).toBe(false)
    expect(
      canFindWorkspaceUser(
        { ...createState({ dotkom: [GroupRoleTypeEnum.LEADER] }), subject: "admin-1" },
        "user-1",
        true
      )
    ).toBe(true)
  })
})

describe("canSynchronizeWorkspaceGroup", () => {
  it("allows group leaders and administrators", () => {
    expect(canSynchronizeWorkspaceGroup(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }), "arrkom")).toBe(true)
    expect(canSynchronizeWorkspaceGroup(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }), "arrkom")).toBe(false)
    expect(canSynchronizeWorkspaceGroup(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }), "arrkom")).toBe(true)
  })
})

describe("canEditUserProfile", () => {
  it("allows administrators to edit any user", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditUserProfile({ ...state, subject: "admin-1" }, "user-2")).toBe(true)
  })

  it("allows users to edit their own profile", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditUserProfile({ ...state, subject: "user-1" }, "user-1")).toBe(true)
  })

  it("denies editing other users for non-administrators", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditUserProfile({ ...state, subject: "user-2" }, "user-1")).toBe(false)
  })
})

describe("canManageUserMemberships", () => {
  it("is limited to administrators", () => {
    expect(canManageUserMemberships(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canManageUserMemberships(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
  })
})

describe("canEditUserNameAndEmail", () => {
  it("is limited to administrators", () => {
    expect(canEditUserNameAndEmail(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canEditUserNameAndEmail(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
  })
})

describe("canManageOfflines", () => {
  it("allows redaksjonen leaders", () => {
    const state = createState({ redaksjonen: [GroupRoleTypeEnum.LEADER] })

    expect(canManageOfflines(state)).toBe(true)
  })

  it("allows redaksjonen deputy leaders", () => {
    const state = createState({ redaksjonen: [GroupRoleTypeEnum.DEPUTY_LEADER] })

    expect(canManageOfflines(state)).toBe(true)
  })

  it("allows administrators", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageOfflines(state)).toBe(true)
  })

  it("denies unrelated committee members", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageOfflines(state)).toBe(false)
  })
})

describe("canManageFadderuker", () => {
  it("allows velkom members", () => {
    const state = createState({ velkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canManageFadderuker(state)).toBe(true)
  })

  it("allows administrators", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canManageFadderuker(state)).toBe(true)
  })

  it("denies unrelated committee members", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageFadderuker(state)).toBe(false)
  })
})

describe("canManageGroupMembership", () => {
  it("allows leaders to manage committee groups", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageGroupMembership(state, "arrkom", GroupTypeSchema.enum.COMMITTEE)).toBe(true)
  })

  it("denies interest-group leaders from managing their own group", () => {
    const state = createState({ "some-interest-group": [GroupRoleTypeEnum.LEADER] })

    expect(canManageGroupMembership(state, "some-interest-group", GroupTypeSchema.enum.INTEREST_GROUP)).toBe(false)
  })

  it("allows backlog to manage interest groups", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(canManageGroupMembership(state, "some-interest-group", GroupTypeSchema.enum.INTEREST_GROUP)).toBe(true)
  })
})

describe("canCreateGroups", () => {
  it("allows backlog and administrators", () => {
    expect(canCreateGroups(createState({ backlog: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canCreateGroups(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canCreateGroups(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(false)
  })
})

describe("canCreateGroup", () => {
  it("allows backlog to create interest groups only", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(canCreateGroup(state, GroupTypeSchema.enum.INTEREST_GROUP)).toBe(true)
    expect(canCreateGroup(state, GroupTypeSchema.enum.COMMITTEE)).toBe(false)
  })

  it("allows administrators to create any group type", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateGroup(state, GroupTypeSchema.enum.COMMITTEE)).toBe(true)
    expect(canCreateGroup(state, GroupTypeSchema.enum.INTEREST_GROUP)).toBe(true)
  })
})

describe("canUpdateGroup", () => {
  it("denies interest-group members from updating their own group", () => {
    const state = createState({ "some-interest-group": [GroupRoleTypeEnum.LEADER] })

    expect(canUpdateGroup(state, "some-interest-group", GroupTypeSchema.enum.INTEREST_GROUP)).toBe(false)
  })

  it("allows backlog to update interest groups", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(canUpdateGroup(state, "some-interest-group", GroupTypeSchema.enum.INTEREST_GROUP)).toBe(true)
  })

  it("allows committee members to update their own committee", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canUpdateGroup(state, "arrkom", GroupTypeSchema.enum.COMMITTEE)).toBe(true)
  })
})

describe("canSetGroupType", () => {
  it("allows keeping the current type without create permission for that type", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canSetGroupType(state, GroupTypeSchema.enum.COMMITTEE, GroupTypeSchema.enum.COMMITTEE)).toBe(true)
  })

  it("on create, only allows types the caller may create", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(canSetGroupType(state, null, GroupTypeSchema.enum.INTEREST_GROUP)).toBe(true)
    expect(canSetGroupType(state, null, GroupTypeSchema.enum.COMMITTEE)).toBe(false)
  })

  it("denies backlog from changing an interest group into a committee", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(canSetGroupType(state, GroupTypeSchema.enum.INTEREST_GROUP, GroupTypeSchema.enum.COMMITTEE)).toBe(false)
  })

  it("denies committee members from changing a committee into an interest group", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canSetGroupType(state, GroupTypeSchema.enum.COMMITTEE, GroupTypeSchema.enum.INTEREST_GROUP)).toBe(false)
  })

  it("allows administrators to change group type", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canSetGroupType(state, GroupTypeSchema.enum.INTEREST_GROUP, GroupTypeSchema.enum.COMMITTEE)).toBe(true)
  })
})

describe("canCreateEvents", () => {
  it("requires at least one affiliation for non-admins", () => {
    expect(canCreateEvents(createState({}))).toBe(false)
    expect(canCreateEvents(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canCreateEvents(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })
})

describe("canManageCompanies", () => {
  it("allows committee members", () => {
    expect(canManageCompanies(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies callers with no committee affiliations", () => {
    expect(canManageCompanies(createState({}))).toBe(false)
  })
})

describe("canManageJobListings", () => {
  it("allows committee members", () => {
    expect(canManageJobListings(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies callers with no committee affiliations", () => {
    expect(canManageJobListings(createState({}))).toBe(false)
  })
})

describe("canCreateContests", () => {
  it("requires at least one affiliation for non-admins", () => {
    expect(canCreateContests(createState({}))).toBe(false)
    expect(canCreateContests(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canCreateContests(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })
})

describe("canManageContest", () => {
  it("allows editing when user hosts the contest", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, ["arrkom"])).toBe(false)
  })
})

describe("canSetContestOrganizers", () => {
  it("allows creating with committees the user belongs to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, ["backlog", "some-interest-group"])).toBe(true)
  })

  it("denies creating with a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, ["backlog", "arrkom"])).toBe(false)
  })

  it("allows a co-host to keep existing organizers unchanged", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetContestOrganizers(state, ["backlog", "arrkom"], ["backlog", "arrkom"])).toBe(true)
  })

  it("allows a co-host to add an interest group without belonging to every committee host", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetContestOrganizers(state, ["backlog", "arrkom", "some-interest-group"], ["backlog", "arrkom"])).toBe(
      true
    )
  })

  it("denies adding a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetContestOrganizers(state, ["backlog", "arrkom", "bedkom"], ["backlog", "arrkom"])).toBe(false)
  })
})

describe("canCreateMarks", () => {
  it("requires at least one affiliation for non-admins", () => {
    expect(canCreateMarks(createState({}))).toBe(false)
    expect(canCreateMarks(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canCreateMarks(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })
})

describe("canManageMark", () => {
  it("allows managing when user is affiliated with the mark", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["arrkom"])).toBe(true)
  })

  it("denies managing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["arrkom"])).toBe(false)
  })
})

describe("canSetMarkGroups", () => {
  it("allows creating with committees the user belongs to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateMark(state, ["backlog", "some-interest-group"])).toBe(true)
  })

  it("denies creating with a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateMark(state, ["backlog", "arrkom"])).toBe(false)
  })

  it("allows a co-host to keep existing groups unchanged", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetMarkGroups(state, ["backlog", "arrkom"], ["backlog", "arrkom"])).toBe(true)
  })

  it("allows a co-host to add an interest group without belonging to every committee group", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetMarkGroups(state, ["backlog", "arrkom", "some-interest-group"], ["backlog", "arrkom"])).toBe(true)
  })

  it("denies adding a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetMarkGroups(state, ["backlog", "arrkom", "bedkom"], ["backlog", "arrkom"])).toBe(false)
  })
})
