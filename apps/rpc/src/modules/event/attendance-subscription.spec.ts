import { EventEmitter } from "node:events"
import type { TRPCContext } from "../../trpc"
import { AttendeeSummarySchema, type Attendee, type RegisterChangeEvent } from "./attendance"
import { attendanceRouter } from "./attendance-router"

const attendee: Attendee = {
  id: "attendee-one",
  userId: "user-one",
  attendanceId: "attendance-one",
  attendancePoolId: "pool-one",
  registered: true,
  userGrade: 1,
  selections: [],
  earliestReservationAt: new Date(),
  attendedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  completionDeadline: new Date(),
  paymentLink: "https://example.com/private-payment",
  paymentId: "private-payment-id",
  paymentReservedAt: null,
  paymentChargeDeadline: null,
  paymentChargedAt: null,
  paymentRefundedAt: null,
  paymentCheckoutUrl: null,
  paymentRefundedById: null,
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
    createdAt: new Date(),
    updatedAt: new Date(),
    privacyPermissionsId: null,
    notificationPermissionsId: null,
    memberships: [],
  },
}

const registerChange: RegisterChangeEvent = {
  attendee,
  status: "registered",
  poolOccupancies: [
    { poolId: "pool-one", registeredCount: 3, capacity: 10, isPoolFull: false },
    { poolId: "pool-two", registeredCount: 2, capacity: 10, isPoolFull: false },
  ],
}

function createContext(currentUserId: string | null = null, isCommitteeMember = false) {
  const eventEmitter = new EventEmitter()
  const findEventSummaries = vi.fn().mockResolvedValue([
    { id: "event-one", attendanceId: "attendance-one" },
    { id: "event-two", attendanceId: "attendance-two" },
  ])
  let principal: TRPCContext["principal"] = null

  if (currentUserId !== null) {
    principal = { subject: currentUserId, affiliations: new Map(), scopes: new Set() }
  }

  const prisma = {
    async $transaction(callback: (handle: object) => Promise<unknown>) {
      return await callback({})
    },
  }

  const context = {
    principal,
    prisma,
    eventEmitter,
    eventService: { findEventSummaries },
    authorizationService: { isCommitteeMember: () => isCommitteeMember },
  } as unknown as TRPCContext

  return { context, eventEmitter, findEventSummaries }
}

