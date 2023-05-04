import { RefundRequest, RefundRequestWrite, User } from "@dotkomonline/types"

import { Cursor } from "../../utils/db-utils"
import { PaymentService } from "./payment-service"
import { RefundRequestRepository } from "./refund-request-repository"

export interface RefundRequestService {
  createRefundRequest(data: RefundRequestWrite): Promise<RefundRequest>
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
    private readonly paymentService: PaymentService
  ) {}

  async createRefundRequest(data: RefundRequestWrite): Promise<RefundRequest> {
    return this.refundRequestRepository.create(data)
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
    const refundRequest = await this.refundRequestRepository.update(id, {
      status: "APPROVED",
      handledBy,
    })

    // Automatically refund the payment. We already know the request was approved, so no need to check.
    await this.paymentService.refundStripePaymentById(refundRequest.paymentId, false)
  }

  async rejectRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void> {
    await this.refundRequestRepository.update(id, {
      status: "REJECTED",
      handledBy,
    })
  }
}
