import { TZDate } from "@date-fns/tz"
import { EventEmitter } from "node:events"
import type { DBClient, DBHandle } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, subMinutes } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { RetryableTaskError, TaskSkippedError } from "../../error"
import { DEFAULT_MARK_DURATION, type Mark, type PersonalMark } from "../mark/mark"
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
  const eventEmitter = new EventEmitter()
  const handle = mock<DBHandle>()
  const client = mock<DBClient>()
  client.$transaction.mockImplementation(async (operation) => operation(handle))
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
  const event = mock<Event>({
    id: "test-event",
    title: "Test event",
    hostingGroups: [],
    start: new Date("2026-12-01T16:00:00Z"),
    end: new Date("2026-12-01T18:00:00Z"),
    createdAt: new Date("2026-11-01T12:00:00Z"),
    updatedAt: new Date("2026-11-01T12:00:00Z"),
    description: "<p>Welcome!</p>",
    locationAddress: "Gløshaugen",
    locationLink: null,
  })

  attendance.pools = [mock<AttendancePool>({ id: attendee.attendancePoolId, capacity: -1 })]
  attendanceRepository.findAttendeeById.mockResolvedValue(attendee)
  attendanceRepository.findAttendanceByAttendeeId.mockResolvedValue(attendance)
  attendanceRepository.findAttendanceById.mockResolvedValue(attendance)
  attendanceRepository.updateAttendeeById.mockImplementation(async (_handle, _attendeeId, data) => {
    Object.assign(attendee, data)

    return attendee
  })
  taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(null)
  taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(null)
  eventService.getByAttendanceId.mockResolvedValue(event)
  const payment = mock<PaymentView>({
    id: "payment",
    isCheckoutPending: false,
    canRefund: false,
    paidAmountOre: 0,
    status: paymentStatus,
    isRequirementSatisfied: paymentStatus === "AUTHORIZED" || paymentStatus === "PAID" || paymentStatus === "WAIVED",
    attemptId: "attempt",
    captureScheduledAt: null,
  })
  attendancePaymentService.syncPayment.mockImplementation(async () => {
    attendee.payment = payment

    return payment
  })
  attendancePaymentService.expireOpenCheckout.mockImplementation(async () => {
    if (payment.isCheckoutPending) {
      return false
    }

    payment.status = "EXPIRED"

    return true
  })
  attendancePaymentService.prepareCheckout.mockResolvedValue(
    mock<PaymentView>({
      status: "UNPAID",
      id: "payment",
      checkoutUrl: "https://example.com/pay",
      isRequirementSatisfied: false,
    })
  )
  personalMarkService.recordAssignment.mockImplementation(async (_handle, userId, markId) => {
    return mock<PersonalMark>({ userId, markId })
  })
  markService.create
    .mockResolvedValueOnce(mock<Mark>({ id: "suspension" }))
    .mockResolvedValueOnce(mock<Mark>({ id: "missing-payment-mark" }))

  const attendanceService = getAttendanceService(
    eventEmitter,
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
    eventEmitter,
    client,
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

describe("seat promotion notifications", () => {
  it("does not announce a seat release when reserving the next attendee fails", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 24), "UNPAID")
    fixture.attendee.payment = null
    const queued = createAttendee({ id: "00000000-0000-4000-8000-000000000031", registeredAt: null })
    fixture.attendance.attendees.push(queued)
    fixture.attendance.pools = [mock<AttendancePool>({ id: queued.attendancePoolId, capacity: 1 })]

    const broadcast = vi.fn()
    fixture.eventEmitter.on("attendance:register-change", broadcast)
    const failure = new Error("Could not reserve the seat")
    fixture.attendanceRepository.updateAttendeeById.mockRejectedValue(failure)

    await expect(
      fixture.attendanceService.deregisterAttendee(fixture.handle, fixture.attendee.id, {
        ignoreDeregistrationWindow: false,
      })
    ).rejects.toThrow(failure)

    expect(fixture.attendanceRepository.deleteAttendeeById).toHaveBeenCalledWith(fixture.handle, fixture.attendee.id)
    expect(broadcast).not.toHaveBeenCalled()
  })
})

