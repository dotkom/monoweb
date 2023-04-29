import { Cursor, paginateQuery } from "./../../utils/db-utils"
import { Kysely, Selectable } from "kysely"
import { Transaction, TransactionSchema, TransactionWrite } from "@dotkomonline/types"

import { Database } from "@dotkomonline/db"

const mapToTransaction = (data: Selectable<Database["transaction"]>) => TransactionSchema.parse(data)

export interface TransactionRepository {
  create(data: TransactionWrite): Promise<Transaction | undefined>
  update(id: Transaction["id"], data: Omit<TransactionWrite, "id">): Promise<Transaction>
  updateByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    data: Partial<Omit<TransactionWrite, "id">>
  ): Promise<Transaction>
  getById(id: string): Promise<Transaction | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Transaction[]>
  getAllByUserId(id: string, take: number, cursor?: Cursor): Promise<Transaction[]>
  getAllByProductId(id: string, take: number, cursor?: Cursor): Promise<Transaction[]>
  delete(id: Transaction["id"]): Promise<void>
  deleteByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<void>
}

export class TransactionRepositoryImpl implements TransactionRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: TransactionWrite): Promise<Transaction | undefined> {
    const transaction = await this.db.insertInto("transaction").values(data).returningAll().executeTakeFirstOrThrow()

    return mapToTransaction(transaction)
  }

  async update(id: Transaction["id"], data: Omit<TransactionWrite, "id">): Promise<Transaction> {
    const transaction = await this.db
      .updateTable("transaction")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToTransaction(transaction)
  }

  async updateByPaymentProviderOrderId(
    paymentProviderOrderId: string,
    data: Partial<Omit<TransactionWrite, "id">>
  ): Promise<Transaction> {
    const transaction = await this.db
      .updateTable("transaction")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("paymentProviderOrderId", "=", paymentProviderOrderId)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToTransaction(transaction)
  }

  async getById(id: string): Promise<Transaction | undefined> {
    const transaction = await this.db.selectFrom("transaction").selectAll().where("id", "=", id).executeTakeFirst()

    return transaction ? mapToTransaction(transaction) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Transaction[]> {
    let query = this.db.selectFrom("transaction").selectAll().limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }

    const transactions = await query.execute()
    return transactions.map(mapToTransaction)
  }

  async getAllByUserId(id: string, take: number, cursor?: Cursor): Promise<Transaction[]> {
    let query = this.db.selectFrom("transaction").selectAll().where("userId", "=", id).limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }

    const transactions = await query.execute()
    return transactions.map(mapToTransaction)
  }

  async getAllByProductId(id: string, take: number, cursor?: Cursor): Promise<Transaction[]> {
    let query = this.db.selectFrom("transaction").selectAll().where("productId", "=", id).limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }

    const transactions = await query.execute()
    return transactions.map(mapToTransaction)
  }

  async delete(id: Transaction["id"]): Promise<void> {
    await this.db.deleteFrom("transaction").where("id", "=", id).execute()
  }

  async deleteByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<void> {
    await this.db.deleteFrom("transaction").where("paymentProviderOrderId", "=", paymentProviderOrderId).execute()
  }
}
