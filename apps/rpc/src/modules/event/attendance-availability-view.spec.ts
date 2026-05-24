import { TZDate } from "@date-fns/tz"
import type { Attendance, Attendee, Punishment } from "@dotkomonline/types"
import { buildPoolOccupancies } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addDays, addHours, subHours } from "date-fns"
import { describe, expect, it } from "vitest"
import {
  type RegistrationAvailabilityResult,
  type RegistrationAvailabilitySuccess,
  buildDeregistrationAvailabilityView,
  buildRegistrationAvailabilityView,
} from "./attendance-service"

const userId = "00000000-0000-4000-8000-000000000001"

const createAttendance = (overrides: Partial<Attendance> = {}): Attendance =>
  ({
    id: "00000000-0000-4000-8000-000000000010",
    registerStart: subHours(getCurrentUTC(), 1),
    registerEnd: addHours(getCurrentUTC(), 12),
    deregisterDeadline: addDays(getCurrentUTC(), 2),
    attendancePrice: 100,
    pools: [
      {
        id: "00000000-0000-4000-8000-000000000020",
        title: "Pool",
        capacity: 2,
        mergeDelayHours: null,
        yearCriteria: [1],
        attendanceId: "00000000-0000-4000-8000-000000000010",
        taskId: null,
        createdAt: getCurrentUTC(),
        updatedAt: getCurrentUTC(),
      },
    ],
    attendees: [],
    selections: [],
    createdAt: getCurrentUTC(),
    updatedAt: getCurrentUTC(),
    ...overrides,
  }) as Attendance

const createAttendee = (overrides: Partial<Attendee> = {}): Attendee =>
  ({
    id: "00000000-0000-4000-8000-000000000030",
    userId,
    attendanceId: "00000000-0000-4000-8000-000000000010",
    attendancePoolId: "00000000-0000-4000-8000-000000000020",
    createdAt: getCurrentUTC(),
    updatedAt: getCurrentUTC(),
    reserved: true,
    attendedAt: null,
    earliestReservationAt: getCurrentUTC(),
    paymentChargedAt: null,
    paymentRefundedAt: null,
    paymentDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentChargeDeadline: null,
    paymentReservedAt: null,
    paymentRefundedById: null,
    paymentCheckoutUrl: null,
    userGrade: 1,
    selections: [],
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      imageUrl: null,
      createdAt: getCurrentUTC(),
      updatedAt: getCurrentUTC(),
      memberships: [],
      auth0Id: "auth0|test",
      phoneNumber: null,
      allergies: [],
      dietaryPreferences: [],
    },
    ...overrides,
  }) as Attendee

const createSuccessResult = (
  attendance: Attendance,
  reservationActiveAt: Date = getCurrentUTC()
): RegistrationAvailabilitySuccess => ({
  success: true,
  reservationActiveAt: new TZDate(reservationActiveAt),
  event: {} as never,
  attendance,
  user: createAttendee().user,
  membership: {} as never,
  pool: attendance.pools[0],
  bypassedChecks: [],
  options: {
    ignoreRegistrationWindow: false,
    ignoreRegisteredToParent: false,
    immediateReservation: false,
    immediatePayment: true,
    overriddenAttendancePoolId: null,
    overrideTurnstileCheck: true,
  },
})

describe("buildRegistrationAvailabilityView", () => {
  it("returns rejection cause when registration is not allowed", () => {
    const attendance = createAttendance()
    const punishment: Punishment = { suspended: true, delay: 0 }
    const result: RegistrationAvailabilityResult = { success: false, cause: "SUSPENDED" }

    const view = buildRegistrationAvailabilityView(userId, result, punishment, attendance)

    expect(view).toEqual({
      userId,
      punishment,
      pool: null,
      registration: {
        canRegister: false,
        rejectionCause: "SUSPENDED",
        reservationActiveAt: null,
        willBeUnreserved: false,
        hasMergeDelay: false,
      },
      deregistration: null,
    })
  })

  it("returns unreserved state when registration succeeds with delay", () => {
    const reservationActiveAt = addHours(getCurrentUTC(), 2)
    const attendance = createAttendance()
    const punishment: Punishment = { suspended: false, delay: 2 }
    const result = createSuccessResult(attendance, reservationActiveAt)

    const view = buildRegistrationAvailabilityView(userId, result, punishment, attendance)

    expect(view.registration?.canRegister).toBe(true)
    expect(view.registration?.rejectionCause).toBeNull()
    expect(view.registration?.willBeUnreserved).toBe(true)
    expect(view.punishment).toEqual(punishment)
    expect(view.pool).toEqual({
      id: attendance.pools[0].id,
      mergeDelayHours: null,
      isPoolFull: false,
    })
  })

  it("marks pool as full when reserved count reaches capacity", () => {
    const attendance = createAttendance({
      attendees: [
        createAttendee({ id: "00000000-0000-4000-8000-000000000031", reserved: true }),
        createAttendee({ id: "00000000-0000-4000-8000-000000000032", reserved: true }),
      ],
    })
    const result = createSuccessResult(attendance)

    const view = buildRegistrationAvailabilityView(userId, result, null, attendance)

    expect(view.pool?.isPoolFull).toBe(true)
    expect(view.registration?.willBeUnreserved).toBe(true)
  })
})

