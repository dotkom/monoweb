import type Stripe from "stripe"
import { describe, expect, it } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import { getPaymentWebhookService, STRIPE_PAYMENT_EVENTS } from "./payment-webhook-service"

describe("Stripe webhook configuration", () => {
  it("updates the existing subscription while retaining its endpoint and signing secret", async () => {
    const stripe = mockDeep<Stripe>()
    const endpoint = mock<Stripe.WebhookEndpoint>({
      id: "existing-endpoint",
      url: "https://example.com/webhook/stripe",
      metadata: {
        identifier: "production",
      },
    })
    stripe.webhookEndpoints.list.mockReturnValue(
      mock<Stripe.ApiListPromise<Stripe.WebhookEndpoint>>({
        [Symbol.asyncIterator]: async function* () {
          yield endpoint
        },
      })
    )
    const service = getPaymentWebhookService(stripe, "stored-signing-secret")

    await service.registerWebhook(endpoint.url, "production")
    await service.constructEvent("body", "signature")

    expect(stripe.webhookEndpoints.create).not.toHaveBeenCalled()
    expect(stripe.webhookEndpoints.del).not.toHaveBeenCalled()
    expect(stripe.webhookEndpoints.update).toHaveBeenCalledExactlyOnceWith(endpoint.id, {
      url: endpoint.url,
      metadata: {
        identifier: "production",
      },
      enabled_events: STRIPE_PAYMENT_EVENTS,
    })
    expect(stripe.webhooks.constructEventAsync).toHaveBeenCalledExactlyOnceWith(
      "body",
      "signature",
      "stored-signing-secret"
    )
    expect(STRIPE_PAYMENT_EVENTS).toContain("refund.updated")
    expect(STRIPE_PAYMENT_EVENTS).toContain("payment_intent.succeeded")
    expect(STRIPE_PAYMENT_EVENTS).toContain("checkout.session.async_payment_succeeded")
  })

  it("fails before changing Stripe configuration when the signing secret is missing", async () => {
    const stripe = mockDeep<Stripe>()
    const service = getPaymentWebhookService(stripe)

    await expect(service.registerWebhook("https://example.com/webhook/stripe", "production")).rejects.toThrow(
      "STRIPE_WEBHOOK_SECRET"
    )

    expect(stripe.webhookEndpoints.list).not.toHaveBeenCalled()
    expect(stripe.webhookEndpoints.create).not.toHaveBeenCalled()
    expect(stripe.webhookEndpoints.del).not.toHaveBeenCalled()
  })
})
