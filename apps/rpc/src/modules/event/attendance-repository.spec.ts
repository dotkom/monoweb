import type { DBHandle, Prisma } from "@dotkomonline/db"
import { TZDate } from "@date-fns/tz"
import { EventEmitter } from "node:events"
import { describe, expect, it, vi } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import type { TRPCContext } from "../../trpc"
import { type Attendance, type AttendancePool, AttendeePaymentWriteSchema } from "./attendance"
import { getAttendanceRepository } from "./attendance-repository"
import { attendanceRouter } from "./attendance-router"
import { type RegistrationAvailabilitySuccess, getAttendanceService } from "./attendance-service"
import type { Event } from "./event"

const timestamp = new Date("2026-10-25T12:00:00Z")
const databaseAttendee = {
  id: "attendee-one",
  userId: "user-one",
  attendanceId: "attendance-one",
  attendancePoolId: "pool-one",
  registeredAt: timestamp,
  registrationPoolDelayHours: null,
  registrationMarkDelayHours: null,
  userGrade: 1,
  selections: [],
  attendedAt: null,
  createdAt: timestamp,
  updatedAt: timestamp,
  completionDeadline: null,
  paymentLink: null,
  paymentId: null,
  paymentReservedAt: null,
  paymentChargeDeadline: null,
  paymentChargedAt: null,
  paymentRefundedAt: null,
  paymentCheckoutUrl: null,
  paymentRefundedByUserId: null,
  adminRegisteredByUserId: null,
  user: {
    id: "user-one",
    username: "user-one",
    name: "Test User",
    email: null,
    imageUrl: null,
    biography: null,
    phone: null,
    gender: "UNKNOWN",
    dietaryRestrictions: null,
    ntnuUsername: null,
    workspaceUserId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    privacyPermissionsId: null,
    notificationPermissionsId: null,
    memberships: [],
    userFlagLinks: [],
  },
} satisfies Prisma.AttendeeGetPayload<{
  include: { user: { include: { memberships: true; userFlagLinks: true } } }
}>

describe("attendee refund attribution", () => {
  it.each([null, "refunding-user"])("reads Prisma rows with refunding user %s", async (refundingUserId) => {
    const databaseHandle = {
      attendee: {
        findUnique: vi.fn().mockResolvedValue({ ...databaseAttendee, paymentRefundedByUserId: refundingUserId }),
      },
    } as unknown as DBHandle

    const attendee = await getAttendanceRepository().findAttendeeById(databaseHandle, databaseAttendee.id)

    expect(attendee?.paymentRefundedByUserId).toBe(refundingUserId)
  })

  it("writes refund attribution using the Prisma field name", async () => {
    const refundedAttendee = { ...databaseAttendee, paymentRefundedByUserId: "refunding-user" }
    const updateAttendee = vi.fn().mockResolvedValue(refundedAttendee)
    const databaseHandle = {
      attendee: { update: updateAttendee },
    } as unknown as DBHandle

    const attendee = await getAttendanceRepository().updateAttendeePaymentById(
      databaseHandle,
      databaseAttendee.id,
      AttendeePaymentWriteSchema.parse(refundedAttendee)
    )

    expect(updateAttendee).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentRefundedByUserId: "refunding-user" }),
      })
    )
    expect(attendee.paymentRefundedByUserId).toBe("refunding-user")
  })
})

function createRegistrationContext(currentUserId: string) {
  const databaseHandle = mockDeep<DBHandle>()
  databaseHandle.auditTransaction.create.mockResolvedValue(mock({ id: "audit-transaction" }))
  databaseHandle.attendee.create.mockImplementation(async ({ data }) => ({
    ...databaseAttendee,
    adminRegisteredByUserId: data.adminRegisteredBy?.connect?.id ?? null,
  }))

  const pool = mock<AttendancePool>({ id: databaseAttendee.attendancePoolId, capacity: 0 })
  const attendance = mock<Attendance>({
    id: databaseAttendee.attendanceId,
    attendancePrice: null,
    attendees: [],
    pools: [pool],
  })
  const availability: RegistrationAvailabilitySuccess = {
    success: true,
    reservationActiveAt: new TZDate(timestamp),
    registrationPoolDelayHours: null,
    registrationMarkDelayHours: null,
    event: mock<Event>({ id: "event-one", title: "Test Event", hostingGroups: [] }),
    attendance,
    pool,
    user: { ...databaseAttendee.user, flags: [] },
    membership: null,
    bypassedChecks: [],
    options: {
      ignoreRegistrationWindow: false,
      ignoreRegisteredToParent: false,
      immediateReservation: false,
      immediatePayment: false,
      overriddenAttendancePoolId: null,
      overrideTurnstileCheck: true,
    },
  }
  const attendanceService = getAttendanceService(
    new EventEmitter(),
    getAttendanceRepository(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock(),
    mock()
  )
  vi.spyOn(attendanceService, "getRegistrationAvailability").mockResolvedValue(availability)

  const context = {
    principal: { subject: currentUserId, affiliations: new Map(), scopes: new Set() },
    prisma: {
      $transaction: async (callback: (handle: DBHandle) => Promise<unknown>) => callback(databaseHandle),
    },
    attendanceService,
    addAuthorizationGuard: vi.fn(),
  } as unknown as TRPCContext

  return { caller: attendanceRouter.createCaller(context), databaseHandle }
}

describe("attendee admin registration attribution", () => {
  it("persists the authenticated admin through the router, service, and repository", async () => {
    const { caller, databaseHandle } = createRegistrationContext("committee-user")

    const attendee = await caller.adminRegisterForEvent({
      attendanceId: databaseAttendee.attendanceId,
      attendancePoolId: databaseAttendee.attendancePoolId,
      userId: databaseAttendee.userId,
    })

    expect(databaseHandle.attendee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ adminRegisteredBy: { connect: { id: "committee-user" } } }),
      })
    )
    expect(attendee.adminRegisteredByUserId).toBe("committee-user")
    expect(attendee.userId).toBe(databaseAttendee.userId)
  })

  it("leaves admin attribution null for self-service registration", async () => {
    const { caller, databaseHandle } = createRegistrationContext(databaseAttendee.userId)

    const attendee = await caller.registerForEvent({
      attendanceId: databaseAttendee.attendanceId,
      turnstileToken: "turnstile-token",
    })

    expect(databaseHandle.attendee.create.mock.calls[0]?.[0].data.adminRegisteredBy).toBeUndefined()
    expect(attendee.adminRegisteredByUserId).toBeNull()
  })
})
