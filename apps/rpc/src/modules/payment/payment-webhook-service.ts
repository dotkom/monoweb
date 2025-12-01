import { logger } from "@sentry/node"
import type Stripe from "stripe"

interface PaymentWebhookService {
  registerWebhook: (webhookUrl: string, identifier: string) => Promise<void>
  constructEvent: (
    body: string | Buffer<ArrayBufferLike>,
    signature: string,
    webhookSecretOverride?: string
  ) => Promise<Stripe.Event>
}

// In dev we instead use stripe's mock webhooks, run with: `pnpm run receive-stripe-webhooks`
export function getPaymentWebhookService(stripe: Stripe): PaymentWebhookService {
  let webhookSecret: string | null = null

  return {
    async registerWebhook(webhookUrl: string, identifier: string) {
      logger.info(`Setting up webhook at url: ${webhookUrl}`)
      const endpoints = await stripe.webhookEndpoints.list({})

      for (const endpoint of endpoints.data) {
        if (endpoint.metadata.identifier === identifier) {
          await stripe.webhookEndpoints.del(endpoint.id)
          logger.info(`Deleting webhook with id ${endpoint.id}`)
        }
      }

      const endpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        metadata: { identifier },
        description: identifier,
        enabled_events: ["checkout.session.completed"],
        api_version: "2025-07-30.basil",
      })
      webhookSecret = endpoint.secret ?? null
      logger.info(`Set up webhook with id ${endpoint.id}`)
    },

    constructEvent: async (body, signature, webhookSecretOverride) => {
      const secret = webhookSecretOverride ?? webhookSecret
      if (secret === null) {
        throw new Error("Received webhook event but missing webhook secret")
      }
      return await stripe.webhooks.constructEventAsync(body, signature, secret)
    },
  }
}
