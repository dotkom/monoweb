import type { DBClient } from "@dotkomonline/db"
import type { Payment, PaymentId, PaymentWrite, ProductId, UserId } from "@dotkomonline/types"
import { Pageable, pageQuery } from "../../query"

export interface PaymentRepository {
  create(data: PaymentWrite): Promise<Payment | null>
  update(id: PaymentId, data: Partial<PaymentWrite>): Promise<Payment>
  updateByPaymentProviderSessionId(paymentProviderSessionId: string, data: Partial<PaymentWrite>): Promise<Payment>
  getById(id: PaymentId): Promise<Payment | null>
  getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | null>
  getAll(page: Pageable): Promise<Payment[]>
  getAllByUserId(id: UserId, page: Pageable): Promise<Payment[]>
  getAllByProductId(id: ProductId, page: Pageable): Promise<Payment[]>
  delete(id: PaymentId): Promise<void>
  deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void>
}

export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly db: DBClient) {}

  async create(data: PaymentWrite): Promise<Payment | null> {
    return await this.db.payment.create({ data })
  }

  async update(id: PaymentId, data: Partial<Omit<PaymentWrite, "id">>): Promise<Payment> {
    return await this.db.payment.update({ where: { id }, data })
  }

  async updateByPaymentProviderSessionId(
    paymentProviderSessionId: string,
    data: Partial<Omit<PaymentWrite, "id">>
  ): Promise<Payment> {
    const payments = await this.db.payment.updateManyAndReturn({
      data,
      where: {
        paymentProviderSessionId,
      },
    })

    if (payments.length !== 1) {
      throw new Error("Expected one payment from specific payment provider session id")
    }

    return payments[0]
  }

  async getById(id: PaymentId): Promise<Payment | null> {
    return await this.db.payment.findUnique({ where: { id } })
  }

  async getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | null> {
    return await this.db.payment.findFirst({ where: { paymentProviderOrderId } })
  }

  async getAll(page: Pageable): Promise<Payment[]> {
    return await this.db.payment.findMany({ ...pageQuery(page) })
  }

  async getAllByUserId(userId: UserId, page: Pageable): Promise<Payment[]> {
    return this.db.payment.findMany({ where: { userId }, ...pageQuery(page) })
  }

  async getAllByProductId(productId: ProductId, page: Pageable): Promise<Payment[]> {
    return this.db.payment.findMany({ where: { productId }, ...pageQuery(page) })
  }

  async delete(id: PaymentId): Promise<void> {
    await this.db.payment.delete({ where: { id } })
  }

  async deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void> {
    await this.db.payment.deleteMany({ where: { paymentProviderSessionId } })
  }
}
