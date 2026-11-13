import { getLogger } from "@dotkomonline/logger"
import type Stripe from "stripe"
import { IllegalStateError } from "../../error"

export const STRIPE_PAYMENT_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "checkout.session.expired",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "payment_intent.amount_capturable_updated",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "charge.refunded",
  "refund.created",
  "refund.updated",
  "refund.failed",
]

export interface PaymentWebhookService {
  registerWebhook: (webhookUrl: string, identifier: string) => Promise<void>
  constructEvent: (
    body: string | Buffer<ArrayBufferLike>,
    signature: string,
    webhookSecretOverride?: string
  ) => Promise<Stripe.Event>
}

// In development, forward Stripe test events with `pnpm stripe:listen`.
export function getPaymentWebhookService(stripe: Stripe, webhookSecret: string | null = null): PaymentWebhookService {
  const logger = getLogger("payment-webhook-service")

  return {
    async registerWebhook(webhookUrl, identifier) {
      if (webhookSecret === null) {
        throw new IllegalStateError(
          "Configure STRIPE_WEBHOOK_SECRET with the existing endpoint's signing secret before starting webhook registration"
        )
      }

      const matchingEndpoints: Stripe.WebhookEndpoint[] = []

      for await (const endpoint of stripe.webhookEndpoints.list({ limit: 100 })) {
        if (endpoint.metadata.identifier === identifier || endpoint.url === webhookUrl) {
          matchingEndpoints.push(endpoint)
        }
      }

      if (matchingEndpoints.length !== 1) {
        throw new IllegalStateError(
          `Expected one configured Stripe webhook for ${identifier}; found ${matchingEndpoints.length}. Configure the endpoint before starting the server.`
        )
      }

      const endpoint = matchingEndpoints[0]

      await stripe.webhookEndpoints.update(endpoint.id, {
        url: webhookUrl,
        metadata: {
          identifier,
        },
        enabled_events: STRIPE_PAYMENT_EVENTS,
      })

      logger.info("Updated webhook subscription for endpoint %s", endpoint.id)
    },

    async constructEvent(body, signature, webhookSecretOverride) {
      const secret = webhookSecretOverride ?? webhookSecret

      if (secret === null) {
        throw new Error("Received webhook event but missing webhook secret")
      }

      return await stripe.webhooks.constructEventAsync(body, signature, secret)
    },
  }
}
