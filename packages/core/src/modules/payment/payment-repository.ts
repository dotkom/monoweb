import { type Database } from "@dotkomonline/db";
import { type Payment, PaymentSchema, type PaymentWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

import { type Cursor, paginateQuery } from "../../utils/db-utils";

const mapToPayment = (data: Selectable<Database["payment"]>) => PaymentSchema.parse(data);

export interface PaymentRepository {
  create(data: PaymentWrite): Promise<Payment | undefined>;
  delete(id: Payment["id"]): Promise<void>;
  deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void>;
  getAll(take: number, cursor?: Cursor): Promise<Array<Payment>>;
  getAllByProductId(id: string, take: number, cursor?: Cursor): Promise<Array<Payment>>;
  getAllByUserId(id: string, take: number, cursor?: Cursor): Promise<Array<Payment>>;
  getById(id: string): Promise<Payment | undefined>;
  getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | undefined>;
  update(id: Payment["id"], data: Partial<Omit<PaymentWrite, "id">>): Promise<Payment>;
  updateByPaymentProviderSessionId(
    paymentProviderSessionId: string,
    data: Partial<Omit<PaymentWrite, "id">>
  ): Promise<Payment>;
}

export class PaymentRepositoryImpl implements PaymentRepository {
  public constructor(private readonly db: Kysely<Database>) {}

  public async create(data: PaymentWrite): Promise<Payment | undefined> {
    const payment = await this.db.insertInto("payment").values(data).returningAll().executeTakeFirstOrThrow();

    return mapToPayment(payment);
  }

  public async delete(id: Payment["id"]): Promise<void> {
    await this.db.deleteFrom("payment").where("id", "=", id).execute();
  }

  public async deleteByPaymentProviderSessionId(paymentProviderSessionId: string): Promise<void> {
    await this.db.deleteFrom("payment").where("paymentProviderSessionId", "=", paymentProviderSessionId).execute();
  }

  public async getAll(take: number, cursor?: Cursor): Promise<Array<Payment>> {
    let query = this.db.selectFrom("payment").selectAll().limit(take);

    if (cursor) {
      query = paginateQuery(query, cursor);
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
    }

    const payments = await query.execute();

    return payments.map(mapToPayment);
  }

  public async getAllByProductId(id: string, take: number, cursor?: Cursor): Promise<Array<Payment>> {
    let query = this.db.selectFrom("payment").selectAll().where("productId", "=", id).limit(take);

    if (cursor) {
      query = paginateQuery(query, cursor);
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
    }

    const payments = await query.execute();

    return payments.map(mapToPayment);
  }

  public async getAllByUserId(id: string, take: number, cursor?: Cursor): Promise<Array<Payment>> {
    let query = this.db.selectFrom("payment").selectAll().where("userId", "=", id).limit(take);

    if (cursor) {
      query = paginateQuery(query, cursor);
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
    }

    const payments = await query.execute();

    return payments.map(mapToPayment);
  }

  public async getById(id: string): Promise<Payment | undefined> {
    const payment = await this.db.selectFrom("payment").selectAll().where("id", "=", id).executeTakeFirst();

    return payment ? mapToPayment(payment) : undefined;
  }

  public async getByPaymentProviderOrderId(paymentProviderOrderId: string): Promise<Payment | undefined> {
    const payment = await this.db
      .selectFrom("payment")
      .selectAll()
      .where("paymentProviderOrderId", "=", paymentProviderOrderId)
      .executeTakeFirst();

    return payment ? mapToPayment(payment) : undefined;
  }

  public async update(id: Payment["id"], data: Partial<Omit<PaymentWrite, "id">>): Promise<Payment> {
    const payment = await this.db
      .updateTable("payment")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return mapToPayment(payment);
  }

  public async updateByPaymentProviderSessionId(
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
      .executeTakeFirstOrThrow();

    return mapToPayment(payment);
  }
}
