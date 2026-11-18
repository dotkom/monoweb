import type Stripe from "stripe"
import { readFileSync } from "node:fs"
import { describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { core, dbClient, stripe } from "../../../vitest-integration.setup"
import { ConcurrentModificationError } from "../../error"
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
  const paymentRepository = getPaymentRepository()
  const ledger = getPaymentLedgerService(paymentRepository, getUserRepository(), stripe, core.taskSchedulingService)
  const payment = await dbClient.$transaction(async (handle) => {
    return await ledger.create(handle, {
      userId: user.id,
      description: "A purchase unrelated to events",
      amountOre: 15000,
    })
  })

  return { ledger, payment, paymentRepository }
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

async function openCheckout(ledger: ReturnType<typeof getPaymentLedgerService>, paymentId: string) {
  const preparedPayment = await dbClient.$transaction(async (handle) => {
    return ledger.prepareCheckout(handle, paymentId, checkoutInput)
  })

  return ledger.startCheckout(dbClient, preparedPayment.attempts[0].id)
}

describe("payment ledger persistence", () => {
  it("preserves a capture saved while an older Stripe lookup was in flight", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    const checkout = await openCheckout(ledger, payment.id)
    const attemptId = checkout.attempts[0].id

    stripe.checkout.sessions.retrieve.mockImplementationOnce(async () => {
      await dbClient.paymentAttempt.update({
        where: {
          id: attemptId,
        },
        data: {
          status: "CAPTURED",
          capturedAmountOre: payment.amountOre,
        },
      })

      return mockSession("open")
    })

    await expect(ledger.syncAttempt(dbClient, attemptId)).rejects.toThrow(ConcurrentModificationError)
    const saved = await ledger.getById(dbClient, payment.id)

    expect(saved.attempts[0].status).toBe("CAPTURED")
    expect(saved.attempts[0].capturedAmountOre).toBe(payment.amountOre)
  })

  it("rolls back checkout preparation without contacting Stripe or leaving a task", async () => {
    const { ledger, payment } = await createPayment()

    await expect(
      dbClient.$transaction(async (handle) => {
        await ledger.prepareCheckout(handle, payment.id, checkoutInput)

        throw new Error("Preparation failed")
      })
    ).rejects.toThrow("Preparation failed")

    expect(await dbClient.paymentAttempt.count()).toBe(0)
    expect(
      await dbClient.task.count({
        where: {
          type: "OPEN_PAYMENT_CHECKOUT",
        },
      })
    ).toBe(0)
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it("reuses the committed attempt and request after saving the Stripe response fails", async () => {
    const { ledger, payment, paymentRepository } = await createPayment()
    const preparedPayment = await dbClient.$transaction(async (handle) => {
      return ledger.prepareCheckout(handle, payment.id, checkoutInput)
    })
    const attemptId = preparedPayment.attempts[0].id
    stripe.checkout.sessions.create.mockImplementation(async () => {
      const committedAttempt = await dbClient.paymentAttempt.findUniqueOrThrow({
        where: {
          id: attemptId,
        },
      })

      expect(committedAttempt.status).toBe("CREATED")

      return mockSession()
    })
    vi.spyOn(paymentRepository, "attachCheckoutSession").mockRejectedValueOnce(new Error("Database unavailable"))

    await expect(ledger.startCheckout(dbClient, attemptId)).rejects.toThrow("Database unavailable")

    const checkout = await ledger.startCheckout(dbClient, attemptId)

    expect(checkout.attempts).toHaveLength(1)
    expect(checkout.attempts[0].id).toBe(attemptId)
    expect(checkout.attempts[0].status).toBe("CHECKOUT_OPEN")
    expect(stripe.checkout.sessions.create.mock.calls[1]).toEqual(stripe.checkout.sessions.create.mock.calls[0])
    expect(stripe.checkout.sessions.create.mock.calls[0][0]?.metadata).toEqual({
      payment_id: payment.id,
      payment_attempt_id: attemptId,
    })
    expect(stripe.checkout.sessions.create.mock.calls[0][1]?.idempotencyKey).toBe(`payment-checkout-${attemptId}`)
  })

  it("keeps webhook reconciliation when it arrives before the checkout response is saved", async () => {
    const { ledger, payment } = await createPayment()
    const preparedPayment = await dbClient.$transaction(async (handle) => {
      return ledger.prepareCheckout(handle, payment.id, checkoutInput)
    })
    const attemptId = preparedPayment.attempts[0].id
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("complete", "payment-intent"))
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock({
        id: "payment-intent",
        status: "succeeded",
        amount_received: 15000,
        latest_charge: null,
      })
    )
    mockRefunds([])
    stripe.checkout.sessions.create.mockImplementation(async () => {
      await ledger.syncAttempt(dbClient, attemptId, { stripeCheckoutSessionId: "checkout-session" })

      return mockSession()
    })

    const checkout = await ledger.startCheckout(dbClient, attemptId)

    expect(checkout.attempts[0].status).toBe("CAPTURED")
    expect(checkout.attempts[0].stripeCheckoutSessionId).toBe("checkout-session")
    expect(buildPaymentView(checkout).isRequirementSatisfied).toBe(true)
  })

  it("recovers refund attribution after Stripe succeeds and the local transaction rolls back", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("complete", "payment-intent"))
    stripe.paymentIntents.retrieve.mockResolvedValue(
      mock<Stripe.Response<Stripe.PaymentIntent>>({
        id: "payment-intent",
        status: "succeeded",
        amount_received: 15000,
        latest_charge: null,
      })
    )
    const providerRefunds: Stripe.Refund[] = []
    mockRefunds(providerRefunds)
    const checkout = await openCheckout(ledger, payment.id)
    const attemptId = checkout.attempts[0].id
    stripe.refunds.create.mockImplementation(async (parameters) => {
      const refund = mock<Stripe.Response<Stripe.Refund>>({
        id: "requested-refund",
        amount: 15000,
        status: "succeeded",
        created: 1700000000,
        reason: null,
        metadata: {
          refund_number: String(parameters?.metadata?.refund_number),
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
    expect(recovered.attempts[0].refunds[0].refundNumber).toBe(1)
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
          "SELECT id, amount_ore, waived_at FROM payment ORDER BY attendee_id"
        )
        const refunds = await handle.$queryRawUnsafe<{ amount_ore: number; requested_by_user_id: string }[]>(
          "SELECT amount_ore, requested_by_user_id FROM payment_refund"
        )
        const capturedAmounts = await handle.$queryRawUnsafe<{ captured_amount_ore: number }[]>(
          "SELECT captured_amount_ore FROM payment_attempt ORDER BY id"
        )
        const attempts = await handle.$queryRawUnsafe<
          { id: string; stripe_checkout_session_id: string; stripe_payment_intent_id: string }[]
        >(
          "SELECT id, stripe_checkout_session_id, stripe_payment_intent_id FROM payment_attempt WHERE payment_id = (SELECT id FROM payment WHERE attendee_id = 'paid')"
        )
        const tasks = await handle.$queryRawUnsafe<{ payload: { paymentAttemptId: string } }[]>(
          "SELECT payload FROM task WHERE id = 'capture'"
        )

        expect(payments).toHaveLength(2)
        expect(payments[0].amount_ore).toBe(15000)
        expect(payments[1].waived_at).toBeInstanceOf(Date)
        expect(refunds).toEqual([{ amount_ore: 15000, requested_by_user_id: "administrator" }])
        expect(capturedAmounts).toEqual([{ captured_amount_ore: 15000 }, { captured_amount_ore: 15000 }])
        expect(attempts).toEqual([
          { id: expect.any(String), stripe_checkout_session_id: "cs_paid", stripe_payment_intent_id: "pi_paid" },
        ])
        expect(tasks[0].payload.paymentAttemptId).toBe(attempts[0].id)

        await handle.$executeRawUnsafe("DROP SCHEMA payment_migration_test CASCADE")
      },
      {
        timeout: 30000,
      }
    )
  })

  it("enforces sequence uniqueness within each payment and attempt", async () => {
    const { payment } = await createPayment()
    const attemptData = {
      paymentId: payment.id,
      attemptNumber: 1,
      status: "CANCELLED" as const,
      captureMode: "MANUAL" as const,
    }
    const attempt = await dbClient.paymentAttempt.create({
      data: attemptData,
    })

    await expect(
      dbClient.paymentAttempt.create({
        data: attemptData,
      })
    ).rejects.toMatchObject({ code: "P2002" })

    const nextAttempt = await dbClient.paymentAttempt.create({
      data: {
        ...attemptData,
        attemptNumber: 2,
      },
    })
    const refundData = { paymentAttemptId: attempt.id, refundNumber: 1, amountOre: 100, status: "FAILED" as const }

    await dbClient.paymentRefund.create({
      data: refundData,
    })
    await expect(
      dbClient.paymentRefund.create({
        data: refundData,
      })
    ).rejects.toMatchObject({ code: "P2002" })
    await dbClient.paymentRefund.create({
      data: {
        ...refundData,
        paymentAttemptId: nextAttempt.id,
      },
    })

    expect(attempt.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it("creates standalone payments and reuses an open checkout", async () => {
    const { ledger, payment } = await createPayment()
    const session = mockSession()
    stripe.checkout.sessions.create.mockResolvedValue(session)
    stripe.checkout.sessions.retrieve.mockResolvedValue(session)

    await openCheckout(ledger, payment.id)
    const prepared = await dbClient.$transaction(async (handle) =>
      ledger.prepareCheckout(handle, payment.id, checkoutInput)
    )
    const updated = await core.paymentWorkflowService.openCheckout(dbClient, prepared.attempts[0].id)

    expect(updated.eventId).toBeNull()
    expect(updated.attendeeId).toBeNull()
    expect(updated.amountOre).toBe(15000)
    expect(updated.attempts).toHaveLength(1)
    expect(updated.attempts[0].status).toBe("CHECKOUT_OPEN")
    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1)
  })

  it("persists a cancelled session for cleanup after an expiration request fails", async () => {
    const { ledger, payment } = await createPayment()
    const prepared = await dbClient.$transaction(async (handle) =>
      ledger.prepareCheckout(handle, payment.id, checkoutInput)
    )
    const attemptId = prepared.attempts[0].id
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession())
    stripe.checkout.sessions.create.mockImplementation(async () => {
      await ledger.cancel(dbClient, attemptId)

      return mockSession()
    })
    stripe.checkout.sessions.expire
      .mockRejectedValueOnce(new Error("Connection lost"))
      .mockResolvedValueOnce(mockSession("expired"))

    await expect(ledger.startCheckout(dbClient, attemptId)).rejects.toThrow("Connection lost")

    const cancelled = await ledger.getById(dbClient, payment.id)
    expect(cancelled.attempts[0]).toMatchObject({ status: "CANCELLED", stripeCheckoutSessionId: "checkout-session" })

    const recovered = await ledger.startCheckout(dbClient, attemptId)

    expect(recovered.attempts[0].status).toBe("EXPIRED")
    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1)
    expect(stripe.checkout.sessions.expire).toHaveBeenCalledTimes(2)
  })

  it("reclaims a crashed checkout worker and prevents its stale completion from acknowledging the new claim", async () => {
    const { ledger, payment } = await createPayment()
    const prepared = await dbClient.$transaction(async (handle) =>
      ledger.prepareCheckout(handle, payment.id, checkoutInput)
    )
    const attemptId = prepared.attempts[0].id
    stripe.checkout.sessions.create
      .mockRejectedValueOnce(new Error("Creation response lost"))
      .mockResolvedValueOnce(mockSession())

    await expect(ledger.startCheckout(dbClient, attemptId)).rejects.toThrow("Creation response lost")

    const abandonedAt = new Date(Date.now() - 6 * 60 * 1000)
    await dbClient.task.updateMany({
      where: {
        type: "OPEN_PAYMENT_CHECKOUT",
      },
      data: {
        status: "RUNNING",
        processedAt: abandonedAt,
      },
    })
    const claims = await Promise.all([
      core.taskService.claimNextTask(dbClient),
      core.taskService.claimNextTask(dbClient),
    ])
    const claimedTasks = claims.filter((task) => task !== null)
    expect(claimedTasks).toHaveLength(1)
    const [claimedTask] = claimedTasks

    await core.taskService.finishTask(dbClient, { ...claimedTask, processedAt: abandonedAt }, "COMPLETED")
    expect((await core.taskService.findById(dbClient, claimedTask.id))?.status).toBe("RUNNING")

    const recovered = await core.paymentWorkflowService.openCheckout(dbClient, attemptId)
    await core.taskService.finishTask(dbClient, claimedTask, "COMPLETED")

    expect(recovered.attempts[0].status).toBe("CHECKOUT_OPEN")
    expect(stripe.checkout.sessions.create.mock.calls[1]).toEqual(stripe.checkout.sessions.create.mock.calls[0])
    expect((await core.taskService.findById(dbClient, claimedTask.id))?.status).toBe("COMPLETED")
    expect(await core.taskService.claimNextTask(dbClient)).toBeNull()
  })

  it("expires a cancelled checkout and retains it when a replacement is created", async () => {
    const { ledger, payment } = await createPayment()
    stripe.checkout.sessions.create.mockResolvedValue(mockSession())
    stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession())
    const original = await openCheckout(ledger, payment.id)
    stripe.checkout.sessions.expire.mockImplementation(async () => {
      stripe.checkout.sessions.retrieve.mockResolvedValue(mockSession("expired"))

      return mockSession("expired")
    })

    await dbClient.$transaction(async (handle) => ledger.cancel(handle, original.attempts[0].id))
    stripe.checkout.sessions.create.mockResolvedValue({ ...mockSession(), id: "replacement-session" })
    const replacement = await openCheckout(ledger, payment.id)

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
      amount_received: 0,
      latest_charge: null,
    })
    stripe.paymentIntents.retrieve.mockResolvedValue(reservation)
    mockRefunds([])
    const checkout = await openCheckout(ledger, payment.id)
    const attemptId = checkout.attempts[0].id
    stripe.paymentIntents.capture.mockImplementation(async () => {
      const captured = { ...reservation, status: "succeeded" as const, amount_received: 15000 }
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
        amount_received: 15000,
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
    const checkout = await openCheckout(ledger, payment.id)

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
