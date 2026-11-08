import { TZDate } from "@date-fns/tz"
import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, subMinutes } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { TaskSkippedError } from "../../error"
import { DEFAULT_MARK_DURATION, type Mark } from "../mark/mark"
import type { PaymentView } from "../payment/payment"
import type { Task } from "../task/task"
import { tasks } from "../task/task-definition"
import {
  type Attendance,
  type AttendancePool,
  type Attendee,
  buildRegistrationAvailabilityCompletionView,
  getAttendeeState,
  getMissingAttendanceCompletionRequirements,
  hasAttendeePaid,
  isAttendeeChargedAndUnrefunded,
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
    payment: null,
    completionDeadline: null,
    adminRegisteredByUserId: null,
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
  it("requires a ledger payment to satisfy the payment requirement", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      payment: null,
    })

    expect(hasAttendeePaid(attendee, attendance.attendancePrice)).toBe(false)
    expect(isAttendeeChargedAndUnrefunded(attendee)).toBe(false)
    expect(getAttendeeState(attendee, attendance)).toBe("RESERVED")
  })

  it("requires capture tasks to identify the attempt they were scheduled for", () => {
    const attendee = createAttendee()
    const result = tasks.CHARGE_ATTENDEE.getSchema().safeParse({
      attendeeId: attendee.id,
    })
    const boundTask = tasks.CHARGE_ATTENDEE.getSchema().safeParse({
      attendeeId: attendee.id,
      paymentAttemptId: "attempt",
    })

    expect(result.success).toBe(false)
    expect(boundTask.success).toBe(true)
  })

  it("returns QUEUED for queued attendees", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({ registeredAt: null })

    expect(getAttendeeState(attendee, attendance)).toBe("QUEUED")
  })

  it("returns RESERVED when payment is still missing", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      completionDeadline: addMinutes(getCurrentUTC(), 45),
      payment: mock<PaymentView>({ checkoutUrl: "https://example.com/pay", isRequirementSatisfied: false }),
    })

    expect(getAttendeeState(attendee, attendance)).toBe("RESERVED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual(["PAYMENT"])
  })

  it("returns REGISTERED when payment is complete", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      payment: mock<PaymentView>({ status: "AUTHORIZED", isRequirementSatisfied: true }),
    })

    expect(getAttendeeState(attendee, attendance)).toBe("REGISTERED")
    expect(getMissingAttendanceCompletionRequirements(attendance, attendee)).toEqual([])
  })

  it("builds completion view with pending payment requirement", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      completionDeadline: addHours(getCurrentUTC(), 1),
      payment: mock<PaymentView>({ checkoutUrl: "https://example.com/pay", isRequirementSatisfied: false }),
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: attendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: ["PAYMENT"],
      payment: attendee.payment,
    })
  })

  it("ignores leftover payment details while the attendee is queued", () => {
    const attendance = createAttendance()
    const attendee = createAttendee({
      registeredAt: null,
      completionDeadline: addHours(getCurrentUTC(), 24),
      payment: mock<PaymentView>({ checkoutUrl: "https://example.com/pay", isRequirementSatisfied: false }),
    })

    expect(buildRegistrationAvailabilityCompletionView(attendance, attendee)).toEqual({
      attendeeState: "QUEUED",
      completionDeadline: null,
      requirements: [],
      missingRequirements: [],
      payment: null,
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
      payment: mock<PaymentView>({ checkoutUrl: "https://example.com/pay", isRequirementSatisfied: false }),
    }

    expect(buildRegistrationAvailabilityCompletionView(attendance, promotedAttendee)).toEqual({
      attendeeState: "RESERVED",
      completionDeadline: promotedAttendee.completionDeadline,
      requirements: [{ requirement: "PAYMENT", completed: false }],
      missingRequirements: ["PAYMENT"],
      payment: promotedAttendee.payment,
    })
  })

  it("returns null completion view when attendee is absent", () => {
    const attendance = createAttendance()

    expect(buildRegistrationAvailabilityCompletionView(attendance, null)).toBeNull()
  })
})

