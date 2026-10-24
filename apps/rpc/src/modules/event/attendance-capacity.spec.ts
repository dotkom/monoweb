import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { addDays, addHours, subHours } from "date-fns"
import { mock, mockDeep } from "vitest-mock-extended"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TaskSkippedError } from "../../error"
import type { TRPCContext } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import type { Configuration } from "../../configuration"
import type { EmailService } from "../email/email-service"
import { emails } from "../email/email-template"
import type { FeedbackFormAnswerService } from "../feedback-form/feedback-form-answer-service"
import type { FeedbackFormService } from "../feedback-form/feedback-form-service"
import type { MarkService } from "../mark/mark-service"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import type { PaymentProductsService } from "../payment/payment-products-service"
import type { PaymentService } from "../payment/payment-service"
import { type InferTaskData, type FinalizeAttendeeRegistrationTaskDefinition, tasks } from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { User } from "../user/user"
import type { UserService } from "../user/user-service"
import type { Attendance, AttendancePool, Attendee } from "./attendance"
import type { AttendanceRepository } from "./attendance-repository"
import { getAttendanceService } from "./attendance-service"
import type { Event } from "./event"
import type { EventService } from "./event-service"

const currentTime = new Date("2026-10-24T12:00:00Z")

function createAttendee(id: string, overrides: Partial<Attendee> = {}): Attendee {
  return mock<Attendee>({
    id,
    attendanceId: "attendance",
    attendancePoolId: "pool",
    userId: id,
    registeredAt: null,
    registrationPoolDelayHours: null,
    registrationMarkDelayHours: null,
    adminRegisteredByUserId: null,
    registrationEligibleAt: subHours(currentTime, 1),
    attendedAt: null,
    userGrade: 1,
    selections: [],
    completionDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentReservedAt: null,
    paymentChargedAt: null,
    paymentRefundedAt: null,
    paymentChargeDeadline: null,
    paymentRefundedByUserId: null,
    paymentCheckoutUrl: null,
    user: mock<User>({ id, name: id, email: `${id}@example.com` }),
    ...overrides,
  })
}

function createService(overrides: Partial<Attendance> = {}) {
  const handle = mockDeep<DBHandle>()
  const attendanceRepository = mockDeep<AttendanceRepository>()
  const taskSchedulingService = mockDeep<TaskSchedulingService>()
  const eventService = mockDeep<EventService>()
  const paymentService = mockDeep<PaymentService>()
  const emailService = mockDeep<EmailService>()
  emailService.send.mockResolvedValue(undefined)
  const eventEmitter = new EventEmitter()
  const pendingFinalizations: InferTaskData<FinalizeAttendeeRegistrationTaskDefinition>[] = []
  const pool = mock<AttendancePool>({
    id: "pool",
    attendanceId: "attendance",
    title: "Pool",
    capacity: 1,
    yearCriteria: [1, 2, 3, 4, 5],
    mergeDelayHours: null,
    taskId: null,
  })
  const attendance = mock<Attendance>({
    id: "attendance",
    registerStart: subHours(currentTime, 2),
    deregisterDeadline: addDays(currentTime, 2),
    attendancePrice: null,
    pools: [pool],
    attendees: [
      createAttendee("registered", { registeredAt: currentTime }),
      createAttendee("third", { registrationEligibleAt: subHours(currentTime, 1) }),
      createAttendee("first", { registrationEligibleAt: subHours(currentTime, 3) }),
      createAttendee("second", { registrationEligibleAt: subHours(currentTime, 2) }),
    ],
    ...overrides,
  })

  function getAttendanceSnapshot() {
    return {
      ...attendance,
      pools: attendance.pools.map((existingPool) => ({ ...existingPool })),
      attendees: attendance.attendees.map((attendee) => ({ ...attendee })),
    }
  }

  attendanceRepository.findAttendanceByPoolId.mockImplementation(async () => getAttendanceSnapshot())
  attendanceRepository.findAttendanceById.mockImplementation(async () => getAttendanceSnapshot())
  attendanceRepository.findAttendanceByAttendeeId.mockImplementation(async () => getAttendanceSnapshot())
  attendanceRepository.updateAttendancePoolById.mockImplementation(async (_handle, _poolId, taskId, data) => {
    Object.assign(pool, data, { taskId })
    return { ...pool }
  })
  attendanceRepository.updateAttendeeById.mockImplementation(async (_handle, attendeeId, data) => {
    const attendee = attendance.attendees.find((existingAttendee) => existingAttendee.id === attendeeId)

    if (attendee === undefined) {
      throw new Error(`Unknown attendee ${attendeeId}`)
    }

    Object.assign(attendee, data)
    return { ...attendee }
  })
  eventService.getByAttendanceId.mockResolvedValue(mock<Event>({ id: "event", title: "Event", hostingGroups: [] }))
  paymentService.create.mockResolvedValue({
    id: "payment",
    status: "UNPAID",
    url: "https://example.com/payment",
    paymentIntentId: null,
    checkoutUrl: null,
  })
  taskSchedulingService.scheduleManyAt.mockImplementation(async (_handle, _definition, data) => {
    for (const payload of data) {
      pendingFinalizations.push(tasks.FINALIZE_ATTENDEE_REGISTRATION.getSchema().parse(payload))
    }
  })
  attendanceRepository.registerAttendees.mockImplementation(async (_handle, attendeeIds, registeredAt) => {
    const promotedAttendees = attendance.attendees.filter((attendee) => {
      return attendeeIds.includes(attendee.id) && attendee.registeredAt === null
    })

    for (const attendee of promotedAttendees) {
      attendee.registeredAt = registeredAt
    }

    return promotedAttendees.map((attendee) => attendee.id)
  })
  const attendanceService = getAttendanceService(
    eventEmitter,
    attendanceRepository,
    taskSchedulingService,
    mockDeep<UserService>(),
    mockDeep<MarkService>(),
    mockDeep<PersonalMarkService>(),
    paymentService,
    mockDeep<PaymentProductsService>(),
    eventService,
    mockDeep<FeedbackFormService>(),
    mockDeep<FeedbackFormAnswerService>(),
    mock<Configuration>({ WEB_PUBLIC_ORIGIN: "https://example.com" }),
    emailService
  )

  async function runScheduledFinalizations() {
    for (const reservation of pendingFinalizations.splice(0)) {
      await attendanceService.executeFinalizeAttendeeRegistrationTask(handle, reservation)
    }
  }

  return {
    handle,
    attendance,
    pool,
    attendanceService,
    attendanceRepository,
    taskSchedulingService,
    paymentService,
    emailService,
    eventEmitter,
    runScheduledFinalizations,
    pendingFinalizations,
    eventService,
  }
}

