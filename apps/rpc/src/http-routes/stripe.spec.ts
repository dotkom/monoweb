import Fastify from "fastify"
import rawBody from "fastify-raw-body"
import type Stripe from "stripe"
import { afterEach, describe, expect, it } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import type { ServiceLayer } from "../modules/core"
import type { PaymentRecord } from "../modules/payment/payment"
import { registerStripeWebhookRoutes } from "./stripe"

const servers: ReturnType<typeof Fastify>[] = []

afterEach(async () => {
  await Promise.all(servers.map(async (server) => server.close()))
  servers.length = 0
})

async function createServer(paymentObject: Record<string, unknown>, eventType: Stripe.Event.Type) {
  const server = Fastify()
  const services = mockDeep<ServiceLayer>()
  servers.push(server)

  await server.register(rawBody, {
    global: false,
    encoding: "utf8",
    runFirst: true,
  })
  services.paymentWebhookService.constructEvent.mockResolvedValue({
    id: "stripe-event",
    type: eventType,
    data: {
      object: paymentObject,
    },
  } as Stripe.Event)
  services.paymentLedgerService.findAttemptByIdentifiers.mockResolvedValue(
    mock({
      id: "attempt",
      paymentId: "payment",
    })
  )
  services.paymentLedgerService.syncAttempt.mockResolvedValue(
    mock<PaymentRecord>({
      id: "payment",
      attendeeId: null,
    })
  )
  registerStripeWebhookRoutes(server, services)

  return { server, services }
}

function deliver(server: ReturnType<typeof Fastify>) {
  return server.inject({
    method: "POST",
    url: "/webhook/stripe",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "test-signature",
    },
    payload: "{}",
  })
}

describe("Stripe payment webhooks", () => {
  it("finds migrated checkouts by their Stripe ID without relying on attendee metadata", async () => {
    const { server, services } = await createServer(
      {
        id: "original-session",
        object: "checkout.session",
        payment_intent: null,
        metadata: {
          attendee_id: "original-attendee",
        },
      },
      "checkout.session.completed"
    )

    expect((await deliver(server)).statusCode).toBe(204)
    expect(services.paymentLedgerService.findAttemptByIdentifiers).toHaveBeenCalledExactlyOnceWith(services.prisma, [
      { stripeCheckoutSessionId: "original-session" },
    ])
  })

  it("finds Dashboard refunds by PaymentIntent even without attendee metadata", async () => {
    const { server, services } = await createServer(
      {
        id: "dashboard-refund",
        object: "refund",
        payment_intent: "payment-intent",
        metadata: {},
      },
      "refund.updated"
    )

    const response = await deliver(server)

    expect(response.statusCode).toBe(204)
    expect(services.paymentLedgerService.findAttemptByIdentifiers).toHaveBeenCalledExactlyOnceWith(services.prisma, [
      { stripePaymentIntentId: "payment-intent" },
    ])
    expect(services.paymentLedgerService.syncAttempt).toHaveBeenCalledExactlyOnceWith(services.prisma, "attempt")
    expect(services.attendanceService.syncAttendeePayment).not.toHaveBeenCalled()
    expect(services.prisma.$transaction).not.toHaveBeenCalled()
  })

  it("supports Checkout webhooks for payments unrelated to events", async () => {
    const { server, services } = await createServer(
      {
        id: "checkout-session",
        object: "checkout.session",
        payment_intent: null,
        metadata: {
          payment_attempt_id: "attempt",
        },
      },
      "checkout.session.completed"
    )

    expect((await deliver(server)).statusCode).toBe(204)
    expect(services.paymentLedgerService.syncAttempt).toHaveBeenCalledTimes(1)
  })

  it("asks Stripe to retry when an identified attempt has not committed yet", async () => {
    const { server, services } = await createServer(
      {
        id: "checkout-session",
        object: "checkout.session",
        metadata: {
          payment_attempt_id: "not-committed",
        },
      },
      "checkout.session.completed"
    )
    services.paymentLedgerService.findAttemptByIdentifiers.mockResolvedValue(null)

    expect((await deliver(server)).statusCode).toBe(500)
  })

  it("rejects failed signature verification before accessing payment records", async () => {
    const { server, services } = await createServer(
      {
        id: "checkout-session",
        object: "checkout.session",
      },
      "checkout.session.completed"
    )
    services.paymentWebhookService.constructEvent.mockRejectedValue(new Error("Invalid signature"))

    expect((await deliver(server)).statusCode).toBe(400)
    expect(services.paymentLedgerService.findAttemptByIdentifiers).not.toHaveBeenCalled()
  })
})
