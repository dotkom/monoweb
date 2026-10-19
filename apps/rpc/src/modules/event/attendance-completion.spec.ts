import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, subMinutes } from "date-fns"
import { describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { DEFAULT_MARK_DURATION, type Mark } from "../mark/mark"
import type { Payment } from "../payment/payment-service"
import {
  type Attendance,
  type Attendee,
  buildRegistrationAvailabilityCompletionView,
  getAttendeeState,
  getMissingAttendanceCompletionRequirements,
} from "./attendance"
import { getAttendanceService } from "./attendance-service"
import type { Event } from "./event"

const userId = "00000000-0000-4000-8000-000000000001"

const createAttendance = (overrides: Partial<Attendance> = {}): Attendance =>
  ({
    id: "00000000-0000-4000-8000-000000000010",
    registerStart: subMinutes(getCurrentUTC(), 60),
    registerEnd: addHours(getCurrentUTC(), 12),
    deregisterDeadline: addHours(getCurrentUTC(), 48),
    attendancePrice: 100,
    pools: [],
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
    registered: true,
    attendedAt: null,
    earliestReservationAt: getCurrentUTC(),
    paymentChargedAt: null,
    paymentRefundedAt: null,
    completionDeadline: null,
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

describe("attendance completion helpers", () => {
  it("returns QUEUED for waitlisted attendees", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registered: false })

    expect(getAttendeeState(attendee, attendance)).toBe("QUEUED")
  })

  it("returns RESERVED when payment is still missing", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      completionDeadline: addMinutes(getCurrentUTC(), 45),
      paymentLink: "https://example.com/pay",
    })

    expect(getAttendeeState(attendee, attendance)).toBe("RESERVED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual(["PAYMENT"])
  })

  it("returns REGISTERED when payment is complete", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      paymentReservedAt: getCurrentUTC(),
    })

    expect(getAttendeeState(attendee, attendance)).toBe("REGISTERED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
  })

  it("builds completion view with pending payment requirement", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      completionDeadline: addHours(getCurrentUTC(), 1),
      paymentLink: "https://example.com/pay",
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: attendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: ["PAYMENT"],
      paymentLink: "https://example.com/pay",
    })
  })

  it("ignores leftover payment details while the attendee is queued", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      registered: false,
      completionDeadline: addHours(getCurrentUTC(), 24),
      paymentLink: "https://example.com/pay",
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "QUEUED",
      completionDeadline: null,
      requirements: [],
      missingRequirements: [],
      paymentLink: null,
    })
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
  })

  it("requires payment after a queued attendee receives a place", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registered: false })

    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])

    const promotedAttendee = {
      ...attendee,
      registered: true,
      completionDeadline: addHours(getCurrentUTC(), 24),
      paymentLink: "https://example.com/pay",
    }

    expect(buildRegistrationAvailabilityCompletionView(attendance, promotedAttendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: promotedAttendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: ["PAYMENT"],
      paymentLink: promotedAttendee.paymentLink,
    })
  })

  it("returns null completion view when attendee is absent", () => {
    const attendance = createAttendance()

    expect(buildRegistrationAvailabilityCompletionView(attendance, null)).toBeNull()
  })
})

function createPaymentVerificationContext(deregisterDeadline: Date, paymentStatus: "UNPAID" | "PAID") {
  const handle = mock<DBHandle>()
  const attendanceRepository = mock<Parameters<typeof getAttendanceService>[1]>()
  const taskSchedulingService = mock<Parameters<typeof getAttendanceService>[2]>()
  const markService = mock<Parameters<typeof getAttendanceService>[4]>()
  const personalMarkService = mock<Parameters<typeof getAttendanceService>[5]>()
  const paymentService = mock<Parameters<typeof getAttendanceService>[6]>()
  const eventService = mock<Parameters<typeof getAttendanceService>[8]>()
  const attendee = createAttendee({ paymentId: "payment", completionDeadline: subMinutes(getCurrentUTC(), 1) })
  const attendance = createAttendance({ attendees: [attendee], deregisterDeadline })
  const event = mock<Event>({ id: "test-event", title: "Test event", hostingGroups: [] })

  attendanceRepository.findAttendanceByAttendeeId.mockResolvedValue(attendance)
  taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(null)
  eventService.getByAttendanceId.mockResolvedValue(event)
  paymentService.getById.mockResolvedValue(mock<Payment>({ status: paymentStatus }))
  markService.create
    .mockResolvedValueOnce(mock<Mark>({ id: "suspension" }))
    .mockResolvedValueOnce(mock<Mark>({ id: "missing-payment-mark" }))

  const attendanceService = getAttendanceService(
    new EventEmitter(),
    attendanceRepository,
    taskSchedulingService,
    mock(),
    markService,
    personalMarkService,
    paymentService,
    mock(),
    eventService,
    mock(),
    mock(),
    mock(),
    mock()
  )

  return { handle, attendee, attendanceService, markService, personalMarkService }
}

describe("missing payment penalties", () => {
  it("assigns a suspension and a separate one-point mark after the deregistration deadline", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentVerificationContext(
      subMinutes(getCurrentUTC(), 60),
      "UNPAID"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(markService.create).toHaveBeenCalledTimes(2)
    expect(markService.create).toHaveBeenNthCalledWith(
      1,
      handle,
      expect.objectContaining({ type: "MISSING_PAYMENT", weight: 6, duration: 100_000 }),
      []
    )
    expect(markService.create).toHaveBeenNthCalledWith(
      2,
      handle,
      expect.objectContaining({ type: "MISSING_PAYMENT", weight: 1, duration: DEFAULT_MARK_DURATION }),
      []
    )
    expect(personalMarkService.addToUser).toHaveBeenCalledTimes(2)
    expect(personalMarkService.addToUser).toHaveBeenCalledWith(handle, attendee.userId, "suspension")
    expect(personalMarkService.addToUser).toHaveBeenCalledWith(handle, attendee.userId, "missing-payment-mark")
  })

  it("deregisters an unpaid attendee before the deregistration deadline without assigning penalties", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentVerificationContext(
      addHours(getCurrentUTC(), 1),
      "UNPAID"
    )
    const deregisterAttendee = vi.spyOn(attendanceService, "deregisterAttendee").mockResolvedValue()

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(deregisterAttendee).toHaveBeenCalledWith(handle, attendee.id, { ignoreDeregistrationWindow: true })
    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.addToUser).not.toHaveBeenCalled()
  })

  it("does not assign penalties when payment has succeeded", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentVerificationContext(
      subMinutes(getCurrentUTC(), 60),
      "PAID"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.addToUser).not.toHaveBeenCalled()
  })
})
