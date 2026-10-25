import type { DBHandle } from "@dotkomonline/db"
import type { Rule, RuleContext } from "../../authorization"
import { ForbiddenError } from "../../error"
import type { TRPCContext } from "../../trpc"
import { type Attendance, type Attendee, AttendeeSummarySchema, buildAttendanceView } from "./attendance"
import { attendanceRouter } from "./attendance-router"
import type { Event } from "./event"
import { eventRouter } from "./event-router"

const timestamp = new Date("2026-10-01T12:00:00Z")
const attendee: Attendee = {
  id: "attendee-one",
  userId: "user-one",
  attendanceId: "attendance-one",
  attendancePoolId: "pool-one",
  registeredAt: timestamp,
  registrationPoolDelayHours: null,
  registrationMarkDelayHours: null,
  userGrade: 1,
  selections: [],
  registrationEligibleAt: timestamp,
  attendedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  completionDeadline: timestamp,
  paymentLink: "https://example.com/private-payment",
  paymentId: "private-payment-id",
  paymentReservedAt: null,
  paymentChargeDeadline: null,
  paymentChargedAt: null,
  paymentRefundedAt: null,
  paymentCheckoutUrl: null,
  paymentRefundedByUserId: null,
  adminRegisteredByUserId: "committee-user",
  user: {
    id: "user-one",
    username: "user-one",
    name: "Test User",
    email: "private@example.com",
    imageUrl: null,
    biography: null,
    phone: "private-phone",
    gender: "UNKNOWN",
    dietaryRestrictions: "private-dietary-restrictions",
    ntnuUsername: null,
    flags: [],
    workspaceUserId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    privacyPermissionsId: null,
    notificationPermissionsId: null,
    memberships: [],
  },
}
const otherAttendee: Attendee = {
  ...attendee,
  id: "attendee-two",
  userId: "user-two",
  attendedAt: null,
  user: { ...attendee.user, id: "user-two", username: "user-two" },
}
const attendance: Attendance = {
  id: "attendance-one",
  registerStart: timestamp,
  registerEnd: timestamp,
  deregisterDeadline: timestamp,
  selections: [],
  createdAt: timestamp,
  updatedAt: timestamp,
  attendancePrice: 100,
  pools: [],
  attendees: [attendee, otherAttendee],
}
const event: Event = {
  id: "event-one",
  title: "Event",
  start: timestamp,
  end: timestamp,
  status: "PUBLIC",
  visibility: "PUBLIC",
  description: "Event description",
  shortDescription: null,
  imageUrl: null,
  locationTitle: null,
  locationAddress: null,
  locationLink: null,
  type: "SOCIAL",
  markForMissedAttendance: true,
  createdAt: timestamp,
  updatedAt: timestamp,
  attendanceId: attendance.id,
  parentId: "parent-event",
  contestId: null,
  metadataImportId: null,
  companies: [],
  hostingGroups: [],
}

function createContext(currentUserId: string | null, isCommitteeMember = false): TRPCContext {
  let principal: TRPCContext["principal"] = null
  if (currentUserId !== null) {
    principal = { subject: currentUserId, affiliations: new Map(), scopes: new Set() }
    if (isCommitteeMember) {
      principal.affiliations.set("dotkom", new Set())
    }
  }

  const context = {
    principal,
    prisma: {
      $transaction: async (callback: (handle: DBHandle) => Promise<unknown>) => callback({} as DBHandle),
    },
    attendanceService: {
      getAttendanceById: vi.fn().mockResolvedValue(attendance),
      findAttendanceById: vi.fn().mockResolvedValue(attendance),
      getAttendancesByIds: vi.fn().mockResolvedValue([attendance]),
    },
    eventService: {
      getEventById: vi.fn().mockResolvedValue(event),
      findEventById: vi.fn().mockResolvedValue(event),
      findEvents: vi.fn().mockResolvedValue([event]),
      findEventsByAttendingUserId: vi.fn().mockResolvedValue([event]),
      findByParentEventId: vi.fn().mockResolvedValue([event]),
    },
    configuration: { AUTH0_WEB_CLIENT_ID: "web" },
    authorizationService: {
      isCommitteeMember: () => isCommitteeMember,
      getGroupAffiliations: vi.fn().mockResolvedValue(new Map()),
    },
    addAuthorizationGuard: async (rule: Rule<unknown>, input: unknown) => {
      const ruleContext: RuleContext<unknown> = {
        ctx: context,
        principal,
        input,
        evaluate: async (childRule, childContext) => childRule.evaluate(childContext),
      }
      if (!(await rule.evaluate(ruleContext))) {
        throw new ForbiddenError("Not authorized")
      }
    },
  } as unknown as TRPCContext
  return context
}