describe("checkout recovery after registration", () => {
  it("releases an overdue reservation without penalties when checkout never became available", async () => {
    const fixture = createPaymentContext(subMinutes(getCurrentUTC(), 10), "UNPAID")
    fixture.payment.isCheckoutPending = true
    fixture.payment.checkoutUrl = null
    fixture.attendee.payment = fixture.payment
    fixture.attendance.pools = [mock<AttendancePool>({ id: fixture.attendee.attendancePoolId, capacity: -1 })]
    fixture.attendanceRepository.findAttendeeById.mockResolvedValue(fixture.attendee)
    fixture.attendancePaymentService.openCheckout.mockRejectedValue(new Error("Stripe unavailable"))

    await fixture.attendanceService.openAttendeeCheckout(mock<DBClient>(), fixture.attendee.id)
    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendancePaymentService.cancelUnopenedCheckout).toHaveBeenCalledWith(
      fixture.handle,
      fixture.payment.attemptId
    )
    expect(fixture.attendanceRepository.deleteAttendeeById).toHaveBeenCalledWith(fixture.handle, fixture.attendee.id)
    expect(fixture.markService.create).not.toHaveBeenCalled()
    expect(fixture.personalMarkService.recordAssignment).not.toHaveBeenCalled()
  })

  it("broadcasts the available payment link immediately after opening checkout", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 24), "UNPAID")
    const broadcasts = vi.fn()
    fixture.eventEmitter.on("attendance:register-change", broadcasts)
    fixture.payment.checkoutUrl = "https://checkout.stripe.com/ready"
    fixture.attendanceRepository.findAttendeeById.mockResolvedValue(fixture.attendee)
    fixture.attendancePaymentService.openCheckout.mockResolvedValue(fixture.payment)

    await fixture.attendanceService.openAttendeeCheckout(mock<DBClient>(), fixture.attendee.id)

    expect(broadcasts).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "updated",
        attendee: expect.objectContaining({
          payment: expect.objectContaining({ checkoutUrl: "https://checkout.stripe.com/ready" }),
        }),
      })
    )
  })

  it("keeps the committed reservation when opening checkout fails", async () => {
    const { attendee, attendanceService, attendanceRepository, attendancePaymentService } = createPaymentContext(
      addHours(getCurrentUTC(), 24),
      "UNPAID"
    )
    const client = mock<DBClient>()
    attendanceRepository.findAttendeeById.mockResolvedValue(attendee)
    attendancePaymentService.openCheckout.mockRejectedValue(new Error("Stripe unavailable"))

    const result = await attendanceService.openAttendeeCheckout(client, attendee.id)

    expect(result).toEqual(attendee)
    expect(result.payment).not.toBeNull()
    expect(attendancePaymentService.openCheckout).toHaveBeenCalledExactlyOnceWith(client, attendee.payment?.id)
    expect(attendanceRepository.deleteAttendeeById).not.toHaveBeenCalled()
  })
})

