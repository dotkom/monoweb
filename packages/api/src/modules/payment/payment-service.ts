import { PaymentProvider, Product, User } from "@dotkomonline/types"
import { getStripeObject, readableStripeAccounts } from "../../lib/stripe"

import { EventRepository } from "../event/event-repository"
import { PaymentRepository } from "./payment-repository"
import { ProductRepository } from "./product-repository"

export interface PaymentService {
  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[]
  createStripeCheckoutSessionForProductId(
    productId: Product["id"],
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: User["id"]
  ): Promise<{ redirectUrl: string }>
  fullfillStripeCheckoutSession(stripeSessionId: string): Promise<void>
  expireStripeCheckoutSession(stripeSessionId: string): Promise<void>
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

  async createStripeCheckoutSessionForProductId(
    productId: Product["id"],
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: User["id"]
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
      paymentProviderOrderId: session.id,
    })

    return {
      redirectUrl: session.url,
    }
  }

  async fullfillStripeCheckoutSession(stripeSessionId: string): Promise<void> {
    await this.paymentRepository.updateByPaymentProviderOrderId(stripeSessionId, {
      status: "PAID",
    })
  }

  async expireStripeCheckoutSession(stripeSessionId: string): Promise<void> {
    // No need to keep expired sessions. Just delete them.
    // NB: This does not mean that all expired sessions are deleted. Only the
    // ones that was actually received by the webhook.
    await this.paymentRepository.deleteByPaymentProviderOrderId(stripeSessionId)
  }
}
