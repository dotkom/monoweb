import type { DBHandle } from "@dotkomonline/db"
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
  getPayments(handle: DBHandle, page: Pageable): Promise<Payment[]>
  /**
   * Create a Stripe checkout session for a product.
   *
   * @throws {ProductNotFoundError} if the product does not exist
   * @throws {ProductProviderMismatchError} if the product does not have the given payment provider
   * @throws {StripeAccountNotFoundError} if the given stripe public key does not exist
   * @throws {MissingStripeSessionUrlError} if the stripe session does not have a url
   */
  createStripeCheckoutSessionForProductId(
    handle: DBHandle,
    productId: ProductId,
    stripePublicKey: string,
    successRedirectUrl: string,
    cancelRedirectUrl: string,
    userId: UserId
  ): Promise<{ redirectUrl: string }>
  fulfillStripeCheckoutSession(handle: DBHandle, stripeSessionId: string, intentId: string): Promise<void>
  expireStripeCheckoutSession(handle: DBHandle, stripeSessionId: string): Promise<void>
  /**
   * Refund a payment.
   *
   * @throws {IllegalStateError} if the payment provider is not recognized
   */
  refundPayment(handle: DBHandle, payment: Payment, product: Product): Promise<void>
  refundPaymentById(handle: DBHandle, paymentId: string, options: { checkRefundApproval: boolean }): Promise<void>
  refundPaymentByPaymentProviderOrderId(
    handle: DBHandle,
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
  refundStripePayment(handle: DBHandle, payment: Payment): Promise<void>
  refundStripePaymentById(handle: DBHandle, paymentId: string, options: { checkRefundApproval: boolean }): Promise<void>
  refundStripePaymentByStripeOrderId(
    handle: DBHandle,
    stripeOrderId: string,
    options: { checkRefundApproval: boolean }
  ): Promise<void>
}

export function getPaymentService(
  paymentRepository: PaymentRepository,
  productRepository: ProductRepository,
  eventRepository: EventRepository,
  refundRequestRepository: RefundRequestRepository,
  stripeAccounts: Record<string, StripeAccount>
): PaymentService {
  function getStripeAccountByPublicKey(publicKey: string): StripeAccount | null {
    const accounts = Object.values(stripeAccounts)
    const account = accounts.find((account) => account.publicKey === publicKey)

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
  async function prepareRefund(
    handle: DBHandle,
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
      payment = await paymentRepository.getById(handle, paymentId)
    } else if (paymentProviderOrderId) {
      payment = await paymentRepository.getByPaymentProviderOrderId(handle, paymentProviderOrderId)
    } else {
      throw new Error("Please provide either paymentId or paymentProviderId")
    }

    if (payment === null) {
      throw new PaymentNotFoundError(paymentId ?? paymentProviderOrderId)
    }

    const product = await productRepository.getById(handle, payment.productId)
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
      const refundRequest = await refundRequestRepository.getByPaymentId(handle, payment.id)
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
  return {
    getStripeSdkByPublicKey(publicKey) {
      return getStripeAccountByPublicKey(publicKey)?.stripe ?? null
    },
    getWebhookSecretByPublicKey(publicKey) {
      return getStripeAccountByPublicKey(publicKey)?.webhookSecret ?? null
    },
    getPaymentProviders() {
      return Object.entries(stripeAccounts).map(
        ([alias, account]) =>
          ({
            paymentAlias: alias,
            paymentProvider: "STRIPE",
            paymentProviderId: account.publicKey,
          }) as const
      )
    },
    async getPayments(handle, page) {
      return paymentRepository.getAll(handle, page)
    },
    async createStripeCheckoutSessionForProductId(
      handle,
      productId,
      stripePublicKey,
      successRedirectUrl,
      cancelRedirectUrl,
      userId
    ) {
      const product = await productRepository.getById(handle, productId)
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
            const event = await eventRepository.getById(product.objectId)
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

      await paymentRepository.create(handle, {
        productId: product.id,
        userId,
        status: "UNPAID",
        paymentProviderId: stripePublicKey,
        paymentProviderSessionId: session.id,
      })

      return {
        redirectUrl: session.url,
      }
    },
    async fulfillStripeCheckoutSession(handle, stripeSessionId, intentId) {
      await paymentRepository.updateByPaymentProviderSessionId(handle, stripeSessionId, {
        status: "PAID",
        paymentProviderOrderId: intentId,
      })
    },
    async expireStripeCheckoutSession(handle, stripeSessionId) {
      // No need to keep expired sessions. Just delete them.
      // NB: This does not mean that all expired sessions are deleted. Only the
      // ones that was actually received by the webhook.
      await paymentRepository.deleteByPaymentProviderSessionId(handle, stripeSessionId)
    },
    async refundPayment(handle, payment, product) {
      const paymentProvider = product.paymentProviders.find((p) => p.paymentProviderId === payment.paymentProviderId)
      const paymentProviderName = paymentProvider?.paymentProvider

      switch (paymentProviderName) {
        case "STRIPE":
          return await this.refundStripePayment(handle, payment)
        default:
          throw new IllegalStateError(`Unrecognized payment provider ${paymentProviderName}`)
      }
    },
    async refundPaymentById(handle, paymentId, { checkRefundApproval }) {
      const { payment, product } = await prepareRefund(handle, { paymentId }, checkRefundApproval)
      await this.refundPayment(handle, payment, product)
    },
    async refundPaymentByPaymentProviderOrderId(handle, paymentProviderOrderId, { checkRefundApproval }) {
      const { payment, product } = await prepareRefund(handle, { paymentProviderOrderId }, checkRefundApproval)
      await this.refundPayment(handle, payment, product)
    },
    async refundStripePaymentById(handle, paymentId, { checkRefundApproval }) {
      const { payment } = await prepareRefund(handle, { paymentId }, checkRefundApproval)
      await this.refundStripePayment(handle, payment)
    },
    async refundStripePaymentByStripeOrderId(handle, stripeOrderId, { checkRefundApproval }) {
      const { payment } = await prepareRefund(handle, { paymentProviderOrderId: stripeOrderId }, checkRefundApproval)
      await this.refundStripePayment(handle, payment)
    },
    async refundStripePayment(handle, payment) {
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

      await paymentRepository.update(handle, payment.id, { status: "REFUNDED" })
    },
  }
}
