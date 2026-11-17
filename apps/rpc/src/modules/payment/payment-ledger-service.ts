import type { DBClient, DBHandle } from "@dotkomonline/db"
import { createAbsoluteEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import { fromUnixTime, min, subHours } from "date-fns"
import Stripe from "stripe"
import { TZDate } from "@date-fns/tz"
import { runInAuditedDatabaseTransaction } from "../../middlewares"
import { tasks } from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import { FailedPreconditionError, NotFoundError } from "../../error"
import {
  buildPaymentView,
  getRefundedAmountOre,
  type CheckoutInput,
  type CreatePaymentInput,
  type PaymentAttemptIdentifiers,
  type PaymentAttemptUpdate,
  type PaymentRecord,
  type PaymentAttempt,
} from "./payment"
import type { UserRepository } from "../user/user-repository"
import type { PaymentRepository } from "./payment-repository"
import { getStripePaymentAttemptStatus, getStripeRefundStatus, getStripeResourceId } from "./stripe-payment"

const AUTHORIZATION_CAPTURE_MARGIN_HOURS = 1

export interface PaymentLedgerService {
  getById(handle: DBHandle, paymentId: string): Promise<PaymentRecord>
  findAttemptByIdentifiers(handle: DBHandle, identifiers: PaymentAttemptIdentifiers[]): Promise<PaymentAttempt | null>

  /**
   * Creates a local payment with an amount in øre, without contacting Stripe.
   */
  create(handle: DBHandle, input: CreatePaymentInput): Promise<PaymentRecord>

  /**
   * Cancels an unpaid payment attempt or payment authorization. Captured money must be refunded separately.
   */
  cancel(handle: DBHandle, attemptId: string): Promise<PaymentRecord>

  /**
   * Reuses an active payment attempt or saves a new payment attempt and a task to open Stripe checkout.
   */
  prepareCheckout(handle: DBHandle, paymentId: string, input: CheckoutInput): Promise<PaymentRecord>

  /**
   * Creates or recovers the Stripe checkout for a payment attempt.
   */
  startCheckout(client: DBClient, attemptId: string): Promise<PaymentRecord>

  /**
   * Updates a payment attempt and its refunds using Stripe data. Returns the updated payment.
   */
  syncAttempt(handle: DBHandle, attemptId: string, identifiers?: PaymentAttemptIdentifiers): Promise<PaymentRecord>

  /**
   * Captures an authorized payment attempt in Stripe and saves the updated payment status.
   */
  capture(handle: DBHandle, attemptId: string): Promise<PaymentRecord>

  /**
   * Refunds the remaining captured balance for a payment attempt. Keeps the original requesting user when retrying.
   */
  refund(handle: DBHandle, attemptId: string, requestedByUserId: string): Promise<PaymentRecord>

  /**
   * Records a waiver without moving money. Any active payment attempts must be cancelled first.
   */
  waive(handle: DBHandle, paymentId: string, waivedByUserId: string, reason: string | null): Promise<PaymentRecord>
}

export function getPaymentLedgerService(
  paymentRepository: PaymentRepository,
  userRepository: UserRepository,
  stripe: Stripe,
  taskSchedulingService: TaskSchedulingService
): PaymentLedgerService {
  async function saveRefunds(handle: DBHandle, attemptId: string, refunds: Stripe.Refund[]): Promise<void> {
    for (const refund of refunds) {
      const status = getStripeRefundStatus(refund)
      const refundNumber = Number(refund.metadata?.refund_number)
      const localRefund =
        !Number.isSafeInteger(refundNumber) || refundNumber <= 0
          ? null
          : await paymentRepository.findUnlinkedRefund(handle, refundNumber, attemptId)

      if (localRefund !== null) {
        await paymentRepository.updateRefund(handle, localRefund.id, {
          stripeRefundId: refund.id,
          status,
          amountOre: refund.amount,
        })

        continue
      }

      // A refund may survive a rolled-back local transaction. Recover its actor only if the user still exists.
      const requestedByUserId = refund.metadata?.requested_by_user_id
      const requestingUser =
        typeof requestedByUserId === "string" ? await userRepository.findById(handle, requestedByUserId) : null

      const validatedRefundNumber = Number.isSafeInteger(refundNumber) && refundNumber > 0 ? refundNumber : null

      await paymentRepository.upsertStripeRefund(handle, refund.id, {
        paymentAttemptId: attemptId,
        refundNumber: validatedRefundNumber,
        amountOre: refund.amount,
        status,
        reason: refund.reason,
        requestedByUserId: requestingUser?.id ?? null,
        createdAt: fromUnixTime(refund.created),
      })
    }
  }

  async function getEventProduct(eventId: string, name: string, url: string): Promise<Stripe.Product> {
    const productId = `event_${eventId}`

    try {
      return await stripe.products.retrieve(productId)
    } catch (error) {
      if (!(error instanceof Stripe.errors.StripeInvalidRequestError) || error.code !== "resource_missing") {
        throw error
      }
    }

    return await stripe.products.create(
      {
        id: productId,
        name,
        description: `Påmelding til ${name}`,
        url,
        metadata: {
          event_id: eventId,
          event_url: url,
        },
      },
      {
        idempotencyKey: `event-product-${eventId}`,
      }
    )
  }

  return {
    async getById(handle, paymentId) {
      const payment = await paymentRepository.findById(handle, paymentId)

      if (payment === null) {
        throw new NotFoundError(`Payment(ID=${paymentId}) not found`)
      }

      return payment
    },

    async syncAttempt(handle, attemptId, identifiers) {
      const payment = await paymentRepository.findByAttemptId(handle, attemptId)

      if (payment === null) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      const attempt = payment.attempts.find((candidate) => candidate.id === attemptId)

      if (attempt === undefined) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      if (
        attempt.stripeCheckoutSessionId === null &&
        attempt.stripePaymentIntentId === null &&
        identifiers?.stripeCheckoutSessionId == null &&
        identifiers?.stripePaymentIntentId == null
      ) {
        return payment
      }

      const stripeCheckoutSessionId = attempt.stripeCheckoutSessionId ?? identifiers?.stripeCheckoutSessionId
      const stripePaymentIntentId = attempt.stripePaymentIntentId ?? identifiers?.stripePaymentIntentId
      let session =
        stripeCheckoutSessionId == null ? null : await stripe.checkout.sessions.retrieve(stripeCheckoutSessionId)

      if (attempt.status === "CANCELLED" && session?.status === "open") {
        session = await stripe.checkout.sessions.expire(session.id)
      }

      const paymentIntentId = getStripeResourceId(session?.payment_intent) ?? stripePaymentIntentId ?? null
      const paymentIntent =
        paymentIntentId === null
          ? null
          : await stripe.paymentIntents.retrieve(paymentIntentId, {
              expand: ["latest_charge"],
            })

      const currency = session?.currency ?? paymentIntent?.currency
      const amountOre = session?.amount_total ?? paymentIntent?.amount

      if (currency !== "nok" || amountOre == null) {
        throw new FailedPreconditionError(`PaymentAttempt(ID=${attempt.id}) does not have a NOK amount`)
      }

      if (amountOre !== payment.amountOre) {
        throw new FailedPreconditionError(
          `PaymentAttempt(ID=${attempt.id}) does not match Payment(ID=${attempt.paymentId})`
        )
      }

      const status = getStripePaymentAttemptStatus(session, paymentIntent)

      const latestCharge = paymentIntent?.latest_charge
      const charge = latestCharge != null && typeof latestCharge !== "string" ? latestCharge : null

      const captureBefore = charge?.payment_method_details?.card?.capture_before ?? null
      const authorizedAt = charge === null ? attempt.authorizedAt : fromUnixTime(charge.created)
      const authorizationExpiresAt = captureBefore === null ? null : fromUnixTime(captureBefore)

      const now = getCurrentUTC()

      const authorizationCaptureDeadline =
        authorizationExpiresAt === null ? null : subHours(authorizationExpiresAt, AUTHORIZATION_CAPTURE_MARGIN_HOURS)

      const captureScheduledAt =
        status === "AUTHORIZED" && authorizationCaptureDeadline !== null
          ? min([attempt.captureScheduledAt ?? now, authorizationCaptureDeadline])
          : attempt.captureScheduledAt

      const update: PaymentAttemptUpdate = {
        status,
        stripeCheckoutSessionId: stripeCheckoutSessionId ?? null,
        capturedAmountOre: paymentIntent?.amount_received ?? attempt.capturedAmountOre,
        stripePaymentIntentId: paymentIntentId,
        checkoutUrl: session?.url ?? attempt.checkoutUrl,
        checkoutExpiresAt: session === null ? attempt.checkoutExpiresAt : fromUnixTime(session.expires_at),
        authorizedAt,
        authorizationExpiresAt,
        captureScheduledAt,
        capturedAt: status === "CAPTURED" ? (attempt.capturedAt ?? now) : attempt.capturedAt,
        lastSyncedAt: now,
      }

      const expectedAttempt = {
        updatedAt: attempt.updatedAt,
        status: attempt.status,
      }

      const refunds: Stripe.Refund[] = []

      if (paymentIntentId !== null) {
        const pages = stripe.refunds.list({
          payment_intent: paymentIntentId,
          limit: 100,
        })

        for await (const refund of pages) {
          refunds.push(refund)
        }
      }

      async function saveReconciliation(database: DBHandle) {
        await paymentRepository.updateAttempt(database, attemptId, update, expectedAttempt)
        await saveRefunds(database, attemptId, refunds)
      }

      if (refunds.length > 0 && isDatabaseClient(handle)) {
        await handle.$transaction(saveReconciliation)
      } else {
        await saveReconciliation(handle)
      }

      return await this.getById(handle, attempt.paymentId)
    },

    async findAttemptByIdentifiers(handle, identifiers) {
      return await paymentRepository.findAttemptByIdentifiers(handle, identifiers)
    },

    async create(handle, input) {
      if (!Number.isSafeInteger(input.amountOre) || input.amountOre <= 0) {
        throw new FailedPreconditionError("Payment amount must be a positive integer in øre")
      }

      return await paymentRepository.create(handle, {
        ...input,
      })
    },

    async prepareCheckout(handle, paymentId, input) {
      const payment = await this.getById(handle, paymentId)
      const latestAttempt = payment.attempts[0]
      const view = buildPaymentView(payment)

      if (!view.canStartCheckout) {
        throw new FailedPreconditionError(`Payment(ID=${paymentId}) cannot start checkout in status ${view.status}`)
      }

      if (latestAttempt?.status === "CREATED" || latestAttempt?.status === "CHECKOUT_OPEN") {
        return payment
      }

      const attemptNumbers = payment.attempts.map((attempt) => attempt.attemptNumber)
      const attemptNumber = Math.max(0, ...attemptNumbers) + 1
      const attempt = await paymentRepository.createAttempt(handle, {
        attemptNumber,
        paymentId,
        captureMode: input.captureMode,
        captureScheduledAt: input.captureScheduledAt,
        checkoutReturnUrl: input.returnUrl,
        checkoutCustomerEmail: input.customerEmail,
      })

      await taskSchedulingService.scheduleAt(
        handle,
        tasks.OPEN_PAYMENT_CHECKOUT,
        {
          paymentAttemptId: attempt.id,
        },
        new TZDate(getCurrentUTC())
      )

      return await this.getById(handle, paymentId)
    },

    async startCheckout(client, attemptId) {
      let payment = await paymentRepository.findByAttemptId(client, attemptId)
      let attempt = payment?.attempts.find((candidate) => candidate.id === attemptId)

      if (payment == null || attempt === undefined) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      if (attempt.stripeCheckoutSessionId !== null || attempt.stripePaymentIntentId !== null) {
        return await this.syncAttempt(client, attemptId)
      }

      if (attempt.status === "CREATED" && payment.waivedAt === null) {
        await paymentRepository.markCheckoutRequested(client, attemptId, getCurrentUTC())
        payment = await this.getById(client, payment.id)
        attempt = payment.attempts.find((candidate) => candidate.id === attemptId)
      }

      if (attempt === undefined) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      const needsCancellationRecovery = attempt.status === "CANCELLED" && attempt.checkoutRequestedAt !== null

      if (
        (attempt.status !== "CREATED" && !needsCancellationRecovery) ||
        (payment.waivedAt !== null && !needsCancellationRecovery)
      ) {
        return payment
      }

      if (attempt.checkoutReturnUrl === null) {
        throw new FailedPreconditionError(`PaymentAttempt(ID=${attemptId}) has no checkout request`)
      }

      // Attendees can be deleted and users can be merged. Retry metadata must stay unchanged.
      const metadata: Record<string, string> = {
        payment_id: payment.id,
        payment_attempt_id: attempt.id,
      }

      const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
        currency: "nok",
        unit_amount: payment.amountOre,
      }

      if (payment.eventId !== null) {
        const eventUrl = createAbsoluteEventPageUrl(new URL(attempt.checkoutReturnUrl).origin, payment.eventId)
        const product = await getEventProduct(payment.eventId, payment.description, eventUrl)
        priceData.product = product.id
        metadata.event_id = payment.eventId
        // Stripe metadata values are limited to 500 characters. Keep the full title on the product itself.
        metadata.event_title = payment.description.slice(0, 500)
        metadata.event_url = eventUrl
      } else {
        priceData.product_data = {
          name: payment.description,
        }
      }

      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          client_reference_id: payment.id,
          adaptive_pricing: {
            enabled: false,
          },
          success_url: attempt.checkoutReturnUrl,
          cancel_url: attempt.checkoutReturnUrl,
          customer_email: attempt.checkoutCustomerEmail ?? undefined,
          line_items: [
            {
              quantity: 1,
              price_data: priceData,
            },
          ],
          metadata,
          payment_intent_data: {
            metadata,
            description: payment.description,
            capture_method: attempt.captureMode === "MANUAL" ? "manual" : "automatic",
          },
        },
        {
          idempotencyKey: `payment-checkout-${attempt.id}`,
        }
      )

      await runInAuditedDatabaseTransaction(
        {
          prisma: client,
          principal: null,
          procedure: "payment.openCheckout",
        },
        async ({ handle }) => {
          await paymentRepository.attachCheckoutSession(handle, attempt.id, {
            status: "CHECKOUT_OPEN",
            stripeCheckoutSessionId: session.id,
            checkoutUrl: session.url,
            checkoutExpiresAt: fromUnixTime(session.expires_at),
          })
        }
      )

      const updatedPayment = await this.getById(client, payment.id)
      const updatedAttempt = updatedPayment.attempts.find((candidate) => candidate.id === attempt.id)

      // Deregistration can cancel an attempt while Stripe is still creating its session.
      if (updatedAttempt?.status === "CANCELLED") {
        return await this.syncAttempt(client, attempt.id)
      }

      return updatedPayment
    },

    async capture(handle, attemptId) {
      const payment = await this.syncAttempt(handle, attemptId)
      const attempt = payment.attempts.find((candidate) => candidate.id === attemptId)

      if (attempt === undefined) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      if (attempt.status === "CAPTURED") {
        return payment
      }

      if (payment.waivedAt !== null || attempt.status !== "AUTHORIZED" || attempt.stripePaymentIntentId === null) {
        throw new FailedPreconditionError(`PaymentAttempt(ID=${attemptId}) cannot be captured`)
      }

      await stripe.paymentIntents.capture(
        attempt.stripePaymentIntentId,
        {},
        {
          idempotencyKey: `payment-capture-${attemptId}`,
        }
      )

      return await this.syncAttempt(handle, attemptId)
    },

    async cancel(handle, attemptId) {
      const payment = await this.syncAttempt(handle, attemptId)
      const attempt = payment.attempts.find((candidate) => candidate.id === attemptId)

      if (attempt === undefined) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      if (attempt.status === "CANCELLED" || attempt.status === "EXPIRED" || attempt.status === "FAILED") {
        return payment
      }

      const refundedAmountOre = getRefundedAmountOre(attempt.refunds)

      if (attempt.status === "CAPTURED" && refundedAmountOre >= attempt.capturedAmountOre) {
        return payment
      }

      if (attempt.status === "CREATED" && attempt.stripeCheckoutSessionId === null) {
        await paymentRepository.updateAttempt(handle, attemptId, {
          status: "CANCELLED",
        })

        return await this.getById(handle, payment.id)
      }

      if (attempt.status === "CHECKOUT_OPEN" && attempt.stripeCheckoutSessionId !== null) {
        await stripe.checkout.sessions.expire(attempt.stripeCheckoutSessionId)
      } else if (attempt.status === "AUTHORIZED" && attempt.stripePaymentIntentId !== null) {
        await stripe.paymentIntents.cancel(
          attempt.stripePaymentIntentId,
          {},
          {
            idempotencyKey: `payment-cancel-${attemptId}`,
          }
        )
      } else {
        throw new FailedPreconditionError(
          `PaymentAttempt(ID=${attemptId}) cannot be cancelled: status=${attempt.status}, ` +
            `stripeCheckoutSessionId=${attempt.stripeCheckoutSessionId}, ` +
            `stripePaymentIntentId=${attempt.stripePaymentIntentId}. ` +
            "Expected an open checkout session or an authorized payment intent; captured payments must be refunded."
        )
      }

      return await this.syncAttempt(handle, attemptId)
    },

    async refund(handle, attemptId, requestedByUserId) {
      const payment = await this.syncAttempt(handle, attemptId)
      const attempt = payment.attempts.find((candidate) => candidate.id === attemptId)

      if (attempt === undefined || attempt.status !== "CAPTURED" || attempt.stripePaymentIntentId === null) {
        throw new FailedPreconditionError(`PaymentAttempt(ID=${attemptId}) cannot be refunded`)
      }

      const hasPendingRefund = attempt.refunds.some((refund) => refund.status === "PENDING")

      if (hasPendingRefund) {
        return payment
      }

      const refundedAmountOre = getRefundedAmountOre(attempt.refunds)
      const amountOre = attempt.capturedAmountOre - refundedAmountOre

      if (amountOre <= 0) {
        return payment
      }

      let refund = attempt.refunds.find((refund) => refund.status === "REQUESTED")

      if (refund === undefined) {
        const refundNumbers = attempt.refunds.map((refund) => refund.refundNumber ?? 0)
        const refundNumber = Math.max(0, ...refundNumbers) + 1

        refund = await paymentRepository.createRefund(handle, {
          refundNumber,
          paymentAttemptId: attemptId,
          amountOre,
          requestedByUserId,
        })
      }

      await stripe.refunds.create(
        {
          payment_intent: attempt.stripePaymentIntentId,
          amount: refund.amountOre,
          metadata: {
            refund_number: String(refund.refundNumber),
            requested_by_user_id: refund.requestedByUserId ?? "",
          },
        },
        {
          idempotencyKey: `payment-refund-${attemptId}:${refund.refundNumber}`,
        }
      )

      return await this.syncAttempt(handle, attemptId)
    },

    async waive(handle, paymentId, waivedByUserId, reason) {
      const payment = await this.getById(handle, paymentId)

      if (payment.waivedAt !== null) {
        return payment
      }

      const hasActiveAttempt = payment.attempts.some(
        (attempt) =>
          attempt.status === "AUTHORIZED" ||
          attempt.status === "PROCESSING" ||
          attempt.status === "CHECKOUT_OPEN" ||
          attempt.status === "CREATED"
      )

      if (hasActiveAttempt) {
        throw new FailedPreconditionError("Cancel active payment attempts before waiving the requirement")
      }

      return await paymentRepository.update(handle, paymentId, {
        waivedAt: getCurrentUTC(),
        waivedByUserId,
        waiverReason: reason,
      })
    },
  }
}

function isDatabaseClient(handle: DBHandle): handle is DBClient {
  return "$transaction" in handle
}