function createPaymentContext(deregisterDeadline: Date, paymentStatus: PaymentView["status"]) {
  const handle = mock<DBHandle>()
  const attendanceRepository = mock<Parameters<typeof getAttendanceService>[1]>()
  const taskSchedulingService = mock<Parameters<typeof getAttendanceService>[2]>()
  const markService = mock<Parameters<typeof getAttendanceService>[4]>()
  const personalMarkService = mock<Parameters<typeof getAttendanceService>[5]>()
  const attendancePaymentService = mock<Parameters<typeof getAttendanceService>[6]>()
  const eventService = mock<Parameters<typeof getAttendanceService>[7]>()
  const attendee = createAttendee({
    payment: mock<PaymentView>({
      id: "payment",
      status: "UNPAID",
      attemptId: "attempt",
      isRequirementSatisfied: false,
    }),
    completionDeadline: subMinutes(getCurrentUTC(), 1),
  })
  const attendance = createAttendance({ attendees: [attendee], deregisterDeadline })
  const event = mock<Event>({ id: "test-event", title: "Test event", hostingGroups: [] })

  attendanceRepository.findAttendanceByAttendeeId.mockResolvedValue(attendance)
  taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(null)
  taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(null)
  eventService.getByAttendanceId.mockResolvedValue(event)
  const payment = mock<PaymentView>({
    status: paymentStatus,
    attemptId: "attempt",
    captureScheduledAt: null,
  })
  attendancePaymentService.syncPayment.mockResolvedValue(payment)
  attendancePaymentService.startCheckout.mockResolvedValue(
    mock<PaymentView>({
      status: "UNPAID",
      id: "payment",
      checkoutUrl: "https://example.com/pay",
      isRequirementSatisfied: false,
    })
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
    attendancePaymentService,
    eventService,
    mock(),
    mock(),
    mock({ WEB_PUBLIC_ORIGIN: "https://online.ntnu.no" }),
    mock()
  )

  return {
    handle,
    attendee,
    attendance,
    attendanceRepository,
    attendanceService,
    taskSchedulingService,
    attendancePaymentService,
    payment,
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
    attendee.payment = null
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
    const {
      handle,
      attendee,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      attendancePaymentService,
    } = createPaymentContext(new Date(deregisterDeadline), "UNPAID")
    const completionDeadline = new TZDate(expectedCompletion, "UTC")
    const chargeDeadline = new TZDate(expectedCharge, "UTC")

    attendee.payment = null

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
    expect(attendancePaymentService.startCheckout).toHaveBeenCalledWith(
      handle,
      expect.objectContaining({
        attendee,
        captureMode: "MANUAL",
        captureScheduledAt: chargeDeadline,
      })
    )
  })

  it("keeps late registrations on automatic capture with their original payment window", async () => {
    const {
      handle,
      attendee,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      attendancePaymentService,
    } = createPaymentContext(new Date("2026-11-08T09:59:00Z"), "UNPAID")
    const completionDeadline = new TZDate("2026-11-09T10:00:00Z", "UTC")

    attendee.payment = null

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
    expect(attendancePaymentService.startCheckout).toHaveBeenCalledWith(
      handle,
      expect.objectContaining({
        attendee,
        captureMode: "AUTOMATIC",
        captureScheduledAt: null,
      })
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
    const { handle, attendee, attendanceService, attendanceRepository, taskSchedulingService, payment } =
      createPaymentContext(new Date(deregisterDeadline), "AUTHORIZED")
    const scheduledChargeTime = new TZDate(expectedCharge, "UTC")

    payment.captureScheduledAt = chargeDeadline === null ? null : new Date(chargeDeadline)

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId: attendee.id, paymentAttemptId: "attempt" },
      scheduledChargeTime
    )
    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(handle, attendee.id, null)
  })

  it("does not schedule duplicate captures when checkout completion is delivered again", async () => {
    const { handle, attendee, attendanceService, taskSchedulingService } = createPaymentContext(
      new Date("2026-11-08T11:00:00Z"),
      "AUTHORIZED"
    )

    const chargeTask: Task = {
      ...mock<Task>({
        status: "PENDING",
        payload: {
          attendeeId: attendee.id,
          paymentAttemptId: "attempt",
        },
      }),
      scheduledAt: new Date("2026-11-08T11:00:00Z"),
    }

    taskSchedulingService.findChargeAttendeeTask.mockResolvedValueOnce(null).mockResolvedValueOnce(chargeTask)

    await attendanceService.syncAttendeePayment(handle, attendee.id)
    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledTimes(1)
  })

  it("charges a completed checkout even when an old charge task already skipped the unpaid session", async () => {
    const { handle, attendee, attendanceService, taskSchedulingService, attendancePaymentService } =
      createPaymentContext(new Date("2026-11-08T09:00:00Z"), "UNPAID")

    await expect(
      attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id, paymentAttemptId: "attempt" })
    ).rejects.toThrow(TaskSkippedError)

    attendancePaymentService.syncPayment.mockResolvedValue(
      mock<PaymentView>({
        status: "AUTHORIZED",
        attemptId: "attempt",
        captureScheduledAt: null,
      })
    )
    taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(mock<Task>({ status: "SKIPPED" }))

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId: attendee.id, paymentAttemptId: "attempt" },
      getCurrentUTC()
    )

    await attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id, paymentAttemptId: "attempt" })

    expect(attendancePaymentService.capture).toHaveBeenCalledExactlyOnceWith(handle, attendee.payment?.id)
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
      "AUTHORIZED"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId: attendee.id, paymentAttemptId: "attempt" },
      getCurrentUTC()
    )
    expect(markService.create).not.toHaveBeenCalled()
  })
})

