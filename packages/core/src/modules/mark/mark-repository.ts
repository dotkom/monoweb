import { type Database } from "@dotkomonline/db";
import { type Mark, MarkSchema, type MarkWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

import { type Cursor, paginateQuery } from "./../../utils/db-utils";

export const mapToMark = (payload: Selectable<Database["mark"]>): Mark => MarkSchema.parse(payload);

export interface MarkRepository {
    create(markInsert: MarkWrite): Promise<Mark | undefined>;
    delete(id: Mark["id"]): Promise<Mark | undefined>;
    getAll(take: number, cursor?: Cursor): Promise<Array<Mark>>;
    getById(id: Mark["id"]): Promise<Mark | undefined>;
    update(id: Mark["id"], markUpdate: MarkWrite): Promise<Mark | undefined>;
}

export class MarkRepositoryImpl implements MarkRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(markInsert: MarkWrite): Promise<Mark | undefined> {
        const mark = await this.db
            .insertInto("mark")
            .values({ ...markInsert })
            .returningAll()
            .executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }

    public async delete(id: Mark["id"]): Promise<Mark | undefined> {
        const mark = await this.db.deleteFrom("mark").where("id", "=", id).returningAll().executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }

    public async getAll(take: number, cursor?: Cursor): Promise<Array<Mark>> {
        let query = this.db.selectFrom("mark").selectAll().limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const marks = await query.execute();

        return marks.map(mapToMark);
    }

    public async getById(id: Mark["id"]): Promise<Mark | undefined> {
        const mark = await this.db.selectFrom("mark").selectAll().where("id", "=", id).executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }

    public async update(id: Mark["id"], markUpdate: MarkWrite): Promise<Mark | undefined> {
        const mark = await this.db
            .updateTable("mark")
            .set({ ...markUpdate, updatedAt: new Date() })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();

        return mark ? mapToMark(mark) : undefined;
    }
}
