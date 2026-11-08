import type { DBHandle } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { fromUnixTime, min, subHours } from "date-fns"
import type Stripe from "stripe"
import { FailedPreconditionError, NotFoundError } from "../../error"
import {
  buildPaymentView,
  getRefundedAmountOre,
  type CheckoutInput,
  type CreatePaymentInput,
  type PaymentAttemptIdentifiers,
  type PaymentRecord,
  type PaymentAttempt,
} from "./payment"
import type { UserRepository } from "../user/user-repository"
import type { PaymentRepository } from "./payment-repository"
import { getStripePaymentAttemptStatus, getStripeRefundStatus, getStripeResourceId } from "./stripe-payment"

const AUTHORIZATION_CAPTURE_MARGIN_HOURS = 1

export interface PaymentLedgerService {
  create(handle: DBHandle, input: CreatePaymentInput): Promise<PaymentRecord>
  cancel(handle: DBHandle, attemptId: string): Promise<PaymentRecord>
  getById(handle: DBHandle, paymentId: string): Promise<PaymentRecord>
  findAttemptByIdentifiers(handle: DBHandle, identifiers: PaymentAttemptIdentifiers[]): Promise<PaymentAttempt | null>
  startCheckout(handle: DBHandle, paymentId: string, input: CheckoutInput): Promise<PaymentRecord>
  syncAttempt(handle: DBHandle, attemptId: string): Promise<PaymentRecord>
  capture(handle: DBHandle, attemptId: string): Promise<PaymentRecord>
  refund(handle: DBHandle, attemptId: string, requestedByUserId: string): Promise<PaymentRecord>
  waive(handle: DBHandle, paymentId: string, waivedByUserId: string, reason: string | null): Promise<PaymentRecord>
}

export function getPaymentLedgerService(
  paymentRepository: PaymentRepository,
  userRepository: UserRepository,
  stripe: Stripe
): PaymentLedgerService {
  async function syncRefunds(handle: DBHandle, attemptId: string, paymentIntentId: string): Promise<void> {
    const refunds = stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    })

    for await (const refund of refunds) {
      const status = getStripeRefundStatus(refund)
      const localRefundId = refund.metadata?.payment_refund_id
      const localRefund =
        typeof localRefundId !== "string"
          ? null
          : await paymentRepository.findUnlinkedRefund(handle, localRefundId, attemptId)

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

      await paymentRepository.upsertStripeRefund(handle, refund.id, {
        paymentAttemptId: attemptId,
        amountOre: refund.amount,
        status,
        reason: refund.reason,
        requestedByUserId: requestingUser?.id ?? null,
        createdAt: fromUnixTime(refund.created),
      })
    }
  }

  return {
    async getById(handle, paymentId) {
      const payment = await paymentRepository.findById(handle, paymentId)

      if (payment === null) {
        throw new NotFoundError(`Payment(ID=${paymentId}) not found`)
      }

      return payment
    },

    async syncAttempt(handle, attemptId) {
      const payment = await paymentRepository.findByAttemptId(handle, attemptId)

      if (payment === null) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      const attempt = payment.attempts.find((candidate) => candidate.id === attemptId)

      if (attempt === undefined) {
        throw new NotFoundError(`PaymentAttempt(ID=${attemptId}) not found`)
      }

      if (attempt.stripeCheckoutSessionId === null && attempt.stripePaymentIntentId === null) {
        return payment
      }

      const session =
        attempt.stripeCheckoutSessionId === null
          ? null
          : await stripe.checkout.sessions.retrieve(attempt.stripeCheckoutSessionId)
      const paymentIntentId = getStripeResourceId(session?.payment_intent) ?? attempt.stripePaymentIntentId
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

      await paymentRepository.updateAttempt(handle, attemptId, {
        status,
        stripePaymentIntentId: paymentIntentId,
        checkoutUrl: session?.url ?? null,
        checkoutExpiresAt: session === null ? attempt.checkoutExpiresAt : fromUnixTime(session.expires_at),
        authorizedAt,
        authorizationExpiresAt,
        captureScheduledAt,
        capturedAt: status === "CAPTURED" ? (attempt.capturedAt ?? now) : attempt.capturedAt,
        lastSyncedAt: now,
      })

      if (paymentIntentId !== null) {
        await syncRefunds(handle, attemptId, paymentIntentId)
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
        id: input.attendeeId === undefined ? undefined : `attendance-payment:${input.attendeeId}`,
      })
    },

    async startCheckout(handle, paymentId, input) {
      let payment = await this.getById(handle, paymentId)
      let latestAttempt = payment.attempts[0]

      const hasCheckoutSession = latestAttempt?.stripeCheckoutSessionId != null
      const hasPaymentIntent = latestAttempt?.stripePaymentIntentId != null

      if (hasCheckoutSession || hasPaymentIntent) {
        payment = await this.syncAttempt(handle, latestAttempt.id)
        latestAttempt = payment.attempts[0]
      }

      const view = buildPaymentView(payment)

      if (!view.canStartCheckout) {
        throw new FailedPreconditionError(`Payment(ID=${paymentId}) cannot start checkout in status ${view.status}`)
      }

      if (latestAttempt?.status === "CHECKOUT_OPEN") {
        return payment
      }

      let attempt: PaymentAttempt

      if (latestAttempt?.status === "CREATED") {
        attempt = latestAttempt
      } else {
        attempt = await paymentRepository.createAttempt(handle, {
          id: `${paymentId}:checkout:${payment.attempts.length + 1}`,
          paymentId,
          captureMode: input.captureMode,
          captureScheduledAt: input.captureScheduledAt,
        })
      }

      const metadata = {
        payment_id: paymentId,
        payment_attempt_id: attempt.id,
      }

      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          adaptive_pricing: {
            enabled: false,
          },
          success_url: input.returnUrl,
          cancel_url: input.returnUrl,
          customer_email: input.customerEmail ?? undefined,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "nok",
                unit_amount: payment.amountOre,
                product_data: {
                  name: payment.description,
                },
              },
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

      await paymentRepository.updateAttempt(handle, attempt.id, {
        status: "CHECKOUT_OPEN",
        stripeCheckoutSessionId: session.id,
        checkoutUrl: session.url,
        checkoutExpiresAt: fromUnixTime(session.expires_at),
      })

      return await this.getById(handle, paymentId)
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

      if (attempt.status === "CAPTURED" && refundedAmountOre >= payment.amountOre) {
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
        throw new FailedPreconditionError(`PaymentAttempt(ID=${attemptId}) cannot be cancelled`)
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
      const amountOre = payment.amountOre - refundedAmountOre

      if (amountOre <= 0) {
        return payment
      }

      let refund = attempt.refunds.find((refund) => refund.status === "REQUESTED")

      if (refund === undefined) {
        refund = await paymentRepository.createRefund(handle, {
          id: `${attemptId}:refund:${attempt.refunds.length + 1}`,
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
            payment_refund_id: refund.id,
            requested_by_user_id: refund.requestedByUserId ?? "",
          },
        },
        {
          idempotencyKey: `payment-refund-${refund.id}`,
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
