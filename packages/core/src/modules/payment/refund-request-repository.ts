import type { DBHandle } from "@dotkomonline/db"
import type { PaymentId, RefundRequest, RefundRequestId, RefundRequestWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface RefundRequestRepository {
  create(handle: DBHandle, data: RefundRequestWrite): Promise<RefundRequest>
  update(handle: DBHandle, refundRequestId: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  delete(handle: DBHandle, refundRequestId: RefundRequestId): Promise<void>
  getById(handle: DBHandle, refundRequestId: RefundRequestId): Promise<RefundRequest | null>
  getByPaymentId(handle: DBHandle, paymentId: PaymentId): Promise<RefundRequest | null>
  getAll(handle: DBHandle, page: Pageable): Promise<RefundRequest[]>
}

export function getRefundRequestRepository(): RefundRequestRepository {
  return {
    async create(handle, data) {
      return await handle.refundRequest.create({ data })
    },
    async update(handle, refundRequestId, data) {
      return await handle.refundRequest.update({ where: { id: refundRequestId }, data })
    },
    async delete(handle, refundRequestId) {
      await handle.refundRequest.delete({ where: { id: refundRequestId } })
    },
    async getById(handle, refundRequestId) {
      return await handle.refundRequest.findUnique({ where: { id: refundRequestId } })
    },
    async getByPaymentId(handle, paymentId) {
      return await handle.refundRequest.findUnique({ where: { paymentId } })
    },
    async getAll(handle, page) {
      return await handle.refundRequest.findMany({ ...pageQuery(page) })
    },
  }
}
