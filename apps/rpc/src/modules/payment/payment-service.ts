import type { User } from "@dotkomonline/types"
import type Stripe from "stripe"
import invariant from "tiny-invariant"
import { FailedPreconditionError, IllegalStateError, ResourceExhaustedError } from "../../error"

type PaymentStatus = "UNPAID" | "CANCELLED" | "RESERVED" | "PAID" | "REFUNDED"
type ChargeMode = "RESERVE" | "CHARGE"
const STRIPE_URL_PREFIX = "https://dashboard.stripe.com/payments/"

export type Payment =
  | {
      status: "UNPAID" | "CANCELLED"
      url: string | null
      id: string
      paymentIntentId: null
      checkoutUrl: null
    }
  | {
      status: "RESERVED" | "PAID" | "REFUNDED"
      url: string | null
      id: string
      paymentIntentId: string
      checkoutUrl: string
    }

type PaymentId = string

export interface PaymentService {
  create(productId: PaymentId, user: User, chargeMode?: ChargeMode): Promise<Payment>
  cancel(paymentId: PaymentId): Promise<void>
  getById(paymentId: PaymentId): Promise<Payment>
  charge(paymentId: PaymentId): Promise<void>
  refund(paymentId: PaymentId): Promise<void>
}

export function getPaymentService(stripe: Stripe): PaymentService {
  function paymentIntentStatus(intentStatus: Stripe.PaymentIntent.Status): PaymentStatus {
    switch (intentStatus) {
      case "succeeded":
        return "PAID"
      case "requires_capture":
        return "RESERVED"
      case "canceled":
        return "CANCELLED"
      default:
        return "UNPAID"
    }
  }

  return {
    async getById(paymentId): Promise<Payment> {
      const session = await stripe.checkout.sessions.retrieve(paymentId)
      invariant(session.payment_intent === null || typeof session.payment_intent === "string")
      const paymentIntent = session.payment_intent
        ? await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ["latest_charge"],
          })
        : null
      invariant(typeof paymentIntent?.latest_charge !== "string")

      if (!paymentIntent) {
        return { status: "UNPAID", url: null, id: session.id, paymentIntentId: null, checkoutUrl: null }
      }
      if (paymentIntent.latest_charge?.refunded) {
        return {
          status: "REFUNDED",
          url: null,
          id: paymentId,
          paymentIntentId: paymentIntent.id,
          checkoutUrl: STRIPE_URL_PREFIX + paymentIntent.id,
        }
      }
      const status = paymentIntentStatus(paymentIntent.status)
      if (status === "UNPAID" || status === "CANCELLED") {
        return { status, url: null, id: paymentId, paymentIntentId: null, checkoutUrl: null }
      }

      return {
        status,
        url: session.url,
        id: session.id,
        paymentIntentId: paymentIntent.id,
        checkoutUrl: STRIPE_URL_PREFIX + paymentIntent.id,
      }
    },
    async create(productId, user, chargeMode = "RESERVE") {
      const product = await stripe.products.retrieve(productId)
      if (!product.default_price) {
        throw new IllegalStateError(`Product of Payment(ProductID: ${productId}) does not have a default price`)
      }
      const defaultPrice = typeof product.default_price === "string" ? product.default_price : product.default_price.id

      const session = await stripe.checkout.sessions.create({
        line_items: [{ quantity: 1, price: defaultPrice }],
        success_url: product.url ?? undefined,
        cancel_url: product.url ?? undefined,
        mode: "payment",
        ...(chargeMode === "CHARGE" ? {} : { payment_intent_data: { capture_method: "manual" } }),
        customer_email: user.email || "dotkom+stripe-no-customer-email@online.ntnu.no",
        payment_intent_data: {
          description: product.name,
        },
      })

      return {
        status: "UNPAID",
        url: session.url,
        id: session.id,
        paymentIntentId: null,
        checkoutUrl: null,
      }
    },

    async cancel(paymentId): Promise<void> {
      const payment = await this.getById(paymentId)

      if (payment.status === "PAID") {
        throw new ResourceExhaustedError(`Payment(ID=${paymentId}) has already been paid and cannot be cancelled`)
      }

      if (payment.status === "CANCELLED") {
        return
      }

      if (payment.status === "RESERVED") {
        await stripe.paymentIntents.cancel(payment.paymentIntentId)
      }
    },

    async getById(paymentId): Promise<Payment> {
      const session = await stripe.checkout.sessions.retrieve(paymentId)
      invariant(session.payment_intent === null || typeof session.payment_intent === "string")
      const paymentIntent = session.payment_intent
        ? await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ["latest_charge"],
          })
        : null
      invariant(typeof paymentIntent?.latest_charge !== "string")

      if (!paymentIntent) {
        return { status: "UNPAID", url: null, id: session.id, paymentIntentId: null }
      }
      if (paymentIntent.latest_charge?.refunded) {
        return { status: "REFUNDED", url: null, id: paymentId, paymentIntentId: paymentIntent.id }
      }
      const status = paymentIntentStatus(paymentIntent.status)
      if (status === "UNPAID" || status === "CANCELLED") {
        return { status, url: null, id: paymentId, paymentIntentId: null }
      }

      return {
        status,
        url: session.url,
        id: session.id,
        paymentIntentId: paymentIntent.id,
      }
    },

    async charge(paymentId) {
      const payment = await this.getById(paymentId)

      switch (payment.status) {
        case "UNPAID":
        case "CANCELLED":
          throw new FailedPreconditionError(`Payment(ID=${paymentId}) is not ready to be charged`)
        case "PAID":
          throw new ResourceExhaustedError(`Payment(ID=${paymentId}) has already been paid`)
        case "RESERVED":
          await stripe.paymentIntents.capture(payment.paymentIntentId)
          break
        default:
          throw new Error("This should be unreachable")
      }
    },

    async refund(paymentId) {
      const payment = await this.getById(paymentId)

      if (payment.status !== "PAID") {
        throw new FailedPreconditionError(`Payment(ID=${paymentId}) is not paid and cannot be refunded`)
      }

      await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
      })
    },
  }
}