describe("attendance payment deadlines", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-08T10:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("keeps the original deadline when checkout recovers shortly before it expires", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 24), "UNPAID")
    const deadline = addMinutes(getCurrentUTC(), 10)
    fixture.attendee.completionDeadline = deadline
    fixture.payment.checkoutUrl = "https://checkout.stripe.com/recovered"
    fixture.attendance.pools = [mock<AttendancePool>({ id: fixture.attendee.attendancePoolId, capacity: -1 })]
    fixture.attendanceRepository.findAttendeeById.mockResolvedValue(fixture.attendee)
    fixture.attendancePaymentService.openCheckout.mockResolvedValue(fixture.payment)

    await fixture.attendanceService.openAttendeeCheckout(mock<DBClient>(), fixture.attendee.id)
    await fixture.attendanceService.syncAttendeePayment(fixture.handle, fixture.attendee.id)

    expect(fixture.attendee.completionDeadline).toEqual(deadline)
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).not.toHaveBeenCalled()
    expect(fixture.taskSchedulingService.scheduleAt).not.toHaveBeenCalled()

    vi.setSystemTime(addMinutes(deadline, 1))

    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendanceRepository.deleteAttendeeById).toHaveBeenCalledWith(fixture.handle, fixture.attendee.id)
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

    await attendanceService.prepareAttendeePayment(handle, attendee.id, new TZDate(requestedDeadline, "UTC"))

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
    expect(attendancePaymentService.prepareCheckout).toHaveBeenCalledWith(
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

    await attendanceService.prepareAttendeePayment(handle, attendee.id, completionDeadline)

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
    expect(attendancePaymentService.prepareCheckout).toHaveBeenCalledWith(
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
        isRequirementSatisfied: true,
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
    const {
      client,
      handle,
      attendee,
      attendanceService,
      attendancePaymentService,
      attendanceRepository,
      taskSchedulingService,
      markService,
    } = createPaymentContext(new Date("2026-11-08T09:00:00Z"), "AUTHORIZED")

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

    expect(attendancePaymentService.syncPayment).toHaveBeenCalledExactlyOnceWith(client, "payment")
    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledExactlyOnceWith(
      handle,
      attendee.id,
      null
    )
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
  it.each([
    "UNPAID",
    "FAILED",
    "EXPIRED",
    "CANCELLED",
  ] as const)("assigns penalties for %s after the deregistration deadline", async (status) => {
    const { client, handle, attendee, attendanceService, markService, personalMarkService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      status
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

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
    expect(personalMarkService.recordAssignment).toHaveBeenCalledTimes(2)
    expect(personalMarkService.recordAssignment).toHaveBeenCalledWith(handle, attendee.userId, "suspension")
    expect(personalMarkService.recordAssignment).toHaveBeenCalledWith(handle, attendee.userId, "missing-payment-mark")
    expect(personalMarkService.sendReceivedMarkEmail).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ markId: "suspension" })
    )
    expect(personalMarkService.sendReceivedMarkEmail).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ markId: "missing-payment-mark" })
    )
  })

  it("deregisters an unpaid attendee before the deregistration deadline without assigning penalties", async () => {
    const { client, handle, attendee, attendanceService, attendanceRepository, markService, personalMarkService } =
      createPaymentContext(addHours(getCurrentUTC(), 1), "UNPAID")

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

    expect(attendanceRepository.deleteAttendeeById).toHaveBeenCalledWith(handle, attendee.id)
    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.recordAssignment).not.toHaveBeenCalled()
  })

  it("does not assign penalties when payment has succeeded", async () => {
    const { client, attendee, attendanceService, markService, personalMarkService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "PAID"
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

    expect(markService.create).not.toHaveBeenCalled()
    expect(personalMarkService.recordAssignment).not.toHaveBeenCalled()
  })
})

