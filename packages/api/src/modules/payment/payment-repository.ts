import { Cursor, paginateQuery } from "../../utils/db-utils"
import { Kysely, Selectable } from "kysely"
import { Payment, PaymentSchema, PaymentWrite } from "@dotkomonline/types"

import { Database } from "@dotkomonline/db"

const mapToPayment = (data: Selectable<Database["payment"]>) => PaymentSchema.parse(data)

export interface PaymentRepository {
  create(data: PaymentWrite): Promise<Payment | undefined>
  update(id: Payment["id"], data: Omit<PaymentWrite, "id">): Promise<Payment>
  updateByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    data: Partial<Omit<PaymentWrite, "id">>
  ): Promise<Payment>
  getById(id: string): Promise<Payment | undefined>
  getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Payment[]>
  getAllByUserId(id: string, take: number, cursor?: Cursor): Promise<Payment[]>
  getAllByProductId(id: string, take: number, cursor?: Cursor): Promise<Payment[]>
  delete(id: Payment["id"]): Promise<void>
  deleteByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<void>
}

export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: PaymentWrite): Promise<Payment | undefined> {
    const payment = await this.db.insertInto("payment").values(data).returningAll().executeTakeFirstOrThrow()

    return mapToPayment(payment)
  }

  async update(id: Payment["id"], data: Omit<PaymentWrite, "id">): Promise<Payment> {
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

  async updateByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    data: Partial<Omit<PaymentWrite, "id">>
  ): Promise<Payment> {
    const payment = await this.db
      .updateTable("payment")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("paymentProviderOrderId", "=", paymentProviderOrderId)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToPayment(payment)
  }

  async getById(id: string): Promise<Payment | undefined> {
    const payment = await this.db.selectFrom("payment").selectAll().where("id", "=", id).executeTakeFirst()

    return payment ? mapToPayment(payment) : undefined
  }

  async getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | undefined> {
    const Payment = await this.db
      .selectFrom("payment")
      .selectAll()
      .where("paymentProviderOrderId", "=", paymentProviderOrderId)
      .executeTakeFirst()

    return Payment ? mapToPayment(Payment) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Payment[]> {
    let query = this.db.selectFrom("payment").selectAll().limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }

    const payments = await query.execute()
    return payments.map(mapToPayment)
  }

  async getAllByUserId(id: string, take: number, cursor?: Cursor): Promise<Payment[]> {
    let query = this.db.selectFrom("payment").selectAll().where("userId", "=", id).limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }

    const payments = await query.execute()
    return payments.map(mapToPayment)
  }

  async getAllByProductId(id: string, take: number, cursor?: Cursor): Promise<Payment[]> {
    let query = this.db.selectFrom("payment").selectAll().where("productId", "=", id).limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }

    const payments = await query.execute()
    return payments.map(mapToPayment)
  }

  async delete(id: Payment["id"]): Promise<void> {
    await this.db.deleteFrom("payment").where("id", "=", id).execute()
  }

  async deleteByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<void> {
    await this.db.deleteFrom("payment").where("paymentProviderOrderId", "=", paymentProviderOrderId).execute()
  }
}
