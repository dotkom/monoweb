import * as LocalStripeLib from "../../../../src/lib/stripe"

import { Event, Product, Transaction } from "@dotkomonline/types"
import { describe, vi } from "vitest"

import { EventRepositoryImpl } from "../../event/event-repository"
import { Kysely } from "kysely"
import { ProductRepositoryImpl } from "../product-repository"
import Stripe from "stripe"
import { TransactionRepositoryImpl } from "../payment-repository"
import { TransactionServiceImpl } from "../payment-service"
import { eventPayload } from "../../event/__test__/event-service.spec"
import { paymentProvidersPayload } from "./product-payment-provider.spec"
import { productPayload } from "./product-service.spec"
import { randomUUID } from "crypto"

export const transactionPayload: Omit<Transaction, "id"> = {
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(2022, 1, 1),
  productId: randomUUID(),
  userId: randomUUID(),
  paymentProviderId: randomUUID(),
  paymentProviderOrderId: randomUUID(),
  status: "UNPAID",
}

// from https://stripe.com/docs/api/checkout/sessions/object
const stripeCheckoutSessionPayload: Stripe.Checkout.Session = {
  id: "cs_test_a1bDGGheY2eWr2pmrhWtgbhi1rNQZZKvpvmfB22ZUGH0054KlYnxY7vdKJ",
  object: "checkout.session",
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: null,
  amount_total: null,
  automatic_tax: {
    enabled: false,
    status: null,
  },
  billing_address_collection: null,
  cancel_url: "https://example.com/cancel",
  client_reference_id: null,
  consent: null,
  consent_collection: null,
  created: 1682785193,
  currency: null,
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    shipping_address: null,
    submit: null,
  },
  customer: null,
  customer_creation: null,
  customer_details: {
    address: null,
    email: "example@example.com",
    name: null,
    phone: null,
    tax_exempt: "none",
    tax_ids: null,
  },
  customer_email: null,
  expires_at: 1682785193,
  invoice: null,
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: {},
  mode: "payment",
  payment_intent: "pi_1GszXm2eZvKYlo2CBwob5C9x",
  payment_link: null,
  payment_method_collection: null,
  payment_method_options: {},
  payment_method_types: ["card"],
  payment_status: "unpaid",
  phone_number_collection: {
    enabled: false,
  },
  recovered_from: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: "open",
  submit_type: null,
  subscription: null,
  success_url: "https://example.com/success",
  total_details: null,
  url: null,
}

const stripeResponseCheckoutSessionPayload: Stripe.Response<Stripe.Checkout.Session> = {
  ...stripeCheckoutSessionPayload,
  lastResponse: {
    headers: {},
    requestId: "",
    statusCode: 200,
    apiVersion: "",
  },
}

describe("TransactionService", () => {
  const db = vi.mocked(Kysely.prototype)
  const transactionRepository = new TransactionRepositoryImpl(db)
  const productRepository = new ProductRepositoryImpl(db)
  const eventRepository = new EventRepositoryImpl(db)
  const transactionService = new TransactionServiceImpl(transactionRepository, productRepository, eventRepository)

  // const stripe = vi.mocked(Stripe.prototype)
  const stripe = new Stripe("doesntmatter", { apiVersion: "2022-11-15" })
  // console.log("CHECKOOUT", stripe.checkout.sessions)
  vi.spyOn(LocalStripeLib, "getStripeObject").mockResolvedValue(stripe)

  const transactionPayloadExtended: Transaction = {
    ...transactionPayload,
    id: randomUUID(),
  }

  const productPayloadExtended: Product = {
    ...productPayload,
    paymentProviders: paymentProvidersPayload,
    id: randomUUID(),
  }

  const eventPayloadExtended: Event = {
    ...eventPayload,
    title: "TestEventTitle",
    id: randomUUID(),
  }

  const stripeResponseCheckoutSessionPayloadExtended = {
    ...stripeResponseCheckoutSessionPayload,
    url: "https://example.com/toBeRedirectedTo",
  }

  it("creates a new stripe checkout session", async () => {
    // test that a valid payment provider is required
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce(productPayloadExtended)
    const call = transactionService.createStripeCheckoutSessionForProductId(
      productPayloadExtended.id,
      "obviouslyInvalidPaymentProviderId",
      randomUUID()
    )
    await expect(call).rejects.toThrow()

    // test that a redirectUrl is returned
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce(productPayloadExtended)
    vi.spyOn(eventRepository, "getById").mockResolvedValueOnce(eventPayloadExtended)
    vi.spyOn(stripe.checkout.sessions, "create").mockResolvedValueOnce(stripeResponseCheckoutSessionPayloadExtended)
    vi.spyOn(transactionRepository, "create").mockResolvedValueOnce(undefined)
    expect(
      await transactionService.createStripeCheckoutSessionForProductId(
        productPayloadExtended.id,
        productPayloadExtended.paymentProviders.at(0)?.paymentProviderId ?? "",
        eventPayloadExtended.id
      )
    ).toEqual({
      redirectUrl: stripeResponseCheckoutSessionPayloadExtended.url,
    })
  })

  it("fullfill a stripe checkout session", async () => {
    const sessionId = stripeResponseCheckoutSessionPayloadExtended.id

    vi.spyOn(transactionRepository, "updateByPaymentProviderOrderId").mockResolvedValueOnce({
      ...transactionPayloadExtended,
      status: "PAID",
    })
    await expect(transactionService.fullfillStripeCheckoutSession(sessionId)).resolves.toEqual(undefined)
    expect(transactionRepository.updateByPaymentProviderOrderId).toHaveBeenCalledWith(sessionId, { status: "PAID" })
  })
})
