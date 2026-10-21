import { canAccessAuditLog } from "@dotkomonline/rpc/audit-log-permissions"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import { canCreateContest, canCreateContests, canManageContest } from "@dotkomonline/rpc/contest-permissions"
import { canCreateEvent, canCreateEvents, canEditEvent } from "@dotkomonline/rpc/event-permissions"
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
  canUpdateGroup,
} from "@dotkomonline/rpc/group-permissions"
import { canManageJobListings } from "@dotkomonline/rpc/job-listing-permissions"
import { canCreateMark, canCreateMarks, canManageMark } from "@dotkomonline/rpc/mark-permissions"
import { NotificationTypeSchema } from "@dotkomonline/rpc/notification"
import {
  canActAsNotificationGroup,
  canCreateNotification,
  canCreateNotifications,
  canManageNotification,
  canTargetEventAttendees,
  canTargetSpecificUsers,
} from "@dotkomonline/rpc/notification-permissions"
import { canManageOfflines } from "@dotkomonline/rpc/offline-permissions"
import {
  canEditUserNameAndEmail,
  canEditUserProfile,
  canManageUserMemberships,
} from "@dotkomonline/rpc/user-permissions"
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

    expect(canEditEvent(state, ["arrkom"], ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"], ["arrkom"])).toBe(false)
  })

  it("allows editing when the user hosts via a committee even if interest groups are also organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["backlog", "some-interest-group"], ["backlog", "some-interest-group"])).toBe(true)
  })

  it("ignores interest-group-only organizers for edit permission", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["some-interest-group"], ["some-interest-group"])).toBe(false)
  })

  it("allows a co-host to add another committee they are not in", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["backlog", "arrkom"], ["backlog", "arrkom", "bedkom"])).toBe(true)
  })

  it("denies a non-host from editing even if they appear in the next organizers", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"], ["arrkom", "bedkom"])).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, [], [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, [], [])).toBe(true)
  })
})

describe("canCreateEvent", () => {
  it("allows creating when the user belongs to at least one committee organizer", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["backlog", "some-interest-group"])).toBe(true)
    expect(canCreateEvent(state, ["backlog", "arrkom"])).toBe(true)
  })

  it("denies creating when the user belongs to none of the committee organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["arrkom"])).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, [])).toBe(true)
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

    expect(canManageNotification(state, { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE })).toBe(true)
  })

  it("denies management for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE })).toBe(false)
  })

  it("allows administrators to manage notifications from any group", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE })).toBe(true)
  })

  it("allows administrators to manage system notifications", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, null)).toBe(true)
  })

  it("denies system notifications for non-administrators", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, null)).toBe(false)
  })

  it("allows backlog to manage notifications sent as an interest group", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canManageNotification(state, { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP })
    ).toBe(true)
  })
})

describe("canCreateNotifications", () => {
  it("is temporarily limited to administrators", () => {
    expect(canCreateNotifications(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canCreateNotifications(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
  })
})

describe("canCreateNotification", () => {
  it("requires create access and affiliation with the actor group", () => {
    const admin = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })
    const arrkom = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })
    const actorGroup = { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }

    expect(canCreateNotification(admin, actorGroup)).toBe(true)
    expect(canCreateNotification(admin, actorGroup, NotificationTypeSchema.enum.BROADCAST_IMPORTANT)).toBe(true)
    expect(canCreateNotification(arrkom, actorGroup)).toBe(false)
  })
})

describe("canActAsNotificationGroup", () => {
  it("allows committee members to act as their own committee", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canActAsNotificationGroup(state, { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE })).toBe(true)
    expect(canActAsNotificationGroup(state, { slug: "bedkom", type: GroupTypeSchema.enum.COMMITTEE })).toBe(false)
  })

  it("allows backlog to act as interest groups", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canActAsNotificationGroup(state, { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP })
    ).toBe(true)
  })

  it("denies non-backlog committees from acting as interest groups", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(
      canActAsNotificationGroup(state, { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP })
    ).toBe(false)
  })
})

describe("canTargetSpecificUsers", () => {
  it("is limited to administrators", () => {
    expect(canTargetSpecificUsers(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canTargetSpecificUsers(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
  })
})

describe("canTargetEventAttendees", () => {
  it("allows hosts of the event", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(
      canTargetEventAttendees(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "bedkom", type: GroupTypeSchema.enum.COMMITTEE },
      ])
    ).toBe(true)
  })

  it("allows backlog when an interest group hosts the event", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canTargetEventAttendees(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])
    ).toBe(true)
  })

  it("denies unrelated committees", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canTargetEventAttendees(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(false)
  })
})

