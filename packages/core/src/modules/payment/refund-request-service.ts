import type { PaymentId, RefundRequest, RefundRequestId, RefundRequestWrite, UserId } from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
import type { Cursor } from "../../query"
import { PaymentNotFoundError, UnrefundablePaymentError } from "./payment-error"
import type { PaymentRepository } from "./payment-repository"
import type { PaymentService } from "./payment-service"
import { ProductNotFoundError } from "./product-error"
import type { ProductRepository } from "./product-repository"
import { InvalidRefundRequestStatusError, RefundRequestNotFoundError } from "./refund-request-error"
import type { RefundRequestRepository } from "./refund-request-repository"

export interface RefundRequestService {
  createRefundRequest(paymentId: PaymentId, userId: UserId, reason: string): Promise<RefundRequest>
  updateRefundRequest(id: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  deleteRefundRequest(id: RefundRequestId): Promise<void>
  getRefundRequestById(id: RefundRequestId): Promise<RefundRequest | undefined>
  getRefundRequests(take: number, cursor?: Cursor): Promise<RefundRequest[]>
  approveRefundRequest(id: RefundRequestId, handledBy: UserId): Promise<void>
  rejectRefundRequest(id: RefundRequestId, handledBy: UserId): Promise<void>
}

export class RefundRequestServiceImpl implements RefundRequestService {
  constructor(
    private readonly refundRequestRepository: RefundRequestRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentService: PaymentService
  ) {}

  /**
   * Create a refund request for a payment
   *
   * @throws {PaymentNotFoundError} if payment is not found
   * @throws {ProductNotFoundError} if product is not found
   * @throws {UnrefundablePaymentError} if product is not refundable
   * @throws {IllegalStateError} if refund request is not required for this product
   */
  async createRefundRequest(paymentId: PaymentId, userId: UserId, reason: string): Promise<RefundRequest> {
    const payment = await this.paymentRepository.getById(paymentId)

    if (!payment) {
      throw new PaymentNotFoundError(paymentId)
    }

    const product = await this.productRepository.getById(payment.productId)
    if (!product) {
      throw new ProductNotFoundError(payment.productId)
    }

    if (!product.isRefundable) {
      throw new UnrefundablePaymentError()
    }

    if (!product.refundRequiresApproval) {
      throw new IllegalStateError("Refund request not required for this product")
    }

    return this.refundRequestRepository.create({
      paymentId,
      userId,
      reason,
      status: "PENDING",
      handledBy: null,
    })
  }

  async updateRefundRequest(id: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest> {
    return this.refundRequestRepository.update(id, data)
  }

  async deleteRefundRequest(id: RefundRequestId): Promise<void> {
    return this.refundRequestRepository.delete(id)
  }

  async getRefundRequestById(id: RefundRequestId): Promise<RefundRequest | undefined> {
    return this.refundRequestRepository.getById(id)
  }

  async getRefundRequests(take: number, cursor?: Cursor): Promise<RefundRequest[]> {
    return this.refundRequestRepository.getAll(take, cursor)
  }

  /**
   * Approve a refund request
   *
   * @throws {RefundRequestNotFoundError} if refund request is not found
   * @throws {InvalidRefundRequestStatusError} if refund request is not pending
   */
  async approveRefundRequest(id: RefundRequestId, handledBy: UserId): Promise<void> {
    const refundRequest = await this.refundRequestRepository.getById(id)

    if (!refundRequest) {
      throw new RefundRequestNotFoundError(id)
    }

    if (refundRequest.status === "APPROVED") {
      throw new InvalidRefundRequestStatusError("PENDING", refundRequest.status)
    }

    const updatedRefundRequest = await this.refundRequestRepository.update(id, {
      status: "APPROVED",
      handledBy,
    })

    // Automatically refund the payment. We already know the request was approved, so no need to check.
    await this.paymentService.refundPaymentById(updatedRefundRequest.paymentId, false)
  }

  /**
   * Reject a refund request
   *
   * @throws {RefundRequestNotFoundError} if refund request is not found
   * @throws {InvalidRefundRequestStatusError} if refund request is not pending
   */
  async rejectRefundRequest(id: RefundRequestId, handledBy: UserId): Promise<void> {
    const refundRequest = await this.refundRequestRepository.getById(id)

    if (!refundRequest) {
      throw new RefundRequestNotFoundError(id)
    }

    if (refundRequest.status === "REJECTED" || refundRequest.status === "APPROVED") {
      throw new InvalidRefundRequestStatusError("PENDING", refundRequest.status)
    }

    await this.refundRequestRepository.update(id, {
      status: "REJECTED",
      handledBy,
    })
  }
}
