import { getLogger } from "@dotkomonline/logger"
import type { FastifyInstance } from "fastify"
import type { ServiceLayer } from "../modules/core"
import { z } from "zod"

const logger = getLogger("stripe-webhook")

const StripeMetadataSchema = z.object({
  attendee_id: z.string(),
  attendance_id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
})

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
      const metadata = StripeMetadataSchema.safeParse(event.data.object.metadata)
      const attendeeId = metadata.data?.attendee_id

      if (!attendeeId) {
        logger.info("Key `attendee_id` not found in metadata from Stripe event object. Not processing payment.")
        return res.status(400)
      }

      await serviceLayer.attendanceService.syncAttendeePayment(serviceLayer.prisma, attendeeId)
    }
  })
}