describe("public attendance responses", () => {
  it.each([
    [null, false],
    ["other-user", false],
    ["user-one", false],
    ["user-two", false],
    ["committee-user", true],
  ] as const)("returns full details only for the authenticated owner %s", async (currentUserId, isCommitteeMember) => {
    const context = createContext(currentUserId, isCommitteeMember)
    const eventCaller = eventRouter.createCaller(context)
    const responses = await Promise.all([
      attendanceRouter.createCaller(context).getAttendance({ id: attendance.id }),
      eventCaller.get(event.id).then((result) => result.attendance),
      eventCaller.find(event.id).then((result) => result?.attendance),
      eventCaller.findParentEvent({ eventId: event.id }).then((result) => result?.attendance),
      eventCaller.findChildEvents({ eventId: event.id }).then((result) => result[0]?.attendance),
      eventCaller.all({}).then((result) => result.items[0]?.attendance),
    ])

    if (currentUserId !== null) {
      const result = await eventCaller.allByAttendingUserId({ id: "user-two" })
      responses.push(result.items[0]?.attendance)
    }

    for (const response of responses) {
      expect(response?.attendees).toEqual(
        attendance.attendees.map((candidate) => {
          if (candidate.userId === currentUserId) {
            return candidate
          }
          return AttendeeSummarySchema.parse(candidate)
        })
      )
      for (const returnedAttendee of response?.attendees ?? []) {
        if (returnedAttendee.userId === currentUserId) {
          continue
        }
        expect(Object.keys(returnedAttendee).toSorted()).toEqual(
          [
            "id",
            "userId",
            "attendanceId",
            "attendancePoolId",
            "registeredAt",
            "registrationPoolDelayHours",
            "registrationMarkDelayHours",
            "userGrade",
            "registrationEligibleAt",
            "user",
          ].toSorted()
        )
        expect(Object.keys(returnedAttendee.user).toSorted()).toEqual(
          ["id", "name", "username", "imageUrl", "flags", "memberships"].toSorted()
        )
      }
      expect(response?.attendedAttendeeCount).toBe(1)
    }
  })

  it.each([
    { description: "an empty list", attendees: [], expectedCount: 0 },
    { description: "one checked-in attendee", attendees: [attendee], expectedCount: 1 },
    { description: "no checked-in attendees", attendees: [otherAttendee], expectedCount: 0 },
    {
      description: "all attendees checked in",
      attendees: [attendee, { ...otherAttendee, attendedAt: timestamp }],
      expectedCount: 2,
    },
  ])("counts attendance for $description", ({ attendees, expectedCount }) => {
    const response = buildAttendanceView({ ...attendance, attendees }, null)
    expect(response.attendedAttendeeCount).toBe(expectedCount)
  })

  it("returns only summaries on public routes even for committee members", async () => {
    const context = createContext("committee-user", true)
    const response = await attendanceRouter.createCaller(context).getAttendance({ id: attendance.id })
    expect(response.attendees).toEqual(attendance.attendees.map((candidate) => AttendeeSummarySchema.parse(candidate)))
  })

  it("does not mutate the source attendance while building a view", () => {
    buildAttendanceView(attendance, null)
    expect(attendance.attendees[0]).toBe(attendee)
    expect(attendee.user.email).toBe("private@example.com")
    expect(attendance).not.toHaveProperty("attendedAttendeeCount")
  })

  it("limits calendar service responses to the delegated user's full details", async () => {
    const context = createContext("web@clients")
    context.principal?.scopes.add("read:calendar_feed")
    const response = await eventRouter
      .createCaller(context)
      .allByAttendingUserIdForCalendar({ id: otherAttendee.userId })
    expect(response.items[0]?.attendance?.attendees).toEqual([AttendeeSummarySchema.parse(attendee), otherAttendee])
  })

  it.each([
    [null, false, "UNAUTHORIZED"],
    ["user-one", true, "FORBIDDEN"],
    ["web@clients", false, "FORBIDDEN"],
    ["other-service@clients", true, "FORBIDDEN"],
  ] as const)("rejects calendar reads by %s (scope: %s)", async (currentUserId, hasCalendarScope, expectedCode) => {
    const context = createContext(currentUserId)
    if (hasCalendarScope) {
      context.principal?.scopes.add("read:calendar_feed")
    }
    await expect(
      eventRouter.createCaller(context).allByAttendingUserIdForCalendar({ id: otherAttendee.userId })
    ).rejects.toMatchObject({ code: expectedCode })
    expect(context.authorizationService.getGroupAffiliations).not.toHaveBeenCalled()
    expect(context.attendanceService.getAttendancesByIds).not.toHaveBeenCalled()
  })
})

describe("administrative attendance responses", () => {
  it.each([
    [null, "UNAUTHORIZED"],
    ["other-user", "FORBIDDEN"],
  ] as const)("rejects full detail requests by %s", async (currentUserId, expectedCode) => {
    const context = createContext(currentUserId)
    await expect(
      attendanceRouter.createCaller(context).getAttendanceForAdmin({ id: attendance.id })
    ).rejects.toMatchObject({ code: expectedCode })
    await expect(eventRouter.createCaller(context).getForAdmin(event.id)).rejects.toMatchObject({ code: expectedCode })
    expect(context.attendanceService.getAttendanceById).not.toHaveBeenCalled()
    expect(context.attendanceService.findAttendanceById).not.toHaveBeenCalled()
  })

  it("preserves full details for authorized administrative requests", async () => {
    const context = createContext("committee-user", true)
    await expect(attendanceRouter.createCaller(context).getAttendanceForAdmin({ id: attendance.id })).resolves.toEqual(
      attendance
    )
    await expect(eventRouter.createCaller(context).getForAdmin(event.id)).resolves.toEqual({ event, attendance })
  })
})
