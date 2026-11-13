import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it } from "vitest"
import { mock } from "vitest-mock-extended"
import type { PaymentRecord } from "../payment/payment"
import type { PaymentLedgerService } from "../payment/payment-ledger-service"
import type { PaymentRepository } from "../payment/payment-repository"
import { type AttendanceCheckoutInput, getAttendancePaymentService } from "./attendance-payment-service"

function createFixture() {
  const handle = mock<DBHandle>()
  const paymentRepository = mock<PaymentRepository>()
  const paymentLedgerService = mock<PaymentLedgerService>()
  const service = getAttendancePaymentService(paymentRepository, paymentLedgerService)
  const payment: PaymentRecord = {
    id: "payment",
    createdAt: new Date(),
    updatedAt: new Date(),
    description: "Original ticket",
    amountOre: 15000,
    userId: "user",
    attendeeId: "attendee",
    eventId: "event",
    waivedAt: null,
    waivedByUserId: null,
    waiverReason: null,
    attempts: [],
  }
  const input: AttendanceCheckoutInput = {
    attendance: { attendancePrice: 150 },
    attendee: { id: "attendee", userId: "user" },
    event: { id: "event", title: "Original ticket" },
    returnUrl: "https://online.ntnu.no/arrangementer/event",
    customerEmail: "user@example.com",
    captureMode: "MANUAL",
    captureScheduledAt: new Date("2026-11-13T10:00:00Z"),
  }

  paymentRepository.findByAttendeeId.mockResolvedValue(null)
  paymentLedgerService.create.mockResolvedValue(payment)
  paymentLedgerService.startCheckout.mockResolvedValue(payment)
  paymentLedgerService.getById.mockResolvedValue(payment)

  return { handle, paymentRepository, paymentLedgerService, service, payment, input }
}

describe("attendance payment service", () => {
  it("snapshots the attendee, event and NOK amount when creating the payment requirement", async () => {
    const { handle, paymentLedgerService, service, input } = createFixture()

    const payment = await service.startCheckout(handle, input)

    expect(paymentLedgerService.create).toHaveBeenCalledExactlyOnceWith(handle, {
      attendeeId: "attendee",
      eventId: "event",
      userId: "user",
      description: "Original ticket",
      amountOre: 15000,
    })
    expect(paymentLedgerService.startCheckout).toHaveBeenCalledExactlyOnceWith(handle, "payment", {
      returnUrl: input.returnUrl,
      customerEmail: input.customerEmail,
      captureMode: "MANUAL",
      captureScheduledAt: input.captureScheduledAt,
    })
    expect(payment.amountOre).toBe(15000)
    expect(payment.isRequirementSatisfied).toBe(false)
  })

  it("reuses the original payment requirement after the event price changes", async () => {
    const { handle, paymentRepository, paymentLedgerService, service, payment, input } = createFixture()
    paymentRepository.findByAttendeeId.mockResolvedValue(payment)
    input.attendance.attendancePrice = 200
    input.event.title = "Renamed event"

    const checkout = await service.startCheckout(handle, input)

    expect(paymentLedgerService.create).not.toHaveBeenCalled()
    expect(paymentLedgerService.startCheckout).toHaveBeenCalledWith(handle, payment.id, expect.anything())
    expect(checkout.amountOre).toBe(15000)
    expect(checkout.description).toBe("Original ticket")
  })

  it("reconciles a checkout before waiving it so a newly processing payment cannot be cancelled", async () => {
    const { handle, paymentLedgerService, service, payment } = createFixture()
    const attempt = {
      id: "attempt",
      paymentId: payment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "CHECKOUT_OPEN" as const,
      captureMode: "AUTOMATIC" as const,
      stripeCheckoutSessionId: "session",
      stripePaymentIntentId: "intent",
      checkoutUrl: "https://checkout.stripe.com/session",
      checkoutExpiresAt: null,
      captureScheduledAt: null,
      authorizationExpiresAt: null,
      authorizedAt: null,
      capturedAt: null,
      lastSyncedAt: null,
      refunds: [],
    }
    payment.attempts = [attempt]
    paymentLedgerService.syncAttempt.mockResolvedValue({
      ...payment,
      attempts: [{ ...attempt, status: "PROCESSING" }],
    })
    paymentLedgerService.waive.mockRejectedValue(new Error("Cannot waive an active payment"))

    await expect(service.waive(handle, payment.id, "organizer", null)).rejects.toThrow("Cannot waive an active payment")

    expect(paymentLedgerService.syncAttempt).toHaveBeenCalledExactlyOnceWith(handle, attempt.id)
    expect(paymentLedgerService.cancel).not.toHaveBeenCalled()
  })
})
