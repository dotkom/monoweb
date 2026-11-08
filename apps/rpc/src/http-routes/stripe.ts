import type { FastifyInstance } from "fastify"
import { getLogger } from "@dotkomonline/logger"
import type Stripe from "stripe"
import { z } from "zod"
import type { PaymentAttemptIdentifiers } from "../modules/payment/payment"
import { getStripeResourceId } from "../modules/payment/stripe-payment"
import type { ServiceLayer } from "../modules/core"
import { STRIPE_PAYMENT_EVENTS } from "../modules/payment/payment-webhook-service"

const StripePaymentObjectSchema = z.object({
  id: z.string(),
  object: z.string(),
  payment_intent: z.union([z.string(), z.object({ id: z.string() })]).nullish(),
  metadata: z.record(z.string(), z.string()).nullish(),
})

export function registerStripeWebhookRoutes(server: FastifyInstance, serviceLayer: ServiceLayer) {
  const logger = getLogger("stripe-webhook")

  server.post("/webhook/stripe", { config: { rawBody: true } }, async (request, reply) => {
    const signatureHeader = request.headers["stripe-signature"]
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader

    if (signature === undefined || request.rawBody === undefined) {
      logger.warn(
        "Rejected Stripe webhook: signature present=%s, raw body present=%s",
        signature !== undefined,
        request.rawBody !== undefined
      )

      return reply.code(400).send()
    }

    let event: Stripe.Event

    try {
      event = await serviceLayer.paymentWebhookService.constructEvent(
        request.rawBody,
        signature,
        process.env.LOCAL_STRIPE_WEBHOOK_SECRET
      )
    } catch {
      logger.warn(
        "Stripe webhook verification failed. For local forwarding, set LOCAL_STRIPE_WEBHOOK_SECRET to the signing secret printed by stripe:listen and restart the RPC server."
      )

      return reply.code(400).send()
    }

    const isPaymentEvent = STRIPE_PAYMENT_EVENTS.some((eventType) => eventType === event.type)

    if (!isPaymentEvent) {
      return reply.code(204).send()
    }

    const paymentObject = StripePaymentObjectSchema.parse(event.data.object)
    const metadataAttemptId = paymentObject.metadata?.payment_attempt_id
    const paymentIntentId =
      paymentObject.object === "payment_intent" ? paymentObject.id : getStripeResourceId(paymentObject.payment_intent)
    const identifiers: PaymentAttemptIdentifiers[] = []

    if (metadataAttemptId !== undefined) {
      identifiers.push({ id: metadataAttemptId })
    }

    if (paymentObject.object === "checkout.session") {
      identifiers.push({ stripeCheckoutSessionId: paymentObject.id })
    }

    if (paymentIntentId !== null) {
      identifiers.push({ stripePaymentIntentId: paymentIntentId })
    }

    if (identifiers.length === 0) {
      return reply.code(204).send()
    }

    const handle = serviceLayer.prisma
    const attempt = await serviceLayer.paymentLedgerService.findAttemptByIdentifiers(handle, identifiers)

    if (attempt === null) {
      if (metadataAttemptId !== undefined) {
        throw new Error(`PaymentAttempt(ID=${metadataAttemptId}) is not committed yet`)
      }

      return reply.code(204).send()
    }

    const payment = await serviceLayer.paymentLedgerService.syncAttempt(handle, attempt.id)

    if (payment.attendeeId !== null) {
      await serviceLayer.attendanceService.syncAttendeePayment(handle, payment.attendeeId)
    }

    return reply.code(204).send()
  })
}
