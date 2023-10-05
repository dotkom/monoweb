import { type Cursor, paginateQuery } from "./../../utils/db-utils";
import { type Kysely, type Selectable } from "kysely";
import { type Mark, MarkSchema, type MarkWrite } from "@dotkomonline/types";

import { type Database } from "@dotkomonline/db";

export const mapToMark = (payload: Selectable<Database["mark"]>): Mark => MarkSchema.parse(payload);

export interface MarkRepository {
    getById(id: Mark["id"]): Promise<Mark | undefined>;
    getAll(take: number, cursor?: Cursor): Promise<Array<Mark>>;
    create(markInsert: MarkWrite): Promise<Mark | undefined>;
    update(id: Mark["id"], markUpdate: MarkWrite): Promise<Mark | undefined>;
    delete(id: Mark["id"]): Promise<Mark | undefined>;
}

export class MarkRepositoryImpl implements MarkRepository {
    constructor(private readonly db: Kysely<Database>) {}

    async getById(id: Mark["id"]): Promise<Mark | undefined> {
        const mark = await this.db.selectFrom("mark").selectAll().where("id", "=", id).executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }

    async getAll(take: number, cursor?: Cursor): Promise<Array<Mark>> {
        let query = this.db.selectFrom("mark").selectAll().limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const marks = await query.execute();

        return marks.map(mapToMark);
    }

    async create(markInsert: MarkWrite): Promise<Mark | undefined> {
        const mark = await this.db
            .insertInto("mark")
            .values({ ...markInsert })
            .returningAll()
            .executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }

    async update(id: Mark["id"], markUpdate: MarkWrite): Promise<Mark | undefined> {
        const mark = await this.db
            .updateTable("mark")
            .set({ ...markUpdate, updatedAt: new Date() })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }

    async delete(id: Mark["id"]): Promise<Mark | undefined> {
        const mark = await this.db.deleteFrom("mark").where("id", "=", id).returningAll().executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }
}
