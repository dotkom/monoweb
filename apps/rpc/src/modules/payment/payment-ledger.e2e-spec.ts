import type Stripe from "stripe"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { mock } from "vitest-mock-extended"
import { dbClient, stripe } from "../../../vitest-integration.setup"
import { buildPaymentView } from "./payment"
import { getPaymentRepository, paymentInclude } from "./payment-repository"
import { getUserRepository } from "../user/user-repository"
import { getPaymentLedgerService } from "./payment-ledger-service"

async function createPayment() {
  const user = await dbClient.user.create({
    data: {
      id: "payment-user",
      username: "payment-user",
    },
  })
  const ledger = getPaymentLedgerService(getPaymentRepository(), getUserRepository(), stripe)
  const payment = await dbClient.$transaction(async (handle) => {
    return await ledger.create(handle, {
      userId: user.id,
      description: "A purchase unrelated to events",
      amountOre: 15000,
    })
  })

  return { ledger, payment }
}

function mockRefunds(refunds: Stripe.Refund[]) {
  stripe.refunds.list.mockReturnValue(
    mock<Stripe.ApiListPromise<Stripe.Refund>>({
      [Symbol.asyncIterator]: async function* () {
        for (const refund of refunds) {
          yield refund
        }
      },
    })
  )
}

function mockSession(status: Stripe.Checkout.Session.Status = "open", paymentIntentId: string | null = null) {
  return mock<Stripe.Response<Stripe.Checkout.Session>>({
    id: "checkout-session",
    status,
    payment_intent: paymentIntentId,
    amount_total: 15000,
    currency: "nok",
    expires_at: 2000000000,
    url: "https://checkout.stripe.com/payment",
  })
}

const checkoutInput = {
  returnUrl: "https://online.ntnu.no/",
  customerEmail: null,
  captureMode: "MANUAL" as const,
  captureScheduledAt: new Date("2026-11-09T10:00:00Z"),
}

