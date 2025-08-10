import type Stripe from "stripe"
import {
  PaymentAlreadyChargedError,
  PaymentNotChargedError,
  PaymentNotReadyToChargeError,
  PaymentUnexpectedStateError,
} from "./payment-error"

type PaymentStatus = "UNPAID" | "CANCELLED" | "RESERVED" | "PAID"
type ChargeMode = "RESERVE" | "CHARGE"

export type Payment =
  | {
      status: "UNPAID" | "CANCELLED"
      url: string | null
      id: string
      paymentIntentId: null
    }
  | {
      status: "RESERVED" | "PAID"
      url: string | null
      id: string
      paymentIntentId: string
    }

type PaymentId = string

export interface PaymentService {
  create(productId: PaymentId, chargeMode?: ChargeMode): Promise<Payment>
  cancel(paymentId: PaymentId): Promise<void>
  refund(paymentId: PaymentId): Promise<void>
  charge(paymentId: PaymentId): Promise<void>
  getById(paymentId: PaymentId): Promise<Payment>
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
      const session = await stripe.checkout.sessions.retrieve(paymentId, {
        expand: ["payment_intent"],
      })

      if (!session.payment_intent) {
        return { status: "UNPAID", url: null, id: session.id, paymentIntentId: null }
      }
      if (typeof session.payment_intent === "string") {
        throw new Error("This is unreachable")
      }
      const status = paymentIntentStatus(session.payment_intent.status)
      if (status === "UNPAID" || status === "CANCELLED") {
        return { status, url: null, id: paymentId, paymentIntentId: null }
      }

      const paymentIntentId = session.payment_intent.id
      const url = session.url

      return {
        status,
        url,
        id: session.id,
        paymentIntentId: paymentIntentId,
      }
    },
    async create(productId, chargeMode = "RESERVE") {
      const product = await stripe.products.retrieve(productId)
      if (!product.default_price) {
        throw new PaymentUnexpectedStateError(
          `(productId: ${productId})`,
          "Payment product does not have a default price"
        )
      }
      const defaultPrice = typeof product.default_price === "string" ? product.default_price : product.default_price.id

      const session = await stripe.checkout.sessions.create({
        line_items: [{ quantity: 1, price: defaultPrice }],
        success_url: product.url ?? undefined,
        cancel_url: product.url ?? undefined,
        mode: "payment",
        ...(chargeMode === "CHARGE" ? {} : { payment_intent_data: { capture_method: "manual" } }),
        customer_email: "jotjernshaugen@gmail.com",
      })

      return {
        status: "UNPAID",
        url: session.url,
        id: session.id,
        paymentIntentId: null,
      }
    },
    async cancel(paymentId): Promise<void> {
      const payment = await this.getById(paymentId)

      if (payment.status === "PAID") {
        throw new PaymentAlreadyChargedError(paymentId)
      }

      if (payment.status === "CANCELLED") {
        return
      }

      if (payment.paymentIntentId === "RESERVED") {
        await stripe.paymentIntents.cancel(payment.paymentIntentId)
      }
    },
    async charge(paymentId) {
      const payment = await this.getById(paymentId)

      switch (payment.status) {
        case "UNPAID":
        case "CANCELLED":
          throw new PaymentNotReadyToChargeError(paymentId)
        case "PAID":
          throw new PaymentAlreadyChargedError(paymentId)
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
        throw new PaymentNotChargedError(paymentId)
      }

      await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
      })
    },
  }
}