describe("bulk registration subscription", () => {
  it.each([null, "other-user", attendee.userId])("delivers payment updates to viewer %s", async (currentUserId) => {
    const { context, eventEmitter } = createContext(currentUserId)
    const caller = attendanceRouter.createCaller(context)

    const subscription = await caller.onBulkRegisterChange({ eventIds: ["event-one"] })

    const updatedAttendee = {
      ...attendee,
      paymentReservedAt: new Date(),
      completionDeadline: null,
    }

    const paymentUpdate: RegisterChangeEvent = {
      ...registerChange,
      status: "updated",
      attendee: updatedAttendee,
    }

    const nextUpdate = subscription.next()

    eventEmitter.emit("attendance:register-change", paymentUpdate)

    const { value: update } = await nextUpdate

    expect(update?.status).toBe("updated")
    expect(update?.registeredAttendeeCount).toBe(5)

    if (update?.isCurrentUser) {
      expect(update.attendee).toEqual(paymentUpdate.attendee)
    } else {
      expect(update?.attendee).not.toHaveProperty("paymentReservedAt")
      expect(update?.attendee).not.toHaveProperty("completionDeadline")
    }

    await subscription.return()
  })

  it.each([null, "other-user"])("strips private attendee fields for viewer %s", async (currentUserId) => {
    const { context, eventEmitter } = createContext(currentUserId)
    const subscription = await attendanceRouter.createCaller(context).onBulkRegisterChange({
      eventIds: ["event-one", "event-two"],
    })
    const nextUpdate = subscription.next()
    eventEmitter.emit("attendance:register-change", registerChange)

    expect((await nextUpdate).value).toEqual({
      isCurrentUser: false,
      attendee: {
        id: attendee.id,
        userId: attendee.userId,
        attendanceId: attendee.attendanceId,
        attendancePoolId: attendee.attendancePoolId,
        registered: true,
        userGrade: attendee.userGrade,
        earliestReservationAt: attendee.earliestReservationAt,
        user: {
          id: attendee.user.id,
          name: attendee.user.name,
          username: attendee.user.username,
          imageUrl: attendee.user.imageUrl,
          flags: attendee.user.flags,
          memberships: attendee.user.memberships,
        },
      },
      status: "registered",
      poolOccupancies: registerChange.poolOccupancies,
      registeredAttendeeCount: 5,
    })

    await subscription.return()
    expect(eventEmitter.listenerCount("attendance:register-change")).toBe(0)
  })

  it("returns the full attendee only to its authenticated owner", async () => {
    const { context, eventEmitter } = createContext(attendee.userId)
    const subscription = await attendanceRouter.createCaller(context).onBulkRegisterChange({ eventIds: ["event-one"] })
    const nextUpdate = subscription.next()
    eventEmitter.emit("attendance:register-change", registerChange)

    expect((await nextUpdate).value).toEqual({ ...registerChange, isCurrentUser: true, registeredAttendeeCount: 5 })

    await subscription.return()
  })

  it("strips private fields from the public attendee and nested user", () => {
    const summary = AttendeeSummarySchema.parse({
      ...attendee,
      user: {
        ...attendee.user,
        flags: [
          {
            id: "flag-one",
            name: "EXCEPTIONALLY_DISTINGUISHED",
            description: "Badge description",
            imageUrl: "https://example.com/badge.png",
            awardedAt: new Date("2025-01-01"),
            awardedReason: "Award reason",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        memberships: [
          {
            id: "membership-one",
            type: "KNIGHT",
            userId: attendee.userId,
            start: new Date(),
            end: null,
            specialization: null,
            semester: null,
          },
        ],
      },
    })
    expect(summary).not.toHaveProperty("paymentLink")
    expect(summary).not.toHaveProperty("paymentId")
    expect(summary).not.toHaveProperty("completionDeadline")
    expect(summary).not.toHaveProperty("selections")
    expect(summary.user).not.toHaveProperty("email")
    expect(summary.user).not.toHaveProperty("phone")
    expect(summary.user).not.toHaveProperty("dietaryRestrictions")
    expect(summary.user.flags).toEqual([
      {
        name: "EXCEPTIONALLY_DISTINGUISHED",
        description: "Badge description",
        imageUrl: "https://example.com/badge.png",
        awardedAt: new Date("2025-01-01"),
        awardedReason: "Award reason",
      },
    ])
    expect(summary.user.memberships).toEqual([{ type: "KNIGHT" }])
  })

  it.each([
    [null, false, ["AUTHENTICATED", "COMMITTEE_ONLY"]],
    ["user-one", false, ["COMMITTEE_ONLY"]],
    ["user-one", true, []],
  ] as const)("checks visibility once and filters updates for viewer %s (committee: %s)", async (currentUserId, isCommitteeMember, excludedVisibilities) => {
    const { context, eventEmitter, findEventSummaries } = createContext(currentUserId, isCommitteeMember)
    const subscription = await attendanceRouter.createCaller(context).onBulkRegisterChange({
      eventIds: ["event-one", "event-two", "event-one"],
    })
    const nextUpdate = subscription.next()
    eventEmitter.emit("attendance:register-change", {
      ...registerChange,
      attendee: { ...attendee, attendanceId: "unsubscribed-attendance" },
    })
    eventEmitter.emit("attendance:register-change", {
      ...registerChange,
      attendee: { ...attendee, attendanceId: "attendance-two" },
    })

    expect((await nextUpdate).value?.attendee.attendanceId).toBe("attendance-two")
    expect(findEventSummaries).toHaveBeenCalledExactlyOnceWith(
      context.prisma,
      { byId: ["event-one", "event-two"], excludingVisibility: excludedVisibilities },
      { take: 2 }
    )

    await subscription.return()
    expect(eventEmitter.listenerCount("attendance:register-change")).toBe(0)
  })

  it("removes the listener if the visibility lookup fails", async () => {
    const { context, eventEmitter, findEventSummaries } = createContext()
    findEventSummaries.mockRejectedValue(new Error("Lookup failed"))
    const subscription = await attendanceRouter.createCaller(context).onBulkRegisterChange({ eventIds: ["event-one"] })

    await expect(subscription.next()).rejects.toThrow("Lookup failed")
    expect(eventEmitter.listenerCount("attendance:register-change")).toBe(0)
  })

  it("removes the listener when the request is aborted", async () => {
    const { context, eventEmitter } = createContext()
    const abortController = new AbortController()
    const subscription = await attendanceRouter
      .createCaller(context, { signal: abortController.signal })
      .onBulkRegisterChange({ eventIds: ["event-one"] })
    const nextUpdate = subscription.next()
    abortController.abort()

    await expect(nextUpdate).rejects.toThrow()
    expect(eventEmitter.listenerCount("attendance:register-change")).toBe(0)
  })
})

describe("single attendance subscription", () => {
  it("delivers the final payment and completion deadline update", async () => {
    const { context, eventEmitter } = createContext(attendee.userId)
    const caller = attendanceRouter.createCaller(context)

    const subscription = await caller.onRegisterChange({ attendanceId: attendee.attendanceId })

    const updatedAttendee = {
      ...attendee,
      paymentChargedAt: new Date(),
      completionDeadline: null,
    }

    const paymentUpdate: RegisterChangeEvent = {
      ...registerChange,
      status: "updated",
      attendee: updatedAttendee,
    }

    const nextUpdate = subscription.next()

    eventEmitter.emit("attendance:register-change", paymentUpdate)

    const { value: update } = await nextUpdate

    expect(update).toEqual(paymentUpdate)

    await subscription.return()

    expect(eventEmitter.listenerCount("attendance:register-change")).toBe(0)
  })
})
