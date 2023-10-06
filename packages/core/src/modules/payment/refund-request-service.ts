import { type Payment, type RefundRequest, type RefundRequestWrite, type User } from "@dotkomonline/types";

import { type Cursor } from "../../utils/db-utils";
import { type PaymentRepository } from "./payment-repository";
import { type PaymentService } from "./payment-service";
import { type ProductRepository } from "./product-repository";
import { type RefundRequestRepository } from "./refund-request-repository";

export interface RefundRequestService {
  approveRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void>;
  createRefundRequest(paymentId: Payment["id"], userId: User["id"], reason: string): Promise<RefundRequest>;
  deleteRefundRequest(id: RefundRequest["id"]): Promise<void>;
  getRefundRequestById(id: RefundRequest["id"]): Promise<RefundRequest | undefined>;
  getRefundRequests(take: number, cursor?: Cursor): Promise<Array<RefundRequest>>;
  rejectRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void>;
  updateRefundRequest(id: RefundRequest["id"], data: Partial<RefundRequestWrite>): Promise<RefundRequest>;
}

export class RefundRequestServiceImpl implements RefundRequestService {
  public constructor(
    private readonly refundRequestRepository: RefundRequestRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentService: PaymentService
  ) {}

  public async approveRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void> {
    const refundRequest = await this.refundRequestRepository.getById(id);

    if (!refundRequest) {
      throw new Error("Refund request not found");
    }

    if (refundRequest.status === "APPROVED") {
      throw new Error("Refund request already approved");
    }

    const updatedRefundRequest = await this.refundRequestRepository.update(id, {
      handledBy,
      status: "APPROVED",
    });

    // Automatically refund the payment. We already know the request was approved, so no need to check.
    await this.paymentService.refundPaymentById(updatedRefundRequest.paymentId, false);
  }

  public async createRefundRequest(
    paymentId: Payment["id"],
    userId: User["id"],
    reason: string
  ): Promise<RefundRequest> {
    const payment = await this.paymentRepository.getById(paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    const product = await this.productRepository.getById(payment.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isRefundable) {
      throw new Error("Payment is not refundable");
    }

    if (!product.refundRequiresApproval) {
      throw new Error("Product does not require approval");
    }

    return this.refundRequestRepository.create({
      handledBy: null,
      paymentId,
      reason,
      status: "PENDING",
      userId,
    });
  }

  public async deleteRefundRequest(id: RefundRequest["id"]): Promise<void> {
    return this.refundRequestRepository.delete(id);
  }

  public async getRefundRequestById(id: RefundRequest["id"]): Promise<RefundRequest | undefined> {
    return this.refundRequestRepository.getById(id);
  }

  public async getRefundRequests(take: number, cursor?: Cursor): Promise<Array<RefundRequest>> {
    return this.refundRequestRepository.getAll(take, cursor);
  }

  public async rejectRefundRequest(id: RefundRequest["id"], handledBy: User["id"]): Promise<void> {
    const refundRequest = await this.refundRequestRepository.getById(id);

    if (!refundRequest) {
      throw new Error("Refund request not found");
    }

    if (refundRequest.status === "REJECTED") {
      throw new Error("Refund request already rejected");
    } else if (refundRequest.status === "APPROVED") {
      throw new Error("Refund request already approved");
    }

    await this.refundRequestRepository.update(id, {
      handledBy,
      status: "REJECTED",
    });
  }

  public async updateRefundRequest(id: RefundRequest["id"], data: Partial<RefundRequestWrite>): Promise<RefundRequest> {
    return this.refundRequestRepository.update(id, data);
  }
}
