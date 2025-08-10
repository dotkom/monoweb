import { logger } from "@sentry/node"
import type Stripe from "stripe"

interface PaymentWebhookService {
  registerWebhook: (webhookUrl: string, identifier: string) => Promise<void>
}

// In dev we instead use stripe's mock webhooks, run with: `pnpm run receive-stripe-webhooks`
export function getPaymentWebhookService(stripe: Stripe): PaymentWebhookService {
  return {
    async registerWebhook(webhookUrl: string, identifier: string) {
      logger.info(`Setting up webhook at url: ${webhookUrl}`)
      const endpoints = await stripe.webhookEndpoints.list({})

      let matchedExistingWebhook = false
      for (const endpoint of endpoints.data) {
        if (endpoint.metadata.identifier === identifier) {
          if (endpoint.url === webhookUrl) {
            logger.info("Matched existing webhook.")
            matchedExistingWebhook = true
            continue
          }
          await stripe.webhookEndpoints.del(endpoint.id)
          logger.info(`Deleting webhook with id ${endpoint.id}`)
        }
      }

      if (matchedExistingWebhook) {
        return
      }

      const endpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        metadata: { identifier },
        description: identifier,
        enabled_events: ["checkout.session.completed"],
      })
      logger.info(`Set up webhook with id ${endpoint.id}`)
    },
  }
}
