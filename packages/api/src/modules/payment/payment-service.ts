import { PaymentProvider, Product, User } from "@dotkomonline/types"

import { EventRepository } from "../event/event-repository"
import { ProductRepository } from "./product-repository"
import { PaymentRepository } from "./payment-repository"
import { getStripeObject, readableStripeAccounts } from "./../../lib/stripe"
import { getVippsObject } from "../../lib/vipps"
import { randomUUID } from "crypto"

export interface PaymentService {
  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[]
  createStripeCheckoutSessionForProductId(
    productId: Product["id"],
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: User["id"]
  ): Promise<{ redirectUrl: string }>
  createVippsCheckoutSessionForProductId(
    productId: Product["id"],
    vippsClientId: string,
    userId: string
  ): Promise<{ redirectUrl: string }>
  fullfillStripeCheckoutSession(stripeSessionId: string): Promise<void>
  fullfillVippsCheckoutSession(vippsOrderId: string, vippsClientId: string): Promise<void>
  expireStripeCheckoutSession(stripeSessionId: string): Promise<void>
  expireVippsCheckoutSession(vippsOrderId: string): Promise<void>
}

export class PaymentServiceImpl implements PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly eventRepository: EventRepository
  ) {}

  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[] {
    return readableStripeAccounts.map(({ alias, publicKey }) => ({
      paymentAlias: alias,
      paymentProvider: "STRIPE",
      paymentProviderId: publicKey,
    }))
  }

  async prepareCreateCheckoutSession(
    productId: Product["id"],
    paymentProviderId: string
  ): Promise<{ product: Product; productName: string }> {
    const product = await this.productRepository.getById(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    if (!product.paymentProviders.find((p) => p.paymentProviderId === paymentProviderId)) {
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

    return { product, productName }
  }

  async createStripeCheckoutSessionForProductId(
    productId: Product["id"],
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: User["id"]
  ): Promise<{ redirectUrl: string }> {
    const { product, productName } = await this.prepareCreateCheckoutSession(productId, stripePublicKey)

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
      paymentProviderOrderId: session.id,
    })

    return {
      redirectUrl: session.url,
    }
  }

  async createVippsCheckoutSessionForProductId(
    productId: Product["id"],
    vippsClientId: string,
    userId: User["id"],
    redirectUrl?: string
  ): Promise<{ redirectUrl: string }> {
    const { product, productName } = await this.prepareCreateCheckoutSession(productId, vippsClientId)

    const vipps = getVippsObject(vippsClientId)
    if (!vipps) {
      throw new Error("No vipps account found for the given client id")
    }

    const orderId = randomUUID()
    const data = await vipps.createWebRedirectPayment(
      "NOK",
      product.amount * 100, // in øre
      "WALLET",
      orderId,
      `Payment for ${productName}`,
      redirectUrl
    )

    await this.paymentRepository.create({
      productId: product.id,
      userId: userId,
      status: "UNPAID",
      paymentProviderId: vippsClientId,
      paymentProviderOrderId: orderId,
    })

    return {
      redirectUrl: data.redirectUrl,
    }
  }

  async fullfillStripeCheckoutSession(stripeSessionId: string): Promise<void> {
    await this.paymentRepository.updateByPaymentProviderOrderId(stripeSessionId, {
      status: "PAID",
    })
  }

  async fullfillVippsCheckoutSession(vippsClientId: string, vippsOrderId: string): Promise<void> {
    const payment = await this.paymentRepository.getByPaymentProviderOrderId(vippsOrderId)
    if (!payment) {
      throw new Error("payment not found")
    }

    const product = await this.productRepository.getById(payment.productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const vipps = getVippsObject(vippsClientId)
    if (!vipps) {
      throw new Error("No vipps account found for the given client id")
    }

    await vipps.capturePayment(vippsOrderId, "NOK", product.amount * 100)

    await this.paymentRepository.updateByPaymentProviderOrderId(vippsOrderId, {
      status: "PAID",
    })
  }

  async expireStripeCheckoutSession(stripeSessionId: string): Promise<void> {
    // No need to keep expired sessions. Just delete them.
    // NB: This does not mean that all expired sessions are deleted. Only the
    // ones that was actually received by the webhook.
    await this.paymentRepository.deleteByPaymentProviderOrderId(stripeSessionId)
  }

  async expireVippsCheckoutSession(vippsOrderId: string): Promise<void> {
    await this.paymentRepository.deleteByPaymentProviderOrderId(vippsOrderId)
  }

  async refundVippsPayment(vippsClientId: string, vippsOrderId: string): Promise<void> {
    const payment = await this.paymentRepository.getByPaymentProviderOrderId(vippsOrderId)
    if (!payment) {
      throw new Error("payment not found")
    }

    const product = await this.productRepository.getById(payment.productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const vipps = getVippsObject(vippsClientId)
    if (!vipps) {
      throw new Error("No vipps account found for the given client id")
    }

    await vipps.refundPayment(vippsOrderId, "NOK", product.amount * 100)
  }
}
