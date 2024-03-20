import { type Payment, type PaymentProvider, type Product, type ProductId, type UserId } from "@dotkomonline/types"
import { type PaymentRepository } from "./payment-repository.js"
import { type ProductRepository } from "./product-repository.js"
import { type RefundRequestRepository } from "./refund-request-repository.js"
import { type Cursor } from "../../utils/db-utils"
import { type EventRepository } from "../event/event-repository"
import Stripe from "stripe"
import { ProductNotFoundError, ProductProviderMismatchError } from "./product-error"
import {
  InvalidPaymentStatusError,
  MissingStripeSessionUrlError,
  PaymentNotFoundError,
  StripeAccountNotFoundError,
  UnrefundablePaymentError,
} from "./payment-error"
import {
  InvalidRefundRequestStatusError,
  RefundProcessingFailureError,
  RefundRequestNotFoundError,
} from "./refund-request-error"
import { IllegalStateError } from "../../error"

export interface StripeAccount {
  stripe: Stripe
  publicKey: string
  webhookSecret: string
}

export interface PaymentService {
  findStripeSdkByPublicKey(publicKey: string): Stripe | null
  findWebhookSecretByPublicKey(publicKey: string): string | null
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
    private readonly refundRequestRepository: RefundRequestRepository,
    private readonly stripeAccounts: Record<string, StripeAccount>
  ) {}

  findStripeSdkByPublicKey(publicKey: string): Stripe | null {
    return Object.values(this.stripeAccounts).find((account) => account.publicKey === publicKey)?.stripe ?? null
  }

  findWebhookSecretByPublicKey(publicKey: string): string | null {
    return Object.values(this.stripeAccounts).find((account) => account.publicKey === publicKey)?.webhookSecret ?? null
  }

  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[] {
    return Object.entries(this.stripeAccounts).map(([alias, account]) => ({
      paymentAlias: alias,
      paymentProvider: "STRIPE",
      paymentProviderId: account.publicKey,
    }))
  }

  async getPayments(take: number, cursor?: Cursor): Promise<Payment[]> {
    return this.paymentRepository.getAll(take, cursor)
  }

  /**
   * Create a Stripe checkout session for a product.
   *
   * @throws {ProductNotFoundError} if the product does not exist
   * @throws {ProductProviderMismatchError} if the product does not have the given payment provider
   * @throws {StripeAccountNotFoundError} if the given stripe public key does not exist
   * @throws {MissingStripeSessionUrlError} if the stripe session does not have a url
   */
  async createStripeCheckoutSessionForProductId(
    productId: ProductId,
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: UserId
  ): Promise<{ redirectUrl: string }> {
    const product = await this.productRepository.getById(productId)
    if (!product) {
      throw new ProductNotFoundError(productId)
    }

    if (!product.paymentProviders.find((p) => p.paymentProviderId === stripePublicKey)) {
      throw new ProductProviderMismatchError()
    }

    let productName = `N/A (${product.id})`

    if (product.objectId !== null) {
      switch (product.type) {
        case "EVENT": {
          const event = await this.eventRepository.getById(product.objectId)
          if (event) {
            productName = `Betaling for ${event.title}`
          }
          break
        }
        default: {
          break
        }
      }
    }

    const stripe = this.findStripeSdkByPublicKey(stripePublicKey)
    if (!stripe) {
      throw new StripeAccountNotFoundError(stripePublicKey)
    }

    const session = await stripe.checkout.sessions.create({
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
      throw new MissingStripeSessionUrlError()
    }

    await this.paymentRepository.create({
      productId: product.id,
      userId,
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

  /**
   * Validate and setup the common refund flow for a payment.
   *
   * @throws {PaymentNotFoundError} if the payment does not exist
   * @throws {ProductNotFoundError} if the product does not exist
   * @throws {UnrefundablePaymentError} if the product is not refundable
   * @throws {InvalidPaymentStatusError} if the payment status is not "PAID"
   * @throws {RefundRequestNotFoundError} if the payment has no refund request
   * @throws {InvalidRefundRequestStatusError} if the refund request status is not "APPROVED"
   */
  private async commonRefundSetup(
    paymentId: string,
    paymentProviderOrderId: undefined,
    checkRefundRequest?: boolean
  ): Promise<{ payment: Payment; product: Product }>
  private async commonRefundSetup(
    paymentId: undefined,
    paymentProviderOrderId: string,
    checkRefundRequest?: boolean
  ): Promise<{ payment: Payment; product: Product }>
  private async commonRefundSetup(
    paymentId: string | undefined,
    paymentProviderOrderId: string | undefined,
    checkRefundRequest = true
  ): Promise<{ payment: Payment; product: Product }> {
    let payment: Payment | undefined
    if (paymentId) {
      payment = await this.paymentRepository.getById(paymentId)
    } else if (paymentProviderOrderId) {
      payment = await this.paymentRepository.getByPaymentProviderOrderId(paymentProviderOrderId)
    }

    if (!payment) {
      // Non-null assertion used because TypeScript is unable to deduce that
      // both paymentId and paymentProviderOrderId cannot be undefined at this
      // point.
      // biome-ignore lint/style/noNonNullAssertion: typescript unwise
      throw new PaymentNotFoundError(paymentId ?? paymentProviderOrderId!)
    }

    const product = await this.productRepository.getById(payment.productId)
    if (!product) {
      throw new ProductNotFoundError(payment.productId)
    }

    if (!product.isRefundable) {
      throw new UnrefundablePaymentError()
    }

    if (payment.status !== "PAID") {
      throw new InvalidPaymentStatusError("PAID")
    }

    if (product.refundRequiresApproval && checkRefundRequest) {
      const refundRequest = await this.refundRequestRepository.getByPaymentId(payment.id)
      if (!refundRequest) {
        throw new RefundRequestNotFoundError(payment.id)
      }

      if (refundRequest.status !== "APPROVED") {
        throw new InvalidRefundRequestStatusError("APPROVED", refundRequest.status)
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

  /**
   * Refund a payment.
   *
   * @throws {IllegalStateError} if the payment provider is not recognized
   */
  async refundPayment(payment: Payment, product: Product): Promise<void> {
    const paymentProvider = product.paymentProviders.find(
      (p) => p.paymentProviderId === payment.paymentProviderId
    )?.paymentProvider

    switch (paymentProvider) {
      case "STRIPE":
        return await this.refundStripePayment(payment)
      default:
        throw new IllegalStateError(`Unrecognized payment provider ${paymentProvider}`)
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

  /**
   * Refund a Stripe payment.
   *
   * @throws {StripeAccountNotFoundError} if the payment provider is not recognized
   * @throws {InvalidPaymentStatusError} if the payment status is not "PAID"
   * @throws {RefundProcessingFailureError} if the refund processing failed
   */
  async refundStripePayment(payment: Payment) {
    const stripe = this.findStripeSdkByPublicKey(payment.paymentProviderId)
    if (!stripe) {
      throw new StripeAccountNotFoundError(payment.paymentProviderId)
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentProviderOrderId as string)
    const chargeId = paymentIntent.latest_charge as string | null | undefined
    if (!chargeId) {
      throw new InvalidPaymentStatusError("PAID")
    }

    const refund = await stripe.refunds.create({ charge: chargeId })
    if (refund.failure_reason) {
      throw new RefundProcessingFailureError(refund.failure_reason)
    }

    await this.paymentRepository.update(payment.id, { status: "REFUNDED" })
  }
}
