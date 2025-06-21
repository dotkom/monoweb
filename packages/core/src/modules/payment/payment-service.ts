import type {
  Payment,
  PaymentId,
  PaymentProvider,
  PaymentProviderOrderId,
  Product,
  ProductId,
  UserId,
} from "@dotkomonline/types"
import type Stripe from "stripe"
import { IllegalStateError } from "../../error"
import type { Pageable } from "../../query"
import type { EventRepository } from "../event/event-repository"
import {
  InvalidPaymentStatusError,
  MissingStripeSessionUrlError,
  PaymentNotFoundError,
  StripeAccountNotFoundError,
  UnrefundablePaymentError,
} from "./payment-error"
import type { PaymentRepository } from "./payment-repository"
import { ProductNotFoundError, ProductProviderMismatchError } from "./product-error"
import type { ProductRepository } from "./product-repository"
import {
  InvalidRefundRequestStatusError,
  RefundProcessingFailureError,
  RefundRequestNotFoundError,
} from "./refund-request-error"
import type { RefundRequestRepository } from "./refund-request-repository"

export interface StripeAccount {
  stripe: Stripe
  publicKey: string
  webhookSecret: string
}

export interface PaymentService {
  getStripeSdkByPublicKey(publicKey: string): Stripe | null
  getWebhookSecretByPublicKey(publicKey: string): string | null
  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[]
  getPayments(page: Pageable): Promise<Payment[]>
  /**
   * Create a Stripe checkout session for a product.
   *
   * @throws {ProductNotFoundError} if the product does not exist
   * @throws {ProductProviderMismatchError} if the product does not have the given payment provider
   * @throws {StripeAccountNotFoundError} if the given stripe public key does not exist
   * @throws {MissingStripeSessionUrlError} if the stripe session does not have a url
   */
  createStripeCheckoutSessionForProductId(
    productId: ProductId,
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: UserId
  ): Promise<{ redirectUrl: string }>
  fulfillStripeCheckoutSession(stripeSessionId: string, intentId: string): Promise<void>
  expireStripeCheckoutSession(stripeSessionId: string): Promise<void>
  /**
   * Refund a payment.
   *
   * @throws {IllegalStateError} if the payment provider is not recognized
   */
  refundPayment(payment: Payment, product: Product): Promise<void>
  refundPaymentById(paymentId: string, options: { checkRefundApproval: boolean }): Promise<void>
  refundPaymentByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    options: { checkRefundApproval: boolean }
  ): Promise<void>
  /**
   * Refund a Stripe payment.
   *
   * @throws {StripeAccountNotFoundError} if the payment provider is not recognized
   * @throws {InvalidPaymentStatusError} if the payment status is not "PAID"
   * @throws {RefundProcessingFailureError} if the refund processing failed
   */
  refundStripePayment(payment: Payment): Promise<void>
  refundStripePaymentById(paymentId: string, options: { checkRefundApproval: boolean }): Promise<void>
  refundStripePaymentByStripeOrderId(stripeOrderId: string, options: { checkRefundApproval: boolean }): Promise<void>
}

export class PaymentServiceImpl implements PaymentService {
  private readonly paymentRepository: PaymentRepository
  private readonly productRepository: ProductRepository
  private readonly eventRepository: EventRepository
  private readonly refundRequestRepository: RefundRequestRepository
  private readonly stripeAccounts: Record<string, StripeAccount>

  constructor(
    paymentRepository: PaymentRepository,
    productRepository: ProductRepository,
    eventRepository: EventRepository,
    refundRequestRepository: RefundRequestRepository,
    stripeAccounts: Record<string, StripeAccount>
  ) {
    this.paymentRepository = paymentRepository
    this.productRepository = productRepository
    this.eventRepository = eventRepository
    this.refundRequestRepository = refundRequestRepository
    this.stripeAccounts = stripeAccounts
  }

