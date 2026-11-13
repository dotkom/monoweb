import type { DBHandle } from "@dotkomonline/db"
import { getUnixTime } from "date-fns"
import type Stripe from "stripe"
import { afterEach, describe, expect, it, vi } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import { FailedPreconditionError } from "../../error"
import type { UserRepository } from "../user/user-repository"
import type { PaymentRecord } from "./payment"
import { getPaymentLedgerService } from "./payment-ledger-service"
import type { PaymentRepository } from "./payment-repository"

function createFixture() {
  const now = new Date("2026-11-08T10:00:00Z")
  const payment: PaymentRecord = {
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
        stripePaymentIntentId: null,
        checkoutUrl: "https://checkout.stripe.com/example",
        checkoutExpiresAt: null,
        captureScheduledAt: now,
        authorizationExpiresAt: null,
        authorizedAt: null,
        capturedAt: null,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
        refunds: [],
      },
    ],
  }
  const session = mock<Stripe.Response<Stripe.Checkout.Session>>({
    id: "session",
    status: "open",
    payment_intent: null,
    amount_total: 15000,
    currency: "nok",
    expires_at: 2000000000,
    url: "https://checkout.stripe.com/example",
  })

  const handle = mock<DBHandle>()
  const paymentRepository = mock<PaymentRepository>()
  const userRepository = mock<UserRepository>()
  const stripe = mockDeep<Stripe>()
  const ledger = getPaymentLedgerService(paymentRepository, userRepository, stripe)
  const attempt = payment.attempts[0]

  paymentRepository.findById.mockResolvedValue(payment)
  paymentRepository.findByAttemptId.mockResolvedValue(payment)
  stripe.checkout.sessions.retrieve.mockResolvedValue(session)

  return { handle, paymentRepository, stripe, ledger, payment, attempt, session }
}

describe("payment ledger service", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    "attempt",
    "payment:legacy",
  ])("rejects an amount mismatch for %s before changing local state", async (attemptId) => {
    const { handle, paymentRepository, ledger, attempt, session } = createFixture()
    attempt.id = attemptId
    attempt.lastSyncedAt = null
    session.amount_total = 10000

    await expect(ledger.syncAttempt(handle, attempt.id)).rejects.toBeInstanceOf(FailedPreconditionError)

    expect(paymentRepository.update).not.toHaveBeenCalled()
    expect(paymentRepository.updateAttempt).not.toHaveBeenCalled()
  })

  it("imports a provider refund without guessing a local refund ID from the payment ID", async () => {
    const { handle, paymentRepository, stripe, ledger, attempt, session } = createFixture()
    session.payment_intent = "intent"
    stripe.paymentIntents.retrieve.mockResolvedValue(mock({ status: "succeeded", latest_charge: null }))
    stripe.refunds.list.mockReturnValue(
      mock<Stripe.ApiListPromise<Stripe.Refund>>({
        [Symbol.asyncIterator]: async function* () {
          yield mock<Stripe.Refund>({ id: "provider-refund", status: "succeeded", amount: 5000, created: 1700000000 })
        },
      })
    )
    paymentRepository.findUnlinkedRefund.mockResolvedValue(null)

    await ledger.syncAttempt(handle, attempt.id)

    expect(paymentRepository.findUnlinkedRefund).not.toHaveBeenCalled()
    expect(paymentRepository.upsertStripeRefund).toHaveBeenCalledExactlyOnceWith(
      handle,
      "provider-refund",
      expect.objectContaining({
        paymentAttemptId: attempt.id,
        amountOre: 5000,
        requestedByUserId: null,
        createdAt: new Date("2023-11-14T22:13:20Z"),
      })
    )
  })

  it.each([
    {
      description: "preserves an earlier scheduled capture",
      captureScheduledAt: new Date("2026-11-09T08:00:00Z"),
      expectedCaptureScheduledAt: new Date("2026-11-09T08:00:00Z"),
    },
    {
      description: "moves a later capture to one hour before authorization expiry",
      captureScheduledAt: new Date("2026-11-09T12:00:00Z"),
      expectedCaptureScheduledAt: new Date("2026-11-09T09:00:00Z"),
    },
    {
      description: "captures immediately when no time was scheduled",
      captureScheduledAt: null,
      expectedCaptureScheduledAt: new Date("2026-11-08T10:00:00Z"),
    },
  ])("$description", async ({ captureScheduledAt, expectedCaptureScheduledAt }) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-11-08T10:00:00Z"))

    const { handle, paymentRepository, stripe, ledger, attempt, session } = createFixture()
    attempt.captureScheduledAt = captureScheduledAt
    session.payment_intent = "intent"
    session.expires_at = getUnixTime(new Date("2026-11-08T11:00:00Z"))

    const charge = mock<Stripe.Charge>({
      created: getUnixTime(new Date("2026-11-08T09:30:00Z")),
      payment_method_details: {
        type: "card",
        card: {
          capture_before: getUnixTime(new Date("2026-11-09T10:00:00Z")),
        },
      },
    })
    stripe.paymentIntents.retrieve.mockResolvedValue(mock({ status: "requires_capture", latest_charge: charge }))
    stripe.refunds.list.mockReturnValue(
      mock<Stripe.ApiListPromise<Stripe.Refund>>({
        [Symbol.asyncIterator]: async function* () {},
      })
    )

    await ledger.syncAttempt(handle, attempt.id)

    expect(paymentRepository.updateAttempt).toHaveBeenCalledExactlyOnceWith(
      handle,
      attempt.id,
      expect.objectContaining({
        status: "AUTHORIZED",
        authorizedAt: new Date("2026-11-08T09:30:00Z"),
        authorizationExpiresAt: new Date("2026-11-09T10:00:00Z"),
        checkoutExpiresAt: new Date("2026-11-08T11:00:00Z"),
        captureScheduledAt: expectedCaptureScheduledAt,
        lastSyncedAt: new Date("2026-11-08T10:00:00Z"),
      })
    )
  })

  it("reuses an open checkout without creating another attempt or provider session", async () => {
    const { handle, paymentRepository, stripe, ledger, payment } = createFixture()

    const result = await ledger.startCheckout(handle, payment.id, {
      returnUrl: "https://online.ntnu.no/",
      customerEmail: null,
      captureMode: "MANUAL",
      captureScheduledAt: null,
    })

    expect(result).toBe(payment)
    expect(paymentRepository.createAttempt).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("cancels an attempt through the repository before it has a provider session", async () => {
    const { handle, paymentRepository, stripe, ledger, payment, attempt } = createFixture()
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null

    const result = await ledger.cancel(handle, attempt.id)

    expect(result).toBe(payment)
    expect(paymentRepository.updateAttempt).toHaveBeenCalledExactlyOnceWith(handle, attempt.id, {
      status: "CANCELLED",
    })
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.expire).not.toHaveBeenCalled()
    expect(stripe.paymentIntents.cancel).not.toHaveBeenCalled()
  })
})
