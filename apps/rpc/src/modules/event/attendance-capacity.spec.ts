import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { addDays, addHours, subHours } from "date-fns"
import { mock, mockDeep } from "vitest-mock-extended"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Configuration } from "../../configuration"
import type { EmailService } from "../email/email-service"
import { emails } from "../email/email-template"
import type { FeedbackFormAnswerService } from "../feedback-form/feedback-form-answer-service"
import type { FeedbackFormService } from "../feedback-form/feedback-form-service"
import type { MarkService } from "../mark/mark-service"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import type { PaymentProductsService } from "../payment/payment-products-service"
import type { PaymentService } from "../payment/payment-service"
import { type InferTaskData, type ReserveAttendeeTaskDefinition, tasks } from "../task/task-definition"
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
    registered: false,
    earliestReservationAt: subHours(currentTime, 1),
    attendedAt: null,
    userGrade: 1,
    selections: [],
    completionDeadline: null,
    paymentId: null,
    paymentLink: null,
    paymentReservedAt: null,
    paymentChargedAt: null,
    paymentRefundedAt: null,
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
  const eventEmitter = new EventEmitter()
  const pendingReservations: InferTaskData<ReserveAttendeeTaskDefinition>[] = []
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
      createAttendee("registered", { registered: true }),
      createAttendee("third", { earliestReservationAt: subHours(currentTime, 1) }),
      createAttendee("first", { earliestReservationAt: subHours(currentTime, 3) }),
      createAttendee("second", { earliestReservationAt: subHours(currentTime, 2) }),
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
  taskSchedulingService.scheduleAt.mockImplementation(async (_handle, definition, data) => {
    if (definition.type === tasks.RESERVE_ATTENDEE.type) {
      pendingReservations.push(tasks.RESERVE_ATTENDEE.getSchema().parse(data))
    }

    return `task-${pendingReservations.length}`
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

  async function runScheduledReservations() {
    for (const reservation of pendingReservations.splice(0)) {
      await attendanceService.executeReserveAttendeeTask(handle, reservation)
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
    runScheduledReservations,
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

  it("persists reservation jobs without waiting for promotions, payments, or emails", async () => {
    const {
      handle,
      pool,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      paymentService,
      emailService,
    } = createService({ attendancePrice: 100 })
    const executeReservation = vi.spyOn(attendanceService, "executeReserveAttendeeTask")

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)

    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledTimes(2)
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledWith(
      handle,
      tasks.RESERVE_ATTENDEE,
      { attendanceId: "attendance", attendancePoolId: "pool" },
      currentTime
    )
    expect(executeReservation).not.toHaveBeenCalled()
    expect(attendanceRepository.updateAttendeeById).not.toHaveBeenCalled()
    expect(paymentService.create).not.toHaveBeenCalled()
    expect(emailService.send).not.toHaveBeenCalled()
  })

  it("promotes only the added seats in queue order, emails attendees, and publishes updated occupancies", async () => {
    const {
      handle,
      pool,
      attendanceService,
      attendanceRepository,
      emailService,
      eventEmitter,
      runScheduledReservations,
    } = createService()
    const registerChange = vi.fn()
    eventEmitter.on("attendance:register-change", registerChange)

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual([
      "first",
      "second",
    ])
    expect(emailService.send).toHaveBeenCalledTimes(2)
    expect(emailService.send.mock.calls.map(([, , recipients]) => recipients)).toEqual([
      ["first@example.com"],
      ["second@example.com"],
    ])
    expect(emailService.send.mock.calls.every((call) => call[6] === emails.EVENT_ATTENDANCE)).toBe(true)
    expect(registerChange.mock.calls.map(([change]) => change.poolOccupancies[0].registeredCount)).toEqual([2, 3])
    expect(registerChange.mock.lastCall?.[0].poolOccupancies[0]).toMatchObject({ capacity: 3, isPoolFull: true })
  })

  it.each([false, undefined])("leaves the queue unchanged when the toggle is %s", async (fillAddedSeats) => {
    const { handle, pool, attendanceService, attendanceRepository, taskSchedulingService, emailService } =
      createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, fillAddedSeats)

    expect(attendanceRepository.updateAttendeeById).not.toHaveBeenCalled()
    expect(taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
    expect(emailService.send).not.toHaveBeenCalled()
  })

  it.each([
    [2, 2],
    [2, 1],
    [0, 2],
    [0, 0],
  ])("does not promote when capacity changes from %s to %s", async (previousCapacity, capacity) => {
    const { handle, pool, attendanceService, attendanceRepository, taskSchedulingService } = createService()
    pool.capacity = previousCapacity

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity }, true)

    expect(attendanceRepository.updateAttendeeById).not.toHaveBeenCalled()
    expect(taskSchedulingService.scheduleAt).not.toHaveBeenCalled()
  })

  it("does not fill previously vacant seats", async () => {
    const { handle, pool, attendanceService, attendanceRepository, runScheduledReservations } = createService()
    pool.capacity = 3

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 4 }, true)
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual(["first"])
  })

  it("only promotes eligible attendees in the edited pool", async () => {
    const { handle, attendance, pool, attendanceService, attendanceRepository, runScheduledReservations } =
      createService()
    attendance.attendees.unshift(
      createAttendee("other-pool", { attendancePoolId: "other-pool", earliestReservationAt: subHours(currentTime, 5) }),
      createAttendee("delayed", { earliestReservationAt: addHours(currentTime, 1) })
    )

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 10 }, true)
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual([
      "first",
      "second",
      "third",
    ])
  })

  it("respects capacity when a pool already has extra admin registrations", async () => {
    const {
      handle,
      attendance,
      pool,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      runScheduledReservations,
    } = createService()
    attendance.attendees.push(createAttendee("extra", { registered: true }))

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledTimes(1)
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual(["first"])
  })

  it("promotes the entire eligible queue when capacity becomes unlimited", async () => {
    const { handle, pool, attendanceService, attendanceRepository, runScheduledReservations } = createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 0 }, true)
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual([
      "first",
      "second",
      "third",
    ])
  })

  it("creates payment details and a 24-hour completion deadline for promoted attendees at paid events", async () => {
    const {
      handle,
      pool,
      attendanceService,
      attendanceRepository,
      taskSchedulingService,
      paymentService,
      emailService,
      runScheduledReservations,
    } = createService({ attendancePrice: 100 })

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 2 }, true)
    await runScheduledReservations()

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
      addHours(currentTime, 24)
    )
    expect(emailService.send).toHaveBeenCalledTimes(1)
  })

  it("fills successive seats when capacity is increased again before the worker runs", async () => {
    const { handle, pool, attendanceService, attendanceRepository, runScheduledReservations } = createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 2 }, true)
    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual([
      "first",
      "second",
    ])
  })

  it("takes the next queued attendee if someone leaves before the worker runs", async () => {
    const { handle, attendance, pool, attendanceService, attendanceRepository, runScheduledReservations } =
      createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)
    attendance.attendees = attendance.attendees.filter((attendee) => attendee.id !== "first")
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual([
      "second",
      "third",
    ])
  })

  it("rechecks capacity when the worker runs", async () => {
    const { handle, pool, attendanceService, attendanceRepository, emailService, runScheduledReservations } =
      createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)
    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 1 })
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById).not.toHaveBeenCalled()
    expect(emailService.send).not.toHaveBeenCalled()
  })

  it("skips pool reservations when the queue is empty by the time the worker runs", async () => {
    const {
      handle,
      attendance,
      pool,
      attendanceService,
      attendanceRepository,
      emailService,
      runScheduledReservations,
    } = createService()

    await attendanceService.updateAttendancePool(handle, pool.id, { ...pool, capacity: 3 }, true)
    attendance.attendees = []
    await runScheduledReservations()

    expect(attendanceRepository.updateAttendeeById).not.toHaveBeenCalled()
    expect(emailService.send).not.toHaveBeenCalled()
  })

  it("continues to support existing attendee-specific reservation jobs", async () => {
    const { handle, pool, attendanceService, attendanceRepository } = createService()
    pool.capacity = 2
    const reservation = tasks.RESERVE_ATTENDEE.getSchema().parse({ attendanceId: "attendance", attendeeId: "second" })

    await attendanceService.executeReserveAttendeeTask(handle, reservation)

    expect(attendanceRepository.updateAttendeeById.mock.calls.map(([, attendeeId]) => attendeeId)).toEqual(["second"])
  })
})