describe("payment reconciliation safeguards", () => {
  it.each([
    null,
    addHours(getCurrentUTC(), 1),
  ])("ignores a stale completion job with deadline %s", async (completionDeadline) => {
    const { client, attendee, attendanceService, attendancePaymentService, markService, payment } =
      createPaymentContext(subMinutes(getCurrentUTC(), 60), "FAILED")
    attendee.completionDeadline = completionDeadline
    attendee.payment = payment

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

    expect(markService.create).not.toHaveBeenCalled()
    expect(client.$transaction).not.toHaveBeenCalled()
    expect(attendancePaymentService.syncPayment).not.toHaveBeenCalled()
  })

  it("keeps the seat when Stripe reports payment after the expiration request", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 1), "UNPAID")
    fixture.attendancePaymentService.expireOpenCheckout.mockImplementation(async () => {
      fixture.attendancePaymentService.syncPayment.mockImplementationOnce(async () => {
        const paid = { ...fixture.payment, status: "PAID" as const, isRequirementSatisfied: true }
        fixture.attendee.payment = paid

        return paid
      })

      return true
    })

    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendancePaymentService.expireOpenCheckout).toHaveBeenCalledExactlyOnceWith(
      fixture.client,
      "attempt"
    )
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledExactlyOnceWith(
      fixture.handle,
      fixture.attendee.id,
      null
    )
    expect(fixture.attendanceRepository.deleteAttendeeById).not.toHaveBeenCalled()
    expect(fixture.markService.create).not.toHaveBeenCalled()
  })

  it("prepares a new checkout for a deadline extended during expiration", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 1), "UNPAID")
    const extendedDeadline = addHours(getCurrentUTC(), 2)
    fixture.attendancePaymentService.expireOpenCheckout.mockImplementation(async () => {
      fixture.attendee.completionDeadline = extendedDeadline
      fixture.payment.status = "EXPIRED"
      fixture.payment.canStartCheckout = true

      return true
    })

    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendancePaymentService.prepareCheckout).toHaveBeenCalledExactlyOnceWith(
      fixture.handle,
      expect.objectContaining({ attendee: fixture.attendee })
    )
    expect(fixture.attendee.completionDeadline).toEqual(extendedDeadline)
    expect(fixture.attendanceRepository.deleteAttendeeById).not.toHaveBeenCalled()
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).not.toHaveBeenCalled()
  })

  it("restores an extended reservation on retry after checkout expired and the transaction failed", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 1), "UNPAID")
    const extendedDeadline = addHours(getCurrentUTC(), 2)
    const task = { attendeeId: fixture.attendee.id }
    fixture.attendancePaymentService.expireOpenCheckout.mockImplementationOnce(async () => {
      fixture.attendee.completionDeadline = extendedDeadline
      fixture.payment.status = "EXPIRED"
      fixture.payment.canStartCheckout = true

      return true
    })
    fixture.client.$transaction.mockRejectedValueOnce(new Error("Transaction rolled back"))

    await expect(fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, task)).rejects.toThrow(
      "Transaction rolled back"
    )
    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, task)

    expect(fixture.attendancePaymentService.prepareCheckout).toHaveBeenCalledOnce()
    expect(fixture.attendancePaymentService.expireOpenCheckout).toHaveBeenCalledOnce()
    expect(fixture.attendee.completionDeadline).toEqual(extendedDeadline)
    expect(fixture.attendanceRepository.deleteAttendeeById).not.toHaveBeenCalled()
  })

  it("releases the seat when the payment deadline preceded deregistration but the worker ran late", async () => {
    const fixture = createPaymentContext(subMinutes(getCurrentUTC(), 1), "UNPAID")
    fixture.attendee.completionDeadline = subMinutes(getCurrentUTC(), 2)

    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendanceRepository.deleteAttendeeById).toHaveBeenCalledWith(fixture.handle, fixture.attendee.id)
    expect(fixture.markService.create).not.toHaveBeenCalled()
  })

  it("sends no penalty emails when the database rejects the commit", async () => {
    const fixture = createPaymentContext(subMinutes(getCurrentUTC(), 10), "FAILED")
    const failure = new Error("Transaction could not commit")

    fixture.client.$transaction.mockImplementation(async (operation) => {
      await operation(fixture.handle)
      throw failure
    })

    await expect(
      fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
        attendeeId: fixture.attendee.id,
      })
    ).rejects.toThrow(failure)

    expect(fixture.personalMarkService.recordAssignment).toHaveBeenCalledTimes(2)
    expect(fixture.personalMarkService.sendReceivedMarkEmail).not.toHaveBeenCalled()
  })

  it("uses a concurrent waiver when applying the decision", async () => {
    const fixture = createPaymentContext(subMinutes(getCurrentUTC(), 10), "FAILED")
    fixture.client.$transaction.mockImplementation(async (operation) => {
      const waived = { ...fixture.payment, status: "WAIVED" as const, isRequirementSatisfied: true }
      fixture.attendanceRepository.findAttendanceByAttendeeId.mockResolvedValueOnce({
        ...fixture.attendance,
        attendees: [{ ...fixture.attendee, payment: waived }],
      })

      return await operation(fixture.handle)
    })

    await fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendancePaymentService.syncPayment).toHaveBeenCalledExactlyOnceWith(
      fixture.client,
      fixture.payment.id
    )
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledExactlyOnceWith(
      fixture.handle,
      fixture.attendee.id,
      null
    )
    expect(fixture.markService.create).not.toHaveBeenCalled()
  })

  it("retries a replacement payment attempt before applying marks", async () => {
    const fixture = createPaymentContext(subMinutes(getCurrentUTC(), 10), "FAILED")
    fixture.client.$transaction.mockImplementation(async (operation) => {
      fixture.attendee.payment = { ...fixture.payment, attemptId: "replacement" }

      return await operation(fixture.handle)
    })

    await expect(
      fixture.attendanceService.executeVerifyAttendanceCompletionTask(fixture.client, {
        attendeeId: fixture.attendee.id,
      })
    ).rejects.toThrow(RetryableTaskError)
    expect(fixture.markService.create).not.toHaveBeenCalled()
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).not.toHaveBeenCalled()
  })

  it("does not schedule more penalties when a failed-payment webhook repeats after enforcement", async () => {
    const { client, handle, attendee, attendanceService, attendanceRepository, taskSchedulingService, markService } =
      createPaymentContext(subMinutes(getCurrentUTC(), 60), "FAILED")
    markService.create.mockResolvedValue(mock<Mark>({ id: "duplicate-penalty" }))
    attendanceRepository.updateAttendeeCompletionDeadline.mockImplementation(async (_handle, _attendeeId, deadline) => {
      attendee.completionDeadline = deadline

      return attendee
    })
    taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(
      mock<Task>({ id: "completion-task", status: "COMPLETED" })
    )

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })
    await attendanceService.syncAttendeePayment(handle, attendee.id)
    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

    expect(attendee.completionDeadline).toBeNull()
    expect(markService.create).toHaveBeenCalledTimes(2)
    expect(taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
  })

  it.each([
    "FAILED",
    "EXPIRED",
    "CANCELLED",
    "PARTIALLY_PAID",
    "PARTIALLY_REFUNDED",
  ] as const)("preserves the pending completion check for %s", async (status) => {
    const { handle, attendee, attendanceService, attendanceRepository, taskSchedulingService } = createPaymentContext(
      addHours(getCurrentUTC(), 12),
      status
    )
    taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(
      mock<Task>({ id: "completion-task", status: "PENDING" })
    )

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.cancel).not.toHaveBeenCalled()
    expect(attendanceRepository.updateAttendeeCompletionDeadline).not.toHaveBeenCalled()
  })

  it("resumes enforcement when a delayed payment fails after the completion check finished", async () => {
    const { handle, attendee, attendanceService, taskSchedulingService } = createPaymentContext(
      addHours(getCurrentUTC(), 12),
      "FAILED"
    )
    taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(
      mock<Task>({ id: "completed-check", status: "COMPLETED" })
    )
    const beforeSync = getCurrentUTC()

    await attendanceService.syncAttendeePayment(handle, attendee.id)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId: attendee.id },
      expect.any(Date)
    )
    const scheduledAt = taskSchedulingService.scheduleAt.mock.calls[0][3]

    expect(scheduledAt.getTime()).toBeGreaterThanOrEqual(beforeSync.getTime())
    expect(scheduledAt.getTime()).toBeLessThanOrEqual(getCurrentUTC().getTime())
    expect(taskSchedulingService.cancel).not.toHaveBeenCalled()
  })

  it("refreshes a cached authorization before deciding whether payment enforcement is needed", async () => {
    const { client, attendee, attendanceService, attendancePaymentService, markService } = createPaymentContext(
      subMinutes(getCurrentUTC(), 60),
      "CANCELLED"
    )
    attendee.payment = mock<PaymentView>({
      id: "payment",
      attemptId: "attempt",
      status: "AUTHORIZED",
      isRequirementSatisfied: true,
    })

    await attendanceService.executeVerifyAttendanceCompletionTask(client, { attendeeId: attendee.id })

    expect(attendancePaymentService.syncPayment).toHaveBeenCalledExactlyOnceWith(client, "payment")
    expect(markService.create).toHaveBeenCalledTimes(2)
  })

  it("rejects removal of event pricing while a checkout can still collect money", async () => {
    const { handle, attendance, attendanceService, attendanceRepository, payment } = createPaymentContext(
      addHours(getCurrentUTC(), 12),
      "UNPAID"
    )
    payment.canCancel = true
    payment.checkoutUrl = "https://checkout.stripe.com/open-session"
    attendanceRepository.updateAttendancePaymentPrice.mockResolvedValue(attendance)

    await expect(attendanceService.deleteAttendancePayment(handle, attendance)).rejects.toThrow("active payment")

    expect(attendanceRepository.updateAttendancePaymentPrice).not.toHaveBeenCalled()
  })

  it.each([
    "EXPIRED",
    "REFUNDED",
    "WAIVED",
  ] as const)("allows removal of event pricing after payment is %s", async (status) => {
    const { handle, attendance, attendanceService, attendanceRepository, payment } = createPaymentContext(
      addHours(getCurrentUTC(), 12),
      status
    )
    payment.canCancel = false
    attendanceRepository.updateAttendancePaymentPrice.mockResolvedValue(attendance)

    await attendanceService.deleteAttendancePayment(handle, attendance)

    expect(attendanceRepository.updateAttendancePaymentPrice).toHaveBeenCalledExactlyOnceWith(
      handle,
      attendance.id,
      null
    )
    expect(attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(
      handle,
      attendance.attendees[0].id,
      null
    )
  })
})

