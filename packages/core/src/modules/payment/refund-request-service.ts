import type { DBHandle } from "@dotkomonline/db"
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
  createRefundRequest(
    handle: DBHandle,
    paymentId: PaymentId,
    refunderUserId: UserId,
    reason: string
  ): Promise<RefundRequest>
  updateRefundRequest(
    handle: DBHandle,
    refundRequestId: RefundRequestId,
    data: Partial<RefundRequestWrite>
  ): Promise<RefundRequest>
  deleteRefundRequest(handle: DBHandle, refundRequestId: RefundRequestId): Promise<void>
  getRefundRequestById(handle: DBHandle, refundRequestId: RefundRequestId): Promise<RefundRequest | null>
  getRefundRequests(handle: DBHandle, page: Pageable): Promise<RefundRequest[]>
  /**
   * Approve a refund request
   *
   * @throws {RefundRequestNotFoundError} if refund request is not found
   * @throws {InvalidRefundRequestStatusError} if refund request is not pending
   */
  approveRefundRequest(handle: DBHandle, refundRequestId: RefundRequestId, handledByUserId: UserId): Promise<void>
  /**
   * Reject a refund request
   *
   * @throws {RefundRequestNotFoundError} if refund request is not found
   * @throws {InvalidRefundRequestStatusError} if refund request is not pending
   */
  rejectRefundRequest(handle: DBHandle, refundRequestId: RefundRequestId, handledByUserId: UserId): Promise<void>
}

export function getRefundRequestService(
  refundRequestRepository: RefundRequestRepository,
  paymentRepository: PaymentRepository,
  productRepository: ProductRepository,
  paymentService: PaymentService
): RefundRequestService {
  return {
    async createRefundRequest(handle, paymentId, refunderUserId, reason) {
      const payment = await paymentRepository.getById(handle, paymentId)
      if (!payment) {
        throw new PaymentNotFoundError(paymentId)
      }

      const product = await productRepository.getById(handle, payment.productId)
      if (!product) {
        throw new ProductNotFoundError(payment.productId)
      }

      if (!product.isRefundable) {
        throw new UnrefundablePaymentError()
      }

      if (!product.refundRequiresApproval) {
        throw new IllegalStateError("Refund request not required for this product")
      }

      return refundRequestRepository.create(handle, {
        paymentId,
        userId: refunderUserId,
        reason,
        status: "PENDING",
        handledById: null,
      })
    },
    async updateRefundRequest(handle, refundRequestId, data) {
      return refundRequestRepository.update(handle, refundRequestId, data)
    },
    async deleteRefundRequest(handle, refundRequestId) {
      return refundRequestRepository.delete(handle, refundRequestId)
    },
    async getRefundRequestById(handle, refundRequestId) {
      return refundRequestRepository.getById(handle, refundRequestId)
    },
    async getRefundRequests(handle, page) {
      return refundRequestRepository.getAll(handle, page)
    },
    async approveRefundRequest(handle, refundRequestId, handledByUserId) {
      const refundRequest = await refundRequestRepository.getById(handle, refundRequestId)
      if (!refundRequest) {
        throw new RefundRequestNotFoundError(refundRequestId)
      }

      if (refundRequest.status !== "PENDING") {
        throw new InvalidRefundRequestStatusError("PENDING", refundRequest.status)
      }

      const updatedRefundRequest = await refundRequestRepository.update(handle, refundRequestId, {
        status: "APPROVED",
        handledById: handledByUserId,
      })
      // Automatically refund the payment. We already know the request was approved, so no need to check.
      await paymentService.refundPaymentById(handle, updatedRefundRequest.paymentId, { checkRefundApproval: false })
    },
    async rejectRefundRequest(handle, refundRequestId, handledByUserId) {
      const refundRequest = await refundRequestRepository.getById(handle, refundRequestId)

      if (!refundRequest) {
        throw new RefundRequestNotFoundError(refundRequestId)
      }

      if (refundRequest.status !== "PENDING") {
        throw new InvalidRefundRequestStatusError("PENDING", refundRequest.status)
      }

      await refundRequestRepository.update(handle, refundRequestId, {
        status: "REJECTED",
        handledById: handledByUserId,
      })
    },
  }
}
