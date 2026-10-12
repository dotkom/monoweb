import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { Configuration } from "../../configuration"
import { ResourceExhaustedError } from "../../error"
import type { EmailService } from "../email/email-service"
import type { FeedbackFormAnswerService } from "../feedback-form/feedback-form-answer-service"
import type { FeedbackFormService } from "../feedback-form/feedback-form-service"
import type { MarkService } from "../mark/mark-service"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import type { PaymentProductsService } from "../payment/payment-products-service"
import type { Payment, PaymentService } from "../payment/payment-service"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { User } from "../user/user"
import type { UserService } from "../user/user-service"
import type { Attendance, AttendancePool, Attendee, RegisterChangeEvent } from "./attendance"
import type { AttendanceRepository } from "./attendance-repository"
import { buildDeregistrationAvailabilityView, getAttendanceService } from "./attendance-service"
import type { Event } from "./event"
import type { EventService } from "./event-service"

function createPayment(status: Payment["status"]): Payment {
  const payment = { id: "payment-one", url: "https://example.com/payment" }

  if (status === "UNPAID" || status === "CANCELLED") {
    return { ...payment, status, paymentIntentId: null, checkoutUrl: null }
  }

  return { ...payment, status, paymentIntentId: "intent-one", checkoutUrl: "https://example.com/checkout" }
}

function createService() {
  const handle = mock<DBHandle>()
  const eventEmitter = new EventEmitter()
  const onUpdate = vi.fn<(update: RegisterChangeEvent) => void>()

  eventEmitter.on("attendance:register-change", onUpdate)

  const repository = mock<AttendanceRepository>()
  const tasks = mock<TaskSchedulingService>()
  const payments = mock<PaymentService>()
  const events = mock<EventService>()

  const now = new Date()
  const completionDeadline = new Date(now.getTime() + 60 * 60 * 1000)
  const deregisterDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const user: User = {
    id: "user-one",
    username: "user-one",
    name: "Test User",
    email: "test@example.com",
    imageUrl: null,
    biography: null,
    phone: null,
    gender: "UNKNOWN",
    dietaryRestrictions: null,
    ntnuUsername: null,
    flags: [],
    workspaceUserId: null,
    createdAt: now,
    updatedAt: now,
    privacyPermissionsId: null,
    notificationPermissionsId: null,
    memberships: [],
  }

  let attendee: Attendee = {
    id: "attendee-one",
    userId: "user-one",
    attendanceId: "attendance-one",
    attendancePoolId: "pool-one",
    registered: true,
    createdAt: now,
    updatedAt: now,
    earliestReservationAt: now,
    attendedAt: null,
    userGrade: 1,
    selections: [],
    completionDeadline,
    paymentId: "payment-one",
    paymentLink: "https://example.com/payment",
    paymentCheckoutUrl: null,
    paymentReservedAt: null,
    paymentChargedAt: null,
    paymentRefundedAt: null,
    paymentRefundedById: null,
    paymentChargeDeadline: null,
    user,
  }

  const pool: AttendancePool = {
    id: attendee.attendancePoolId,
    attendanceId: attendee.attendanceId,
    title: "Pool",
    capacity: 10,
    mergeDelayHours: null,
    yearCriteria: [],
    taskId: null,
    createdAt: now,
    updatedAt: now,
  }

  const attendance: Attendance = {
    id: attendee.attendanceId,
    attendancePrice: 100,
    deregisterDeadline,
    registerStart: now,
    registerEnd: completionDeadline,
    createdAt: now,
    updatedAt: now,
    selections: [],
    pools: [pool],
    attendees: [attendee],
  }

  repository.findAttendanceByAttendeeId.mockResolvedValue(attendance)

  repository.updateAttendeePaymentById.mockImplementation(async (_, __, data) => {
    attendee = { ...attendee, ...data }

    return attendee
  })

  repository.updateAttendeeCompletionDeadline.mockImplementation(async (_, __, deadline) => {
    attendee = { ...attendee, completionDeadline: deadline }

    return attendee
  })

  tasks.findVerifyAttendanceCompletionTask.mockResolvedValue(null)
  events.getByAttendanceId.mockResolvedValue(mock<Event>())

  const service = getAttendanceService(
    eventEmitter,
    repository,
    tasks,
    mock<UserService>(),
    mock<MarkService>(),
    mock<PersonalMarkService>(),
    payments,
    mock<PaymentProductsService>(),
    events,
    mock<FeedbackFormService>(),
    mock<FeedbackFormAnswerService>(),
    mock<Configuration>(),
    mock<EmailService>()
  )

  return { service, handle, repository, payments, onUpdate, attendance, completionDeadline }
}

const paymentStatuses = ["RESERVED", "PAID", "REFUNDED", "CANCELLED", "UNPAID"] as const

