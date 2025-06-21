import type { DBClient } from "@dotkomonline/db"
import type { PaymentId, RefundRequest, RefundRequestId, RefundRequestWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface RefundRequestRepository {
  create(data: RefundRequestWrite): Promise<RefundRequest>
  update(refundRequestId: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  delete(refundRequestId: RefundRequestId): Promise<void>
  getById(refundRequestId: RefundRequestId): Promise<RefundRequest | null>
  getByPaymentId(paymentId: PaymentId): Promise<RefundRequest | null>
  getAll(page: Pageable): Promise<RefundRequest[]>
}

export class RefundRequestRepositoryImpl implements RefundRequestRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async create(data: RefundRequestWrite) {
    return await this.db.refundRequest.create({ data })
  }

  public async update(refundRequestId: RefundRequestId, data: RefundRequestWrite) {
    return await this.db.refundRequest.update({ where: { id: refundRequestId }, data })
  }

  public async delete(refundRequestId: RefundRequestId) {
    await this.db.refundRequest.delete({ where: { id: refundRequestId } })
  }

  public async getById(refundRequestId: RefundRequestId) {
    return await this.db.refundRequest.findUnique({ where: { id: refundRequestId } })
  }

  public async getByPaymentId(paymentId: PaymentId) {
    return await this.db.refundRequest.findUnique({ where: { paymentId } })
  }

  public async getAll(page: Pageable) {
    return await this.db.refundRequest.findMany({ ...pageQuery(page) })
  }
}
