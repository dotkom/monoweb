import type { DBHandle } from "@dotkomonline/db"
import {
  type Payment,
  type PaymentId,
  type PaymentProviderOrderId,
  type PaymentProviderSessionId,
  PaymentSchema,
  type PaymentWrite,
  type ProductId,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface PaymentRepository {
  create(handle: DBHandle, data: PaymentWrite): Promise<Payment>
  update(handle: DBHandle, paymentId: PaymentId, data: Partial<PaymentWrite>): Promise<Payment>
  updateByPaymentProviderSessionId(
    handle: DBHandle,
    paymentProviderSessionId: PaymentProviderSessionId,
    data: Partial<PaymentWrite>
  ): Promise<Payment>
  getById(handle: DBHandle, paymentId: PaymentId): Promise<Payment | null>
  getByPaymentProviderOrderId(handle: DBHandle, paymentProviderOrderId: PaymentProviderOrderId): Promise<Payment | null>
  getAll(handle: DBHandle, page: Pageable): Promise<Payment[]>
  getAllByUserId(handle: DBHandle, userId: UserId, page: Pageable): Promise<Payment[]>
  getAllByProductId(handle: DBHandle, productId: ProductId, page: Pageable): Promise<Payment[]>
  delete(handle: DBHandle, paymentId: PaymentId): Promise<void>
  deleteByPaymentProviderSessionId(handle: DBHandle, paymentProviderSessionId: string): Promise<void>
}

export function getPaymentRepository(): PaymentRepository {
  return {
    async create(handle, data) {
      const payment = await handle.payment.create({ data })
      return parseOrReport(PaymentSchema, payment)
    },
    async update(handle, paymentId, data) {
      const payment = await handle.payment.update({ where: { id: paymentId }, data })
      return parseOrReport(PaymentSchema, payment)
    },
    async updateByPaymentProviderSessionId(handle, paymentProviderSessionId, data) {
      const payments = await handle.payment.updateManyAndReturn({
        data,
        where: {
          paymentProviderSessionId,
        },
      })
      const payment = payments.at(0)
      if (payment === undefined) {
        throw new Error("Expected one payment from specific payment provider session id")
      }
      return parseOrReport(PaymentSchema, payment)
    },
    async getById(handle, paymentId) {
      const payment = await handle.payment.findUnique({ where: { id: paymentId } })
      return payment ? parseOrReport(PaymentSchema, payment) : null
    },
    async getByPaymentProviderOrderId(handle, paymentProviderOrderId) {
      const payment = await handle.payment.findFirst({ where: { paymentProviderOrderId } })
      return payment ? parseOrReport(PaymentSchema, payment) : null
    },
    async getAll(handle, page) {
      const payments = await handle.payment.findMany({ ...pageQuery(page) })
      return payments.map((payment) => parseOrReport(PaymentSchema, payment))
    },
    async getAllByUserId(handle, userId, page) {
      const payments = await handle.payment.findMany({ where: { userId }, ...pageQuery(page) })
      return payments.map((payment) => parseOrReport(PaymentSchema, payment))
    },
    async getAllByProductId(handle, productId, page) {
      const payments = await handle.payment.findMany({ where: { productId }, ...pageQuery(page) })
      return payments.map((payment) => parseOrReport(PaymentSchema, payment))
    },
    async delete(handle, paymentId) {
      await handle.payment.delete({ where: { id: paymentId } })
    },
    async deleteByPaymentProviderSessionId(handle, paymentProviderSessionId) {
      await handle.payment.deleteMany({ where: { paymentProviderSessionId } })
    },
  }
}
