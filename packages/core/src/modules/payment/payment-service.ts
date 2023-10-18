import { Payment, PaymentProvider, Product, ProductId, UserId } from "@dotkomonline/types"
import { getStripeObject, readableStripeAccounts } from "../../lib/stripe"
import { Cursor } from "../../utils/db-utils"

import { EventRepository } from "../event/event-repository"
import { PaymentRepository } from "./payment-repository"
import { ProductRepository } from "./product-repository"
import { RefundRequestRepository } from "./refund-request-repository"

export interface PaymentService {
  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[]
  getPayments(take: number, cursor?: Cursor): Promise<Payment[]>
  createStripeCheckoutSessionForProductId(
    productId: ProductId,
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: UserId
  ): Promise<{ redirectUrl: string }>
  fullfillStripeCheckoutSession(stripeSessionId: string, intentId: string): Promise<void>
  expireStripeCheckoutSession(stripeSessionId: string): Promise<void>
  refundPaymentById(paymentId: string, checkRefundRequest?: boolean): Promise<void>
  refundPaymentByPaymentProviderOrderId(paymentProviderOrderId: string, checkRefundRequest?: boolean): Promise<void>
  refundStripePaymentById(paymentId: string, checkRefundRequest?: boolean): Promise<void>
  refundStripePaymentByStripeOrderId(stripeOrderId: string, checkRefundRequest?: boolean): Promise<void>
}

export class PaymentServiceImpl implements PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly eventRepository: EventRepository,
    private readonly refundRequestRepository: RefundRequestRepository
  ) {}

  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[] {
    return readableStripeAccounts.map(({ alias, publicKey }) => ({
      paymentAlias: alias,
      paymentProvider: "STRIPE",
      paymentProviderId: publicKey,
    }))
  }

  async getPayments(take: number, cursor?: Cursor): Promise<Payment[]> {
    return this.paymentRepository.getAll(take, cursor)
  }

  async createStripeCheckoutSessionForProductId(
    productId: ProductId,
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: UserId
  ): Promise<{ redirectUrl: string }> {
    const product = await this.productRepository.getById(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    if (!product.paymentProviders.find((p) => p.paymentProviderId === stripePublicKey)) {
      throw new Error("The stripe public key supplied is not a valid payment provider for this product")
    }

    let productName = `N/A (${product.id})`

    if (product.objectId !== null) {
      switch (product.type) {
        case "EVENT":
          const event = await this.eventRepository.getById(product.objectId)
          if (event) {
            productName = `Betaling for ${event.title}`
          }
          break
        default:
          break
      }
    }

    const stripe = getStripeObject(stripePublicKey)
    if (!stripe) {
      throw new Error("No stripe account found for the given public key")
    }

    // Tests requires stripe to be awaited first but otherwise it works fine without.
    // Doesn't seem to make a difference having it like this. Idk, stripe sdk is weird.
    const session = await (
      await stripe
    ).checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "nok",
            unit_amount: product.amount * 100, // in øre
            product_data: {
              name: productName,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successRedirectUrl,
      cancel_url: cancelRedirectUrl,
    })

    if (!session.url) {
      throw new Error("Session URL not found")
    }

    await this.paymentRepository.create({
      productId: product.id,
      userId: userId,
      status: "UNPAID",
      paymentProviderId: stripePublicKey,
      paymentProviderSessionId: session.id,
    })

    return {
      redirectUrl: session.url,
    }
  }

  async fullfillStripeCheckoutSession(stripeSessionId: string, intentId: string): Promise<void> {
    await this.paymentRepository.updateByPaymentProviderSessionId(stripeSessionId, {
      status: "PAID",
      paymentProviderOrderId: intentId,
    })
  }

  async expireStripeCheckoutSession(stripeSessionId: string): Promise<void> {
    // No need to keep expired sessions. Just delete them.
    // NB: This does not mean that all expired sessions are deleted. Only the
    // ones that was actually received by the webhook.
    await this.paymentRepository.deleteByPaymentProviderSessionId(stripeSessionId)
  }

  async commonRefundSetup(
    paymentId?: string,
    paymentProviderOrderId?: string,
    checkRefundRequest = true
  ): Promise<{ payment: Payment; product: Product }> {
    if (!paymentId && !paymentProviderOrderId) {
      throw new Error("Either paymentId or paymentProviderOrderId must be supplied")
    }

    let payment: Payment | undefined
    if (paymentId) {
      payment = await this.paymentRepository.getById(paymentId)
    } else if (paymentProviderOrderId) {
      payment = await this.paymentRepository.getByPaymentProviderOrderId(paymentProviderOrderId)
    }

    if (!payment) {
      throw new Error("Payment not found")
    }

    const product = await this.productRepository.getById(payment.productId)
    if (!product) {
      throw new Error("Product not found")
    }

    if (!product.isRefundable) {
      throw new Error("Product is not refundable")
    }

    if (payment.status !== "PAID") {
      throw new Error("Payment is not in the correct state to be refunded")
    }

    if (product.refundRequiresApproval && checkRefundRequest) {
      const refundRequest = await this.refundRequestRepository.getByPaymentId(payment.id)
      if (!refundRequest) {
        throw new Error("Product requires a refund request to be refunded")
      }

      if (refundRequest.status !== "APPROVED") {
        throw new Error("Refund request needs to be approved for the payment to be refunded")
      }
    }

    return {
      payment,
      product,
    }
  }

  async refundPaymentById(paymentId: string, checkRefundRequest = true): Promise<void> {
    const { payment, product } = await this.commonRefundSetup(paymentId, undefined, checkRefundRequest)

    await this.refundPayment(payment, product)
  }

  async refundPaymentByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    checkRefundRequest = true
  ): Promise<void> {
    const { payment, product } = await this.commonRefundSetup(undefined, paymentProviderOrderId, checkRefundRequest)

    await this.refundPayment(payment, product)
  }

  async refundPayment(payment: Payment, product: Product): Promise<void> {
    const paymentProvider = product.paymentProviders.find((p) => p.paymentProviderId === payment.paymentProviderId)
      ?.paymentProvider

    switch (paymentProvider) {
      case "STRIPE":
        await this.refundStripePayment(payment)
        break
      default:
        throw new Error("Could not find the payment provider for the given payment")
    }
  }

  async refundStripePaymentById(paymentId: string, checkRefundRequest = true): Promise<void> {
    const { payment } = await this.commonRefundSetup(paymentId, undefined, checkRefundRequest)

    await this.refundStripePayment(payment)
  }

  async refundStripePaymentByStripeOrderId(stripeOrderId: string, checkRefundRequest = true): Promise<void> {
    const { payment } = await this.commonRefundSetup(undefined, stripeOrderId, checkRefundRequest)

    await this.refundStripePayment(payment)
  }

  async refundStripePayment(payment: Payment) {
    const stripe = getStripeObject(payment.paymentProviderId)
    if (!stripe) {
      throw new Error("No stripe account found for the given public key")
    }

    const paymentIntent = await (await stripe).paymentIntents.retrieve(payment.paymentProviderOrderId as string)
    const chargeId = paymentIntent.latest_charge as string | null | undefined
    if (!chargeId) {
      throw new Error("No charge found for the given payment intent")
    }

    const refund = await (
      await stripe
    ).refunds.create({
      charge: chargeId,
    })
    if (refund.failure_reason) {
      throw new Error(`Refund failed: ${refund.failure_reason}`)
    }

    await this.paymentRepository.update(payment.id, {
      status: "REFUNDED",
    })
  }
}
