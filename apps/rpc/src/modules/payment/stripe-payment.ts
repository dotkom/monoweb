import type Stripe from "stripe"
import {
  PaymentAttemptStatusSchema,
  PaymentRefundStatusSchema,
  type PaymentAttemptStatus,
  type PaymentRefundStatus,
} from "./payment"

/**
 * Stripe returns expandable fields as either an ID or the expanded resource.
 */
export function getStripeResourceId(resource: string | { id: string } | null | undefined): string | null {
  if (typeof resource === "string") {
    return resource
  }

  return resource?.id ?? null
}

export function getStripePaymentAttemptStatus(
  session: Stripe.Checkout.Session | null,
  paymentIntent: Stripe.PaymentIntent | null
): PaymentAttemptStatus {
  switch (paymentIntent?.status) {
    case "succeeded":
      return PaymentAttemptStatusSchema.enum.CAPTURED

    case "requires_capture":
      return PaymentAttemptStatusSchema.enum.AUTHORIZED

    case "processing":
      return PaymentAttemptStatusSchema.enum.PROCESSING

    case "canceled":
      return PaymentAttemptStatusSchema.enum.CANCELLED

    case "requires_payment_method":
      if (session?.status === "complete") {
        return PaymentAttemptStatusSchema.enum.FAILED
      }
  }

  if (session?.status === "expired") {
    return PaymentAttemptStatusSchema.enum.EXPIRED
  }

  return PaymentAttemptStatusSchema.enum.CHECKOUT_OPEN
}

export function getStripeRefundStatus(refund: Stripe.Refund): PaymentRefundStatus {
  switch (refund.status) {
    case "succeeded":
      return PaymentRefundStatusSchema.enum.SUCCEEDED

    case "failed":
      return PaymentRefundStatusSchema.enum.FAILED

    case "canceled":
      return PaymentRefundStatusSchema.enum.CANCELLED

    default:
      return PaymentRefundStatusSchema.enum.PENDING
  }
}