describe("attendance payment updates", () => {
  it.each(
    paymentStatuses
  )("publishes the final attendee after syncing a %s payment without changing occupancy", async (status) => {
    const { service, handle, payments, onUpdate, attendance, completionDeadline } = createService()

    payments.getById.mockResolvedValue(createPayment(status))

    await service.syncAttendeePayment(handle, "attendee-one")

    expect(onUpdate).toHaveBeenCalledOnce()

    const update = onUpdate.mock.calls[0][0]
    const updatedAttendee = update.attendee

    const isUnpaid = status === "UNPAID"
    const isCancelled = status === "CANCELLED"
    const isPaid = status === "PAID"
    const isReserved = status === "RESERVED"
    const isRefunded = status === "REFUNDED"

    const expectedCompletionDeadline = isUnpaid ? completionDeadline : null
    const expectedPaymentId = isUnpaid || isCancelled ? null : "payment-one"
    const expectedPaymentReservation = isReserved || isPaid

    expect(update.status).toBe("updated")
    expect(updatedAttendee.completionDeadline).toEqual(expectedCompletionDeadline)
    expect(updatedAttendee.paymentId).toBe(expectedPaymentId)

    expect(updatedAttendee.paymentReservedAt !== null).toBe(expectedPaymentReservation)
    expect(updatedAttendee.paymentChargedAt !== null).toBe(isPaid)
    expect(updatedAttendee.paymentRefundedAt !== null).toBe(isRefunded)

    expect(update.poolOccupancies).toEqual([
      { poolId: "pool-one", registeredCount: 1, capacity: 10, isPoolFull: false },
    ])

    const availability = buildDeregistrationAvailabilityView("user-one", updatedAttendee, attendance, null)

    expect(availability.deregistration?.canDeregister).toBe(!isPaid)
  })

  it.each([false, true])("publishes a charge update when already charged is %s", async (alreadyCharged) => {
    const { service, handle, payments, onUpdate } = createService()

    payments.getById.mockResolvedValue(createPayment("RESERVED"))

    if (alreadyCharged) {
      payments.charge.mockRejectedValue(new ResourceExhaustedError("Already charged"))
    }

    await service.createAttendeePaymentCharge(handle, "attendee-one")

    expect(onUpdate).toHaveBeenCalledOnce()

    const update = onUpdate.mock.calls[0][0]

    expect(update.status).toBe("updated")
    expect(update.attendee.paymentChargedAt).toEqual(expect.any(Date))
  })

  it.each(["RESERVED", "PAID"] as const)("publishes cancellation or refund of a %s payment", async (status) => {
    const { service, handle, payments, onUpdate } = createService()

    payments.getById.mockResolvedValue(createPayment(status))

    await service.cancelAttendeePayment(handle, "attendee-one", "admin-one")

    const expectedPaymentAction = status === "PAID" ? payments.refund : payments.cancel

    expect(expectedPaymentAction).toHaveBeenCalledWith("payment-one")
    expect(onUpdate).toHaveBeenCalledOnce()

    const update = onUpdate.mock.calls[0][0]
    const updatedAttendee = update.attendee

    expect(update.status).toBe("updated")
    expect(updatedAttendee.paymentId).toBeNull()
    expect(updatedAttendee.paymentChargedAt).toBeNull()
    expect(updatedAttendee.paymentReservedAt).toBeNull()
    expect(updatedAttendee.paymentRefundedById).toBe("admin-one")
    expect(updatedAttendee.completionDeadline).toBeNull()
  })

  it.each(["RESERVED", "PAID"] as const)("publishes payment completed by the deadline task (%s)", async (status) => {
    const { service, handle, payments, onUpdate } = createService()

    payments.getById.mockResolvedValue(createPayment(status))

    await service.executeVerifyAttendanceCompletionTask(handle, { attendeeId: "attendee-one" })

    expect(onUpdate).toHaveBeenCalledOnce()

    const update = onUpdate.mock.calls[0][0]
    const updatedAttendee = update.attendee
    const expectedPaymentChargedAt = status === "PAID" ? expect.any(Date) : null

    expect(update.status).toBe("updated")
    expect(updatedAttendee.paymentReservedAt).toEqual(expect.any(Date))
    expect(updatedAttendee.paymentChargedAt).toEqual(expectedPaymentChargedAt)
    expect(updatedAttendee.paymentLink).toBeNull()
    expect(updatedAttendee.completionDeadline).toBeNull()
  })

  it("does not publish when updating payment data fails", async () => {
    const { service, handle, repository, payments, onUpdate } = createService()

    payments.getById.mockResolvedValue(createPayment("PAID"))
    repository.updateAttendeePaymentById.mockRejectedValue(new Error("Write failed"))

    await expect(service.syncAttendeePayment(handle, "attendee-one")).rejects.toThrow("Write failed")
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
