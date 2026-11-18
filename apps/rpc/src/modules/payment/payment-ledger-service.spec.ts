import type { DBClient, DBHandle } from "@dotkomonline/db"
import { getUnixTime } from "date-fns"
import Stripe from "stripe"
import { afterEach, describe, expect, it, vi } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import { FailedPreconditionError } from "../../error"
import type { UserRepository } from "../user/user-repository"
import { buildPaymentView, type PaymentRecord, type PaymentRefund } from "./payment"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import { tasks } from "../task/task-definition"
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
        attemptNumber: 1,
        checkoutReturnUrl: "https://online.ntnu.no/",
        checkoutCustomerEmail: "original@example.com",
        checkoutRequestedAt: null,
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
        capturedAmountOre: 0,
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

  const handle = mockDeep<DBHandle>()
  handle.auditTransaction.create.mockResolvedValue(mock({ id: "audit" }))
  const client = mock<DBClient>()
  const taskSchedulingService = mock<TaskSchedulingService>()
  let isInTransaction = false
  client.$transaction.mockImplementation(async (operation) => {
    isInTransaction = true

    try {
      return await operation(handle)
    } finally {
      isInTransaction = false
    }
  })
  const paymentRepository = mock<PaymentRepository>()
  const userRepository = mock<UserRepository>()
  const stripe = mockDeep<Stripe>()
  const ledger = getPaymentLedgerService(paymentRepository, userRepository, stripe, taskSchedulingService)
  const attempt = payment.attempts[0]

  paymentRepository.findById.mockResolvedValue(payment)
  paymentRepository.findByAttemptId.mockResolvedValue(payment)
  stripe.checkout.sessions.retrieve.mockResolvedValue(session)
  stripe.checkout.sessions.expire.mockImplementation(async () => {
    session.status = "expired"

    return session
  })
  paymentRepository.markCheckoutRequested.mockImplementation(async (_handle, _attemptId, requestedAt) => {
    if (attempt.status === "CREATED" && attempt.checkoutRequestedAt === null) {
      attempt.checkoutRequestedAt = requestedAt
    }
  })
  paymentRepository.attachCheckoutSession.mockImplementation(async (_handle, _attemptId, data) => {
    const { status, ...sessionData } = data

    if (attempt.stripeCheckoutSessionId === null) {
      Object.assign(attempt, sessionData)
    }

    if (attempt.status === "CREATED") {
      attempt.status = status ?? attempt.status
    }
  })
  paymentRepository.updateAttempt.mockImplementation(async (_handle, _attemptId, data) => {
    Object.assign(attempt, data)

    return attempt
  })

  return {
    handle,
    client,
    taskSchedulingService,
    isInTransaction: () => isInTransaction,
    paymentRepository,
    stripe,
    ledger,
    payment,
    attempt,
    session,
  }
}

