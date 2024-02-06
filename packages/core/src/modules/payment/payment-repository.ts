import { type Kysely, type Selectable } from "kysely"
import {
  type Payment,
  type PaymentId,
  PaymentSchema,
  type PaymentWrite,
  type ProductId,
  type UserId,
} from "@dotkomonline/types"
import { type Database } from "@dotkomonline/db"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

const mapToPayment = (data: Selectable<Database["payment"]>) => PaymentSchema.parse(data)

export interface PaymentRepository {
  create(data: PaymentWrite): Promise<Payment | undefined>
  update(id: PaymentId, data: Partial<PaymentWrite>): Promise<Payment>
  updateByPaymentProviderSessionId(paymentProviderSessionId: string, data: Partial<PaymentWrite>): Promise<Payment>
  getById(id: PaymentId): Promise<Payment | undefined>
  getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Payment[]>
  getAllByUserId(id: UserId, take: number, cursor?: Cursor): Promise<Payment[]>
  getAllByProductId(id: ProductId, take: number, cursor?: Cursor): Promise<Payment[]>
  delete(id: PaymentId): Promise<void>
  deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void>
}

export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: PaymentWrite): Promise<Payment | undefined> {
    const payment = await this.db.insertInto("payment").values(data).returningAll().executeTakeFirstOrThrow()

    return mapToPayment(payment)
  }

  async update(id: PaymentId, data: Partial<Omit<PaymentWrite, "id">>): Promise<Payment> {
    const payment = await this.db
      .updateTable("payment")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToPayment(payment)
  }

  async updateByPaymentProviderSessionId(
    paymentProviderSessionId: string,
    data: Partial<Omit<PaymentWrite, "id">>
  ): Promise<Payment> {
    const payment = await this.db
      .updateTable("payment")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("paymentProviderSessionId", "=", paymentProviderSessionId)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToPayment(payment)
  }

  async getById(id: PaymentId): Promise<Payment | undefined> {
    const payment = await this.db.selectFrom("payment").selectAll().where("id", "=", id).executeTakeFirst()

    return payment ? mapToPayment(payment) : undefined
  }

  async getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | undefined> {
    const payment = await this.db
      .selectFrom("payment")
      .selectAll()
      .where("paymentProviderOrderId", "=", paymentProviderOrderId)
      .executeTakeFirst()

    return payment ? mapToPayment(payment) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Payment[]> {
    const query = orderedQuery(this.db.selectFrom("payment").selectAll().limit(take), cursor)
    const payments = await query.execute()
    return payments.map(mapToPayment)
  }

  async getAllByUserId(id: UserId, take: number, cursor?: Cursor): Promise<Payment[]> {
    const query = orderedQuery(this.db.selectFrom("payment").selectAll().where("userId", "=", id).limit(take), cursor)
    const payments = await query.execute()
    return payments.map(mapToPayment)
  }

  async getAllByProductId(id: ProductId, take: number, cursor?: Cursor): Promise<Payment[]> {
    const query = orderedQuery(
      this.db.selectFrom("payment").selectAll().where("productId", "=", id).limit(take),
      cursor
    )
    const payments = await query.execute()
    return payments.map(mapToPayment)
  }

  async delete(id: PaymentId): Promise<void> {
    await this.db.deleteFrom("payment").where("id", "=", id).execute()
  }

  async deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void> {
    await this.db.deleteFrom("payment").where("paymentProviderSessionId", "=", paymentProviderSessionId).execute()
  }
}
