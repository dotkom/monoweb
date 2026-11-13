import type { DBClient, DBHandle } from "@dotkomonline/db"
import type Stripe from "stripe"
import { describe, expect, it } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import type { PaymentAttempt, PaymentRefund } from "../modules/payment/payment"
import { migratePaymentAttempt } from "./migrate-payments"

function createFixture() {
  const prisma = mockDeep<DBClient>()
  const handle = mockDeep<DBHandle>()
  const stripe = mockDeep<Stripe>()
  const importedRefund = mock<PaymentRefund>({
    id: "payment:legacy-refund",
    stripeRefundId: null,
    requestedByUserId: "administrator",
  })
  const attempt = mock<PaymentAttempt>({
    id: "payment:legacy",
    paymentId: "payment",
    status: "CAPTURED",
    stripeCheckoutSessionId: "session",
    stripePaymentIntentId: null,
    refunds: [importedRefund],
  })
  const providerRefund = mock<Stripe.Refund>({
    id: "provider-refund",
    amount: 5000,
    reason: null,
    created: 1700000000,
  })
  const refunds = [providerRefund]
  let isTransactionOpen = false

  prisma.paymentAttempt.findUniqueOrThrow.mockResolvedValue(attempt)
  prisma.$transaction.mockImplementation(async (operation) => {
    isTransactionOpen = true

    try {
      return await operation(handle)
    } finally {
      isTransactionOpen = false
    }
  })
  stripe.checkout.sessions.retrieve.mockImplementation(async () => {
    expect(isTransactionOpen).toBe(false)

    return mock({ amount_total: 15000, currency: "nok", payment_intent: "intent" })
  })
  stripe.paymentIntents.retrieve.mockImplementation(async () => {
    expect(isTransactionOpen).toBe(false)

    return mock({ amount: 15000, currency: "nok" })
  })
  stripe.refunds.list.mockReturnValue(
    mock<Stripe.ApiListPromise<Stripe.Refund>>({
      [Symbol.asyncIterator]: async function* () {
        expect(isTransactionOpen).toBe(false)

        for (const refund of refunds) {
          yield refund
        }
      },
    })
  )
  handle.payment.update.mockImplementation(async () => {
    expect(isTransactionOpen).toBe(true)

    return mock()
  })

  return { prisma, handle, stripe, attempt, importedRefund, providerRefund, refunds }
}

describe("payment data migration", () => {
  it("fills provider details before normal synchronization without replacing the original refund actor", async () => {
    const { prisma, handle, stripe, attempt, importedRefund, providerRefund } = createFixture()

    await migratePaymentAttempt(prisma, stripe, attempt.id)

    expect(handle.payment.update).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: "payment",
      },
      data: {
        amountOre: 15000,
      },
    })
    expect(handle.paymentAttempt.update).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: attempt.id,
      },
      data: {
        stripePaymentIntentId: "intent",
      },
    })
    expect(handle.paymentRefund.update).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: importedRefund.id,
      },
      data: {
        stripeRefundId: providerRefund.id,
        amountOre: 5000,
        reason: null,
        createdAt: new Date("2023-11-14T22:13:20Z"),
      },
    })
    expect(stripe.paymentIntents.capture).not.toHaveBeenCalled()
    expect(stripe.refunds.create).not.toHaveBeenCalled()
  })

  it("rejects ambiguous refunds before changing any records", async () => {
    const { prisma, stripe, attempt, refunds } = createFixture()
    refunds.push(mock<Stripe.Refund>({ id: "another-refund" }))

    await expect(migratePaymentAttempt(prisma, stripe, attempt.id)).rejects.toThrow("cannot be matched uniquely")

    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("preserves refunds whose provider ID was already resolved", async () => {
    const { prisma, handle, stripe, attempt, importedRefund, providerRefund } = createFixture()
    importedRefund.stripeRefundId = providerRefund.id

    await migratePaymentAttempt(prisma, stripe, attempt.id)
    await migratePaymentAttempt(prisma, stripe, attempt.id)

    expect(handle.paymentRefund.update).not.toHaveBeenCalled()
    expect(stripe.refunds.list).not.toHaveBeenCalled()
    expect(handle.payment.update).toHaveBeenCalledTimes(2)
  })

  it("rejects non-NOK amounts before changing any records", async () => {
    const { prisma, stripe, attempt } = createFixture()
    stripe.checkout.sessions.retrieve.mockResolvedValue(
      mock({ amount_total: 15000, currency: "eur", payment_intent: "intent" })
    )

    await expect(migratePaymentAttempt(prisma, stripe, attempt.id)).rejects.toThrow("does not have a NOK amount")

    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("requires a provider identifier for financial history", async () => {
    const { prisma, stripe, attempt } = createFixture()
    attempt.stripeCheckoutSessionId = null

    await expect(migratePaymentAttempt(prisma, stripe, attempt.id)).rejects.toThrow("needs a Stripe identifier")

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
  })

  it("leaves cancelled attempts without a provider reference in their migrated state", async () => {
    const { prisma, stripe, attempt } = createFixture()
    attempt.status = "CANCELLED"
    attempt.stripeCheckoutSessionId = null
    attempt.refunds = []

    await migratePaymentAttempt(prisma, stripe, attempt.id)

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
  })
})
