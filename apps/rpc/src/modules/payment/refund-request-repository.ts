import type { DBHandle } from "@dotkomonline/db"
import {
  type PaymentId,
  type RefundRequest,
  type RefundRequestId,
  RefundRequestSchema,
  type RefundRequestWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
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
      const request = await handle.refundRequest.create({ data })
      return parseOrReport(RefundRequestSchema, request)
    },
    async update(handle, refundRequestId, data) {
      const request = await handle.refundRequest.update({ where: { id: refundRequestId }, data })
      return parseOrReport(RefundRequestSchema, request)
    },
    async delete(handle, refundRequestId) {
      await handle.refundRequest.delete({ where: { id: refundRequestId } })
    },
    async getById(handle, refundRequestId) {
      const request = await handle.refundRequest.findUnique({ where: { id: refundRequestId } })
      return request ? parseOrReport(RefundRequestSchema, request) : null
    },
    async getByPaymentId(handle, paymentId) {
      const request = await handle.refundRequest.findUnique({ where: { paymentId } })
      return request ? parseOrReport(RefundRequestSchema, request) : null
    },
    async getAll(handle, page) {
      const requests = await handle.refundRequest.findMany({ ...pageQuery(page) })
      return requests.map((request) => parseOrReport(RefundRequestSchema, request))
    },
  }
}
