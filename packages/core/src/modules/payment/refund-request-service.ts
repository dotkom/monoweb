import type { PaymentId, RefundRequest, RefundRequestId, RefundRequestWrite, UserId } from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
import type { Pageable } from "../../query"
import { PaymentNotFoundError, UnrefundablePaymentError } from "./payment-error"
import type { PaymentRepository } from "./payment-repository"
import type { PaymentService } from "./payment-service"
import { ProductNotFoundError } from "./product-error"
import type { ProductRepository } from "./product-repository"
import { InvalidRefundRequestStatusError, RefundRequestNotFoundError } from "./refund-request-error"
import type { RefundRequestRepository } from "./refund-request-repository"

export interface RefundRequestService {
  /**
   * Create a refund request for a payment
   *
   * @throws {PaymentNotFoundError} if payment is not found
   * @throws {ProductNotFoundError} if product is not found
   * @throws {UnrefundablePaymentError} if product is not refundable
   * @throws {IllegalStateError} if refund request is not required for this product
   */
  createRefundRequest(paymentId: PaymentId, refunderUserId: UserId, reason: string): Promise<RefundRequest>
  updateRefundRequest(refundRequestId: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  deleteRefundRequest(refundRequestId: RefundRequestId): Promise<void>
  getRefundRequestById(refundRequestId: RefundRequestId): Promise<RefundRequest | null>
  getRefundRequests(page: Pageable): Promise<RefundRequest[]>
  /**
   * Approve a refund request
   *
   * @throws {RefundRequestNotFoundError} if refund request is not found
   * @throws {InvalidRefundRequestStatusError} if refund request is not pending
   */
  approveRefundRequest(refundRequestId: RefundRequestId, handledByUserId: UserId): Promise<void>
  /**
   * Reject a refund request
   *
   * @throws {RefundRequestNotFoundError} if refund request is not found
   * @throws {InvalidRefundRequestStatusError} if refund request is not pending
   */
  rejectRefundRequest(refundRequestId: RefundRequestId, handledByUserId: UserId): Promise<void>
}

export class RefundRequestServiceImpl implements RefundRequestService {
  private readonly refundRequestRepository: RefundRequestRepository
  private readonly paymentRepository: PaymentRepository
  private readonly productRepository: ProductRepository
  private readonly paymentService: PaymentService

  constructor(
    refundRequestRepository: RefundRequestRepository,
    paymentRepository: PaymentRepository,
    productRepository: ProductRepository,
    paymentService: PaymentService
  ) {
    this.refundRequestRepository = refundRequestRepository
    this.paymentRepository = paymentRepository
    this.productRepository = productRepository
    this.paymentService = paymentService
  }

  public async createRefundRequest(paymentId: PaymentId, refunderUserId: UserId, reason: string) {
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
      userId: refunderUserId,
      reason,
      status: "PENDING",
      handledById: null,
    })
  }

  public async updateRefundRequest(refundRequestId: RefundRequestId, data: Partial<RefundRequestWrite>) {
    return this.refundRequestRepository.update(refundRequestId, data)
  }

  public async deleteRefundRequest(refundRequestId: RefundRequestId) {
    return this.refundRequestRepository.delete(refundRequestId)
  }

  public async getRefundRequestById(refundRequestId: RefundRequestId) {
    return this.refundRequestRepository.getById(refundRequestId)
  }

  public async getRefundRequests(page: Pageable) {
    return this.refundRequestRepository.getAll(page)
  }

  public async approveRefundRequest(refundRequestId: RefundRequestId, handledByUserId: UserId) {
    const refundRequest = await this.refundRequestRepository.getById(refundRequestId)

    if (!refundRequest) {
      throw new RefundRequestNotFoundError(refundRequestId)
    }

    if (refundRequest.status !== "PENDING") {
      throw new InvalidRefundRequestStatusError("PENDING", refundRequest.status)
    }

    const updatedRefundRequest = await this.refundRequestRepository.update(refundRequestId, {
      status: "APPROVED",
      handledById: handledByUserId,
    })

    // Automatically refund the payment. We already know the request was approved, so no need to check.
    await this.paymentService.refundPaymentById(updatedRefundRequest.paymentId, { checkRefundApproval: false })
  }

  public async rejectRefundRequest(refundRequestId: RefundRequestId, handledByUserId: UserId) {
    const refundRequest = await this.refundRequestRepository.getById(refundRequestId)

    if (!refundRequest) {
      throw new RefundRequestNotFoundError(refundRequestId)
    }

    if (refundRequest.status !== "PENDING") {
      throw new InvalidRefundRequestStatusError("PENDING", refundRequest.status)
    }

    await this.refundRequestRepository.update(refundRequestId, {
      status: "REJECTED",
      handledById: handledByUserId,
    })
  }
}
