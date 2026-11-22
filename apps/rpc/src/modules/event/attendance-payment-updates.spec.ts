import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { addHours } from "date-fns"
import { describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { PaymentView } from "../payment/payment"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { User } from "../user/user"
import type { Attendance, AttendancePool, Attendee, RegisterChangeEvent } from "./attendance"
import type { AttendancePaymentService } from "./attendance-payment-service"
import type { AttendanceRepository } from "./attendance-repository"
import { buildDeregistrationAvailabilityView, getAttendanceService } from "./attendance-service"
import type { Event } from "./event"
import type { EventService } from "./event-service"

function createPayment(status: PaymentView["status"]): PaymentView {
  return mock<PaymentView>({
    id: "payment-one",
    status,
    attemptId: "attempt-one",
    isRequirementSatisfied: status === "AUTHORIZED" || status === "PAID",
    canCancel: status === "AUTHORIZED",
    canRefund: status === "PAID",
    captureScheduledAt: null,
  })
}

function createService(isCompletionOverdue = false) {
  const handle = mock<DBHandle>()
  const eventEmitter = new EventEmitter()
  const onUpdate = vi.fn<(update: RegisterChangeEvent) => void>()
  eventEmitter.on("attendance:register-change", onUpdate)

  const repository = mock<AttendanceRepository>()
  const tasks = mock<TaskSchedulingService>()
  const payments = mock<AttendancePaymentService>()
  const events = mock<EventService>()
  const now = new Date()
  const completionDeadline = addHours(now, isCompletionOverdue ? -1 : 1)
  const deregisterDeadline = addHours(now, 24)

  const attendee: Attendee = {
    id: "attendee-one",
    userId: "user-one",
    attendanceId: "attendance-one",
    attendancePoolId: "pool-one",
    registeredAt: now,
    registrationEligibleAt: now,
    registrationPoolDelayHours: null,
    registrationMarkDelayHours: null,
    adminRegisteredByUserId: null,
    attendedAt: null,
    createdAt: now,
    updatedAt: now,
    userGrade: 1,
    selections: [],
    completionDeadline,
    payment: createPayment("UNPAID"),
    user: mock<User>({ id: "user-one" }),
  }
  const pool: AttendancePool = {
    id: attendee.attendancePoolId,
    attendanceId: attendee.attendanceId,
    capacity: 10,
    title: "Pool",
    yearCriteria: [],
    mergeDelayHours: null,
    taskId: null,
    createdAt: now,
    updatedAt: now,
  }
  const attendance: Attendance = {
    id: attendee.attendanceId,
    attendancePrice: 100,
    deregisterDeadline,
    registerStart: addHours(now, -2),
    registerEnd: deregisterDeadline,
    createdAt: now,
    updatedAt: now,
    selections: [],
    pools: [pool],
    attendees: [attendee],
  }

  repository.findAttendanceByAttendeeId.mockResolvedValue(attendance)
  repository.findAttendeeById.mockImplementation(async () => ({ ...attendee }))
  repository.updateAttendeeCompletionDeadline.mockImplementation(async (_handle, _attendeeId, deadline) => {
    attendee.completionDeadline = deadline

    return attendee
  })

  payments.syncPayment.mockImplementation(async () => attendee.payment ?? createPayment("UNPAID"))
  payments.capture.mockImplementation(async () => {
    attendee.payment = createPayment("PAID")
  })
  payments.cancel.mockImplementation(async () => {
    attendee.payment = createPayment("CANCELLED")
  })
  payments.refund.mockImplementation(async () => {
    attendee.payment = createPayment("REFUNDED")
  })

  tasks.findVerifyAttendanceCompletionTask.mockResolvedValue(null)
  tasks.findChargeAttendeeTask.mockResolvedValue(null)
  events.getByAttendanceId.mockResolvedValue(mock<Event>())

  const service = getAttendanceService(
    eventEmitter,
    repository,
    tasks,
    mock(),
    mock(),
    mock(),
    payments,
    events,
    mock(),
    mock(),
    mock(),
    mock()
  )

  return { service, handle, repository, payments, onUpdate, attendance, attendee, completionDeadline }
}

const paymentStatuses = ["AUTHORIZED", "PAID", "REFUNDED", "CANCELLED", "UNPAID"] as const

describe("attendance payment updates", () => {
  it.each(
    paymentStatuses
  )("publishes the final attendee after syncing a %s payment without changing occupancy", async (status) => {
    const { service, handle, payments, onUpdate, attendance, attendee, completionDeadline } = createService()
    const payment = createPayment(status)
    payments.syncPayment.mockImplementation(async () => {
      attendee.payment = payment

      return payment
    })

    await service.syncAttendeePayment(handle, attendee.id)

    expect(onUpdate).toHaveBeenCalledOnce()

    const update = onUpdate.mock.calls[0][0]
    const isPaid = status === "PAID"
    const expectedCompletionDeadline = status === "AUTHORIZED" || isPaid ? null : completionDeadline

    expect(update.status).toBe("updated")
    expect(update.attendee.completionDeadline).toBe(expectedCompletionDeadline)
    expect(update.attendee.payment).toBe(payment)
    expect(update.poolOccupancies).toEqual([
      { poolId: "pool-one", registeredCount: 1, capacity: 10, isPoolFull: false },
    ])

    const availability = buildDeregistrationAvailabilityView(attendee.userId, update.attendee, attendance, null)

    expect(availability.deregistration?.canDeregister).toBe(isPaid === false)
  })

  it.each([false, true])("publishes a charge update when already charged is %s", async (isAlreadyCharged) => {
    const { service, handle, payments, onUpdate, attendee } = createService()
    attendee.payment = createPayment(isAlreadyCharged ? "PAID" : "AUTHORIZED")

    await service.createAttendeePaymentCharge(handle, attendee.id)

    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        status: "updated",
        attendee: expect.objectContaining({ payment: expect.objectContaining({ status: "PAID" }) }),
      })
    )
    expect(payments.capture).toHaveBeenCalledTimes(isAlreadyCharged ? 0 : 1)
  })

  it.each(["AUTHORIZED", "PAID"] as const)("publishes cancellation or refund of a %s payment", async (status) => {
    const { service, handle, payments, onUpdate, attendee } = createService()
    attendee.payment = createPayment(status)

    await service.cancelAttendeePayment(handle, attendee.id, "admin-one")

    if (status === "PAID") {
      expect(payments.refund).toHaveBeenCalledWith(handle, "payment-one", "admin-one")
    } else {
      expect(payments.cancel).toHaveBeenCalledWith(handle, "payment-one")
    }

    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        status: "updated",
        attendee: expect.objectContaining({
          payment: expect.objectContaining({ status: status === "PAID" ? "REFUNDED" : "CANCELLED" }),
          completionDeadline: null,
        }),
      })
    )
  })

  it.each(["AUTHORIZED", "PAID"] as const)("publishes payment completed by the deadline task (%s)", async (status) => {
    const { service, handle, attendee, onUpdate } = createService(true)
    attendee.payment = createPayment(status)

    await service.executeVerifyAttendanceCompletionTask(handle, { attendeeId: attendee.id })

    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        status: "updated",
        attendee: expect.objectContaining({
          payment: expect.objectContaining({ status }),
          completionDeadline: null,
        }),
      })
    )
  })

  it("does not publish when updating the completion deadline fails", async () => {
    const { service, handle, repository, attendee, onUpdate } = createService()
    attendee.payment = createPayment("PAID")
    repository.updateAttendeeCompletionDeadline.mockRejectedValue(new Error("Write failed"))

    await expect(service.syncAttendeePayment(handle, attendee.id)).rejects.toThrow("Write failed")
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