describe("scheduled payment capture", () => {
  it("does not capture a replacement checkout on behalf of an older scheduled task", async () => {
    const { handle, attendee, attendanceService, attendancePaymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "AUTHORIZED"
    )
    attendee.payment = mock<PaymentView>({
      attemptId: "replacement-attempt",
    })

    await expect(
      attendanceService.executeChargeAttendeeTask(handle, {
        attendeeId: attendee.id,
        paymentAttemptId: "original-attempt",
      })
    ).rejects.toThrow(TaskSkippedError)

    expect(attendancePaymentService.syncPayment).not.toHaveBeenCalled()
    expect(attendancePaymentService.capture).not.toHaveBeenCalled()
  })

  it("brings a pending capture forward when the provider authorization expires earlier", async () => {
    const { handle, attendee, attendanceService, attendancePaymentService, taskSchedulingService } =
      createPaymentContext(addHours(getCurrentUTC(), 24), "AUTHORIZED")
    const earlierCaptureTime = addHours(getCurrentUTC(), 1)
    attendancePaymentService.syncPayment.mockResolvedValue(
      mock<PaymentView>({
        status: "AUTHORIZED",
        attemptId: "attempt",
        captureScheduledAt: earlierCaptureTime,
      })
    )
    taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(
      mock<Task>({
        id: "old-task",
        status: "PENDING",
        scheduledAt: addHours(getCurrentUTC(), 24),
        payload: {
          attendeeId: attendee.id,
          paymentAttemptId: "attempt",
        },
      })
    )

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.cancel).toHaveBeenCalledExactlyOnceWith(handle, "old-task")
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.CHARGE_ATTENDEE,
      {
        attendeeId: attendee.id,
        paymentAttemptId: "attempt",
      },
      earlierCaptureTime
    )
  })

  it.each([
    "UNPAID",
    "CANCELLED",
    "REFUNDED",
  ] as const)("skips %s payments without attempting capture or recording a charge", async (paymentStatus) => {
    const { handle, attendee, attendanceService, attendancePaymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      paymentStatus
    )

    await expect(
      attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id, paymentAttemptId: "attempt" })
    ).rejects.toThrow(TaskSkippedError)

    expect(attendancePaymentService.capture).not.toHaveBeenCalled()
  })

  it("delegates capture and reconciliation to the payment service", async () => {
    const { handle, attendee, attendanceService, attendancePaymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "AUTHORIZED"
    )

    await attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id, paymentAttemptId: "attempt" })

    expect(attendancePaymentService.capture).toHaveBeenCalledExactlyOnceWith(handle, attendee.payment?.id)
  })

  it("does not capture an already paid payment again", async () => {
    const { handle, attendee, attendanceService, attendancePaymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "PAID"
    )

    await attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id, paymentAttemptId: "attempt" })

    expect(attendancePaymentService.capture).not.toHaveBeenCalled()
  })

  it("still reports capture failures for reserved payments", async () => {
    const { handle, attendee, attendanceService, attendancePaymentService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "AUTHORIZED"
    )
    const captureError = new Error("Stripe capture failed")

    attendancePaymentService.capture.mockRejectedValue(captureError)

    await expect(
      attendanceService.executeChargeAttendeeTask(handle, { attendeeId: attendee.id, paymentAttemptId: "attempt" })
    ).rejects.toThrow(captureError)
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
