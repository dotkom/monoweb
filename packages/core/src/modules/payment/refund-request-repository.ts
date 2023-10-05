import { type Cursor, paginateQuery } from "../../utils/db-utils";
import { type Kysely, type Selectable } from "kysely";
import { type Payment, type RefundRequest, RefundRequestSchema, type RefundRequestWrite } from "@dotkomonline/types";

import { type Database } from "@dotkomonline/db";

const mapToRefundRequest = (data: Selectable<Database["refundRequest"]>) => RefundRequestSchema.parse(data);

export interface RefundRequestRepository {
    create(data: RefundRequestWrite): Promise<RefundRequest>;
    update(id: RefundRequest["id"], data: Partial<RefundRequestWrite>): Promise<RefundRequest>;
    delete(id: RefundRequest["id"]): Promise<void>;
    getById(id: RefundRequest["id"]): Promise<RefundRequest | undefined>;
    getByPaymentId(paymentId: Payment["id"]): Promise<RefundRequest | undefined>;
    getAll(take: number, cursor?: Cursor): Promise<Array<RefundRequest>>;
}

export class RefundRequestRepositoryImpl implements RefundRequestRepository {
    constructor(private readonly db: Kysely<Database>) {}

    async create(data: RefundRequestWrite): Promise<RefundRequest> {
        const refundRequest = await this.db
            .insertInto("refundRequest")
            .values(data)
            .returningAll()
            .executeTakeFirstOrThrow();

        return mapToRefundRequest(refundRequest);
    }

    async update(id: RefundRequest["id"], data: RefundRequestWrite): Promise<RefundRequest> {
        const refundRequest = await this.db
            .updateTable("refundRequest")
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow();

        return mapToRefundRequest(refundRequest);
    }

    async delete(id: RefundRequest["id"]): Promise<void> {
        await this.db.deleteFrom("refundRequest").where("id", "=", id).execute();
    }

    async getById(id: RefundRequest["id"]): Promise<RefundRequest | undefined> {
        const refundRequest = await this.db
            .selectFrom("refundRequest")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();

        return refundRequest ? mapToRefundRequest(refundRequest) : undefined;
    }

    async getByPaymentId(paymentId: Payment["id"]): Promise<RefundRequest | undefined> {
        const refundRequest = await this.db
            .selectFrom("refundRequest")
            .selectAll()
            .where("paymentId", "=", paymentId)
            .executeTakeFirst();

        return refundRequest ? mapToRefundRequest(refundRequest) : undefined;
    }

    async getAll(take: number, cursor?: Cursor): Promise<Array<RefundRequest>> {
        let query = this.db.selectFrom("refundRequest").selectAll().limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const refundRequests = await query.execute();

        return refundRequests.map(mapToRefundRequest);
    }
}