describe("registration payment transitions", () => {
  it("creates payment and a deadline when an administrator registers a queued attendee", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    fixture.attendee.registeredAt = null
    fixture.attendee.payment = null

    const result = await fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, {
      registeredAt: getCurrentUTC(),
    })

    expect(fixture.attendancePaymentService.prepareCheckout).toHaveBeenCalledOnce()
    expect(result.payment?.id).toBe("payment")
    expect(result.completionDeadline?.getTime()).toBeGreaterThan(getCurrentUTC().getTime())
    expect(fixture.taskSchedulingService.scheduleAt).toHaveBeenCalledWith(
      fixture.handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId: fixture.attendee.id },
      expect.any(Date)
    )
  })

  it.each([null, 0])("does not create payment when registering for a free event priced %s", async (price) => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    fixture.attendee.registeredAt = null
    fixture.attendee.payment = null
    fixture.attendance.attendancePrice = price

    await fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, {
      registeredAt: getCurrentUTC(),
    })

    expect(fixture.attendancePaymentService.prepareCheckout).not.toHaveBeenCalled()
    expect(fixture.taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
  })

  it("does not create payment when editing selections for a queued attendee", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    fixture.attendee.registeredAt = null
    fixture.attendee.payment = null

    await fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, { selections: [] })

    expect(fixture.attendancePaymentService.prepareCheckout).not.toHaveBeenCalled()
    expect(fixture.taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
  })

  it("does not restart an existing payment deadline when registration is repeated", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    const deadline = fixture.attendee.completionDeadline

    await fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, {
      registeredAt: getCurrentUTC(),
    })

    expect(fixture.attendancePaymentService.prepareCheckout).not.toHaveBeenCalled()
    expect(fixture.attendee.completionDeadline).toEqual(deadline)
  })

  it("cancels payment and scheduled enforcement when moving a registered attendee back to the queue", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "AUTHORIZED")
    fixture.taskSchedulingService.findChargeAttendeeTask.mockResolvedValue(
      mock<Task>({ id: "capture", status: "PENDING" })
    )
    fixture.taskSchedulingService.findVerifyAttendanceCompletionTask.mockResolvedValue(
      mock<Task>({ id: "completion", status: "PENDING" })
    )

    await fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, { registeredAt: null })

    expect(fixture.attendancePaymentService.cancel).toHaveBeenCalledExactlyOnceWith(fixture.handle, "payment")
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).toHaveBeenCalledWith(
      fixture.handle,
      fixture.attendee.id,
      null
    )
    expect(fixture.taskSchedulingService.cancel).toHaveBeenCalledWith(fixture.handle, "capture")
    expect(fixture.taskSchedulingService.cancel).toHaveBeenCalledWith(fixture.handle, "completion")
    expect(fixture.attendee.registeredAt).toBeNull()
  })

  it("keeps registration intact when payment cancellation fails", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "PAID")
    fixture.attendancePaymentService.cancel.mockRejectedValue(new Error("Captured payment must be refunded"))

    await expect(
      fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, { registeredAt: null })
    ).rejects.toThrow("must be refunded")

    expect(fixture.attendanceRepository.updateAttendeeById).not.toHaveBeenCalled()
    expect(fixture.attendanceRepository.updateAttendeeCompletionDeadline).not.toHaveBeenCalled()
  })

  it.each(["CANCELLED", "EXPIRED", "REFUNDED"] as const)("reopens payment on promotion after %s", async (status) => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), status)
    fixture.attendee.registeredAt = null
    fixture.payment.canStartCheckout = true
    fixture.attendance.pools = [mock<AttendancePool>({ id: fixture.attendee.attendancePoolId, capacity: 0 })]

    await fixture.attendanceService.executeReserveAttendeeTask(fixture.handle, {
      attendanceId: fixture.attendance.id,
      attendeeId: fixture.attendee.id,
    })

    expect(fixture.attendancePaymentService.prepareCheckout).toHaveBeenCalledOnce()
    expect(fixture.attendee.registeredAt).not.toBeNull()
  })

  it.each(["PAID", "WAIVED"] as const)("preserves a %s payment when promoting an attendee", async (status) => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), status)
    fixture.attendee.registeredAt = null

    const result = await fixture.attendanceService.updateAttendeeById(fixture.handle, fixture.attendee.id, {
      registeredAt: getCurrentUTC(),
    })

    expect(result.payment?.isRequirementSatisfied).toBe(true)
    expect(fixture.attendancePaymentService.prepareCheckout).not.toHaveBeenCalled()
  })

  it("rejects manual payment creation for an attendee still in the queue", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    fixture.attendee.registeredAt = null

    await expect(
      fixture.attendanceService.prepareAttendeePayment(
        fixture.handle,
        fixture.attendee.id,
        addHours(getCurrentUTC(), 24)
      )
    ).rejects.toThrow("still in the queue")

    expect(fixture.attendancePaymentService.prepareCheckout).not.toHaveBeenCalled()
  })

  it.each([null, 0])("cannot bypass active payment protection by changing the price to %s", async (price) => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    fixture.payment.canCancel = true

    await expect(
      fixture.attendanceService.updateAttendancePaymentPrice(fixture.handle, fixture.attendance.id, price)
    ).rejects.toThrow("active payment")

    expect(fixture.attendanceRepository.updateAttendancePaymentPrice).not.toHaveBeenCalled()
  })

  it("leaves payment creation to the organizer when changing a free event to paid", async () => {
    const fixture = createPaymentContext(addHours(getCurrentUTC(), 48), "UNPAID")
    fixture.attendance.attendancePrice = null
    fixture.attendee.payment = null

    await fixture.attendanceService.updateAttendancePaymentPrice(fixture.handle, fixture.attendance.id, 100)

    expect(fixture.attendanceRepository.updateAttendancePaymentPrice).toHaveBeenCalledWith(
      fixture.handle,
      fixture.attendance.id,
      100
    )
    expect(fixture.attendancePaymentService.prepareCheckout).not.toHaveBeenCalled()
  })
})