describe("filling added event capacity from the queue", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(currentTime)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("claims all added seats in queue order before any background work runs", async () => {
    const {
      handle,
      pool,
      attendance,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      paymentService,
      emailService,
    } = createService({ attendancePrice: 100 })

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(
      handle,
      ["first", "second"],
      currentTime
    )
    expect(
      attendance.attendees.filter((attendee) => attendee.registeredAt !== null).map((attendee) => attendee.id)
    ).toEqual(["registered", "first", "second"])
    expect(taskSchedulingService.scheduleManyAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.FINALIZE_ATTENDEE_REGISTRATION,
      [
        { attendanceId: "attendance", attendeeId: "first", registeredAt: currentTime.toISOString() },
        { attendanceId: "attendance", attendeeId: "second", registeredAt: currentTime.toISOString() },
      ],
      currentTime
    )
    expect(taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
    expect(paymentService.create).not.toHaveBeenCalled()
    expect(emailService.send).not.toHaveBeenCalled()
    expect(result.registerChanges.map((change) => change.attendee.id)).toEqual(["first", "second"])
    expect(result.registerChanges.every((change) => change.poolOccupancies[0].registeredCount === 3)).toBe(true)
    expect(result.registerChanges[0].poolOccupancies[0]).toMatchObject({ capacity: 3, isPoolFull: true })
  })

  it.each([false, undefined])("leaves the queue unchanged when fillAddedSeats is %s", async (fillAddedSeats) => {
    const { handle, pool, attendanceService, attendanceRepository, taskSchedulingService } = createService()

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, fillAddedSeats)

    expect(attendanceRepository.registerAttendees).not.toHaveBeenCalled()
    expect(taskSchedulingService.scheduleManyAt).not.toHaveBeenCalled()
    expect(result.registerChanges).toEqual([])
  })

  it.each([
    [2, 2],
    [2, 1],
    [0, 2],
    [0, 0],
  ])("does not promote when capacity changes from %s to %s", async (previousCapacity, capacity) => {
    const { handle, pool, attendanceService, attendanceRepository } = createService()
    pool.capacity = previousCapacity

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity }, true)

    expect(attendanceRepository.registerAttendees).not.toHaveBeenCalled()
  })

  it("does not fill previously vacant seats", async () => {
    const { handle, pool, attendanceService, attendanceRepository } = createService()
    pool.capacity = 3

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 4 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(handle, ["first"], currentTime)
  })

  it("only promotes eligible attendees in the edited pool", async () => {
    const { handle, pool, attendance, attendanceService, attendanceRepository } = createService()
    attendance.attendees.unshift(
      createAttendee("other-pool", {
        attendancePoolId: "other-pool",
        registrationEligibleAt: subHours(currentTime, 5),
      }),
      createAttendee("delayed", { registrationEligibleAt: addHours(currentTime, 1) })
    )

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 10 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(
      handle,
      ["first", "second", "third"],
      currentTime
    )
  })

  it("respects existing admin registrations above capacity", async () => {
    const { handle, pool, attendance, attendanceService, attendanceRepository } = createService()
    attendance.attendees.push(createAttendee("extra", { registeredAt: currentTime }))

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(handle, ["first"], currentTime)
  })

  it("promotes the entire eligible queue when capacity becomes unlimited", async () => {
    const { handle, pool, attendanceService, attendanceRepository } = createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 0 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(
      handle,
      ["first", "second", "third"],
      currentTime
    )
  })

  it("starts the payment deadline at worker execution, preserving the earlier registration time", async () => {
    const {
      handle,
      pool,
      attendance,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      paymentService,
      emailService,
      eventEmitter,
      runScheduledFinalizations,
    } = createService({ attendancePrice: 100 })
    const registerChange = vi.fn()
    eventEmitter.on("attendance:register-change", registerChange)
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)

    const workerTime = addHours(currentTime, 1)
    vi.setSystemTime(workerTime)
    await runScheduledFinalizations()

    expect(attendance.attendees.find((attendee) => attendee.id === "first")?.registeredAt).toEqual(currentTime)
    expect(paymentService.create).toHaveBeenCalledWith(
      "attendance",
      expect.objectContaining({ id: "first" }),
      expect.objectContaining({ attendee_id: "first" }),
      "RESERVE"
    )
    expect(attendanceRepository.updateAttendeePaymentById).toHaveBeenCalledWith(
      handle,
      "first",
      expect.objectContaining({ paymentId: "payment", paymentLink: "https://example.com/payment" })
    )
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledWith(
      handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId: "first" },
      addHours(workerTime, 24)
    )
    expect(emailService.send).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.anything(),
      ["first@example.com"],
      [],
      [],
      expect.anything(),
      emails.EVENT_ATTENDANCE,
      expect.anything()
    )
    expect(registerChange.mock.lastCall?.[0].attendee.paymentId).toBe("payment")
  })

  it.each([
    { paymentId: "existing" },
    { paymentLink: "https://example.com/existing" },
    { paymentReservedAt: currentTime },
    { paymentChargedAt: currentTime },
    { paymentRefundedAt: currentTime },
  ])("preserves existing payment details %j", async (paymentDetails) => {
    const { handle, pool, attendanceService, paymentService, runScheduledFinalizations } = createService({
      attendancePrice: 100,
      attendees: [createAttendee("first", paymentDetails)],
    })

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)
    await runScheduledFinalizations()

    expect(paymentService.create).not.toHaveBeenCalled()
  })

  it.each(["removed", "queued", "replaced"])("skips follow-up work when the registration is %s", async (state) => {
    const { handle, pool, attendance, attendanceService, paymentService, emailService, runScheduledFinalizations } =
      createService({ attendancePrice: 100 })
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)
    const attendee = attendance.attendees.find((existingAttendee) => existingAttendee.id === "first")

    if (attendee === undefined) {
      throw new Error("Missing promoted attendee")
    }

    if (state === "removed") {
      attendance.attendees = attendance.attendees.filter((existingAttendee) => existingAttendee.id !== attendee.id)
    } else {
      attendee.registeredAt = state === "queued" ? null : addHours(currentTime, 1)
    }

    await expect(runScheduledFinalizations()).rejects.toThrow(TaskSkippedError)
    expect(paymentService.create).not.toHaveBeenCalled()
    expect(emailService.send).not.toHaveBeenCalled()
  })

  it("does not release bulk claims if payment setup fails", async () => {
    const { handle, pool, attendance, attendanceService, paymentService, emailService, runScheduledFinalizations } =
      createService({ attendancePrice: 100 })
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)
    paymentService.create.mockRejectedValue(new Error("Payment unavailable"))

    await expect(runScheduledFinalizations()).rejects.toThrow("Payment unavailable")
    expect(attendance.attendees.filter((attendee) => attendee.registeredAt !== null)).toHaveLength(3)
    expect(emailService.send).not.toHaveBeenCalled()
  })

  it.each([
    false,
    true,
  ])("publishes promotions only after a successful commit (commit fails: %s)", async (isCommitFailure) => {
    const { handle, pool, attendanceService, eventService, eventEmitter } = createService()
    handle.auditTransaction.create.mockResolvedValue(mock({ id: "audit" }))
    const registerChange = vi.fn()
    eventEmitter.on("attendance:register-change", registerChange)
    const context = {
      principal: { subject: "admin", affiliations: new Map(), scopes: new Set() },
      attendanceService,
      eventService,
      eventEmitter,
      addAuthorizationGuard: vi.fn(),
      prisma: {
        $transaction: async (callback: (transactionHandle: DBHandle) => Promise<unknown>) => {
          const result = await callback(handle)
          expect(registerChange).not.toHaveBeenCalled()

          if (isCommitFailure) {
            throw new Error("Commit failed")
          }

          return result
        },
      },
    } as unknown as TRPCContext
    const request = attendanceRouter
      .createCaller(context)
      .updatePool({ id: pool.id, input: { capacity: 3 }, fillAddedSeats: true })

    if (isCommitFailure) {
      await expect(request).rejects.toThrow("Commit failed")
      expect(registerChange).not.toHaveBeenCalled()
    } else {
      await expect(request).resolves.toMatchObject({ capacity: 3 })
      expect(registerChange).toHaveBeenCalledTimes(2)
      expect(registerChange.mock.calls.map(([change]) => change.poolOccupancies[0].registeredCount)).toEqual([3, 3])
    }
  })

  it.each([
    "registered",
    "removed",
  ])("skips someone %s by another request while claiming the remaining seats", async (state) => {
    const { handle, pool, attendance, attendanceService, attendanceRepository, pendingFinalizations } = createService()
    const concurrentRegistrationTime = subHours(currentTime, 1)
    const firstAttendee = attendance.attendees.find((attendee) => attendee.id === "first")

    if (firstAttendee === undefined) {
      throw new Error("Missing queued attendee")
    }

    attendanceRepository.updateAttendancePoolById.mockImplementationOnce(async (_handle, _poolId, taskId, data) => {
      Object.assign(pool, data, { taskId })

      if (state === "registered") {
        firstAttendee.registeredAt = concurrentRegistrationTime
      } else {
        attendance.attendees = attendance.attendees.filter((attendee) => attendee.id !== firstAttendee.id)
      }

      return { ...pool }
    })

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(
      handle,
      ["first", "second"],
      currentTime
    )
    expect(result.registerChanges.map((change) => change.attendee.id)).toEqual(["second"])
    expect(pendingFinalizations).toEqual([
      { attendanceId: "attendance", attendeeId: "second", registeredAt: currentTime.toISOString() },
    ])
    expect(result.registerChanges[0].poolOccupancies[0].registeredCount).toBe(state === "registered" ? 3 : 2)
    expect(firstAttendee.registeredAt).toEqual(state === "registered" ? concurrentRegistrationTime : null)
  })

  it("does not schedule or announce registrations when no selected attendees were claimed", async () => {
    const { handle, pool, attendanceService, attendanceRepository, taskSchedulingService } = createService()
    attendanceRepository.registerAttendees.mockResolvedValueOnce([])

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)

    expect(result.pool.capacity).toBe(3)
    expect(result.registerChanges).toEqual([])
    expect(taskSchedulingService.scheduleManyAt).not.toHaveBeenCalled()
  })

  it("preserves queue eligibility dates when recording the batch registration time", async () => {
    const { handle, pool, attendance, attendanceService } = createService()
    const queuedAttendees = attendance.attendees.filter((attendee) => attendee.registeredAt === null)
    const eligibilityDates = queuedAttendees.map((attendee) => attendee.registrationEligibleAt)
    const eligibilityDatesByAttendeeId = new Map(
      queuedAttendees.map((attendee) => [attendee.id, attendee.registrationEligibleAt])
    )

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 4 }, true)

    expect(queuedAttendees.map((attendee) => attendee.registrationEligibleAt)).toEqual(eligibilityDates)
    expect(queuedAttendees.every((attendee) => attendee.registeredAt?.getTime() === currentTime.getTime())).toBe(true)

    for (const { attendee } of result.registerChanges) {
      expect(attendee.registrationEligibleAt).toEqual(eligibilityDatesByAttendeeId.get(attendee.id))
    }
  })

  it("claims 50 seats with one bulk update and one batch of follow-up tasks", async () => {
    const queuedAttendees = Array.from({ length: 50 }, (_, index) => createAttendee(`queued-${index}`))
    const { handle, pool, attendanceService, attendanceRepository, taskSchedulingService } = createService({
      attendees: [createAttendee("registered", { registeredAt: currentTime }), ...queuedAttendees],
    })

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 51 }, true)

    expect(attendanceRepository.registerAttendees).toHaveBeenCalledExactlyOnceWith(
      handle,
      queuedAttendees.map((attendee) => attendee.id),
      currentTime
    )
    expect(taskSchedulingService.scheduleManyAt).toHaveBeenCalledTimes(1)
    expect(taskSchedulingService.scheduleManyAt.mock.calls[0][2]).toHaveLength(50)
    expect(result.registerChanges).toHaveLength(50)
    expect(result.registerChanges.every((change) => change.poolOccupancies[0].registeredCount === 51)).toBe(true)
  })

  it("claims successive seats across capacity increases before the worker runs", async () => {
    const { handle, pool, attendanceService, attendanceRepository } = createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)

    expect(attendanceRepository.registerAttendees.mock.calls.map(([, attendeeIds]) => attendeeIds)).toEqual([
      ["first"],
      ["second"],
    ])
  })

  it("does not enqueue follow-up work when no eligible attendees exist", async () => {
    const { handle, pool, attendanceService, attendanceRepository, taskSchedulingService } = createService({
      attendees: [createAttendee("delayed", { registrationEligibleAt: addHours(currentTime, 1) })],
    })

    const result = await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 3 }, true)

    expect(attendanceRepository.registerAttendees).not.toHaveBeenCalled()
    expect(taskSchedulingService.scheduleManyAt).not.toHaveBeenCalled()
    expect(result.registerChanges).toEqual([])
  })

  it("ignores old reservation jobs for attendees whose seats were already claimed", async () => {
    const { handle, pool, attendanceService, emailService } = createService()
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)

    await attendanceService.executeReserveAttendeeTask(handle, { attendanceId: "attendance", attendeeId: "first" })

    expect(emailService.send).not.toHaveBeenCalled()
  })

  it("completes registration and publishes payment details while the confirmation email is pending", async () => {
    const { handle, pool, attendanceService, emailService, eventEmitter, runScheduledFinalizations } = createService({
      attendancePrice: 100,
    })
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)
    const pendingEmail = Promise.withResolvers<void>()
    emailService.send.mockReturnValueOnce(pendingEmail.promise)
    const registerChange = vi.fn()
    eventEmitter.on("attendance:register-change", registerChange)
    const finalization = runScheduledFinalizations()

    try {
      await vi.waitFor(
        () => {
          expect(registerChange).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
              attendee: expect.objectContaining({ paymentId: "payment", paymentLink: "https://example.com/payment" }),
            })
          )
        },
        { timeout: 100 }
      )
      await expect(finalization).resolves.toBeUndefined()
    } finally {
      pendingEmail.resolve()
      await finalization
    }
  })

  it("completes registration when the confirmation email cannot be queued", async () => {
    const { handle, pool, attendanceService, emailService, eventEmitter, runScheduledFinalizations } = createService()
    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)
    emailService.send.mockRejectedValueOnce(new Error("Email unavailable"))
    const registerChange = vi.fn()
    eventEmitter.on("attendance:register-change", registerChange)

    await expect(runScheduledFinalizations()).resolves.toBeUndefined()

    expect(registerChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ attendee: expect.objectContaining({ id: "first", registeredAt: currentTime }) })
    )
  })

  it("starts payment for a refunded attendee who still has a payment completion requirement", async () => {
    const { handle, pool, attendanceService, paymentService, runScheduledFinalizations } = createService({
      attendancePrice: 100,
      attendees: [
        createAttendee("first", {
          paymentRefundedAt: subHours(currentTime, 1),
          completionDeadline: addHours(currentTime, 1),
        }),
      ],
    })

    await attendanceService.updateAttendancePool(handle, pool.id, { capacity: 2 }, true)
    await runScheduledFinalizations()

    expect(paymentService.create).toHaveBeenCalledTimes(1)
  })
})