describe("buildDeregistrationAvailabilityView", () => {
  it("allows deregistration within grace period", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ createdAt: getCurrentUTC() })

    const view = buildDeregistrationAvailabilityView(userId, attendee, attendance, null)

    expect(view.deregistration).toEqual(
      expect.objectContaining({
        canDeregister: true,
        rejectionCause: null,
        isWithinGracePeriod: true,
        requiresDeregisterReason: false,
        hasBeenCharged: false,
        chargeScheduleDate: null,
      })
    )
  })

  it("requires deregister reason after grace period", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ createdAt: subHours(getCurrentUTC(), 3) })

    const view = buildDeregistrationAvailabilityView(userId, attendee, attendance, null)

    expect(view.deregistration?.isWithinGracePeriod).toBe(false)
    expect(view.deregistration?.requiresDeregisterReason).toBe(true)
    expect(view.deregistration?.canDeregister).toBe(true)
  })

  it("blocks deregistration when payment has been charged", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      paymentChargedAt: getCurrentUTC(),
      paymentRefundedAt: null,
    })

    const view = buildDeregistrationAvailabilityView(userId, attendee, attendance, null)

    expect(view.deregistration?.canDeregister).toBe(false)
    expect(view.deregistration?.rejectionCause).toBe("PAYMENT_COMPLETED")
    expect(view.deregistration?.hasBeenCharged).toBe(true)
  })

  it("blocks deregistration after deadline for reserved attendees", () => {
    const attendance = createAttendance({
      deregisterDeadline: subHours(getCurrentUTC(), 1),
    })
    const attendee = createAttendee({
      createdAt: subHours(getCurrentUTC(), 3),
      reserved: true,
    })

    const view = buildDeregistrationAvailabilityView(userId, attendee, attendance, null)

    expect(view.deregistration?.canDeregister).toBe(false)
    expect(view.deregistration?.rejectionCause).toBe("DEREGISTER_DEADLINE_PASSED")
    expect(view.deregistration?.isPastDeregisterDeadline).toBe(true)
  })

  it("uses the earlier charge schedule date as deregister deadline", () => {
    const deregisterDeadline = addDays(getCurrentUTC(), 2)
    const chargeScheduleDate = addHours(getCurrentUTC(), 6)
    const attendance = createAttendance({ deregisterDeadline })
    const attendee = createAttendee({ createdAt: subHours(getCurrentUTC(), 3) })

    const view = buildDeregistrationAvailabilityView(userId, attendee, attendance, chargeScheduleDate)

    expect(view.deregistration?.actualDeregisterDeadline).toEqual(chargeScheduleDate)
    expect(view.deregistration?.chargeScheduleDate).toEqual(chargeScheduleDate)
  })
})

describe("buildPoolOccupancies", () => {
  it("marks a pool as full when reserved count reaches capacity", () => {
    const attendance = createAttendance({
      attendees: [
        createAttendee({ id: "00000000-0000-4000-8000-000000000031", reserved: true }),
        createAttendee({ id: "00000000-0000-4000-8000-000000000032", reserved: true }),
      ],
    })

    const poolOccupancies = buildPoolOccupancies(attendance)

    expect(poolOccupancies).toEqual([
      {
        poolId: attendance.pools[0].id,
        reservedCount: 2,
        capacity: 2,
        isPoolFull: true,
      },
    ])
  })

  it("ignores unreserved attendees when computing pool fullness", () => {
    const attendance = createAttendance({
      attendees: [
        createAttendee({ id: "00000000-0000-4000-8000-000000000031", reserved: true }),
        createAttendee({ id: "00000000-0000-4000-8000-000000000032", reserved: false }),
      ],
    })

    const poolOccupancies = buildPoolOccupancies(attendance)

    expect(poolOccupancies[0]?.isPoolFull).toBe(false)
    expect(poolOccupancies[0]?.reservedCount).toBe(1)
  })
})
