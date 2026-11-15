import { TZDate } from "@date-fns/tz"
import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, subMinutes } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { TaskSkippedError } from "../../error"
import { DEFAULT_MARK_DURATION, type Mark } from "../mark/mark"
import type { Payment } from "../payment/payment-service"
import type { Task } from "../task/task"
import { tasks } from "../task/task-definition"
import {
  type Attendance,
  type AttendancePool,
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
    registeredAt: new Date(),
    attendedAt: null,
    registrationPoolDelayHours: null,
    registrationMarkDelayHours: null,
    registrationEligibleAt: getCurrentUTC(),
    paymentChargedAt: null,
    paymentRefundedAt: null,
    completionDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentChargeDeadline: null,
    paymentReservedAt: null,
    paymentRefundedByUserId: null,
    adminRegisteredByUserId: null,
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
  it("returns QUEUED for queued attendees", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registeredAt: null })

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
      registeredAt: null,
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
    const attendee = createAttendee({ registeredAt: null })

    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])

    const promotedAttendee = {
      ...attendee,
      registeredAt: new Date(),
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

function createPaymentContext(deregisterDeadline: Date, paymentStatus: Payment["status"]) {
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
  taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(null)
  eventService.getByAttendanceId.mockResolvedValue(event)
  paymentService.getById.mockResolvedValue(mock<Payment>({ status: paymentStatus }))
  paymentService.create.mockResolvedValue(
    mock<Payment>({ status: "UNPAID", id: "payment", url: "https://example.com/pay" })
  )
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

  return {
    handle,
    attendee,
    attendance,
    attendanceRepository,
    attendanceService,
    taskSchedulingService,
    paymentService,
    markService,
    personalMarkService,
  }
}

describe("attendance payment deadlines", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-08T10:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("gives an attendee reserved from the queue their full payment window near deregistration", async () => {
    const { handle, attendee, attendance, attendanceService, attendanceRepository, taskSchedulingService } =
      createPaymentContext(new Date("2026-11-08T10:05:00Z"), "UNPAID")
    const completionDeadline = addHours(getCurrentUTC(), 24)

    attendee.registeredAt = null
    attendee.paymentId = null
    attendance.pools = [mock<AttendancePool>({ id: attendee.attendancePoolId, capacity: 0 })]
    attendanceRepository.findAttendanceById.mockResolvedValue(attendance)

    await attendanceService.executeReserveAttendeeTask(handle, {
      attendanceId: attendance.id,
      attendeeId: attendee.id,
    })

    expect(attendee.completionDeadline).toEqual(completionDeadline)
    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(
      handle,
      attendee.id,
      completionDeadline
    )
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId: attendee.id },
      completionDeadline
    )
  })

  it.each([
    {
      description: "preserves the full payment window when deregistration closes first",
      deregisterDeadline: "2026-11-08T12:00:00+01:00",
      requestedDeadline: "2026-11-09T10:00:00Z",
      expectedCompletion: "2026-11-09T10:00:00Z",
      expectedCharge: "2026-11-08T11:00:00Z",
    },
    {
      description: "keeps the 24-hour completion deadline when it is earlier",
      deregisterDeadline: "2026-11-10T11:00:00Z",
      requestedDeadline: "2026-11-09T10:00:00Z",
      expectedCompletion: "2026-11-09T10:00:00Z",
      expectedCharge: "2026-11-10T11:00:00Z",
    },
    {
      description: "keeps the five-day capture limit for distant deregistration deadlines",
      deregisterDeadline: "2026-11-18T11:00:00Z",
      requestedDeadline: "2026-11-09T10:00:00Z",
      expectedCompletion: "2026-11-09T10:00:00Z",
      expectedCharge: "2026-11-13T10:00:00Z",
    },
    {
      description: "keeps shorter requested completion windows",
      deregisterDeadline: "2026-11-08T12:00:00Z",
      requestedDeadline: "2026-11-08T11:00:00Z",
      expectedCompletion: "2026-11-08T11:00:00Z",
      expectedCharge: "2026-11-08T12:00:00Z",
    },
  ])("$description", async ({ deregisterDeadline, requestedDeadline, expectedCompletion, expectedCharge }) => {
    const { handle, attendee, attendanceService, attendanceRepository, taskSchedulingService, paymentService } =
      createPaymentContext(new Date(deregisterDeadline), "UNPAID")
    const completionDeadline = new TZDate(expectedCompletion, "UTC")
    const chargeDeadline = new TZDate(expectedCharge, "UTC")

    attendee.paymentId = null

    await attendanceService.startAttendeePayment(handle, attendee.id, new TZDate(requestedDeadline, "UTC"))

    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(
      handle,
      attendee.id,
      completionDeadline
    )
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId: attendee.id },
      completionDeadline
    )
    expect(attendanceRepository.updateAttendeePaymentById).toHaveBeenCalledWith(
      handle,
      attendee.id,
      expect.objectContaining({ paymentChargeDeadline: chargeDeadline })
    )
    expect(paymentService.create).toHaveBeenCalledWith(
      attendee.attendanceId,
      attendee.user,
      expect.objectContaining({ attendee_id: attendee.id }),
      "RESERVE"
    )
  })

  it("keeps late registrations on automatic capture with their original payment window", async () => {
    const { handle, attendee, attendanceService, attendanceRepository, taskSchedulingService, paymentService } =
      createPaymentContext(new Date("2026-11-08T09:59:00Z"), "UNPAID")
    const completionDeadline = new TZDate("2026-11-09T10:00:00Z", "UTC")

    attendee.paymentId = null

    await attendanceService.startAttendeePayment(handle, attendee.id, completionDeadline)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId: attendee.id },
      completionDeadline
    )
    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(
      handle,
      attendee.id,
      completionDeadline
    )
    expect(attendanceRepository.updateAttendeePaymentById).toHaveBeenCalledWith(
      handle,
      attendee.id,
      expect.objectContaining({ paymentChargeDeadline: null })
    )
    expect(paymentService.create).toHaveBeenCalledWith(
      attendee.attendanceId,
      attendee.user,
      expect.objectContaining({ attendee_id: attendee.id }),
      "CHARGE"
    )
  })

  it.each([
    {
      description: "waits for deregistration to close when checkout completes early",
      deregisterDeadline: "2026-11-08T12:00:00+01:00",
      chargeDeadline: "2026-11-08T11:00:00Z",
      expectedCharge: "2026-11-08T11:00:00Z",
    },
    {
      description: "charges promptly when checkout completes after deregistration closes",
      deregisterDeadline: "2026-11-08T09:00:00Z",
      chargeDeadline: "2026-11-08T09:00:00Z",
      expectedCharge: "2026-11-08T10:00:00Z",
    },
    {
      description: "retains an earlier capture deadline to protect the authorization hold",
      deregisterDeadline: "2026-11-18T11:00:00Z",
      chargeDeadline: "2026-11-13T10:00:00Z",
      expectedCharge: "2026-11-13T10:00:00Z",
    },
    {
      description: "supports reservations without a stored capture deadline",
      deregisterDeadline: "2026-11-08T11:00:00Z",
      chargeDeadline: null,
      expectedCharge: "2026-11-08T11:00:00Z",
    },
  ])("$description", async ({ deregisterDeadline, chargeDeadline, expectedCharge }) => {
    const { handle, attendee, attendanceService, attendanceRepository, taskSchedulingService } = createPaymentContext(
      new Date(deregisterDeadline),
      "RESERVED"
    )
    const scheduledChargeTime = new TZDate(expectedCharge, "UTC")

    attendee.paymentChargeDeadline = chargeDeadline === null ? null : new Date(chargeDeadline)

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId: attendee.id },
      scheduledChargeTime
    )
    expect(attendanceRepository.updateAttendeePaymentById).toHaveBeenCalledWith(
      handle,
      attendee.id,
      expect.objectContaining({ paymentReservedAt: getCurrentUTC() })
    )
    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(handle, attendee.id, null)
  })

  it("does not schedule duplicate captures when checkout completion is delivered again", async () => {
    const { handle, attendee, attendanceService, taskSchedulingService } = createPaymentContext(
      new Date("2026-11-08T11:00:00Z"),
      "RESERVED"
    )

    taskSchedulingService.findChargeAttendeeTask
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mock<Task>({ status: "PENDING" }))

    await attendanceService.syncAttendeePayment(handle, attendee.id)
    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledTimes(1)
  })

  it("charges a completed checkout even when an old charge task already skipped the unpaid session", async () => {
    const { handle, attendee, attendanceService, taskSchedulingService, paymentService } = createPaymentContext(
      new Date("2026-11-08T09:00:00Z"),
      "UNPAID"
    )

    await expect(attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id })).rejects.toThrow(
      TaskSkippedError
    )

    paymentService.getById.mockResolvedValue(mock<Payment>({ status: "RESERVED" }))
    taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(mock<Task>({ status: "SKIPPED" }))

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId: attendee.id },
      getCurrentUTC()
    )

    await attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id })

    expect(paymentService.charge).toHaveBeenCalledExactlyOnceWith(attendee.paymentId)
  })

  it.each([
    "UNPAID",
    "CANCELLED",
    "PAID",
    "REFUNDED",
  ] as const)("does not schedule capture when syncing a %s checkout", async (paymentStatus) => {
    const { handle, attendee, attendanceService, taskSchedulingService } = createPaymentContext(
      new Date("2026-11-08T09:00:00Z"),
      paymentStatus
    )

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
  })

  it("schedules capture when the completion check discovers an authorization before the webhook does", async () => {
    const { handle, attendee, attendanceService, taskSchedulingService, markService } = createPaymentContext(
      new Date("2026-11-08T09:00:00Z"),
      "RESERVED"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId: attendee.id },
      getCurrentUTC()
    )
    expect(markService.create).not.toHaveBeenCalled()
  })
})