describe("payment ledger service", () => {
  function createCapturedFixture() {
    const fixture = createFixture()
    const { attempt, session, stripe, paymentRepository } = fixture
    attempt.status = "CAPTURED"
    attempt.capturedAmountOre = 15000
    attempt.stripePaymentIntentId = "intent"
    session.payment_intent = "intent"
    session.status = "complete"
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock({ status: "succeeded", amount_received: 15000, latest_charge: null })
    )
    stripe.refunds.list.mockReturnValue(
      mock<Stripe.ApiListPromise<Stripe.Refund>>({
        [Symbol.asyncIterator]: async function* () {},
      })
    )
    paymentRepository.createRefund.mockImplementation(async (_handle, input) => {
      const refund = mock<PaymentRefund>({ ...input, status: "REQUESTED" })
      attempt.refunds.push(refund)

      return refund
    })

    return fixture
  }

  it("refunds only the remaining balance and ignores failed and cancelled refunds", async () => {
    const { handle, ledger, stripe, attempt, paymentRepository } = createCapturedFixture()
    attempt.refunds = [
      mock<PaymentRefund>({ refundNumber: 1, amountOre: 5000, status: "SUCCEEDED" }),
      mock<PaymentRefund>({ refundNumber: 2, amountOre: 10000, status: "FAILED" }),
      mock<PaymentRefund>({ refundNumber: 3, amountOre: 10000, status: "CANCELLED" }),
    ]

    await ledger.refund(handle, attempt.id, "administrator")

    expect(paymentRepository.createRefund).toHaveBeenCalledExactlyOnceWith(handle, {
      refundNumber: 4,
      paymentAttemptId: attempt.id,
      amountOre: 10000,
      requestedByUserId: "administrator",
    })
    expect(stripe.refunds.create).toHaveBeenCalledExactlyOnceWith(
      {
        payment_intent: "intent",
        amount: 10000,
        metadata: { refund_number: "4", requested_by_user_id: "administrator" },
      },
      { idempotencyKey: "payment-refund-attempt:4" }
    )
  })

  it("reconciles a partial capture and refunds only the captured balance", async () => {
    const { handle, ledger, stripe, attempt, payment, paymentRepository } = createCapturedFixture()
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock({
        status: "succeeded",
        amount_received: 5000,
        latest_charge: null,
      })
    )
    paymentRepository.updateAttempt.mockImplementation(async (_handle, _attemptId, input) => {
      Object.assign(attempt, input)

      return attempt
    })
    attempt.refunds = [mock<PaymentRefund>({ amountOre: 1000, status: "SUCCEEDED" })]

    await ledger.refund(handle, attempt.id, "administrator")

    expect(payment.amountOre).toBe(15000)
    expect(attempt.capturedAmountOre).toBe(5000)
    expect(stripe.refunds.create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ amount: 4000 }),
      expect.anything()
    )
  })

  it("retains evidence of an available checkout after Stripe removes the expired URL", async () => {
    const { ledger, handle, attempt, session } = createFixture()
    attempt.checkoutRequestedAt = new Date()
    const checkoutUrl = attempt.checkoutUrl
    session.status = "expired"
    session.url = null

    const payment = await ledger.syncAttempt(handle, attempt.id)

    expect(attempt.checkoutUrl).toBe(checkoutUrl)
    expect(buildPaymentView(payment).isCheckoutPending).toBe(false)
    expect(buildPaymentView(payment).checkoutUrl).toBeNull()
  })

  it("keeps an expired checkout unavailable when its link was never recovered", async () => {
    const { ledger, handle, attempt, session } = createFixture()
    attempt.checkoutRequestedAt = new Date()
    attempt.checkoutUrl = null
    session.status = "expired"
    session.url = null

    const payment = await ledger.syncAttempt(handle, attempt.id)

    expect(buildPaymentView(payment).isCheckoutPending).toBe(true)
    expect(buildPaymentView(payment).checkoutUrl).toBeNull()
  })

  it("explains why captured money cannot be cancelled and leaves it untouched", async () => {
    const { ledger, handle, attempt, stripe } = createCapturedFixture()

    await expect(ledger.cancel(handle, attempt.id)).rejects.toThrow(
      "status=CAPTURED, stripeCheckoutSessionId=session, stripePaymentIntentId=intent. " +
        "Expected an open checkout session or an authorized payment intent; captured payments must be refunded."
    )
    expect(stripe.paymentIntents.cancel).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.expire).not.toHaveBeenCalled()
    expect(stripe.refunds.create).not.toHaveBeenCalled()
  })

  it("treats a fully refunded partial capture as settled when cancelling", async () => {
    const { handle, ledger, stripe, attempt, paymentRepository } = createCapturedFixture()
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock({
        status: "succeeded",
        amount_received: 5000,
        latest_charge: null,
      })
    )
    paymentRepository.updateAttempt.mockImplementation(async (_handle, _attemptId, input) => {
      Object.assign(attempt, input)

      return attempt
    })
    attempt.refunds = [mock<PaymentRefund>({ refundNumber: 1, amountOre: 5000, status: "SUCCEEDED" })]

    await ledger.cancel(handle, attempt.id)

    expect(stripe.paymentIntents.cancel).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.expire).not.toHaveBeenCalled()
  })

  it.each(["PENDING", "SUCCEEDED"] as const)("does not issue another refund after a %s full refund", async (status) => {
    const { handle, ledger, stripe, attempt, paymentRepository } = createCapturedFixture()
    attempt.refunds = [mock<PaymentRefund>({ amountOre: 15000, status })]

    await ledger.refund(handle, attempt.id, "administrator")

    expect(paymentRepository.createRefund).not.toHaveBeenCalled()
    expect(stripe.refunds.create).not.toHaveBeenCalled()
  })

  it("retries an uncertain refund with the same amount, actor and idempotency key", async () => {
    const { handle, ledger, stripe, attempt, paymentRepository } = createCapturedFixture()
    stripe.refunds.create.mockRejectedValueOnce(new Error("Connection lost"))

    await expect(ledger.refund(handle, attempt.id, "original-administrator")).rejects.toThrow("Connection lost")
    await ledger.refund(handle, attempt.id, "other-administrator")

    expect(paymentRepository.createRefund).toHaveBeenCalledTimes(1)
    expect(stripe.refunds.create).toHaveBeenCalledTimes(2)
    expect(stripe.refunds.create.mock.calls[1]).toEqual(stripe.refunds.create.mock.calls[0])
    expect(stripe.refunds.create.mock.calls[1][0]?.metadata?.requested_by_user_id).toBe("original-administrator")
  })

  it("does not capture again when reconciliation discovers an earlier successful capture", async () => {
    const { handle, ledger, stripe, attempt, paymentRepository } = createCapturedFixture()
    attempt.status = "AUTHORIZED"
    paymentRepository.updateAttempt.mockImplementation(async (_handle, _attemptId, input) => {
      Object.assign(attempt, input)

      return attempt
    })

    await ledger.capture(handle, attempt.id)

    expect(stripe.paymentIntents.capture).not.toHaveBeenCalled()
  })

  it("rejects capture of a waived authorization", async () => {
    const { handle, ledger, stripe, attempt, payment } = createCapturedFixture()
    attempt.status = "AUTHORIZED"
    payment.waivedAt = new Date()
    stripe.paymentIntents.retrieve.mockResolvedValue(mock({ status: "requires_capture", latest_charge: null }))

    await expect(ledger.capture(handle, attempt.id)).rejects.toBeInstanceOf(FailedPreconditionError)

    expect(stripe.paymentIntents.capture).not.toHaveBeenCalled()
  })

  it.each([
    "CREATED",
    "CHECKOUT_OPEN",
    "PROCESSING",
    "AUTHORIZED",
  ] as const)("rejects a waiver while an older attempt is %s", async (status) => {
    const { handle, ledger, payment, attempt, paymentRepository } = createFixture()
    attempt.status = "EXPIRED"
    payment.attempts.push({ ...attempt, id: "older-attempt", status })

    await expect(ledger.waive(handle, payment.id, "administrator", null)).rejects.toBeInstanceOf(
      FailedPreconditionError
    )

    expect(paymentRepository.update).not.toHaveBeenCalled()
  })

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
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock({ status: "succeeded", amount_received: 15000, latest_charge: null })
    )
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

    const result = await ledger.prepareCheckout(handle, payment.id, {
      returnUrl: "https://online.ntnu.no/",
      customerEmail: null,
      captureMode: "MANUAL",
      captureScheduledAt: null,
    })

    expect(result).toBe(payment)
    expect(paymentRepository.createAttempt).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("persists checkout inputs and a recovery task without calling Stripe", async () => {
    const { handle, ledger, payment, attempt, paymentRepository, taskSchedulingService, stripe } = createFixture()
    attempt.status = "CANCELLED"
    attempt.attemptNumber = 7
    const input = {
      returnUrl: "https://online.ntnu.no/event",
      customerEmail: "customer@example.com",
      captureMode: "MANUAL" as const,
      captureScheduledAt: null,
    }
    paymentRepository.createAttempt.mockResolvedValue({ ...attempt, id: "prepared-attempt", status: "CREATED" })

    await ledger.prepareCheckout(handle, payment.id, input)

    expect(paymentRepository.createAttempt).toHaveBeenCalledExactlyOnceWith(handle, {
      paymentId: payment.id,
      attemptNumber: 8,
      captureMode: "MANUAL",
      captureScheduledAt: null,
      checkoutReturnUrl: input.returnUrl,
      checkoutCustomerEmail: input.customerEmail,
    })
    expect(taskSchedulingService.scheduleAt).toHaveBeenCalledExactlyOnceWith(
      handle,
      tasks.OPEN_PAYMENT_CHECKOUT,
      { paymentAttemptId: "prepared-attempt" },
      expect.any(Date)
    )
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
  })

  it("retries a persisted checkout with stable parameters outside transactions", async () => {
    const { client, handle, isInTransaction, ledger, paymentRepository, stripe, attempt, session } = createFixture()
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null
    stripe.checkout.sessions.create.mockImplementation(async () => {
      expect(isInTransaction()).toBe(false)

      return session
    })
    paymentRepository.attachCheckoutSession.mockRejectedValueOnce(new Error("Database unavailable"))

    await expect(ledger.startCheckout(client, attempt.id)).rejects.toThrow("Database unavailable")
    await ledger.startCheckout(client, attempt.id)

    expect(stripe.checkout.sessions.create.mock.calls[1]).toEqual(stripe.checkout.sessions.create.mock.calls[0])
    expect(stripe.checkout.sessions.create.mock.calls[0][0]).toMatchObject({
      success_url: attempt.checkoutReturnUrl,
      customer_email: "original@example.com",
      metadata: { payment_attempt_id: attempt.id },
    })
    expect(stripe.checkout.sessions.create.mock.calls[0][1]).toEqual({ idempotencyKey: "payment-checkout-attempt" })
    expect(paymentRepository.attachCheckoutSession).toHaveBeenCalledWith(handle, attempt.id, expect.anything())
  })

  it("expires a session when the attempt was cancelled during creation", async () => {
    const { client, ledger, stripe, attempt, session } = createFixture()
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null
    stripe.checkout.sessions.create.mockImplementation(async () => {
      attempt.status = "CANCELLED"

      return session
    })

    await ledger.startCheckout(client, attempt.id)

    expect(stripe.checkout.sessions.expire).toHaveBeenCalledExactlyOnceWith(session.id)
  })

  it("refreshes an expired checkout before returning its payment link", async () => {
    const { client, ledger, attempt, session } = createFixture()
    session.status = "expired"

    const payment = await ledger.startCheckout(client, attempt.id)

    expect(buildPaymentView(payment).checkoutUrl).toBeNull()
    expect(buildPaymentView(payment).canStartCheckout).toBe(true)
    expect(attempt.status).toBe("EXPIRED")
  })

  it("retains the provider reference and retries cancellation after an expiration failure", async () => {
    const { client, ledger, stripe, attempt, session } = createFixture()
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null
    stripe.checkout.sessions.create.mockImplementation(async () => {
      attempt.status = "CANCELLED"

      return session
    })
    stripe.checkout.sessions.expire.mockRejectedValueOnce(new Error("Connection lost"))

    await expect(ledger.startCheckout(client, attempt.id)).rejects.toThrow("Connection lost")
    expect(attempt.stripeCheckoutSessionId).toBe(session.id)
    expect(attempt.status).toBe("CANCELLED")

    await ledger.startCheckout(client, attempt.id)

    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1)
    expect(stripe.checkout.sessions.expire).toHaveBeenCalledTimes(2)
    expect(attempt.status).toBe("EXPIRED")
  })

  it("recovers an uncertain creation response after cancellation with the original idempotency key", async () => {
    const { client, handle, ledger, stripe, attempt, session } = createFixture()
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null
    stripe.checkout.sessions.create.mockRejectedValueOnce(new Error("Response lost")).mockResolvedValueOnce(session)

    await expect(ledger.startCheckout(client, attempt.id)).rejects.toThrow("Response lost")
    await ledger.cancel(handle, attempt.id)
    await ledger.startCheckout(client, attempt.id)

    expect(stripe.checkout.sessions.create.mock.calls[1]).toEqual(stripe.checkout.sessions.create.mock.calls[0])
    expect(stripe.checkout.sessions.expire).toHaveBeenCalledExactlyOnceWith(session.id)
    expect(attempt.status).toBe("EXPIRED")
  })

  it("does not open a checkout cancelled before any provider request", async () => {
    const { client, ledger, stripe, attempt } = createFixture()
    attempt.status = "CANCELLED"
    attempt.stripeCheckoutSessionId = null

    await ledger.startCheckout(client, attempt.id)

    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("reconciles a webhook before the checkout creation response was saved", async () => {
    const { handle, ledger, stripe, attempt, paymentRepository } = createFixture()
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null

    await ledger.syncAttempt(handle, attempt.id, { stripeCheckoutSessionId: "session" })

    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledExactlyOnceWith("session")
    expect(paymentRepository.updateAttempt).toHaveBeenCalledWith(
      handle,
      attempt.id,
      expect.objectContaining({
        stripeCheckoutSessionId: "session",
        status: "CHECKOUT_OPEN",
      })
    )
  })

  it("matches a local refund by attempt and refund number", async () => {
    const { handle, paymentRepository, stripe, ledger, attempt } = createCapturedFixture()
    const refund = mock<PaymentRefund>({ id: "refund-uuid", refundNumber: 3 })
    paymentRepository.findUnlinkedRefund.mockResolvedValue(refund)
    stripe.refunds.list.mockReturnValue(
      mock<Stripe.ApiListPromise<Stripe.Refund>>({
        [Symbol.asyncIterator]: async function* () {
          yield mock<Stripe.Refund>({
            id: "provider-refund",
            status: "succeeded",
            amount: 5000,
            metadata: { refund_number: "3" },
          })
        },
      })
    )

    await ledger.syncAttempt(handle, attempt.id)

    expect(paymentRepository.findUnlinkedRefund).toHaveBeenCalledExactlyOnceWith(handle, 3, attempt.id)
    expect(paymentRepository.updateRefund).toHaveBeenCalledExactlyOnceWith(handle, "refund-uuid", {
      stripeRefundId: "provider-refund",
      status: "SUCCEEDED",
      amountOre: 5000,
    })
    expect(paymentRepository.upsertStripeRefund).not.toHaveBeenCalled()
  })

  it.each(["attendee deletion", "user merge"])("preserves the Stripe checkout request after %s", async (change) => {
    const { client, handle, ledger, stripe, payment, attempt, session } = createFixture()
    payment.eventId = "event"
    payment.attendeeId = "attendee"
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null
    stripe.products.retrieve.mockResolvedValue(mock({ id: "event_event" }))
    stripe.checkout.sessions.create.mockRejectedValueOnce(new Error("Response lost")).mockResolvedValueOnce(session)

    await expect(ledger.startCheckout(client, attempt.id)).rejects.toThrow("Response lost")

    if (change === "attendee deletion") {
      await ledger.cancel(handle, attempt.id)
      payment.attendeeId = null
    } else {
      payment.userId = "merged-user"
    }

    await ledger.startCheckout(client, attempt.id)

    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(2)
    expect(stripe.checkout.sessions.create.mock.calls[1]).toEqual(stripe.checkout.sessions.create.mock.calls[0])
    expect(attempt.stripeCheckoutSessionId).toBe(session.id)

    if (change === "attendee deletion") {
      expect(stripe.checkout.sessions.expire).toHaveBeenCalledExactlyOnceWith(session.id)
      expect(attempt.status).toBe("EXPIRED")
    } else {
      expect(stripe.checkout.sessions.expire).not.toHaveBeenCalled()
      expect(attempt.status).toBe("CHECKOUT_OPEN")
    }
  })

  it.each([true, false])("uses a shared event product when it already exists: %s", async (hasProduct) => {
    const { client, stripe, ledger, payment, attempt, session } = createFixture()
    payment.eventId = "event"
    payment.attendeeId = "attendee"
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null

    const product = mock<Stripe.Response<Stripe.Product>>({ id: "event_event" })

    if (hasProduct) {
      stripe.products.retrieve.mockResolvedValue(product)
    } else {
      stripe.products.retrieve.mockRejectedValue(
        new Stripe.errors.StripeInvalidRequestError({ message: "No such product", code: "resource_missing" })
      )
      stripe.products.create.mockResolvedValue(product)
    }

    stripe.checkout.sessions.create.mockResolvedValue(session)

    await ledger.startCheckout(client, attempt.id)

    expect(stripe.products.retrieve).toHaveBeenCalledExactlyOnceWith("event_event")

    if (hasProduct) {
      expect(stripe.products.create).not.toHaveBeenCalled()
    } else {
      expect(stripe.products.create).toHaveBeenCalledExactlyOnceWith(
        {
          id: "event_event",
          name: "Event ticket",
          description: "Påmelding til Event ticket",
          url: "https://online.ntnu.no/arrangementer/arrangement/event",
          metadata: {
            event_id: "event",
            event_url: "https://online.ntnu.no/arrangementer/arrangement/event",
          },
        },
        { idempotencyKey: "event-product-event" }
      )
    }

    const metadata = {
      payment_id: "payment",
      payment_attempt_id: "attempt",
      event_id: "event",
      event_title: "Event ticket",
      event_url: "https://online.ntnu.no/arrangementer/arrangement/event",
    }

    expect(stripe.checkout.sessions.create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        client_reference_id: "payment",
        metadata,
        payment_intent_data: expect.objectContaining({ metadata }),
        line_items: [{ quantity: 1, price_data: { currency: "nok", unit_amount: 15000, product: "event_event" } }],
      }),
      { idempotencyKey: "payment-checkout-attempt" }
    )
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

  it("does not create another product when the product lookup fails for reasons other than absence", async () => {
    const { client, stripe, ledger, payment, attempt } = createFixture()
    payment.eventId = "event"
    attempt.status = "CREATED"
    attempt.stripeCheckoutSessionId = null

    const error = new Error("Stripe unavailable")
    stripe.products.retrieve.mockRejectedValue(error)

    await expect(ledger.startCheckout(client, attempt.id)).rejects.toBe(error)

    expect(stripe.products.create).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })
})
