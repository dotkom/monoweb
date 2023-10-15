import { randomUUID } from "crypto"
import { type Event, type Payment, type Product } from "@dotkomonline/types"
import { describe, vi } from "vitest"
import { Kysely } from "kysely"
import Stripe from "stripe"
import { paymentProvidersPayload } from "./product-payment-provider.spec"
import { productPayload } from "./product-service.spec"
import * as LocalStripeLib from "../../../lib/stripe"
import { EventRepositoryImpl } from "../../event/event-repository"
import { PaymentRepositoryImpl } from "../payment-repository"
import { PaymentServiceImpl } from "../payment-service"
import { ProductRepositoryImpl } from "../product-repository"
import { eventPayload } from "../../event/__test__/event-service.spec"
import { RefundRequestRepositoryImpl } from "../refund-request-repository"

export const paymentPayload: Omit<Payment, "id"> = {
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(2022, 1, 1),
  productId: randomUUID(),
  userId: randomUUID(),
  paymentProviderId: randomUUID(),
  paymentProviderSessionId: randomUUID(),
  paymentProviderOrderId: randomUUID(),
  status: "UNPAID",
}

// from https://stripe.com/docs/api
const stripeCommonResponse = {
  lastResponse: {
    headers: {},
    requestId: "",
    statusCode: 200,
    apiVersion: "",
  },
}

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
    terms_of_service_acceptance: null,
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
  ...stripeCommonResponse,
}

const stripePaymentIntentPayload: Stripe.PaymentIntent = {
  id: "pi_1EUpj3402SsOrryzsjcGJynl",
  object: "payment_intent",
  amount: 1099,
  amount_capturable: 0,
  amount_details: {
    tip: {},
  },
  amount_received: 0,
  application: null,
  application_fee_amount: null,
  automatic_payment_methods: null,
  canceled_at: null,
  cancellation_reason: null,
  capture_method: "automatic",
  client_secret: "pi_1EUpj3402SsOrryzsjcGJynl_secret_olQZd8x5WnY1qRas1VMPTJ49H",
  confirmation_method: "automatic",
  created: 1556606761,
  currency: "nok",
  customer: null,
  description: null,
  invoice: null,
  last_payment_error: null,
  latest_charge: "ch_3N2LNSBUPu88CNb00Gnv2UsM",
  livemode: false,
  metadata: {},
  next_action: null,
  on_behalf_of: null,
  payment_method: null,
  payment_method_options: {},
  payment_method_types: ["card"],
  processing: null,
  receipt_email: null,
  review: null,
  setup_future_usage: null,
  shipping: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  status: "requires_payment_method",
  transfer_data: null,
  transfer_group: null,
  source: "",
}

const stripeResponsePaymentIntentPayload: Stripe.Response<Stripe.PaymentIntent> = {
  ...stripePaymentIntentPayload,
  ...stripeCommonResponse,
}

const stripeRefundPayload: Stripe.Refund = {
  id: "re_3N4UKBBUPu88CNb01SnDBZ0m",
  object: "refund",
  amount: 25000,
  balance_transaction: "txn_3N4UKBBUPu88CNb01IGCoFDI",
  charge: "ch_3N2LNSBUPu88CNb00Gnv2UsM",
  created: 1683315101,
  currency: "nok",
  metadata: {},
  payment_intent: "pi_3N4UKBBUPu88CNb01vub5H95",
  reason: null,
  receipt_number: null,
  source_transfer_reversal: null,
  status: "succeeded",
  transfer_reversal: null,
}

const stripeResponseRefundPayload: Stripe.Response<Stripe.Refund> = {
  ...stripeRefundPayload,
  ...stripeCommonResponse,
}

