import type { DBClient } from "@dotkomonline/db"
import type { PaymentId, RefundRequest, RefundRequestId, RefundRequestWrite } from "@dotkomonline/types"
import { Pageable, pageQuery } from "../../query"

export interface RefundRequestRepository {
  create(data: RefundRequestWrite): Promise<RefundRequest>
  update(id: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  delete(id: RefundRequestId): Promise<void>
  getById(id: RefundRequestId): Promise<RefundRequest | null>
  getByPaymentId(paymentId: PaymentId): Promise<RefundRequest | null>
  getAll(page: Pageable): Promise<RefundRequest[]>
}

export class RefundRequestRepositoryImpl implements RefundRequestRepository {
  constructor(private readonly db: DBClient) {}

  async create(data: RefundRequestWrite): Promise<RefundRequest> {
    return await this.db.refundRequest.create({ data })
  }

  async update(id: RefundRequestId, data: RefundRequestWrite): Promise<RefundRequest> {
    return await this.db.refundRequest.update({ where: { id }, data })
  }

  async delete(id: RefundRequestId): Promise<void> {
    await this.db.refundRequest.delete({ where: { id } })
  }

  async getById(id: RefundRequestId): Promise<RefundRequest | null> {
    return await this.db.refundRequest.findUnique({ where: { id } })
  }

  async getByPaymentId(paymentId: PaymentId): Promise<RefundRequest | null> {
    return await this.db.refundRequest.findUnique({ where: { paymentId } })
  }

  async getAll(page: Pageable): Promise<RefundRequest[]> {
    return await this.db.refundRequest.findMany({ ...pageQuery(page) })
  }
}
