import { getLogger } from "@dotkomonline/logger"
import type { FastifyInstance } from "fastify"
import type { ServiceLayer } from "../modules/core"

const logger = getLogger("stripe-webhook")

export function registerStripeWebhookRoutes(server: FastifyInstance, serviceLayer: ServiceLayer) {
  server.post("/webhook/stripe", { config: { rawBody: true } }, async (req, res) => {
    if (!req.headers["stripe-signature"]) {
      return res.status(401)
    }

    if (!req.rawBody) {
      return res.status(400)
    }

    const signature =
      typeof req.headers["stripe-signature"] === "string"
        ? req.headers["stripe-signature"]
        : req.headers["stripe-signature"][0]

    const event = await serviceLayer.paymentWebhookService.constructEvent(
      req.rawBody,
      signature,
      process.env.LOCAL_STRIPE_WEBHOOK_SECRET
    )

    const eventType = event.type
    if (
      eventType === "checkout.session.completed" ||
      eventType === "charge.updated" ||
      eventType === "charge.refunded" ||
      eventType === "charge.captured" ||
      eventType === "payment_intent.canceled"
    ) {
      const attendeeId = event.data.object.metadata?.attendeeId
      if (!attendeeId) {
        logger.info("No attendeeId found in metadata from Stripe, not processing payment")
        return res.status(400)
      }

      await serviceLayer.attendanceService.syncAttendeePayment(serviceLayer.prisma, attendeeId)
    }
  })
}
