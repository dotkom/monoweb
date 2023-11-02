import { type Kysely, type Selectable } from "kysely"
import {
  type PaymentId,
  type RefundRequest,
  type RefundRequestId,
  RefundRequestSchema,
  type RefundRequestWrite,
} from "@dotkomonline/types"
import { type Database } from "@dotkomonline/db"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

const mapToRefundRequest = (data: Selectable<Database["refundRequest"]>) => RefundRequestSchema.parse(data)

export interface RefundRequestRepository {
  create(data: RefundRequestWrite): Promise<RefundRequest>
  update(id: RefundRequestId, data: Partial<RefundRequestWrite>): Promise<RefundRequest>
  delete(id: RefundRequestId): Promise<void>
  getById(id: RefundRequestId): Promise<RefundRequest | undefined>
  getByPaymentId(paymentId: PaymentId): Promise<RefundRequest | undefined>
  getAll(take: number, cursor?: Cursor): Promise<RefundRequest[]>
}

export class RefundRequestRepositoryImpl implements RefundRequestRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: RefundRequestWrite): Promise<RefundRequest> {
    const refundRequest = await this.db
      .insertInto("refundRequest")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToRefundRequest(refundRequest)
  }

  async update(id: RefundRequestId, data: RefundRequestWrite): Promise<RefundRequest> {
    const refundRequest = await this.db
      .updateTable("refundRequest")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToRefundRequest(refundRequest)
  }

  async delete(id: RefundRequestId): Promise<void> {
    await this.db.deleteFrom("refundRequest").where("id", "=", id).execute()
  }

  async getById(id: RefundRequestId): Promise<RefundRequest | undefined> {
    const refundRequest = await this.db.selectFrom("refundRequest").selectAll().where("id", "=", id).executeTakeFirst()

    return refundRequest ? mapToRefundRequest(refundRequest) : undefined
  }

  async getByPaymentId(paymentId: PaymentId): Promise<RefundRequest | undefined> {
    const refundRequest = await this.db
      .selectFrom("refundRequest")
      .selectAll()
      .where("paymentId", "=", paymentId)
      .executeTakeFirst()

    return refundRequest ? mapToRefundRequest(refundRequest) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<RefundRequest[]> {
    const query = orderedQuery(this.db.selectFrom("refundRequest").selectAll().limit(take), cursor)
    const refundRequests = await query.execute()
    return refundRequests.map(mapToRefundRequest)
  }
}