  private getStripeAccountByPublicKey(publicKey: string): StripeAccount | null {
    const stripeAccounts = Object.values(this.stripeAccounts)
    const account = stripeAccounts.find((account) => account.publicKey === publicKey)

    return account ?? null
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
  private async prepareRefund(
    ids:
      | {
          paymentId: PaymentId
          paymentProviderOrderId?: undefined
        }
      | {
          paymentId?: undefined
          paymentProviderOrderId: NonNullable<PaymentProviderOrderId>
        },
    checkRefundApproval: boolean
  ): Promise<{ payment: Payment; product: Product }> {
    const { paymentId, paymentProviderOrderId } = ids
    let payment: Payment | null

    if (paymentId) {
      payment = await this.paymentRepository.getById(paymentId)
    } else if (paymentProviderOrderId) {
      payment = await this.paymentRepository.getByPaymentProviderOrderId(paymentProviderOrderId)
    } else {
      throw new Error("Please provide either paymentId or paymentProviderId")
    }

    if (payment === null) {
      throw new PaymentNotFoundError(paymentId ?? paymentProviderOrderId)
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

    if (product.refundRequiresApproval && checkRefundApproval) {
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

  public getStripeSdkByPublicKey(publicKey: string) {
    return this.getStripeAccountByPublicKey(publicKey)?.stripe ?? null
  }

  public getWebhookSecretByPublicKey(publicKey: string) {
    return this.getStripeAccountByPublicKey(publicKey)?.webhookSecret ?? null
  }

  public getPaymentProviders() {
    return Object.entries(this.stripeAccounts).map(
      ([alias, account]) =>
        ({
          paymentAlias: alias,
          paymentProvider: "STRIPE",
          paymentProviderId: account.publicKey,
        }) as const
    )
  }

  public async getPayments(page: Pageable) {
    return this.paymentRepository.getAll(page)
  }

  public async createStripeCheckoutSessionForProductId(
    productId: ProductId,
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: UserId
  ) {
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

    const stripe = this.getStripeSdkByPublicKey(stripePublicKey)
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

  public async fulfillStripeCheckoutSession(stripeSessionId: string, intentId: string) {
    await this.paymentRepository.updateByPaymentProviderSessionId(stripeSessionId, {
      status: "PAID",
      paymentProviderOrderId: intentId,
    })
  }

  public async expireStripeCheckoutSession(stripeSessionId: string) {
    // No need to keep expired sessions. Just delete them.
    // NB: This does not mean that all expired sessions are deleted. Only the
    // ones that was actually received by the webhook.
    await this.paymentRepository.deleteByPaymentProviderSessionId(stripeSessionId)
  }

  public async refundPaymentById(paymentId: string, { checkRefundApproval }: { checkRefundApproval: boolean }) {
    const { payment, product } = await this.prepareRefund({ paymentId }, checkRefundApproval)

    await this.refundPayment(payment, product)
  }

  public async refundPaymentByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    { checkRefundApproval }: { checkRefundApproval: boolean }
  ) {
    const { payment, product } = await this.prepareRefund({ paymentProviderOrderId }, checkRefundApproval)

    await this.refundPayment(payment, product)
  }

  public async refundPayment(payment: Payment, product: Product) {
    const paymentProvider = product.paymentProviders.find((p) => p.paymentProviderId === payment.paymentProviderId)
    const paymentProviderName = paymentProvider?.paymentProvider

    switch (paymentProviderName) {
      case "STRIPE":
        return await this.refundStripePayment(payment)
      default:
        throw new IllegalStateError(`Unrecognized payment provider ${paymentProviderName}`)
    }
  }

  public async refundStripePaymentById(paymentId: string, { checkRefundApproval }: { checkRefundApproval: boolean }) {
    const { payment } = await this.prepareRefund({ paymentId }, checkRefundApproval)

    await this.refundStripePayment(payment)
  }

  public async refundStripePaymentByStripeOrderId(
    stripeOrderId: string,
    { checkRefundApproval }: { checkRefundApproval: boolean }
  ) {
    const { payment } = await this.prepareRefund({ paymentProviderOrderId: stripeOrderId }, checkRefundApproval)

    await this.refundStripePayment(payment)
  }

  public async refundStripePayment(payment: Payment) {
    const stripe = this.getStripeSdkByPublicKey(payment.paymentProviderId)
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
