import type { FastifyInstance } from "fastify"
import type { ServiceLayer } from "../modules/core.ts"

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
    if (event.type === "checkout.session.completed") {
      await serviceLayer.attendanceService.completeAttendeePayment(serviceLayer.prisma, event.data.object.id)
    }
  })
}