describe("canAccessAuditLog", () => {
  it("is limited to administrators", () => {
    expect(canAccessAuditLog(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canAccessAuditLog(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
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
  it("is permitted for administrators", () => {
    expect(
      canEditUserNameAndEmail({ ...createState({ dotkom: [GroupRoleTypeEnum.LEADER] }), subject: "admin-1" }, "user-1")
    ).toBe(true)
    expect(
      canEditUserNameAndEmail({ ...createState({ arrkom: [GroupRoleTypeEnum.LEADER] }), subject: "admin-1" }, "user-2")
    ).toBe(false)
  })

  it("is permitted for the same subject", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditUserNameAndEmail({ ...state, subject: "user-1" }, "user-1")).toBe(true)
  })

  it("is denied for other users", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditUserNameAndEmail({ ...state, subject: "user-2" }, "user-1")).toBe(false)
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

  it("allows keeping the current type when the caller can update the group", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canUpdateGroup(state, "arrkom", GroupTypeSchema.enum.COMMITTEE, GroupTypeSchema.enum.COMMITTEE)).toBe(true)
  })

  it("denies backlog from changing an interest group into a committee", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(
      canUpdateGroup(state, "some-interest-group", GroupTypeSchema.enum.INTEREST_GROUP, GroupTypeSchema.enum.COMMITTEE)
    ).toBe(false)
  })

  it("denies committee members from changing a committee into an interest group", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canUpdateGroup(state, "arrkom", GroupTypeSchema.enum.COMMITTEE, GroupTypeSchema.enum.INTEREST_GROUP)).toBe(
      false
    )
  })

  it("allows backlog to change a committee into an interest group", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC], arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canUpdateGroup(state, "arrkom", GroupTypeSchema.enum.COMMITTEE, GroupTypeSchema.enum.INTEREST_GROUP)).toBe(
      true
    )
  })

  it("allows administrators to change group type", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(
      canUpdateGroup(state, "some-interest-group", GroupTypeSchema.enum.INTEREST_GROUP, GroupTypeSchema.enum.COMMITTEE)
    ).toBe(true)
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
  it("allows bedkom and fagkom members", () => {
    expect(canManageCompanies(createState({ bedkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canManageCompanies(createState({ fagkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("allows administrators", () => {
    expect(canManageCompanies(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies unrelated committee members", () => {
    expect(canManageCompanies(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(false)
  })
})

describe("canManageJobListings", () => {
  it("allows bedkom", () => {
    expect(canManageJobListings(createState({ bedkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("allows administrators", () => {
    expect(canManageJobListings(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies unrelated committee members", () => {
    expect(canManageJobListings(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(false)
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

    expect(canManageContest(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(false)
  })

  it("allows a co-host to add another committee they are not in", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canManageContest(
        state,
        [
          { slug: "backlog", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        ],
        [
          { slug: "backlog", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "bedkom", type: GroupTypeSchema.enum.COMMITTEE },
        ]
      )
    ).toBe(true)
  })

  it("denies a non-host from editing even if they appear in the next organizers", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(
      canManageContest(
        state,
        [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }],
        [
          { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "bedkom", type: GroupTypeSchema.enum.COMMITTEE },
        ]
      )
    ).toBe(false)
  })

  it("allows backlog to manage contests with interest-group organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      true
    )
    expect(
      canManageContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(true)
  })

  it("denies non-backlog committees from managing contests with interest-group organizers", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      false
    )
    expect(
      canManageContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [])).toBe(true)
  })
})

describe("canCreateContest", () => {
  it("allows creating when the user belongs to at least one committee organizer", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canCreateContest(state, [
        { slug: "backlog", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
      ])
    ).toBe(true)
  })

  it("denies creating when the user belongs to none of the committee organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(false)
  })

  it("allows backlog to create contests with interest-group organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      true
    )
    expect(
      canCreateContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(true)
  })

  it("denies non-backlog committees from creating contests with interest-group organizers", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      false
    )
    expect(
      canCreateContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [])).toBe(true)
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

  it("allows managing when the user hosts via a committee even if interest groups are also organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["backlog", "some-interest-group"], ["backlog", "some-interest-group"])).toBe(true)
  })

  it("ignores interest-group-only organizers for manage permission", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["some-interest-group"], ["some-interest-group"])).toBe(false)
  })

  it("allows a co-host to keep existing groups unchanged", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["backlog", "arrkom"], ["backlog", "arrkom"])).toBe(true)
  })

  it("allows a co-host to add an interest group without belonging to every committee group", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["backlog", "arrkom"], ["backlog", "arrkom", "some-interest-group"])).toBe(true)
  })

  it("allows a co-host to add another committee they are not in", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["backlog", "arrkom"], ["backlog", "arrkom", "bedkom"])).toBe(true)
  })

  it("denies a non-host from editing even if they appear in the next groups", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageMark(state, ["arrkom"], ["arrkom", "bedkom"])).toBe(false)
  })
})

describe("canCreateMark", () => {
  it("allows creating when the user belongs to at least one committee group", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateMark(state, ["backlog", "some-interest-group"])).toBe(true)
    expect(canCreateMark(state, ["backlog", "arrkom"])).toBe(true)
  })

  it("denies creating when the user belongs to none of the committee groups", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateMark(state, ["arrkom"])).toBe(false)
  })
})