describe("PaymentService", () => {
  const db = vi.mocked(Kysely.prototype)
  const paymentRepository = new PaymentRepositoryImpl(db)
  const productRepository = new ProductRepositoryImpl(db)
  const eventRepository = new EventRepositoryImpl(db)
  const refundRequestRepository = new RefundRequestRepositoryImpl(db)
  const paymentService = new PaymentServiceImpl(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository
  )

  const stripe = new Stripe("doesntmatter", { apiVersion: "2023-08-16" })
  vi.spyOn(LocalStripeLib, "getStripeObject").mockResolvedValue(stripe)

  const paymentPayloadExtended: Payment = {
    ...paymentPayload,
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
    const call = paymentService.createStripeCheckoutSessionForProductId(
      productPayloadExtended.id,
      "obviouslyInvalidPaymentProviderId",
      "https://example.com/successRedirectUrl",
      "https://example.com/cancelRedirectUrl",
      randomUUID()
    )
    await expect(call).rejects.toThrow()

    // test that a redirectUrl is returned
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce(productPayloadExtended)
    vi.spyOn(eventRepository, "getById").mockResolvedValueOnce(eventPayloadExtended)
    vi.spyOn(stripe.checkout.sessions, "create").mockResolvedValueOnce(stripeResponseCheckoutSessionPayloadExtended)
    vi.spyOn(paymentRepository, "create").mockResolvedValueOnce(undefined)
    expect(
      await paymentService.createStripeCheckoutSessionForProductId(
        productPayloadExtended.id,
        productPayloadExtended.paymentProviders.at(0)?.paymentProviderId ?? "",
        "https://example.com/successRedirectUrl",
        "https://example.com/cancelRedirectUrl",
        eventPayloadExtended.id
      )
    ).toEqual({
      redirectUrl: stripeResponseCheckoutSessionPayloadExtended.url,
    })
  })

  it("fullfill a stripe checkout session", async () => {
    const { id: sessionId, payment_intent: paymentProviderOrderId } = stripeResponseCheckoutSessionPayloadExtended

    vi.spyOn(paymentRepository, "updateByPaymentProviderSessionId").mockResolvedValueOnce({
      ...paymentPayloadExtended,
      status: "PAID",
    })
    await expect(
      paymentService.fullfillStripeCheckoutSession(sessionId, paymentProviderOrderId as string)
    ).resolves.toEqual(undefined)
    expect(paymentRepository.updateByPaymentProviderSessionId).toHaveBeenCalledWith(sessionId, {
      status: "PAID",
      paymentProviderOrderId,
    })
  })

  it("fails to refund a non-refundable payment", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce({ ...paymentPayloadExtended, status: "PAID" })
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ ...productPayloadExtended, isRefundable: false })

    const call = paymentService.refundPaymentById(paymentPayloadExtended.id)
    await expect(call).rejects.toThrow("Product is not refundable")
  })

  it("fails to refund an unpaid payment", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce({ ...paymentPayloadExtended, status: "UNPAID" })
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ ...productPayloadExtended, isRefundable: true })

    const call = paymentService.refundPaymentById(paymentPayloadExtended.id)
    await expect(call).rejects.toThrow("Payment is not in the correct state to be refunded")
  })

  it("fails to refund an already refunded payment", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce({ ...paymentPayloadExtended, status: "REFUNDED" })
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ ...productPayloadExtended, isRefundable: true })

    const call = paymentService.refundPaymentById(paymentPayloadExtended.id)
    await expect(call).rejects.toThrow("Payment is not in the correct state to be refunded")
  })

  it("fails to directly refund a payment that requires an approved refund request", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce({ ...paymentPayloadExtended, status: "PAID" })
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({
      ...productPayloadExtended,
      isRefundable: true,
      refundRequiresApproval: true,
    })
    vi.spyOn(refundRequestRepository, "getByPaymentId").mockResolvedValueOnce(undefined)

    const call = paymentService.refundPaymentById(paymentPayloadExtended.id)
    await expect(call).rejects.toThrow("Product requires a refund request to be refunded")
  })

  it("successfully directly refunds a payment", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce({
      ...paymentPayloadExtended,
      status: "PAID",
      paymentProviderId: paymentProvidersPayload.at(0)?.paymentProviderId ?? "",
    })
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({
      ...productPayloadExtended,
      isRefundable: true,
      refundRequiresApproval: false,
      paymentProviders: paymentProvidersPayload,
    })
    vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValueOnce(stripeResponsePaymentIntentPayload)
    vi.spyOn(stripe.refunds, "create").mockResolvedValueOnce(stripeResponseRefundPayload)
    vi.spyOn(paymentRepository, "update").mockResolvedValueOnce({ ...paymentPayloadExtended, status: "REFUNDED" })

    const call = paymentService.refundPaymentById(paymentPayloadExtended.id)
    await expect(call).resolves.toEqual(undefined)
    expect(paymentRepository.update).toHaveBeenCalledWith(paymentPayloadExtended.id, { status: "REFUNDED" })
  })
})
