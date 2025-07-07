import type { DBHandle } from "@dotkomonline/db"
import type {
  Payment,
  PaymentId,
  PaymentProviderOrderId,
  PaymentProviderSessionId,
  PaymentWrite,
  ProductId,
  UserId,
} from "@dotkomonline/types"
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
      return await handle.payment.create({ data })
    },
    async update(handle, paymentId, data) {
      return await handle.payment.update({ where: { id: paymentId }, data })
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
      return payment
    },
    async getById(handle, paymentId) {
      return await handle.payment.findUnique({ where: { id: paymentId } })
    },
    async getByPaymentProviderOrderId(handle, paymentProviderOrderId) {
      return await handle.payment.findFirst({ where: { paymentProviderOrderId } })
    },
    async getAll(handle, page) {
      return await handle.payment.findMany({ ...pageQuery(page) })
    },
    async getAllByUserId(handle, userId, page) {
      return handle.payment.findMany({ where: { userId }, ...pageQuery(page) })
    },
    async getAllByProductId(handle, productId, page) {
      return handle.payment.findMany({ where: { productId }, ...pageQuery(page) })
    },
    async delete(handle, paymentId) {
      await handle.payment.delete({ where: { id: paymentId } })
    },
    async deleteByPaymentProviderSessionId(handle, paymentProviderSessionId) {
      await handle.payment.deleteMany({ where: { paymentProviderSessionId } })
    },
  }
}
