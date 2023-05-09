import { Payment, RefundRequest, RefundRequestWrite, User } from "@dotkomonline/types"

import { Cursor } from "../../utils/db-utils"
import { PaymentRepository } from "./payment-repository"
import { PaymentService } from "./payment-service"
import { ProductRepository } from "./product-repository"
import { RefundRequestRepository } from "./refund-request-repository"

export interface RefundRequestService {
  createRefundRequest(paymentId: Payment["id"], userId: User["id"], reason: string): Promise<RefundRequest>
  updateRefundRequest(id: RefundRequest["id"], data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  deleteRefundRequest(id: RefundRequest["id"]): Promise<void>
  getRefundRequestById(id: RefundRequest["id"]): Promise<RefundRequest | undefined>
  getRefundRequests(take: number, cursor?: Cursor): Promise<RefundRequest[]>
  approveRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void>
  rejectRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void>
}

export class RefundRequestServiceImpl implements RefundRequestService {
  constructor(
    private readonly refundRequestRepository: RefundRequestRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentService: PaymentService
  ) {}

  async createRefundRequest(paymentId: Payment["id"], userId: User["id"], reason: string): Promise<RefundRequest> {
    const payment = await this.paymentRepository.getById(paymentId)

    if (!payment) {
      throw new Error("Payment not found")
    }

    const product = await this.productRepository.getById(payment.productId)
    if (!product) {
      throw new Error("Product not found")
    }

    if (!product.isRefundable) {
      throw new Error("Payment is not refundable")
    }

    if (!product.refundRequiresApproval) {
      throw new Error("Product does not require approval")
    }

    return this.refundRequestRepository.create({
      paymentId,
      userId,
      reason,
      status: "PENDING",
      handledBy: null,
    })
  }

  async updateRefundRequest(id: RefundRequest["id"], data: Partial<RefundRequestWrite>): Promise<RefundRequest> {
    return this.refundRequestRepository.update(id, data)
  }

  async deleteRefundRequest(id: RefundRequest["id"]): Promise<void> {
    return this.refundRequestRepository.delete(id)
  }

  async getRefundRequestById(id: RefundRequest["id"]): Promise<RefundRequest | undefined> {
    return this.refundRequestRepository.getById(id)
  }

  async getRefundRequests(take: number, cursor?: Cursor): Promise<RefundRequest[]> {
    return this.refundRequestRepository.getAll(take, cursor)
  }

  async approveRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void> {
    const refundRequest = await this.refundRequestRepository.getById(id)

    if (!refundRequest) {
      throw new Error("Refund request not found")
    }

    if (refundRequest.status === "APPROVED") {
      throw new Error("Refund request already approved")
    }

    const updatedRefundRequest = await this.refundRequestRepository.update(id, {
      status: "APPROVED",
      handledBy,
    })

    // Automatically refund the payment. We already know the request was approved, so no need to check.
    await this.paymentService.refundPaymentById(updatedRefundRequest.paymentId, false)
  }

  async rejectRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void> {
    const refundRequest = await this.refundRequestRepository.getById(id)

    if (!refundRequest) {
      throw new Error("Refund request not found")
    }

    if (refundRequest.status === "REJECTED") {
      throw new Error("Refund request already rejected")
    } else if (refundRequest.status === "APPROVED") {
      throw new Error("Refund request already approved")
    }

    await this.refundRequestRepository.update(id, {
      status: "REJECTED",
      handledBy,
    })
  }
}
