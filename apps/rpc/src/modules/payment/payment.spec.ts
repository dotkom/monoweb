import { describe, expect, it } from "vitest"
import { buildPaymentView, type PaymentRecord } from "./payment"

const now = new Date("2026-11-08T10:00:00Z")

function createPayment(): PaymentRecord {
  return {
    id: "payment",
    description: "Event ticket",
    amountOre: 15000,
    userId: "user",
    attendeeId: null,
    eventId: null,
    waivedAt: null,
    waivedByUserId: null,
    waiverReason: null,
    createdAt: now,
    updatedAt: now,
    attempts: [
      {
        id: "attempt",
        paymentId: "payment",
        status: "CHECKOUT_OPEN",
        captureMode: "MANUAL",
        stripeCheckoutSessionId: "session",
        stripePaymentIntentId: "intent",
        checkoutUrl: "https://checkout.stripe.com/example",
        checkoutExpiresAt: null,
        captureScheduledAt: now,
        authorizationExpiresAt: null,
        authorizedAt: null,
        capturedAt: null,
        lastSyncedAt: null,
        createdAt: now,
        updatedAt: now,
        refunds: [],
      },
    ],
  }
}

function addRefund(payment: PaymentRecord, amountOre: number, status: "PENDING" | "SUCCEEDED" | "FAILED") {
  payment.attempts[0].refunds.push({
    id: "refund",
    paymentAttemptId: "attempt",
    stripeRefundId: "stripe-refund",
    amountOre,
    status,
    reason: null,
    requestedByUserId: null,
    createdAt: now,
    updatedAt: now,
  })
}

describe("payment summary", () => {
  it("exposes an unpaid checkout without granting registration eligibility", () => {
    const view = buildPaymentView(createPayment())

    expect(view.status).toBe("UNPAID")
    expect(view.isRequirementSatisfied).toBe(false)
    expect(view.checkoutUrl).toBe("https://checkout.stripe.com/example")
    expect(view.canRefund).toBe(false)
    expect(view.canCancel).toBe(true)
    expect(view.canWaive).toBe(true)
  })

  it("blocks checkout, cancellation and waiver while a payment is processing", () => {
    const payment = createPayment()
    payment.attempts[0].status = "PROCESSING"

    const view = buildPaymentView(payment)

    expect(view.status).toBe("PROCESSING")
    expect(view.canStartCheckout).toBe(false)
    expect(view.canCancel).toBe(false)
    expect(view.canRefund).toBe(false)
    expect(view.canWaive).toBe(false)
    expect(view.checkoutUrl).toBeNull()
    expect(view.isRequirementSatisfied).toBe(false)
  })

  it("accepts authorization while distinguishing it from captured money", () => {
    const payment = createPayment()
    payment.attempts[0].status = "AUTHORIZED"

    const view = buildPaymentView(payment)

    expect(view.status).toBe("AUTHORIZED")
    expect(view.isRequirementSatisfied).toBe(true)
    expect(view.canRefund).toBe(false)
    expect(view.canStartCheckout).toBe(false)
    expect(view.checkoutUrl).toBeNull()
  })

  it("does not let an abandoned replacement hide an earlier captured payment", () => {
    const payment = createPayment()
    const capturedAttempt = { ...payment.attempts[0], id: "captured", status: "CAPTURED" as const }
    payment.attempts[0].status = "EXPIRED"
    payment.attempts.push(capturedAttempt)

    const view = buildPaymentView(payment)

    expect(view.status).toBe("PAID")
    expect(view.canStartCheckout).toBe(false)
    expect(view.canRefund).toBe(true)
  })

  it("distinguishes partial refunds from complete refunds", () => {
    const payment = createPayment()
    payment.attempts[0].status = "CAPTURED"
    addRefund(payment, 5000, "SUCCEEDED")

    const view = buildPaymentView(payment)

    expect(view.status).toBe("PARTIALLY_REFUNDED")
    expect(view.refundedAmountOre).toBe(5000)
    expect(view.paidAmountOre).toBe(10000)
    expect(view.isRequirementSatisfied).toBe(false)
    expect(view.canRefund).toBe(true)
    expect(view.canStartCheckout).toBe(false)
  })

  it("does not treat a refund as a waiver", () => {
    const payment = createPayment()
    payment.attempts[0].status = "CAPTURED"
    addRefund(payment, 15000, "SUCCEEDED")

    const view = buildPaymentView(payment)

    expect(view.status).toBe("REFUNDED")
    expect(view.isRequirementSatisfied).toBe(false)
    expect(view.canRefund).toBe(false)
    expect(view.canStartCheckout).toBe(true)
    expect(view.refundedAt).toEqual(now)
  })

  it("blocks duplicate refunds and checkout while a refund is pending", () => {
    const payment = createPayment()
    payment.attempts[0].status = "CAPTURED"
    addRefund(payment, 15000, "PENDING")

    const view = buildPaymentView(payment)

    expect(view.status).toBe("REFUND_PENDING")
    expect(view.refundedAmountOre).toBe(0)
    expect(view.canRefund).toBe(false)
    expect(view.canStartCheckout).toBe(false)
  })

  it("does not subtract failed refunds from captured money", () => {
    const payment = createPayment()
    payment.attempts[0].status = "CAPTURED"
    addRefund(payment, 15000, "FAILED")

    const view = buildPaymentView(payment)

    expect(view.status).toBe("PAID")
    expect(view.refundedAmountOre).toBe(0)
    expect(view.canRefund).toBe(true)
  })

  it("uses the waiver timestamp independently of a deleted actor", () => {
    const payment = createPayment()
    payment.waivedAt = now
    payment.waivedByUserId = null

    const view = buildPaymentView(payment)

    expect(view.status).toBe("WAIVED")
    expect(view.canWaive).toBe(false)
    expect(view.isRequirementSatisfied).toBe(true)
    expect(view.canStartCheckout).toBe(false)
    expect(view.checkoutUrl).toBeNull()
  })

  it("counts a replacement payment without subtracting an earlier refund twice", () => {
    const payment = createPayment()
    payment.attempts[0].status = "CAPTURED"
    addRefund(payment, 15000, "SUCCEEDED")
    const replacementAttempt = {
      ...payment.attempts[0],
      id: "replacement",
      refunds: [],
    }
    payment.attempts.unshift(replacementAttempt)

    const view = buildPaymentView(payment)

    expect(view.status).toBe("PAID")
    expect(view.paidAmountOre).toBe(15000)
    expect(view.refundedAmountOre).toBe(15000)
    expect(view.isRequirementSatisfied).toBe(true)
    expect(view.canStartCheckout).toBe(false)
  })

  it("keeps a pending refund visible when the payment requirement is waived", () => {
    const payment = createPayment()
    payment.attempts[0].status = "CAPTURED"
    payment.waivedAt = now
    addRefund(payment, 15000, "PENDING")

    const view = buildPaymentView(payment)

    expect(view.status).toBe("REFUND_PENDING")
    expect(view.isRequirementSatisfied).toBe(true)
    expect(view.waivedAt).toEqual(now)
    expect(view.canRefund).toBe(false)
  })
})