describe("scheduled payment capture", () => {
  it.each([
    "UNPAID",
    "CANCELLED",
    "REFUNDED",
  ] as const)("skips %s payments without attempting capture or recording a charge", async (paymentStatus) => {
    const { handle, attendee, attendanceService, attendanceRepository, paymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      paymentStatus
    )

    await expect(attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id })).rejects.toThrow(
      TaskSkippedError
    )

    expect(paymentService.charge).not.toHaveBeenCalled()
    expect(attendanceRepository.updateAttendeePaymentById).not.toHaveBeenCalled()
  })

  it("captures a reservation and records the charge", async () => {
    const { handle, attendee, attendanceService, attendanceRepository, paymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "RESERVED"
    )

    await attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id })

    expect(paymentService.charge).toHaveBeenCalledExactlyOnceWith(attendee.paymentId)
    expect(attendanceRepository.updateAttendeePaymentById).toHaveBeenCalledWith(
      handle,
      attendee.id,
      expect.objectContaining({ paymentChargedAt: expect.any(Date) })
    )
  })

  it("does not capture an already paid payment again", async () => {
    const { handle, attendee, attendanceService, attendanceRepository, paymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "PAID"
    )

    await attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id })

    expect(paymentService.charge).not.toHaveBeenCalled()
    expect(attendanceRepository.updateAttendeePaymentById).not.toHaveBeenCalled()
  })

  it("still reports capture failures for reserved payments", async () => {
    const { handle, attendee, attendanceService, attendanceRepository, paymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "RESERVED"
    )
    const captureError = new Error("Stripe capture failed")

    paymentService.charge.mockRejectedValue(captureError)

    await expect(attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id })).rejects.toThrow(
      captureError
    )

    expect(attendanceRepository.updateAttendeePaymentById).not.toHaveBeenCalled()
  })
})

describe("missing payment penalties", () => {
  it("assigns a suspension and a separate one-point mark after the deregistration deadline", async () => {
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentContext(
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
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentContext(
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
    const { handle, attendee, attendanceService, markService, personalMarkService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "PAID"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.addToUser).not.toHaveBeenCalled()
  })
})
