import type { DBClient } from "@dotkomonline/db"
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
  create(data: PaymentWrite): Promise<Payment>
  update(paymentId: PaymentId, data: Partial<PaymentWrite>): Promise<Payment>
  updateByPaymentProviderSessionId(
    paymentProviderSessionId: PaymentProviderSessionId,
    data: Partial<PaymentWrite>
  ): Promise<Payment>
  getById(paymentId: PaymentId): Promise<Payment | null>
  getByPaymentProviderOrderId(paymentProviderOrderId: PaymentProviderOrderId): Promise<Payment | null>
  getAll(page: Pageable): Promise<Payment[]>
  getAllByUserId(userId: UserId, page: Pageable): Promise<Payment[]>
  getAllByProductId(productId: ProductId, page: Pageable): Promise<Payment[]>
  delete(paymentId: PaymentId): Promise<void>
  deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void>
}

export class PaymentRepositoryImpl implements PaymentRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async create(data: PaymentWrite) {
    return await this.db.payment.create({ data })
  }

  public async update(paymentId: PaymentId, data: Partial<PaymentWrite>) {
    return await this.db.payment.update({ where: { id: paymentId }, data })
  }

  public async updateByPaymentProviderSessionId(
    paymentProviderSessionId: PaymentProviderSessionId,
    data: Partial<PaymentWrite>
  ) {
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

  public async getById(paymentId: PaymentId) {
    return await this.db.payment.findUnique({ where: { id: paymentId } })
  }

  public async getByPaymentProviderOrderId(paymentProviderOrderId: PaymentProviderOrderId) {
    return await this.db.payment.findFirst({ where: { paymentProviderOrderId } })
  }

  public async getAll(page: Pageable) {
    return await this.db.payment.findMany({ ...pageQuery(page) })
  }

  public async getAllByUserId(userId: UserId, page: Pageable) {
    return this.db.payment.findMany({ where: { userId }, ...pageQuery(page) })
  }

  public async getAllByProductId(productId: ProductId, page: Pageable) {
    return this.db.payment.findMany({ where: { productId }, ...pageQuery(page) })
  }

  public async delete(paymentId: PaymentId) {
    await this.db.payment.delete({ where: { id: paymentId } })
  }

  public async deleteByPaymentProviderSessionId(paymentProviderSessionId: PaymentProviderSessionId) {
    await this.db.payment.deleteMany({ where: { paymentProviderSessionId } })
  }
}