describe("payment ledger persistence", () => {
  it("reuses the checkout idempotency key after a local rollback", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())

    await expect(
      dbClient.$transaction(async (handle) => {
        await ledger.startCheckout(handle, payment.id, checkoutInput)

        throw new Error("Simulated local checkout failure")
      })
    ).rejects.toThrow("Simulated local checkout failure")

    await dbClient.$transaction(async (handle) => ledger.startCheckout(handle, payment.id, checkoutInput))

    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(2)
    const firstRequest = stripe.checkout.sessions.create.mock.calls[0]
    const secondRequest = stripe.checkout.sessions.create.mock.calls[1]

    expect(firstRequest[1]?.idempotencyKey).toBeDefined()
    expect(secondRequest[1]?.idempotencyKey).toBe(firstRequest[1]?.idempotencyKey)
    expect(secondRequest[0]?.metadata).toEqual(firstRequest[0]?.metadata)
  })

  it("recovers refund attribution after Stripe succeeds and the local transaction rolls back", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("complete", "payment-intent"))
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock<Stripe.Response<Stripe.PaymentIntent>>({
        id: "payment-intent",
        status: "succeeded",
        latest_charge: null,
      })
    )
    const providerRefunds: Stripe.Refund[] = []
    mockRefunds(providerRefunds)
    const checkout = await dbClient.$transaction(async (handle) =>
      ledger.startCheckout(handle, payment.id, checkoutInput)
    )
    const attemptId = checkout.attempts[0].id
    stripe.refunds.create.mockImplementation(async (parameters) => {
      const refund = mock<Stripe.Response<Stripe.Refund>>({
        id: "requested-refund",
        amount: 15000,
        status: "succeeded",
        created: 1700000000,
        reason: null,
        metadata: {
          payment_refund_id: String(parameters?.metadata?.payment_refund_id),
          requested_by_user_id: String(parameters?.metadata?.requested_by_user_id),
        },
      })
      providerRefunds.push(refund)

      return refund
    })

    await expect(
      dbClient.$transaction(async (handle) => {
        await ledger.refund(handle, attemptId, payment.userId)

        throw new Error("Simulated local refund failure")
      })
    ).rejects.toThrow("Simulated local refund failure")

    const recovered = await dbClient.$transaction(async (handle) => ledger.refund(handle, attemptId, payment.userId))

    expect(stripe.refunds.create).toHaveBeenCalledTimes(1)
    expect(recovered.attempts[0].refunds).toHaveLength(1)
    expect(recovered.attempts[0].refunds[0].requestedByUserId).toBe(payment.userId)
    expect(buildPaymentView(recovered).status).toBe("REFUNDED")
  })

  it("preserves populated legacy payments, refund attribution, and scheduled capture bindings", async () => {
    const migration = readFileSync(
      new URL(
        "../../../../../packages/db/prisma/migrations/20261108160000_payment_ledger/migration.sql",
        import.meta.url
      ),
      "utf8"
    )
    const statements = migration.replace(/^--.*$/gm, "").match(/(?:'(?:''|[^'])*'|[^;])+/g) ?? []

    await dbClient.$transaction(
      async (handle) => {
        await handle.$executeRawUnsafe("CREATE SCHEMA payment_migration_test")
        await handle.$executeRawUnsafe("SET LOCAL search_path = payment_migration_test, public")

        const bootstrapStatements = [
          "CREATE TABLE ow_user (id TEXT PRIMARY KEY)",
          "CREATE TABLE attendance (id TEXT PRIMARY KEY, attendance_price INTEGER)",
          "CREATE TABLE event (id TEXT PRIMARY KEY, attendance_id TEXT, title TEXT, created_at TIMESTAMPTZ DEFAULT now())",
          `CREATE TABLE attendee (
          id TEXT PRIMARY KEY, attendance_id TEXT, user_id TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
          registered_at TIMESTAMPTZ, completion_deadline TIMESTAMPTZ,
          payment_charge_deadline TIMESTAMPTZ, payment_charged_at TIMESTAMPTZ, payment_checkout_url TEXT,
          payment_id TEXT, payment_link TEXT, payment_refunded_at TIMESTAMPTZ, payment_refunded_by_user_id TEXT,
          payment_reserved_at TIMESTAMPTZ,
          CONSTRAINT attendee_payment_refunded_by_user_id_fkey FOREIGN KEY (payment_refunded_by_user_id) REFERENCES ow_user(id)
        )`,
          "CREATE INDEX attendee_payment_refunded_by_user_id_idx ON attendee(payment_refunded_by_user_id)",
          "CREATE TABLE task (id TEXT PRIMARY KEY, type TEXT, status TEXT, payload JSONB, processed_at TIMESTAMPTZ)",
          "INSERT INTO ow_user VALUES ('payer'), ('administrator')",
          "INSERT INTO attendance VALUES ('attendance', 150)",
          "INSERT INTO event (id, attendance_id, title) VALUES ('event', 'attendance', 'Legacy event')",
          `INSERT INTO attendee (id, attendance_id, user_id, registered_at, payment_id, payment_reserved_at, payment_charged_at, payment_checkout_url)
          VALUES ('paid', 'attendance', 'payer', now(), 'cs_paid', now(), now(), 'https://dashboard.stripe.com/payments/pi_paid')`,
          `INSERT INTO attendee (id, attendance_id, user_id, registered_at, payment_refunded_at, payment_refunded_by_user_id)
          VALUES ('refunded', 'attendance', 'payer', now(), now(), 'administrator')`,
          `INSERT INTO task VALUES ('capture', 'CHARGE_ATTENDEE', 'PENDING', '{"attendeeId":"paid"}', NULL)`,
        ]

        for (const statement of bootstrapStatements) {
          await handle.$executeRawUnsafe(statement)
        }

        for (const statement of statements) {
          const trimmedStatement = statement.trim()

          if (trimmedStatement !== "" && trimmedStatement !== "BEGIN" && trimmedStatement !== "COMMIT") {
            await handle.$executeRawUnsafe(trimmedStatement)
          }
        }

        const payments = await handle.$queryRawUnsafe<{ id: string; amount_ore: number; waived_at: Date | null }[]>(
          "SELECT id, amount_ore, waived_at FROM payment ORDER BY id"
        )
        const refunds = await handle.$queryRawUnsafe<{ amount_ore: number; requested_by_user_id: string }[]>(
          "SELECT amount_ore, requested_by_user_id FROM payment_refund"
        )
        const attempts = await handle.$queryRawUnsafe<
          { stripe_checkout_session_id: string; stripe_payment_intent_id: string }[]
        >(
          "SELECT stripe_checkout_session_id, stripe_payment_intent_id FROM payment_attempt WHERE payment_id = 'attendance-payment:paid'"
        )
        const tasks = await handle.$queryRawUnsafe<{ payload: { paymentAttemptId: string } }[]>(
          "SELECT payload FROM task WHERE id = 'capture'"
        )

        expect(payments).toHaveLength(2)
        expect(payments[0].amount_ore).toBe(15000)
        expect(payments[1].waived_at).toBeInstanceOf(Date)
        expect(refunds).toEqual([{ amount_ore: 15000, requested_by_user_id: "administrator" }])
        expect(attempts).toEqual([{ stripe_checkout_session_id: "cs_paid", stripe_payment_intent_id: "pi_paid" }])
        expect(tasks[0].payload.paymentAttemptId).toBe("attendance-payment:paid:legacy")

        await handle.$executeRawUnsafe("DROP SCHEMA payment_migration_test CASCADE")
      },
      {
        timeout: 30000,
      }
    )
  })

  it("creates standalone payments and reuses an open checkout", async () => {
    const { ledger, payment } = await createPayment()
    const session = mockSession()
    stripe.checkout.sessions.create.mockResolvedValue(session)
    stripe.checkout.sessions.retrieve.mockResolvedValue(session)

    await dbClient.$transaction(async (handle) => ledger.startCheckout(handle, payment.id, checkoutInput))
    const updated = await dbClient.$transaction(async (handle) =>
      ledger.startCheckout(handle, payment.id, checkoutInput)
    )

    expect(updated.eventId).toBeNull()
    expect(updated.attendeeId).toBeNull()
    expect(updated.amountOre).toBe(15000)
    expect(updated.attempts).toHaveLength(1)
    expect(updated.attempts[0].status).toBe("CHECKOUT_OPEN")
    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1)
  })

  it("expires a cancelled checkout and retains it when a replacement is created", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession())
    const original = await dbClient.$transaction(async (handle) =>
      ledger.startCheckout(handle, payment.id, checkoutInput)
    )
    stripe.checkout.sessions.expire.mockImplementation(async () => {
      stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("expired"))

      return mockSession("expired")
    })

    await dbClient.$transaction(async (handle) => ledger.cancel(handle, original.attempts[0].id))
    stripe.checkout.sessions.create.mockResolvedValue({ ...mockSession(), id: "replacement-session" })
    const replacement = await dbClient.$transaction(async (handle) =>
      ledger.startCheckout(handle, payment.id, checkoutInput)
    )

    expect(stripe.checkout.sessions.expire).toHaveBeenCalledExactlyOnceWith("checkout-session")
    expect(replacement.attempts).toHaveLength(2)
    expect(replacement.attempts.find((attempt) => attempt.id === original.attempts[0].id)?.status).toBe("EXPIRED")
    expect(
      replacement.attempts.find((attempt) => attempt.stripeCheckoutSessionId === "replacement-session")?.status
    ).toBe("CHECKOUT_OPEN")
  })

  it("repairs local state after capture succeeds but the database transaction rolls back", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("complete", "payment-intent"))
    const reservation = mock<Stripe.Response<Stripe.PaymentIntent>>({
      id: "payment-intent",
      status: "requires_capture",
      latest_charge: null,
    })
    stripe.paymentIntents.retrieve.mockResolvedValue(reservation)
    mockRefunds([])
    const checkout = await dbClient.$transaction(async (handle) =>
      ledger.startCheckout(handle, payment.id, checkoutInput)
    )
    const attemptId = checkout.attempts[0].id
    stripe.paymentIntents.capture.mockImplementation(async () => {
      const captured = { ...reservation, status: "succeeded" as const }
      stripe.paymentIntents.retrieve.mockResolvedValue(captured)

      return captured
    })

    await expect(
      dbClient.$transaction(async (handle) => {
        await ledger.capture(handle, attemptId)

        throw new Error("Simulated failure after Stripe capture")
      })
    ).rejects.toThrow("Simulated failure")

    const repaired = await ledger.capture(dbClient, attemptId)

    expect(stripe.paymentIntents.capture).toHaveBeenCalledTimes(1)
    expect(repaired.attempts[0].status).toBe("CAPTURED")
    expect(repaired.attempts[0].capturedAt).toBeInstanceOf(Date)
    expect(buildPaymentView(repaired).status).toBe("PAID")
  })

  it("imports Dashboard refunds idempotently without inventing a requesting user", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("complete", "payment-intent"))
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock<Stripe.Response<Stripe.PaymentIntent>>({
        id: "payment-intent",
        status: "succeeded",
        latest_charge: null,
      })
    )
    mockRefunds([
      mock<Stripe.Refund>({
        id: "dashboard-refund",
        amount: 5000,
        status: "succeeded",
        created: 1700000000,
        reason: null,
        metadata: {},
      }),
    ])
    const checkout = await dbClient.$transaction(async (handle) =>
      ledger.startCheckout(handle, payment.id, checkoutInput)
    )

    await dbClient.$transaction(async (handle) => ledger.syncAttempt(handle, checkout.attempts[0].id))
    const synchronized = await dbClient.$transaction(async (handle) =>
      ledger.syncAttempt(handle, checkout.attempts[0].id)
    )

    expect(synchronized.attempts[0].refunds).toHaveLength(1)
    expect(synchronized.attempts[0].refunds[0].requestedByUserId).toBeNull()
    expect(buildPaymentView(synchronized).status).toBe("PARTIALLY_REFUNDED")
    expect(buildPaymentView(synchronized).refundedAmountOre).toBe(5000)
  })

  it("retains waiver state when the administrator account is deleted", async () => {
    const { ledger, payment } = await createPayment()
    const administrator = await dbClient.user.create({
      data: {
        id: "waiver-administrator",
        username: "waiver-administrator",
      },
    })

    await dbClient.$transaction(async (handle) => ledger.waive(handle, payment.id, administrator.id, "Organizer"))
    await dbClient.user.delete({
      where: {
        id: administrator.id,
      },
    })
    const waived = await dbClient.payment.findUniqueOrThrow({
      where: {
        id: payment.id,
      },
      include: paymentInclude,
    })

    expect(waived.waivedByUserId).toBeNull()
    expect(waived.waiverReason).toBe("Organizer")
    expect(buildPaymentView(waived).status).toBe("WAIVED")
    expect(buildPaymentView(waived).isRequirementSatisfied).toBe(true)
  })
})
